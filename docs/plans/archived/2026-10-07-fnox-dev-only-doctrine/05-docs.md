# U5 — Docs and the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-07-fnox-development-only.md` (new),
  `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
  (one line)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (standalone mode); `plugins/vwf/assets/memory.md` (the decisions doc shape);
  one recent file in `docs/memory/decisions/` as a model.

## Ruling

> D1 — fnox manages secrets for the development environment only. The OS
> keychain is the default provider; any single secret may instead reference a
> fnox-supported cloud store (mixed per secret). No encrypted secret ever enters
> a repo: no age, no KMS, no committed ciphertext. Staging and production never
> run mise or fnox — their secrets come from the cloud provider. CI's secrets
> come from the forge (GitHub or GitLab).

> D2 — This plan changes doctrine only. The fnox config shape — development and
> `ci` profiles, `FNOX_PROFILE`, the `setup:secrets` prompt — belongs to
> bootstrap, which renders `.config/fnox.toml` and `setup:secrets` as a core
> tool; it is parked there.

> D4 — Delete `hooks/fnox-ciphertext-guard.sh` and
> `skills/fnox/references/permanent-ciphertext.md`, and the four-condition
> doctrine. No cleanup mechanism: a previously materialized hook is inert and
> may be deleted by hand.

> D8 — Both reversals are recorded as
> `docs/memory/decisions/2026-10-07-fnox-development-only.md`, including D2's
> split with bootstrap; the 2026-09-06 decision doc gains one "superseded in
> part by" line.

## Edits

1. Run `vwf:docs-sync` over the branch delta since the branch base (exclude
   `docs/plans/`) and apply its findings, plus every `DOCS FALSIFIED:` line the
   wave-1 units returned (the orchestrator appends them to this prompt).
2. **`site/src/content/docs/plugins/stackgen.md`** — about `:618-621` (the
   encrypt-into-git conditions and "`fnox-ciphertext-guard.sh` is the first hook
   script any pack ships") — rewrite for D1 and D4; the other fnox mentions
   (about `:742,967,1225,1251`) — fix any that give CI to fnox or describe the
   encrypted mode; doppler mentions (about `:240-241`, the `setup:doppler` row
   about `:1316`) — remove a live one, keep a past-tense history line.
3. **`site/src/content/docs/how-to/operate/choosing-your-stack.md`** (about
   `:119-122`) — fnox is the development secrets provider; CI and deployed
   environments per D1.
4. **`.claude/skills/stackgen-plugin/SKILL.md`** — about `:244,247,352` (fnox
   and doppler mentions) and about `:411` ("the fnox pack's git pre-commit
   gate") — the guard no longer ships; fix any count or list that included it.
5. Write the decisions doc (D8): the ruling (D1, D3, D4), the two reversed rules
   and their old rationale, the split with bootstrap (D2 — the config shape is
   parked in the bootstrap repo), and the rejected alternatives
   (encrypt-into-git kept for staging; a guard hook; fnox in CI; a full config
   rework in the pack; retiring the pack now; a sync cleanup rule). Add to the
   2026-09-06 doc one line under its header: superseded in part — CI no longer
   takes secrets from fnox — by the new doc.

## Verification

- `grep -rn -i 'ciphertext\|encrypt-into-git' site/src/content/docs .claude readme.md CLAUDE.md`
  prints nothing, except a line stating the mode retired.
- `mise run p:site:check` green; `mise run code:precommit` green (dprint re-pads
  tables); the full wave gate.

## Guardrails

- Touch nothing under `plugins/` or `docs/plans/`; a falsified passage there is
  a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: the manual and a decisions doc for development-only fnox`
