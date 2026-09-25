# U2 — swiftui: native macOS only, the ux-gate's output, golden's refusal wording

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/skills/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/config/.config/mise/tasks/test/golden`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file you edit, top to bottom, before editing —
  `skills/ux-gate/SKILL.md`, `conventions.md`, `test/golden`, and
  `skills/swiftui/references/platforms/macos.md`.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md:400-435` (vwf's ux-gate
  contract — read only, never edit).

## Ruling

> **A3** — State native macOS only: `desktop` means a native macOS target, and
> Mac Catalyst is not supported by the ux-gate or golden. Rejected: support
> Catalyst via the pin; detect it from the scheme.

> **A4** — Fold into findings: the swiftui ux-gate drops `viewport:` and
> `a11y:`, reports the audited device or viewport in `reason` or a finding's
> `where`, and a11y failures as findings; vwf's contract is unchanged. Rejected:
> add them to vwf's contract; contract allows extra keys.

> **A5** — The `--record` refusal names the overrides actually given; "a run
> with no pin is refused" becomes "a run with no pin and not all three overrides
> is refused", in golden and conventions.

## Edits

1. **`skills/ux-gate/SKILL.md`** — where the desktop audit uses `platform=macOS`
   (`:136-137`), add one sentence: the desktop pass targets a native macOS app;
   a Mac Catalyst target (which needs `variant=Mac Catalyst`) is not supported
   by this gate.
2. **`skills/ux-gate/SKILL.md`** — the return block at `:159-160`: remove the
   `viewport:` and `a11y:` lines. The return is exactly vwf's three keys —
   `rendered: ok | n/a`, `reason` (required when n/a),
   `findings: [{severity, screen, what, where}]`. Name the audited device or
   viewport in `reason` when `n/a`, and in each finding's `where`; an
   accessibility audit failure is a finding (its severity per the audit). Adjust
   any prose in the skill that describes the removed lines.
3. **`skills/swiftui/references/platforms/macos.md`** — one sentence in its
   opening or contract section: the `desktop` doctrine and gates assume a native
   macOS target; Mac Catalyst is not the desktop path and the gates do not build
   it.
4. **`config/.config/mise/tasks/test/golden`** — `:103`: when `--record` is
   refused because no pin exists and the three overrides were given, the message
   names those overrides (the values given) and says `--record` records only on
   a pinned simulator, instead of naming "the pinned simulator". `:38` comment:
   "a run with no pin and not all three overrides is refused". Change message
   text and comments only — no control flow.
5. **`conventions.md`** — `:85`: the same wording as edit 4's comment.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` pass.
- `grep -nE '^\s*(a11y|viewport):' plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/SKILL.md`
  is empty.
- `grep -rn 'Catalyst' plugins/stackgen/stacks/app-framework/swiftui` hits the
  ux-gate and `platforms/macos.md`.
- `bash -n` on `test/golden` passes.

## Guardrails

- Do not touch `pack.yaml` (U5's), `config/.config/mise/tasks/code/*` (plan
  B's), or any other task file.
- Do not edit `plugins/vwf/**`.
- Rule 13: a landed skill cites no plugin path.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at the surrounding
  width. Keep code spans on one line. Write with Write/Edit, never heredocs.
- Delete with `rm`, never `git rm`.

## Commit

`fix: swiftui — native macOS only, the ux-gate returns vwf's three keys, golden's refusal names the overrides`
