# Plan — R3a: the plugins use the bootstrap contract, and releases move to releases.toml (2026-11-14)

## Goal

After this plan lands, vwf and stackgen reach bootstrap only through its CLI
and its JSON contract (contract 1, in bootstrap 4.0.0): `init` drives
`bootstrap init`, doctor reports `bootstrap check` and `sync --dry-run`,
stackgen's handoff calls `bootstrap catalog` and `add tool`, and
`/vwf:execute` writes release levels through `bootstrap config`. No plugin
reads a bootstrap file. It is the first of three R3 plans of
`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`; R3b and R3c
follow.

**Wait for bootstrap 4.0.0.** The design record says R3 starts only after the
`bootstrap@4.0.0` release. `requires` cannot name a bootstrap plan, so U1
checks `bootstrap contract --json` first and stops the run when contract 1 is
not installed (D3).

## Facts the survey established

- `.config/bootstrap.toml` is named in 20 files under `plugins/` (59 lines),
  `.config/releases.yaml` in 10 files (12 lines). No script reads either;
  only skill and asset prose does.
- `/vwf:init` reaches bootstrap through bootstrap's readme prompt
  (`init/SKILL.md`, about lines 380-400); its gate is the existence of
  `.config/bootstrap.toml`; green runs `mise run setup:configs --dry-run`.
- Doctor's shape checks read the branches and `merge_model` from that file and
  run the same dry-run (`doctor/SKILL.md` about 217;
  `references/stack-checks.md` about 395-480).
- `/vwf:execute` raises levels in `.config/releases.yaml`
  (`execute/references/land.md`, about lines 70-95).
- stackgen's handoff clones bootstrap and gives an agent an instruction
  against `docs/sync/vwf.md`.
- The CLI comes from the Mac's global mise config
  (`github:virajp/bootstrap`), version 3.0.0 on 2026-11-14.
- The contract (bootstrap R1a, R1b): the envelope
  `{contract, command, ok, code, data, errors, warnings}`; `config get` needs
  no clone; `config set releases.<p>` keeps the higher level; `init` and
  `add tool` take `--answer <tool>.<key>=<value>`; a `--json` write needs
  `--yes` or `--dry-run`.
- P0 (`2026-11-14-bootstrap-drift-fix`, APPROVED) edits most of the same
  files; this plan requires it.
- Gates: `code:format`, `code:lint`, `code:precommit`. Commit types: the ten
  of `.config/git-conventional-commits.yaml`, no scopes.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc it does not own, never adds a
dependency the plan does not list, never commits. A unit deletes with plain
`rm`, never `git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again.

## Out of scope

- Every branch, landing and `merge_model` passage, `git-workflow`, and the
  core-branch rulings: R3b.
- `virajp-plugins`, the pnpx install text and the hand removal of plugins:
  R3c.
- Topology, members and the `vwf.yaml` keys: R4. Packs: R5.
- This repo's own `.config/` files and release tasks (D10).
- A version bump or a tag.

## Parked

- **Hand step for the user, after this plan lands, before the next release:**
  switch this repo's release tasks (`p:release`, `p:plugins:release`,
  `p:i:release`, `p:site:release`), the release-level functions in
  `.config/mise/tasks/_scripts/local` and `p:releases:test` to
  `bootstrap config get` and `unset releases.<p>` (D10).
- **Hand step for the user, after bootstrap 4.0.0, before the R3b run:** run
  `bootstrap init` in this repo, so that it has `.config/bootstrap/`. After R3a,
  the landing of `/vwf:execute` stops on an old-form repo (D15, D25).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-14-bootstrap-contract

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
