# U1 — The mise pack drops the key

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`,
  `plugins/stackgen/stacks/bundles/mise.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `.claude/skills/stackgen-plugin/SKILL.md` §Documentation (the
  pack-bump rule); `.claude/skills/plugin-authoring/SKILL.md` (the payload
  formatting trap).

## Ruling

Decision 1, quoted:

> Reword `SKILL.md:145` to name no example: the `[env]` tier of `mise.toml`
> holds only what is identical everywhere — today that is nothing but the marked
> positions — and the sentence continues with `REPO_NAME` unchanged

Decision 2, quoted:

> `toolchain-manager/mise` bumps **patch**, `1.2.2` → `1.2.3` — a payload line
> removed, no new marked position; the bundle pin in `bundles/mise.md` follows,
> and U1 runs `mise run p:plugins:inventory` so the three land in one commit

Decision 5, quoted:

> The two-line comment above the removed line stays (it introduces the tier; the
> marked-position comment below stands alone); the one-line comment in
> `config-files.md:81` stays for the same reason

## Edits

1. **`config/.config/mise.toml`** — delete the line `DISABLE_TELEMETRY = 1`
   (`:94`) and nothing else. The two comment lines above it stay; the blank line
   that separates them from the `REPO_NAME` marked-position comment stays, so
   the block reads: comment, comment, blank, `# A MARKED POSITION…`. Byte-edit
   the line out; do not retype the file.
2. **`skills/mise/references/config-files.md`** — delete the line
   `DISABLE_TELEMETRY = 1` (`:82`) inside the quoted block; the comment
   `# Only what is identical in every environment.` above it stays, followed by
   the existing blank line and the `REPO_NAME` comment.
3. **`skills/mise/SKILL.md`** — at `:145`, replace "`mise.toml` `[env]` — only
   what is identical everywhere (`DISABLE_TELEMETRY`), plus **`REPO_NAME`**:"
   with "`mise.toml` `[env]` — only what is identical everywhere — today nothing
   but the marked positions — starting with **`REPO_NAME`**:". The rest of the
   bullet is unchanged. Re-fold the paragraph by hand to the surrounding width
   (this tree is not dprint-formatted).
4. **`pack.yaml`** — `version: 1.2.2` → `version: 1.2.3`; nothing else.
5. **`plugins/stackgen/stacks/bundles/mise.md:7`** —
   `toolchain-manager/mise@1.2.2` → `toolchain-manager/mise@1.2.3`.
6. **`plugins/stackgen/stacks/inventory.md`** — run
   `mise run p:plugins:inventory`; the diff is the two `1.2.2` cells becoming
   `1.2.3`. Hand-edit nothing in it.

## Verification

- `grep -rn DISABLE_TELEMETRY plugins/` returns nothing.
- `grep -c '1.2.3' plugins/stackgen/stacks/bundles/mise.md` is 1;
  `grep -c 'mise@1.2.3\|| 1.2.3 |' plugins/stackgen/stacks/inventory.md` is 2.
- `mise run p:plugins:inventory -- --check` green.
- `mise run p:plugins:check` green (rule 11 walks the payload).
- `mise run code:precommit` green.
- `git diff --stat` names exactly the six owned files.

## Guardrails

- Touch nothing outside the six owned paths — not this repo's own
  `.config/mise.toml`, not `mise.dev.toml`/`mise.ci.toml`/`mise.test.toml` in
  the payload, not `plugin.json`, not a doc outside the pack.
- Never run a formatter over `config/` — it is payload, excluded on purpose; the
  shipped dprint config differs from this repo's.
- Do not run `p:plugins:marketplace` — U3's.
- No commit, no staging. Delete with `rm`, never `git rm` (nothing is deleted
  here).

## Commit

`fix: mise pack drops DISABLE_TELEMETRY from the generated mise.toml — pack 1.2.3`
— written by the orchestrator after the wave gate. `fix` is in
`.config/git-conventional-commits.yaml`.
