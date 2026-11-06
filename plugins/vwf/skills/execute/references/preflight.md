# The preflight reads (Resolve; Setup steps 2 and 3)

## Validate (Resolve, every plan)

Preflight starts with the folder's file, before any other read of it, on a fresh run and a resume
alike. It runs after the format test in `SKILL.md` found the new format:

```sh
node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json
```

Below, `plan.mjs` names that script, as in [the plan files](plan-files.md). Exit 0 prints
`<folder>/index.json: valid`, and the run reads on.

Any other exit is a **refusal**. Print every finding it wrote to stderr, one
`<file>: <path>: <message>` line each, and stop: before the claim, before the worktree, writing nothing.
The fix depends on the run:

- On a fresh run, the planner named by the folder's `type` corrects the folder and re-approves it.
- On a resume, correct the folder in the worktree with one `plan.mjs set` or `append` per finding, and
  re-launch the run.

The `validate` call refuses an `after_landing` mode other than `run`, and a `release_levels` level outside the
four. It also refuses backlog lists that disagree with each other or with Parked.
[folder.md](../workflows/folder.md) names them.

## The release levels (Resolve, every plan)

Read at Resolve, before the claim, on a fresh run and a resume alike. The folder's `release_levels` list holds
one entry per project the units touch, `NONE` entries included. Each has `id` the project, `level` one of `NONE`,
`PATCH`, `MINOR`, `MAJOR`, and its `reason`. The landing reads it to raise `.config/releases.yaml`, per *The release-levels
write* in [land.md](land.md).

- **An empty list, `[]`** → the old-shape case, which only a migrated folder can have. The planners always write one
  entry per project. This is **not a refusal**. Its units run as written, and the landing writes nothing to
  `.config/releases.yaml`. The final report says *old-shape folder — no release levels recorded* in one line.
- **An entry whose `level` is not one of the four** → never reaches here: `validate` refused it above, naming the
  entry's path.

## The execution mode (Setup step 2, every plan)

Decide the run's mode once, on a fresh run and a resume alike. Read the folder's key with
`plan.mjs get <folder>/index.json execution`. A `get` that exits with `no key execution` reads as `solo`.

The mode is `teams` only when all three of these hold:

- The key reads `teams`.
- `printenv CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` prints `1`. Read the flag, because with the flag off an `Agent` call with a `name` still succeeds, and
  only its `SendMessage` fails.
- The run is not a runner under `all`, per *Runner mode* in [all.md](../workflows/all.md).

Otherwise the mode is `solo`, and **the run never stops for this**. A unit file depends on no peer, so a plan recorded `teams` lands the same way.

Log the mode: `log.mjs event execution --mode <mode> --reason "<why>"`, the reason naming the condition that failed when the plan read `teams`. Drop `--reason` when the mode is what
the plan recorded. The final report renders it. [edit-unit.md](edit-unit.md) says what the mode changes.

An unattended `teams` run has the same permission rule as a `solo` one. This run adds no mechanism.

## The `code`-unit preflight (Setup steps 2 and 3)

Read this at Setup step 2 **only when the plan has a `code` unit**, a `units` entry whose `kind` is `code`. A plan of
`edit` units alone writes no code, so neither branch below applies to it. There, a missing LSP server is a line in the
final report, and no conventions are fetched. A `blocking` doctor finding is a hard halt handled in
[claim.md](claim.md), not here, whatever the plan's units.

### The LSP rule (Setup step 2)

This applies **only when `doctor` reports a missing LSP server**. A clean preflight, or one whose only findings are
non-LSP, never needs it.

The question was asked once, at `/vwf:plan`'s stack gate. Its answer is the folder's `consent.lsp.<language>`, reading
`installed` or `proceed without`: `plan.mjs get <folder>/index.json consent.lsp`. This run reads it and asks nothing:

- **`installed`, and the server is still missing** → halt with the remedy: the plan was approved on a promise that did
  not hold. Name the language. Say to install the server through `/plugin` (Discover), or to set it to `proceed without`
  in the folder — `plan.mjs set <folder>/index.json consent.lsp.<language> "proceed without"` — then re-launch
  `/vwf:execute <folder>`.
- **`proceed without`** → say so in the final report and continue. Degraded type-safety is a known condition of the run,
  not a gap.
- **No key for the flagged language**, or no `consent.lsp` at all → treat it as `proceed without`. Append one `open` entry
  to the folder's `gaps`, `unit` `""` and `stage` `preflight`. Its text says that the plan did not carry the LSP answer for
  `<language>`, and that the run proceeded without the server. Then one `log.mjs event gap` with the same `id`, `unit`, `stage`, `text` and
  `state`, per [the plan files](plan-files.md).
- A language doctor reports as **unavailable** (no LSP ships in this marketplace) is not gated: there is nothing to install.
  Append it to `gaps`, then one `log.mjs event gap` of the same entry, and proceed.
- A language doctor reports as **unknown** is not handled here at all. No installed plugin declares it, so it is a `blocking`
  finding and a hard halt in [claim.md](claim.md). It is not a missing LSP: it is a stack vwf has no template, conventions or
  harness for, and there is nothing to proceed without.

Note everything else doctor reports, and carry it into the run's gap list; do not block on it.

### Stack conventions (Setup step 3)

Fetch the `conventions:` prose for every template this plan's projects pin, per *Resolving the conventions* in
`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`. Dedupe by slug, and fetch **once for the whole run**, here rather than per
unit. The config block names the templates. The prose is what the code is actually written to, and every stage that touches
code is passed it.

**Under `multi-repo`, the fetch carries `repo: <path>`**: that asset's *The target repo* line, naming the member whose
`members:` entry lists the project (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`). Setup step 1 already resolved which repo each
project is of. Hand that resolution to the fetch, under both linkages. Under `siblings` it is the worktree's own repo, and under
`submodule` the member's path inside the base. A materialized template lives in the repo it was landed in. So a fetch that omits
the repo reads the base's `.claude/` tree for a member's project, and finds the wrong prose or none. Dedupe per (repo, slug).

**Two different halts live here.**

- An axis reading `unresolved` halts at that asset's step 1, before any fetch: the axis was deferred, so there is no prose to
  resolve. Name the project and the axis, and point at `/vwf:architecture`.
- A failed fetch halts for the opposite reason: the preflight already proved each pin resolves, so a failure now is the plugin
  being unreachable.

Report them distinguishably — a question nobody answered is not a plugin that broke. Note that `/vwf:doctor` will not have caught
the first, since it reports deferral as a degradation by design. Either way, code written to conventions nobody read is the thing
this whole gate exists to prevent.
