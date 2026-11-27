# U2 — Tool-knowledge and pack text: wrong task names, the linter tool, the ruff seam, pins, the mise-skill line

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/harness.md` (the capability table, read
  only), `~/Projects/github.com/virajp/bootstrap/repo/tools/linter/tools.toml`
  and `~/Projects/github.com/virajp/bootstrap/repo/tools/python/tools.toml`
  (read only).

## Ruling

> D2 — Revised D2: `dev` and `stack:up` stay — vwf's harness contract
> (plugins/vwf/assets/harness.md, the `dev` and `local_stack` rows) owns them,
> the repo writes them, and each capability has exactly one task name; the
> text cites the harness contract as their source. `e2e:local` becomes
> `test:e2e` (the `e2e_local` capability is the `test:e2e` port) and
> `tests:unit` becomes `test`. The flutter firebase-auth text calls `stack:up`
> the harness `local_stack` task, not 'the pack's' task.

> D17 — flutter `testing.md` names `mise x -- flutter test --coverage` directly
> in place of `mise run tests:unit` (this amends D2 for `tests:unit` only). The
> bootstrap prompt of D4 asks the flutter tool to ship a `test` part.

> D7 — Its `tools:` list adds bootstrap's `linter` tool; the direct call
> becomes `mise x -- linter` (bootstrap's rule: prefix each tool call with
> `mise x --`); every `@askviraj/linter` name becomes `@virajp.dev/linter`,
> the package bootstrap's linter tool pins.

> D8 — dprint's ruff plugin formats Python, through `code:format:05-dprint`;
> ruff only lints, through `code:lint:70-ruff`. The entry ships no task.

> D9 — bootstrap owns the pins; a tool is added with `bootstrap add tool`; the
> pack text states no pin policy of its own (no 'every pin is exact', no 'a
> pin is written into the repo's config').

> D3b — Shipped skills keep their task names. The plan fixes only the wrong
> names (D2) and the stale helpers text. Shipped skills say once that the
> repo's mise skill lists every task.

> D6 — One line in each SKILL.md that lands in a repo's .claude/skills/
> (packs, tool knowledge, design tools) and names a task — 'The repo's mise
> skill, .claude/skills/mise/, lists every task.' 'Names a task' is read per
> skill folder: the SKILL.md or one of its references names a mise task; the
> line goes in that folder's SKILL.md. stackgen's own skills
> (stackgen-sync, stackgen-stack-template, stackgen-stack-menu) do not get it
> (D31).

> D4 — The units cite the skill as `.claude/skills/mise/` and assume nothing
> more about it.

## Edits

1. **`plugins/stackgen/tools/eslint/tool.yaml`** — `tools:` becomes
   `[ node, bun, linter ]`.
2. **`plugins/stackgen/tools/eslint/skills/eslint/SKILL.md`** — every
   `@askviraj/linter` (`description` at :5, :27) becomes `@virajp.dev/linter`;
   the block at :66-:73 resolves the binary with `mise x -- linter` (and its
   flags) in place of `linter="$(mise which linter --tool npm:@askviraj/linter)"`,
   and its comment says why (`mise x --` runs the pinned binary, never a
   `node_modules/.bin` copy). `tools/eslint/conventions.md`: any stale package
   name changes the same way.
3. **`plugins/stackgen/tools/ruff/conventions.md`** (the seam section, about
   :15-:25) — says D8: `mise run code:format` formats Python through dprint's
   ruff plugin (`code:format:05-dprint`), `mise run code:lint` runs ruff
   (`code:lint:70-ruff`); remove the claim that ruff itself formats under
   `code:format`.
4. **`.../github-actions/references/toolchain.md`** (about :52-:61) — keep the
   install step; replace "every pin in the config is an exact version, so the
   install needs no `--locked`" and "a pin is written into the repo's config
   and reviewed there" with D9: the pins are bootstrap's, and a tool is added
   with `bootstrap add tool`. Keep the words `never … a bare \`mise use\`` so
   checker rule 17 reads the sentence as a forbidding mention.
5. **`.../flutter/references/testing.md:100`** — `mise run tests:unit` becomes
   `mise x -- flutter test --coverage` (D17: bootstrap's flutter tool ships no
   `test` part yet, so `mise run test` runs no flutter test). The same
   sentence no longer says the command renders a per-file table and an HTML
   report (D25): it says `flutter test --coverage` writes
   `coverage/lcov.info`, and points to the lcov/genhtml section below it for
   the per-file table and the HTML report.
6. **`.../flutter/references/integrations/firebase-auth.md:47-49`** —
   `(mise run stack:up, the pack's local_stack task)` becomes the harness
   `local_stack` task `stack:up` of vwf's harness contract.
7. **fnox** (D28) — in each file that holds `e2e:local`
   (`references/contract-satisfaction.md:13-14`, and any other fnox file
   `grep -rn 'e2e:local'` finds), `e2e:local` becomes `test:e2e`.
   `references/access-shape.md:14` keeps `fnox exec -- mise run dev` and gets
   only the note that `dev` is the harness contract's task, which the repo
   writes. `references/local-stack.md:17-22` keeps `stack:up` and says once
   that it is the harness contract's `local_stack` task. `mise run setup` and
   `mise run test` stay.
8. **D6 line** — add, as its own paragraph after the skill's opening
   paragraph, exactly `The repo's mise skill, .claude/skills/mise/, lists every task.`
   to each owned `SKILL.md`: eslint, github-actions, flutter, flutter-ios,
   fnox, design-session, compose, compose ux-gate, swiftui, swiftui ux-gate,
   gcp-cloud-run, cloudflare-email, gcp-gke, android, effect, detekt, gradle,
   kotlin, ktlint, swift-format, swift, swiftlint, swiftpm, typescript,
   typescript ux-gate.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `mise run p:plugins:check` green.
- `mise x -- mise run p:plugins:inventory -- --check` green: U2 runs
  `mise x -- mise run p:plugins:inventory` after its eslint `tools:` edit and
  commits `plugins/stackgen/stacks/inventory.md` with it (D36), so the
  `plugins-inventory` pre-commit hook passes on U2's commit.
- `grep -rn 'askviraj/linter\|tests:unit\|e2e:local' plugins/stackgen` prints nothing.
- `grep -rL 'The repo.s mise skill, .claude/skills/mise/, lists every task.'`
  over the 25 owned SKILL.md files prints nothing.

## Guardrails

- Touch nothing outside the owned paths; the five packs whose tasks change
  are U1's, the generator docs are U3's, every `tool.yaml` version and
  `pack.yaml` is U6's (edit 1 changes the `tools:` list only, never the
  `version:`).
- Delete with `rm`, never `git rm`. No `git checkout`, `git restore`, and no
  formatter `--fix` outside the owned paths.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width
  by hand. A SKILL.md frontmatter is strict YAML: do not touch its shape.

## Commit

`fix(stackgen): name the tasks and tools a bootstrap-synced repo has`
