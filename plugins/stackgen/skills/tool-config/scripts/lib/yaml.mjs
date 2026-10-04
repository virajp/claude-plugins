// A reader for the constrained YAML `.config/stackgen.yaml` is written in, and
// nothing wider: block mappings at a 2-space indent, plain, single- and
// double-quoted scalars, `true`/`false`, integers, block and flow lists of
// scalars, `#` comments and blank lines. Every other construct — anchors,
// aliases, tags, multi-line scalars, flow mappings, lists of mappings — is
// refused with the line it sits on. No YAML dependency.

/** A refusal, carrying the file it read and the 1-based line it stopped on. */
export class YamlError extends Error {
  constructor(message, { source, line }) {
    super(`${source}:${line}: ${message}`);
    this.source = source;
    this.line = line;
  }
}

// Only spaces and tabs are blanks: JS's `\s`, `.` and `trim()` treat U+2028 as
// whitespace or a line end, which would hide it from the loader's refusal.
const BLANK = /^[ \t]+|[ \t]+$/g;
const KEY = /^([A-Za-z_][A-Za-z0-9_-]*)[ \t]*:(?:[ \t]+(.*))?$/s;

/** Where a line's value starts: after `- ` for a list item, after `key: ` for a mapping. */
function valueStart(text) {
  const m = /^-[ \t]+/.exec(text)
    ?? /^[A-Za-z_][A-Za-z0-9_-]*[ \t]*:[ \t]+/.exec(text);
  return m ? m[0].length : 0;
}

/**
 * Strip a trailing ` # comment` outside quotes. A quote opens a string only as
 * the value's first character, or a flow list element's — never mid-scalar
 * (`o'neil`, `b - "c`).
 */
function stripComment(text) {
  const first = valueStart(text);
  const flow = text[first] === "[";
  let quote = null;
  let expect = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\" && quote === "\"") {
        i++;
      }
      else if (c === "'" && quote === "'" && text[i + 1] === "'") {
        i++;
      }
      else if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (expect && (c === " " || c === "\t")) {
      continue;
    }
    const opens = i === first || expect;
    expect = flow && i >= first && (c === "[" && i === first || c === ",");
    if ((c === "\"" || c === "'") && opens) {
      quote = c;
    }
    else if (c === "#" && (i === 0 || /[ \t]/.test(text[i - 1]))) {
      return text.slice(0, i);
    }
  }
  return text;
}

/** Split a flow list's body on commas outside quotes. */
function splitFlow(body, fail) {
  const parts = [];
  let quote = null;
  let start = 0;
  let expect = true;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (quote) {
      if (c === "\\" && quote === "\"") {
        i++;
      }
      else if (c === "'" && quote === "'" && body[i + 1] === "'") {
        i++;
      }
      else if (c === quote) {
        quote = null;
      }
    }
    else if (expect && (c === " " || c === "\t")) {
      continue;
    }
    else if ((c === "\"" || c === "'") && expect) {
      quote = c;
    }
    else if (c === "[" || c === "{") {
      fail("a nested flow collection is not supported");
    }
    else if (c === "]") {
      fail("an unquoted ] inside a flow list — quote the element");
    }
    else if (c === ",") {
      parts.push(body.slice(start, i));
      start = i + 1;
      expect = true;
      continue;
    }
    expect = false;
  }
  parts.push(body.slice(start));
  const items = parts.map(p => p.replace(BLANK, ""));
  if (items.length === 1 && items[0] === "") {
    return [];
  }
  if (items.some(p => p === "")) {
    fail("an empty flow list item");
  }
  return items;
}

/** A double-quoted scalar's body: only `\"` and `\\` are escapes. */
function doubleQuoted(t, fail) {
  let out = "";
  for (let i = 1; i < t.length; i++) {
    const c = t[i];
    if (c === "\"") {
      if (t.slice(i + 1).replace(BLANK, "") !== "") {
        fail("text after a closing quote");
      }
      return out;
    }
    if (c === "\\") {
      const next = t[i + 1];
      if (next !== "\"" && next !== "\\") {
        fail(`the escape \\${next ?? ""} is not supported — only \\" and \\\\`);
      }
      out += next;
      i++;
      continue;
    }
    out += c;
  }
  fail(
    "an unterminated double-quoted scalar — multi-line scalars are not supported",
  );
}

function singleQuoted(t, fail) {
  let out = "";
  for (let i = 1; i < t.length; i++) {
    if (t[i] === "'") {
      if (t[i + 1] === "'") {
        out += "'";
        i++;
        continue;
      }
      if (t.slice(i + 1).replace(BLANK, "") !== "") {
        fail("text after a closing quote");
      }
      return out;
    }
    out += t[i];
  }
  fail(
    "an unterminated single-quoted scalar — multi-line scalars are not supported",
  );
}

