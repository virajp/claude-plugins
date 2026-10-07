# U4 — Cloudflare packs: fnox is development's, CI is the forge's

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

> D4 — Staging and production never run mise or fnox — their secrets come from
> the cloud provider. CI's secrets come from the forge (GitHub or GitLab). The
> contract states this as the development manager's named gap.

> D7 — stackgen's secrets contract loses the encrypt-into-git allowance and
> states the environment split (D4); every provider pack is held to it.

## Edits

Every passage that says the repo's `capability-provider` pick (fnox) holds "a
developer's and CI's secrets" becomes: it holds **a developer's** secrets; CI
takes its own from the forge; a deployed Worker or Container reads Secrets
Store. Precisely:

1. `cloud-provider/cloudflare/conventions.md:48-50`.
2. `secrets-store/pack.yaml:12-17` (comment text only).
3. `secrets-store/conventions.md:1-10` intro and `:137-139`; `:71-72` (the
   allowance "has nothing to apply to") — drop the allowance reference, the
   contract no longer has one.
4. `.../cloudflare-secrets-store/references/service-doctrine.md:183-191` —
   delete "The encrypt-into-git allowance" section.
5. `.../references/pick-and-trade.md:11-14`,
   `.../references/local-dev.md:49-52`.
6. `images/.../identity-shape.md:60-61`,
   `email-service/.../identity-shape.md:102-104`.
7. `bundles/cloudflare-secrets-store.md:15` ("repo carries no ciphertext" — keep
   only if still a true statement worth making) and `:57-59`.

The ruling of
`docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
that Secrets Store is the runtime store **stands**; only the CI half moves.

## Verification

- `grep -rn -i "and CI\|CI's\|encrypt-into-git" plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md plugins/stackgen/stacks/cloud-service/secrets-store plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md`
  prints only sentences that give CI to the forge.
- `mise run p:plugins:check` green; the full wave gate.

## Guardrails

- Touch nothing outside Owns; no `version:` line, no bundle pin (U9).
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand; keep
  code spans on one line.
- No plugin-relative citation in anything that lands (checker rule 13).
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: cloudflare packs give CI secrets to the forge`
