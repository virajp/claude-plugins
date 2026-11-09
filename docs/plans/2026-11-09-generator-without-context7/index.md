# Plan — The stackgen generator works without Context7 (2026-11-09)

## Goal

After this plan lands, the stackgen generator researches an uncovered stack
with Context7 first when the user has installed it, and with WebFetch, WebSearch
and the package registries when not. It never halts on Context7 and never asks
for it. The 140 passive pack hints name Context7 only "when Context7 is
installed", with the official documentation as the fallback. This finishes
B124.

Plan 2 of 2 — requires `docs/plans/2026-11-09-retire-plugin-mcp-servers`, which
removes the context7 addon pack and makes the generator ask the user to install
Context7 in the meantime.

**Reversal.** D9 (the generator halts without Context7) and D16 (the hints stay,
the sweep is parked) of `docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md`,
and the interim D2 of plan 1. U3 writes the new record.

## Facts the survey established

- **The generator.** `plugins/stackgen/skills/stackgen-stack-template/references/generator.md`:
  the precondition and the halt at `:19-37` (plan 1 rewords the halt to ask the
  user), the research loop at `:66-77` (one Context7 pass per topic minimum,
  supplementary sources only where coverage is thin), `:226-229` (a reputation
  outage halts "the same way a Context7 outage does"), `:252-253` ("API
  reference stays in Context7"). The generator names no other source today.
- **Already source-neutral.** The citations format is "research sources with
  URLs + fetch dates" (`plugins/stackgen/assets/output-tree.md:47`). No skill
  or agent restricts the generator's tools, so WebFetch and WebSearch are
  available. `stackgen-reputation` already fetches registries with WebFetch
  (`plugins/stackgen/skills/stackgen-reputation/SKILL.md:144-152`); its offline
  rule refers to the Context7 precondition (`:163-168`).
- **Other Context7 lines U1 owns.** `plugins/stackgen/assets/artifact-doctrine.md:236-239`;
  `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:69-72`;
  `plugins/stackgen/assets/pack-format.md:363`; `plugins/stackgen/assets/kinds.md:69,132,598`;
  `plugins/stackgen/agents/stackgen-skill-reviewer.md:55`;
  `plugins/stackgen/stacks/readme.md:44,98`; the `description` of
  `plugins/stackgen/.claude-plugin/plugin.json` ("per-topic Context7 research").
- **The hints (U2).** 140 lines in 116 files across 48 packs (the 49th,
  `addon/notion`, is deleted by plan 1). Phrasings: "X belongs to Context7 at
  use time" (most cloud-service, capability-provider, datastore, CI and
  deploy-target `SKILL.md`); "X is Context7's at use time" (compose and swiftui
  integration references, `pub/conventions.md:12`, cloudflare-agents); "The API
  surface is Context7's at use time, and is the half that ages" and "Fetch it
  from Context7 at use time" (flutter integrations); "Confirm … against Context7
  rather than …" (Workers, containers, durable-objects references); provenance
  citations "Context7 `/withastro/docs`, read 2026-09-06" (astro, html, compose
  webrtc). The heaviest packs are flutter (28 lines), compose (25), swiftui (22).
- **`stackgen-reputation/references/sources.md`** uses Context7 as provenance
  ("Context7 id" columns). It is not a runtime dependency, and stays.
- **Gates.** `p:plugins:check`, `p:plugins:inventory -- --check`,
  `p:plugins:marketplace -- --check`, `pnpm vitest run`, `p:site:check`.
  Pre-commit runs the inventory hook on `^plugins/stackgen/(stacks/|assets/kinds\.md)`
  and the marketplace hook on manifest changes.
- **Docs (U3).** `CLAUDE.md` (stackgen row: "a Context7-researched generator …
  that halts when no Context7 server is reachable"); `readme.md:292-294`;
  `.claude/skills/stackgen-plugin/SKILL.md:31,71,91-94`;
  `site/src/content/docs/plugins/stackgen.md:214-230,947-950,984,1009-1012`.
  Plan 1 may already have reworded some of these to "asks the user to install
  Context7"; U3 reads them as they are on the branch.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a plugin
version, never runs a generator its unit file does not name, never edits a doc
it does not own, never adds a dependency, never commits. A unit deletes with
plain `rm`, never `git rm`. A unit never writes a lock file.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the block,
with two to four options; a block with no question carries the one line
`QUESTION: none`.

## Out of scope

- B127 (whether the generator path stays at all) — not decided here.
- `stackgen-reputation/references/sources.md` — its Context7 columns are
  provenance, not a dependency.
- The installer's `["mcp","context7"]` test key path — a sample, not the tool.

## Parked

- `docs/memory/gaps/2026-11-09-execute-coder-no-web-tools.md` — `execute-coder` has no WebFetch, WebSearch or MCP tools, so the hint fallback "else the official documentation" is out of its reach (D22).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-09-generator-without-context7

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
