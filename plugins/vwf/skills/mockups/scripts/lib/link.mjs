// The one parser of a link target, shared by serve.mjs (a request target) and
// links.mjs (an href or a form action, its character references decoded), so
// the server and the link check read a target the same way and cannot diverge:
//
//   parseTarget(raw)                    → { pathname, searchParams } | null
//   resolveTarget(root, routes, target) → the lib/routes.mjs matchPath result,
//                                         plus { state, overlay }
//
// A target is split at its first `#` and its first `?` and never resolved
// against a base, so a leading // stays a path and never becomes a host, and
// a `.` or `..` segment is never folded away — matchPath refuses it. A target
// that does not start with `/`, or whose path does not percent-decode, is
// null. The query is read as a browser sends it: a bare `&` separates two
// parameters. One `?state=` and one `?overlay=` at most; a second of either is
// a target nothing serves.
//
// Zero dependencies — node: modules only.

import { matchPath } from "./routes.mjs";

/** A target split into its path and query, or null when it is not a path. */
export function parseTarget(raw) {
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

/**
 * What the mockup tree under `root` serves for a parsed target: matchPath
 * over its path, its `?state=` and its `?overlay=`, with the state and the
 * overlay it read (each null when absent).
 */
export function resolveTarget(root, routes, target) {
  const states = target.searchParams.getAll("state");
  const overlays = target.searchParams.getAll("overlay");
  const state = states[0] ?? null;
  const overlay = overlays[0] ?? null;
  if (states.length > 1) {
    return { kind: "none", reason: "more than one state", state, overlay };
  }
  if (overlays.length > 1) {
    return { kind: "none", reason: "more than one overlay", state, overlay };
  }
  return {
    ...matchPath(root, routes, target.pathname, state, overlay),
    state,
    overlay,
  };
}
