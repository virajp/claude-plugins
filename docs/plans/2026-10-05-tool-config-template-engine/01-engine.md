# U1 — The `@@` template engine

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/template.mjs`
  (new), `scripts/src/tool-config-template.test.ts` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/skills/tool-config/scripts/lib/rows.mjs` and
  `lib/cli.mjs` for the house style of a `lib/` module (ESM, JSDoc, named
  exports, no shebang); `scripts/src/tool-config-core.test.ts:1-60` for how a
  suite imports a `.mjs` module.
- **Lazy-load:** `scripts/src/check.ts:270-316` (rule 16) if unsure what an
  import may name.

## Ruling

> D1 — `@@NAME@@` substitutes a value; names are `UPPER_SNAKE`
> (`[A-Z][A-Z0-9_]*`). `@@#if NAME@@ … @@#else@@ … @@/if@@` — true when the
> value is boolean `true`, a non-empty string or a non-empty list; `#else`
> optional. `@@#each NAME@@ … @@/each@@` loops a list; inside, `@@.@@` is the
> item of a list of strings, `@@.key@@` a field of a list of mappings. Blocks
> nest.

> D2 — An unknown name is an error, never an empty string. A leftover `@@` after
> rendering is an error. No escaping — `@@` never appears legitimately in a
> rendered file. An unbalanced or mismatched block tag is an error naming the
> line.

> D3 — A line holding only one block tag (`@@#if X@@`, `@@#else@@`, `@@/if@@`,
> `@@#each L@@`, `@@/each@@`), optionally indented, is removed whole, newline
> included. An inline tag removes only itself.

> D4 — Values are inserted raw; the template supplies quoting
> (`"@@REPO_NAME@@"`). The engine refuses a scalar value holding a line break, a
> control character, or a Unicode line/paragraph separator. A list or mapping
> substituted with `@@NAME@@` (not iterated) is an error.

User, verbatim: *"it's ok to build a simply template engine using delimiters
which don't conflict with `mise` template system"*.

## Edits

1. **`lib/template.mjs`** — export `render(template, values, { source })`:
   - `template` is a string; `values` a plain object of name → string | number |
     boolean | string[] | object[]; `source` a label (the template's path) used
     in every error message.
   - Returns the rendered string. Throws `TemplateError` (exported, extends
     `Error`, carries `source` and a 1-based `line`) for every D2/D4 fault.
   - Implementation: tokenize once into text, `var`, `if`, `else`, `/if`,
     `each`, `/each` tokens with their source line; build a tree with a stack
     (mismatch → error naming both lines); render recursively with a scope chain
     where `.`/`.key` resolve against the innermost `each` item and a bare
     `NAME` against `values` (a `.key` outside an `each` is an error).
   - Standalone-line rule (D3) is applied at tokenize time: when a block tag is
     the only non-whitespace on its line, the tag swallows the line's leading
     whitespace and its trailing newline.
   - After rendering, any `@@` left in the output is an error (D2) reporting the
     output line.
   - Booleans and numbers render as `true`/`false` and their decimal form.
2. **`scripts/src/tool-config-template.test.ts`** — table-driven vitest suite
   covering: plain substitution; unknown name; leftover `@@` (e.g. a typo
   `@@REPO_NAME@`); `#if` on true/false/empty string/empty list/non-empty list;
   `#else`; `#each` over strings and over mappings with `.key`; nested `#each`
   inside `#if` and `#if` inside `#each` referencing `.key`; the standalone-line
   rule (indented tag, tag at file start and end, inline tag keeps the line);
   unbalanced and mismatched tags with line numbers; a value with `\n`, `\r`,
   `\u0000` and U+2028; a list substituted as a scalar; a realistic TOML fixture
   (a mise `[env]` block with a `#each` of member aliases) rendered byte-exact;
   a template containing mise's Tera `{{ config_root }}` and bash `${HOME}`
   passes through untouched.

## Verification

- `pnpm vitest run scripts/src/tool-config-template.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green (rule 16: only `node:` or relative imports).
- `rg -n "from ['\"](?!node:|\\.)" plugins/stackgen/skills/tool-config/scripts/lib/template.mjs --pcre2`
  prints nothing.

## Guardrails

- Touch nothing outside the two owned paths — not `tool-config.mjs`, not another
  `lib/` file; U2 owns `yaml.mjs` and `values.mjs`.
- Zero dependencies: `node:` built-ins and nothing else; no shebang on a `lib/`
  module.
- Never `cat > file <<EOF` (cat is aliased to bat) — use the Write tool.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config's script gains the @@ template engine`
