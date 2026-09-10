# U2 — setup: the one door — drift as well as absence, and `reshape`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/**` (`SKILL.md`, `references/*`, including
  `references/onboard-pipeline.md`)
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/doctor/references/stack-checks.md:234-297`
  (the four baseline predicates — read only, to cite by section title; U3 edits
  that file); `plugins/vwf/skills/init/SKILL.md:76-87` (init's own mode
  detection — read only, U1 edits it).

## Ruling

The user, on the feedback that produced this plan:

> Disable user invocation of this skill and let it be invoked by `vwf:setup`
> skill. I want to reduce the number of user invocable skills, since there are
> quite a few they are confusion users.

The user's answers in the interview: the re-shape entry — *"Both"* (Step 0
widens to the baseline check **and** an explicit subcommand); what `reshape`
does after init returns — *"Run init, then stop"*; init's arguments — *"Drop
both; init detects mode in cwd"*.

From index.md's assumed decisions:

> **3.** Setup **cites** doctor's "The repo shape against its baseline"
> (`stack-checks.md`) for the four predicates and reads the same artifacts; it
> restates none of them.

> **7.** setup gains `argument-hint: "[reshape]"`.

## Edits

1. **`SKILL.md` frontmatter.** Add `argument-hint: "[reshape]"`. Keep
   `disable-model-invocation: true` (`:11`) — setup stays user-only.
2. **`SKILL.md` hard rule "Don't write repo tooling" (`:55-59`).** Still true;
   add one clause: setup is now the **only** way init is reached — Step 0's
   offer, or `reshape`.
3. **`SKILL.md` Step 0 (`:63-80`).** Two changes.
   - **Detection widens.** Shaped-and-current == the three unconditional slugs
     are in the adapter lockfile (as today, `:63-68`) **and** the four baseline
     predicates hold. Name them by doctor's section title — "The repo shape
     against its baseline" in `doctor/references/stack-checks.md` — and by their
     subjects only (pack versions in the lockfile against installed packs;
     project ids behind the task groups, commit scopes and aliases; `develop`
     and `main`; `REPO_NAME`), with the artifacts read. Do **not** restate how
     each is evaluated; say the predicates are doctor's and setup reads them
     from there.
   - **The offer covers both.** Any slug missing → the absence offer, as today.
     Any predicate failing → the same offer with the drift named ("behind its
     baseline: <which>"). On a yes, invoke `/vwf:init` and continue when it
     returns; on a no, a recorded deferral — the unlock text becomes
     `/vwf:setup reshape, run whenever`. Setup still never halts on an unshaped
     or drifted repo. Rewrite "init is model-invocable for exactly this seam" to
     say init is **skill-invoked** — hidden from the `/` menu, called from here
     alone.
4. **`SKILL.md` — the `reshape` argument.** A new short section before Step 0
   (or as Step 0's first branch): with the argument `reshape`, setup **skips**
   the detection, invokes `/vwf:init` directly — init still surveys, shows its
   one plan and asks its own consents — prints init's report verbatim, and
   **stops**. No mode fork, no stamp, no doctor, no commit: a re-shape never
   touches `.config/vwf.yaml`. Say why in one sentence: the spine is a setup
   run's, and a user who wants both runs setup again afterwards. Name this as
   the line doctor prints for every repo-shape finding.
5. **`references/onboard-pipeline.md:50`, `:61`, `:169`.** Every deferral term
   or unlock that names `/vwf:init` now names `/vwf:setup reshape`. Where the
   pipeline says setup "offers `/vwf:init`", keep the sentence — the offer is
   still setup's — and add that a drifted shape gets the same offer.
6. **Everywhere in the owned tree**, a passage instructing a user to type
   `/vwf:init` changes per decision 5 of index.md; a passage naming init as the
   actor stays.

## Verification

- `mise run plugins:check` green.
- `grep -n 'argument-hint: "\[reshape\]"' plugins/vwf/skills/setup/SKILL.md` →
  one hit; `grep -c '^disable-model-invocation: true$'` → `1`.
- `grep -n 'repo shape against its baseline' plugins/vwf/skills/setup/SKILL.md`
  → at least one hit (the citation); the words `lock.yaml`'s `entries:` and the
  alias grammar do **not** appear (the predicates are not restated).
- `grep -rn 'run whenever' plugins/vwf/skills/setup/` — every hit names
  `/vwf:setup reshape`.
- `grep -rn '/vwf:init' plugins/vwf/skills/setup/` — the remaining hits are the
  invocation itself and passages naming init as the actor; none instructs a user
  to type it.
- markdownlint via the wave gate; fold width matched by hand (`plugins/**/*.md`
  is not dprint's).

## Guardrails

- Touch nothing outside `plugins/vwf/skills/setup/**`. `init/`, `doctor/` and
  every doc are other units'; report as `DOCS FALSIFIED:`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Strict-YAML frontmatter; re-read the header after editing.
- Rule 10: setup names no technology. "toolchain manager", "adapter lockfile",
  "forge" — the words the file already uses.
- Write with Write/Edit, never `cat` heredocs.

## Commit

Part of wave 1's commit — written by the orchestrator after the wave gate, not
by the unit.
