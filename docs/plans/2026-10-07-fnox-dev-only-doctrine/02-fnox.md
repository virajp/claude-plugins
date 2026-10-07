# U2 — The fnox pack's doctrine: development only, no ciphertext

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/capability-provider/fnox/**` except the
  `version:` line of `pack.yaml`, the `config/**` tree and the `templates/**`
  tree; `plugins/stackgen/stacks/bundles/fnox.md` except its `components:` pin;
  `plugins/stackgen/assets/output-tree.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; the pack's `config/fnox.toml`
  and `config/.config/mise/tasks/setup/secrets` (read only — the prose must
  describe what they ship); `plugins/stackgen/assets/contracts/secrets.md` (U1
  rewrites it concurrently — cite it by its rules, do not restate it).
- **Lazy-load:** Context7 `/jdx/fnox` for every fnox CLI behaviour you state.

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
> tool; it is parked there. The pack's `config/fnox.toml`,
> `config/.config/mise/tasks/setup/secrets` and `templates/` stay unchanged.
> Doctrine prose describes what the pack ships today and names the profile shape
> as bootstrap's.

> D4 — Delete `hooks/fnox-ciphertext-guard.sh` and
> `skills/fnox/references/permanent-ciphertext.md`, and the four-condition
> doctrine (gitleaks path allowlist, mempalace exclude of `fnox.toml`,
> `.gitignore` age lines). No cleanup mechanism: the pack's docs say a
> previously materialized `.claude/hooks/fnox-ciphertext-guard.sh` is inert
> while no age/KMS provider exists and may be deleted by hand.

> D7 (the part that reaches this unit) — Mid-run, a commit whose diff stales
> `inventory.md` (U2's summary) has the orchestrator run
> `mise run p:plugins:inventory` and stage the result in that same commit; no
> unit edits it by hand.

## Edits

1. **`pack.yaml`** — rewrite `summary:`: development-only; the OS keychain, or a
   reference into your own cloud store; nothing in the repo. Drop "encrypted
   into git" and "a public key plus a re-encrypt". Update any comment that
   describes CI or the encrypted mode. Leave `version:` alone (U6).
2. **`hooks/fnox-ciphertext-guard.sh`** — delete with `rm`; remove the `hooks/`
   directory if it is then empty.
3. **`conventions.md`** — rewrite: development only (D1); the keychain default
   and per-secret cloud references; tasks wrap with `fnox exec --`; CI takes the
   forge's variables and staging/production the cloud provider's store; nothing
   encrypted in the repo; the naming table stays. "What this pack writes" drops
   the hook row. Drop the age identity, `FNOX_AGE_KEY`, recipients,
   `fnox reencrypt`, "The shipped default is the keychain, not ciphertext" and
   every guard paragraph. Add one sentence naming the profile shape (development
   and `ci` profiles, `FNOX_PROFILE`) as the setup tool's — bootstrap's — not
   this pack's. Add a short **"Moving from the encrypted mode"** note: a repo
   that materialized an earlier version keeps an inert
   `.claude/hooks/fnox-ciphertext-guard.sh` — delete it by hand, and
   `/stackgen:stackgen-sync` then drops its lock record; a hand-added
   `fnox-ciphertext` pre-commit entry, a gitleaks allowlist line naming
   `fnox.toml` and `.gitignore` age lines are removed by hand too; any value
   once committed is rotated at its source.
4. **`skills/fnox/SKILL.md`** — description and table: drop permanent
   ciphertext, the guard and the CI credential; the rule becomes "nothing in
   `fnox.toml` is a value — every entry names a keychain or cloud provider";
   drop the `permanent-ciphertext.md` link. In `paths:`, drop globs that exist
   only for the encrypted mode (`**/.fnox/**`, `**/gitleaks.toml`,
   `**/mempalace.yaml`), keep `fnox.toml` and `fnox.local.toml`.
5. **`skills/fnox/references/`** — delete `permanent-ciphertext.md` with `rm`;
   rewrite `contract-satisfaction.md` clause by clause against U1's contract (no
   encrypt-into-git section and none of the hand-applied gitleaks, gitignore,
   pre-commit or mempalace blocks; clause 1 — development only, with the profile
   shape named as bootstrap's; clause 2 — CI does not use fnox; onboarding is
   "populate your keychain via `setup:secrets`", offboarding is revoking the
   person's own development credentials at their source); `access-shape.md` (no
   identity, no `FNOX_AGE_KEY`, no production profile; the keychain and cloud
   credentials; the `environment.md` issuer reads `fnox (keychain)` or
   `fnox → <cloud store>`); `local-stack.md` (development only; `fnox exec --`
   wraps; CI runs the same task with the forge's variables); `cost-shape.md`
   (the keychain has no bill; a cloud reference inherits the store's request
   bill — keep the resolve-once advice; drop the re-encrypt, CI-decryption and
   encrypt-mode text); `pick-and-trade.md` (one development provider; when a
   cloud reference beats the keychain; drop the encrypted half of the storage
   modes).
6. **`stacks/bundles/fnox.md`** — rewrite the prose to match (development-only,
   keychain or cloud reference, no ciphertext, no guard, CI from the forge);
   leave the frontmatter `components:` pin alone (U6).
7. **`plugins/stackgen/assets/output-tree.md`** — the "Precedent" passage (about
   `:277-282`) that names the fnox and pnpm packs as shipping hook scripts: only
   pnpm does now. Change nothing else in the file.

## Verification

- `grep -rn -i 'age\.txt\|FNOX_AGE_KEY\|ciphertext\|encrypt-into-git\|recipients\|reencrypt\|re-encrypt' plugins/stackgen/stacks/capability-provider/fnox plugins/stackgen/stacks/bundles/fnox.md plugins/stackgen/assets/output-tree.md`
  prints only lines of the "Moving from the encrypted mode" note.
- `test ! -e plugins/stackgen/stacks/capability-provider/fnox/hooks/fnox-ciphertext-guard.sh`
- `test ! -e plugins/stackgen/stacks/capability-provider/fnox/skills/fnox/references/permanent-ciphertext.md`
- `grep -rn 'permanent-ciphertext' plugins/stackgen` prints nothing.
- `git diff --quiet -- plugins/stackgen/stacks/capability-provider/fnox/config plugins/stackgen/stacks/capability-provider/fnox/templates`
  (D2).
- `mise run p:plugins:check` green; the full wave gate (the orchestrator
  regenerates `inventory.md` in this unit's commit, D7).

## Guardrails

- Touch nothing outside Owns — in particular not `pack.yaml`'s `version:` line,
  `config/**`, `templates/**`, the bundle's pin (U6), nor `inventory.md`
  (orchestrator, D7).
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand; keep
  code spans on one line; never end a table cell in a bare `*`.
- No plugin-relative citation in anything that lands (checker rule 13).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: the fnox pack is development-only with no committed ciphertext`
