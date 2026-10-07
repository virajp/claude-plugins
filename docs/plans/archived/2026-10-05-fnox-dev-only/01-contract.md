# U1 — The secrets contract states the environment split

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/contracts/secrets.md`,
  `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/skills/tool-config/references/gitleaks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md` (the contract-satisfaction
  topic) — only if an edit needs the named-gap wording.

## Ruling

> D1 — fnox manages secrets for the development environment only. The OS
> keychain is the default provider; any single secret may instead reference a
> fnox-supported cloud store (mixed per secret). No encrypted secret ever enters
> a repo: no age, no KMS, no committed ciphertext.

> D4 — Staging and production never run mise or fnox — their secrets come from
> the cloud provider. CI's secrets come from the forge (GitHub or GitLab). The
> contract states this as the development manager's named gap.

> D7 — stackgen's secrets contract loses the encrypt-into-git allowance and
> states the environment split (D4); every provider pack is held to it.

> D10 — Done by plan 2 of the template chain (`2026-10-05-tool-config-templates`
> E14): the pack, its bundle and its overlay are gone, and plan 4's sweep
> removed its names. A unit that still finds a live mention of doppler inside
> its Owns removes it; repos that materialized it are left untouched — no
> migration.

## Edits

1. **`plugins/stackgen/assets/contracts/secrets.md`**
   - Keep the outranking rule (inject at the process boundary, the injector
     wraps the task) and the naming convention unchanged.
   - Add, near the top, the **environment split** as the contract's own rule:
     the secrets manager a repo pins serves **development**; **CI** takes its
     secrets from the forge's own store (GitHub or GitLab secrets) and **staging
     and production** from the cloud provider's secret store, where neither the
     toolchain manager nor the development manager runs. The same variable name
     is the join between them, catalogued in `environment.md`.
   - Rewrite clauses 1 and 2 of "What a manager must be able to do" for that
     split: clause 1 — a manager resolves the development set and must **resolve
     nothing** (no fallback to development values) where the repo runs outside
     development; clause 2 — CI does not authenticate to the development manager
     at all; the forge's variables reach the task directly. Clauses 3–5 stay,
     with clause 3's re-keying sentence dropped (nothing is encrypted in the
     repo any more).
   - Rewrite the "a tool that serves only development is a legitimate pick with
     a named gap" paragraph: that is now **every** manager's shape, and the gap
     is answered by the forge and the cloud provider.
   - **Delete** the whole "The encrypt-into-git allowance" section and its four
     conditions. Replace with one short paragraph: **no repo carries an
     encrypted secret** — committed ciphertext is permanent in history, and the
     scanner, the memory palace and review would all have to be told to look
     away from it; a value lives in the keychain, a cloud store, the forge or
     the cloud provider, never in a tracked file.
   - "What this contract does not decide": drop "a hosted platform where a
     vendor holds the secrets" as a menu option; keep the remaining bullets.
2. **`plugins/stackgen/stacks/readme.md`**
   - `:21-24` ("Three packs went straight there": container-image, doppler,
     github-actions) — drop doppler and fix the count.
   - `:175-195` — the secrets passage: one development provider (`fnox`), the
     environment split (D4), no encrypt-into-git allowance; drop the
     doppler/fnox "pair", the named-gap paragraph framed around doppler, and the
     devtools-doppler-skill retirement history's present-tense claims (keep a
     past-tense clause only if the surrounding history list needs it).
   - `:263` ("the `secrets-manager` pair above") — no longer a pair.
   - `:347-351` ("the developer-machine and CI provider") — fnox is the
     developer-machine provider; CI takes the forge's secrets.
3. **`plugins/stackgen/skills/tool-config/references/gitleaks.md`** — the
   allowlist example citing "the committed ciphertext of an encrypt-into-git
   secret" (around `:103`): replace with another real allowlist example (a test
   fixture with a fake key) or drop the example; never describe committed
   ciphertext as acceptable.

## Verification

- `grep -rn -i 'encrypt-into-git\|ciphertext\|doppler' plugins/stackgen/assets/contracts/secrets.md plugins/stackgen/stacks/readme.md plugins/stackgen/skills/tool-config/references/gitleaks.md`
  prints nothing, except a past-tense history clause in `stacks/readme.md` you
  name in `DECIDED:`.
- `grep -n 'forge' plugins/stackgen/assets/contracts/secrets.md` prints the
  split.
- `mise run p:plugins:check` green; the full wave gate.

## Guardrails

- Touch nothing outside Owns; a falsified passage elsewhere is a
  `DOCS FALSIFIED:` line.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand; keep code spans on one line; never end a table cell in a bare `*`.
- No plugin-relative citation in anything that lands (checker rule 13).
- The contract names no tool in its rules (it is neutral); "GitHub or GitLab"
  appears only as examples of a forge.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: the secrets contract is development-only with no committed ciphertext`
