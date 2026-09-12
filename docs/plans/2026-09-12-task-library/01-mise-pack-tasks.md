# U1 — The mise pack's task payload

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/_scripts/helpers`,
  `.../_scripts/merge`, `.../code/format`, `.../code/lint`, `.../code/sec`,
  `.../code/worktrees`, `.../code/merge/develop`, `.../code/merge/main`,
  `.../setup/all`, `.../setup/default-branch` (delete),
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`.
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing. Then
  `_scripts/placeholder` and `_scripts/checks` (read-only, for the shape of a
  helper and a predicate), `setup/precommit` (read-only, for the `#USAGE` header
  style), and one overlay for the file-list contract you are defining:
  `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/format`.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  §28 (task-file anatomy) and §66 (`_scripts`) only if a header or helper shape
  is unclear;
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  only to see what the `gitleaks-system` hook passes today (`:172-183`).

## Ruling

Quoted from index.md:

> **2. File-list contract.** "Optional file list, whole tree by default."
> `code:format`, `code:lint`, `code:sec` declare `#USAGE arg "[files]..."`; an
> empty list means the whole tree. Every overlay honours the list. A tool that
> cannot take a file list runs whole-tree when files are given, and the unit
> reports each such tool as `DECIDED:`.

> **3. The three tools with no task.** shellcheck and actionlint become shipped
> defaults inside the mise pack's `code:lint`; shfmt becomes a shipped default
> inside `code:format`. Each skips silently when its binary is absent or no file
> of its type is in scope. They read the tree as a directory, like dprint, which
> is why they get defaults where language linters do not.

> **4. `code:sec --staged`.** With `--staged`, `code:sec` runs
> `gitleaks protect --staged` with `.config/gitleaks.toml` and skips grype;
> without it, today's tree scan (`gitleaks detect` then grype).

> **6. `MERGE_MODEL`.** `MERGE_MODEL = "direct"` is a marked position in
> `mise.toml`'s `[env]` block beside `REPO_NAME`, with a comment naming the two
> values. `_scripts/merge` reads it: `direct` is today's behaviour unchanged;
> `pr` runs the same predicates, pushes the branch with `--follow-tags`, opens a
> pull request through `gh` or `glab` (whichever is on PATH, `gh` first), else
> prints the branch and a "open the pull request on your forge" line, and stops
> — nothing merges locally. `code:merge:main` in `pr` mode opens `develop` →
> `main`.

> **7. `MEMBERS`.** `MEMBERS = ""` is a marked position in the same `[env]`
> block: space-separated paths relative to the repo root, filled by `init` from
> the registry's `members:` list (submodule products leave it empty).
> `_scripts/helpers` gains `members()`: when `.gitmodules` exists it prints
> `git submodule foreach --quiet --recursive 'echo $displaypath'`, else the
> words of `MEMBERS`. `setup/all`'s `--all` recursion and `code/worktrees` both
> call `members()`. TOML env values are strings, so a space-separated string,
> not an array.

> **8. Stale text.** `code/worktrees` line 133's `worktree:init` becomes
> `setup:worktree`.

> **10. Dropping `setup:default-branch`.** "init stops touching the remote." The
> task file is removed with `rm`.

## Edits

1. **`_scripts/helpers`** — add `members()` after the print vocabulary, with a
   comment stating the two sources and that `MEMBERS` is the marked position
   `init` fills. Bash only; no new dependency. Keep the file `sh`-clean where it
   already is.
2. **`_scripts/merge`** — read `MERGE_MODEL` (default `direct` when unset or
   empty, so an unfilled repo behaves as today). After the existing predicates
   and the pre-commit safety net, branch: `direct` → the existing hop-to-main-
   worktree, `git merge --no-ff`, `git push --follow-tags` sequence, unchanged;
   `pr` → `git push --follow-tags -u origin <branch>`, then
   `gh pr create --base <dest> --head <branch> --fill` if `gh` is on PATH, else
   `glab mr create --target-branch <dest> --source-branch <branch> --fill` if
   `glab` is, else `print_yellow` the branch name and the destination and a
   single line telling the reader to open the pull request on the forge; then
   `print_success` and exit 0 without merging. The destination-branch-exists
   predicate still runs in `pr` mode (a PR to a branch that does not exist fails
   later and worse).
