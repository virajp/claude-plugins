# U6 — Gates and pack bumps

- **Wave:** 3
- **Depends on:** U5
- **Owns:** the `version:` lines of every
  `plugins/stackgen/stacks/*/*/pack.yaml` whose pack the run changed; every
  `components:` pin to those packs in `plugins/stackgen/stacks/bundles/*.md`;
  `plugins/stackgen/stacks/inventory.md` (regenerated)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block, D7, and the Wave gate.

## Ruling

> D7 — fnox to `2.0.0` (major: a mode removed). Every other pack whose files the
> run changed takes a patch, once per level since `stackgen-v2.0.0`. Every
> bundle pin to them follows, and `inventory.md` is regenerated, in one commit.
> No plugin or site version bump.

## Edits

1. Confirm no plugin bump is needed:
   `git tag --list 'vwf-v*' 'stackgen-v*' 'site-v*'` and the manifests show
   stackgen, vwf and the site each above their latest tag. If any is not, return
   `UNRESOLVED:` naming it — this plan authorises no plugin bump.
2. List the changed packs:
   `git diff --name-only <branch base>..HEAD -- plugins/stackgen/stacks`,
   reduced to each `<type>/<slug>` with a `pack.yaml` (bundles are not packs).
   Expected: `capability-provider/fnox`, `cloud-service/secrets-store`,
   `cloud-provider/cloudflare`, `cloud-service/images`,
   `cloud-service/email-service` — name any difference in `DECIDED:`.
3. Bump each `version:` per D7. Compare each with
   `git show stackgen-v2.0.0:<pack.yaml>` — a patch already taken since that tag
   is not taken again; fnox goes to `2.0.0` whatever its patch. A component that
   would land on 13 or 17 goes one further (`x.y.12` → `x.y.14`, `x.y.16` →
   `x.y.18`).
4. `grep -ln '<type>/<slug>@' plugins/stackgen/stacks/bundles/*.md` for each
   bumped pack and update every pin to the new version.
5. `mise run p:plugins:inventory` to regenerate `inventory.md`.
6. Run every Wave gate line with `MISE_ENV=dev` exported.

## Verification

- `grep -n 'capability-provider/fnox@2.0.0' plugins/stackgen/stacks/bundles/fnox.md`
- The full wave gate, green — this report is the run's final gate.

## Guardrails

- No `plugin.json` or `site/package.json` edit, no tag, no `p:plugins:release`,
  no `p:site:release`.
- Pack versions, bundle pins and `inventory.md` land in **one** commit — the
  inventory hook refuses a pin naming a version its pack does not carry.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`ops: bump the packs the fnox change edited`
