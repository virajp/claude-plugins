# U7 — Gates and bump: stackgen's next minor, the generators, the full gate, target-verifier

- **Wave:** 4
- **Depends on:** U6
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`.
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/.claude-plugin/plugin.json` (the version
  **as it reads now** — the bump is relative);
  `plugins/stackgen/stacks/inventory.md:10` (the header counts as they read
  now); `.claude/skills/release/SKILL.md` §versions (what a minor bump means
  here and that a tracked version is plain `X.Y.Z`);
  `.claude/docs/dev-marketplace.md` (what `plugins:marketplace` regenerates and
  that the dev manifest is gitignored).
- **Lazy-load:** `.claude/agents/target-verifier.md` (what to pass it).

## Ruling

B13: "stackgen bumps the **minor from whatever `plugin.json` reads at run time**
(expected `1.4.0`), untagged." Consent: "Release `stackgen` publicly — none
(minor bump recorded, expected `1.4.0`, no tag)". Plan D may have landed before
this plan, in which case `plugin.json` reads `1.4.0` and you write `1.5.0`. vwf
is not touched by this plan and is **not** bumped.

Consent, local stage: "yes" — but the local stage is the **orchestrator's**,
after landing, not this unit's. This unit never runs `plugins:local`.

## Edits

1. **`plugins/stackgen/.claude-plugin/plugin.json`** — read the current
   `"version"`, increment the minor, reset the patch to `0` (`1.3.0` → `1.4.0`;
   `1.4.0` → `1.5.0`). Nothing else in the file.
2. **Run `mise run plugins:marketplace`** — regenerates
   `.claude-plugin/marketplace.json` (the stackgen entry's tag ref becomes
   `stackgen-v<new>`) and the gitignored dev manifest. Stage the committed file
   only.
3. **Run `mise run plugins:inventory`** — regenerates
   `plugins/stackgen/stacks/inventory.md`: the header grows by **+4 packs, +4
   bundles, kinds unchanged** from what it read before (expected in order: **53
   packs, 49 bundles, 12 kinds**); the four new pack rows carry categories
   `stateful-compute`, `orchestration`, `queue`, `compute`; three bundle rows
   show `backing` and one (`cloudflare-containers`) shows `deploy` with
   `container-image`. If the orchestrator already regenerated it at the wave-2
   boundary, this run produces no diff — say so.
4. **Run the full wave gate** and report each line's exit status:
   `mise run plugins:marketplace --check`, `mise run plugins:inventory --check`,
   `mise run plugins:check`, `mise run plugins:shellcheck`, `pnpm vitest run`,
   `pnpm exec tsc --noEmit -p installer`, `pnpm exec tsc --noEmit -p scripts`,
   `mise run plugins:npm-normalize-test`, `mise run site:check`.
5. **Run `target-verifier`** (the agent, from inside this unit) with: "stackgen
   bumped to <new>; four new `cloud-service` packs (`durable-objects`,
   `workflows`, `queues`, `containers`) and four new bundles
   `cloudflare-<slug>`; `containers` ships a `config/` tier
   (`config/wrangler.jsonc`, `config/.config/mise/tasks/p/_project/deploy`); the
   Cloudflare provider pack's prose changed. Prove, hermetically
   (`CLAUDE_CONFIG_DIR` under `/tmp`), that installing stackgen from the dev
   marketplace lands all four pack directories and four bundle files under the
   installed plugin's `stacks/`, that the installed
   `stacks/cloud-service/containers/config/.config/mise/tasks/p/_project/deploy`
   is executable and `config/wrangler.jsonc` is present, that
   `stacks/inventory.md` in the installed copy reads the new header, and that an
   uninstall leaves nothing behind (report `.orphaned_at` residue as the known
   pre-existing claude behaviour, not a failure)." Relay its report verbatim in
   your return block's `DECIDED:` lines, one per finding.

## Verification

- `grep -n '"version": "<new>"' plugins/stackgen/.claude-plugin/plugin.json`
  hits once; `grep -c 'stackgen-v<new>' .claude-plugin/marketplace.json` ≥ 1.
- The inventory header line reads the old counts +4 / +4 / +0.
- Every gate line in edit 4 exits 0. If one does not, stop, report the output in
  full in your return block, and do not attempt a fix outside your owned files —
  the orchestrator routes it to the owning unit.
- `git status --porcelain` shows only your three owned files changed (plus
  nothing under `.dev-marketplace/`, which is gitignored).
- target-verifier's report shows install and uninstall both pass, and the
  Containers payload files land with the exec bit intact.

## Guardrails

- Do not bump vwf. Do not touch any pack, bundle, asset or doc.
- Do not run `plugins:local`, `plugins:release`, `i:release`, `site:release`,
  `git commit`, `git tag`, or anything that reaches outside the worktree.
- `plugin.json` is JSON — edit with Edit, keep the key order and trailing
  newline.
- A tracked plugin version is plain `X.Y.Z`; never write `1.4.0+N` here.
- Do not hard-code `1.4.0`: read, then increment.
- On this machine `git commit` needs `mise x --` in front and heredoc bodies;
  irrelevant to you — you never commit.

## Commit

`ops: bump stackgen — the Cloudflare compute and orchestration packs` — written
by the orchestrator after the wave gate, not by the unit.
