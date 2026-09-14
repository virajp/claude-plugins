# U1 — reviewer agents

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/execute-code-reviewer.md`,
  `plugins/vwf/agents/execute-security-reviewer.md`
- **Model:** opus
- **Read first:** both owned files, top to bottom; the **Review-stage contract**
  section of `index.md`.
- **Lazy-load:** `.claude/skills/plugin-authoring/SKILL.md` (strict-YAML
  frontmatter — a bad `tools` list drops the agent silently).

## Ruling

Quoted from `index.md`'s assumed decisions:

> **1 — Who runs the engines.** The orchestrator invokes `/code-review` (high
> effort) and `/security-review` itself, in one message, after the coder
> returns; waits on both with `TaskOutput`; then dispatches both reviewers in
> one message with each engine's output in its prompt. The reviewers run no
> engine.

> **2 — Reviewer turn shape.** A reviewer is single-turn: manual dimensions,
> merge with the engine text in its prompt, return one block. Ending the turn
> without the block, or with any promise to fold findings in later, is named as
> forbidden in the agent file.

> **7 — Reviewer tools.** `Skill` and `SlashCommand` leave both reviewers'
> `tools` lists — nothing remains for them to invoke. The four mempalace ids
> stay; `model: opus` stays.

And the reviewer half of the contract:

> **Reviewer:** step 1 reads the `## Engine` section of the dispatch prompt in
> place of running the skill. A prompt with no `## Engine` section is read as
> `ENGINE: unavailable — not supplied`, and the return line says so. Everything
> from the manual dimensions onward is unchanged. The block's `ENGINE` line
> keeps its current vocabulary.

## Edits

Both files take the same four edits; line numbers are the survey's and may have
drifted by a line or two — match on text.

1. **Frontmatter `tools`** (code 8-12, security 7-11) — remove `Skill` and
   `SlashCommand`. Keep `Read, Bash, Grep, Glob` and the four mempalace ids in
   their current order. Keep `model: opus`.
2. **Description** (code 6-7, security 5-6) — "using `/code-review` as its
   engine" becomes wording that says the engine's findings arrive in the
   dispatch prompt: e.g. "merging the `/code-review` engine's findings, which
   the orchestrator runs and hands over, with its own dimensions". Same for
   `/security-review`. The description must still say what the agent is for and
   who invokes it.
3. **Step 1** (code 23-27, security 23-27) — replace "Run `/code-review` as the
   engine … high effort" with: read the `## Engine` section at the end of the
   dispatch prompt; it holds the engine's output verbatim, or one line
   `ENGINE: unavailable — <reason>`; a prompt with no such section is read as
   `ENGINE: unavailable — not supplied`. State plainly, in its own sentence,
   that **this agent never invokes `/code-review`** (resp. `/security-review`)
   **or any other skill** — the orchestrator ran it before dispatch. Keep the
   existing fallback: unavailable → proceed with the manual dimensions and say
   so on the `ENGINE` line.
4. **Turn discipline** — add to the return-block contract (code 112-136 near
   "nothing before or after the block" at 132; security 74-94) one short
   paragraph: the agent's turn ends with the block and nothing else; ending the
   turn before the block, or with any promise to fold findings in later or wait
   for anything, is forbidden — the orchestrator waits for the block alone, and
   a return without it is treated as a failed subagent.

Leave the manual dimensions, the merge step (code 91, security 52), the "do not
paste engine output" rule (code 115), the mempalace filing (code 93-110,
security 54-72), and the block's field list unchanged. Only the provenance of
the engine text changes.

## Verification

- `mise run p:plugins:check` green (frontmatter still strict YAML; the agent
  still loads).
- `command grep -n 'Skill\|SlashCommand' plugins/vwf/agents/execute-code-reviewer.md plugins/vwf/agents/execute-security-reviewer.md`
  is empty.
- `command grep -n 'Run .\?/code-review\|Run .\?/security-review' plugins/vwf/agents/execute-*-reviewer.md`
  is empty.
- `command grep -c '## Engine' plugins/vwf/agents/execute-code-reviewer.md` and
  the security file each print at least `1`.
- Both files still carry the `ENGINE` line in the return block.

## Guardrails

- Touch nothing outside the two owned files — the orchestrator half is U2's, the
  docs U3's.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand.
- Frontmatter is strict YAML; do not leave a trailing comma or a stray tab in
  the `tools` list.
- Delete with `rm`, never `git rm`.

## Commit

`fix: execute reviewers read the engine from the dispatch prompt, never run it`
— written by the orchestrator after the wave gate, not by the unit. Type `fix`
is in `.config/git-conventional-commits.yaml`; the file lists no scopes.
