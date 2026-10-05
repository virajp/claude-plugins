# Decision — Renovate is dropped from tool-config

**Date** 2026-10-05 · **Branch** `2026-10-05-tool-config-templates` · **Plan**
[`docs/plans/2026-10-05-tool-config-templates/`](../../plans/2026-10-05-tool-config-templates/index.md)
· **Supersedes**
[`2026-09-27-tool-config-hygiene.md`](./2026-09-27-tool-config-hygiene.md) lines
24-26 (renovate lands `renovate.json` on `update_bot=renovate`)

## What was decided before

On 2026-09-27 tool-config gained a `renovate` tool: on `update_bot=renovate` it
landed a root `renovate.json`, yielding to any policy the repo already carried
under a spelling Renovate discovers. `update_bot` was a conditional axis a pack
could name in `when:`.

## What changed

Confirmed with the other nine reversals on 2026-10-05: *"yes, confirm all ten"*.
The user's line on CI shapes it: *"CI must only run tests, like vitest or
something"*.

- **N1 — gone from the skill.** `assets/renovate/`, `references/renovate.md` and
  every renovate path in the script and the checker are deleted;
  `TOOL_CONFIG_ROOT_FILES` no longer admits `renovate.json`.
- **N2 — `update_bot` leaves tool-config and the checker.** The script takes no
  `--update-bot`, and a pack's `conditional:` `when:` axes are `forge` and
  `secrets`. vwf's own `update_bot` question and its `answers:` key move out in
  the plan `2026-10-05-vwf-callers-on-templates`.

## The alternatives rejected

- **Keep it behind the axis** — a file no shipped default lands is one more
  thing to keep in step with nothing exercising it.
