# Memory Protocol

vwf keeps cross-session memory in **one store: a markdown tree on disk** under
`docs/memory/`. Each cycle recalls prior decisions and findings instead of
re-deriving them, so a resolved question is not asked twice and a parked point
is not lost with the session. The orchestrator persists durable decisions; the
execute subagents return their findings and gaps in their reports, and the
orchestrator records them in the plan folder's `index.json` — a run writes no
record here except a durable decision. In `/vwf:execute` the per-unit recall
before dispatch and the decision persistence after the run are for `code`
units only — an `edit` unit's ruling is in its file.

## The tree

Four folders, one file per record:

```text
docs/memory/
├── decisions/<date>-<slug>.md
├── gaps/<date>-<slug>.md
├── problems/<date>-<slug>.md
└── handoff/<name>.md        # includes the reserved next.md
```

- **`decisions`** — design and architecture decisions, and the *why*.
- **`gaps`** — blueprint or plan holes found **outside a run** — by
  `/vwf:blueprint`, `/vwf:verify` and `/vwf:feedback` — and out-of-scope points
  **parked during elicitation** (below). A gap a `/vwf:execute` run finds goes
  into the plan folder's `index.json` `gaps` list only, never here.
- **`problems`** — problems and how they were resolved: review and security
  findings worth keeping past their run, production problems, incidents and
  postmortems.
- **`handoff`** — session handoffs, the one folder `/vwf:handoff` and
  `/vwf:recall` own.

`<date>` is the ISO date the record is written (`2026-06-21`); `<slug>` is a
few lowercase hyphenated words naming the subject. **No record is
overwritten:** when `<date>-<slug>.md` already exists, the new record takes the
first free suffix — `<date>-<slug>-2.md`, then `-3`, and so on. A handoff is
the one exception: `handoff/<name>.md` of a name that exists is replaced, as
`next.md` always is.

Nothing else lives under `docs/memory/`: the planning record is the plan folder
and `docs/plans/index.json`, the run state is the folder's `index.json` and the
plan's action log, and `/vwf:doctor` reports afresh on each run.

### Where the tree lives

In a `repo` or `monorepo` topology, at the repo root. In `multi-repo`, at the
**base repo** root, under either linkage — beside the blueprint, never in a
member: a member's run, review or handoff writes its record there, so a recall
from any repo of the product reads one tree. Always at the **main checkout**,
never inside a worktree — a gitignored file written there dies with it, and a
committed one lands only with the branch.

**One exception: a `/vwf:execute` run.** A run never dirties the main
checkout, so it writes its durable decision records — `decisions/` only; a run
writes no `gaps/` or `problems/` file — inside the run's worktree, where they
ride the run's commits and land with the merge. Under `multi-repo` with
`linkage: siblings` that worktree is of the member, so the records go to the
base checkout as the second working tree, the way Reconcile writes its stamps.
Every other writer keeps the main-checkout rule.

### What is committed, and what is not

The split follows one rule: **commit what every contributor needs; leave out
what only one developer needs.**

| Folder                          | Git        | Why                                                 |
| ------------------------------- | ---------- | --------------------------------------------------- |
| `decisions`, `gaps`, `problems` | committed  | Durable product knowledge the whole team works from |
| `handoff`                       | gitignored | One developer's session state                       |

The `.gitignore` entry (`docs/memory/handoff/`) and the `docs/scratchpad/` line
sit in the repo's `.gitignore`, which bootstrap's git tool syncs, and no vwf
skill writes the file. It also ignores
`docs/memory/doctor/` and `docs/memory/runs/`: folders left from
config_format 23, until the config_format 24 migration removes them.

> **`/vwf:handoff` and `/vwf:recall` never skip.** The handoff *is* the
> deliverable, not a side memory. `/vwf:handoff <name>` writes
> `docs/memory/handoff/<name>.md`, and the reserved **`next`** handoff writes
> `docs/memory/handoff/next.md`, which `/vwf:recall` resumes; `/vwf:recall`
> reads a handoff from that file alone. (Before format 19 this file lived at
> `docs/handoffs/next.md` and was committed; it now sits in the ignored half,
> because a handoff is personal.)

## What a record holds

