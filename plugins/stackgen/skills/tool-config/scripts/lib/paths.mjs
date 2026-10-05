// The path and hash helpers every module shares: a repo-relative path is held
// to checkRelPath before the script reads, writes or deletes through it.

import { createHash } from "node:crypto";

export const sha256 = text => createHash("sha256").update(text).digest("hex");

/** A path the script refuses to act on. */
export class UnsafePathError extends Error {}

/** Refuse a path that is absolute, empty, or holds a `..` segment. */
export function checkRelPath(path) {
  if (
    typeof path !== "string"
    || path === ""
    || path.startsWith("/")
    || /^[A-Za-z]:/.test(path)
    || path.includes("\\")
    || path.split("/").some(seg => seg === "..")
  ) {
    throw new UnsafePathError(
      `${JSON.stringify(path)} is not a repo-relative path — refused`,
    );
  }
  return path;
}

export function splitLines(text) {
  const lines = text.split("\n");
  const eol = lines.at(-1) === "";
  if (eol) {
    lines.pop();
  }
  return { lines, eol };
}

export function joinLines(lines, eol = true) {
  if (lines.length === 0) {
    return "";
  }
  return lines.join("\n") + (eol ? "\n" : "");
}
