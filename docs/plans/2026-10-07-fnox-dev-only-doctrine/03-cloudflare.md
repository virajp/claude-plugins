# U3 — Cloudflare packs: fnox is development's, CI is the forge's

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md`,
  `plugins/stackgen/stacks/cloud-service/secrets-store/**` except the `version:`
  line of `pack.yaml`,
  `plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md`,
  `plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md` except its
  `components:` pins
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file that the facts list names, top to bottom.

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

Every passage that says the repo's `capability-provider` pick (fnox) holds "a
developer's and CI's secrets" becomes: it holds **a developer's** secrets; CI
takes its own from the forge; a deployed Worker or Container reads Secrets
Store. Precisely:

1. `cloud-provider/cloudflare/conventions.md` (about `:48-50`).
2. `secrets-store/pack.yaml` (comment text only, about `:12-16`).
3. `secrets-store/conventions.md` — the intro (about `:4-6`) and about
   `:136-139`; about `:71-72` (the allowance "has nothing to apply to") — drop
   the allowance reference, the contract no longer has one. Lines `:20` and
   `:85` ("encrypted secrets", "encrypted value") stay when they describe
   Secrets Store's own at-rest encryption, which is true; change them only if
   they mean ciphertext in a repo.
4. `.../cloudflare-secrets-store/references/service-doctrine.md` — delete "The
   encrypt-into-git allowance" section (about `:183-191`); about `:136`
   (re-encrypt) — keep only if it is about Secrets Store itself.
5. `.../references/pick-and-trade.md` (about `:11-14`; `:35` under the same rule
   as edit 3), `.../references/local-dev.md` (about `:48-52`).
6. `images/.../identity-shape.md` (about `:60-61`),
   `email-service/.../identity-shape.md` (about `:102-106`).
7. `bundles/cloudflare-secrets-store.md` — about `:15` ("the repo carries no
   ciphertext": keep only if still a sentence worth making), about `:56-60`
   (developer's machine and CI), about `:65` ("long-lived decryption" — drop if
   it refers to fnox's encrypted mode).

The ruling of
`docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
that Secrets Store is the runtime store **stands**; only the CI half moves.

## Verification

- `grep -rn -i "and CI\|CI's\|encrypt-into-git" plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md plugins/stackgen/stacks/cloud-service/secrets-store plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`
  prints only sentences that give CI to the forge.
- `mise run p:plugins:check` green; the full wave gate.

## Guardrails

- Touch nothing outside Owns; no `version:` line, no bundle pin (U6).
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand; keep
  code spans on one line.
- No plugin-relative citation in anything that lands (checker rule 13).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: cloudflare packs give CI secrets to the forge`
