# `<plan-folder>` — resolve and refuse early

This runs after the format test in `SKILL.md`, inside the one start call,
`start.mjs` ([claim.md](../references/claim.md)). The script makes every refusal
below and returns it as `result` `refused` with the refusal in `message`; the model
prints it and stops. What stays the model's is the resume's open questions, below.
The `next` form and a runner reach it with the folder they hold. The
`/vwf:execute all` form does not: when the argument is `all`, this session is the
loop, not an orchestrator. It follows
[`all` and runner mode](all.md) and nothing here. A runner reads `SKILL.md` and
runs it for its one folder, in the *Runner mode* of all.md, as if that folder
had been named.

## Finding the plan

A plan folder lives in the repo whose code it changes; a change plan's is the
base's. The `plans` list of `docs/plans/index.json` in the base repo lists every
one with its target repo (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`). The
file's shape is `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`,
and `plan-management` is its one writer.

The script reads the index; it does not walk the members. Under `multi-repo` most
are not on this machine, so a walk reports what happens to be cloned.

It halts if no approved plan exists: "No approved plan found. Run `/vwf:plan` or
`/vwf:change-plan` first."

**It halts if the target repo is absent**, reporting the missing repo and the command
that fetches it, per `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`:
`git submodule update --init <path>` under submodule linkage,
`git clone <url> <path>` under siblings. Then the run stops; it clones nothing. The
person fetches it and re-runs `/vwf:execute <folder>`. Unlike `plan` and `doctor`,
there is no honest partial result — you cannot write code into a repo you do not
have.

## Read the folder

Resolve the argument to `<folder>/index.json`, a folder shaped by
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`. Execute reads folders
only. A single-file plan from an earlier release is not an input: finish it on
the release that wrote it, or re-plan it.

Every value is read at the integration branch's tip, through `git show`, never the
working copy; on a resume, the folder's status, units and gaps come from the copy
in the run's worktree (below).

1. `start.mjs` validates the folder, as `plan.mjs validate <folder>/index.json`
   does, per [the preflight reads](../references/preflight.md). A red result is a
   refusal that prints every finding, on a fresh run and a resume alike.
2. The run reads with `plan.mjs get`, from Setup on:
   - `type`, `covers` when present, and `requires`.
   - `source`: the ids of the backlog items the plan was made for. Each sits on
     one of the next two lists.
   - `backlog`: the ids the plan **finishes**, which the landing hands to
     `/vwf:backlog done`.
   - `backlog_pieces`: the ids it lands **a piece of**, which the landing hands to
     `/vwf:backlog partial`. Each of these three lists is `[]` when the plan
     covers no such item.
   - `status`, `consent`, `units`, `gaps` and `stages`.
3. The start result holds two facts for every gate below:
   - **has `covers`** (`has_covers`): a cycle plan, whose blueprint-bound steps run.
   - **has a `code` unit** (`has_code_unit`): one or more `units` entries whose
     `kind` is `code`.
4. `start.mjs` reads the folder's **row** in the base repo's `docs/plans/index.json`,
   at the integration branch's tip, as `plan-index.md`'s *Reading the queue* does.
   A tip with no such id, or with no `docs/plans/index.json`, means no row.

Below, *Status* is `status.state`, and *the status line* is `status.detail`.

A **`- Bnn:` Parked line** is a line under the `## Parked` heading of the folder's
`index.md` that begins `- B`, digits and a colon. It is the remainder of item
`Bnn` that this plan does not land. Do not read other Parked prose.

## Act on the status and the row

The script acts on the status and the row as follows; each stop is a `refused`
result.

- **Status `DRAFT`** → stop: "not approved; run the planner that wrote it to
  finish it" — `/vwf:plan` for `type` `vwf-plan`, `/vwf:change-plan` for `type`
  `vwf-change-plan`.
- **Status `COMPLETE`** → stop: nothing to do.
- **Resolve the `requires` list**, as `plan.mjs resolve <folder>` does,
  `plan-index.md`'s *Resolution*, by the test each entry's kind takes. Anything but
  *runnable* → stop, naming each entry that blocks with the reason it gave.
  - For a **cycle** entry short of its stamps, halt with:

    > "Prerequisite plan `<folder>` has not been executed and merged (`<doc>` is
    > `implementation: <state>`). Run `/vwf:execute <folder>` first."

    There is no override flag. If reality differs from the stamp, heal it through
    `/vwf:plan` (its stamp-heal offer), or amend the blueprint through
    `/vwf:blueprint`. Never guess past the halt. Stamps land in the merged
    Reconcile commit, so an executed-but-unmerged prerequisite correctly halts
    too.
  - For a **change** entry whose row is `APPROVED`, say "run /vwf:execute <that
    folder> first". When it is `RUNNING`, say this:

    > "another session is running <that folder>; re-run this plan once it lands — or,
    > when that run is gone, make the `plan-management unclaim <that folder>` request
    > yourself"
  - For an entry the verb names as unresolvable, say "<entry> is neither in the
    plan index nor archived; fix the folder's `requires` list".
