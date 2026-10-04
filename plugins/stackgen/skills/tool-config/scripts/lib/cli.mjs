// The flag grammar. Five shapes, each of which `preview` may open:
//
//   [preview] <tool> <verb> [--<key> <value>]… [--for <requester>] [--answers <id>:<answer>,…]
//   [preview] <tool> [--<all key> <value>]…   [--answers …]   one tool's base, as `all` lands it
//   [preview] all [--<all key> <value>]…      [--answers …]
//   [preview] all <verb> [--<key> <value>]… [--for <requester>] [--answers …]   a cross-tool verb
//   [preview] apply-entries --pack <slug> --file <pack.yaml> [--answers …]
//   check [<tool>]
//
// plus the globals --repo-root and --plugin-root, anywhere. `--key=value` and
// `--key value` both read; a flag followed by another flag, or by nothing, is
// empty — save a `bool` flag, which reads `true`. Lists are comma-separated,
// no spaces. The gate tools' and `all`'s verb flags are schema.mjs's GATE_VERBS.

import {
  parseAnswers,
  RefusalError,
} from "./rows.mjs";
import {
  FLAG_TYPES,
  isBasicString,
  isControl,
  PATTERNS,
} from "./schema.mjs";

/** `all`'s keys, as flags — SKILL.md's Arguments table. */
export const ALL_KEYS = [
  "repo",
  "members",
  "linkage",
  "merge-model-develop",
  "merge-model-main",
  "runtimes",
  "forge",
  "secrets",
  "update-bot",
  "scopes",
];

const GLOBALS = ["repo-root", "plugin-root"];

/** argv (after the script) → the call, unvalidated against any tool's verbs. */
export function parseArgs(argv) {
  const args = [...argv];
  const call = {
    preview: false,
    flags: {},
    globals: {},
    for: null,
    answers: null,
  };
  if (args[0] === "preview") {
    call.preview = true;
    args.shift();
  }
  const head = args.shift();
  if (head === undefined || head.startsWith("--")) {
    throw new RefusalError("name a tool, all, check or apply-entries");
  }
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    let key = arg.slice(2);
    let value;
    const eq = key.indexOf("=");
    if (eq >= 0) {
      value = key.slice(eq + 1);
      key = key.slice(0, eq);
    }
    else if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
      value = args[++i];
    }
    else {
      value = "";
    }
    if (!/^[a-z][a-z0-9-]*$/.test(key)) {
      throw new RefusalError(`not a flag: ${arg}`);
    }
    if (GLOBALS.includes(key)) {
      call.globals[key] = value;
    }
    else if (key === "for") {
      call.for = value;
    }
    else if (key === "answers") {
      call.answers = value;
    }
    else if (key in call.flags) {
      throw new RefusalError(`--${key} is given twice`);
    }
    else {
      call.flags[key] = value;
    }
  }

  if (head === "all" && positional.length) {
    // `all <verb>`: the cross-tool verbs, the tool module registered as `all`
    call.command = "tool";
    call.tool = "all";
    call.verb = positional.shift();
  }
  else if (head === "all" || head === "apply-entries") {
    call.command = head;
  }
  else if (head === "check") {
    call.command = "check";
    call.tool = positional.shift() ?? null;
  }
  else {
    call.command = "tool";
    call.tool = head;
    call.verb = positional.length ? positional.shift() : "all";
  }
  if (positional.length) {
    throw new RefusalError(`unexpected argument: ${positional[0]}`);
  }

  if (call.answers !== null) {
    if (call.preview) {
      throw new RefusalError("a preview never carries --answers");
    }
    if (call.command === "check") {
      throw new RefusalError("check writes nothing and takes no --answers");
    }
    call.answers = parseAnswers(call.answers);
  }
  if (call.command === "check") {
    if (call.preview) {
      throw new RefusalError("check is a preview already — drop preview");
    }
    refuseUnknown(call.flags, []);
  }
  if (call.for !== null) {
    if (call.command !== "tool" || call.verb === "all") {
      throw new RefusalError(
        `--for names whose lines a verb writes; ${head} takes none`,
      );
    }
    if (!PATTERNS.requester.test(call.for)) {
      throw new RefusalError(
        `--for ${
          JSON.stringify(call.for)
        } is not a requester slug (lowercase letters, digits, -)`,
      );
    }
  }
  if (
    call.command === "all" || (call.command === "tool" && call.verb === "all")
  ) {
    refuseUnknown(call.flags, ALL_KEYS);
  }
  if (call.command === "apply-entries") {
    refuseUnknown(call.flags, ["pack", "file"]);
    for (const key of ["pack", "file"]) {
      if (!call.flags[key]) {
        throw new RefusalError(`apply-entries needs --${key}`);
      }
    }
    if (!PATTERNS.requester.test(call.flags.pack)) {
      throw new RefusalError(`--pack ${call.flags.pack} is not a slug`);
    }
  }
  return call;
}

