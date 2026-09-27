# U2 — pnpm pack: a dev-only mise pin for sort-package-json

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml` (the
  `tool-config:` list only — never `version:`),
  `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/format`,
  `plugins/stackgen/stacks/package-manager/pnpm/conventions.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/references/mise.md` §4
  (the `add tool` verb),
  `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/lint`
  (the linter's `mise which` call, the model to follow),
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/pack.yaml` (a pack's
  `add tool` line).

## Ruling

> Decision 7 — sort-package-json's pin: A mise pin, dev environment only:
> `mise add tool npm:sort-package-json <version> to dev environment` in pnpm's
> `tool-config:` list. The task resolves it with
> `mise which sort-package-json --tool npm:sort-package-json` and skips the step
> when it is not installed, as shfmt is skipped. "I don't want pinning to be
> done outside any ecosystem which has upgrade mechanism". Rejected:
> `pnpm dlx sort-package-json@<version>`; a devDependency in the target's
> `package.json`; `to all environments` (it is a dev tool).

> Decision 8 — Which sort-package-json version: The latest release on the npm
> registry when U2 runs, written as an exact version and reported in `DECIDED:`.
> Rejected: a version fixed at plan time.

The user, verbatim, on environments: "For `sort-package-json` specifically, it's
a tool only for `dev` environment".

## Edits

1. **`pack.yaml`** — append to the `tool-config:` list:
   `- mise add tool npm:sort-package-json <version> to dev environment`, where
   `<version>` is the exact latest release, read with
   `pnpm view sort-package-json version`. Leave every other line, and
   `version:`, alone.
2. **`config/.config/mise/tasks/code/format`** — replace the
   `pnpm dlx sort-package-json` invocation (`:105` today) with a call through
   the pinned binary: resolve it once with
   `mise which sort-package-json --tool npm:sort-package-json 2>/dev/null`, and
   when that yields nothing, skip the step with the same kind of notice the
   shfmt step gives when shfmt is absent (`:83` today). Keep the target
   gathering (`:36-44`) and the `--check`/fix behaviour exactly as they are.
   Update the script's header comments where they describe the `pnpm dlx` fetch;
   match the surrounding comment density.
3. **`conventions.md`** — reconcile `:49` (how sort-package-json runs) with
   Edits 1–2: pinned through mise, dev only, skipped where not installed.

## Verification

- `mise run p:plugins:shellcheck` and `mise run p:plugins:check` green.
- `grep -rn 'pnpm dlx sort-package-json' plugins/stackgen` returns nothing.
- `grep -n 'npm:sort-package-json' <pack.yaml> <code/format>` — one hit in each.
- `bash -n <code/format>` parses.

## Guardrails

- Do not touch `version:` in `pack.yaml`, any bundle pin, or `inventory.md` — U4
  owns them.
- Do not touch any other pack's scripts or tool-config's assets — U1 owns those.
- Do not `./`-prefix file names or add `--` anywhere (Decision 5 ruled it out).
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`fix: pin sort-package-json through mise for the dev environment`
