# U4 — init's re-run doctrine names its triggers

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom, before editing — the re-run
  passage (`:596-636` as the survey found it; it may have moved with the two
  required plans, so locate it by its heading).
- **Lazy-load:** none.

## Ruling

Decision 4 — Init doctrine: "The re-run passage of `init/SKILL.md` gains the
list of in-session triggers — architecture, setup after materialize,
`stackgen-sync`, recall's nudge — each in one line beside the reasons it already
lists; the doors stay Step 0 and `reshape`."

Decision 2 — Offer, not run: every trigger offers; init itself is still reached
only through setup.

## Edits

1. **`plugins/vwf/skills/init/SKILL.md`**, the re-run passage — after the list
   of reasons (registry exists, folder renamed, pack version moved, member
   added/removed/cloned, fresh clone with deferrals, forge drift, whenever
   doctor says so), a short list of **who brings the user to the door** without
   them remembering: `/vwf:architecture` after it writes the registry;
   `/vwf:setup` after its own materialize pass; `/vwf:stackgen-sync` after a
   sync; `/vwf:recall` at session start, as one printed line. Four lines, no
   restatement of any of those skills' procedures. The sentence that says the
   doors are Step 0 and `reshape` stands.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "stackgen-sync\|recall" plugins/vwf/skills/init/SKILL.md` — at least
  one hit each inside the re-run passage.

## Guardrails

- Only the one file; nothing in `init/references/`.
- No doc outside it — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init re-run doctrine names its in-session triggers` — written by the
orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
