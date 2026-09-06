# U8 — Gates and bump: stackgen one minor up, the generators, the full gate, target-verifier

- **Wave:** 4
- **Depends on:** U7
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`.
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/.claude-plugin/plugin.json` (the run-time
  version — the number you bump **from**); the committed
  `plugins/stackgen/stacks/inventory.md` header line (the counts you add
  **to**); `.claude/skills/release/SKILL.md` §versions (a minor bump; a tracked
  version is plain `X.Y.Z`); `.claude/docs/dev-marketplace.md` (what
  `plugins:marketplace` regenerates and that the dev manifest is gitignored).
- **Lazy-load:** `.claude/agents/target-verifier.md` (what to pass it).

## Ruling

D17: "Every new pack and bundle is `0.1.0`; stackgen bumps one **minor** from
its run-time value (expected `1.4.0` → `1.5.0`), untagged." Consent: "Release
`stackgen` publicly — none (minor bump recorded — see the version rule — no
tag)". vwf is not touched by this plan and is **not** bumped.

The version rule from `index.md`: "the gates unit bumps the **minor from
whatever `plugin.json` reads at run time**. In order (A → B → C) that is `1.4.0`
→ `1.5.0`; the inventory header then reads **58 packs, 54 bundles, 12 kinds** —
five packs (four `cloud-service`, one `framework`) and five bundles (four cloud
bundles, one language bundle) more than whatever the committed header reads at
run time."

Consent, local stage: "yes" — but the local stage is the **orchestrator's**,
after landing, not this unit's. This unit never runs `plugins:local`.

## Edits

1. **`plugins/stackgen/.claude-plugin/plugin.json`** — read `"version"`; bump
   the minor and zero the patch (`1.4.0` → `1.5.0`; if the file reads `1.3.0`
   because plan B has not landed, that is a **preflight failure** — this plan
   requires B — return `UNRESOLVED:` rather than bumping). Nothing else in the
   file.
2. **Run `mise run plugins:marketplace`** — regenerates
   `.claude-plugin/marketplace.json` (the stackgen entry's tag ref becomes
   `stackgen-v<new>`) and the gitignored dev manifest. Stage the committed file
   only.
3. **Run `mise run plugins:inventory`** — regenerates
   `plugins/stackgen/stacks/inventory.md`: the header's pack count is the
   previous plus 5 and the bundle count the previous plus 5, kinds unchanged at
   12; the four new `cloud-service` rows carry categories `inference`,
   `ai-gateway`, `retrieval`, `browser`; the `framework/cloudflare-agents` row
   carries `agent-sdk` and kind `language-bundle`; the four cloud bundle rows
   show `backing` with two components each; the `typescript-cloudflare-agents`
   row shows `project`, five components. If the orchestrator already regenerated
   it at the wave-2 boundary, this run produces no diff — say so.
4. **Run the full wave gate** and report each line's exit status:
   `mise run plugins:marketplace --check`, `mise run plugins:inventory --check`,
   `mise run plugins:check`, `mise run plugins:shellcheck`, `pnpm vitest run`,
   `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
   `mise run plugins:npm-normalize-test`, `mise run site:check`.
5. **Run `target-verifier`** (the agent, from inside this unit) with: "stackgen
   bumped to <new>; four new `cloud-service` packs (`workers-ai`, `ai-gateway`,
   `ai-search`, `browser-rendering`) with bundles `cloudflare-<slug>`, and one
   new `framework` pack (`cloudflare-agents`) with the bundle
   `typescript-cloudflare-agents`; the Cloudflare provider pack's prose changed.
   Prove, hermetically (`CLAUDE_CONFIG_DIR` under `/tmp`), that installing
   stackgen from the dev marketplace lands all five pack directories and five
   bundle files under the installed plugin's `stacks/`, that
   `stacks/inventory.md` in the installed copy reads the new pack count, and
   that an uninstall leaves nothing behind (report `.orphaned_at` residue as the
   known pre-existing claude behaviour, not a failure)." Relay its report
   verbatim in your return block's `DECIDED:` lines, one per finding.

## Verification

- `grep -n '"version": "<new>"' plugins/stackgen/.claude-plugin/plugin.json`
  hits once; `grep -c 'stackgen-v<new>' .claude-plugin/marketplace.json` ≥ 1.
- The inventory header reads previous+5 packs, previous+5 bundles, 12 kinds
  (expected `58 packs, 54 bundles, 12 kinds`).
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
- A tracked plugin version is plain `X.Y.Z`; never write `+N` here.
- On this machine `git commit` needs `mise x --` in front and heredoc bodies;
  irrelevant to you — you never commit.

## Commit

`ops: bump stackgen — the Cloudflare AI packs and the Agents SDK framework` —
written by the orchestrator after the wave gate, not by the unit.