Each file opens with one compressed line in the spirit of AAAK — tight, one
fact per line, pipe-separated fields, ISO dates, importance ★1-5; skip the
personal emotion markers, these are technical memories — then the detail:

    DECISION 2026-06-21 ★4 | entity:order | embed line-items vs ref → embed
    — items immutable post-checkout, read-locality wins | alt ref rejected (no reuse)

- **A decision** — what was decided, the alternatives rejected, and why.
- **A gap** — the doc names it concerns, so a slice recall finds it; what is
  under- or mis-specified, where, and the assumption work proceeded on; how it
  was reconciled, once it is.
- **A parked point** — what was raised, why it is out of scope now, and what
  pass it belongs to; its slug ends in `-parked`.
- **A problem** — what went wrong, where, and how it was resolved.
- **A handoff** — the shape of `${CLAUDE_PLUGIN_ROOT}/assets/templates/handoff.md`.

## Secrets — never written

A record is a file other agents read back into context, and three of the four
folders are committed: treat `docs/memory/` as a published surface. **Never
write a secret value into a record** — a key, a token, a password, a
connection string with credentials. Name where the secret lives (the secrets
provider, the variable name), never the value. Deleting a committed file does
not delete it from history.

**Neither `/vwf:setup` nor `/vwf:doctor` scans for actual secrets.** Detecting
credentials in a repo is a dedicated scanner's job, and
bootstrap lands its config in the repo's own `.config/`,
where it is present in the checkout itself rather than conditional on a plugin
being installed — two tools scanning for credentials under different rules
produces a false sense of coverage, not more of it.

## Recall — before work

Before deriving anything — and before asking the user — recall the folders the
work at hand concerns:

1. **List the file names** of each folder; never read a whole folder.
2. **Read the files whose slug or title matches the topic at hand** — the
   entity, flow, slice or subject — **newest first, at most ten** per folder.
3. **Read no file in full that does not match.**

Hits are **context, not truth**: the blueprint, plan and conventions docs on
disk stay authoritative. Use recall to skip resolved questions and to check
work against prior findings — never to replace reading a doc you must follow
exactly. A match is by words in the name, so a record named for the same
subject in other words is missed: name a record for the subject a later recall
will look for.

## Persist — durable only

Store only **durable** outcomes — decisions and their rationale, gaps and how
they were reconciled, problems and how they were resolved — never transient
chatter or text a doc already captures verbatim. **Write one file per record**,
in the folder its kind names, under the naming and suffix rule above. A write
that fails is a real error worth surfacing: the tree is the only store.

## Findings — execute loop-backs

This is the `review` row's loop — the row the plan placed over its `code`
units. Each review and security subagent returns its **full** findings in its
findings block, each finding labelled `(<unit>)` with the unit whose commit
last touched its file in the row's range. The orchestrator presents the block
at the gate and, on a fix loop-back, hands each coder the finding lines
labelled with its own unit id, from both reviewers, and nothing else — the
coder fixes only those. A run files no finding here; a finding worth keeping
past the run is a `problems` record written by whoever resolves it.

## Gaps — blueprint and plan holes

A **gap** is distinct from a finding: a finding is wrong *code*; a gap is a hole
in the *blueprint or plan* — an underspecified behaviour work had to guess, a
plan unit contradicted by the real code, a requirement the blueprint never
stated. Gaps are captured **as they surface**, never silently worked around.

**During a run** each stage subagent that hits a gap — the coder, the review
and security reviewers, the acceptance verifier and the UX reviewer — returns
it as a `GAP:` line in its report, and the orchestrator appends it to the
`gaps` list of the plan folder's `index.json` — one `plan.mjs append`. That
entry is the durable copy and the only one; reconcile works from it.

**Outside a run** — `/vwf:blueprint`, `/vwf:verify`, `/vwf:feedback` — a gap is
a `gaps` record, per *What a record holds*.

**Parked scope — out-of-scope points raised during elicitation.** What a Q&A
answer surfaces *beyond the current pass's scope* (per the elicitation
protocol's scope check) is a `gaps` record, and a terse line in the pass's
durable doc (the flow/entity doc's Open Questions, the plan folder's "Out of
scope", the product doc's Risks & assumptions). Parked points ride the existing
recall paths: `blueprint` and `plan` recall `gaps` before working and treat
closing recalled gaps as a first-class goal of the pass — so a scope change
arriving in a fresh session finds the parked point instead of losing it.