/** One scalar, or a flow list of scalars when `list` allows it. */
function scalar(text, fail, { list = true } = {}) {
  const t = text.replace(BLANK, "");
  if (t.startsWith("[")) {
    if (!list) {
      fail("a list inside a list is not supported");
    }
    if (!t.endsWith("]")) {
      fail(
        "an unterminated flow list — multi-line flow lists are not supported",
      );
    }
    return splitFlow(t.slice(1, -1), fail).map(p =>
      scalar(p, fail, { list: false })
    );
  }
  if (t.startsWith("\"")) {
    return doubleQuoted(t, fail);
  }
  if (t.startsWith("'")) {
    return singleQuoted(t, fail);
  }
  const refused = {
    "&": "an anchor",
    "*": "an alias",
    "!": "a tag",
    "|": "a block scalar (multi-line scalars)",
    ">": "a folded scalar (multi-line scalars)",
    "{": "a flow mapping",
    "@": "a reserved indicator (@)",
    "`": "a reserved indicator (`)",
    "%": "a directive",
  }[t[0]];
  if (refused) {
    fail(`${refused} is not supported`);
  }
  if (/:([ \t]|$)/.test(t)) {
    fail("a mapping where a scalar was expected — quote the value");
  }
  if (/^-([ \t]|$)/.test(t)) {
    fail(
      "a list item where a scalar was expected — a block list starts on the next line, indented by 2 spaces",
    );
  }
  if (/^-?\d+$/.test(t)) {
    if (/^-?0\d/.test(t) || t === "-0" || !Number.isSafeInteger(Number(t))) {
      fail(`${t} is not an exact integer — quote it to keep it a string`);
    }
    return Number(t);
  }
  if (t === "true" || t === "false") {
    return t === "true";
  }
  if (/^(true|false|yes|no|y|n|on|off|null|~)$/i.test(t)) {
    fail(`${t} is ambiguous — write true or false, or quote it as a string`);
  }
  return t;
}

/** The meaningful lines: comments and blanks dropped, indent measured. */
function prepare(text, source) {
  const out = [];
  (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text).split(/\r?\n/).forEach(
    (raw, at) => {
      const line = at + 1;
      const lead = /^[ \t]*/.exec(raw)[0];
      const body = stripComment(raw.slice(lead.length)).replace(/[ \t]+$/, "");
      if (body === "") {
        return;
      }
      if (lead.includes("\t")) {
        throw new YamlError("a tab used for indentation", { source, line });
      }
      out.push({ line, indent: lead.length, text: body });
    },
  );
  return out;
}

/**
 * Parse `text` into plain objects, arrays and scalars. `source` names the
 * file in every error.
 */
export function parseYaml(text, { source = "<yaml>" } = {}) {
  const lines = prepare(text, source);
  let i = 0;
  const failAt = line => message => {
    throw new YamlError(message, { source, line });
  };

  const isItem = l => l.text === "-" || l.text.startsWith("- ");

  function block(indent) {
    return isItem(lines[i]) ? list(indent) : mapping(indent);
  }

  function mapping(indent) {
    const out = {};
    while (i < lines.length && lines[i].indent >= indent) {
      const l = lines[i];
      const fail = failAt(l.line);
      if (l.indent > indent) {
        fail("unexpected indentation — multi-line scalars are not supported");
      }
      if (isItem(l)) {
        fail("a list item where a mapping key was expected");
      }
      if (l.text.startsWith("---") || l.text.startsWith("...")) {
        fail("a document marker is not supported");
      }
      const m = KEY.exec(l.text);
      if (!m) {
        fail(`not a key: value line: ${l.text}`);
      }
      const [, key, rest] = m;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        fail(`the key ${key} is refused`);
      }
      if (Object.hasOwn(out, key)) {
        fail(`duplicate key ${key}`);
      }
      i++;
      if (rest !== undefined && rest.replace(BLANK, "") !== "") {
        out[key] = scalar(rest, fail);
        continue;
      }
      const next = lines[i];
      if (next && next.indent === indent && isItem(next)) {
        failAt(next.line)(`indent the list under ${key} by 2 spaces`);
      }
      if (!next || next.indent <= indent) {
        fail(`${key} has no value`);
      }
      if (next.indent !== indent + 2) {
        failAt(next.line)(`indent by 2 spaces under ${key}`);
      }
      out[key] = block(indent + 2);
    }
    return out;
  }

  function list(indent) {
    const out = [];
    while (i < lines.length && lines[i].indent >= indent) {
      const l = lines[i];
      const fail = failAt(l.line);
      if (l.indent > indent) {
        fail(
          "unexpected indentation — multi-line scalars and lists of mappings are not supported",
        );
      }
      if (!isItem(l)) {
        fail("a mapping key where a list item was expected");
      }
      const item = l.text.slice(1).replace(BLANK, "");
      if (item === "") {
        fail(
          "a nested block in a list is not supported — list items are scalars",
        );
      }
      if (item === "-" || item.startsWith("- ")) {
        fail("a nested list is not supported — list items are scalars");
      }
      if (KEY.test(item) || /^("[^"]*"|'[^']*')[ \t]*:([ \t]|$)/.test(item)) {
        fail("a list of mappings is not supported — list items are scalars");
      }
      out.push(scalar(item, fail, { list: false }));
      i++;
    }
    return out;
  }

  if (lines.length === 0) {
    return {};
  }
  if (lines[0].indent !== 0) {
    failAt(lines[0].line)("the document must start at column 1");
  }
  const doc = block(0);
  if (i < lines.length) {
    failAt(lines[i].line)("unexpected indentation");
  }
  return doc;
}
