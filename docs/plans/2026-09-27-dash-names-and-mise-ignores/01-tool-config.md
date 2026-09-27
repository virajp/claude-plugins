# U1 — tool-config: the dash-name block and bare-name mise ignores

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`,
  `plugins/stackgen/skills/tool-config/assets/git/.gitignore`,
  `plugins/stackgen/skills/tool-config/references/git.md`,
  `plugins/stackgen/skills/tool-config/references/mise.md`,
  `plugins/stackgen/skills/tool-config/references/pre-commit.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/SKILL.md` (how blocks and
  the no-doubling rule are described),
  `.claude/skills/plugin-authoring/SKILL.md` (the checker rules and the
  fold-width trap).

## Ruling

> Decision 4 — The mise ignore patterns: Bare names `mise.local.toml`,
> `mise.*.local.toml`, `mise.local.lock`, `mise.*.local.lock`,
> `.mise.local.toml`, `.mise.local.lock`, plus the spelled-out
> `.config/mise/conf.d/*.local.toml` and `.config/mise/config*.local.toml`;
> every other hardcoded mise path is dropped. A reversal of conf-d-layout's
> hardcoded paths. Rejected: keep the hardcoded paths and fix the one wrong one;
> the `**/` form.

> Decision 5 — Dash-named paths: Block them: a `language: fail` hook in
> tool-config's pre-commit asset, `files: '(^|/)-'`, with a message telling the
> committer to rename. No code task script is edited. Rejected: `./`-prefix
> every name after the files eval; a shared `helpers` function; per-tool
> prefixing at each call site.

> Decision 6 — `code:precommit`: Left as it is — the user ruled against more
> than the block.

The user, verbatim: "simply add the block in `pre-commit` and leave it there. We
are over-engineering this".

## Edits

1. **`assets/pre-commit/.config/pre-commit-config.yaml`** — add one hook to the
   existing `repo: local` block, placed **first** in that block so its refusal
   is the first line a committer reads:
   - `id: no-dash-names`
   - `name:` a short title, e.g. `No path component starting with a dash`
   - `description:` one or two lines in the surrounding style: tools read an
     argument beginning with `-` as an option, so such a name breaks or silently
     changes the formatters and linters the other hooks call.
   - `entry:` the message pre-commit prints, telling the committer to rename the
     listed files — for example: rename the file, since a path component
     starting with a dash is read as an option by the formatters and linters
   - `language: fail`
   - `files: '(^|/)-'`
   - and nothing else: match the file's existing comment density, key order and
     quoting; do not touch any other hook or the global `exclude:`.
2. **`assets/git/.gitignore`** — in the mise section inside the `# >>> git` …
   `# <<< git` block, replace the hardcoded patterns with exactly the Decision 4
   set, in this order: `mise.local.toml`, `mise.*.local.toml`,
   `.mise.local.toml`, `mise.local.lock`, `mise.*.local.lock`,
   `.mise.local.lock`, `.config/mise/config*.local.toml`,
   `.config/mise/conf.d/*.local.toml`. Rewrite the section's why-comment, if it
   has one, to say that bare names match at any depth and why the two
   spelled-out paths remain (their file names do not start with `mise`). Nothing
   else in the block moves.
3. **`references/git.md`** — reconcile the mise-pattern prose (the
   "load-bearing… every path mise loads a local override from" passage, and any
   list of the section's patterns) with Edit 2.
4. **`references/mise.md`** — reconcile the local-file lines (around `:39`,
   `:55`, `:119-123`) wherever they state which paths the `.gitignore` ignores;
   leave statements about what mise loads as they are.
5. **`references/pre-commit.md`** — add `no-dash-names` wherever the asset's
   hooks are listed or described, in the same shape as its neighbours, with the
   one-sentence reason.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` green.
- `python3 -c 'import yaml,sys; yaml.safe_load(open(sys.argv[1]))'` over the
  pre-commit asset parses.
- `grep -n 'no-dash-names' <pre-commit asset> <references/pre-commit.md>` — one
  hit in each at least.
- `grep -n '\.config/mise/mise\.local\.lock\|\.config/mise\.local\.toml\|config\.\*\.local' <git asset>`
  returns nothing.
- In a `mktemp -d` scratch git repo with the edited `.gitignore` copied in,
  `git check-ignore -v .config/mise.local.lock .config/mise/config.local.toml .config/mise/conf.d/tools.local.toml`
  matches all three, and `git check-ignore .config/mise/mise.lock` matches
  nothing.

## Guardrails

- Do not touch any code task script, `_scripts/helpers`, or `code/precommit`
  (Decision 5, Decision 6).
- Do not touch this repo's own `.config/**` or root `.gitignore` (out of scope).
- Do not touch `plugins/stackgen/stacks/**` — U2 owns the pnpm pack.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width by
  hand. Keep every code span on one line.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.
- Report site and root-doc passages as `DOCS FALSIFIED:`; never edit them.

## Commit

`fix: block dash-named paths and ignore mise local files by name`
