// The dot path of plan.mjs.
//
// A path is dot-separated keys. A segment that follows a list chooses the
// entry whose `id` equals the segment — `units.U3.status`, `gaps.G2.state`,
// `plans.2026-10-24-x.status`. A wrong id is an error, never a new entry.

/** A path the document cannot answer; `code` is the exit code it earns. */
export class PathError extends Error {
  constructor(message, code = 2) {
    super(message);
    this.code = code;
  }
}

export function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** The segments of a dot path; an empty path is the whole document. */
export function split(path) {
  if (path === undefined || path === "") {
    return [];
  }
  const segments = path.split(".");
  if (segments.some(s => s === "")) {
    throw new PathError("a path segment is empty");
  }
  return segments;
}

function entry(list, id) {
  return list.findIndex(e => isObject(e) && e.id === id);
}

function step(node, segment) {
  if (Array.isArray(node)) {
    const i = entry(node, segment);
    if (i < 0) {
      throw new PathError(`no entry with id ${segment}`);
    }
    return node[i];
  }
  if (isObject(node)) {
    if (!Object.hasOwn(node, segment)) {
      throw new PathError(`no key ${segment}`);
    }
    return node[segment];
  }
  throw new PathError(`cannot step into a ${typeof node} at ${segment}`);
}

/** The value at the path. */
export function get(doc, segments) {
  let node = doc;
  for (const segment of segments) {
    node = step(node, segment);
  }
  return node;
}

/**
 * Set the value at the path. A missing last key on an object is created, at
 * the end of the object; a missing list entry or a missing key on the way is
 * an error.
 */
export function set(doc, segments, value) {
  if (segments.length === 0) {
    throw new PathError("set needs a path");
  }
  const parent = get(doc, segments.slice(0, -1));
  const last = segments[segments.length - 1];
  if (Array.isArray(parent)) {
    const i = entry(parent, last);
    if (i < 0) {
      throw new PathError(`no entry with id ${last}`);
    }
    parent[i] = value;
    return;
  }
  if (isObject(parent)) {
    parent[last] = value;
    return;
  }
  throw new PathError(`cannot set a key on a ${typeof parent}`);
}

/**
 * Add one entry to the list at the path. An object entry must carry an `id`
 * the list does not hold.
 */
export function append(doc, segments, value) {
  const list = get(doc, segments);
  if (!Array.isArray(list)) {
    throw new PathError("append needs a path to a list");
  }
  if (isObject(value)) {
    if (typeof value.id !== "string" || value.id === "") {
      throw new PathError("an object entry needs an id", 1);
    }
    if (entry(list, value.id) >= 0) {
      throw new PathError(`the list already holds id ${value.id}`, 1);
    }
  }
  list.push(value);
}

/**
 * Remove one list entry, chosen by the `id` the last segment names. Only a
 * list entry can be removed; a key of an object cannot.
 */
export function remove(doc, segments) {
  if (segments.length === 0) {
    throw new PathError("remove needs a path");
  }
  const list = get(doc, segments.slice(0, -1));
  if (!Array.isArray(list)) {
    throw new PathError("remove needs a path to a list entry");
  }
  const last = segments[segments.length - 1];
  const i = entry(list, last);
  if (i < 0) {
    throw new PathError(`no entry with id ${last}`);
  }
  list.splice(i, 1);
}
