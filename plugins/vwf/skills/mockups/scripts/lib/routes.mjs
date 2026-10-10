// The one matcher of the mockup tree, shared by serve.mjs and links.mjs so the
// server and the link check agree on what a URL path serves.
//
// The tree under a platform root:
//
//   <root>/index.html                     the screen whose route is /
//   <root>/a/b/index.html                 the screen whose route is /a/b
//   <root>/a/b/index--<state>.html        that screen in one pinned state
//   <root>/orders/[id]/index.html         the route /orders/:id, {id} or [id]
//   <root>/a/b/index--overlay-<code>.html the modal, dialog or sheet <code> on
//                                         /a/b, served at /a/b?overlay=<code>
//   <root>/a/b/index--overlay-<code>--<state>.html  that overlay in a state
//   <root>/__mockups/routes.json          the route map routes.mjs writes
//
// Nothing here ever resolves outside the root: every candidate is realpath'd
// and must sit under the root's own realpath. A URL segment matches a folder
// in its exact case, whatever the file system folds, as a production router
// does.
//
// Zero dependencies — node: modules only.

import {
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
} from "node:fs";
import {
  dirname,
  join,
  sep,
} from "node:path";

export const RESERVED = "__mockups";
// The reserved directory of a render tree (renders.mjs, serve.mjs --renders).
export const RENDERS = "__renders";

export const STATE_RE = /^[A-Za-z0-9_-]+$/;
// An overlay's code: no `-`, so `index--overlay-<code>--<state>` splits one way.
export const OVERLAY_RE = /^[A-Za-z0-9_]+$/;
const PARAM_RE = /^\[[^\]/]+\]$/;

/**
 * A page state of the mockup tree: STATE_RE, and never `overlay-…`, which
 * names an overlay's page.
 */
export function isState(state) {
  return STATE_RE.test(String(state)) && !/^overlay-/i.test(String(state));
}

/**
 * A page's file name: index.html, index--<state>.html, and for an overlay
 * index--overlay-<code>.html and index--overlay-<code>--<state>.html.
 */
export function pageName(state, overlay) {
  return "index"
    + (overlay ? `--overlay-${overlay}` : "")
    + (state ? `--${state}` : "")
    + ".html";
}

/** True for a file name a mockup page can have: index.html or index--*.html. */
export function isPageName(name) {
  return /^index(--.+)?\.html$/.test(String(name));
}

/** The overlay code of an overlay page's file name, or null. */
export function overlayOfPage(name) {
  return /^index--overlay-([A-Za-z0-9_]+)(?:--.+)?\.html$/
    .exec(String(name))
    ?.[1] ?? null;
}

/**
 * The image name of a render state: `default` (or null) is index.png, any
 * other state index--<state>.png — shared by renders.mjs and serve.mjs.
 */
export function renderName(state) {
  return state === null || state === undefined || state === "default"
    ? "index.png"
    : `index--${state}.png`;
}

/** A render's file under the platform root: its route folder plus its name. */
export function renderFile(path, state) {
  const name = renderName(state);
  return path ? `${path}/${name}` : name;
}

/** True when a file name is one renderName gives. */
export function isRenderName(name) {
  return /^index(--[A-Za-z0-9_-]+)?\.png$/.test(String(name));
}

/** A route folder (or a file) under the root: "orders/[id]" → <root>/orders/[id]. */
export function routeDir(root, path) {
  return join(root, ...(path ? path.split("/") : []));
}

/**
 * The shape of a folder path, its parameter names dropped: "orders/[id]" and
 * "orders/[orderId]" are both "orders/[]".
 */
export function pathShape(path) {
  return String(path)
    .split("/")
    .filter(segment => segment !== "")
    .map(segment => (PARAM_RE.test(segment) ? "[]" : segment))
    .join("/");
}

/** The shape of a route: "/orders/:id" and "/orders/{orderId}" match. */
export function routeShape(route) {
  return pathShape(routeToPath(route));
}

/**
 * True when a realpath under the root has `name` as its first segment, in any
 * case (APFS folds case).
 */
export function underReserved(root, real, name) {
  return real !== root
    && real.slice(root.length + 1).split(sep)[0].toLowerCase() === name;
}

