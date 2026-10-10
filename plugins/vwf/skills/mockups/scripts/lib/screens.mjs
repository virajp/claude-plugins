// The Screens-table parse of vwf's flow platform files, shared by routes.mjs
// (the mockup route map) and renders.mjs (the render copy), so both build the
// same map from the same tables.
//
//   buildRouteMap(flowsDir, platform)
//     reads   <flowsDir>/*/<platform>.md, the first table under `## Screens`
//     returns { flows, screens, errors }
//
// `screens` is [ { code, screen, slug, flow, route, path, routed } ]. A table
// is read by its header row, by column name (Code, Screen, Route), never by
// position. The route is the first word of the Route cell that starts with
// `/` once the punctuation around it — `(`, `,`, `;`, `.` and the like — is
// dropped. A Route cell with no such word has no route: the screen gets
// `/<code>-<slug>` and `routed: false`. A row whose Code cell is a markdown
// link (`[004a](../004-checkout/mobile.md#004a)`) points at the screen's home
// flow and is not a second definition.
//
// An overlay — a Route cell holding `modal of <code>`, `dialog of <code>` or
// `sheet of <code>` — sits on its parent's route: it takes the parent's route,
// path and routed, plus `overlay: <parent code>`, and holds no route of its
// own. Its parent is a screen of the platform, in any flow, that is not an
// overlay; a route word in the cell must have the parent's route shape.
//
// `errors` lists two non-overlay codes with one route, one code twice, a route
// `pathError` refuses, and an overlay whose parent is missing, an overlay, or
// on another route; a caller writes nothing when it is not empty. A missing
// flows directory, no `<platform>.md`, or a table with no Code, Screen and
// Route columns throws.
//
// Zero dependencies — node: modules only.

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import {
  pathError,
  routeShape,
  routeToPath,
  slugify,
} from "./routes.mjs";

// The cells of one table row; `\|` is a literal pipe, backticks are dropped.
function cells(line) {
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return body
    .split(/(?<!\\)\|/)
    .map(cell => cell.replace(/\\\|/g, "|").replace(/`/g, "").trim());
}

// The rows of the first table under `## Screens`, as { code, screen, route }.
function screensOf(text, file) {
  const lines = text.split("\n");
  const heading = lines.findIndex(line => /^##\s+Screens\b/.test(line));
  if (heading === -1) {
    return [];
  }
  let at = heading + 1;
  while (at < lines.length && !lines[at].trim().startsWith("|")) {
    if (/^#{1,2}\s/.test(lines[at])) {
      return [];
    }
    at += 1;
  }
  if (at >= lines.length) {
    return [];
  }
  const header = cells(lines[at]).map(cell => cell.toLowerCase());
  const column = name => header.indexOf(name);
  const [code, screen, route] = ["code", "screen", "route"].map(column);
  if (code === -1 || screen === -1 || route === -1) {
    throw new Error(
      `${file}: the Screens table has no Code, Screen and Route columns`,
    );
  }
  const rows = [];
  for (
    at += 2;
    at < lines.length && lines[at].trim().startsWith("|");
    at += 1
  ) {
    const row = cells(lines[at]);
    const rawCode = row[code] ?? "";
    if (rawCode === "" || /\]\(/.test(rawCode)) {
      continue;
    }
    rows.push({
      code: rawCode,
      screen: row[screen] ?? "",
      route: row[route] ?? "",
    });
  }
  return rows;
}

function routeToken(cell) {
  for (const part of cell.split(/\s+/)) {
    const token = part
      .replace(/^[("'<]+/, "")
      .replace(/[,;:.!?)"'>]+$/, "");
    if (token.startsWith("/")) {
      return token.replace(/[?#].*$/, "") || "/";
    }
  }
  return null;
}

// The parent code a Route cell marks this screen an overlay of, or null.
function overlayOf(cell) {
  return /\b(?:modal|dialog|sheet)\s+of\s+([A-Za-z0-9_]+)\b/i.exec(cell)?.[1]
    ?? null;
}

/** The route map of one platform's flows; see the header. */
export function buildRouteMap(flowsDir, platform) {
  if (!existsSync(flowsDir) || !statSync(flowsDir).isDirectory()) {
    throw new Error(`no flows directory: ${flowsDir}`);
  }
  const flows = readdirSync(flowsDir)
    .filter(name => existsSync(join(flowsDir, name, `${platform}.md`)))
    .sort();
  if (flows.length === 0) {
    throw new Error(`no ${platform}.md under ${flowsDir}/*/`);
  }

  const screens = [];
  const errors = [];
  const byCode = new Map();
  const byPath = new Map();
  const overlays = [];
  for (const flow of flows) {
    const file = join(flowsDir, flow, `${platform}.md`);
    for (const row of screensOf(readFileSync(file, "utf8"), file)) {
      const slug = slugify(row.screen) || slugify(row.code);
      if (byCode.has(row.code)) {
        errors.push(
          `code ${row.code} is defined twice: ${
            byCode.get(row.code)
          } and ${flow}`,
        );
      }
      else {
        byCode.set(row.code, flow);
      }
      const token = routeToken(row.route);
      const parent = overlayOf(row.route);
      const screen = { code: row.code, screen: row.screen, slug, flow };
      screens.push(screen);
      if (parent !== null) {
        overlays.push({ screen, parent, token });
        continue;
      }
      const routed = token !== null;
      const route = routed ? token : `/${row.code}-${slug}`;
      const path = routeToPath(route);
      // APFS folds case: /Orders and /orders are one folder.
      const key = path.replace(/\[[^\]]*\]/g, "[]").toLowerCase();
      const bad = pathError(path);
      if (bad) {
        errors.push(`route ${route} of ${row.code} ${bad}`);
      }
      if (byPath.has(key)) {
        errors.push(
          `route ${route} is held by two codes: ${
            byPath.get(key)
          } and ${row.code}`,
        );
      }
      else {
        byPath.set(key, row.code);
      }
      Object.assign(screen, { route, path, routed });
    }
  }
  const parents = new Map(
    screens.filter(s => s.route !== undefined).map(s => [s.code, s]),
  );
  for (const { screen, parent, token } of overlays) {
    const home = parents.get(parent);
    if (!home) {
      errors.push(
        overlays.some(o => o.screen.code === parent)
          ? `overlay ${screen.code} names the overlay ${parent} as its parent`
          : `overlay ${screen.code} names no screen ${parent} of the platform`,
      );
      continue;
    }
    if (token !== null && routeShape(token) !== routeShape(home.route)) {
      errors.push(
        `overlay ${screen.code} route ${token} is not its parent ${parent}'s ${home.route}`,
      );
      continue;
    }
    Object.assign(screen, {
      route: home.route,
      path: home.path,
      routed: home.routed,
      overlay: parent,
    });
  }
  return { flows, screens, errors };
}
