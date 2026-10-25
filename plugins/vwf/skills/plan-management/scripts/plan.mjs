#!/usr/bin/env node
// Read, write and validate the two JSON plan files: a plan folder's
// index.json and the plan index, docs/plans/index.json.
//
//   node plan.mjs get <file> [<path>] [--raw]
//   node plan.mjs set <file> <path> <value> [--json]
//   node plan.mjs append <file> <path> --json <value>
//   node plan.mjs remove <file> <path>
//   node plan.mjs validate <file>
//
// `get` prints the value at the path as JSON; --raw prints a string without
// quotes; no path prints the whole file. Its <file> may be `-`, which reads
// the JSON from stdin.
//
// Arguments are taken by position, so a <value> may be any string, one that
// starts with `--` included; a flag counts only where a usage line puts it.
//
// `set` sets one field: the value is a string, or JSON with --json. A missing
// key on an object is created, at the end of the object; a list entry must
// already exist. `append` adds one entry to the list at the path; an object
// entry must carry an `id` the list does not hold. `remove` deletes the one
// list entry the path names by its `id`; it never removes a key of an object.
//
// `set` of `units.<id>.status`, `waves.<id>.status`, `stages.<name>.state` or
// a plan index row's `status` stamps that entry's `started`/`ended` in the
// same write: running/RUNNING sets `started` if it is "" and clears `ended`;
// a final status (COMPLETE on a row) sets `ended`; APPROVED clears both;
// pending changes nothing. The time is PLAN_NOW if set, else now, as
// `new Date().toISOString()` prints it.
//
// A path is dot-separated keys. A segment that follows a list chooses the
// entry whose `id` equals the segment — `units.U3.status`, `gaps.G2.state`,
// `plans.2026-10-24-x.status`, `consent.lsp.dart`. A wrong id is an error,
// never a new entry.
//
// `validate` examines the file against its schema: a path ending in
// docs/plans/index.json is the plan index, any other is a plan folder's file.
// `set`, `append` and `remove` validate the result before they write, then
// write a temporary file in the same directory and rename it over the
// original, so an error leaves the file as it was. A write is JSON.stringify(value,
// null, 2) plus one newline, in the file's own key order.
//
// Exit 0 on success. Exit 1 on a validation error, one finding per line on
// stderr as `<file>: <path>: <message>`. Exit 2 on a usage error, a path the
// file cannot answer, or a missing or unparsable file.

import {
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  join,
} from "node:path";
import {
  append,
  get,
  isObject,
  PathError,
  remove,
  set,
  split,
} from "./lib/path.mjs";
import {
  isPlanIndex,
  validate,
} from "./lib/schema.mjs";

const USAGE = `usage:
  plan.mjs get <file> [<path>] [--raw]
  plan.mjs set <file> <path> <value> [--json]
  plan.mjs append <file> <path> --json <value>
  plan.mjs remove <file> <path>
  plan.mjs validate <file>
`;

function usage(message) {
  process.stderr.write(`plan.mjs: ${message}\n${USAGE}`);
  process.exit(2);
}

function fail(file, path, message, code) {
  process.stderr.write(`${file}: ${path || "(file)"}: ${message}\n`);
  process.exit(code);
}

function load(file) {
  let text;
  try {
    text = readFileSync(file === "-" ? 0 : file, "utf8");
  }
  catch (e) {
    fail(file, "", `cannot read the file (${e.code ?? e.message})`, 2);
  }
  try {
    return JSON.parse(text);
  }
  catch (e) {
    fail(file, "", `not valid JSON (${e.message})`, 2);
  }
}

function report(file, findings) {
  for (const f of findings) {
    process.stderr.write(`${file}: ${f.path}: ${f.message}\n`);
  }
  process.exit(1);
}

function write(file, doc) {
  const findings = validate(file, doc);
  if (findings.length > 0) {
    report(file, findings);
  }
  const tmp = join(dirname(file), `.${basename(file)}.${process.pid}.tmp`);
  try {
    writeFileSync(tmp, `${JSON.stringify(doc, null, 2)}\n`);
    renameSync(tmp, file);
  }
  catch (e) {
    rmSync(tmp, { force: true });
    fail(file, "", `cannot write the file (${e.code ?? e.message})`, 2);
  }
}

const FINAL = ["green", "failed", "unresolved", "skipped"];

