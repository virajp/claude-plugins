# U2 — The fnox pack: development only, keychain first, no ciphertext

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/capability-provider/fnox/**` except the
  `version:` line of `pack.yaml`; `plugins/stackgen/stacks/bundles/fnox.md`
  except its `components:` pin
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom;
  `plugins/stackgen/assets/contracts/secrets.md` (U1 rewrites it concurrently —
  cite it, do not restate it); `plugins/stackgen/assets/pack-format.md` (a
  pack's `templates/` folder and `values:`, as the template chain left it); the
  pack's `templates/.config/mise/conf.d/fnox/mise.toml`.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/references/mise.md` (the
  pack folder and pins); Context7 `/jdx/fnox` for every fnox CLI flag you write;
  Context7 `/jdx/mise` for the template syntax.

## Ruling

> D1 — fnox manages secrets for the development environment only. The OS
> keychain is the default provider; any single secret may instead reference a
> fnox-supported cloud store (mixed per secret). No encrypted secret ever enters
> a repo: no age, no KMS, no committed ciphertext.

> D2 — `fnox.toml` declares two profiles: `[profiles.development.secrets]` holds
> every dev secret, `[profiles.ci.secrets]` is empty on purpose, and the
> top-level `[secrets]` is empty on purpose because every profile inherits it.
> No `staging` or `production` profile. `FNOX_PROFILE` is set in the fnox pack's
> `templates/.config/mise/conf.d/fnox/mise.toml` `[env]` (loaded in every
> environment) with the value
> `{% if get_env(name='CI', default='') != '' %}ci{% else %}development{% endif %}`.

> D3 — Every task that needs secrets runs `fnox exec -- <cmd>` unconditionally;
> no per-task CI condition. In CI the empty `ci` profile resolves nothing and
> the forge's variables pass through.

> D4 — Staging and production never run mise or fnox — their secrets come from
> the cloud provider. CI's secrets come from the forge (GitHub or GitLab).

> D5 — Delete `hooks/fnox-ciphertext-guard.sh` and the four-condition doctrine
> (gitleaks path allowlist, mempalace exclude of `fnox.toml`, `.gitignore` age
> lines). Doctrine only — the skill states the rule; gitleaks still catches a
> plaintext value.

> D6 — The task lists the development profile's declared secrets that are
> missing, and prompts for each with hidden input via `fnox set NAME`. It tests
> presence by exit status only —
> `FNOX_IF_MISSING=error FNOX_PROFILE=development fnox get NAME` with stdout and
> stderr discarded — or a dedicated check command if Context7 shows one. It
> never prints a value. Cloud-referenced secrets are reported, never prompted.

## Edits

1. **`pack.yaml`** — rewrite `summary:` (development-only; keychain, or a
   reference into your own cloud store; nothing in the repo). It carries no
   `tool-config:` list (the template chain retired it). Update the comments that
   mention the wrapper or harness if they describe CI. Leave `version:` alone
   (U9). 1a. **`templates/.config/mise/conf.d/fnox/mise.toml`** — keep the
   `fnox` pin as the chain left it; add an `[env]` table with
   `FNOX_PROFILE = "{% if get_env(name='CI', default='') != '' %}ci{% else %}development{% endif %}"`
   (D2), quoted as a TOML basic string. The `@@` engine passes the Tera through;
   no `@@` name is needed, so no `values:` entry.
2. **`config/fnox.toml`** — top-level `if_missing = "warn"` stays; the keychain
   provider stays; an empty top-level `[secrets]` with a comment saying why
   (every profile inherits it); `[profiles.development.secrets]` with the
   commented example entry; an empty `[profiles.ci.secrets]` with a comment
   (CI's values come from the forge). Add a commented example of a cloud
   provider and one secret referencing it (D1). Verify with fnox (Context7, and
   `fnox` itself if installed, in a `mktemp -d` scratch dir) that a declared
   empty profile is accepted; if it is not, keep `ci` declared by the smallest
   form fnox accepts and say so in `DECIDED:`.
3. **`config/.config/mise/tasks/setup/secrets`** — rewrite per D6: keep the
   header, `set -euo pipefail`, the `helpers` source and the skip-with-warning
   paths (fnox absent, `fnox.toml` absent). Then, for the `development` profile:
   enumerate declared names (`fnox list`, names only — never `-V`), classify
   keychain-backed vs cloud-referenced, test each keychain-backed one by exit
   status with all output discarded, and for each missing one print its name and
   run `fnox set NAME` with the keychain provider so fnox prompts (hidden input;
   stdin works when piped). Report cloud-referenced names and their provider
   only. Skip prompting entirely when `CI` is set or stdin is not a terminal
   **and** nothing is piped — report the missing names instead. Never `fnox get`
   to a terminal, never `set -x`. bash, BSD-tool safe; shellcheck and shfmt
   clean.
4. **`hooks/fnox-ciphertext-guard.sh`** — delete with `rm`; remove the `hooks/`
   directory if it is then empty.
5. **`conventions.md`** — rewrite: development only (D1, D4); profiles and the
   automatic `FNOX_PROFILE` (D2); tasks wrap with `fnox exec --` (D3); nothing
   encrypted in the repo; non-secret config in the mise env; naming table stays;
   "What this pack writes" drops the hook row; drop "The shipped default is the
   keychain, not ciphertext" and the guard paragraphs; add a short "Moving from
   the encrypted mode" note: run `/stackgen:stackgen-sync`, which offers to
   remove the old guard and the gitleaks allowlist line naming `fnox.toml`, and
   flags any age/KMS provider or top-level secret to move by hand; values once
   committed are rotated at their source. Note: the hand-added `fnox-ciphertext`
   pre-commit hook shows up as tool-config's diff row on `/vwf:setup reshape` —
   answer `ok` to drop it.
6. **`skills/fnox/SKILL.md`** — description and table: drop permanent ciphertext
   and the guard; the `paths:` list drops `**/.fnox/**`, `**/gitleaks.toml`,
   `**/mempalace.yaml` (keep `fnox.toml`, `fnox.local.toml`); the second rule
   becomes "nothing in `fnox.toml` is a value — every entry names a keychain or
   cloud provider".
7. **`skills/fnox/references/`** — delete `permanent-ciphertext.md`; rewrite
   `contract-satisfaction.md` clause by clause against the new contract (no
   encrypt-into-git section; clause 1 is D2; clause 2 is "CI does not use fnox";
   clause 3 onboarding is "populate your keychain via `setup:secrets`",
   offboarding is revoking the person's own development credentials at their
   source); rewrite `access-shape.md` (no identity, no `FNOX_AGE_KEY`; the
   keychain and cloud credentials; `environment.md` issuer reads
   `fnox (keychain)` or `fnox → <cloud store>`), `local-stack.md` (development
   profile, `fnox exec --` wraps, CI runs the same task with forge variables and
   the empty `ci` profile), `cost-shape.md` (keychain has no bill; cloud
   references inherit the store's request bill — keep the resolve-once advice;
   drop CI call-count and encrypt-mode text), `pick-and-trade.md` (one
   development provider; when a cloud reference beats the keychain; drop the two
   storage modes section's encrypt half and the hosted-vs-local ranking).
8. **`stacks/bundles/fnox.md`** — rewrite the prose to match (development-only,
   keychain or cloud reference, no ciphertext, no guard, profiles automatic);
   leave the frontmatter `components:` pin alone (U9).

## Verification

- `grep -rn -i 'age\.txt\|FNOX_AGE_KEY\|ciphertext\|encrypt-into-git\|recipients\|reencrypt\|staging\|production' plugins/stackgen/stacks/capability-provider/fnox plugins/stackgen/stacks/bundles/fnox.md`
  prints only sentences stating that staging/production take their secrets from
  the cloud provider, or the "Moving from the encrypted mode" note.
- `test ! -e plugins/stackgen/stacks/capability-provider/fnox/hooks/fnox-ciphertext-guard.sh`
- `test ! -e plugins/stackgen/stacks/capability-provider/fnox/skills/fnox/references/permanent-ciphertext.md`
- `grep -n 'FNOX_PROFILE' plugins/stackgen/stacks/capability-provider/fnox/templates/.config/mise/conf.d/fnox/mise.toml`
  prints the entry.
- `mise x -- shellcheck -x plugins/stackgen/stacks/capability-provider/fnox/config/.config/mise/tasks/setup/secrets`
  and `mise run p:plugins:check` green; the full wave gate (the orchestrator
  regenerates `inventory.md` in this unit's commit, D14).

## Guardrails

- Touch nothing outside Owns — in particular not `pack.yaml`'s `version:` line
  or the bundle's pin (U9), nor `inventory.md` (orchestrator, D14).
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand; keep
  code spans on one line; never end a table cell in a bare `*`.
- `plugins/*/stacks/*/*/config/` is payload, excluded from this repo's formatter
  — never run this repo's dprint over it.
- Never run a command in this checkout that writes the real `fnox` keychain
  service; scratch checks use a `mktemp -d` dir and a throwaway service name.
- No plugin-relative citation in anything that lands (checker rule 13).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: fnox is the development-only secrets provider`
