# U1 — the Flutter template covers `auto`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`,
  `plugins/vwf/skills/architecture/references/platforms.md`,
  `plugins/vwf/agents/architecture-writer.md`,
  `plugins/vwf/skills/setup/references/topology-detection.md`,
  `plugins/vwf/assets/topologies/repo.md`,
  `plugins/vwf/assets/templates/registry.yaml`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (the version and pin
  rules, `:153`, `:260-266`);
  `plugins/vwf/skills/doctor/references/stack-checks.md:190-193` (the coverage
  check this unit satisfies — read, never edit).

## Ruling

Decision 1: "The flutter pack bumps `0.2.0` → `0.3.0`; the `dart-flutter` bundle
re-pins `app-framework/flutter@0.3.0`; the orchestrator regenerates
`inventory.md` into U1's commit so pack, pin and inventory land together."

Decision 2: "`auto` is only ever declared **alongside** `mobile`, never alone,
and never as its own project" is prose in two places: the `dart-flutter` bundle
body (which says *why* — in-car is not a fifth build target but the same mobile
binary reaching CarPlay / Android Auto through the `swift` and `kotlin` platform
edge the pack already declares) and vwf's `platforms.md` vocabulary rule. No
doctor predicate."

From the request: "Add `auto` to the bundle and the pack, and rewrite the prose
so it says *why* Flutter covers it: in-car is not a fifth Flutter build target;
it is the same mobile binary reaching CarPlay / Android Auto through the native
edge the pack **already declares** — the `kotlin` and `swift` `platform-edge`
languages in `pack.yaml` (CarPlay templates are Swift under `ios/Runner/`,
Android Auto is Kotlin via a MethodChannel). … Do **not** create a separate
bundle."

## Edits

1. **`plugins/stackgen/stacks/app-framework/flutter/pack.yaml`** — `version:`
   `0.2.0` → `0.3.0` (`:4`). `platforms:` (`:9`) becomes
   `[ mobile, tablet, desktop, webapp, auto ]`. The `summary:` (`:2-3`) stops
   counting: replace "one codebase across mobile, tablet, desktop and web" with
   a phrase that names the five surfaces and the in-car route, e.g. "one
   codebase across mobile, tablet, desktop and web, and in-car through the
   native edge". Do not touch the `platform-edge` language entries (`:19-39`).
2. **`plugins/stackgen/stacks/bundles/dart-flutter.md`** — pin (`:6`)
   `app-framework/flutter@0.2.0` → `@0.3.0`. Frontmatter `platforms:` (`:9-13`)
   gains `auto` as the last entry. Heading (`:16`) becomes
   `# mobile · tablet · desktop · webapp · auto — Dart · Flutter`. The paragraph
   at `:22-24` ("**One template, four platforms.** Flutter builds phone, tablet,
   desktop and web …") is rewritten: five platforms; then a new short paragraph
   stating (a) `auto` is not a fifth Flutter build target — the in-car surface
   is the same mobile binary reaching CarPlay and Android Auto through the
   `swift` and `kotlin` platform-edge languages this pack already declares
   (CarPlay templates are Swift under `ios/Runner/`, Android Auto is Kotlin via
   a MethodChannel); (b) therefore `auto` is only ever declared **alongside**
   `mobile`, never alone, and never as its own project. Match the surrounding
   fold width by hand — `plugins/**/*.md` is not dprint-formatted.
3. **`plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/pick-and-trade.md`**
   — `:6` "mobile, tablet, desktop and web from one codebase" → name the five,
   the fifth as "in-car (`auto`) through the native edge".
4. **`plugins/vwf/skills/architecture/references/platforms.md`** — inside the
   `auto` rule (`:33-40`, "Ask once per project whether the app must run in-car
   …"), add the pairing rule in one sentence: `auto` is offered only to a
   project that already declares `mobile`, is declared alongside it, never
   alone, and never as its own project — the in-car surface rides the mobile
   binary. Name no technology (rule 10: vwf is technology-free) — no "Flutter",
   "Swift", "Kotlin", "CarPlay templates". `:25` "not four projects" → "not five
   projects"; the bracketed list gains `auto`.
5. **`plugins/vwf/agents/architecture-writer.md`** — `:116-117` "phone, tablet,
   desktop and web" / "`[mobile, tablet, desktop, webapp]` — never four": the
   list gains `auto`, "four" → "five". Keep it technology-free.
6. **`plugins/vwf/skills/setup/references/topology-detection.md`** — `:99` "one
   project with four platforms" → five, list gains `auto`. Edit this line only;
   the rest of the file is another plan's shape.
7. **`plugins/vwf/assets/topologies/repo.md`** — `:30` "mobile, desktop and web
   … four platforms" → five, naming `auto`.
8. **`plugins/vwf/assets/templates/registry.yaml`** — `:45` "one project with
   four platforms" → five; the example list gains `auto`.

Do **not** edit `plugins/stackgen/stacks/inventory.md` — the orchestrator
regenerates it with `mise run p:plugins:inventory` before committing this unit.
Do **not** edit `plugins/vwf/assets/vwf-config.md:74` — U4 owns that file and
carries the same `auto` edit for its comment.

## Verification

- `command grep -rn "auto" plugins/stackgen/stacks/bundles/dart-flutter.md plugins/stackgen/stacks/app-framework/flutter/pack.yaml`
  returns the frontmatter list, the pack list and the prose.
- `command grep -rn "four platforms\|mobile, tablet, desktop and web\|phone, tablet, desktop and web\|flutter@0.2.0" plugins/`
  returns nothing outside `plugins/vwf/assets/vwf-config.md` (U4's).
- `mise run p:plugins:check` green (rule 10 — no technology name entered a vwf
  file; rule 4 — the bundle frontmatter still parses as strict YAML).
- After the orchestrator regenerates: `mise run p:plugins:inventory --check`
  green and the inventory's flutter row reads `0.3.0`.

## Guardrails

- Do not touch `plugins/vwf/assets/vwf-config.md` (U4),
  `plugins/vwf/skills/setup/SKILL.md` or `onboard-pipeline.md` (U5),
  `plugins/vwf/skills/doctor/**` (U7), or any file under `site/`, `.claude/`,
  `readme.md`, `CLAUDE.md` (U8).
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- Strict-YAML frontmatter: a tab, a stray colon or an unquoted `#` in the bundle
  frontmatter drops the bundle silently. Re-read the frontmatter after editing.
- `plugins/**/*.md` is not dprint-formatted — fold by hand to match the
  surrounding width; do not reflow untouched paragraphs.

## Commit

`feat: the flutter template covers auto — pack 0.3.0, bundle re-pinned` —
written by the orchestrator after the wave gate and after it regenerates
`inventory.md`, not by the unit. This repo's convention file allows bare
`ops docs merge feat fix refactor`; no scope.
