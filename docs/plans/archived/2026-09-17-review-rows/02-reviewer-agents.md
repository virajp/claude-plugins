# U2 — Reviewer agents: review a scope, not a unit

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/execute-code-reviewer.md`,
  `plugins/vwf/agents/execute-security-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom. The cited lines:
  `execute-code-reviewer.md` :5-9, :25-44, :98-99, :110;
  `execute-security-reviewer.md` :5-7, :25-34, :68-69, :96.
- **Lazy-load:** `plugins/vwf/assets/execute-stages.md:65-89` (today's dispatch
  contract — U1 rewrites it in this wave; write the agents so that a dispatch
  carrying a scope instead of a unit is what they expect).

## Ruling

1 — "A review is a **`Kind: review` row** in the Units table: Owns `—`, Depends
on names the units it covers, Model `opus`, and a `NN-review.md` unit file
carrying only the header lines and a Scope section naming what it reviews. When
execute reaches it in wave order it runs `/code-review` and `/security-review`,
waits, then dispatches `execute-code-reviewer` and `execute-security-reviewer`
in one message with the Engine section — step 3 of today's code-unit, once, over
the row's scope."

3 — "A review row reviews the **branch delta since the previous review row, or
the branch base** when it is the first."

5 — "The run journal's node value `review` names the row; the unit cell carries
the row id; `wave` is the row's wave. Recall tags become
`<row-id>/review/<round>` and `<row-id>/security/<round>`."

## Edits

1. **Both files, description** (`:5-9` / `:5-7`) — the agent reviews "the review
   row's scope — the branch delta the orchestrator names — against the units it
   covers and their rulings"; keep "which the orchestrator runs and hands over
   in the dispatch prompt".
2. **Both files, the inputs section** (`:25-44` / `:25-34`) — the dispatch
   carries a scope: the commit range, the file list, and the unit files (with
   their rulings) that own those files — several units, not one. Each finding
   names the file and, from the Owns the dispatch lists, the unit it belongs to,
   so the orchestrator can route the fix (ruling 4 in `index.md`).
3. **Recall and add-drawer tags** (`:98-99`, `:110` / `:68-69`, `:96`) —
   `<row-id>/review/<round>` and `<row-id>/security/<round>` per ruling 5; where
   the tag today embeds a slice or unit name, it embeds the review row's id.
4. Every "the unit" that means the thing under review becomes "the scope" or
   "the units it covers"; a "the unit" that means the unit a finding belongs to
   stays.

## Verification

- `grep -n '<slice>/review\|<slice>/security\|<unit>/review\|<unit>/security' plugins/vwf/agents/execute-code-reviewer.md plugins/vwf/agents/execute-security-reviewer.md`
  prints nothing.
- `grep -c 'row' plugins/vwf/agents/execute-code-reviewer.md` ≥ 1, same for the
  security file.
- `mise run p:plugins:check` green (agent frontmatter is strict YAML —
  `description:` stays one flow scalar, `tools:` list untouched).
- `mise run code:precommit` green.

## Guardrails

- Do not touch `plugins/vwf/skills/**`, `plugins/vwf/assets/**` (U1, U3), any
  doc, any version file.
- Do not change the `tools:` list or the `model:` line of either agent.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- No escaped backtick inside a code span; no code span beginning with `##`; no
  table cell ending in a bare asterisk.
- Delete with `rm`, never `git rm` (nothing to delete here).

## Commit

`refactor: execute reviewers take a review row's scope instead of one unit` —
written by the orchestrator after the wave gate. Type `refactor`; no scope.
