#!/usr/bin/env node
// vwf's mockup review server.
//
// Run by /vwf:mockups and /vwf:blueprint §6a, one server per platform with
// every flow of it. It serves the mockup tree of one platform at the app's own
// routes, injects a comment overlay into every HTML page as it serves it — the
// files on disk stay free of JS — and records what the reviewer says as YAML
// the skill turns into proposals afterwards.
//
//   node serve.mjs --root <platform dir> [--port <n>]
//
// where <platform dir> is docs/scratchpad/<project>/mockups/<platform>. Prints
// exactly one line on stdout once it is listening; everything else goes to
// stderr:
//
//   URL: http://127.0.0.1:<port>/
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
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import {
  extname,
  join,
  resolve,
  sep,
} from "node:path";
import {
  findScreen,
  matchPath,
  readRoutes,
  RESERVED,
  sampleRoute,
  statesIn,
} from "./lib/routes.mjs";

// --- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const out = { port: "0" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      fail(`unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    if (!["root", "port"].includes(key)) {
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

let routes;
try {
  routes = readRoutes(root);
}
catch (error) {
  fail(`--root holds no valid ${RESERVED}/routes.json: ${error.message}`);
}

const commentsPath = join(root, RESERVED, "comments.yaml");

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

function serveFile(res, file, overlay) {
  const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  let body = readFileSync(file);
  if (type.startsWith("text/html")) {
    let html = body.toString("utf8");
    const injection = `${MARKER}\n<script>(${OVERLAY})(${
      scriptJson(overlay)
    });</script>\n`;
    const close = html.lastIndexOf("</body>");
    html = close === -1
      ? html + injection
      : html.slice(0, close) + injection + html.slice(close);
    body = Buffer.from(html, "utf8");
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
      `# review comments for ${routes.project} ${routes.platform} — written by the vwf mockup review server\n`,
    );
  }
  appendFileSync(commentsPath, text);
}

function yamlString(value) {
  return JSON.stringify(String(value));
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
  counter += 1;
  const id = `c${String(counter).padStart(3, "0")}`;
  appendComments(
    [
      `- id: ${id}`,
      `  path: ${yamlString(body.path)}`,
      `  code: ${yamlOrNull(screen?.code)}`,
      `  route: ${yamlOrNull(screen?.route)}`,
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

const server = createServer((req, res) => {
  const refused = refusal(req);
  if (refused !== null) {
    res.writeHead(refused).end();
    return;
  }
  const url = new URL(req.url, "http://127.0.0.1");
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
    const screen = findScreen(routes, url.pathname);
    serveFile(res, match.file, {
      code: screen?.code ?? "",
      screen: screen?.screen ?? "",
      state: state ?? "",
      states: statesIn(match.dir),
      list: `/${RESERVED}/`,
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/comment") {
    postComment(req, res);
    return;
  }
  if (req.method === "POST" && url.pathname === "/done") {
    postDone(res);
    return;
  }
  res.writeHead(404).end();
});

server.listen(port, "127.0.0.1", () => {
  const { port: bound } = server.address();
  boundPort = bound;
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
// with a one-line note. It never intercepts navigation — links between screens
// and a form's submit control keep working.

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
  bar.innerHTML = "<b></b><span></span><span id=\"drv-states\"></span><a id=\"drv-list\">All mockups</a><span id=\"drv-count\">0 comments</span><button type=\"button\">Done</button>";
  bar.querySelector("b").textContent = CFG.code || location.pathname;
  bar.querySelectorAll("span")[0].textContent = CFG.screen;
  bar.querySelector("#drv-list").href = CFG.list;
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
    if (e.target.closest && e.target.closest("a[href]")) return;
    // A form's submit control keeps submitting: a form action may navigate.
    var control = e.target.closest && e.target.closest("button,input[type=submit],input[type=image]");
    if (control && control.form && (control.type === "submit" || control.type === "image")) return;
    if (e.target === document.body || e.target === document.documentElement) return;
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
