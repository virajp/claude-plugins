# U4 — stackgen describes mise.d and stops landing conf.d fragments

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`,
  `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/stacks/bundles/{doppler,fnox,swift-swiftui}.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `materializer.md` :110–150; `stackgen-sync/SKILL.md` :30–70,
  :200–235; `pack-format.md` :25–70, :240–280; `output-tree.md` :125–150;
  index.md's Facts.

## Ruling

> - Decision 1: Each pack keeps its mise lines in
>   `mise.d/<section>[.<env>].toml` at the pack root, outside `config/`, never
>   landed.
> - Decision 8: `stackgen-sync` never edits a mise file; a pack whose `mise.d/`
>   changed is reported with "run `/vwf:setup reshape`". The materializer no
>   longer has a `conf.d` fragment rule.
> - Decision 11: Any sentence a unit adds is short.

## Edits

1. **`materializer.md`** :116–131 — drop the `conf.d/<pack>.toml` fragment rule;
   a pack's `mise.d/` is never copied — `/vwf:init` merges it.
2. **`stackgen-sync/SKILL.md`** :58–68, :206–208 — the `machine_env` carry-over
   retires (the values live in init's blocks); a changed `mise.d/` is reported,
   not applied.
3. **`pack-format.md`** :33, :58–63, :243–274 — the `mise.d/` convention (one
   file per section and environment, what init does with it), and `machine_env`
   keys declared in `mise.d/env*.toml`.
4. **`output-tree.md`** :130, :142–146; **`stacks/readme.md`** :64, :92;
   **bundles** `doppler.md:35`, `fnox.md:48`, `swift-swiftui.md:67` — follow.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -rn "conf.d/<pack>\|conf\.d/[a-z]*\.toml" plugins/stackgen/skills plugins/stackgen/assets`
  prints nothing but history notes

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the owned paths; never a pack tree (U1's).
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: stackgen packs describe mise.d; the materializer lands no conf.d fragment`
— written by the orchestrator after the wave gate.
