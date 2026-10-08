#!/usr/bin/env node
// vwf's mockup review server.
//
// Run by /vwf:mockups and /vwf:blueprint §6a, one server per platform with
// every flow of it. It serves the mockup tree of one platform at the app's own
// routes, injects a comment overlay into every HTML page as it serves it — the
// files on disk stay free of JS — and records what the reviewer says as YAML
// the skill turns into proposals afterwards.
//
//   node serve.mjs --root <platform dir> [--url-file <path>]
//                  [--peer-file <path>] [--port <n>]
//
// where <platform dir> is docs/scratchpad/<project>/mockups/<platform>. Prints
// exactly one line on stdout once it is listening; everything else goes to
// stderr:
//
//   URL: http://127.0.0.1:<port>/
//
// --url-file writes that URL to a file once the server listens, and removes it
// on Done and on exit; --peer-file names the other server's URL file, read at
// every request, and when it holds a loopback URL the overlay links the same
// route and state there in a new window — so a mockup server and a render
// server, started in any order, link each other. Both paths must resolve under
// <cwd>/docs/scratchpad/.
//
// Renders mode — the built app's images that /vwf:execute copied (renders.mjs):
//
//   node serve.mjs --renders --root <render dir> [--mockups <mockup dir>]
//                  [--url-file <path>] [--peer-file <path>] [--port <n>]
//
// where <render dir> is docs/scratchpad/<project>/renders/<platform> and holds
// __renders/renders.json and __renders/routes.json, both read again at each
// request. Each route is a page built in memory around index.png or
// index--<state>.png of the route's folder — shown only while renders.json
// holds an entry for that screen's code and state whose route is the screen's
// route now and whose file is that image; otherwise the route is the "no
// render yet" page and the image is 404, and the state switcher and the
// /__renders/ list read the same entries. On mobile, watch and auto the page
// sets the mockup of the same route and state (served from --mockups under the
// reserved /__mockups/ prefix, with the same guards; a --mockups tree with no
// valid __mockups/routes.json shows none) in a frame on the left of the image;
// elsewhere it shows the image alone and the --peer-file link. /__renders/ lists every render; nothing else
// under it is served. Comments go to __renders/comments.yaml with the plan of
// the image. The images themselves are served as image/png.
//
// Endpoints — there are no others:
//   GET  <route>[?state=<s>]  the screen at that route, through lib/routes.mjs:
//                             <route>/index.html, a [param] folder for any
//                             value of that segment, index--<s>.html for a
//                             state, or a placeholder page for a code in
//                             routes.json with no file yet; HTML gets the
//                             overlay; any other file under --root is served
//                             with its MIME type
//   GET  /__mockups/          every flow, screen and state of the platform,
//                             built in memory; nothing else under it is served
//   POST /comment             { path, state, selector, text } → one YAML list
//                             item in __mockups/comments.yaml, 204
//   POST /done                appends a done marker, responds 204, exits 0
//
// Only a request target's path and query are read — never resolved against a
// base, so a leading // is a path, not a host; a target that is not a path is
// 400, and anything a handler throws is a 500 the server outlives.
//
// Loopback only: it binds 127.0.0.1, never any other interface, and carries no
// auth and no TLS — it is a review server for one person on one machine. Any
// request whose Host is not 127.0.0.1:<port> or localhost:<port> is 403 (no DNS
// rebinding); a POST must be application/json (415 otherwise) and, when it
// carries an Origin, come from one of those two origins (403 otherwise), so no
// other site can write a comment or end the review. The
// root must resolve under <cwd>/docs/scratchpad/ and hold
// __mockups/routes.json; it refuses to start otherwise. Nothing outside --root
// is ever served: every path is realpath'd and checked to sit under the root,
// so neither `..` nor a symlink escapes it.
//
// Zero dependencies — node: modules only.

