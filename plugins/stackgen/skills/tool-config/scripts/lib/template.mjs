// The `@@` template engine: `@@NAME@@` substitutes a value, `@@#if NAME@@ …
// @@#else@@ … @@/if@@` and `@@#each NAME@@ … @@/each@@` are blocks, and `@@.@@`
// or `@@.key@@` reads the innermost `#each` item. The delimiters are chosen to
// pass mise's Tera `{{ … }}`/`{% … %}` and bash's `${…}` through untouched.
// Strict throughout: an unknown name, a stray `@@`, an unbalanced block or an
// unsafe value is a TemplateError naming the template and the line.

/** A template fault: carries the template's `source` label and a 1-based `line`. */
export class TemplateError extends Error {
  constructor(source, line, message) {
    super(`${source}:${line}: ${message}`);
    this.name = "TemplateError";
    this.source = source;
    this.line = line;
  }
}

const REF = String.raw`[A-Z][A-Z0-9_]*|\.(?:[A-Za-z_][A-Za-z0-9_]*)?`;
const TAG = new RegExp(
  String.raw`@@(?:(#if|#each) (${REF})|(#else|\/if|\/each)|(${REF}))@@`,
  "g",
);
const BLOCK_LINE = new RegExp(
  String
    .raw`^[ \t]*@@(?:(#if|#each) (${REF})|(#else|\/if|\/each))@@[ \t]*(?:\r?\n)?$`,
);
// C0 and C1 controls (line breaks among them), DEL, and U+2028/U+2029.
const unsafe = text =>
  [...text].some(ch => {
    const code = ch.codePointAt(0);
    return code <= 0x1f
      || (code >= 0x7f && code <= 0x9f)
      || code === 0x2028
      || code === 0x2029;
  });

/** One token from a matched tag: a block tag, or a `var`. */
function tagToken(m, line) {
  if (m[1]) {
    return { type: m[1].slice(1), ref: m[2], line };
  }
  if (m[3]) {
    return { type: m[3] === "#else" ? "else" : m[3], line };
  }
  return { type: "var", ref: m[4], line };
}

/** Split the template into text and tag tokens, each with its source line. */
function tokenize(template, source) {
  const tokens = [];
  const lines = template.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  lines.forEach((text, i) => {
    const line = i + 1;
    const whole = BLOCK_LINE.exec(text);
    if (whole) {
      tokens.push(tagToken([null, whole[1], whole[2], whole[3]], line));
      return;
    }
    let at = 0;
    // Text keeps no `@@`: a malformed tag is refused here, taken branch or not.
    const pushText = piece => {
      if (piece.includes("@@")) {
        throw new TemplateError(
          source,
          line,
          "a stray @@ is left in the template",
        );
      }
      tokens.push({ type: "text", text: piece, line });
    };
    for (const m of text.matchAll(TAG)) {
      if (m.index > at) {
        pushText(text.slice(at, m.index));
      }
      tokens.push(tagToken(m, line));
      at = m.index + m[0].length;
    }
    if (at < text.length) {
      pushText(text.slice(at));
    }
  });
  return tokens;
}

/** Build the block tree; a mismatched or unbalanced tag names both lines. */
function parse(tokens, source) {
  const root = { type: "root", body: [] };
  const stack = [root];
  for (const token of tokens) {
    const top = stack.at(-1);
    const into = top.inElse ? top.elseBody : top.body;
    switch (token.type) {
      case "text":
      case "var":
        into.push(token);
        break;
      case "if":
      case "each": {
        const node = { ...token, body: [], elseBody: [], inElse: false };
        into.push(node);
        stack.push(node);
        break;
      }
      case "else":
        if (top.type !== "if" || top.inElse) {
          throw new TemplateError(
            source,
            token.line,
            top.type === "root"
              ? "@@#else@@ outside any @@#if@@"
              : `@@#else@@ does not belong to the @@#${top.type} ${top.ref}@@ opened on line ${top.line}`,
          );
        }
        top.inElse = true;
        break;
      case "/if":
      case "/each": {
        const want = token.type.slice(1);
        if (top.type !== want) {
          throw new TemplateError(
            source,
            token.line,
            top.type === "root"
              ? `@@${token.type}@@ closes nothing`
              : `@@${token.type}@@ closes the @@#${top.type} ${top.ref}@@ opened on line ${top.line}`,
          );
        }
        stack.pop();
        break;
      }
    }
  }
  if (stack.length > 1) {
    const open = stack.at(-1);
    throw new TemplateError(
      source,
      open.line,
      `@@#${open.type} ${open.ref}@@ is never closed`,
    );
  }
  return root;
}