function refuseUnknown(flags, valid) {
  for (const key of Object.keys(flags)) {
    if (!valid.includes(key)) {
      const names = valid.length ? valid.map(k => `--${k}`).join(", ") : "none";
      throw new RefusalError(`unknown flag --${key} — valid: ${names}`);
    }
  }
}

// --- values ----------------------------------------------------------------------

const NAMED = {
  "\b": "\\b",
  "\t": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  "\"": "\\\"",
  "\\": "\\\\",
};

/**
 * A value as a TOML basic string. Given quoted, it must parse as one and is
 * written verbatim; given bare it is raw, and `\`, `"` and every control
 * character are escaped.
 */
export function tomlString(value) {
  if (value.startsWith("\"")) {
    if (!isBasicString(value)) {
      throw new RefusalError(`${value} does not parse as a TOML basic string`);
    }
    return value;
  }
  const escaped = [...value]
    .map(c =>
      NAMED[c]
        ?? (isControl(c)
          ? `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`
          : c)
    )
    .join("");
  return `"${escaped}"`;
}

const TYPES = {
  string: () => null,
  envKey: v => (PATTERNS.envKey.test(v)
    ? null
    : "is not an env key ([A-Za-z_][A-Za-z0-9_]*)"),
  aliasName: v => (PATTERNS.aliasName.test(v)
    ? null
    : "is not an alias name ([A-Za-z_][A-Za-z0-9_-]*)"),
  toolName: v => (PATTERNS.toolName.test(v)
    ? null
    : "is not a tool name (letters, digits and : / . - _ @)"),
  requester:
    v => (PATTERNS.requester.test(v) ? null : "is not a requester slug"),
  value: v => {
    try {
      tomlString(v);
      return null;
    }
    catch (e) {
      return e.message;
    }
  },
  ...FLAG_TYPES,
};

/**
 * Hold a call's flags to its verb's spec, refusing the whole call on the first
 * fault: `{flags: {<name>: {type, required, values, template, default}},
 * requester, check?}`. `template: "own"` allows `{{`, `{%`, `{#` only on a
 * call carrying --for — a pack's own shipped line; every other value refuses
 * one. A `bool` flag given bare reads `true`; `check(flags)` returns the
 * cross-flag faults, the first refusing the call.
 */
export function validateCall(call, spec, tool) {
  const flags = spec.flags ?? {};
  for (const key of Object.keys(call.flags)) {
    if (!(key in flags)) {
      const names = Object.keys(flags).map(k => `--${k}`).join(", ") || "none";
      throw new RefusalError(
        `${tool} ${call.verb} takes no --${key} — valid: ${names}`,
      );
    }
  }
  for (const [key, f] of Object.entries(flags)) {
    if (f.type === "bool" && call.flags[key] === "") {
      call.flags[key] = "true";
    }
    const value = call.flags[key];
    if (value === undefined || value === "") {
      if (f.required) {
        throw new RefusalError(`${tool} ${call.verb} needs --${key}`);
      }
      if (value === undefined && f.default !== undefined) {
        call.flags[key] = f.default;
      }
      continue;
    }
    if (f.values && !f.values.includes(value)) {
      throw new RefusalError(
        `--${key} must be one of ${f.values.join(", ")}, not ${value}`,
      );
    }
    const fault = TYPES[f.type ?? "string"](value);
    if (fault) {
      throw new RefusalError(`--${key} ${JSON.stringify(value)} ${fault}`);
    }
    if (PATTERNS.template.test(value) && !(f.template === "own" && call.for)) {
      throw new RefusalError(
        `--${key} holds a template ({{, {% or {#) — legal only in a pack's own line (--for); mise renders every env value on every load`,
      );
    }
  }
  const [fault] = spec.check?.(call.flags) ?? [];
  if (fault) {
    throw new RefusalError(`${tool} ${call.verb}: ${fault}`);
  }
  if (spec.requester === "required" && !call.for) {
    throw new RefusalError(`${tool} ${call.verb} needs --for <requester>`);
  }
  if (spec.requester === "forbidden" && call.for) {
    throw new RefusalError(`${tool} ${call.verb} takes no --for`);
  }
}
