# U8 — gates and bump

- **Wave:** 3
- **Depends on:** U7
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`, `site/package.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Read first:** `index.md`'s Consent block and Wave gate.
- **Lazy-load:** `.config/mise/tasks/p/site/version` (bare; patch is its
  default; refuses a dirty tree).

## Ruling

Consent block: "Release vwf publicly — minor —
`plugins/vwf/.claude-plugin/plugin.json`, `19.20.0` → `19.21.0`, by editing the
`version` field." "Release site publicly — patch — `mise run p:site:version`
(bare; patch is its default; it refuses a dirty tree, so U8 runs it first),
`1.1.9` → `1.1.10`." "Release installer publicly — none."

Decision 1: no component may equal 13 or 17. `21` and `10` are fine.

## Edits

1. Confirm the tree is clean (U7's commit landed). Run `mise run p:site:version`
   first — it refuses a dirty tree. Expect `1.1.10`; the task now skips 13 and
   17 by itself (U5), which does not trigger here.
2. Edit `plugins/vwf/.claude-plugin/plugin.json` `version` to `19.21.0`. Add
   `backlog` to its `keywords` list, after `archive`.
3. Run `mise run p:plugins:marketplace` so `.claude-plugin/marketplace.json`
   pins `vwf-v19.21.0`; the dev manifest is gitignored and regenerates too.
4. Run the full wave gate.

## Verification

- Every line of `index.md`'s Wave gate green, in order.
- `command grep -n '"version"' plugins/vwf/.claude-plugin/plugin.json site/package.json`
  shows `19.21.0` and `1.1.10`.
- `command grep -n "vwf-v19.21.0" .claude-plugin/marketplace.json` hits.
- The two landed checks, repeated: the U4 vitest case name passes; the U5
  scratch guard line from `index.md`'s "Gates the orchestrator keeps" prints
  three `refused` and three `allowed`.
- `claude plugin validate plugins/vwf` (the strict form the last runs used)
  lists `backlog` among the skills.

## Guardrails

- Touch nothing else. No doc, no skill.
- Do not run `p:i:version` — the installer is not released.
- Delete with `rm`, never `git rm`.

## Commit

`ops: bump vwf 19.21.0, site 1.1.10 — backlog skill, plan hand-off, 13/17 rule`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`ops`; no scopes).