/** Kebab-case of a screen name: "Order details" → "order-details". */
export function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A route to its directory under the root: "/" → "", "/orders/:id" →
 * "orders/[id]". `:id`, `{id}` and `[id]` all become `[id]`.
 */
export function routeToPath(route) {
  return String(route)
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(segment => segment !== "")
    .map(segment => {
      if (segment.startsWith(":") && segment.length > 1) {
        return `[${segment.slice(1)}]`;
      }
      if (/^\{[^}]+\}$/.test(segment)) {
        return `[${segment.slice(1, -1)}]`;
      }
      return segment;
    })
    .join("/");
}

/** True when a segment is the reserved one, in any case (APFS folds case). */
export function isReserved(segment) {
  return String(segment).toLowerCase() === RESERVED;
}

// Why a list of segments can name no folder, or null: a NUL or a `.` or `..`
// segment — the one rule a route's path (pathError) and a URL path
// (splitPath) share.
function segmentError(segments) {
  if (segments.some(segment => segment.includes("\0"))) {
    return "holds a NUL";
  }
  if (segments.some(segment => segment === "." || segment === "..")) {
    return "holds a . or .. segment";
  }
  return null;
}

/**
 * Why a route's `path` cannot be served, or null when it can: a `.` or `..`
 * segment, a NUL, or a first segment that is the reserved `__mockups` or
 * `__renders` — a route is served from the mockup tree and the render tree
 * alike.
 */
export function pathError(path) {
  const segments = String(path).split("/").filter(segment => segment !== "");
  const bad = segmentError(segments);
  if (bad) {
    return bad;
  }
  if (segments.length > 0 && isReserved(segments[0])) {
    return `starts with the reserved /${RESERVED}/`;
  }
  if (segments.length > 0 && segments[0].toLowerCase() === RENDERS) {
    return `starts with the reserved /${RENDERS}/`;
  }
  return null;
}

/** The path of a screen with a sample value in each parameter segment. */
export function sampleRoute(path) {
  if (!path) {
    return "/";
  }
  return "/" + path
    .split("/")
    .map(segment => (PARAM_RE.test(segment) ? "1" : segment))
    .join("/");
}

/**
 * Reads and validates `<root>/<reserved>/routes.json` — `__mockups` for a
 * mockup tree, `__renders` for a render tree; throws on any defect.
 */
export function readRoutes(root, reserved = RESERVED) {
  const file = join(root, reserved, "routes.json");
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  }
  catch (error) {
    throw new Error(`cannot read ${file}: ${error.message}`, { cause: error });
  }
  if (
    data === null
    || typeof data !== "object"
    || typeof data.project !== "string"
    || typeof data.platform !== "string"
    || !Array.isArray(data.screens)
  ) {
    throw new Error(`${file}: needs project, platform and a screens list`);
  }
  for (const [index, screen] of data.screens.entries()) {
    const ok = screen !== null
      && typeof screen === "object"
      && ["code", "screen", "slug", "flow", "route", "path"].every(key =>
        typeof screen[key] === "string"
      )
      && typeof screen.routed === "boolean"
      && (screen.overlay === undefined
        || (typeof screen.overlay === "string"
          && OVERLAY_RE.test(screen.overlay)));
    if (!ok) {
      throw new Error(`${file}: screens[${index}] is malformed`);
    }
    const bad = pathError(screen.path);
    if (bad) {
      throw new Error(`${file}: screens[${index}] path ${bad}`);
    }
  }
  return data;
}

/** The realpath of `path` when it sits under the (realpath'd) root, else null. */
export function inRoot(root, path) {
  let real;
  try {
    real = realpathSync(path);
  }
  catch {
    return null;
  }
  return real === root || real.startsWith(root + sep) ? real : null;
}

// inRoot, and never under the reserved directory, whatever its case.
function servable(root, path) {
  const real = inRoot(root, path);
  if (!real || real === root) {
    return real;
  }
  return underReserved(root, real, RESERVED) ? null : real;
}

export function isFile(path) {
  try {
    return statSync(path).isFile();
  }
  catch {
    return false;
  }
}

