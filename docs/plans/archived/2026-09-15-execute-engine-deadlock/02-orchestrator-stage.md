# U2 — orchestrator stage

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/assets/execute-stages.md`, `plugins/vwf/assets/memory.md`
- **Model:** opus
- **Read first:** the **Review-stage contract** section of `index.md`; then
  `execute/SKILL.md` lines 98-160, 170-205, 341-382 and 450-460;
  `execute-stages.md` lines 10-25, 52-71, 112-148 and 167-205; `memory.md` lines
  320-340.
- **Lazy-load:** the rest of the three files, only where an edit needs its
  neighbour.

## Ruling

Quoted from `index.md`'s assumed decisions:

> **1 — Who runs the engines.** The orchestrator invokes `/code-review` (high
> effort) and `/security-review` itself, in one message, after the coder
> returns; waits on both with `TaskOutput`; then dispatches both reviewers in
> one message with each engine's output in its prompt. The reviewers run no
> engine.

> **3 — Engine hand-off.** The engine's output is pasted verbatim into the
> reviewer's dispatch prompt under an `## Engine` heading.

> **4 — Engine failure.** An engine that errors, or has not reported 30 minutes
> after invocation, is stopped with `TaskStop`; the reviewer is dispatched with
> `## Engine` reading `ENGINE: unavailable — <reason>`. The reviewer's existing
> fallback and its `ENGINE: unavailable` return line stay.

> **5 — Blockless return.** A reviewer return that carries no `REVIEW:` /
> `SECURITY:` block is an error under the existing "Subagent death" pause rule:
> re-dispatch once; twice in a row on one step → journal `blocked`, pause.

> **6 — Re-review rounds.** Every review round — the merged loop-back rounds 2–4
> and the final-gate "Fix first" loop — runs the engines again before
> dispatching the reviewers, the same sequence as round 1.

> **8 — Journal cadence.** `assets/memory.md:332-333` is reconciled to the
> per-node cadence `execute/SKILL.md:377-382` and `execute-stages.md:199-201`
> already mandate — a record as each node returns, not as each step completes.

And the orchestrator half of the contract — the four numbered steps under
**Orchestrator, after the coder returns green** in `index.md`. Copy their
substance, not their heading.

## Edits

Line numbers are the survey's; match on text.

1. **`execute/SKILL.md`, loop step 3 "review + security (concurrent)"**
   (356-359) — becomes the four-step sequence from the contract: invoke both
   engines in one message; wait on each with `TaskOutput` up to 30 minutes,
   `TaskStop` and count unavailable on error or timeout; dispatch both reviewers
   in one message, each prompt ending with `## Engine`; a return without its
   block is a "Subagent death" error. Keep the sentence that the two reviewers
   are independent read-only passes dispatched together. Add, in its own
   sentence, that the orchestrator never waits for a notification on a
   reviewer's behalf — the reviewers run no engine — and never sends a reviewer
   a message to finish its block.
2. **`execute/SKILL.md`, loop step 4 merged loop-back** (360-371) — where it
   re-runs review after a fix round, say that each round repeats step 3 in full,
   engines first (ruling 6).
3. **`execute/SKILL.md`, "Subagent death"** (198-201) — extend the condition so
   a reviewer that returned without its `REVIEW:` / `SECURITY:` block counts as
   an error for that rule (ruling 5).
4. **`execute/SKILL.md`, final-gate "Fix first"** (455-457) — the same sequence
   as step 3, engines first (ruling 6).
5. **`execute/SKILL.md`, description and pipeline summary** (5, 98-107, 124-126)
   — where the summary names the review stage, one clause saying the
   orchestrator runs the two engines and hands their output to the reviewers. Do
   not restate the four steps there.
6. **`execute-stages.md`, stage table and "dispatch both in a single message"**
   (10-22) — the review and security rows gain the engine-first note; the
   dispatch paragraph gains the `TaskOutput` wait between the coder's return and
   the dispatch.
7. **`execute-stages.md`, review and security dispatch contracts** (52-71) —
   "using `/code-review` as its engine" (57) and "using `/security-review` as
   its engine" (68-69) become: the dispatch prompt ends with `## Engine` holding
   the engine's output verbatim, or `ENGINE: unavailable — <reason>`. State the
   prompt shape once and cite it from the second contract rather than repeating
   it.
8. **`memory.md`** (332-333) — "as each step completes" becomes a record as each
   node returns — coder, reviewer, security, acceptance — the cadence
   `execute/SKILL.md` and `execute-stages.md` already state. Keep the
   `add_drawer` then `update_drawer` shape.

Do not restate the per-node journal rule in a fourth place; do not touch the
convergence guard's counts; do not add a pause condition.

## Verification

- `mise run p:plugins:check` green.
- `command grep -n 'TaskOutput' plugins/vwf/skills/execute/SKILL.md plugins/vwf/assets/execute-stages.md`
  hits in both.
- `command grep -n '## Engine' plugins/vwf/skills/execute/SKILL.md plugins/vwf/assets/execute-stages.md`
  hits in both.
- `command grep -n 'as its engine' plugins/vwf/assets/execute-stages.md` is
  empty.
- `command grep -n 'as each step completes' plugins/vwf/assets/memory.md` is
  empty.
- Read the edited step 3 once more against the contract's four steps: nothing in
  it waits on a reviewer for anything but its return.

## Guardrails

- Touch nothing outside the three owned files — the agent files are U1's, the
  docs U3's.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand.
- Skill frontmatter is strict YAML; leave the frontmatter's shape alone beyond
  the description's words.
- Delete with `rm`, never `git rm`.

## Commit

`fix: execute runs the review engines itself and waits before dispatching the reviewers`
— written by the orchestrator after the wave gate, not by the unit. Type `fix`
is in `.config/git-conventional-commits.yaml`; the file lists no scopes.
