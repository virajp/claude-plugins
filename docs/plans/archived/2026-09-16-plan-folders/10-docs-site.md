# U10 — The site manual

- **Wave:** 3
- **Depends on:** U4, U5, U6, U7, U8
- **Owns:** `site/src/content/docs/**`
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`;
  `site/CLAUDE.md` (the link rule, the gate); then the cited passages of
  `site/src/content/docs/plugins/vwf.md` — commands table `:792-817`,
  `/vwf:plan` `:1812-1863`, `/vwf:execute` `:1864-1986`, `/vwf:archive`
  `:1987-2036`, `/vwf:backlog` `:2147-2201`, `/vwf:change-plan` `:2202-2308`,
  `/vwf:change-execute` `:2309-2429`, quick-start `:2705-2721`, skills prose
  `:2739-2809`, and the scattered lines
  `:294, :342, :397-398, :503, :1825,
  :1952, :1999-2029, :2187, :2194, :2622, :2710`;
  `how-to/operate/ad-hoc-change.md`
  (`:11-16, :38-39, :45, :52, :60, :105,
  :144, :162-189, :262, :285-286`);
  `how-to/operate/production-feedback-loop.md`
  (`:93-99, :179-181, :209,
  :259, :278, :302, :314, :323`);
  `how-to/operate/choosing-your-stack.md:238-239`;
  `how-to/operate/sessions-and-handoff.md:137`; `how-to/index.md:67-68`;
  `plugins/mempalace.md:354`. Then the wave-2 results:
  `plugins/vwf/skills/{plan,execute,change-plan,change-execute,archive}/SKILL.md`
  and `plugins/vwf/assets/plan-index.md`.
- **Lazy-load:** the greenfield and brownfield how-tos
  (`how-to/greenfield/*.md`, `how-to/brownfield/onboard-existing-codebase.md`) —
  only where a sentence describes a flat plan file or an in-session "Approve &
  execute" hand-off; their `### /vwf:plan` / `### /vwf:execute` step headings
  stay.

## Ruling

Decision 6: "The docs state: a flat plan in flight is finished on the previous
vwf release, or its slice is re-run through `/vwf:plan` (stamp-heal drops what
already conforms)."

Decision 11: "The in-session *Approve & execute* option is removed; *Approve &
plan next* (mid-chain) and *Approve only* stay."

The rest of the assumed-decisions table, as it describes what each command now
does.

## Edits

1. Run `/vwf:docs-sync` over the run's branch delta scoped to `site/` and apply
   its findings plus every `DOCS FALSIFIED:` line the wave-2 units returned for
   `site/`.
2. **`plugins/vwf.md`**:
   - Commands table `:804-812`: `plan` writes a folder; `execute` takes
     `<folder> | next`, fresh session, lands per consent; `change-plan` and
     `change-execute` rows say the shape is shared.
   - `/vwf:plan` section: the interview, the assumed decisions, the consent
     block (landing, after landing, release intent, LSP), the folder
     `docs/plans/<date>-<HHMM>-<slice>/`, the hand-off that commits and pushes,
     the launch line; the approval options without *Approve & execute*.
   - `/vwf:execute` section: `<folder> | next`; the claim; units run serially in
     dependency order; the Run log in the folder with the journal mirror; the
     final report from the Run log, then landing per consent; after-landing
     asks; the LSP consent row read at preflight; the in-flight flat-plan rule
     of decision 6 in a short admonition.
   - `/vwf:archive`, `/vwf:backlog`, `/vwf:change-plan`, `/vwf:change-execute`
     sections: one index table, folders of either kind, `next` by kind, the
     shared template and interview. The `### /vwf:change-execute` heading
     **stays** (linked by anchor; the skill retires in plan 2).
   - The mermaid at `:294` and the prose at `:342`, `:2710`: remove *Approve &
     execute*; the hand-off is the launch line.
   - `:397-398`, `:503`, `:1825`, `:1999-2029`, `:2187`, `:2194`: folder path,
     one table; `:1952`, `:2622`: run log wording.
   - Quick-start `:2705-2721` and skills prose `:2739-2809`: both pairs, one
     shape.
3. **`how-to/operate/ad-hoc-change.md`** — every cited line: one index table,
   the shared shape; `:45` "cycle plan" sentence now says both are folders.
4. **`how-to/operate/production-feedback-loop.md`**,
   **`choosing-your-stack.md:238-239`**, **`sessions-and-handoff.md:137`**,
   **`how-to/index.md:67-68`**, **`plugins/mempalace.md:354`** — wording only:
   folder, fresh session, `next` for both, run log in the folder.
5. Site markdown **is** dprint-formatted: run `mise run code:format` over
   `site/src/content/docs/` only. Keep every existing anchor; the link rule in
   `site/CLAUDE.md` binds.

## Verification

- `grep -rn 'Approve & execute\|<date>-<time>-<slice>\|docs/plans/<plan>.md\|cycle-plan table\|change-plan table\|flat cycle\|flat file' site/src/content/docs/`
  prints nothing except the one admonition that explains the in-flight rule
  (which may say "flat").
- `grep -n '^### /vwf:change-execute\|^### /vwf:plan\|^### /vwf:execute\|^### /vwf:archive\|^### /vwf:change-plan' site/src/content/docs/plugins/vwf.md`
  — five headings, unchanged text.
- `grep -c 'next' site/src/content/docs/plugins/vwf.md` — `/vwf:execute next`
  appears at least once.
- `mise run p:site:check` green — `astro check`, the build, the link checker
  over `dist/**` and the markdown mirror.
- `mise run code:precommit` green.

## Guardrails

- Do not touch `readme.md`, `CLAUDE.md`, `.claude/**` (U9), `plugins/**`,
  `site/CLAUDE.md`, `site/src/**` outside `content/docs/`, or `site/dist/`.
- Never `--fix` outside Owns.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk; `npm` after a pipe is rewritten by the
  hook — write with the Write tool.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`docs: plan folders — the manual` — written by the orchestrator after the wave
gate. Type `docs`; no scope.