export function isDir(path) {
  try {
    return statSync(path).isDirectory();
  }
  catch {
    return false;
  }
}

function namesIn(dir) {
  try {
    return readdirSync(dir).sort();
  }
  catch {
    return [];
  }
}

/**
 * The state names of a page directory, from its `index--<state>.html` files —
 * or, for an overlay code, from its `index--overlay-<code>--<state>.html`.
 */
export function statesIn(dir, overlay = null) {
  const re = overlay
    ? new RegExp(`^index--overlay-${overlay}--(.+)\\.html$`)
    : /^index--(.+)\.html$/;
  return namesIn(dir)
    .map(name => re.exec(name)?.[1])
    .filter(state => state !== undefined && isState(state));
}

// Every directory the segments can reach, a static folder before a [param]
// folder at each level; a static folder only in the segment's exact case.
function* walk(root, dir, segments) {
  if (segments.length === 0) {
    yield dir;
    return;
  }
  const [segment, ...rest] = segments;
  const names = namesIn(dir);
  if (names.includes(segment)) {
    const literal = servable(root, join(dir, segment));
    if (literal && isDir(literal)) {
      yield* walk(root, literal, rest);
    }
  }
  for (const name of names) {
    if (!PARAM_RE.test(name) || name === segment) {
      continue;
    }
    const param = servable(root, join(dir, name));
    if (param && isDir(param)) {
      yield* walk(root, param, rest);
    }
  }
}

/** A URL path's decoded segments, or null for a malformed or `..` path. */
export function splitPath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  }
  catch {
    return null;
  }
  const segments = decoded.split("/").filter(segment => segment !== "");
  return segmentError(segments) ? null : segments;
}

// True when every segment is a folder or file under the root in its exact
// case, whatever the file system folds.
function exactCase(root, segments) {
  let dir = root;
  for (const segment of segments) {
    if (!namesIn(dir).includes(segment)) {
      return false;
    }
    dir = join(dir, segment);
  }
  return true;
}

/**
 * The screen of routes.json a URL path belongs to, or null. A static segment
 * outranks a [param] segment at the first place they differ, so /orders/new
 * beats /orders/[id]. An overlay screen owns no path of its own.
 */
export function findScreen(routes, urlPath) {
  const segments = Array.isArray(urlPath) ? urlPath : splitPath(urlPath);
  if (!segments) {
    return null;
  }
  let best = null;
  let bestScore = "";
  for (const screen of routes.screens) {
    if (screen.overlay !== undefined) {
      continue;
    }
    const pattern = screen.path ? screen.path.split("/") : [];
    if (pattern.length !== segments.length) {
      continue;
    }
    let score = "";
    let ok = true;
    for (const [index, part] of pattern.entries()) {
      if (part === segments[index]) {
        score += "1";
      }
      else if (!PARAM_RE.test(part)) {
        ok = false;
        break;
      }
      else {
        score += "0";
      }
    }
    if (ok && (best === null || score > bestScore)) {
      best = screen;
      bestScore = score;
    }
  }
  return best;
}

// The page of a screen (or an overlay) in its folder: the state's page; with
// no state, the placeholder when there is no page yet; with a state whose page
// is missing, the default page marked `fallback` when it exists.
function pageOf(root, dir, screen, state, overlay) {
  const name = pageName(state, overlay);
  const file = servable(root, join(dir, name));
  if (file && isFile(file)) {
    return { kind: "file", file, dir: dirname(file), screen };
  }
  if (state === null) {
    return { kind: "placeholder", screen };
  }
  const plain = servable(root, join(dir, pageName(null, overlay)));
  if (plain && isFile(plain)) {
    return {
      kind: "file",
      file: plain,
      dir: dirname(plain),
      screen,
      fallback: true,
    };
  }
  return { kind: "none", reason: `no state file ${name}` };
}

