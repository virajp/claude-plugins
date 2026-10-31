# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `site/src/content/docs/**`, `readme.md`,
  `.claude/skills/stackgen-plugin/**`, `.claude/docs/plugins.md`,
  `docs/memory/decisions/2026-10-09-reputation-spm-mise-maven.md`, and any other
  human-facing passage `vwf:docs-sync` finds
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; the U1 and U2
  diffs; then each owned passage before editing it.

## Ruling

> **Goal.** `stackgen-reputation` returns a `pass`, `warn` or `block` verdict
> for SwiftPM packages, for every mise backend, and for Maven and Gradle names,
> and the stackgen generator names, prefixes and vets those names in what it
> generates.

> - Decision R6: The top-level prefixes are `npm`, `pypi`, `pub`, `action`,
>   `image`, `spm`, `maven`, `mise`. Go, Cargo, Ruby and .NET tools are
>   reachable only through `mise:`.
> - Decision R13: The docs unit writes
>   `docs/memory/decisions/2026-10-09-reputation-spm-mise-maven.md` with R1 to
>   R9.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1 and U2 returned.
2. `site/src/content/docs/plugins/stackgen.md` — `:217` and `:224` (what gets
   vetted gains SwiftPM packages, Maven artifacts and Gradle plugins, and mise
   tools), `:1402` (the skill row's prefix list becomes the eight of R6, with an
   `spm:` and a `mise:` example), `:1412`, `:1450-1473` (any passage that lists
   ecosystems or the concrete-name kinds).
3. `site/src/content/docs/how-to/operate/choosing-your-stack.md:202` — only if
   it lists ecosystems.
4. `readme.md:280-285` — the list of what is vetted gains the new kinds.
5. `.claude/skills/stackgen-plugin/SKILL.md` `:25-30`, `:105-112`, `:396`, and
   `.claude/docs/plugins.md:13` — where they list kinds or prefixes.
6. Write `docs/memory/decisions/2026-10-09-reputation-spm-mise-maven.md` in the
   shape of the other docs in that folder: the date, a link to this plan folder,
   "Completes B60", what was decided before (five prefixes; B60 parked from the
   Swift chain, widened to Maven by the Kotlin plan), and R1 to R9 each with its
   rejected alternatives, as index.md states them. Name the interview reversal
   (Go, Cargo, NuGet, RubyGems first out of scope, then in through `mise:`).

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.

## Guardrails

- Never edit `plugins/stackgen/**` — U1 and U2 own it; a falsified passage there
  is a `GAP:`.
- Do not edit history: `docs/plans/**`, other decisions docs,
  `docs/memory/handoff/**`.
- `readme.md` and `CLAUDE.md` are dprint-formatted; keep each code span on one
  line and never end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: reputation for SwiftPM, mise and Maven names — the manual follows`
