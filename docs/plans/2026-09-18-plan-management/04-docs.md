# U4 — Docs

- **Wave:** 3
- **Depends on:** U2, U3
- **Owns:** `CLAUDE.md`, `readme.md`, `.claude/skills/vwf-plugin/**`,
  `site/src/content/docs/plugins/vwf.md`,
  `site/src/content/docs/how-to/operate/ad-hoc-change.md`,
  `docs/memory/decisions/2026-09-18-plan-management.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/plan-management/SKILL.md` (what you are
  documenting); `site/CLAUDE.md` (the link rule, the anchor rule, the markdown
  mirror); `site/src/content/docs/plugins/vwf.md:801-880` (the Commands table
  and the `### /vwf:init` section — the style to copy) and `:2240-2310` (the
  section you replace); `.claude/skills/vwf-plugin/SKILL.md:182-244` (the
  invocation policy and its counts); every other owned passage listed in the
  Edits.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the decisions-doc shape); the
  last decisions doc under `docs/memory/decisions/` for its register;
  `plugins/vwf/skills/docs-sync/SKILL.md`.

## Ruling

Decisions 2, 9, 10 and 11, and the reversal, quoted:

> **2.** Model-only: `user-invocable: false`,
> `disable-model-invocation:
> false` … A user reaches `archive` or `list` by
> asking in prose.

> **9.** Gap-kept, hand-merged and never-run folders are retired when a user
> asks in prose; the session invokes `archive <folder>` …

> **10.** `### /vwf:archive` becomes `### /vwf:plan-management` in
> `### /vwf:init`'s style — says skill-invoked, lists the verbs and who calls
> each; the `#vwfarchive` links re-point to `#vwfplan-management`; the Commands
> table row and the user-only count follow.

> **11.** … `rm -r skills/archive` and `rm assets/plan-index.md` are U5's, after
> every citation has moved.

> **Reversal.** `/vwf:archive` stops being a typed command. … The new skill is
> model-only: a user retires a folder by asking in prose, and the session
> invokes the verb.

## Edits

First run `vwf:docs-sync` scoped to the branch delta (waves 1–2) and take its
findings together with every `DOCS FALSIFIED:` line U1–U3 returned and the list
below. Then:

1. **`docs/memory/decisions/2026-09-18-plan-management.md`** — new, in the shape
   the neighbouring decisions docs use: the decision (one skill owns the plan
   index, the Status block and the archive; `archive` retired into it;
   model-only), the reversal (`/vwf:archive` no longer typed — how a user
   archives now), the rejected alternatives from the plan's decisions table
   (rows 1–4, 8, 13), and the consequence for the next plan (B12 `unclaim`).
2. **`CLAUDE.md:59`** — "leaving it live for `/vwf:archive` to move when one is"
   → left live, archived when the user asks; `:310` — the one plan index is
   `plan-management`'s (`skills/plan-management/references/plan-index.md`), not
   an asset. Note the file is dprint-formatted — a widened table cell re-pads
   the table; that is expected.
3. **`readme.md:242`** — whatever the hit says, restated without the typed
   command.
4. **`.claude/skills/vwf-plugin/SKILL.md`** — `:67` (the index and its
   contract's new home); `:77-78` (live for the `archive` verb when a gap is
   open); `:225-244` — the counts: the skill-invoked set gains `plan-management`
   and the user-only set loses `archive` — recount from the frontmatter under
   `plugins/vwf/skills/*/SKILL.md`, never from memory, and write the numbers you
   counted.
5. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`** — `:11-13`
   (the user-only list drops `archive`; the count follows); `:35` (the `execute`
   row); `:38` (the `archive` row becomes a `plan-management` row —
   skill-invoked, the nine verbs in one cell, who calls it); `:44` (the
   `backlog` row: called by `plan-management` too); `:45` (the `change-plan`
   row: `add` is the one edit it makes there).
6. **`.claude/skills/vwf-plugin/references/assets.md:15`** — the `plan-index.md`
   row is removed from the assets table, and one sentence under the table says
   where it went; if the file lists per-skill references anywhere, add it there.
7. **`.claude/skills/vwf-plugin/references/docs-tree.md:45,51,57`** — the
   contract's home, the `archive` verb, the callers of `backlog`.
8. **`site/src/content/docs/plugins/vwf.md`** — the manual:
   - `:2249-2305` — replace the `### /vwf:archive` section with
     `### /vwf:plan-management`: the opening says it is skill-invoked and never
     typed (the sentence `### /vwf:init` uses at `:876-890`), what it owns, the
     verbs as a table (verb · does · called by), how a user archives a folder
     the landing left live (ask in prose), and that it never commits.
   - `:815` — the Commands table row becomes the `plan-management` row; keep the
     table's column shape.
   - `:827` — the "Six are user-only" sentence: drop `archive`, recount.
   - `:157`, `:865` — the model-tier prose naming `archive` as a mechanical
     skill names `plan-management` instead (sonnet, not haiku — say so if the
     sentence says haiku).
   - `:298` — the mermaid node `E["/vwf:archive"]` becomes the archive step of
     execute's landing, or `plan-management`, whichever reads right in the
     diagram; the edges stay valid.
   - `:348` — "`archive` is offered once no gaps remain" → archived by the
     landing when no gap is open, on request otherwise.
   - `:2201`, `:2209`, `:2464` — every `(#vwfarchive)` link becomes
     `(#vwfplan-management)`; the anchor is the heading's GitHub-style slug, and
     `site/CLAUDE.md` forbids a slug plugin — do not add one.
   - `:2892` — walkthrough step 6 is no longer a typed command: the landing
     archived the plan; a live one is archived by asking.
9. **`site/src/content/docs/how-to/operate/ad-hoc-change.md:235,274`** — the
   gap-kept folder is archived on request; the link re-points to
   `../../plugins/vwf.md#vwfplan-management`.
10. Any further hit of
    `grep -rn 'vwf:archive\|assets/plan-index\|#vwfarchive' CLAUDE.md readme.md .claude site/src/content/docs`
    outside `docs/memory/` — every one is yours.

## Verification

- `grep -rn 'vwf:archive\|#vwfarchive\|assets/plan-index' CLAUDE.md readme.md .claude/skills/vwf-plugin site/src/content/docs`
  returns nothing.
- `mise run p:site:check` green — the link checker is what proves the anchor
  re-pointing; it fails a fragment that resolves to nothing.
- `mise run code:precommit` green — `CLAUDE.md`, `readme.md`, `.claude/**` and
  `site/**` are dprint-formatted; let the `format` hook re-pad tables rather
  than fighting it.
- The counts in `.claude/skills/vwf-plugin/SKILL.md:225-244` and
  `skills-and-agents.md:11-13` and `vwf.md:827` agree with
  `grep -l 'user-invocable: false' plugins/vwf/skills/*/SKILL.md | wc -l` and
  `grep -l 'disable-model-invocation: true' plugins/vwf/skills/*/SKILL.md | wc -l`.

## Guardrails

- Touch nothing under `plugins/` — U1–U3 own the plugin; U5 owns the manifest
  and the deletions. `docs/memory/decisions/*` other than the new file and
  `docs/memory/handoff/next.md` are historical: never edited.
- `site/CLAUDE.md`'s link rule: a link inside the docs collection is a relative
  `.md` link; anything outside it is an absolute GitHub URL; the remark plugin
  fails the build on an escaping link.
- Frontmatter of site pages is strict (`title`, `description`, `order`) — do not
  touch it.
- No escaped backtick inside a code span; no code span starting with `##`; no
  table cell ending in a bare `*`.
- Delete nothing; `rm` nothing.

## Commit

`docs: plan-management — the manual, the repo docs and the decision` — written
by the orchestrator after the wave gate. `docs` is in
`.config/git-conventional-commits.yaml`.
