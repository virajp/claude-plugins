# U1 — The secrets contract states the environment split

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/contracts/secrets.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md` (the contract-satisfaction
  topic) — only if an edit needs the named-gap wording.

## Ruling

> D1 — fnox manages secrets for the development environment only. The OS
> keychain is the default provider; any single secret may instead reference a
> fnox-supported cloud store (mixed per secret). No encrypted secret ever enters
> a repo: no age, no KMS, no committed ciphertext. Staging and production never
> run mise or fnox — their secrets come from the cloud provider. CI's secrets
> come from the forge (GitHub or GitLab).

> D3 — stackgen's secrets contract loses the encrypt-into-git allowance and
> states the environment split (D1); every provider pack is held to it.

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
     split: clause 1 — a manager resolves the development set and must never
     hand development values to a process outside development; clause 2 — CI
     does not authenticate to the development manager at all; the forge's
     variables reach the task directly. Clauses 3–5 stay, with any re-keying or
     re-encrypt sentence dropped (nothing is encrypted in the repo any more).
   - Rewrite the "a tool that serves only development is a legitimate pick with
     a named gap" paragraph: that is now **every** manager's shape, and the gap
     is answered by the forge and the cloud provider.
   - **Delete** the whole "The encrypt-into-git allowance" section and its four
     conditions. Replace it with one short paragraph: **no repo carries an
     encrypted secret** — committed ciphertext is permanent in history, and the
     scanner, the memory palace and review would all have to be told to look
     away from it; a value lives in the keychain, a cloud store, the forge or
     the cloud provider, never in a tracked file.
   - "What this contract does not decide": drop any bullet that offers a hosted
     platform holding development, CI and deployed secrets alike as a menu
     option; keep the rest.
2. **`plugins/stackgen/stacks/readme.md`**
   - About `:24` (doppler "since deleted in favour of `fnox`") — keep only if it
     is a past-tense history clause the surrounding list needs; otherwise drop
     doppler from it.
   - About `:179-189` — the secrets passage: one development provider (`fnox`),
     the environment split (D1), no encrypt-into-git allowance.
   - About `:345-350` ("the developer-machine and CI provider") — fnox is the
     developer-machine provider; CI takes the forge's secrets; staging and
     production take Secrets Store's (or the cloud provider's).

## Verification

- `grep -n -i 'encrypt-into-git\|ciphertext\|re-encrypt\|reencrypt' plugins/stackgen/assets/contracts/secrets.md plugins/stackgen/stacks/readme.md`
  prints only the new "no repo carries an encrypted secret" paragraph.
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