- **Status `APPROVED` with no row at all** → stop: "not in the plan index; re-run
  the planner's hand-off, or add the row by hand".
- **A `RUNNING` row whose worktree is not on this machine** → a claim another
  session holds. The script reads `run.worktree` from the tip copy of the folder;
  when that worktree does not exist here, or another session's run marker names
  this plan's log, it stops: "another session is running <folder>; re-run once it
  lands, or make the `plan-management unclaim <folder>` request when that run is
  gone". Only the session that holds the row resumes it. It is claimed
  afresh only once the user has asked the session to unclaim it. That is
  `plan-management`'s `unclaim <folder>`, which refuses while the run's worktree
  still exists. Execute stops here, and never invokes the verb from this refusal.
- **A `RUNNING` row whose worktree exists on this machine** → a **resume**: `mode`
  `resume`, the folder's status, units and gaps read from the worktree copy, per the
  Resume check in
  [setup.md](../references/setup.md) and
  [blocking and resume](../references/blocking.md).
  - The worktree named in the status line exists, and the run starts at the first
    unit that is not `green`.
  - The ruling a block asked for must now be in the plan: in the unit file, or in
    a `decisions` entry an answer appended. The start result's `open_questions`
    lists every open gap whose text starts `QUESTION Q<n>: ` (`gaps`) and every
    `question` event of the action log with no `answer` event (`events`). The model
    asks each first, under its own id and once, per *No one to answer* in
    [questions.md](../references/questions.md). If the status line still reads
    the same `UNRESOLVED:` with no answer recorded, stop and say which ruling is
    missing.
  - An `unknown-language` row in the result is not asked about: the fresh run
    asked, and the claim shows the user chose continue (*An unknown language* in
    [claim.md](../references/claim.md)).
  - The row reads `RUNNING` already, and is left alone. A row reading `APPROVED`
    is always a fresh run: an unclaimed plan is claimed again in
    [claim.md](../references/claim.md).
  - A resume runs what its folder says and takes none of the fresh-run refusals
    below. A folder written before review rows existed was reviewed per unit, and
    cannot be re-approved mid-run.
  - It refuses one thing beyond `validate`: a non-green `code` unit with no
    `review` row ahead that covers it, since it would land with no review. The
    fix: edit the folder in the worktree with `plan.mjs` (write a `NN-review.md`
    and `append` its `units` entry), then re-launch.
- **Status `APPROVED` with an `APPROVED` row** → a fresh run, with the refusals
  below. Its working copy of the folder must equal the tip copy, or the script
  stops: "check out the integration branch and pull, then re-run".

## The fresh-run refusals

The script reads three refusals off the folder here, before the claim. Each stops
the run.
The fix for each is to amend the folder and re-approve the plan — execute runs
what is written and infers no review row. A review row covers a unit when its `depends_on` names
it, directly or transitively through units it names.

| Refusal                     | Test                                                                                                                                                                                                                                                                                                                                                                                 | Names              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| An uncovered `code` unit    | No `review` row covers a `code` unit                                                                                                                                                                                                                                                                                                                                                 | every uncovered unit |
| A review row that covers nothing | Its `depends_on` names no unit at all, so it would review nothing and pass inert. Cycle plan and change plan alike                                                                                                                                                                                                                                                                   | the row            |
| A review row placed wrong   | Its wave is not strictly greater than the wave of every unit it covers (a row reviews a commit range, and a unit in its own wave is committed after it runs). Or it fails to cover a unit of any kind in an earlier wave than itself that no earlier `review` row covers (the range would carry that unit's commits while the coverage would not, so range and coverage must agree) | the row and the unit |

Every other refusal a fresh run made off the folder is a `validate` finding,
refused above with the finding's path:

- an `after_landing` step whose `mode` is not `run`;
- a `release_levels` entry whose `level` is not one of `NONE`, `PATCH`, `MINOR`,
  `MAJOR`;
- a `source` id on neither `backlog` nor `backlog_pieces` (the plan was made for an
  item its landing would never mark);
- an id on both `backlog` and `backlog_pieces`;
- an id on `backlog` with a `- Bnn:` Parked line for it;
- an id on `backlog_pieces` with no such line.

A landing turns `backlog` into `Done` and `backlog_pieces` into `Partially done`,
and checks nothing else. The fix for each is to re-run the planner named by the
folder's `type`, `/vwf:plan` or `/vwf:change-plan`. Then correct the entry, or move
the id to the list its Parked lines say it belongs on.

## The folder is already committed

The folder arrives committed on the integration branch. The planner lands it at
hand-off through git-workflow's protected-branch write, so the worktree Setup step 1
cuts sees it from its first commit. The script refuses a folder that is not on that
branch; nothing sweeps it into a unit commit. The message says to run the planner
again on it, or to land it by hand with git-workflow's `land.mjs`, then re-launch.

Then, on `ready`, continue with [claim.md](../references/claim.md)'s *Acting on the
result*.
