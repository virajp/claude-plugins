# U4 — gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate; the vwf manifest's
  current `version` **as the worktree holds it** — groups A and B may have moved
  it.
- **Lazy-load:** `.config/mise/tasks/p/site/version` (bare; patch default;
  refuses a dirty tree).

## Ruling

Consent block: "Release vwf publicly — minor — the next minor above the value
the tree holds when U4 runs, never a 13 or 17 component." "Release site publicly
— patch — `mise run p:site:version`." "Release stackgen publicly — none."
"Release installer publicly — none."

The 13/17 rule (group A's decision 1): no version component may equal 13 or 17;
a bump that would land on one goes one further.

## Edits

1. Confirm the tree is clean (U3's commit landed). Run `mise run p:site:version`
   first — it refuses a dirty tree.
2. `plugins/vwf/.claude-plugin/plugin.json` — `version`: the next minor above
   the current value, skipping a 13 or 17 minor.
3. `mise run p:plugins:marketplace` so `.claude-plugin/marketplace.json` pins
   the new vwf ref; the dev manifest regenerates too.
4. Run the full wave gate.

## Verification

- Every line of `index.md`'s Wave gate green, in order.
- `command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json site/package.json`
  shows the two new values, none with a 13 or 17 component.
- `command grep -n "vwf-v" .claude-plugin/marketplace.json` shows the new ref.
- The orchestrator's three checks (index.md, "Gates the orchestrator keeps")
  repeated and green.

## Guardrails

- Touch nothing else. No doc, no skill, no stackgen file.
- Do not run `p:i:version`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf minor, site patch — feedback gaps` — written by the orchestrator
after the wave gate, not by the unit; the orchestrator fills the numbers. Type
from `.config/git-conventional-commits.yaml` (`ops`; no scopes).
