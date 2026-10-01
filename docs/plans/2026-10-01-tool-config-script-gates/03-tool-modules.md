# G3 — Tool modules: dprint, pre-commit, gitleaks, grype, the cross-tool exclude

- **Wave:** 2
- **Depends on:** G1, G2
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/tools/index.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/dprint.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/pre-commit.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/gitleaks.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/grype.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/exclude.mjs`,
  `scripts/src/tool-config-gates.test.ts`,
  `scripts/src/fixtures/tool-config/gates/**`, and — for wave 2 —
  `scripts/src/tool-config-mise.test.ts` and
  `scripts/src/fixtures/tool-config/mise/**` (plan 1's suite: `all` now lands
  the gate tools too)
- **Model:** opus
- **Kind:** edit
- **Read first:** `TC/references/{dprint,pre-commit,gitleaks,grype}.md` whole —
  the behaviour these modules implement; `TC/SKILL.md` *The one cross-tool
  verb*; G1's `lib/*.mjs`; plan 1's `lib/tools/mise.mjs` (the module shape to
  follow).

## Ruling

> G1 — A trailing `/` marks a directory, globs included (`*.xcassets/`).

> G2 — Every write to the pre-commit config runs
> `mise x -- pre-commit validate-config`.

> G6 — a `post-commit` or `post-merge` hook is always written with
> `always_run: true`.

> G7 — grype `add-ignore`: `--id`, `--package`, `--reason`, `--expires`, all
> four required, written as the entry's comment.

> G10 — the forge links are built from `origin` by the script per
> `code/git-config`'s host rule; one blank line between `repos:` entries, a
> requester block included.

## Edits

1. **`index.mjs`** — register `dprint`, `pre-commit`, `gitleaks`, `grype` and
   the cross-tool `exclude` beside `mise`; the tools still `handled: "prose"`
   are now only git, graphify and renovate.
2. **`dprint.mjs`** — `all` lands `.config/dprint.json`, `.config/taplo.toml`
   and the root shim; `add-plugin` from the reference's plugin table (unknown
   name refused), URL before `exec`, config key alphabetical, shared plugins
   once, lock `keys:`; `remove`; migration rows per `dprint.md:253-263`.
3. **`pre-commit.mjs`** — `all` lands the three files and fills the scopes from
   `--scopes` and the forge links from `git remote get-url origin`
   (scp/ssh/https normalised; github and gitlab per the reference's table; any
   other host or no remote leaves the template commented); `add-hook` with the
   key whitelist and order, the local/URL rules, the same-id conflict row,
   `always_run: true` forced on post stages, one blank line before a requester
   block; `add-linter-ignore` (a git-tracked path in a person's call → a warning
   in its row); `set-scopes` (append-only, `# retired` comments); commit-type
   rename rows (mapped types proposed, an unmapped type proposes nothing);
   migration per `pre-commit.md:403-423`; an unrecognised marker shape or a
   non-verbose exclude regex → `needs-edit`.
4. **`gitleaks.mjs`** — `all` lands `.config/gitleaks.toml`; `remove`; migration
   per `gitleaks.md:137-143`.
5. **`grype.mjs`** — `all` lands `.config/grype.yaml`; `add-ignore` (G7: the
   four-line comment above `- vulnerability: <id>`, `[]` ↔ block list);
   `remove-ignore` (unknown id refused); `remove`.
6. **`exclude.mjs`** — `all add-exclude [--generated] --paths …`: each path
   classified per G1, written into dprint `excludes`, taplo `exclude`, the
   pre-commit `(?x)` exclude (escape, `*` → `[^/]*`, `$` for a file glob; a
   directory, glob or not, as `(^|/)<pattern>/`; `|` re-derived on every write)
   and, with `--generated`, the gitleaks allowlist; shares and `remove` across
   all four.
7. **Tests** — `scripts/src/tool-config-gates.test.ts` with golden trees under
   `scripts/src/fixtures/tool-config/gates/`, a fake `mise` on `PATH` that
   records `mise x -- …` calls and fakes `setup:all`, `dprint fmt` and
   `validate-config`: greenfield `all` = golden; second `all` empty; each verb;
   `*.xcassets/` excludes files inside; `|` re-derivation on add and remove;
   shares; forge links for github, gitlab, another host and no remote; hook
   same-id conflict; post stage forces `always_run`; grype ignore with a missing
   flag refused; each migration and its `needs-edit` case.
8. **Plan 1's mise suite** — where it runs `all`, the gate tools' files now land
   too: refresh its golden trees, or scope its assertions to the mise paths, so
   it stays green without weakening any mise assertion.

## Verification

- `pnpm vitest run scripts/src/tool-config-gates.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- The full wave gate.

## Guardrails

- Do not touch `lib/*.mjs` (G1) or `lib/tools/mise.mjs` (plan 1's) — an engine
  change you need is an `UNRESOLVED:` line.
- No npm dependency; the fake `mise` is a script written into the sandbox.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config script configures dprint, pre-commit, gitleaks, grype and the cross-tool exclude`
