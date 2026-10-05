// The flag grammar. Four shapes, each of which `preview` may open:
//
//   [preview] all [--repo-name <n>] [--merge-model-develop direct|pr]
//                 [--merge-model-main direct|pr] [--members <a,b>] [--scopes <a,b>]
//                 [--node true|false] [--external true|false] [--forge <f>]
//                 [--secrets <s>] [--answers <id>:<answer>,…]
//   [preview] pack --slug <s> --dir <pack dir> [--set <key>=<value>]… [--answers …]
//   [preview] pack-remove --slug <s> [--answers …]
//   [preview] upgrade [--answers …]
//
// plus the globals --repo-root and --plugin-root, anywhere. `--key=value` and
// `--key value` both read; a flag followed by another flag, or by nothing, is
// empty — save a bool flag, which reads `true`. Lists are comma-separated, no
// spaces; `--set` alone may repeat. Every value lands raw inside a quoted
// string, so each is held to a character set that cannot break the quoting.

import {
  parseAnswers,
  RefusalError,
} from "./rows.mjs";

export const COMMANDS = ["all", "pack", "pack-remove", "upgrade"];

const SURFACE =
  "the script takes all, pack, pack-remove or upgrade (each optionally after preview)";

const GLOBALS = ["repo-root", "plugin-root"];

const WORD = /^[A-Za-z0-9._-]+$/;
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const MEMBER = /^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/;
const SET_KEY = /^[a-z][a-z0-9_]*$/;

/** Slugs no pack may take: each names a folder or a task tool-config renders itself. */
export const RESERVED_SLUGS = ["all", "ai", "_base"];

const bool = (key, v) => {
  if (v === "" || v === "true") {
    return true;
  }
  if (v === "false") {
    return false;
  }
  throw new RefusalError(`--${key} must be true or false, not ${v}`);
};

const word = (key, v) => {
  if (!WORD.test(v)) {
    throw new RefusalError(
      `--${key} ${JSON.stringify(v)} must be letters, digits, ., _ or -`,
    );
  }
  return v;
};

const mergeModel = (key, v) => {
  if (v !== "direct" && v !== "pr") {
    throw new RefusalError(`--${key} must be direct or pr, not ${v}`);
  }
  return v;
};

const list = test => (key, v) => {
  if (v === "") {
    return [];
  }
  const items = v.split(",");
  for (const item of items) {
    if (
      !test.test(item) || item.split("/").some(s => s === "." || s === "..")
    ) {
      throw new RefusalError(
        `--${key}: ${JSON.stringify(item)} is not a valid entry`,
      );
    }
  }
  if (new Set(items).size !== items.length) {
    throw new RefusalError(`--${key} names an entry twice`);
  }
  return items;
};

/** `all`'s flags → the stackgen.yaml key each writes, and how its value reads. */
export const ALL_FLAGS = {
  "repo-name": ["repo_name", word],
  "merge-model-develop": ["merge_model.develop", mergeModel],
  "merge-model-main": ["merge_model.main", mergeModel],
  members: ["members", list(MEMBER)],
  scopes: ["scopes", list(WORD)],
  node: ["node", bool],
  external: ["external", bool],
  forge: ["forge", word],
  secrets: ["secrets", word],
};

const FLAGS = {
  all: Object.keys(ALL_FLAGS),
  pack: ["slug", "dir", "set"],
  "pack-remove": ["slug"],
  upgrade: [],
};

/** `--set key=value` → [key, value]; the value is held like any other. */
function setPair(text) {
  const eq = text.indexOf("=");
  const key = eq > 0 ? text.slice(0, eq) : "";
  const value = eq > 0 ? text.slice(eq + 1) : "";
  if (!SET_KEY.test(key)) {
    throw new RefusalError(
      `--set ${
        JSON.stringify(text)
      } is not <key>=<value> with a lowercase key (letters, digits, _)`,
    );
  }
  if (
    [...value].some(c => {
      const code = c.codePointAt(0);
      return code <= 0x1f
        || (code >= 0x7f && code <= 0x9f)
        || code === 0x2028
        || code === 0x2029;
    })
    || /["\\]|@@/.test(value)
  ) {
    throw new RefusalError(
      `--set ${key}: the value holds a quote, a backslash, @@ or a control character`,
    );
  }
  return [key, value];
}

/** argv (after the script) → the call: `{preview, command, flags, globals, answers}`. */
export function parseArgs(argv) {
  const args = [...argv];
  const call = {
    preview: false,
    flags: {},
    globals: {},
    answers: null,
  };
  if (args[0] === "preview") {
    call.preview = true;
    args.shift();
  }
  const head = args.shift();
  if (head === undefined || head.startsWith("--")) {
    throw new RefusalError(`name a command — ${SURFACE}`);
  }
  if (!COMMANDS.includes(head)) {
    throw new RefusalError(`${head} is retired or unknown — ${SURFACE}`);
  }
  call.command = head;
  const sets = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      throw new RefusalError(
        head === "all"
          ? `all takes no verb (${arg}) — ${SURFACE}; an exclude is a line in the repo's own part of the file`
          : `unexpected argument: ${arg}`,
      );
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
    else if (key === "answers") {
      call.answers = value;
    }
    else if (key === "for") {
      throw new RefusalError(
        `--for is retired: a pack's lines come from its templates/ — ${SURFACE}`,
      );
    }
    else if (!FLAGS[head].includes(key)) {
      const names = FLAGS[head].map(k => `--${k}`).join(", ") || "none";
      throw new RefusalError(`unknown flag --${key} — valid: ${names}`);
    }
    else if (key === "set") {
      sets.push(value);
    }
    else if (key in call.flags) {
      throw new RefusalError(`--${key} is given twice`);
    }
    else {
      call.flags[key] = value;
    }
  }

  if (call.answers !== null) {
    if (call.preview) {
      throw new RefusalError("a preview never carries --answers");
    }
    call.answers = parseAnswers(call.answers);
  }
  if (head === "all") {
    call.values = {};
    for (const [flag, value] of Object.entries(call.flags)) {
      const [key, read] = ALL_FLAGS[flag];
      call.values[key] = read(flag, value);
    }
  }
  if (head === "pack" || head === "pack-remove") {
    if (!call.flags.slug) {
      throw new RefusalError(`${head} needs --slug`);
    }
    if (RESERVED_SLUGS.includes(call.flags.slug)) {
      throw new RefusalError(
        `--slug ${call.flags.slug} is reserved — ${
          RESERVED_SLUGS.join(", ")
        } name tool-config's own folders and tasks`,
      );
    }
    if (!SLUG.test(call.flags.slug)) {
      throw new RefusalError(
        `--slug ${
          JSON.stringify(call.flags.slug)
        } is not a pack slug (lowercase letters, digits, -)`,
      );
    }
  }
  if (head === "pack") {
    if (!call.flags.dir) {
      throw new RefusalError("pack needs --dir <the pack's folder>");
    }
    call.sets = {};
    for (const text of sets) {
      const [key, value] = setPair(text);
      if (key in call.sets) {
        throw new RefusalError(`--set ${key} is given twice`);
      }
      call.sets[key] = value;
    }
  }
  return call;
}
