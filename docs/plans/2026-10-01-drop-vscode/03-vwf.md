# V3 — vwf drops the editor question, the editor merge and the hygiene fragment

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/**` except `plugins/vwf/.claude-plugin/plugin.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/init/SKILL.md` whole;
  `plugins/vwf/assets/vwf-config.md` (schema and migration notes);
  `plugins/vwf/skills/setup/references/{migrate-pipeline,format-lineage}.md`.
- **Lazy-load:**
  `init/references/{new-repo,existing-repo,readme-and-license}.md` at the cited
  lines.

## Ruling

> E1 — Retired everywhere: init's question 7, `answers.editor`, …

> E2 — … init's editor merge (`fragments-and-sections.md` deleted, its citations
> fixed) …

> E3 — `config_format` 21 → 22: a migration row drops `answers.editor` and
> `enforcement.editor_keys`, and `.config/vscode.d/*` is offered for delete.
> `.vscode/` is the user's — untouched, markers and all.

User, verbatim: *"drop vscode settings from the plugin, let user create and
manage their vscode settings"*.

## Edits

1. **init**
   - `SKILL.md`: remove question 7 (`:619-641`) and renumber nothing else's
     meaning — later questions keep their content; fix every in-file reference
     to question numbers that shift. Remove the editor mentions at
     `:36-37,83,98-102,415,420,674,684,756,763-767,782`, and the
     `fragments-and-sections.md` row of the reference table (`:717`) and
     citation (`:638`).
   - `references/new-repo.md`
     (`:97,142,147,153,159,178,192-193,233-234,242,246`) — no `editor` key
     passed, no detection of a `.vscode/` dir or `code` binary.
   - `references/existing-repo.md`
     (`:110-119,242-245,616,631,652,660-672,892,1033,1045-1046,1054`) — the
     allowlist's editor-directory exemption, the `repo-hygiene.jsonc` rename
     row, pass 7 "Editor fragments", the collision sub-line; a pass number that
     disappears leaves its neighbours' numbers unchanged — say "Pass 7 —
     retired" in one line, the way §6 of new-repo retires hook fragments.
   - `rm` `references/fragments-and-sections.md`; fix every citation in
     `plugins/vwf/**` (`grep -rn fragments-and-sections plugins/vwf`).
   - `references/readme-and-license.md:21,26,37-40` — drop the hygiene fragment
     row and the "editor baseline is the one exception" passage.
   - `rm -r` `assets/hygiene/.config/vscode.d/`.
2. **Config schema** — `assets/vwf-config.md`: `config_format: 22`; drop
   `answers.editor` (`:125`) and `enforcement.editor_keys` (`:122`) and their
   ownership lines (`:237-238`); add a format-22 note to the migration notes
   (`:633-660`).
3. **setup** — `references/migrate-pipeline.md` (`:30-34`): a 21 → 22 row that
   removes `answers.editor` and `enforcement.editor_keys`, and offers each
   `.config/vscode.d/*.jsonc` for delete (one row each, default delete), never
   touching `.vscode/`. `references/format-lineage.md` (`:126-127`): add the 22
   entry. `references/materialize.md` (`:114,124,153,399`): no `editor` answer,
   no detection. Any other `config_format` 21 constant in `plugins/vwf/**`
   (`grep -rn 'config_format' plugins/vwf`) moves to 22.
4. **architecture** — `skills/architecture/SKILL.md:415`: drop `editor_keys`.

## Verification

- `grep -rn -i -E 'vscode|editor_keys|answers\.editor|fragments-and-sections' plugins/vwf`
  prints only the format-22 migration row and lineage entry naming what they
  remove, and `assets/capability-vocabulary.md:166`.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Never touch `plugins/vwf/.claude-plugin/plugin.json` (V7).
- Plan 4 later scripts init's mise steps; touch only editor passages here.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand; keep code
  spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: vwf asks no editor question and composes no editor config — config_format 22`
