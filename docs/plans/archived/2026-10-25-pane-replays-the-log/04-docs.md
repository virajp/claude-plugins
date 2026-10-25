# U4 — Docs

- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`, then each owned
  file's passages that the facts section lists.

## Ruling

> - D12: The docs unit deletes
>   docs/plans/gaps/2026-10-21-execute-monitor-gap-fixes.md with rm; its
>   items are now in this plan (two taken, two Parked). The folder
>   docs/plans/gaps/ is removed when it is empty.
> - D19: U4. site/src/content/docs/plugins/mempalace.md joins the docs unit's
>   owns; U4 corrects ':101-102' from four action-log hooks to five (plan B added
>   SessionEnd) and keeps its link to vwf.md#the-progress-pane.
> - D25: No. Under D24 the pane reads both run.worktree and run.log, so the
>   passage 'the progress pane finds the worktree and the log' stays true; no
>   unit owns that file.
> - D27: U4. .claude/docs/plugins.md joins the docs unit's owns; U4 rewrites
>   the cell at ':12' that says the pane still reads docs/plans/index.md until
>   a later plan rewrites it, to the sources of D24.
> - D30: U4. plugins/vwf/assets/execute-stages.md and
>   plugins/vwf/skills/execute/references/action-log.md join the docs unit's
>   owns. U4 rewords execute-stages.md ':338-340' and action-log.md ':25': the
>   pane reads the times, the agents and the run end from the log, and the
>   state from index.json (D24); the row and gap events stay, for log.mjs
>   summary and a later reader.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta. Apply its findings and
   every `DOCS FALSIFIED:` line that U1 and U2 returned.
2. Reconcile the passages that the facts section lists:
   `site/src/content/docs/plugins/vwf.md` (the pane section `:3169-3231`,
   chiefly `:3201-3206` and `:3222-3227`; keep the heading "The progress
   pane", which `plugins/mempalace.md:103` links to), `CLAUDE.md:378-387`
   (remove the caveat that the pane reads the old markdown), `readme.md:197`,
   `.claude/skills/vwf-plugin/SKILL.md:442-460`,
   `.claude/skills/vwf-plugin/references/assets.md:44-45`,
   `.claude/skills/plugin-authoring/SKILL.md:104-111`.
3. Write `docs/memory/decisions/2026-10-25-pane-replays-the-log.md` per
   `plugins/vwf/assets/memory.md`: every ruling of the `decisions` list of
   `index.json`, in short, and the three reversals of the gap-fixes
   decisions (D1, D3, D12).
4. `rm docs/plans/gaps/2026-10-21-execute-monitor-gap-fixes.md` (D12), and
   `rmdir docs/plans/gaps` when it is then empty.
5. `.claude/docs/plugins.md:12` (D27): the pane's sources are now those of
   D24 of `index.json`.
6. `plugins/vwf/assets/execute-stages.md:338-340` and
   `plugins/vwf/skills/execute/references/action-log.md:25` (D30).
   `plugins/**/*.md` is not formatted: keep the 80-column fold by hand.
7. `site/src/content/docs/plugins/mempalace.md:101-102` (D19): "four
   action-log hooks" becomes five; keep its link to
   `vwf.md#the-progress-pane`.

## Verification

- `grep -rn 'index\.md' site/src/content/docs/plugins/vwf.md CLAUDE.md .claude/skills/vwf-plugin/SKILL.md`
  shows no passage that says the pane reads `index.md`.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` are
  green.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and `site/**` are dprint-formatted: do not end a
  table cell in a bare `*`.
- Never use `cat >` heredocs to write files; use Write or Edit.

## Commit

`docs: the progress pane replays the plan's action log`
