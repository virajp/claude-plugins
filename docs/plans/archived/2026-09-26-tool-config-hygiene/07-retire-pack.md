# U7 — the repo-hygiene pack retires; packs ask for their ignore lines

- **Wave:** 2
- **Depends on:** U1, U2, U6
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/**` (removed),
  `plugins/stackgen/stacks/bundles/repo-hygiene.md` (removed), the `pack.yaml`
  of `package-manager/{pnpm,uv,pub,swiftpm}`, `language/{typescript,swift}`,
  `app-framework/{flutter,swiftui}`, `capability-provider/{fnox,doppler}`, every
  `plugins/stackgen/stacks/bundles/*.md` pin naming them,
  `plugins/stackgen/assets/kinds.md`, `scripts/src/inventory.ts`,
  `scripts/src/inventory.test.ts`, `scripts/src/check.ts`,
  `scripts/src/check.test.ts`, `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each listed `pack.yaml` (its `tool-config:` list and
  `version:`); `kinds.md` :280-410, :940-960; `inventory.ts` :60-80, :170-185,
  :230-250; `check.ts` `PACK_CONFIG_ROOT_FILES` :329-352 and where rule 11 also
  walks `skills/tool-config/assets/`; U1's `references/git.md`.

## Ruling

> - Decision 3: A pack asks with `git add ignore <pattern…>` or
>   `git add ignore template=<Name>` in its `tool-config:` list, or both. … The
>   provider rows retire into fnox's and doppler's `pack.yaml`.
> - Decision 5: … a pack adds its own lockfile's generated marker when the
>   lockfile does not end in `.lock`.
> - Decision 9: The `unconditional:` key retires everywhere — … the inventory
>   field and column … kinds …
> - Decision 10: The `repo-hygiene` kind retires (11 → 10 kinds). The pack
>   directory and `bundles/repo-hygiene.md` are deleted with `rm`.
> - Decision 19: … Then (U7, with the pack gone): a pack `config/` landing
>   `.gitignore`, `.gitattributes`, `.graphifyignore`, `.editorconfig`,
>   `renovate.json`, `CONTRIBUTING.md`, `SECURITY.md` or `LICENSE` at its root
>   is a finding; the tool-config asset tree still passes.
> - Decision 20: `stacks/inventory.md` is regenerated in U7's commit, with the
>   pack bumps, the bundle pins, `kinds.md` and `inventory.ts` — pre-commit
>   checks it every commit.
> - Decision 21: node → `template=Node` from pnpm and typescript; python →
>   `template=Python` from uv; dart → `template=Dart` from pub,
>   `template=Flutter` from flutter; swift → `template=Swift` from swift,
>   swiftpm and swiftui; fnox → `fnox.local.toml`; doppler → `.doppler/`; pnpm →
>   `git add attribute pnpm-lock.yaml linguist-generated`; swiftpm →
>   `git add attribute Package.resolved linguist-generated`.
> - Decision 22: Every pack U7 edits bumps one minor from its `pack.yaml`
>   version at run time (skipping a 13 or 17 component), with every bundle pin,
>   in U7's commit.
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **Remove** `plugins/stackgen/stacks/repo-hygiene/` and
   `plugins/stackgen/stacks/bundles/repo-hygiene.md` with `rm -r` / `rm`.
2. **`pack.yaml` lines** — decision 21, each in the grammar U6 landed, in the
   pack's existing `tool-config:` list (create the list where absent).
3. **Bumps** — each pack edited in step 2 up one minor (skip 13 and 17); every
   bundle pin naming it
   (`grep -l '<type>/<slug>@' plugins/stackgen/stacks/bundles/*.md`).
4. **`kinds.md`** — the `## repo-hygiene` section (:288-369), the repo-axis note
   (:379-380, :403) and the reviewer check (:958) go; "eleven kinds" becomes
   ten.
5. **`inventory.ts`** and its test — the `unconditional` field, parse and column
   go.
6. **`check.ts`** and its test — decision 19's second half: the listed files
   leave the pack `config/` root allowlist; a fixture pack landing any of them
   fails; the tool-config asset tree (`assets/git/.gitignore` and the rest)
   still passes.
7. **`mise run p:plugins:inventory`** — regenerate `inventory.md`; report the
   kinds and pack counts under `DECIDED:`.

## Verification

- `MISE_ENV=dev mise run p:plugins:inventory -- --check` green
- `MISE_ENV=dev mise run p:plugins:check` green
- `pnpm vitest run scripts` green; `pnpm exec tsc --noEmit -p scripts` green
- `grep -rn 'repo-hygiene\|unconditional' plugins/stackgen/stacks plugins/stackgen/assets/kinds.md scripts/src`
  returns nothing

## Guardrails

- The whole unit is one commit — the deletion, pack lines, bumps, pins, kinds,
  scripts and inventory together, or pre-commit's inventory and checker hooks
  fail.
- Touch no pack beyond the ten listed.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`refactor: repo-hygiene pack retires; packs ask tool-config for ignore lines` —
written by the orchestrator after the wave gate.
