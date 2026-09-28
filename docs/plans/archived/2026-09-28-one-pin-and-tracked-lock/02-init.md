# U2 — init: tracked lock, a Lock line that can read none, base-tool rows

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/tool-configs.md`,
  `plugins/vwf/skills/doctor/references/code-intelligence.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts; `new-repo.md` §11(b) (the lock step,
  :715-745) and the report (:1060-1075), and "Tool-config rows" (:107-116);
  `SKILL.md` :129-131, :691, :835-850; `existing-repo.md` :212-224, :724-729,
  :1153-1156; `tool-configs.md` :46; `doctor/references/code-intelligence.md`
  :16. Line numbers may have moved.

## Ruling

> - Decision 1: graphify requires python and uv, and every passage that names
>   its needs says both.
> - Decision 2: The one-pin check runs for every tool the base mise block pins,
>   on `all` and on a reshape, as well as on `add tool`. A clash is a conflict
>   row whose two answers are the repo's existing version or the base's
>   `latest`; the winner is pinned once.
> - Decision 4 (ruled at resume 2026-09-28, reversing the approved ruling): no
>   lock file is ignored except `mise.local.lock`, at any depth. The shipped
>   `.gitignore` carries one lock line, `**/mise.local.lock`, in place of
>   `mise.local.lock`, `mise.*.local.lock` and `.mise.local.lock`. When a repo's
>   `.gitignore` has a line ignoring any lock file (e.g. `*.lock`, `mise.lock`,
>   `locks/`), init removes that line, one removal row per line in the one
>   consent. No negation lines.
> - Decision 5: The ignore fix runs before `setup:mise --lock-only`, and *lock
>   ignored* is no longer a Lock state.
> - Decision 6: The Lock report line reads `none` for a repo whose lock step
>   changed nothing.
> - Decision 8: Any sentence a unit adds is one sentence, wrapped at the fold.

## Edits

1. **`new-repo.md` §11(b)** — before the lock step, the ignore fix of decisions
   4 and 5: detect with `git check-ignore -v` (it names the rule and its
   `file:line`) for `.config/mise/mise.lock` and a path under
   `.config/mise/locks/`; each matching line is one removal row in the plan
   shown before the one consent, and is removed on that consent. No negation
   lines. Remove the *lock ignored* state and its `git check-ignore -q` skip.
2. **`new-repo.md`, the report** (near :1069) — the Lock line's states: staged,
   `none` (decision 6), *lock deferred*, *lock failed — not committed*; no *lock
   ignored*.
3. **`new-repo.md` "Tool-config rows"** and **`tool-configs.md`** — one line:
   `all` may return a row for a base-block tool the repo already pins, answered
   inside the one consent with the two answers of decision 2.
4. **`existing-repo.md`** — the same row on a reshape (near :212-224, :724-729);
   its lock paragraph (:1153-1156) still defers to §11(b).
5. **`SKILL.md`** — the plan spec names the lock-ignore removal rows and the
   base-tool rows; the report spec (near :842) lists the Lock states of edit 2.
6. **`doctor/references/code-intelligence.md:16`** — graphify's prerequisite
   names python and uv (decision 1).

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- the removal steps in `new-repo.md` are concrete enough for the orchestrator's
  scratch-repo gate to reproduce

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line; no `|` inside a table cell.
- Touch nothing outside the owned paths — not tool-config, not the site.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`fix: init keeps the mise lock tracked and reports an unchanged lock as none` —
written by the orchestrator after the wave gate.
