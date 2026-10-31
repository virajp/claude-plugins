# U1 — Release-level functions and their test

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/_scripts/local`,
  `.config/mise/tasks/p/releases/test` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `.config/mise/tasks/_scripts/local` top to bottom;
  `.config/mise/tasks/p/plugins/npm-normalize-test` (the shape of a bash table
  test task) — read only.
- **Lazy-load:** `.config/mise/tasks/_scripts/helpers` (pack-owned — read only)

## Ruling

> - Decision E3: The base is always the last tag. The level is the highest of
>   the recorded level and the level that an untagged manifest implies when
>   compared with that tag. Example: vwf tag 21.0.0, manifest 21.2.0, recorded
>   `MAJOR` → 22.0.0. A project at `NONE`, with no record, and with a manifest
>   equal to its tag is skipped.
> - Decision E4: Bash functions in `_scripts/local` read, raise and clear the
>   flat `key: LEVEL` lines with awk. Each version comes from the existing
>   `version_bump`/`version_next` guard. The levels are uppercase in the file
>   and lowercase for the guard.
> - Decision E9: A new bash table test `p:releases:test`
>   (`.config/mise/tasks/p/releases/test`) covers the U1 functions, including
>   13/17 and "highest wins". It runs in `plugins.yml` and in the verification
>   of U1 and U8, not in pre-commit.
> - Decision E12: This plan is an explicit exception to the memory rule "plans
>   do not edit this repo's `.config`". The exception covers only
>   `.config/mise/tasks/**` and `.config/vwf.yaml`.

The function contract, quoted from index.md:

| Function                                 | Does                                                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `releases_level <file> <key>`            | prints the key's level; `NONE` when the key or the file is absent; refuses a value that is not one of the four                                                                     |
| `releases_raise <file> <key> <LEVEL>`    | sets the key only when `LEVEL` is higher; creates the file with its two comment lines when absent; never lowers                                                                    |
| `releases_clear <file> <key>`            | removes the key's line; leaves the comments and other keys; no error when absent                                                                                                   |
| `level_max <A> <B>`                      | prints the higher of two levels                                                                                                                                                    |
| `level_implied <tag-version> <manifest>` | prints `NONE` when equal, else `MAJOR`, `MINOR` or `PATCH` by the first component that differs; refuses a manifest lower than the tag                                              |
| `release_target <tag-version> <LEVEL>`   | prints the next version: `version_next` with the lowercase level, so 13 and 17 are skipped; prints nothing and returns 0 for `NONE`; returns non-zero where `version_next` refuses |

The two comment lines of a new file:

    # Pending release levels, one key per project: NONE, PATCH, MINOR or MAJOR.
    # Written by /vwf:execute at landing (highest level wins); cleared by the release tasks.

## Edits

1. **`.config/mise/tasks/_scripts/local`** — add the six functions after the
   existing four, in the style of the file (comment header per function, `local`
   variables, error lines to stderr, no `set -e` assumptions). Parse with awk;
   no `yq`, no `node` YAML. Level order: `NONE` < `PATCH` < `MINOR` < `MAJOR`.
   Writes go through a temp file in the same directory, then `mv`, so a failed
   write never truncates the file. Update the file's opening comment, which
   names the functions it holds.
2. **`.config/mise/tasks/p/releases/test`** (new, executable,
   `#!/usr/bin/env bash`, a `#MISE description=` line in the style of the
   sibling tasks) — a table test that sources `helpers` and `local` and asserts,
   at minimum:
   - `releases_level`: absent file → `NONE`; absent key → `NONE`; present →
     value; bad value → non-zero.
   - `releases_raise`: creates the file with the two comment lines; `PATCH` then
     `MAJOR` → `MAJOR`; `MAJOR` then `PATCH` → `MAJOR`; other keys and comments
     unchanged.
   - `releases_clear`: removes one key; others and comments stay; absent key →
     zero exit.
   - `level_implied`: `21.0.0`/`21.0.0` → `NONE`; `21.0.0`/`21.2.0` → `MINOR`;
     `3.0.0`/`3.1.0` → `MINOR`; `1.1.50`/`1.1.51` → `PATCH`; `2.0.0`/`3.0.0` →
     `MAJOR`; manifest lower → non-zero.
   - `release_target`: `21.0.0 MAJOR` → `22.0.0`; `1.1.50 PATCH` → `1.1.51`;
     `3.0.0 NONE` → empty, exit 0; `1.12.0 MINOR` → `1.14.0`; `1.1.16 PATCH` →
     `1.1.18`; `12.0.0 MAJOR` → `14.0.0`.
   - The E3 rule end to end: tag `21.0.0`, manifest `21.2.0`, recorded `MAJOR` →
     `22.0.0`; tag `3.0.0`, manifest `3.1.0`, no record → `3.1.0`. All file work
     happens under `mktemp -d`; the test never touches `.config/releases.yaml`.
     It prints one line per case and exits non-zero on the first failure.

## Verification

- `mise run p:releases:test` passes.
- The full wave gate, notably `mise run code:precommit`.

## Guardrails

- Do not touch any file outside Owns; the four existing guard functions keep
  their names, signatures and behaviour.
- `_scripts/helpers` is pack-owned; never edit it.
- Run task scripts through `bash`; the Bash tool's shell is fish, so wrap loops
  in `bash -c`.
- Write files with the Write or Edit tool, never `cat > file <<EOF` (`cat` is
  aliased to `bat`).
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`ops: release-level functions and their table test`
