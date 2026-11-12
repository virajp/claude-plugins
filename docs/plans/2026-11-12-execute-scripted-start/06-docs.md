# U6 — Docs

- **Read first:** every file this unit edits, before editing it.
- **Lazy-load:** `plugins/vwf/skills/docs-sync/SKILL.md`,
  `plugins/vwf/assets/memory.md` (the decisions doc shape).

## Ruling

> D13: "(1) D46 of the unpinned-bootstrap gap said plan and execute run doctor
> and behaviour stays; execute no longer runs doctor, so it no longer runs the
> unpinned bootstrap dry-run. (2) A critical dependency advisory no longer
> stops /vwf:execute; it still stops /vwf:plan and /vwf:setup. The release
> gate is osv-scanner through code:sec and release.yml. (3) Execute no longer
> carries non-blocking doctor findings into the run's gap list. The docs unit
> writes one decisions doc."

> D28 (site part): "U6 fixes site plugins/vwf.md:2140-2142 the same way" —
> execute does not read `consent.lsp` until the parked LSP work lands.

## Edits

1. Run `/vwf:docs-sync` over the branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line the earlier units returned.
2. Fix at least these passages, found by the survey:
   - `site/src/content/docs/plugins/vwf.md`: lines 2391-2396 (the first thing
     execute does is doctor), 2421-2424 (preflight reads doctor's report), 2823
     (each phase from doctor), 3887 (walkthrough "runs /vwf:doctor, claims the
     row"); check 63-65, 178, 673, 714 and the execute row near 841 — "execute
     halts on X" stays true where `start.mjs` still halts on X.
   - `site/src/content/docs/how-to/operate/ad-hoc-change.md` lines 268-270.
   - Check `site/src/content/docs/how-to/greenfield/multi-repo.md:351`,
     `how-to/operate/choosing-your-stack.md:215`,
     `installer/usage.md:120-121`, `installer/index.md:79-81`.
   - `CLAUDE.md` line 64: "runs `/vwf:doctor`, claims the row" becomes the one
     start script call.
   - `.claude/skills/vwf-plugin/SKILL.md:87`,
     `.claude/skills/vwf-plugin/references/skills-and-agents.md:38` and `:42`,
     `.claude/skills/vwf-plugin/references/assets.md:20`,
     `.claude/skills/vwf-plugin/references/dependencies.md:64-82`,
     `.claude/docs/plugins.md:36-38`.
   - `readme.md`: check only; its doctor lines are user advice.
3. **`docs/memory/decisions/2026-11-12-execute-scripted-start.md`** (new) —
   per `memory.md`: the three reversals of D13 with their reasons (start
   speed; the audit belongs to the release and osv-scanner already gates it;
   drift is doctor's job), and every ruling of the `decisions` list in short, each with its
   rejected alternative. Name the parked LSP check (D22) and its record
   `docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md`. Use no real repo
   name other than this one (D24).
4. **`docs/memory/gaps/2026-11-06-unpinned-bootstrap-main-open.md`** — add one
   dated line: since this plan, `/vwf:execute` no longer runs doctor, so only
   doctor full mode, `/vwf:plan` and `/vwf:setup` run the dry-run. The gap
   stays open.

## Verification

- `mise x -- mise run p:site:check`
- `mise x -- mise run code:format` leaves no change in `CLAUDE.md`,
  `readme.md` or the site docs.

## Guardrails

- Touch nothing outside `owns`; never edit a plugin file.
- `CLAUDE.md`, `readme.md` and the site docs are dprint-formatted: widening a
  table cell re-pads every row.
- Site links: relative `.md` links only inside the collection.

## Commit

`docs: the scripted execute start in the manual and the repo docs`