import {
  appendFileSync,
  existsSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { constants as osConstants } from "node:os";
import {
  basename,
  dirname,
  extname,
  join,
  resolve,
  sep,
} from "node:path";
import {
  findScreen,
  inRoot,
  isReserved,
  matchPath,
  readRoutes,
  renderFile,
  renderName,
  RENDERS,
  RESERVED,
  sampleRoute,
  splitPath,
  STATE_RE,
  statesIn,
} from "./lib/routes.mjs";

// --- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const out = { port: "0", renders: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      fail(`unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    if (key === "renders") {
      out.renders = true;
      continue;
    }
    if (!["root", "port", "mockups", "url-file", "peer-file"].includes(key)) {
      fail(`unknown flag: ${arg}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      fail(`${arg} needs a value`);
    }
    out[key] = value;
    i += 1;
  }
  if (!out.root) {
    fail("--root is required");
  }
  if (out.mockups !== undefined && !out.renders) {
    fail("--mockups needs --renders");
  }
  return out;
}

function fail(message) {
  process.stderr.write(`serve.mjs: ${message}\n`);
  process.exit(2);
}

const args = parseArgs(process.argv.slice(2));

if (!existsSync(args.root) || !statSync(args.root).isDirectory()) {
  fail(`--root is not a directory: ${args.root}`);
}
const root = realpathSync(resolve(args.root));

const scratchpad = join(realpathSync(process.cwd()), "docs", "scratchpad");
const scratchReal = existsSync(scratchpad) ? realpathSync(scratchpad) : null;
if (!scratchReal || !root.startsWith(scratchReal + sep)) {
  fail(`--root must resolve under ${scratchpad}${sep}: ${args.root}`);
}

const RENDER_MODE = args.renders;
// The reserved directory of the tree this server serves.
const OWN = RENDER_MODE ? RENDERS : RESERVED;

let routes;
try {
  routes = readRoutes(root, OWN);
}
catch (error) {
  fail(`--root holds no valid ${OWN}/routes.json: ${error.message}`);
}

// Renders mode: routes.json is read again at each request, so a copy made while
// the server runs — a new screen, a moved route — is seen; a file that cannot
// be read then keeps the last good map, with one stderr line.
function refreshRoutes() {
  if (!RENDER_MODE) {
    return;
  }
  try {
    routes = readRoutes(root, OWN);
  }
  catch (error) {
    process.stderr.write(
      `serve.mjs: keeping the last route map: ${error.message}\n`,
    );
  }
}

// Renders mode: renders.json, read at start to refuse a tree with none, and
// again at each request, so a copy made while the server runs is seen.
function readRenders() {
  const data = JSON.parse(
    readFileSync(join(root, RENDERS, "renders.json"), "utf8"),
  );
  if (!Array.isArray(data?.renders)) {
    throw new Error("needs a renders list");
  }
  return data.renders.filter(entry =>
    entry !== null
    && typeof entry === "object"
    && typeof entry.code === "string"
    && typeof entry.state === "string"
  );
}
if (RENDER_MODE) {
  try {
    readRenders();
  }
  catch (error) {
    fail(`--root holds no valid ${RENDERS}/renders.json: ${error.message}`);
  }
}
// The renders.json entries that hold under the route map now: an entry counts
// only while its code's screen has the entry's route and the entry's file is
// the one that screen's route folder gives its state. What is shown — a page,
// a state, a list row, an image — is decided from these entries alone, never
// from a file on disk, so an image a moved screen left at a route folder is
// never shown as the render of the screen that now owns that route.
function renders() {
  let list;
  try {
    list = readRenders();
  }
  catch {
    return [];
  }
  return list.filter(entry => {
    const screen = routes.screens.find(s => s.code === entry.code);
    if (!screen || entry.route !== screen.route) {
      return false;
    }
    return entry.file === renderFile(screen.path, entry.state);
  });
}

// A path the CLI names must resolve under the scratchpad; the file itself may
// not exist yet, its directory must.
function scratchFile(flag, value, mustExist) {
  const full = resolve(value);
  let dir;
  try {
    dir = realpathSync(dirname(full));
  }
  catch {
    if (mustExist) {
      fail(`${flag} has no directory: ${value}`);
    }
    dir = dirname(full);
  }
  const file = join(dir, basename(full));
  if (!file.startsWith(scratchReal + sep)) {
    fail(`${flag} must resolve under ${scratchpad}${sep}: ${value}`);
  }
  return file;
}

const urlFile = args["url-file"] === undefined
  ? null
  : scratchFile("--url-file", args["url-file"], true);
const peerFile = args["peer-file"] === undefined
  ? null
  : scratchFile("--peer-file", args["peer-file"], false);

// The peer server's origin from --peer-file, read now, or null: an absent
// file, a file outside the scratchpad, or a URL that is not loopback http
// gives no link.
function peerOrigin() {
  if (peerFile === null) {
    return null;
  }
  const real = inRoot(scratchReal, peerFile);
  if (!real) {
    return null;
  }
  let url;
  try {
    url = new URL(readFileSync(real, "utf8").trim());
  }
  catch {
    return null;
  }
  if (
    url.protocol !== "http:"
    || !["127.0.0.1", "localhost"].includes(url.hostname)
    || url.username
    || url.password
  ) {
    return null;
  }
  return url.origin;
}

function peerLink(pathname, state) {
  const origin = peerOrigin();
  if (origin === null) {
    return null;
  }
  return origin
    + pathname
    + (state ? `?state=${encodeURIComponent(state)}` : "");
}

// Renders mode: the mockup tree served in the frame, or null when there is
// none. It must resolve under the scratchpad, as --root does.
let mockRoot = null;
let mockRoutes = null;
if (RENDER_MODE && args.mockups !== undefined) {
  const wanted = resolve(args.mockups);
  if (existsSync(wanted)) {
    if (!statSync(wanted).isDirectory()) {
      fail(`--mockups is not a directory: ${args.mockups}`);
    }
    mockRoot = realpathSync(wanted);
    if (!mockRoot.startsWith(scratchReal + sep)) {
      fail(`--mockups must resolve under ${scratchpad}${sep}: ${args.mockups}`);
    }
    try {
      mockRoutes = readRoutes(mockRoot);
    }
    catch (error) {
      // Never fall back to the render route map: a mockup matched through the
      // wrong map could be shown beside another screen's render.
      process.stderr.write(
        `serve.mjs: --mockups has no valid ${RESERVED}/routes.json, so no mockup is shown: ${error.message}\n`,
      );
      mockRoot = null;
    }
  }
  else if (!wanted.startsWith(scratchpad + sep)) {
    fail(`--mockups must resolve under ${scratchpad}${sep}: ${args.mockups}`);
  }
}

// The platforms whose render page sets the mockup beside the image (E7); the
// others review in two windows (E8).
const SIDE_BY_SIDE = new Set(["mobile", "watch", "auto"]);
const sideBySide = SIDE_BY_SIDE.has(routes.platform);

const commentsPath = join(root, OWN, "comments.yaml");

const port = Number(args.port);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  fail(`--port must be an integer in 0..65535: ${args.port}`);
}

// --- Static files ------------------------------------------------------------

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const MARKER = "<!-- mockup-review-overlay -->";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// JSON safe inside a <script> element.
function scriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function send(res, status, type, body) {
  const buffer = Buffer.from(body, "utf8");
  res.writeHead(status, {
    "content-type": type,
    "content-length": buffer.length,
    "cache-control": "no-store",
  });
  res.end(buffer);
}

// Inserts `injection` before the last </body>, or appends it when there is none.
function beforeBodyClose(html, injection) {
  const close = html.lastIndexOf("</body>");
  return close === -1
    ? html + injection
    : html.slice(0, close) + injection + html.slice(close);
}

// The overlay script, inserted before </body>.
function withOverlay(html, overlay) {
  return beforeBodyClose(
    html,
    `${MARKER}\n<script>(${OVERLAY})(${scriptJson(overlay)});</script>\n`,
  );
}

// A mockup inside a render page's frame: a click on a root-absolute link moves
// the whole review page to that route, so the frame and the image stay on one
// screen. Only a single-slash path of this origin moves it — a protocol-
// relative //host (or /\host) link resolves to another origin and is left
// alone.
const FRAME_SCRIPT = "<script>document.addEventListener(\"click\",function(e){"
  + "var a=e.target.closest&&e.target.closest(\"a[href^='/']\");"
  + "if(!a||e.altKey)return;var h=a.getAttribute(\"href\");"
  + "if(/^\\/[\\/\\\\]/.test(h))return;"
  + "var u=new URL(h,location.href);if(u.origin!==location.origin)return;"
  + "e.preventDefault();"
  + "window.top.location.href=u.pathname+u.search+u.hash;});</script>\n";

// overlay: the overlay config, or null for none; frame: inject FRAME_SCRIPT.
function serveFile(res, file, overlay, frame = false) {
  const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  let body = readFileSync(file);
  if (type.startsWith("text/html") && (overlay !== null || frame)) {
    const html = body.toString("utf8");
    body = Buffer.from(
      overlay !== null
        ? withOverlay(html, overlay)
        : beforeBodyClose(html, FRAME_SCRIPT),
      "utf8",
    );
  }
  res.writeHead(200, {
    "content-type": type,
    "content-length": body.length,
    "cache-control": "no-store",
  });
  res.end(body);
}

function page(title, content) {
  return [
    "<!doctype html>",
    "<html lang=\"en\"><head><meta charset=\"utf-8\">",
    `<title>${escapeHtml(title)}</title>`,
    "<style>body{font:15px/1.5 system-ui,sans-serif;margin:24px;color:#111}"
    + "h1{font-size:20px}h2{font-size:16px;margin-top:24px}"
    + "code{background:#f3f3f3;padding:0 4px;border-radius:3px}"
    + "li{margin:4px 0}.muted{color:#777}</style>",
    "</head><body>",
    content,
    "</body></html>",
    "",
  ]
    .join("\n");
}

// The D4 list: every flow, screen and state, built in memory.
function listPage() {
  const flows = new Map();
  for (const screen of routes.screens) {
    if (!flows.has(screen.flow)) {
      flows.set(screen.flow, []);
    }
    flows.get(screen.flow).push(screen);
  }
  const sections = [...flows.entries()].map(([flow, screens]) => {
    const items = screens.map(screen => {
      const dir = join(root, ...(screen.path ? screen.path.split("/") : []));
      const href = sampleRoute(screen.path);
      const rendered = existsSync(join(dir, "index.html"));
      const states = statesIn(dir)
        .map(state =>
          `<a href="${escapeHtml(href)}?state=${encodeURIComponent(state)}">${
            escapeHtml(state)
          }</a>`
        )
        .join(" · ");
      return `<li><code>${escapeHtml(screen.code)}</code> ${
        escapeHtml(screen.screen)
      } — <a href="${escapeHtml(href)}">${escapeHtml(screen.route)}</a>${
        states ? ` — states: ${states}` : ""
      }${
        rendered ? "" : " <span class=\"muted\">not rendered yet</span>"
      }</li>`;
    });
    return `<h2>${escapeHtml(flow)}</h2>\n<ul>\n${items.join("\n")}\n</ul>`;
  });
  return page(
    `Mockups — ${routes.project} ${routes.platform}`,
    `<h1>Mockups — ${escapeHtml(routes.project)} · ${
      escapeHtml(routes.platform)
    }</h1>\n${sections.join("\n")}`,
  );
}

// The D10 placeholder: a code in routes.json with no file yet.
function placeholderPage(screen) {
  return page(
    `${screen.code} — not rendered yet`,
    `<h1><code>${escapeHtml(screen.code)}</code> ${
      escapeHtml(screen.screen)
    }</h1>\n<p>Flow <code>${escapeHtml(screen.flow)}</code> — route <code>${
      escapeHtml(screen.route)
    }</code>.</p>\n<p><b>Not rendered yet.</b></p>\n`
      + `<p><a href="/${RESERVED}/">All mockups</a></p>`,
  );
}

// --- Renders mode pages ------------------------------------------------------

// A folder path to a URL path: "orders/[id]" + "index.png" →
// "/orders/%5Bid%5D/index.png".
function fileUrl(path, name) {
  const segments = path ? path.split("/") : [];
  return "/" + [...segments, name].map(encodeURIComponent).join("/");
}

// The renders.json entry of one image, or undefined.
function renderEntry(list, code, state) {
  return list.find(entry =>
    entry.code === code && entry.state === (state ?? "default")
  );
}

// The states of a code other than default, from renders.json.
function renderStates(list, code) {
  return [
    ...new Set(
      list
        .filter(entry => entry.code === code && entry.state !== "default")
        .map(entry => entry.state)
        .filter(state => STATE_RE.test(state)),
    ),
  ]
    .sort();
}

// The /__renders/ list: every rendered screen by flow, built in memory.
function renderListPage() {
  const list = renders();
  const flows = new Map();
  for (const screen of routes.screens) {
    const entries = list.filter(entry => entry.code === screen.code);
    if (entries.length === 0) {
      continue;
    }
    if (!flows.has(screen.flow)) {
      flows.set(screen.flow, []);
    }
    const href = sampleRoute(screen.path);
    const states = entries
      .map(entry => {
        const link = entry.state === "default"
          ? href
          : `${href}?state=${encodeURIComponent(entry.state)}`;
        return `<a href="${escapeHtml(link)}">${escapeHtml(entry.state)}</a>`
          + ` <span class="muted">${escapeHtml(entry.plan ?? "")} · ${
            escapeHtml(entry.date ?? "")
          }</span>`;
      })
      .join(" — ");
    flows.get(screen.flow).push(
      `<li><code>${escapeHtml(screen.code)}</code> ${
        escapeHtml(screen.screen)
      } — <a href="${escapeHtml(href)}">${
        escapeHtml(screen.route)
      }</a> — states: ${states}</li>`,
    );
  }
  const sections = [...flows.entries()].map(([flow, items]) =>
    `<h2>${escapeHtml(flow)}</h2>\n<ul>\n${items.join("\n")}\n</ul>`
  );
  return page(
    `Renders — ${routes.project} ${routes.platform}`,
    `<h1>Renders — ${escapeHtml(routes.project)} · ${
      escapeHtml(routes.platform)
    }</h1>\n${
      sections.length > 0
        ? sections.join("\n")
        : "<p class=\"muted\">No render yet.</p>"
    }`,
  );
}

// A screen of the route map with no default render yet.
function renderPlaceholderPage(screen) {
  return page(
    `${screen.code} — no render yet`,
    `<h1><code>${escapeHtml(screen.code)}</code> ${
      escapeHtml(screen.screen)
    }</h1>\n<p>Flow <code>${escapeHtml(screen.flow)}</code> — route <code>${
      escapeHtml(screen.route)
    }</code>.</p>\n<p><b>No render yet.</b></p>\n`
      + `<p><a href="/${RENDERS}/">All renders</a></p>`,
  );
}

// The page of one render: the image, and on a side-by-side platform the
// mockup of the same route and state in a frame on its left.
function renderPage(screen, pathname, state, entry) {
  const image = fileUrl(screen.path, renderName(state));
  const query = state === null ? "" : `?state=${encodeURIComponent(state)}`;
  let mockup = null;
  if (sideBySide && mockRoot !== null) {
    const match = matchPath(mockRoot, mockRoutes, pathname, state);
    if (match.kind === "file" && match.file.endsWith(".html")) {
      mockup = `/${RESERVED}${pathname}${query}`;
    }
  }
  const caption = `${screen.code} ${screen.screen}${
    state === null ? "" : ` — ${state}`
  }`;
  const img = `<figure><figcaption>Render${
    entry
      ? ` — ${escapeHtml(entry.plan ?? "")} · ${escapeHtml(entry.date ?? "")}`
      : ""
  }</figcaption><img id="render" src="${escapeHtml(image)}" alt="${
    escapeHtml(caption)
  }"></figure>`;
  const body = mockup === null
    ? `<div class="drv-pair">${img}</div>`
    : `<div class="drv-pair"><figure><figcaption>Mockup</figcaption>`
      + `<iframe id="mockup" title="Mockup ${escapeHtml(caption)}" src="${
        escapeHtml(mockup)
      }"></iframe></figure>${img}</div>`;
  return page(
    caption,
    "<style>.drv-pair{display:flex;gap:24px;align-items:flex-start}"
      + "figure{margin:0}figcaption{font-size:13px;color:#555;margin:4px 0}"
      + "iframe{width:430px;height:932px;border:1px solid #ccc}"
      + "img{max-width:100%;border:1px solid #ccc}</style>\n"
      + body,
  );
}

