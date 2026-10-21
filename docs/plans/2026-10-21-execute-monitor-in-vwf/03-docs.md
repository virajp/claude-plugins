# U3 — Docs

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/docs/**`, `.claude/skills/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md` (new), and
  any other human-facing passage `vwf:docs-sync` finds outside U1's Owns
- **Model:** opus
- **Kind:** edit
- **Read first:** `index.md` of this folder — the Goal, the reversals, the facts
  and the decisions table.

## Ruling

> - Decision 9: The docs unit writes
>   `docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md` and
>   replaces the passages that say vwf ships only shell hooks.

The two reversals in the Goal, confirmed by the user on 2026-10-21.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line U1 returned.
2. **`docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md`** — new,
   per `plugins/vwf/assets/memory.md`: decisions 1 to 7 and 10 of `index.md`;
   the two reversals by file name; why a separate plugin was rejected (no
   marketplace or manifest field hides a listed plugin or blocks a direct
   install); why `/vwf:monitor` was rejected (a registered command name takes no
   colon); and that the two-plugin north star stays unchanged.
3. **Known passages** (the facts list them with lines): each passage that says
   vwf ships only the two mempalace hooks, or that every plugin hook is a shell
   script beside `hooks/hooks.json`, now also names the hooks module
   `hooks/monitor/register.tsx`, listed under `modules` in `hooks/hooks.json`,
   and the `types` manifest key. In
   `.claude/skills/vwf-plugin/references/assets.md:39-43`, replace the "a JS/TS
   rewrite has no business in a language-agnostic workflow plugin" ruling with
   the new one: the workflow doctrine stays language-agnostic, and the one
   TypeScript module is engine glue for the progress pane. In the
   `plugin-authoring` skill, the shell-hook rules (BSD `sed`, never in
   `settings.json`, the verdict shape) stay, scoped to command hooks; add one
   paragraph on a hooks module (`modules`, the `types` contract, `$.state` keys
   under the plugin's own name, `claude plugin test` and
   `claude plugin validate --strict` as its local gates, and that CI has no
   `claude`).
4. **`site/src/content/docs/plugins/vwf.md`** — in the `/vwf:execute` section,
   add a subsection on the progress pane for users: it opens when a typed
   `/vwf:execute` starts (on a terminal of 144 columns or more when the model
   starts the skill); what it shows (plan, start and end times, one progress
   segment per unit — pending dim, running plain, failed red, skipped gray,
   finished green, finished with gaps yellow — unit status, times and gaps); a
   unit row opens that unit's subagent transcript; `/vwf-monitor [folder]` opens
   it, also for a run already in progress; `/vwf-monitor close`, Esc at an idle
   prompt, or `ctrl+x tab` then `c` closes it; it steps aside for a question;
   and its limits — in the fullscreen layout it docks beside the transcript and
   cannot cover the whole screen, the normal layout (`CLAUDE_CODE_NO_FLICKER=0`)
   shows it above the prompt at full width, and the normal layout reports no
   mouse clicks. Name that the mod API is early access.
5. Do not edit the dated decision docs or any live plan folder under
   `docs/plans/`.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rn "two mempalace auto-save hooks\|The two shell hooks" CLAUDE.md .claude site/src/content/docs readme.md`
  — every remaining hit also names the hooks module.

## Guardrails

- `CLAUDE.md`, `readme.md` and `site/**` are dprint-formatted: never end a table
  cell in a bare asterisk; keep each code span on one line.
- `.claude/skills/**` and `.claude/docs/**` `.md` files are scanned by no vwf
  rule, but any new `.md` under `plugins/vwf/` would be scanned by checker rule
  10 — this unit writes none there.
- Do not edit `docs/plans/**`.

## Commit

`docs: the vwf:execute progress pane and vwf's hooks module`
