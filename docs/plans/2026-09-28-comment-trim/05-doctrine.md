# U5 — Write the comment rule into the authoring doctrine

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.claude/skills/plugin-authoring/**`,
  `plugins/stackgen/assets/pack-format.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `.claude/skills/plugin-authoring/SKILL.md` and its
  `references/`, then `plugins/stackgen/assets/pack-format.md` top to bottom.

## Ruling

> - Decision 3 — The trim rule: Keep every comment a tool or skill reads:
>   `#MISE`/`#USAGE`, shebangs, `# shellcheck` directives, `# >>>`/`# <<<`
>   markers, `MARKED POSITION` lines, grype reason comments, fill-in templates,
>   and any comment a reference names as load-bearing. Keep a single-line
>   warning where a reader would otherwise break something non-obvious. Every
>   longer explanation goes: dropped when the owning reference already says it,
>   moved into that reference (tool-config `references/*.md`, the pack's
>   `conventions.md`) when it does not. Repeated boilerplate goes; a directive
>   under it stays.

> - Decision 4 — Keeping it from growing back: The rule is written into the
>   `plugin-authoring` skill and stackgen's `pack-format.md`. Rejected: also a
>   `p:plugins:check` rule capping comment blocks; nothing.

## Edits

1. **`.claude/skills/plugin-authoring/SKILL.md`** (or the reference it routes
   payload authoring to) — a short section, "Comments in shipped config and task
   files", stating Decision 3 as the rule for anything under a tool-config
   `assets/` tree, a pack's `config/` or `hooks/`: what is kept, the one-line
   warning, where longer explanation goes. Name the machine-read kinds exactly.
2. **`plugins/stackgen/assets/pack-format.md`** — the same rule, stated once for
   pack authors beside the payload rules (near the cite-nothing-by-path passage,
   `:445-456`), in that file's voice. `plugins/**/*.md` is not dprint-formatted:
   match its fold width by hand.
3. No enforcement text: the rule is doctrine, not a checker rule.

## Verification

- `mise run p:plugins:check` green (pack-format.md is scanned by its prose
  rules).
- `grep -n 'MARKED POSITION' .claude/skills/plugin-authoring plugins/stackgen/assets/pack-format.md -r`
  finds the rule in both.

## Guardrails

- Touch nothing outside Owns — the rest of `.claude/**` is U6's.
- `.claude/**` is dprint-formatted in this repo; run
  `mise run code:format -- <file>` over only the files you edited.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`docs: state the comment rule for shipped config and task files`
