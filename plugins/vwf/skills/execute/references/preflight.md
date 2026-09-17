# The `code`-unit preflight (Setup steps 2 and 3)

Read this at Setup step 2 **only when the Units table holds a `code` unit** — a
plan of `edit` units alone writes no code, so neither branch below applies to
it: a missing LSP server is a Run log detail there, and no conventions are
fetched. A `blocking` doctor finding is a hard halt handled in `SKILL.md`, not
here, whatever the plan's units.

## The LSP rule (Setup step 2)

Applies **only when `doctor` reports a missing LSP server**. A clean preflight,
or one whose only findings are non-LSP, never needs it.

The question was asked once, at `/vwf:plan`'s stack gate, and its answer is a
row in the folder's **Consent** block — `LSP <language>`, reading `installed` or
`proceed without`. This run reads the row and asks nothing:

- **`installed`, and the server is still missing** → halt with the remedy: the
  plan was approved on a promise that did not hold. Name the language, say to
  install the server via `/plugin` (Discover) or to change the row to
  `proceed without` in the folder, then re-launch `/vwf:execute <folder>`.
- **`proceed without`** → log it as a Run log detail and continue; degraded
  type-safety is a known condition of the run, not a gap.
- **No row for the flagged language** → treat it as `proceed without`, and
  write one `GAP:` line into the folder's *Gaps surfaced during execution*:
  the plan did not carry the LSP answer for `<language>`, and the run proceeded
  without the server.
- A language doctor reports as **unavailable** (no LSP ships in this
  marketplace) is not gated — there is nothing to install. Note it as a gap and
  proceed.
- A language doctor reports as **unknown** is not handled here at all: no
  installed plugin declares it, so it is a `blocking` finding and a hard halt in
  `SKILL.md`. It is not a missing LSP — it is a stack vwf has no template,
  conventions or harness for, and there is nothing to proceed without.

Everything else doctor reports is noted and carried into the run's gap list, not
blocked on.

## Stack conventions (Setup step 3)

Fetch the `conventions:` prose for every template this plan's projects pin, per
*Resolving the conventions* in `${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`
— deduped by slug, **once for the whole run**, here rather than per unit. The
config block names the templates; the prose is what the code is actually
written to, and every stage that touches code is passed it.

**Under `multi-repo`, the fetch carries `repo: <path>`** — that asset's
*The target repo* line, naming the member whose `members:` entry lists the
project (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`). Setup step 1 already
resolved which repo each project is of; **hand that resolution to the fetch**
rather than dropping it, under both linkages — under `siblings` it is the
worktree's own repo, under `submodule` the member's path inside the base.
A materialized template lives in the repo it was landed in, so a fetch that
omits the repo reads the base's `.claude/` tree for a member's project and
finds the wrong prose or none. Dedupe per (repo, slug).

**Two different halts live here.** An axis reading `unresolved` halts at
that asset's step 1, before any fetch — the axis was deferred, so there is
no prose to resolve; name the project and the axis and point at
`/vwf:architecture`. A failed fetch halts for the opposite reason: the
preflight already proved each pin resolves, so a failure now is the plugin
being unreachable. Report them distinguishably — a question nobody answered
is not a plugin that broke — and note that `/vwf:doctor` will not have
caught the first, since it reports deferral as a degradation by design.
Either way, code written to conventions nobody read is the thing this whole
gate exists to prevent.
