# U4 — docs: the editor block passages, and the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/SKILL.md`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-init-editor-dedupe.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines as
  the orchestrator hands them over, then every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc
  shape); the wave-1 files, only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–7, is the source of truth; quote the
landed skill wording. The reversal from index.md's Goal becomes one decisions
doc:

"The 2026-09-10/11 ruling — 'dedupe the hand keys with an inline
`eslint-disable`, keep the union by hand; rejected: changing vwf's algorithm
here' — is superseded: the algorithm changes. With it, the doctrine passage that
relied on the duplicate … is rewritten: a hand key wins because the block
**omits** it, not because JSON tolerates the duplicate. The 2026-09-06 decision
that the block sits first and everything outside it survives byte-for-byte
stands, with the one carve-out that *take* and *union* remove the hand copy on
the user's word."

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-init-editor-dedupe.md`** — new, per the
   memory shape: the reversal above naming the plan folder and the decision doc
   it amends (`2026-09-06-editor-fragments-inside-the-fence.md` gets one
   `Amended by` line at the top of its precedence passage — never rewritten);
   the collision rule, the three choices, the `editor_keys` key and format 20;
   that this repo's own `.vscode` is cleaned by its next reshape.
3. **`CLAUDE.md`** — the init paragraph (`:266-300`): the sentence naming
   `enforcement.kept_files` as "the one key `init` writes into
   `.config/vwf.yaml`" now names two; the memory note in this repo's `MEMORY.md`
   is not a doc and is not touched.
4. **`.claude/skills/stackgen-plugin/SKILL.md:167-169`** (vscode compose) and
   **`.claude/skills/vwf-plugin/**`** wherever the editor block or the one
   config key is described (`references/assets.md`, `SKILL.md`).
5. **`site/src/content/docs/plugins/vwf.md`** — `### /vwf:init`'s "editor files
   composed" lead-in (`:924` region): the collision round and the recorded
   answers; the `.config/vwf.yaml` reference page or section that lists
   `enforcement` keys and the current `config_format` (grep `config_format` and
   `kept_files` under `site/src/content/docs/`).
6. **`site/src/content/docs/plugins/stackgen.md`** — the `vscode.d` fragment
   passage (`:741` region) if it restates last-wins.
7. **`.claude/docs/repo-shape.md`** and **`readme.md`** — only where a hit of
   `grep -rn "last-wins\|kept_files\|config_format" readme.md .claude/docs`
   reads false after the change.
8. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -rn "last-wins" readme.md CLAUDE.md .claude site/src/content/docs` —
  zero hits about the editor block.
- `grep -rn "the one key" CLAUDE.md .claude site/src/content/docs` — no
  remaining claim that init writes one config key.
- `grep -rn "config_format.*19" site/src/content/docs` — no page names 19 as
  current.

## Guardrails

- No edit under `plugins/**`; quote landed wording.
- Never edit a version file or a generated file — U5.
- Do not end a table cell in a bare asterisk.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: init editor dedupe — collision round, editor_keys, format 20` — written
by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