// The `started`/`ended` stamp a `set` of a status path earns, in place on
// the entry the path names; any other path is left alone.
function stamp(file, doc, segments, value) {
  if (segments.length !== 3 || typeof value !== "string") {
    return;
  }
  const [list, , key] = segments;
  const onIndex = isPlanIndex(file);
  const known = onIndex
    ? list === "plans" && key === "status"
    : ((list === "units" || list === "waves") && key === "status")
      || (list === "stages" && key === "state");
  if (!known) {
    return;
  }
  const entry = get(doc, segments.slice(0, 2));
  if (!isObject(entry)) {
    return;
  }
  const now = process.env.PLAN_NOW || new Date().toISOString();
  if (value === "running" || value === "RUNNING") {
    if (!entry.started) {
      entry.started = now;
    }
    entry.ended = "";
  }
  else if (onIndex ? value === "COMPLETE" : FINAL.includes(value)) {
    entry.ended = now;
  }
  else if (onIndex && value === "APPROVED") {
    entry.started = "";
    entry.ended = "";
  }
}

function parseValue(file, path, raw, json) {
  if (!json) {
    return raw;
  }
  try {
    return JSON.parse(raw);
  }
  catch (e) {
    fail(file, path, `the --json value is not valid JSON (${e.message})`, 2);
  }
}

function at(file, path, action) {
  try {
    return action();
  }
  catch (e) {
    if (e instanceof PathError) {
      fail(file, path, e.message, e.code);
    }
    throw e;
  }
}

// Arguments are taken by position: a value is never read as a flag, so it
// may be any string, one starting with `--` included. A flag is recognised
// only where the verb's usage line puts one.
function parseArgs(verb, rest) {
  const flags = new Set();
  const flagsIn = (tokens, allowed) => {
    for (const t of tokens) {
      if (t !== allowed) {
        usage(
          t.startsWith("--")
            ? `${verb} takes no ${t}`
            : `${verb} takes too many arguments`,
        );
      }
      flags.add(t);
    }
  };
  switch (verb) {
    case "get": {
      const args = rest.filter(a => a !== "--raw");
      if (rest.length > args.length) {
        flags.add("--raw");
      }
      const unknown = args.find(a => a.startsWith("--"));
      if (unknown !== undefined) {
        usage(`get takes no ${unknown}`);
      }
      return { args, flags };
    }
    case "set":
      flagsIn(rest.slice(3), "--json");
      return { args: rest.slice(0, 3), flags };
    case "append":
      if (rest.length !== 4 || rest[2] !== "--json") {
        usage("append takes a file, a path and --json <value>");
      }
      flags.add("--json");
      return { args: [rest[0], rest[1], rest[3]], flags };
    case "remove":
      flagsIn(rest.slice(2), undefined);
      return { args: rest.slice(0, 2), flags };
    case "validate":
      flagsIn(rest.slice(1), undefined);
      return { args: rest.slice(0, 1), flags };
    default:
      usage(verb === undefined ? "no verb" : `unknown verb ${verb}`);
  }
}

const [verb, ...rest] = process.argv.slice(2);
const { args, flags } = parseArgs(verb, rest);
const file = args[0];
if (file === undefined) {
  usage(`${verb} needs a file`);
}
if (file.startsWith("--")) {
  usage(`${verb} takes no ${file}`);
}
if (file === "-" && verb !== "get") {
  usage(`only get reads stdin; ${verb} needs a file path`);
}

switch (verb) {
  case "get": {
    if (args.length > 2) {
      usage("get takes a file and at most one path");
    }
    const path = args[1] ?? "";
    const doc = load(file);
    const value = at(file, path, () => get(doc, split(path)));
    process.stdout.write(
      flags.has("--raw") && typeof value === "string"
        ? `${value}\n`
        : `${JSON.stringify(value, null, 2)}\n`,
    );
    break;
  }
  case "set": {
    if (args.length !== 3) {
      usage("set takes a file, a path and a value");
    }
    const [, path, raw] = args;
    const doc = load(file);
    const value = parseValue(file, path, raw, flags.has("--json"));
    at(file, path, () => {
      set(doc, split(path), value);
      stamp(file, doc, split(path), value);
    });
    write(file, doc);
    break;
  }
  case "append": {
    if (args.length !== 3 || !flags.has("--json")) {
      usage("append takes a file, a path and --json <value>");
    }
    const [, path, raw] = args;
    const doc = load(file);
    const value = parseValue(file, path, raw, true);
    at(file, path, () => append(doc, split(path), value));
    write(file, doc);
    break;
  }
  case "remove": {
    if (args.length !== 2) {
      usage("remove takes a file and a path");
    }
    const [, path] = args;
    const doc = load(file);
    at(file, path, () => remove(doc, split(path)));
    write(file, doc);
    break;
  }
  case "validate": {
    if (args.length !== 1) {
      usage("validate takes one file");
    }
    const findings = validate(file, load(file));
    if (findings.length > 0) {
      report(file, findings);
    }
    process.stdout.write(`${file}: valid\n`);
    break;
  }
}
