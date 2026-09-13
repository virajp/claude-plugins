# U5 — the version tasks: bumps skip 13 and 17, releases refuse them

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/_scripts/local` (new),
  `.config/mise/tasks/p/i/version`, `.config/mise/tasks/p/site/version`,
  `.config/mise/tasks/p/i/release`, `.config/mise/tasks/p/site/release`,
  `.config/mise/tasks/p/plugins/release`
- **Model:** opus
- **Read first:** every owned file, top to bottom;
  `.config/mise/tasks/_scripts/helpers` (read only — the print helpers' names
  and the file's shebang/shellcheck conventions).
- **Lazy-load:** `.github/workflows/deps-update.yml` lines 80–105 (the
  unattended monthly `p:i:version` and `p:i:release --ci` calls this must not
  break);
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  (grep `_scripts/local` — the sidecar convention this repo adopts).

## Ruling

Decision 1: "A version is forbidden when any component equals 13 or 17."

Decision 2: "`p:i:version` and `p:site:version` skip past a forbidden number
automatically and print what was skipped (`1.1.12` → patch → `1.1.14`); the
release tasks refuse to tag a forbidden version as the last line."

Decision 4: "This repo's version tasks, the two plugin manifests,
`config_format` and `blueprint_format`. The shipped mise task library is
untouched."

Decision 5: "The `+N` staging counter is not a component. The release tasks
check only the tags they would newly cut; `vwf-v19.17.0` predates the rule and
stays real."

Decision 6: "A new repo-owned sidecar `.config/mise/tasks/_scripts/local`,
sourced by the five tasks after `helpers`; the pack-owned `helpers` file is not
edited."

## Edits

1. **`.config/mise/tasks/_scripts/local`** — create. A sourced bash library (no
   exec bit needed; carry `# shellcheck shell=bash` and a header comment saying
   it is the repo-owned sidecar, never pack-landed). Two functions:
   - `version_forbidden <version>` — returns 0 when any dot-separated component
     (after stripping a leading `v`, a `-prerelease` suffix and a `+build`
     suffix) is exactly `13` or `17`; 1 otherwise. Pure string work, no subshell
     tools beyond bash builtins and `IFS` splitting.
   - `version_skip_note <from> <to>` — prints, through the `helpers` warn
     printer, that `<from>` was skipped because 13 and 17 are never issued and
     the version is now `<to>`.
2. **`p/i/version`** and **`p/site/version`** — after the existing
   `pnpm version "${LEVEL}" --no-git-tag-version` and the `VERSION=` read, add a
   loop: while `version_forbidden "$VERSION"`, record it, run the same
   `pnpm version "${LEVEL}" --no-git-tag-version` again, re-read `VERSION`, and
   print `version_skip_note`. Source `_scripts/local` on the line after the
   existing `helpers` source. The final "Version is now" line is unchanged.
3. **`p/i/release`** (after the version read at 43, inside the refusal ladder)
   and **`p/site/release`** (after 44) — `if version_forbidden "$VERSION"`,
   print an error naming the version and the rule and `exit 1`, before the tag
   name is built. Source the sidecar after `helpers`.
4. **`p/plugins/release`** — inside the loop that decides which refs to tag
   (66–79), for each ref it *would* cut (the `TO_TAG` set, not the ones that
   already exist), parse the version after the last `-v` and refuse the whole
   run with the same error when `version_forbidden` — before any tag is created.
   Source the sidecar after `helpers`.

## Verification

- `mise run p:plugins:shellcheck` is not this tree's gate; the repo's own is the
  pre-commit `lint` hook — run `mise run code:lint` and `mise run code:format`
  and report both green (the orchestrator's pre-stage pass runs them again).
- Scratch proof, from the worktree root:
  `bash -c 'source .config/mise/tasks/_scripts/helpers; source .config/mise/tasks/_scripts/local; for v in 1.1.13 17.0.0 2.1.17 v1.13.0-rc.1; do version_forbidden "$v" && echo "refused $v"; done; for v in 1.130.0 113.0.0 19.21.0 1.1.10; do version_forbidden "$v" || echo "allowed $v"; done'`
  prints four `refused` and four `allowed` lines.
- Bump loop proof: in a temp directory with a `package.json` of
  `{"name":"x","version":"1.1.12"}`, run the loop body copied from `p/i/version`
  (with `LEVEL=patch`) — the file ends at `1.1.14` and the skip note printed
  once. Repeat from `1.12.0` with `LEVEL=minor` → `1.14.0`. Never run the real
  `p:i:version` or `p:site:version`; they edit tracked files U8 owns.
- `command grep -n "_scripts/local" .config/mise/tasks/p/i/version .config/mise/tasks/p/site/version .config/mise/tasks/p/i/release .config/mise/tasks/p/site/release .config/mise/tasks/p/plugins/release`
  shows one source line in each.

## Guardrails

- Do not edit `.config/mise/tasks/_scripts/helpers` (pack-owned) or anything
  under `plugins/` (decision 4).
- Do not run any bump or release task for real.
- BSD `sed` on this machine; prefer bash parameter expansion.
- The tasks carry `#MISE` and `#USAGE` header comments — keep them intact and
  first.
- Delete with `rm`, never `git rm`.

## Commit

`ops: version tasks skip 13 and 17 on bump and refuse them on release` — written
by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`ops`; no scopes).
