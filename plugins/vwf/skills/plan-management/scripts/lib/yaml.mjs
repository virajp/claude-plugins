// A YAML subset reader for vwf's own config files: .config/vwf.yaml, the
// registry, .claude/<adapter>/lock.yaml, .config/vwf-membership.yaml and a
// template's frontmatter.
//
// It reads block maps and lists, flow lists and maps (across lines, a
// trailing comma allowed), comments, single- and double-quoted scalars,
// multi-line plain scalars, | and > block scalars (with - or + chomping), and
// frontmatter between --- fences. A plain scalar that reads true, false,
// null, ~, an integer or a float becomes that JS value; any other is a string.
//
// It throws YamlError, carrying the 1-based line, on an anchor (&), an alias
// (*), a tag (!), a second document (--- after content), a tab used for
// indentation, a duplicate key, or a structure the subset does not know.

/** A file the subset cannot read; `line` is 1-based. */
export class YamlError extends Error {
  constructor(message, line) {
    super(`line ${line}: ${message}`);
    this.name = "YamlError";
    this.line = line;
  }
}

const INDICATOR = { "&": "an anchor", "*": "an alias", "!": "a tag" };

/** The JS value of a plain scalar. */
function plain(text) {
  if (text === "" || /^(?:null|Null|NULL|~)$/.test(text)) {
    return null;
  }
  if (/^(?:true|True|TRUE)$/.test(text)) {
    return true;
  }
  if (/^(?:false|False|FALSE)$/.test(text)) {
    return false;
  }
  if (/^[-+]?[0-9]+$/.test(text)) {
    return Number(text);
  }
  if (/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?$/.test(text)) {
    return Number(text);
  }
  return text;
}

const ESCAPES = {
  "0": "\0",
  a: "\x07",
  b: "\b",
  t: "\t",
  n: "\n",
  v: "\v",
  f: "\f",
  r: "\r",
  e: "\x1b",
  " ": " ",
  "\"": "\"",
  "/": "/",
  "\\": "\\",
  N: "\u0085",
  _: " ",
};

/**
 * A quoted scalar starting at s[k]: { value, end }, `end` the index after the
 * closing quote, or null when the quote is left open on this text.
 */
function quoted(s, k, fail) {
  const q = s[k];
  let out = "";
  let i = k + 1;
  while (i < s.length) {
    const c = s[i];
    if (q === "'") {
      if (c === "'") {
        if (s[i + 1] === "'") {
          out += "'";
          i += 2;
          continue;
        }
        return { value: out, end: i + 1 };
      }
      out += c;
      i++;
      continue;
    }
    if (c === "\"") {
      return { value: out, end: i + 1 };
    }
    if (c === "\\") {
      const e = s[i + 1];
      const width = e === "x" ? 2 : e === "u" ? 4 : e === "U" ? 8 : 0;
      if (width > 0) {
        const hex = s.slice(i + 2, i + 2 + width);
        if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(hex)) {
          fail(`a bad \\${e} escape`);
        }
        out += String.fromCodePoint(parseInt(hex, 16));
        i += 2 + width;
        continue;
      }
      if (e === undefined || !Object.hasOwn(ESCAPES, e)) {
        fail(`an unknown escape \\${e ?? ""}`);
      }
      out += ESCAPES[e];
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return null;
}

/** Whether a quote at s[i] opens a quoted token: it starts a value. */
function opensQuote(s, i) {
  let j = i - 1;
  while (j >= 0 && s[j] === " ") {
    j--;
  }
  return j < 0 || "[{,:-?".includes(s[j]);
}

/** The text before a comment: a `#` at the start or after a space, outside quotes. */
function stripComment(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q !== null) {
      if (q === "\"" && c === "\\") {
        i++;
      } else if (c === q) {
        if (q === "'" && s[i + 1] === "'") {
          i++;
        } else {
          q = null;
        }
      }
      continue;
    }
    if ((c === "\"" || c === "'") && opensQuote(s, i)) {
      q = c;
    } else if (c === "#" && (i === 0 || s[i - 1] === " " || s[i - 1] === "\t")) {
      return s.slice(0, i);
    }
  }
  return s;
}

