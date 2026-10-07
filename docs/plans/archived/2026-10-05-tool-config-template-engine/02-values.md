# U2 — The `stackgen.yaml` reader and the values loader

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/yaml.mjs` (new),
  `plugins/stackgen/skills/tool-config/scripts/lib/values.mjs` (new),
  `scripts/src/tool-config-values.test.ts` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs:466-661` and
  `lib/record.mjs:33-165` (the two narrow YAML readers to copy from — plan 2
  deletes both, so **copy, never import**); `lib/tools/pre-commit.mjs:680-720`
  (`forgeLinks`, the origin derivation to re-implement); `lib/run.mjs` (how the
  script shells out).
- **Lazy-load:** `scripts/src/tool-config-core.test.ts` for temp-repo helpers.

## Ruling

> D5 — `.config/stackgen.yaml` owns every value tool-config renders. Forge and
> secrets move there from `.config/vwf.yaml` (plan 3); `update_bot` retires with
> renovate; `members` is the one deliberate copy of `vwf.yaml`'s topology,
> written by init, checked by doctor (plan 3). Each repo and each member has its
> own file.

> D6 — Keys: `format` (int, 1), `repo_name`, `merge_model.develop`,
> `merge_model.main`, `members` (list), `scopes` (list), `node` (bool),
> `external` (bool), `forge`, `secrets`, `packs.<slug>.<key>`. A key maps to a
> name by upper-casing and joining nested keys with `_` (`merge_model.develop` →
> `MERGE_MODEL_DEVELOP`). A pack's template sees `packs.<slug>.*` unprefixed
> (`XCODE_VERSION`) plus the global names; a clash between the two is an error.

> D7 — `REPO_URL` (`https://<host>/<owner>/<repo>`) and `PROJECT_NAME`
> (`<owner>/<repo>`) are derived from `git remote get-url origin` at load time
> (ssh and https forms); with no `origin`, both are absent, and a template
> guards them with `@@#if REPO_URL@@`. The `…:all` subtask lists are plan 2's,
> derived from files.

> D8 — Block mappings (2-space indent), plain/single/double-quoted scalars,
> booleans `true`/`false`, integers, block lists (`- x`) and flow lists
> (`[a, b]`) of scalars, `#` comments, blank lines. Anchors, aliases, tags,
> multi-line scalars, flow mappings and lists of mappings are refused with an
> error naming the line.

> D4 (the loader's half) — the loader refuses a scalar value holding a line
> break, a control character, or a Unicode line/paragraph separator.

## Edits

1. **`lib/yaml.mjs`** — export `parseYaml(text, { source })` returning plain
   objects/arrays/scalars per D8, and `YamlError` (carries `source`, 1-based
   `line`). Double-quoted scalars honour `\"`, `\\`, `\n`-free escapes only
   (`\n` itself is refused per D4); single-quoted honour `''`. A duplicate key
   in one mapping is an error. Tabs used for indentation are an error.
2. **`lib/values.mjs`** — export:
   - `readStackgen(repoRoot)` → the parsed `.config/stackgen.yaml`, or `null`
     when absent; validates D6: unknown top-level key, wrong type, `format`
     other than `1`, `merge_model.*` other than `direct`/`pr` are errors naming
     the key.
   - `deriveOrigin(repoRoot)` → `{ REPO_URL, PROJECT_NAME }` or `{}` — runs
     `git -C <root> remote get-url origin` via `node:child_process`
     `execFileSync` (no shell); parses `git@host:owner/repo(.git)`,
     `ssh://git@host[:port]/owner/repo(.git)` and
     `https://host/owner/repo(.git)`; anything else yields `{}`.
   - `loadValues(repoRoot, { pack } = {})` → the flat name → value map: D6's
     mapping of every stored key except `packs`, plus `deriveOrigin`, plus —
     when `pack` names a slug — that pack's `packs.<slug>.*` unprefixed (a clash
     with a global name is an error). Every scalar is checked per D4.
   - `toNames(obj)` — the pure key → name mapping, exported for tests.
3. **`scripts/src/tool-config-values.test.ts`** — vitest: the reader over every
   D8 construct and every refusal (anchor, alias, tag, `|` block scalar, flow
   mapping, list of mappings, tab indent, duplicate key) with line numbers;
   `readStackgen` absent → `null`, each D6 validation error; `toNames` for
   nested keys; `loadValues` with and without `pack`, the pack clash;
   `deriveOrigin` over a temp git repo for each remote form and for no origin; a
   D4 refusal (a value holding U+2028).

## Verification

- `pnpm vitest run scripts/src/tool-config-values.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green (rule 16).
- `rg -n "schema\.mjs|record\.mjs|tools/" plugins/stackgen/skills/tool-config/scripts/lib/{yaml,values}.mjs`
  prints nothing — no import of a file plan 2 deletes.

## Guardrails

- Touch nothing outside the three owned paths — U1 owns `template.mjs`; do not
  import it.
- Zero dependencies: `node:` built-ins only; no shebang on a `lib/` module.
- Never `cat > file <<EOF` (cat is aliased to bat) — use the Write tool.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config's script reads .config/stackgen.yaml into template values`
