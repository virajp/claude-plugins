# U11 — Gates and bump: stackgen 1.3.0, the generators, the full gate, target-verifier

- **Wave:** 4
- **Depends on:** U10
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`.
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/.claude-plugin/plugin.json`;
  `.claude/skills/release/SKILL.md` §versions (what a minor bump means here and
  that a tracked version is plain `X.Y.Z`); `.claude/docs/dev-marketplace.md`
  (what `plugins:marketplace` regenerates and that the dev manifest is
  gitignored).
- **Lazy-load:** `.claude/agents/target-verifier.md` (what to pass it).

## Ruling

D16: "stackgen bumps to `1.3.0` (minor: new menu entries), untagged." Consent:
"Release `stackgen` publicly — none (minor bump to `1.3.0` recorded, no tag)".
vwf is not touched by this plan and is **not** bumped.

Consent, local stage: "yes" — but the local stage is the **orchestrator's**,
after landing, not this unit's. This unit never runs `plugins:local`.

## Edits

1. **`plugins/stackgen/.claude-plugin/plugin.json`** — `"version": "1.2.1"` →
   `"1.3.0"`. Nothing else in the file.
2. **Run `mise run plugins:marketplace`** — regenerates
   `.claude-plugin/marketplace.json` (the stackgen entry's tag ref becomes
   `stackgen-v1.3.0`) and the gitignored dev manifest. Stage the committed file
   only.
3. **Run `mise run plugins:inventory`** — regenerates
   `plugins/stackgen/stacks/inventory.md`: the header should read **49 packs, 45
   bundles, 12 kinds** (42+7, 38+7, kinds unchanged); the seven new pack rows
   carry categories `key-value`, `object-storage`, `sql`, `database-proxy`,
   `vector`, `ingestion`, `analytics`; the seven bundle rows show `backing` and
   two components each. If the orchestrator already regenerated it at the wave-2
   boundary, this run produces no diff — say so.
4. **Run the full wave gate** and report each line's exit status:
   `mise run plugins:marketplace --check`, `mise run plugins:inventory --check`,
   `mise run plugins:check`, `mise run plugins:shellcheck`, `pnpm vitest run`,
   `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
   `mise run plugins:npm-normalize-test`, `mise run site:check`.
5. **Run `target-verifier`** (the agent, from inside this unit) with: "stackgen
   bumped to 1.3.0; seven new `cloud-service` packs (`kv`, `r2`, `d1`,
   `hyperdrive`, `vectorize`, `pipelines`, `analytics-engine`) and seven new
   bundles `cloudflare-<slug>`; the Cloudflare provider pack's prose changed;
   the taxonomy grew. Prove, hermetically (`CLAUDE_CONFIG_DIR` under `/tmp`),
   that installing stackgen from the dev marketplace lands all seven pack
   directories and seven bundle files under the installed plugin's `stacks/`,
   that `stacks/inventory.md` in the installed copy reads 49 packs, and that an
   uninstall leaves nothing behind (report `.orphaned_at` residue as the known
   pre-existing claude behaviour, not a failure)." Relay its report verbatim in
   your return block's `DECIDED:` lines, one per finding.

## Verification

- `grep -n '"version": "1.3.0"' plugins/stackgen/.claude-plugin/plugin.json`
  hits once; `grep -c 'stackgen-v1.3.0' .claude-plugin/marketplace.json` ≥ 1.
- `grep -n '49 packs, 45 bundles, 12 kinds' plugins/stackgen/stacks/inventory.md`
  hits once.
- Every gate line in edit 4 exits 0. If one does not, stop, report the output in
  full in your return block, and do not attempt a fix outside your owned files —
  the orchestrator routes it to the owning unit.
- `git status --porcelain` shows only your three owned files changed (plus
  nothing under `.dev-marketplace/`, which is gitignored).
- target-verifier's report shows install and uninstall both pass.

## Guardrails

- Do not bump vwf. Do not touch any pack, bundle, asset or doc.
- Do not run `plugins:local`, `plugins:release`, `i:release`, `site:release`,
  `git commit`, `git tag`, or anything that reaches outside the worktree.
- `plugin.json` is JSON — edit with Edit, keep the key order and trailing
  newline.
- A tracked plugin version is plain `X.Y.Z`; never write `1.3.0+N` here.
- On this machine `git commit` needs `mise x --` in front and heredoc bodies;
  irrelevant to you — you never commit.

## Commit

`ops: bump stackgen to 1.3.0 — the Cloudflare storage and data packs` — written
by the orchestrator after the wave gate, not by the unit.
