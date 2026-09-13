# U6 — gates and bump

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate; the two manifests'
  current `version` fields **as the worktree holds them** — group A's plan has
  landed before this run and moved vwf.
- **Lazy-load:** `.config/mise/tasks/p/site/version` (bare; patch default;
  refuses a dirty tree).

## Ruling

Consent block: "Release vwf publicly — minor — the next minor above the value
the tree holds when U6 runs (`19.22.0` if group A shipped `19.21.0`), never a 13
or 17 component." "Release stackgen publicly — patch — `1.9.0` → `1.9.1`."
"Release site publicly — patch — `mise run p:site:version`." "Release installer
publicly — none."

The 13/17 rule (group A's decision 1): no version component may equal 13 or 17;
a bump that would land on one goes one further.

## Edits

1. Confirm the tree is clean (U5's commit landed). Run `mise run p:site:version`
   first — it refuses a dirty tree; the task skips 13 and 17 by itself since
   group A.
2. `plugins/vwf/.claude-plugin/plugin.json` — `version`: the next minor above
   the current value, skipping a 13 or 17 minor.
3. `plugins/stackgen/.claude-plugin/plugin.json` — `version`: `1.9.0` → `1.9.1`
   (if the tree already holds a higher patch, the next patch above it).
4. `mise run p:plugins:marketplace` so `.claude-plugin/marketplace.json` pins
   the two new refs; the dev manifest regenerates too.
5. Run the full wave gate.

## Verification

- Every line of `index.md`'s Wave gate green, in order.
- `command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json plugins/stackgen/.claude-plugin/plugin.json site/package.json`
  shows the three new values, none with a 13 or 17 component.
- `command grep -n "vwf-v\|stackgen-v" .claude-plugin/marketplace.json` shows
  the two new refs.
- The orchestrator's two fixture runs (index.md, "Gates the orchestrator keeps")
  repeated and green.

## Guardrails

- Touch nothing else. No doc, no skill, no pack (U3 bumped the packs).
- Do not run `p:i:version`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf minor, stackgen 1.9.1, site patch — REPO_NAME split` — written by
the orchestrator after the wave gate, not by the unit; the orchestrator fills
the vwf number. Type from `.config/git-conventional-commits.yaml` (`ops`; no
scopes).
