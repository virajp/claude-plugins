# U1 — Trim the tool-config assets

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/assets/**`,
  `plugins/stackgen/skills/tool-config/references/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/skills/tool-config/SKILL.md` (block markers,
  the frame, the drift rule), then each reference before the asset tree it
  describes, then each asset file top to bottom before editing it.
- **Lazy-load:** `plugins/vwf/skills/doctor/references/stack-checks.md:520-567`
  and `plugins/vwf/skills/init/references/new-repo.md:468-475` (how
  `MARKED POSITION` comments are read).

## Ruling

> - Decision 1 — Scope: The shipped files — tool-config assets, pack payloads
>   and pack hooks — plus this repo's repo-only tooling. This repo's landed
>   copies of the assets and its root `.gitignore` wait for the next
>   `/vwf:setup reshape` (gate-hardening B6).

> - Decision 3 — The trim rule: Keep every comment a tool or skill reads:
>   `#MISE`/`#USAGE`, shebangs, `# shellcheck` directives, `# >>>`/`# <<<`
>   markers, `MARKED POSITION` lines, grype reason comments, fill-in templates,
>   and any comment a reference names as load-bearing. Keep a single-line
>   warning where a reader would otherwise break something non-obvious. Every
>   longer explanation goes: dropped when the owning reference already says it,
>   moved into that reference (tool-config `references/*.md`, the pack's
>   `conventions.md`) when it does not. Repeated boilerplate goes; a directive
>   under it stays.

> - Decision 6 — Proof that only comments changed: After each wave, the
>   orchestrator compares every touched file before and after with comment and
>   blank lines stripped; the diff must be empty. No review row.

## Edits

1. **Every file under `assets/**`** (58 files; `dprint.json` ×2 and
   `renovate.json` carry no comments and are left alone). Apply Decision 3 file
   by file. Highest volume first: `mise/.config/mise/conf.d/tools.toml`,
   `conf.d/env.toml`, `mise.toml`, `mise.ci.toml`, `mise.test.toml`,
   `grype/.config/grype.yaml`, `gitleaks/.config/gitleaks.toml`,
   `pre-commit/.config/linter.yaml`,
   `pre-commit/.config/pre-commit-config.yaml`,
   `pre-commit/.config/git-conventional-commits.yaml`, and the task files
   `tasks/_scripts/merge`, `tasks/_scripts/helpers`, `tasks/setup/ai`,
   `tasks/setup/vscode`, `tasks/setup/all`.
2. **Before removing a comment in an asset**, grep the owning reference for what
   it says about that file's comments — the index's facts list the ones named
   load-bearing (`references/mise.md:254-260`, `:285-300`, `:344-347`,
   `:364-366`; `references/pre-commit.md:143-145`, `:187`;
   `references/git.md:231-243`; `references/grype.md:46-62`;
   `references/gitleaks.md:22`). Those stay.
3. **`MARKED POSITION` blocks** (`mise.toml`, `conf.d/env.toml`,
   `tasks/setup/ai`, `git-conventional-commits.yaml`): keep the marker line and
   whatever a filler needs to identify the value; drop the explanatory paragraph
   after it, moving it to the reference when the reference lacks it.
4. **Moved explanations** go into `references/<tool>.md`, in the section that
   already describes that file, in that reference's own voice — never pasted as
   a comment block. Drop, rather than move, anything the reference already says.
5. **A file's frame** (its leading comment run up to the first blank line)
   shrinks to at most one line saying what the file is, or disappears.
6. Keep each file's structure: no reordering, no value changes, no blank-line
   churn beyond removing the lines around a deleted comment block.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` green.
- `grep -rc 'MARKED POSITION' plugins/stackgen/skills/tool-config/assets` gives
  the same per-file counts before and after.
- `grep -rc '^# >>>\|^# <<<\|^// >>>\|^// <<<' plugins/stackgen/skills/tool-config/assets`
  unchanged per file.
- `grep -rc '#MISE\|#USAGE\|# shellcheck' plugins/stackgen/skills/tool-config/assets`
  unchanged per file.
- Run the comment-stripped comparison the index's *Gates the orchestrator keeps*
  describes over your files yourself before returning; it must be empty.
- Report the before/after comment-line totals for the tree in `DECIDED:`.

## Guardrails

- Touch nothing outside Owns — not `SKILL.md`, not the packs (U2, U3), not this
  repo's `.config/**` (out of scope).
- Never change a value, a key, a code line or a directive.
- `plugins/**/*.md` is not dprint-formatted: match each reference's fold width
  by hand; keep code spans on one line.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`refactor: trim tool-config asset comments to what is load-bearing`