// --- Comments ----------------------------------------------------------------

let counter = countComments();

function countComments() {
  if (!existsSync(commentsPath)) {
    return 0;
  }
  return readFileSync(commentsPath, "utf8")
    .split("\n")
    .filter(line => /^- id: /.test(line))
    .length;
}

function appendComments(text) {
  if (!existsSync(commentsPath)) {
    appendFileSync(
      commentsPath,
      `# review comments for ${routes.project} ${routes.platform} — written by the vwf ${
        RENDER_MODE ? "render" : "mockup"
      } review server\n`,
    );
  }
  appendFileSync(commentsPath, text);
}

// A YAML double-quoted scalar. JSON.stringify escapes C0 and lone surrogates;
// the rest of what YAML forbids or reads as a line break — DEL, C1, U+2028,
// U+2029, U+FEFF, U+FFFE, U+FFFF — is escaped here, so a comment can never make
// comments.yaml unparseable.
function yamlString(value) {
  return JSON.stringify(String(value)).replace(
    /[\u007f-\u009f\u2028\u2029\ufeff\ufffe\uffff]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g,
    ch => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

function readJson(req) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 65536) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolvePromise(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      }
      catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

// path, selector and text are non-empty strings; state is a string, empty for
// the page's default state.
function isComment(body) {
  return body !== null
    && typeof body === "object"
    && ["path", "selector", "text"].every(key =>
      typeof body[key] === "string" && body[key].length > 0
    )
    && typeof body.state === "string";
}

async function postComment(req, res) {
  let body;
  try {
    body = await readJson(req);
  }
  catch {
    res.writeHead(400).end();
    return;
  }
  if (!isComment(body)) {
    res.writeHead(400).end();
    return;
  }
  const screen = findScreen(routes, body.path);
  const yamlOrNull = value => (value ? yamlString(value) : "null");
  // Renders mode: the plan that made the image, from renders.json.
  const plan = RENDER_MODE && screen
    ? [
      `  plan: ${
        yamlOrNull(
          renderEntry(renders(), screen.code, body.state || null)?.plan,
        )
      }`,
    ]
    : [];
  counter += 1;
  const id = `c${String(counter).padStart(3, "0")}`;
  appendComments(
    [
      `- id: ${id}`,
      `  code: ${yamlOrNull(screen?.code)}`,
      `  route: ${yamlOrNull(screen?.route)}`,
      ...plan,
      `  state: ${yamlOrNull(body.state)}`,
      `  selector: ${yamlString(body.selector)}`,
      `  text: ${yamlString(body.text)}`,
      `  status: open`,
      `  created_at: ${new Date().toISOString()}`,
      `  applied_at: null`,
      "",
    ]
      .join("\n"),
  );
  process.stderr.write(
    `comment ${id} on ${screen?.code ?? body.path} ${body.selector}\n`,
  );
  res.writeHead(204).end();
}

function postDone(res) {
  removeUrlFile();
  appendComments(`# done: ${new Date().toISOString()}\n`);
  process.stderr.write(`done — ${counter} comment(s) recorded\n`);
  // Close only once the 204 has left, so the overlay sees the answer; then
  // drop keep-alive connections, which would otherwise hold the server open.
  res.on("finish", () => {
    server.close(() => process.exit(0));
    server.closeAllConnections?.();
  });
  res.writeHead(204).end();
}

// --- Server ------------------------------------------------------------------

let boundPort = null;

function hosts() {
  return [`127.0.0.1:${boundPort}`, `localhost:${boundPort}`];
}

// 403 for a foreign Host or Origin, 415 for a POST that is not JSON; null when
// the request may proceed.
function refusal(req) {
  const host = String(req.headers.host ?? "").toLowerCase();
  if (!hosts().includes(host)) {
    return 403;
  }
  if (req.method !== "POST") {
    return null;
  }
  const origin = req.headers.origin;
  if (
    origin !== undefined
    && !hosts().map(h => `http://${h}`).includes(origin.toLowerCase())
  ) {
    return 403;
  }
  const type = String(req.headers["content-type"] ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  return type === "application/json" ? null : 415;
}

// The request target split into its path and query, or null when it is not a
// path. Only the path is ever read: a target is never resolved against a base,
// so a leading // stays a path and never becomes a host.
function target(raw) {
  const value = String(raw ?? "");
  if (!value.startsWith("/")) {
    return null;
  }
  const hash = value.indexOf("#");
  const bare = hash === -1 ? value : value.slice(0, hash);
  const query = bare.indexOf("?");
  const pathname = query === -1 ? bare : bare.slice(0, query);
  try {
    decodeURIComponent(pathname);
  }
  catch {
    return null;
  }
  return {
    pathname,
    searchParams: new URLSearchParams(
      query === -1 ? "" : bare.slice(query + 1),
    ),
  };
}

// Whatever a handler throws, the request gets a 500 and the server lives on.
function failed(res, error) {
  process.stderr.write(`request failed: ${error?.stack ?? error}\n`);
  if (!res.headersSent) {
    res.writeHead(500).end();
  }
  else {
    res.destroy();
  }
}

const server = createServer((req, res) => {
  handle(req, res).catch(error => failed(res, error));
});

async function handle(req, res) {
  const refused = refusal(req);
  if (refused !== null) {
    res.writeHead(refused).end();
    return;
  }
  const url = target(req.url);
  if (url === null) {
    res.writeHead(400).end();
    return;
  }
  refreshRoutes();
  if ((req.method === "GET" || req.method === "HEAD") && RENDER_MODE) {
    getRender(res, url);
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    if (url.pathname === `/${RESERVED}/` || url.pathname === `/${RESERVED}`) {
      send(res, 200, TYPES[".html"], listPage());
      return;
    }
    const states = url.searchParams.getAll("state");
    if (states.length > 1) {
      res.writeHead(404).end();
      return;
    }
    const state = states[0] ?? null;
    const match = matchPath(root, routes, url.pathname, state);
    if (match.kind === "placeholder") {
      send(res, 200, TYPES[".html"], placeholderPage(match.screen));
      return;
    }
    if (match.kind === "none") {
      res.writeHead(404).end();
      return;
    }
    serveFile(res, match.file, {
      code: match.screen?.code ?? "",
      screen: match.screen?.screen ?? "",
      state: state ?? "",
      states: statesIn(match.dir),
      list: `/${RESERVED}/`,
      listLabel: "All mockups",
      peer: peerLink(url.pathname, state),
      peerLabel: "Open the render",
      meta: "",
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/comment") {
    await postComment(req, res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/done") {
    postDone(res);
    return;
  }
  res.writeHead(404).end();
}

// Renders mode: a GET. /__renders/ is the list, /__mockups/<route> the mockup
// a frame shows, a .png path an image, anything else a route.
function getRender(res, url) {
  const segments = splitPath(url.pathname);
  if (!segments) {
    res.writeHead(404).end();
    return;
  }
  const first = segments[0]?.toLowerCase();
  if (first === RENDERS) {
    if (segments.length === 1) {
      send(res, 200, TYPES[".html"], renderListPage());
      return;
    }
    res.writeHead(404).end();
    return;
  }
  const states = url.searchParams.getAll("state");
  if (states.length > 1) {
    res.writeHead(404).end();
    return;
  }
  const state = states[0] ?? null;
  if (state !== null && !STATE_RE.test(state)) {
    res.writeHead(404).end();
    return;
  }
  if (isReserved(first ?? "")) {
    if (mockRoot === null) {
      res.writeHead(404).end();
      return;
    }
    const match = matchPath(
      mockRoot,
      mockRoutes,
      "/" + segments.slice(1).map(encodeURIComponent).join("/"),
      state,
    );
    if (match.kind !== "file") {
      res.writeHead(404).end();
      return;
    }
    serveFile(res, match.file, null, true);
    return;
  }
  const last = segments[segments.length - 1] ?? "";
  if (last.toLowerCase().endsWith(".png")) {
    const rel = segments.join("/");
    const real = inRoot(root, join(root, ...segments));
    if (
      !renders().some(entry => entry.file === rel)
      || !real
      || real === root
      || !real.toLowerCase().endsWith(".png")
      || real.slice(root.length + 1).split(sep)[0].toLowerCase() === RENDERS
      || !statSync(real).isFile()
    ) {
      res.writeHead(404).end();
      return;
    }
    serveFile(res, real, null);
    return;
  }
  const screen = findScreen(routes, segments);
  if (!screen) {
    res.writeHead(404).end();
    return;
  }
  const list = renders();
  const entry = renderEntry(list, screen.code, state);
  const dir = join(root, ...(screen.path ? screen.path.split("/") : []));
  const image = entry && inRoot(root, join(dir, renderName(state)));
  if (!image || !statSync(image).isFile()) {
    if (state !== null) {
      res.writeHead(404).end();
      return;
    }
    send(res, 200, TYPES[".html"], renderPlaceholderPage(screen));
    return;
  }
  send(
    res,
    200,
    TYPES[".html"],
    withOverlay(renderPage(screen, url.pathname, state, entry), {
      code: screen.code,
      screen: screen.screen,
      state: state ?? "",
      states: renderStates(list, screen.code),
      list: `/${RENDERS}/`,
      listLabel: "All renders",
      peer: sideBySide ? null : peerLink(url.pathname, state),
      peerLabel: "Open the mockup",
      meta: entry ? `${entry.plan ?? ""} · ${entry.date ?? ""}` : "",
    }),
  );
}

// The URL this server wrote to --url-file, or null before it listens.
let ownUrl = null;

// Removes --url-file on Done and on exit, so a peer never links a server that
// is gone — only while it still holds this server's URL, so a later server's
// file is left alone.
function removeUrlFile() {
  if (urlFile === null || ownUrl === null) {
    return;
  }
  try {
    if (readFileSync(urlFile, "utf8").trim() === ownUrl) {
      rmSync(urlFile);
    }
  }
  catch {
    // already gone
  }
}
process.on("exit", removeUrlFile);
// A signal ends the process without the exit event unless it is handled.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => process.exit(128 + osConstants.signals[signal]));
}

server.listen(port, "127.0.0.1", () => {
  const { port: bound } = server.address();
  boundPort = bound;
  // The URL file first, so whoever has read the URL: line finds it written.
  if (urlFile !== null) {
    ownUrl = `http://127.0.0.1:${bound}/`;
    // Removed first and written exclusively, so a symlink at the name is
    // replaced, never followed.
    rmSync(urlFile, { force: true });
    writeFileSync(urlFile, `${ownUrl}\n`, { flag: "wx" });
  }
  process.stdout.write(`URL: http://127.0.0.1:${bound}/\n`);
  process.stderr.write(
    `serving ${root} on 127.0.0.1:${bound}; comments → ${commentsPath}\n`,
  );
});

// --- The overlay -------------------------------------------------------------
//
// Injected before </body> of every HTML page, called with { code, screen,
// state, states, list }. Plain JS: a fixed toolbar with the screen's code and
// name, a state switcher over the index--<state>.html files of the page's
// directory, a link to the list, a comment count and a Done button; hover
// highlights the element under the cursor, click selects it and opens a
// textarea; submit POSTs the comment; Done POSTs /done and replaces the body
// with a one-line note. A plain click never intercepts navigation — links
// between screens and a form's submit control keep working; an Alt/Option-click
// opens the comment box on any element, a link or a submit control included,
// without navigating.

const OVERLAY = String.raw`function (CFG) {
  var count = 0;
  var selected = null;
  var hovered = null;

  var style = document.createElement("style");
  style.textContent = [
    "#drv-bar{position:fixed;top:0;left:0;right:0;z-index:2147483646;display:flex;gap:12px;align-items:center;padding:6px 12px;background:#111;color:#eee;font:13px/1.4 system-ui,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.4)}",
    "#drv-bar b{font-weight:600}",
    "#drv-bar span{opacity:.75}",
    "#drv-bar a{color:#93c5fd;text-decoration:none}",
    "#drv-bar a.drv-current{color:#fff;font-weight:600;text-decoration:underline}",
    "#drv-bar button{margin-left:auto;padding:4px 12px;border:0;border-radius:4px;background:#3b82f6;color:#fff;font:inherit;cursor:pointer}",
    "body{margin-top:36px!important}",
    ".drv-hover{outline:2px dashed #3b82f6!important;outline-offset:-2px}",
    ".drv-selected{outline:2px solid #f59e0b!important;outline-offset:-2px}",
    "#drv-form{position:fixed;z-index:2147483647;width:280px;padding:8px;background:#fff;color:#111;border:1px solid #ccc;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.25);font:13px/1.4 system-ui,sans-serif}",
    "#drv-form code{display:block;margin-bottom:6px;font-size:11px;color:#555;word-break:break-all}",
    "#drv-form textarea{display:block;width:100%;box-sizing:border-box;min-height:64px;margin-bottom:6px;font:inherit}",
    "#drv-form button{padding:4px 10px;border:0;border-radius:4px;font:inherit;cursor:pointer}",
    "#drv-form .drv-send{background:#3b82f6;color:#fff}",
    "#drv-form .drv-cancel{margin-left:6px;background:#eee;color:#111}",
  ].join("");
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.id = "drv-bar";
  bar.innerHTML = "<b></b><span></span><span id=\"drv-states\"></span><a id=\"drv-list\">All mockups</a><span id=\"drv-count\">0 comments</span><span id=\"drv-hint\">Click to comment · Alt/Option-click a link or button</span><button type=\"button\">Done</button>";
  bar.querySelector("b").textContent = CFG.code || location.pathname;
  bar.querySelectorAll("span")[0].textContent = CFG.screen;
  bar.querySelector("#drv-list").href = CFG.list;
  bar.querySelector("#drv-list").textContent = CFG.listLabel || "All mockups";
  if (CFG.meta) {
    var meta = document.createElement("span");
    meta.id = "drv-meta";
    meta.textContent = CFG.meta;
    bar.insertBefore(meta, bar.querySelector("#drv-list"));
  }
  if (CFG.peer) {
    var peer = document.createElement("a");
    peer.id = "drv-peer";
    peer.href = CFG.peer;
    peer.target = "_blank";
    peer.rel = "noopener";
    peer.textContent = CFG.peerLabel + " ↗";
    bar.insertBefore(peer, bar.querySelector("#drv-count"));
  }
  var statesEl = bar.querySelector("#drv-states");
  if (CFG.states.length > 0) {
    ["default"].concat(CFG.states).forEach(function (state) {
      var a = document.createElement("a");
      var isDefault = state === "default";
      a.href = location.pathname + (isDefault ? "" : "?state=" + encodeURIComponent(state));
      a.textContent = state;
      if ((isDefault && !CFG.state) || state === CFG.state) a.className = "drv-current";
      statesEl.appendChild(a);
      statesEl.appendChild(document.createTextNode(" "));
    });
  }
  document.body.appendChild(bar);
  var countEl = bar.querySelector("#drv-count");
  bar.querySelector("button").addEventListener("click", done);

  function inOverlay(el) {
    return !!(el && el.closest && el.closest("#drv-bar,#drv-form"));
  }

  function selectorFor(el) {
    if (el.id) return "#" + CSS.escape(el.id);
    var parts = [];
    while (el && el !== document.body && el.nodeType === 1) {
      var tag = el.tagName.toLowerCase();
      var parent = el.parentElement;
      if (parent) {
        var index = Array.prototype.indexOf.call(parent.children, el) + 1;
        parts.unshift(tag + ":nth-child(" + index + ")");
      } else {
        parts.unshift(tag);
      }
      el = parent;
    }
    return "body > " + parts.join(" > ");
  }

  function clearHover() {
    if (hovered) hovered.classList.remove("drv-hover");
    hovered = null;
  }

  document.addEventListener("mouseover", function (e) {
    if (inOverlay(e.target) || e.target === document.body || e.target === document.documentElement) {
      clearHover();
      return;
    }
    if (hovered !== e.target) {
      clearHover();
      hovered = e.target;
      hovered.classList.add("drv-hover");
    }
  });
  document.addEventListener("mouseout", function (e) {
    if (e.target === hovered) clearHover();
  });

  document.addEventListener("click", function (e) {
    if (inOverlay(e.target)) return;
    if (e.target === document.body || e.target === document.documentElement) return;
    if (!e.altKey) {
      if (e.target.closest && e.target.closest("a[href]")) return;
      // A form's submit control keeps submitting: a form action may navigate.
      var control = e.target.closest && e.target.closest("button,input[type=submit],input[type=image]");
      if (control && control.form && (control.type === "submit" || control.type === "image")) return;
    }
    e.preventDefault();
    openForm(e.target, e.clientX, e.clientY);
  });

  function closeForm() {
    var form = document.getElementById("drv-form");
    if (form) form.remove();
    if (selected) selected.classList.remove("drv-selected");
    selected = null;
  }

  function openForm(el, x, y) {
    closeForm();
    selected = el;
    selected.classList.add("drv-selected");
    var selector = selectorFor(el);
    var form = document.createElement("div");
    form.id = "drv-form";
    form.innerHTML = "<code></code><textarea placeholder=\"What should change here?\"></textarea><button type=\"button\" class=\"drv-send\">Send</button><button type=\"button\" class=\"drv-cancel\">Cancel</button>";
    form.querySelector("code").textContent = selector;
    form.style.left = Math.min(x, window.innerWidth - 300) + "px";
    form.style.top = Math.min(y, window.innerHeight - 160) + "px";
    document.body.appendChild(form);
    var textarea = form.querySelector("textarea");
    textarea.focus();
    form.querySelector(".drv-cancel").addEventListener("click", closeForm);
    form.querySelector(".drv-send").addEventListener("click", function () {
      var text = textarea.value.trim();
      if (!text) return;
      fetch("/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: location.pathname, state: CFG.state, selector: selector, text: text }),
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        count += 1;
        countEl.textContent = count + " comment" + (count === 1 ? "" : "s");
        closeForm();
      }).catch(function () {
        alert("The review server did not accept the comment.");
      });
    });
  }

  function done() {
    fetch("/done", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }).then(function () {
      document.body.innerHTML = "<p style=\"font:15px system-ui,sans-serif;padding:24px\">Review sent — you can close this tab.</p>";
    }).catch(function () {
      alert("The review server did not answer.");
    });
  }
}`;