3. **`code/merge/develop`, `code/merge/main`** — pass nothing new; confirm they
   call `_scripts/merge` with the destination and that their
   `#MISE
   description` still reads true under both models (reword to "merge
   or open a pull request" if it says only "merge").
4. **`code/format`** — add `#USAGE arg "[files]..." help="..."` and read
   `${usage_files:-}`; run `dprint fmt` (or `dprint check` without `--fix`) over
   the list when given, the tree when not. Add the shfmt default: when `shfmt`
   is on PATH, format (or `-d` diff-check) the shell files in scope — the given
   files filtered to `*.sh`/shebang-bash, or `git ls-files` filtered the same
   way — with `-i 2 -ci` (the flags this repo's shellcheck task already uses;
   read `.config/mise/tasks/p/plugins/shellcheck:69` to confirm). Skip silently
   when shfmt is absent or nothing is in scope. Keep the "skips without
   `.config/dprint.json`" behaviour.
5. **`code/lint`** — this file is a `#PLACEHOLDER` slot today and stays one for
   the language linter. Add, **before** the placeholder notice, the two shipped
   defaults that run regardless: `shellcheck -x` over the shell files in scope
   (same filter as shfmt) when the binary is present, and `actionlint` over
   `.github/workflows/*.y*ml` in scope when present. Both skip silently when
   absent. Then the placeholder notice as today, and exit 0. Add the
   `#USAGE arg "[files]..."`. Note in the header comment that an overlay
   replacing this file **must keep** the two defaults and the file argument —
   state it as the contract the overlay honours.
6. **`code/sec`** — add `#USAGE flag "--staged"` and `#USAGE arg "[files]..."`.
   With `--staged`:
   `gitleaks protect --staged --config .config/gitleaks.toml
   --redact` (the
   config path the hook uses today; confirm against the gate config `:172-183`)
   and return — no grype. Without: today's `gitleaks detect` then grype,
   unchanged; a file list, when given, narrows the gitleaks scan where the tool
   allows and is ignored by grype (report as `DECIDED:`).
7. **`code/worktrees`** — replace the submodule loop with a loop over
   `members()`; fix line 133's `worktree:init` → `setup:worktree`.
8. **`setup/all`** — replace the `members()` function defined inline at `:69-72`
   with a call to the helper's `members()`; keep the `--all` flag and the
   member-flag marked-position comment block exactly as shipped.
9. **`setup/default-branch`** — `rm` it.
10. **`.config/mise.toml`** — in the `[env]` block, directly after `REPO_NAME`,
    add two marked positions in the same comment style: `MERGE_MODEL = "direct"`
    with a comment naming `direct | pr` and what each does in one line, and
    `MEMBERS = ""` with a comment saying it is space-separated repo-relative
    member paths filled by the orchestrator for a sibling-linkage product and
    left empty for submodules, which are read from `.gitmodules`.

Every task file keeps its exec bit and shebang. Header comments explain the
contract in the pack's own voice (read the neighbours).

## Verification

- `mise run p:plugins:check` green (rule 11: exec bit, shebang, pre-commit parse
  untouched by this unit).
- `mise run p:plugins:shellcheck` green over every edited file (`shellcheck -x`
  and `shfmt -d`).
- `grep -rn 'worktree:init' plugins/stackgen/stacks/toolchain-manager/mise/config`
  is empty.
- `test ! -e plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/default-branch`.
- `grep -n 'MERGE_MODEL\|MEMBERS' plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`
  shows both marked positions.
- `grep -n 'members()' .../_scripts/helpers .../setup/all .../code/worktrees`
  shows the definition and two callers.
- In a temp dir with the payload copied and `mise trust --all`:
  `mise tasks --hidden` lists `code:format`, `code:lint`, `code:sec` and not
  `setup:default-branch`; `mise run code:sec --staged` exits 0 with no grype
  line; `mise run code:format some-file.md` runs dprint over that file only.

## Guardrails

- Do not touch `skills/`, `conventions.md` or `pack.yaml` in this pack — U2 and
  U9 own them.
- Do not touch any other pack's `code/format` or `code/lint` — U4 owns the
  overlays.
- Delete with `rm`, never `git rm`.
- Landed files cite nothing by plugin path (rule 13): no
  `${CLAUDE_PLUGIN_ROOT}`, no `assets/…`, no `../` out of the tree, no sibling
  pack path.
- The payload tier is excluded from this repo's formatter on purpose; do not
  format these files with the repo's dprint. Match the surrounding style by
  hand.
- BSD `sed` on the host; prefer the editing tools over stream edits.
- Never write file content through a heredoc after a pipe (the npm-normalize
  hook rewrites `npm` → `pnpm`).
- `mise` env values are strings; do not write a TOML array for `MEMBERS`.

## Commit

`feat: gate tasks take a file list, merge obeys MERGE_MODEL, members come from one helper`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml`: `feat`; the repo lists no scopes.
