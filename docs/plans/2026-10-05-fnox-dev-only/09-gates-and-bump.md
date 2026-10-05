# U9 — Gates and pack bumps

- **Wave:** 4
- **Depends on:** U8
- **Owns:** the `version:` lines of
  `plugins/stackgen/stacks/capability-provider/fnox/pack.yaml`,
  `plugins/stackgen/stacks/cloud-service/secrets-store/pack.yaml`,
  `plugins/stackgen/stacks/cloud-provider/cloudflare/pack.yaml`,
  `plugins/stackgen/stacks/cloud-service/images/pack.yaml`,
  `plugins/stackgen/stacks/cloud-service/email-service/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`; every `components:`
  pin to those six in `plugins/stackgen/stacks/bundles/*.md`;
  `plugins/stackgen/stacks/inventory.md` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block, D13, and the Wave gate.

## Ruling

> D13 — fnox to `2.0.0` (major: a mode removed). Patch bumps:
> `cloud-service/secrets-store`, `cloud-provider/cloudflare`,
> `cloud-service/images`, `cloud-service/email-service`,
> `app-framework/flutter`. Each once per level since `stackgen-v2.0.0` (a pack
> the template chain already patched takes no second patch; fnox still takes its
> major). Every bundle pin to them follows, and `inventory.md` is regenerated,
> in one commit. No plugin or site version bump.

## Edits

1. Confirm no plugin bump is needed:
   `git tag --list 'vwf-v*' 'stackgen-v*' 'site-v*'` and the manifests show
   stackgen at least one major, vwf at least one minor, and the site at least
   one patch above their latest tags. If any does not, return `UNRESOLVED:`
   naming it — this plan authorises no plugin bump.
2. Bump the six `version:` lines per D13. A patch that would land on a 13 or 17
   component goes one further (`x.y.12` → `x.y.14`, `x.y.16` → `x.y.18`).
   Re-read each pack's current version and compare it with
   `git show stackgen-v2.0.0:<pack.yaml>` — a patch already taken since that tag
   is not taken again; fnox goes to `2.0.0` whatever its patch.
3. `grep -ln '<type>/<slug>@' plugins/stackgen/stacks/bundles/*.md` for each of
   the six and update every pin to the new version.
4. `mise run p:plugins:inventory` to regenerate `inventory.md`.
5. Run every Wave gate line with `MISE_ENV=dev` exported.

## Verification

- `grep -n 'capability-provider/fnox@2.0.0' plugins/stackgen/stacks/bundles/fnox.md`
- The full wave gate, green — this report is the run's final gate.

## Guardrails

- No plugin `plugin.json` or `site/package.json` edit, no tag, no
  `p:plugins:release`, no `p:site:release`.
- Pack versions, bundle pins and `inventory.md` land in **one** commit — the
  inventory hook refuses a pin naming a version its pack does not carry.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`ops: bump the packs the fnox change edited`