/** Whether every [ and { in the text is closed, outside quotes. */
function balanced(s) {
  let depth = 0;
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q !== null) {
      if (q === "\"" && c === "\\") {
        i++;
      } else if (c === q) {
        q = null;
      }
      continue;
    }
    if ((c === "\"" || c === "'") && opensQuote(s, i)) {
      q = c;
    } else if (c === "[" || c === "{") {
      depth++;
    } else if (c === "]" || c === "}") {
      depth--;
    }
  }
  return depth <= 0;
}

/** A flow collection or scalar, the whole of `s`. */
function flow(s, fail) {
  let k = 0;
  const ws = () => {
    while (k < s.length && /\s/.test(s[k])) {
      k++;
    }
  };
  const token = (key) => {
    ws();
    const c = s[k];
    if (c === "\"" || c === "'") {
      const r = quoted(s, k, fail);
      if (r === null) {
        fail("a quoted scalar left open");
      }
      k = r.end;
      return r.value;
    }
    if (Object.hasOwn(INDICATOR, c)) {
      fail(`${INDICATOR[c]} (the subset reads none)`);
    }
    const start = k;
    while (k < s.length) {
      const d = s[k];
      if (d === "," || d === "]" || d === "}" || d === "[" || d === "{") {
        break;
      }
      if (d === ":" && (k + 1 >= s.length || /[\s,\]}]/.test(s[k + 1]))) {
        break;
      }
      k++;
    }
    const text = s.slice(start, k).trim();
    return key ? text : plain(text);
  };
  const node = () => {
    ws();
    const c = s[k];
    if (c === "[") {
      k++;
      const out = [];
      for (;;) {
        ws();
        if (s[k] === "]") {
          k++;
          return out;
        }
        if (k >= s.length) {
          fail("a flow list left open");
        }
        out.push(node());
        ws();
        if (s[k] === ",") {
          k++;
        } else if (s[k] !== "]") {
          fail("expected , or ] in a flow list");
        }
      }
    }
    if (c === "{") {
      k++;
      const out = {};
      for (;;) {
        ws();
        if (s[k] === "}") {
          k++;
          return out;
        }
        if (k >= s.length) {
          fail("a flow map left open");
        }
        const key = token(true);
        ws();
        if (s[k] !== ":") {
          fail("expected : after a flow map key");
        }
        k++;
        ws();
        const value = s[k] === "," || s[k] === "}" ? null : node();
        if (key === "__proto__" || Object.hasOwn(out, key)) {
          fail(`a duplicate key ${key}`);
        }
        out[key] = value;
        ws();
        if (s[k] === ",") {
          k++;
        } else if (s[k] !== "}") {
          fail("expected , or } in a flow map");
        }
      }
    }
    return token(false);
  };
  const value = node();
  ws();
  if (k < s.length) {
    fail("text after a flow collection");
  }
  return value;
}

function isSeqLine(content) {
  return content === "-" || content.startsWith("- ");
}

function indentOf(raw) {
  return raw.length - raw.trimStart().length;
}

class Parser {
  constructor(text, offset) {
    this.lines = text.replace(/\r\n?/g, "\n").split("\n");
    this.offset = offset;
    this.i = 0;
    this.started = false;
  }

  fail(message, i = this.i) {
    throw new YamlError(message, Math.min(i, this.lines.length - 1) + 1 + this.offset);
  }

  /** The index of the next significant line, from this.i; -1 at the end. */
  peek() {
    while (this.i < this.lines.length) {
      const raw = this.lines[this.i];
      const lead = raw.match(/^[ \t]*/)[0];
      const t = raw.trim();
      if (t === "" || t.startsWith("#")) {
        this.i++;
        continue;
      }
      if (lead.includes("\t")) {
        this.fail("a tab used for indentation");
      }
      if (/^---(?:\s|$)/.test(raw)) {
        if (this.started) {
          this.fail("a second document (the subset reads one)");
        }
        if (stripComment(raw.slice(3)).trim() !== "") {
          this.fail("content on the --- line");
        }
        this.i++;
        continue;
      }
      if (/^\.\.\.(?:\s|$)/.test(raw) || raw.startsWith("%")) {
        this.fail("a document marker or directive the subset does not know");
      }
      return this.i;
    }
    return -1;
  }

