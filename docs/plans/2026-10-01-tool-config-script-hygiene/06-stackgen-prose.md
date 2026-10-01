# H6 — stackgen prose: every tool on the script

- **Wave:** 3
- **Depends on:** H3
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/git.md`,
  `plugins/stackgen/skills/tool-config/references/graphify.md`,
  `plugins/stackgen/skills/tool-config/references/renovate.md`, the `upgrade`
  passage only in `plugins/stackgen/skills/tool-config/references/mise.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; H1's and H3's modules.

## Ruling

> H1 — vendored … refreshed by a repo task here, moved by a stackgen release.
> Per-repo SHA and `written:` records go away; `upgrade` moves no template.

> H7 — Conflict rows are evaluated before no-doubling; one blank line separates
> template lines from pack patterns; a vendored template's upstream header
> comment is kept; a banner section ends at the next banner or the block's end.

## Edits

1. **`TC/SKILL.md`** — every tool is script-handled; no "still prose" list
   remains. Remove the `templates:` lock key and the `written:` hash from the
   lock-record section; the `gitignore:<Name>` requester is init's fallback
   only.
2. **`references/{git,graphify,renovate}.md`** — rewrite the way plans 1–2
   rewrote theirs: what the script does, the LLM's part (`needs-edit` adoption;
   proposing a template for a detected language with no row), the doctrine a
   person editing by hand needs. Settle B79's ambiguities in the text (H5, H7).
   Templates are vendored (H1).
3. **`references/mise.md`** — `upgrade` moves pins only; templates move with a
   stackgen release.
4. **`materializer.md`** — every entry runs through `apply-entries`; delete the
   prose path for string entries.

## Verification

- `grep -rn -E 'ls-remote|raw.githubusercontent|written:' plugins/stackgen/skills`
  prints only the refresh task's mention, if any.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- `plugins/**/*.md` is not dprint-formatted: match fold width by hand; keep code
  spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: tool-config prose relays the script for every tool`
