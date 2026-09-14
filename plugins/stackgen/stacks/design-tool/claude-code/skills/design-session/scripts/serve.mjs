#!/usr/bin/env node
// The review server of the claude-code design tool.
//
// Ships with the claude-code design-tool pack and is run by the design-session
// skill's `review <flow>` mode. It serves one flow's screens from the committed
// canvas, injects a comment overlay into every HTML page, and records what the
// reviewer says as YAML the skill applies afterwards.
//
//   node serve.mjs --root <canvas dir> --flow <flow>--<platform> \
//                  --comments <yaml path> [--port <n>]
//
// Prints exactly one line on stdout once it is listening:
//
//   URL: http://127.0.0.1:<port>/screens/<flow>--<platform>/index--<platform>.html
//
// Endpoints — there are no others:
//   GET  <path>     a file under --root; HTML gets the overlay injected
//   GET  /          redirects to the flow's stitched index
//   POST /comment   { screen, selector, text } → one YAML list item, 204
//   POST /done      appends a done marker, responds 204, closes, exits 0
//
// Loopback only: it binds 127.0.0.1, never any other interface, and carries no
// auth and no TLS — it is a review server for one person on one machine. The
// root must be the canvas directory and the comments path must resolve under
// the current working directory; it refuses to start otherwise. Nothing outside
// --root is ever served: every path is resolved, realpath'd and checked to sit
// under the root, so neither `..` nor a symlink escapes it.
//
// Zero dependencies — node: modules only.

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { createServer } from "node:http";
import {
  basename,
  dirname,
  extname,
  join,
  resolve,
  sep,
} from "node:path";

// --- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const out = { port: "0" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      fail(`unexpected argument: ${arg}`);
    }
    const key = arg.slice(2);
    if (!["root", "flow", "comments", "port"].includes(key)) {
      fail(`unknown flag: ${arg}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      fail(`${arg} needs a value`);
    }
    out[key] = value;
    i += 1;
  }
  for (const key of ["root", "flow", "comments"]) {
    if (!out[key]) {
      fail(`--${key} is required`);
    }
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

// Realpath of a path that may not exist yet: the deepest existing ancestor,
// resolved, with the rest joined back on.
function realpathDeep(path) {
  let existing = path;
  const rest = [];
  while (!existsSync(existing)) {
    rest.unshift(basename(existing));
    existing = dirname(existing);
  }
  return join(realpathSync(existing), ...rest);
}

const cwd = realpathSync(process.cwd());
const commentsPath = realpathDeep(resolve(args.comments));
if (!commentsPath.startsWith(cwd + sep)) {
  fail(
    `--comments must resolve under the current working directory: ${args.comments}`,
  );
}

const flow = args.flow;
const platformAt = flow.lastIndexOf("--");
if (platformAt < 1 || platformAt === flow.length - 2) {
  fail(`--flow must be <flow>--<platform>: ${flow}`);
}
const platform = flow.slice(platformAt + 2);
const indexPath = `/screens/${flow}/index--${platform}.html`;

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

const MARKER = "<!-- design-review-overlay -->";

// Resolves a request path to a real file under the root, or null.
function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  }
  catch {
    return null;
  }
  if (decoded.includes("\0")) {
    return null;
  }
  const candidate = resolve(root, `.${decoded}`);
  if (candidate !== root && !candidate.startsWith(root + sep)) {
    return null;
  }
  let real;
  try {
    real = realpathSync(candidate);
  }
  catch {
    return null;
  }
  if (!real.startsWith(root + sep)) {
    return null;
  }
  if (!statSync(real).isFile()) {
    return null;
  }
  return real;
}

function serveFile(res, file) {
  const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  let body = readFileSync(file);
  if (type.startsWith("text/html")) {
    let html = body.toString("utf8");
    const injection = `${MARKER}\n<script>${OVERLAY}</script>\n`;
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
    mkdirSync(dirname(commentsPath), { recursive: true });
    appendFileSync(
      commentsPath,
      `# review comments for ${flow} — written by the design-session review server\n`,
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

function isComment(body) {
  return body !== null
    && typeof body === "object"
    && ["screen", "selector", "text"].every(key =>
      typeof body[key] === "string" && body[key].length > 0
    );
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
  counter += 1;
  const id = `c${String(counter).padStart(3, "0")}`;
  appendComments(
    [
      `- id: ${id}`,
      `  screen: ${yamlString(body.screen)}`,
      `  selector: ${yamlString(body.selector)}`,
      `  text: ${yamlString(body.text)}`,
      `  status: open`,
      `  created_at: ${new Date().toISOString()}`,
      `  applied_at: null`,
      "",
    ]
      .join("\n"),
  );
  process.stderr.write(`comment ${id} on ${body.screen} ${body.selector}\n`);
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

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  if (req.method === "GET" || req.method === "HEAD") {
    if (url.pathname === "/") {
      res.writeHead(302, { location: indexPath }).end();
      return;
    }
    const file = resolveFile(url.pathname);
    if (!file) {
      res.writeHead(404).end();
      return;
    }
    serveFile(res, file);
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
  process.stdout.write(`URL: http://127.0.0.1:${bound}${indexPath}\n`);
  process.stderr.write(
    `serving ${root} for ${flow}; comments → ${commentsPath}\n`,
  );
});

// --- The overlay -------------------------------------------------------------
//
// Injected before </body> of every HTML page. Plain JS: a fixed toolbar with the
// flow name, a comment count and a Done button; hover highlights the element
// under the cursor, click selects it and opens a textarea; submit POSTs the
// comment; Done POSTs /done and replaces the body with a one-line note. It never
// intercepts navigation — links between screens keep working.

const OVERLAY = String.raw`(function () {
  var FLOW = ${JSON.stringify(flow)};
  var SCREEN = location.pathname.split("/").pop().replace(/\.html$/, "");
  var count = 0;
  var selected = null;
  var hovered = null;

  var style = document.createElement("style");
  style.textContent = [
    "#drv-bar{position:fixed;top:0;left:0;right:0;z-index:2147483646;display:flex;gap:12px;align-items:center;padding:6px 12px;background:#111;color:#eee;font:13px/1.4 system-ui,sans-serif;box-shadow:0 1px 4px rgba(0,0,0,.4)}",
    "#drv-bar b{font-weight:600}",
    "#drv-bar span{opacity:.75}",
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
  bar.innerHTML = "<b></b><span></span><span id=\"drv-count\">0 comments</span><button type=\"button\">Done</button>";
  bar.querySelector("b").textContent = FLOW;
  bar.querySelectorAll("span")[0].textContent = SCREEN;
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
        body: JSON.stringify({ screen: SCREEN, selector: selector, text: text }),
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
    fetch("/done", { method: "POST" }).then(function () {
      document.body.innerHTML = "<p style=\"font:15px system-ui,sans-serif;padding:24px\">Review sent — you can close this tab.</p>";
    }).catch(function () {
      alert("The review server did not answer.");
    });
  }
})();`;