  document() {
    const idx = this.peek();
    if (idx < 0) {
      return null;
    }
    this.started = true;
    const value = this.node(indentOf(this.lines[idx]), -1);
    if (this.peek() >= 0) {
      this.fail("unexpected content after the top-level node");
    }
    return value;
  }

  /** The key and the text after its colon, or null when the line is no key. */
  key(content, idx) {
    const fail = (m) => this.fail(m, idx);
    const c = content[0];
    if (c === "\"" || c === "'") {
      const r = quoted(content, 0, fail);
      if (r === null) {
        return null;
      }
      const after = content.slice(r.end);
      const m = after.match(/^ *:(?: |$)/);
      return m ? { key: r.value, rest: after.slice(m[0].length) } : null;
    }
    if (c === "[" || c === "{" || c === "#") {
      return null;
    }
    if (c === "?") {
      fail("a complex key the subset does not know");
    }
    for (let j = 0; j < content.length; j++) {
      const d = content[j];
      if (d === "#" && j > 0 && content[j - 1] === " ") {
        return null;
      }
      if (d === ":" && (j + 1 === content.length || content[j + 1] === " ")) {
        const key = content.slice(0, j).trimEnd();
        if (Object.hasOwn(INDICATOR, key[0])) {
          fail(`${INDICATOR[key[0]]} (the subset reads none)`);
        }
        return { key, rest: content.slice(j + 1) };
      }
    }
    return null;
  }

  /** The node whose first line is this.i, at indent n, inside `parent`. */
  node(n, parent) {
    const idx = this.i;
    const content = this.lines[idx].slice(n);
    if (isSeqLine(content)) {
      return this.seq(n);
    }
    if (this.key(content, idx) !== null) {
      return this.map(n);
    }
    this.i = idx + 1;
    return this.inline(stripComment(content).trim(), idx, parent);
  }

  map(n) {
    const out = {};
    for (;;) {
      const idx = this.peek();
      if (idx < 0) {
        break;
      }
      const raw = this.lines[idx];
      const ind = indentOf(raw);
      if (ind < n) {
        break;
      }
      if (ind > n) {
        this.fail("unexpected indentation");
      }
      const content = raw.slice(n);
      if (isSeqLine(content)) {
        this.fail("a list item where a key was expected");
      }
      const kv = this.key(content, idx);
      if (kv === null) {
        this.fail("expected a key: value pair");
      }
      if (kv.key === "__proto__" || Object.hasOwn(out, kv.key)) {
        this.fail(`a duplicate key ${kv.key}`);
      }
      this.i = idx + 1;
      out[kv.key] = this.value(kv.rest, idx, n);
    }
    return out;
  }

  /** A map value: the text after the colon, else the lines below the key. */
  value(rest, idx, n) {
    const v = stripComment(rest).trim();
    if (v !== "") {
      return this.inline(v, idx, n);
    }
    const j = this.peek();
    if (j < 0) {
      return null;
    }
    const raw = this.lines[j];
    const ind = indentOf(raw);
    if (ind > n) {
      return this.node(ind, n);
    }
    if (ind === n && isSeqLine(raw.slice(n))) {
      return this.seq(n);
    }
    return null;
  }

  seq(n) {
    const out = [];
    for (;;) {
      const idx = this.peek();
      if (idx < 0) {
        break;
      }
      const raw = this.lines[idx];
      const ind = indentOf(raw);
      if (ind < n) {
        break;
      }
      if (ind > n) {
        this.fail("unexpected indentation");
      }
      const content = raw.slice(n);
      if (!isSeqLine(content)) {
        break;
      }
      const after = content.slice(1);
      const body = after.trimStart();
      if (stripComment(body).trim() === "") {
        this.i = idx + 1;
        const j = this.peek();
        out.push(j >= 0 && indentOf(this.lines[j]) > n ? this.node(indentOf(this.lines[j]), n) : null);
        continue;
      }
      // Read the item as if its text began a line of its own, past the dash.
      const at = n + 1 + (after.length - body.length);
      this.lines[idx] = " ".repeat(at) + body;
      this.i = idx;
      out.push(this.node(at, n));
    }
    return out;
  }

