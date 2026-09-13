# Decision — the plan is committed at hand-off, 13 and 17 are never issued, and the backlog has one writer

**Date** 2026-09-14 · **Branch** `2026-09-13-vwf-process` · **Plan**
[`docs/plans/2026-09-13-vwf-process/`](../../plans/2026-09-13-vwf-process/index.md)
· **Reverses** nothing · **Backlog** B01, B02, B03 (group A of the 2026-09-13
capture)

## What prompted it

Three unrelated defects that shared one plan. The two change plans run on
2026-09-13 both reached their execute session as an **untracked** folder: the
worktree is cut from the integration branch, the folder was never committed
there, and each run swept it into a wave commit that had nothing to do with it.
The 13/17 rule existed as prose in two skill files and in memory, and was
enforced by nothing — a manifest, a bump or a tag could land on either integer
and no gate would say so. And the 2026-09-13 backlog capture named eleven items
with no command that owned the file they live in.

## The three rulings

### 1. `/vwf:change-plan` commits and pushes at hand-off

The hand-off is now four ordered steps: status `APPROVED`,
`/vwf:backlog planned <ids> <folder>`, a commit and push of the folder through
`vwf:git-workflow`, then the launch line. git-workflow is invoked with declared
preferences so it asks nothing — **work in place on the current branch** (its
"if declined" path, a consented one), stage exactly the plan folder plus
`docs/backlog.md` when the backlog step changed it, commit
`docs: change plan — <name> — approved, awaiting execution`, push to the
branch's upstream and set it when absent. The approve at the hard gate **is**
the explicit request git-workflow's push rule wants, so nothing is asked twice,
and nothing is merged.

`/vwf:change-execute` refuses a folder that is not on the integration branch
rather than sweeping it into a wave commit.

Rejected: raw git inside `change-plan`; committing but asking before the push.

### 2. 13 and 17 are never issued as a version **component**

The rule is about a whole component, not the digits: `1.13.0`, `17.0.0`,
`2.1.17` and `config_format` 17 are forbidden; `1.130.0` and `113.0.0` are
ordinary versions. It binds every version line this repo maintains — the two
plugin manifests, the installer and site packages, `config_format`,
`blueprint_format` — and **nothing a target repo inherits**: the shipped mise
task library is untouched, by decision.

Three enforcement shapes, each chosen over an alternative:

- **The checker refuses.** A second assertion inside `check.ts`'s existing
  manifest rule, beside "is not plain semver" — *not* a named rule 14, so every
  "thirteen rules" passage stays true and only the sentences describing what
  that rule asserts changed.
- **The bump tasks skip.** `p:i:version` and `p:site:version` bump again at the
  same level and print what they skipped (`1.1.12` patch → `1.1.14`), rather
  than refusing — refusing would stall `deps-update.yml`'s unattended monthly
  run on a number. The loop is capped at ten attempts with an explicit error,
  because a patch bump never clears a forbidden **minor** and a tree hand-edited
  to `1.13.5` would otherwise rewrite `package.json` forever, in CI.
- **The release tasks refuse.** All three, before the tag name is built, since a
  tag is the one artefact nobody can take back. `p:plugins:release` checks only
  the refs it would **newly** cut — `vwf-v19.17.0` predates the rule and stays
  real — and refuses the whole run rather than one entry, because the tags are
  pushed together.

Old stamps are read by the **history**, not by the rule: `config_format` 13 was
issued and is real, `blueprint_format` 13 was skipped and reads as 12, and 17
was never issued on either line, which is why `config_format` went 16 → 18. The
`p:plugins:local` staging counter `X.Y.Z+N` is not a component and never trips
the guard.

The guard lives in a new repo-owned sidecar `.config/mise/tasks/_scripts/local`
(`version_forbidden`, `version_skip_note`), sourced by the five tasks on the
line after `helpers`. The pack-owned `helpers` is not edited — that file is
replaced on every reshape — and nothing a pack lands may source the sidecar. It
carries a shebang and the exec bit, or the repo's own shell gate cannot see it.

Rejected: the digits appearing anywhere in the string; refusing on bump; a named
rule 14; editing `helpers` or inlining the loop per task; pushing the guard into
the mise pack so target repos inherit it.

### 3. `/vwf:backlog` is the sole writer of `docs/backlog.md`

The user, verbatim:

> Let only `backlog` skill be responsible to manage the file and content, others
> can simply call `backlog` skill to make changes. `change-plan`,
> `change-execute`, `plan`, `execute` any of them can call `backlog`.

So five callers — `change-plan` and `plan` with `planned <ids> <path>`,
`change-execute`, `execute` and `archive` with `done <ids>` — and none of them
edits the file. The ids travel as a **`backlog:` frontmatter list** on a change
plan's `index.md` and on a flat cycle plan, empty or absent meaning the plan
covers no item; grepping the plan body for ids was rejected.

The skill is `model: sonnet`, `effort: medium`, model-invocable — user-only
would have made every caller's invocation a silent no-op. Seven verbs (`add`,
`list`, `next`, `move`, `planned`, `done`, `close`), priorities `P1`–`P3`,
statuses `open` → `planned` → `done` or `closed`, ids `Bnn` sequential and never
reused. It never commits: its edit rides the caller's commit.

The backlog is **product-level and lives in the base repo only**, beside the
base's `docs/plans/index.md` — never one per member repo, and a caller running
in a member addresses the base's file. That placement was unruled at plan time
and taken as an assumption during the run.

Rejected: callers editing the file themselves; `haiku`; user-only; a mempalace
room instead of a file — a backlog that exists only in memory is one an offline
session cannot read.

## The backlog / feedback line

The user, verbatim, and the reason the two never route into each other:

> `feedback` is different than `backlog`. `backlog` is something that can't be
> picked up right now, `feedback` is something that is being worked upon and
> might need change in `product`, `blueprint`, `architecture`, etc. It will then
> follow the `plan` and `execute` workflow.

`/vwf:feedback`'s routing is unchanged. Its "not to a backlog" sentence and the
two manual passages that repeat it now state the distinction instead of denying
that a backlog exists.

## What stays outside

- **Feedback's routing itself.** Whether the shipped skill does what the
  sentence above describes is group C's plan (backlog B05).
- **The shipped mise task library.** A target repo inherits no 13/17 guard; if
  it should, that is a stackgen mise-pack change with its own plan.
- **A `/vwf:plan` no-argument "pick the next backlog item" mode.** `plan` keeps
  its mandatory slice argument; `/vwf:backlog next` prints the item and the
  command that picks it up.