/**
 * What a GET of `urlPath` with `?state=<state>` and `?overlay=<code>` (each
 * null when absent; state `default` is the same as absent) serves:
 *   { kind: "file", file, dir, screen }  a real file under the root; screen
 *                                        is the routes.json screen the path
 *                                        belongs to (the overlay's for an
 *                                        overlay), or null. `fallback: true`
 *                                        when the state has no page and this
 *                                        is the screen's default page
 *   { kind: "placeholder", screen }      a code in routes.json with no file yet
 *   { kind: "none", reason }             nothing — a 404, a broken link
 * `/__mockups/` itself is the server's to answer; every path under it is none.
 * A path no screen owns serves a non-HTML file at that path, or a folder on
 * disk; an HTML file is served only as a screen's page, never by its name.
 */
export function matchPath(root, routes, urlPath, state, overlay = null) {
  const segments = splitPath(urlPath);
  if (!segments) {
    return { kind: "none", reason: "malformed path" };
  }
  if (segments.length > 0 && isReserved(segments[0])) {
    return { kind: "none", reason: `/${RESERVED}/ is reserved` };
  }
  if (state !== null && state !== undefined && !isState(state)) {
    return { kind: "none", reason: `malformed state ${state}` };
  }
  if (overlay !== null && overlay !== undefined && !OVERLAY_RE.test(overlay)) {
    return { kind: "none", reason: `malformed overlay ${overlay}` };
  }
  // `default` is the plain index.html, as it is the plain index.png of a render.
  const wanted = state !== null && state !== undefined && state !== "default"
    ? state
    : null;
  const screen = findScreen(routes, segments);

  if (overlay !== null && overlay !== undefined) {
    const sheet = screen
      && routes.screens.find(s =>
        s.code === overlay && s.overlay === screen.code
      );
    if (!sheet) {
      return { kind: "none", reason: `no overlay ${overlay} on this route` };
    }
    return pageOf(root, routeDir(root, screen.path), sheet, wanted, overlay);
  }

  if (
    wanted === null
    && segments.length > 0
    && !/\.html$/i.test(segments[segments.length - 1])
    && exactCase(root, segments)
  ) {
    const literal = servable(root, join(root, ...segments));
    if (literal && isFile(literal)) {
      return { kind: "file", file: literal, dir: dirname(literal), screen };
    }
  }

  // A path a screen of routes.json owns is that screen's folder or its
  // placeholder — never a [param] sibling, so a fixed route not rendered yet
  // still wins over /orders/[id].
  if (screen) {
    return pageOf(root, routeDir(root, screen.path), screen, wanted, null);
  }

  let fallback = null;
  for (const dir of walk(root, root, segments)) {
    const file = servable(root, join(dir, pageName(wanted, null)));
    if (file && isFile(file)) {
      return { kind: "file", file, dir, screen: null };
    }
    const plain = wanted !== null && servable(root, join(dir, "index.html"));
    if (fallback === null && plain && isFile(plain)) {
      fallback = {
        kind: "file",
        file: plain,
        dir,
        screen: null,
        fallback: true,
      };
    }
  }
  return fallback ?? { kind: "none", reason: "no such route" };
}

/**
 * Every mockup page — index.html or index--*.html, never another file, never
 * a folder — under the root at a path the route map no longer names, deleted;
 * an overlay page is kept only at its own screen's path. A symlink is removed,
 * never followed, so nothing outside the root is touched, and nothing under
 * the reserved folder. Returns the deleted paths, root-relative.
 */
export function prunePages(root, screens) {
  const named = new Set(
    screens.filter(s => s.overlay === undefined).map(s => s.path),
  );
  const overlays = new Set(
    screens.filter(s => s.overlay !== undefined).map(s =>
      `${s.path}\0${s.code}`
    ),
  );
  const pruned = [];
  const visit = (dir, rel) => {
    const entries = readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const at = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!(rel === "" && isReserved(entry.name))) {
          visit(join(dir, entry.name), at);
        }
        continue;
      }
      if (
        !(entry.isFile() || entry.isSymbolicLink())
        || !isPageName(entry.name)
      ) {
        continue;
      }
      const code = overlayOfPage(entry.name);
      const keep = code === null
        ? named.has(rel)
        : overlays.has(`${rel}\0${code}`);
      if (!keep) {
        rmSync(join(dir, entry.name));
        pruned.push(at);
      }
    }
  };
  visit(root, "");
  return pruned;
}
