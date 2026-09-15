# U4 — docs: the manual, the CI doc and the decisions doc follow wave 1

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/**`,
  `readme.md`, `CLAUDE.md`, `docs/memory/decisions/**`
- **Model:** opus
- **Read first:** `vwf:docs-sync`'s standalone mode
  (`plugins/vwf/skills/docs-sync/SKILL.md`), then the wave-1 diff once
  (`/usr/bin/git diff develop..HEAD -- .config plugins`), then the decisions doc
  format (`plugins/vwf/assets/memory.md`), then the survey list below.
- **Lazy-load:** the owned docs, at the cited lines. Line numbers were taken
  before wave 1 and may have drifted by a few lines; find passages by their
  quoted text.

## Ruling

This is the fixed docs unit: it runs `vwf:docs-sync` over the run's branch delta
and applies its findings plus every `DOCS FALSIFIED:` line U1–U3 returned, plus
the survey list. One reversal was confirmed, so one decisions doc is written.
From index.md, verbatim:

> **7.** The docs unit adds the nine print rows to the manual's copy of the
> table (`stackgen.md:700-706`) and splits its folded `_helpers, _checks` row
> into the pack's two, so the manual mirrors the pack.

And from index.md's Goal, the reversal the decisions doc records:

> Init today holds two rules the ruling overturns for the helper library alone:
> a pack-owned file the repo already has is *already owned* and never
> overwritten — the adapter's re-sync command shows the diff and takes its own
> consent (`existing-repo.md:115-119`); and a file the survey flags is *flagged
> for rewrite and never rewritten* (`:92-100`, the shebang pass). The user, on
> 2026-09-10: *"You should replace the helper with the one shipped with `init`
> and update all the existing tasks to use the new helper and make repo
> compatible with `init`."* Confirmed as a reversal, bounded by the mapping
> table (decision 3).

## Edits

1. Run `vwf:docs-sync` in standalone mode over the branch delta; apply its
   findings.
2. Apply every `DOCS FALSIFIED:` line the orchestrator hands you from U1–U3.
3. The survey list, whichever of these docs-sync did not already name:
   - **`site/src/content/docs/plugins/vwf.md:879-908`** — the existing-repo
     paragraph. "the helper library's shape" at `:881` gains the comparison and
     the replace-and-rewrite in one clause; the six counted sections at
     `:899-901` become eight, naming `Replaces` and `Rewrites (applied)` as
     applied on the one consent, beside the flagged line that "is applied by
     nothing"; the sentence about what is never rewritten gains the helper
     library as the named exception and why. The report enumeration at
     `:950-955` gains `Files replaced` and `Calls rewritten`. Name no function
     and no tool; say the mapping is the pack's legacy table.
   - **`site/src/content/docs/plugins/stackgen.md:700-706`** — decision 7: the
     nine print rows, in the pack's order, and the folded `_helpers, _checks`
     row split into two, matching the pack table U2 wrote (read it from the
     branch, not from memory). The paragraph after the table says init reads it
     to rewrite calls too.
   - **`site/src/content/docs/plugins/stackgen.md:446-469`** — where it mirrors
     the CI doc's environment split, remove or reword any claim that shfmt and
     shellcheck are dev-only and resolved by the workflow's `mise x` wrapper;
     the CI layer now declares them. If the passage names no tool, leave it.
   - **`.claude/docs/ci-and-releases.md:10-16`** — the `mise.dev.toml` bullet's
     last sentence ("The last three of the gate tools are
     `plugins:shellcheck`'s, which is why `plugins.yml` runs that task under
     `mise x shellcheck@latest
     shfmt@latest` rather than relying on the
     runner") is falsified: say instead that `mise.ci.toml` declares
     `shellcheck` and `shfmt` for `plugins:shellcheck`, that the `mise x`
     wrapper in `plugins.yml` is redundant and slated for removal by the
     task-groups plan, and why the wrapper never worked (the inner `mise run`
     rebuilds PATH from the config set). The `mise.ci.toml` bullet lists the two
     tools beside `node.gpg_verify`.
   - **`docs/memory/decisions/2026-09-10-init-replaces-a-diverged-helper-library.md`**
     — new, per `plugins/vwf/assets/memory.md`'s decisions format: the two rules
     as they stood (cite `existing-repo.md` pass 4 and pass 6 by heading), the
     user's words, the ruling (decision 3 quoted), the bound (the pack's legacy
     table; a call with no row is flagged), the rejected alternatives (defer the
     creates; init picks the mapping; create and report), and the defect that
     produced it (the 2026-09-09 reshape of this repo, commit `47af40c0`).
   - **`readme.md:111-113`, `CLAUDE.md:230,359`,
     `.claude/skills/vwf-plugin/SKILL.md:65,84,164`,
     `references/skills-and-agents.md:22`,
     `site/src/content/docs/how-to/brownfield/onboard-existing-codebase.md:82-91`,
     `migrate-old-vwf-repo.md:122`** — expected untouched (init summaries with
     no pass list); confirm each in your `DECIDED:` line.
4. Nothing under `plugins/**` or `.config/**` — those are U1–U3's and are done.

## Verification

- `mise run site:check` green (the manual's links and the markdown mirror).
- `pnpm exec dprint check CLAUDE.md readme.md .claude/docs .claude/skills docs/memory/decisions`
  green (these **are** dprint's); run `pnpm exec dprint fmt <file>` on an owned
  file only when the check names it.
- `grep -c '^| .print_' site/src/content/docs/plugins/stackgen.md` → `9` (the
  dot stands for the backtick opening each row's code span).
- `grep -n 'mise x shellcheck@latest shfmt@latest' .claude/docs/ci-and-releases.md`
  → only a sentence that calls the wrapper redundant.
- `grep -rn 'print_' site/src/content/docs/plugins/vwf.md` → nothing (vwf's
  manual names no function).
- `mise run plugins:check` still green.

## Guardrails

- Do not touch `plugins/**`, `.config/**`, or `plugin.json` (U5).
- `readme.md` is lowercase.
- Write with Write/Edit, never `cat` heredocs.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`docs: the manual, the CI doc and a decisions doc follow init's helper-library
pass`
— written by the orchestrator after the wave gate, not by the unit. Type `docs`
is in `.config/git-conventional-commits.yaml`'s list.
