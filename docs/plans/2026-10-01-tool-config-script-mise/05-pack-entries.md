# U5 — Pack mise entries become structured

- **Wave:** 3
- **Depends on:** U4
- **Owns:** the `tool-config:` **mise entries only** in
  `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/capability-provider/doppler/pack.yaml`,
  `plugins/stackgen/stacks/capability-provider/fnox/pack.yaml`,
  `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/pack.yaml`;
  `plugins/stackgen/assets/pack-format.md`;
  `plugins/stackgen/stacks/design-tool/claude-code/conventions.md`;
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned file whole; U1's `TC/scripts/lib/schema.mjs` (the
  entry schema).
- **Lazy-load:** `TC/references/mise.md` §4 (the verbs' meaning).

## Ruling

> D9 — A pack's `tool-config:` entry for mise becomes structured YAML, e.g.
> `- {tool: mise, verb: add-tool, name: swiftlint, version: "0.59", env: dev}`,
> validated by `check.ts` against one schema the script exports.

> D10 — Plan 1 migrates only the mise entries. The non-mise entries keep the
> string grammar until plans 2–3.

> D13 — Bare `mise use` is forbidden: a tool is entered into the config first,
> then installed with `mise install`.

## Edits

1. **The 11 mise entries** in the five `pack.yaml` files — each string such as
   `mise add tool <name> <version> to dev environment` becomes one mapping in
   the same list position, keys exactly as the schema names them:
   `{tool: mise, verb: add-tool, name: <name>, version: "<version>", env: dev|all}`;
   `{tool: mise, verb: add-env, key: <KEY>, value: "<value>", env: all}` —
   doppler's two-line entry folded into one mapping, a Tera template value kept
   verbatim inside the quoted string;
   `{tool: mise, verb: add-alias, name: <n>, command: "<cmd>"}`. Values are
   carried byte for byte. Every non-mise entry in those lists stays a string,
   untouched. Do **not** change any pack's `version:` line (U11's).
2. **`plugins/stackgen/assets/pack-format.md`** — the `tool-config:` section
   (`:245-288`): mise entries are structured mappings (show the three verb
   shapes); every other tool's entry is still a string line until plans 2–3; the
   schema lives in tool-config's script and the checker validates both.
3. **claude-code design-tool pack** — `conventions.md:66` and
   `skills/design-session/SKILL.md:216` suggest `mise use node`. Replace with:
   pin `node` in the repo's `.config/mise/conf.d/tools.toml` (exact version) and
   run `mise install` — through the repo-local mise skill where the repo has
   one. In `design-session/SKILL.md` keep the halt: if `node` is not on the
   path, say so with that remedy and halt.

## Verification

- `mise run p:plugins:check` green (U4 validates the mappings).
- `mise run p:plugins:inventory -- --check` green — the inventory renders no
  `tool-config:` entry, and no `version:` line changes here.
- `grep -rn 'mise use' plugins/stackgen/stacks plugins/stackgen/assets` prints
  only lines that forbid it.
- `grep -n -E '^\s*-\s*"?mise ' plugins/stackgen/stacks/*/*/pack.yaml` prints
  nothing.

## Guardrails

- Touch only the mise entries in the five `pack.yaml` files — never their
  `version:` line, never another entry.
- `plugins/**/*.md` is not dprint-formatted: match each file's fold width by
  hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: pack mise entries become structured tool-config mappings`