  /** A value written on the line `idx`: v is its comment-free text. */
  inline(v, idx, parent) {
    const fail = (m) => this.fail(m, idx);
    const c = v[0];
    if (Object.hasOwn(INDICATOR, c)) {
      fail(`${INDICATOR[c]} (the subset reads none)`);
    }
    if (/^[|>]/.test(v)) {
      const m = v.match(/^([|>])([-+]?)$/);
      if (m === null) {
        fail("a block scalar header the subset does not know");
      }
      return this.block(m[1], m[2], parent);
    }
    if (c === "[" || c === "{") {
      let text = v;
      while (!balanced(text)) {
        if (this.i >= this.lines.length) {
          fail("a flow collection left open");
        }
        text += ` ${stripComment(this.lines[this.i]).trim()}`;
        this.i++;
      }
      return flow(text, fail);
    }
    if (c === "\"" || c === "'") {
      const r = quoted(v, 0, fail);
      if (r === null) {
        fail("a quoted scalar left open (the subset reads one line)");
      }
      if (v.slice(r.end).trim() !== "") {
        fail("text after a quoted scalar");
      }
      return r.value;
    }
    // A plain scalar: more-indented lines below continue it.
    let text = v;
    let blanks = 0;
    let j = this.i;
    while (j < this.lines.length) {
      const raw = this.lines[j];
      const t = raw.trim();
      if (t === "") {
        blanks++;
        j++;
        continue;
      }
      if (indentOf(raw) <= parent || t.startsWith("#") || /^(?:---|\.\.\.)(?:\s|$)/.test(raw)) {
        break;
      }
      if (this.key(t, j) !== null) {
        this.fail("unexpected indentation under a plain scalar", j);
      }
      text += blanks > 0 ? "\n".repeat(blanks) : " ";
      text += stripComment(t).trim();
      blanks = 0;
      j++;
      this.i = j;
    }
    return plain(text);
  }

  block(style, chomp, parent) {
    const body = [];
    let indent = -1;
    while (this.i < this.lines.length) {
      const raw = this.lines[this.i];
      if (raw.trim() === "") {
        body.push("");
        this.i++;
        continue;
      }
      const ind = indentOf(raw);
      if (ind <= parent) {
        break;
      }
      if (indent < 0) {
        indent = ind;
      } else if (ind < indent) {
        this.fail("a block scalar line indented less than its first line");
      }
      body.push(raw.slice(indent));
      this.i++;
    }
    let trailing = 0;
    while (body.length > 0 && body[body.length - 1] === "") {
      body.pop();
      trailing++;
    }
    // Leave trailing blank lines to the reader of the next node.
    this.i -= trailing;
    let text;
    if (style === "|") {
      text = body.join("\n");
    } else {
      text = "";
      body.forEach((line, i) => {
        const prev = body[i - 1];
        if (i === 0) {
          text = line;
        } else if (line === "") {
          text += "\n";
        } else if (prev === "" || line.startsWith(" ") || prev.startsWith(" ")) {
          text += prev === "" ? line : `\n${line}`;
        } else {
          text += ` ${line}`;
        }
      });
    }
    if (body.length === 0) {
      return "";
    }
    if (chomp === "-") {
      return text;
    }
    if (chomp === "+") {
      return `${text}\n${"\n".repeat(trailing)}`;
    }
    return `${text}\n`;
  }
}

function parseAt(text, offset) {
  return new Parser(text, offset).document();
}

/** The value of a one-document YAML text in the subset; an empty text is null. */
export function parseYaml(text) {
  return parseAt(text, 0);
}

/**
 * The map between a file's first two `---` lines, or null when the file does
 * not open with one.
 */
export function parseFrontmatter(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines[0].trimEnd() !== "---") {
    return null;
  }
  const end = lines.findIndex((l, i) => i > 0 && l.trimEnd() === "---");
  if (end < 0) {
    throw new YamlError("frontmatter with no closing --- line", 1);
  }
  const value = parseAt(lines.slice(1, end).join("\n"), 1);
  if (value === null) {
    return {};
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new YamlError("frontmatter that is not a map", 2);
  }
  return value;
}
