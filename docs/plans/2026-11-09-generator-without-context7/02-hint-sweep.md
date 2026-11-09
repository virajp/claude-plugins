# U2 — Pack hints name Context7 only when installed

- **Read first:** each hint line in context:
  `command grep -rn -i context7 plugins/stackgen/stacks --include='*.md' --include='*.yaml'`
  (skip `bundles/`, `inventory.md`, `readme.md`).
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (the pack version
  rule).

## Ruling

> D3: Each hint keeps the Context7 name and adds 'when Context7 is installed;
> else the official documentation'. Provenance citations of the form
> 'Context7 /<library>, read <date>' stay unchanged.

> D4: Each pack U2 edits gets a patch bump in its pack.yaml and a new pin in
> every bundle that pins it; the versions 13 and 17 are never issued as a
> component, so a bump that reaches one steps past it. U2 runs
> mise x -- mise run p:plugins:inventory as its last step.

> D5: All pack edits sit in U2, because the pre-commit inventory hook needs the
> regenerated inventory in the same commit as each version bump.

## Edits

1. **Every hint** in the 48 owned packs — rewrite per D3, keeping the sentence's
   point and grammar. Examples:
   - "X belongs to Context7 at use time." → "X belongs to Context7 at use time
     when Context7 is installed, else to the official documentation."
   - "The API surface is Context7's at use time, and is the half that ages." →
     "The API surface is looked up at use time — in Context7 when Context7 is installed,
     else in the official documentation — and is the half that ages."
   - "Confirm the exact permission name against Context7 rather than …" →
     "Confirm the exact permission name against Context7 when Context7 is installed, else
     the official documentation, rather than …"
   A provenance citation ("Context7 `/withastro/docs`, read 2026-09-06",
   "chosen on Context7 evidence") is unchanged.
2. **Each edited pack's `pack.yaml`** — `version` patch bump (skip 13 and 17).
   **Each bundle under `plugins/stackgen/stacks/bundles/`** that pins an edited
   pack — the pin moves to the new version.
3. **Last step:** `mise x -- mise run p:plugins:inventory`. Keep its output.

## Verification

- `mise x -- mise run p:plugins:inventory -- --check` exits 0.
- `mise x -- mise run p:plugins:check` exits 0.
- The search in *Read first* prints no hint without "when Context7 is
  installed" in its sentence, save provenance citations and the statements of past research evidence of D14.

## Guardrails

- Edit only hint sentences, versions and pins; change no other doctrine.
- Do not touch `plugins/stackgen/stacks/readme.md` (U1).
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- `plugins/*/stacks/*/*/config/` is payload copied byte for byte into target
  repos: a hint there is edited, but never reformat the file.

## Commit

`refactor: pack hints name context7 only when installed`

> D8: Before it returns, each edit unit runs
> `mise x -- mise run code:format -- --fix <each file it changed>`, on its own
> changed files only.

> D10 (gap 4): the hint phrase is exactly "when Context7 is installed" — write
> it so, not "when installed" — and read each hit as its whole sentence.

> D14 (gaps 7-9): provenance ("chosen on Context7 evidence") and statements of
> past research evidence ("the one Context7 documents", "no Context7 entry",
> "Context7 lists no …") stay unchanged. Each bump is computed once from the
> pack version on the base branch, so a retried round never bumps twice.
