# U6 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5
- **Owns:** `site/src/content/docs/**`, `.claude/skills/vwf-plugin/**`,
  `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/skills/release/SKILL.md`,
  `.claude/docs/ci-and-releases.md`,
  `docs/memory/decisions/2026-10-08-release-levels-recorded.md`, and any other
  human-facing passage `vwf:docs-sync` finds outside `plugins/`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then each owned
  passage before editing it.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the decisions-doc shape)

## Ruling

> **Goal.** Each vwf plan records a derived release level for each project that
> it changes. At landing, `/vwf:execute` raises these levels in
> `.config/releases.yaml` and bumps no version.

> - Decision D2: No plan carries a release after-landing step. `/release` is
>   always a hand step. Ruling 9 of 2026-09-17, the CLAUDE.md exception and
>   override O4 are reversed.
> - Decision D3: The file is `.config/releases.yaml`. It has one key for each
>   project, with the value `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key
>   reads as `NONE`. An absent file reads as all `NONE`.
> - Decision D7: Interview item 18 is stated, never asked. The planner derives
>   each level from the change: breaks users → `MAJOR`, new behaviour → `MINOR`,
>   a fix → `PATCH`, no user-visible change → `NONE`. It shows each level with
>   its reason at the approval gate, as it shows the priority; the user changes
>   a level there.
> - Decision D9: The last unit is the "gates unit", file `NN-gates.md`. It runs
>   the generators the plan names and passes the full wave gate. It bumps
>   nothing.
> - Decision D11: A new optional key in `.config/vwf.yaml`, `after_landing:`, is
>   a list of commands. The user edits it by hand. `/vwf:execute` runs these
>   commands after every green landing, after the plan's own After landing rows,
>   as `run` steps. A command that the plan also lists runs once.

The reversals in index.md's Goal (1–4) are confirmed; they land as a decisions
doc here.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings, plus every
   `DOCS FALSIFIED:` line U1–U5 returned.
2. **`site/src/content/docs/plugins/vwf.md`** — `:2348` (release intent in the
   consent block) → the release levels section; `:2463` (One release at the end)
   → removed; `:2588-2592` (After landing validation) → add the `after_landing:`
   default; `:2674`, `:2716`, `:3228` → "gates unit", no bump; `:3176-3194`
   (`#vwfchange-plan`, "The release intent") → "The release levels", derived and
   stated, not asked; no release step. Where the page documents
   `.config/vwf.yaml` keys, add `after_landing:`. Keep every heading anchor that
   other pages link to.
3. **`site/src/content/docs/how-to/operate/ad-hoc-change.md`** — `:127-130`
   release intent → release levels, stated at the gate; `:255` → gates unit;
   `:336-337` → no plan releases anything; a release is `/release`, by hand.
4. **`.claude/skills/vwf-plugin/references/skills-and-agents.md:36`, `:46`** —
   gates unit; no bump.
5. **`CLAUDE.md`** — Rules (`:5-7`): "ALWAYS ask user before running a
   `p:i:release`, `p:plugins:release` or `p:site:release` task" with the
   exception removed. The "Where the detail lives" paragraph: remove "and
   `/release` as after-landing steps" and say that each plan records the release
   levels it derives, which `/vwf:execute` writes to `.config/releases.yaml` at
   landing. CI & Releases (`:340-342` and the paragraph about a release step
   recorded `run`): remove the exception. Say that the release tasks do not read
   the file yet (plan 2). `CLAUDE.md` is dprint-formatted: a widened table cell
   re-pads every row.
6. **`installer/CLAUDE.md:219-221`**,
   **`.claude/skills/release/SKILL.md:12-16`**,
   **`.claude/docs/ci-and-releases.md:306`** — remove the plan-folder exception
   from the ask rule. Change nothing else in these files: the ritual is plan
   2's.
7. **`docs/memory/decisions/2026-10-08-release-levels-recorded.md`** — a new
   decisions doc per `plugins/vwf/assets/memory.md`: the four reversals from
   index.md's Goal, D3–D7, D9, D11, each with its rejected alternative, and a
   pointer to this folder.

## Verification

- The full wave gate, notably `mise run p:site:check` and
  `mise run code:precommit`.
- `grep -rn "gates-and-bump\|One release at the end\|hold release" site/src/content/docs .claude/skills/vwf-plugin CLAUDE.md`
  returns nothing.

## Guardrails

- Never edit under `plugins/` — U1–U5 own it; a falsified passage there is a
  `GAP:`.
- Do not edit old decision docs or `graphify-out/**`.
- Never end a table cell in a bare asterisk; keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`docs: release levels recorded — the manual follows`