/** Resolve a name or `.`/`.key` against the innermost item or the values. */
function lookup(ref, values, items, token, source, { missingOk = false } = {}) {
  if (ref.startsWith(".")) {
    if (items.length === 0) {
      throw new TemplateError(
        source,
        token.line,
        `@@${ref}@@ outside any @@#each@@`,
      );
    }
    const item = items.at(-1);
    if (ref === ".") {
      return item;
    }
    const key = ref.slice(1);
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new TemplateError(
        source,
        token.line,
        `@@${ref}@@ reads a field of an item that is not a mapping`,
      );
    }
    if (Object.hasOwn(item, key)) {
      return item[key];
    }
    if (missingOk) {
      return undefined;
    }
    throw new TemplateError(
      source,
      token.line,
      `the @@#each@@ item has no field ${key}`,
    );
  }
  if (Object.hasOwn(values, ref)) {
    return values[ref];
  }
  if (missingOk) {
    return undefined;
  }
  throw new TemplateError(source, token.line, `unknown name ${ref}`);
}

/** `#if` truth: boolean true, a non-empty string, a non-empty list; all else is false. */
function truthy(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "string") {
    return value.length > 0;
  }
  return value === true;
}

/** A scalar as text; refuses a list, a mapping, an unsafe character, or a value holding `@@`. */
function scalar(value, ref, token, source) {
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (typeof value !== "string") {
    const what = Array.isArray(value)
      ? "a list"
      : value === null
      ? "null"
      : "a mapping";
    throw new TemplateError(
      source,
      token.line,
      `@@${ref}@@ is ${what}, not a scalar — iterate it with @@#each@@`,
    );
  }
  if (unsafe(value)) {
    throw new TemplateError(
      source,
      token.line,
      `@@${ref}@@ holds a line break, a control character or a line/paragraph separator`,
    );
  }
  if (value.includes("@@")) {
    throw new TemplateError(
      source,
      token.line,
      `the value of ${ref} holds @@`,
    );
  }
  return value;
}

/** Append one piece; refuses a join that would spell `@@`, naming the piece's line. */
function append(out, piece, line, source) {
  if (out.text.endsWith("@") && piece.startsWith("@")) {
    throw new TemplateError(
      source,
      line,
      "an @ meets an @ here, spelling @@ in the output",
    );
  }
  out.text += piece;
}

function renderNodes(nodes, values, items, source, out) {
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        append(out, node.text, node.line, source);
        break;
      case "var":
        append(
          out,
          scalar(
            lookup(node.ref, values, items, node, source),
            node.ref,
            node,
            source,
          ),
          node.line,
          source,
        );
        break;
      case "if": {
        // A missing name is false here, so a template can guard a value that may be absent.
        const value = lookup(node.ref, values, items, node, source, {
          missingOk: true,
        });
        renderNodes(
          truthy(value) ? node.body : node.elseBody,
          values,
          items,
          source,
          out,
        );
        break;
      }
      case "each": {
        const list = lookup(node.ref, values, items, node, source);
        if (!Array.isArray(list)) {
          throw new TemplateError(
            source,
            node.line,
            `@@#each ${node.ref}@@ names a value that is not a list`,
          );
        }
        for (const item of list) {
          renderNodes(node.body, values, [...items, item], source, out);
        }
        break;
      }
    }
  }
}

/**
 * Render a template against its values.
 *
 * @param {string} template the template text
 * @param {Record<string, string | number | boolean | string[] | object[]>} values name → value
 * @param {{ source: string }} options `source` labels every error (the template's path)
 * @returns {string} the rendered text
 * @throws {TemplateError} on an unknown name, a stray `@@`, an unbalanced block or an unsafe value
 */
export function render(template, values, { source }) {
  const out = { text: "" };
  renderNodes(
    parse(tokenize(template, source), source).body,
    values,
    [],
    source,
    out,
  );
  return out.text;
}
