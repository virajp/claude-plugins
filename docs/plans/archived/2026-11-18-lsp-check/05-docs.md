# U5 — Docs

- **Read first:** the branch delta of waves 1 to 3, then each passage named
  below.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D2, D4:** `/vwf:execute` stops a plan with a code unit when the target repo
  does not have `code:lsp:check`, or when the check fails. The user fixes it
  before the run continues. A plan of edit units continues, and its final
  report lists the `lsp-check` rows.
- **D3:** In `/vwf:doctor`, an `lsp-check` row is `degraded`.
- **D5:** `consent.lsp` is retired. `/vwf:plan` no longer asks the LSP
  question.
- **D11:** Rename `docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md` to
  `2026-11-13-execute-lsp-check-resolved.md` with plain `mv`, and change the
  end of its header line to `resolved <date> by 2026-11-18-lsp-check`, in the
  form of the other resolved records (for example
  `2026-11-15-r5-stack-without-packs-resolved.md`). Its body stays, with one
  `Resolved:` line at the end that states D2, D4 and D5.
- **D12:** The parked rule (`installed` stops, `proceed without` writes a gap)
  is reversed. Name the reversal in the `Resolved:` line.

## Edits

1. Run `/vwf:docs-sync` over the branch delta of this run. Apply each finding
   inside the owned paths, and each `DOCS FALSIFIED:` line of U1 to U3.
2. **`site/src/content/docs/plugins/vwf.md`** — the LSP question of
   `/vwf:plan` (about lines 2112-2114), the consent block (about line 2150),
   the preflight passage of `/vwf:execute` (about lines 2424-2426) and the
   cycle-only keys (about line 3555): state D2 to D5. Examine the doctor
   section for the new `lsp-check` row.
3. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** (the
   `plan`, `execute` and `doctor` rows) and
   **`.claude/skills/vwf-plugin/references/assets.md`** (the
   `plan-interview.md` row): remove `consent.lsp` and the parked LSP text, and
   name the `lsp-check` row.
4. **The gap record** — D11 and D12. Then, per D15, repoint the link to it in
   `docs/memory/decisions/2026-11-12-execute-scripted-start.md` (about line
   77) to the new `-resolved.md` name. Change nothing else in that record.
5. `CLAUDE.md` and `readme.md`: change a passage only if docs-sync finds that it
   names `consent.lsp` or the parked LSP check.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.
- K2 of `gates.keeps` has no hit outside its allowed list.

## Guardrails

- Touch nothing outside the owned paths.
- Write all new prose in ASD-STE100.
- `CLAUDE.md` and `readme.md` are dprint-formatted: widening one table cell
  re-pads each row.
- Rename with `mv`, never `git mv`. Do not run `git checkout` or `git restore`.

## Commit

`docs: the LSP check of doctor and execute, and consent.lsp retired`
