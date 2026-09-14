# U7 — gates and bump

- **Wave:** 4
- **Depends on:** U6
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate; the two manifests'
  current `version` fields **as the worktree holds them** — earlier groups may
  have moved them.
- **Lazy-load:** `.config/mise/tasks/p/site/version` (bare; patch default;
  refuses a dirty tree).

## Ruling

Consent block: "Release vwf publicly — minor — the next minor above the value
the tree holds when U7 runs, never a 13 or 17 component." "Release stackgen
publicly — minor — the next minor above the value the tree holds when U7 runs,
never a 13 or 17 component." "Release site publicly — patch —
`mise run p:site:version`." "Release installer publicly — none."

The 13/17 rule (group A's decision 1): no version component may equal 13 or 17;
a bump that would land on one goes one further.

## Edits

1. Confirm the tree is clean (U6's commit landed). Run `mise run p:site:version`
   first — it refuses a dirty tree.
2. `plugins/vwf/.claude-plugin/plugin.json` — `version`: the next minor above
   the current value, skipping a 13 or 17 minor.
3. `plugins/stackgen/.claude-plugin/plugin.json` — `version`: the next minor
   above the current value, skipping a 13 or 17 minor.
4. `mise run p:plugins:marketplace` so `.claude-plugin/marketplace.json` pins
   the two new refs; the dev manifest regenerates too.
5. Run the full wave gate.

## Verification

- Every line of `index.md`'s Wave gate green, in order.
- `command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json plugins/stackgen/.claude-plugin/plugin.json site/package.json`
  shows the three new values, none with a 13 or 17 component.
- `command grep -n "vwf-v\|stackgen-v" .claude-plugin/marketplace.json` shows
  the two new refs.
- The orchestrator's five checks (index.md, "Gates the orchestrator keeps")
  repeated and green.

## Guardrails

- Touch nothing else. No doc, no skill, no pack — U4 and U5 set the pack
  versions and the inventory.
- Do not run `p:i:version`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf minor, stackgen minor, site patch — audit capability` — written
by the orchestrator after the wave gate, not by the unit; the orchestrator fills
the numbers. Type from `.config/git-conventional-commits.yaml` (`ops`; no
scopes).
