# U4 — the adapter contract carries the target repo; architecture decides and hands off

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/skills/architecture/references/stack-menu.md`,
  `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/membership.md:15-22` (the `members:` schema
  — read, never edit); `plugins/vwf/skills/setup/SKILL.md` (only to see how
  setup invokes `init` today, as the model for the handoff — read, never edit;
  U5 owns it).

## Ruling

Decision 5: "The invocation's argument stays `<slug>`. The target repo travels
as one optional line beside the catalog paths, in the same payload style:
`repo: <path>` — the member's `path` relative to the base root, resolved as the
member whose `projects:` lists the project; absent means the current repo.
stackgen documents receiving it; the materializer writes there and keeps that
repo's own lockfile. Every vwf caller passes it under `multi-repo`."

Decision 8: "Architecture's last step (Step 7, after its commit) **invokes
`/vwf:setup` in-session**, the way setup invokes init today. No step is added or
renumbered in architecture. `stack-menu.md:124-129` is rewritten to say
materialization is setup's."

Decision 3 (for this unit's own prefix lines): "Bare `docs:` — no scope — for
every blueprint-tree commit … `chore(vwf):` becomes `ops:`."

Decision 2 (for `vwf-config.md:74` only): the Flutter comment gains `auto`.

Reversal 1, which this unit's `stack-adapter.md` and `stack-menu.md` edits
enact: "Materialization moves from architecture to setup.
`stack-adapter.md:305-309` ("Materialization itself happens once, interactively,
when the pin is first made") and `stack-menu.md:124-129` place it at pin time
inside `/vwf:architecture`. Now `/vwf:setup` owns it, as a materialize pass that
runs on every setup run; architecture only records the decision and invokes
setup at its end."

Reversal 2, which this unit's `vwf-config.md` edit enacts: "Setup writes
`unresolved`. `vwf-config.md:165` ("**`unresolved` only ever arrives from an
`/vwf:architecture` run** … No migration writes it") … reversed for one case: an
**absent** project axis on a repo architecture has not run on. A pinned slug is
never rewritten."

The user's model, verbatim: "setup is responsible for pinning the stack to
respective repos; setup is NOT responsible to decide the stack, that
responsibility is with architecture; setup will run before architecture as well
as after (this must be programmed), so the decision of stack and pinning are
covered."

## Edits

1. **`plugins/vwf/assets/stack-adapter.md`** —
   - In the delegation protocol (`:108-152`), directly after "**The catalog
     handover.**" paragraph (`:120-128`), add "**The target repo.**" paragraph:
     an invocation may carry one optional line `repo: <path>` beside the catalog
     paths, in the same payload style; the path is the member's `path` relative
     to the base root, and vwf resolves it as the member whose `projects:` lists
     the project (`members:` in `.config/vwf.yaml`; a project no member lists is
     the base's); absent means the current repo; the adapter materializes into
     that repo and keeps **that** repo's lockfile. Under `topology: multi-repo`
     every vwf caller passes it.
   - Show the line in the invocation shape table's `-stack-template` row or in
     the YAML example that follows it, the way the catalog paths are shown.
   - `:305-309` "Materialization itself happens once, interactively, when the
     pin is first made" → materialization happens once per (repo, slug),
     interactively, in **`/vwf:setup`'s materialize pass** after
     `/vwf:architecture` has recorded the pin; "a pin whose materialization was
     declined is unmaterialized" stays, and gains "— `/vwf:setup` offers it
     again on its next run".
   - Do not change the payload fields (`:220-243`), `language_facts`
     (`:296-300`), or the conventions fetch (`:245-282`) beyond adding that the
     fetch reads the template from the target repo's `.claude/` tree when
     `repo:` is passed.
2. **`plugins/vwf/assets/vwf-config.md`** —
   - `:165-169` "**`unresolved` only ever arrives from an `/vwf:architecture`
     run** … No migration writes it, and nothing infers it from an absent key" →
     `unresolved` arrives from an `/vwf:architecture` run (which offers deferral
     beside the menu) **or from `/vwf:setup`**, which writes it on a project or
     repo axis it finds **absent** on a repo architecture has not run on, so the
     stamp can be written and the chain can proceed. No migration writes it.
     Keep "an absent `stack` block is still drift" only if it remains true after
     the setup sentence — it does not: rewrite to say an absent axis is what
     setup fills with `unresolved`, and a slug is never rewritten.
   - `:174-178` the surfaces table, `setup` row: "records what it could not
     provision and names the unlock; never halts on it" → "writes `unresolved`
     on an absent axis, materializes every pinned one in its target repo, and
     never halts on a deferred axis".
   - `:74` the `template:` comment: "a Flutter template covers
     mobile+tablet+desktop+webapp" → "+auto"; add nothing else to that line.
   - Add one sentence to the `template:` comment (`:74`) or the three-states
     section: the pin is **decided** by `/vwf:architecture` and **materialized**
     by `/vwf:setup`; a slug with no materialized entry in its repo is doctor's
     "pinned, not materialized" finding.
   - Do **not** bump `config_format` — no key changes shape.
3. **`plugins/vwf/skills/architecture/SKILL.md`** —
   - Step 3b / wherever the `stack` block is written (`:20`, `:328`): state that
     architecture **records the decision only** — a slug, or `unresolved` — and
     materializes nothing; the pin lands in `.config/vwf.yaml` under
     `projects.<name>.stack.template`; the repo it will be materialized into is
     the member whose `projects:` lists the project.
   - Step 7 (`:397ff`, "Docs sync & commit"): after the commit, add the handoff
     — invoke `/vwf:setup` in-session (the Skill tool, the way `/vwf:setup`
     invokes `init`), stating why: setup's materialize pass lands every pin just
     decided, per (repo, slug), and re-stamps. Say plainly that setup is
     idempotent on a repo it just stamped.
   - `:411,415-418` — every `docs(architecture):` example → `docs:`, the subject
     naming architecture (e.g. `docs: architecture — <what changed>`).
   - Do not add or renumber a step.
4. **`plugins/vwf/skills/architecture/references/stack-menu.md`** — `:124-131`:
   the generated pin "only resolves once the adapter's consent-gated
   materialization lands, and the invocation passes the principles-catalog
   paths" → the materialization is **`/vwf:setup`'s** materialize pass, which
   invokes the adapter per (repo, slug) with the catalog paths and the `repo:`
   line; architecture records the pin and hands off. Keep the `language_facts`
   sentence.
5. **`plugins/vwf/skills/plan/SKILL.md`** —
   - `:168-176` "**Resolve the stack conventions.**": the fetch passes
     `repo: <path>` for each project's repo under `multi-repo`, resolved from
     `members:`; conventions are still deduped by slug, now per (repo, slug).
   - `:355` `blueprint(plan):` / `docs(plan):` → `docs:`, subject naming the
     plan.
6. **`plugins/vwf/skills/execute/SKILL.md`** — `:303-312` "**Stack
   conventions.**": the same `repo:` line, and under `linkage: siblings` the
   repo already resolved at `:289-302` for the worktree is the one passed — hand
   that resolution to the fetch instead of dropping it.

## Verification

- `command grep -n "repo: <path>\|repo:" plugins/vwf/assets/stack-adapter.md plugins/vwf/skills/plan/SKILL.md plugins/vwf/skills/execute/SKILL.md`
  hits in all three.
- `command grep -n "docs(architecture)\|docs(plan)\|blueprint(" plugins/vwf/skills/architecture/SKILL.md plugins/vwf/skills/plan/SKILL.md`
  is empty.
- `command grep -n "only ever arrives from an" plugins/vwf/assets/vwf-config.md`
  is empty;
  `command grep -n "mobile+tablet+desktop+webapp+auto" plugins/vwf/assets/vwf-config.md`
  hits once.
- `command grep -n "/vwf:setup" plugins/vwf/skills/architecture/SKILL.md` hits
  in Step 7.
- `command grep -n "^## Step" plugins/vwf/skills/architecture/SKILL.md` still
  lists exactly Steps 1–7.
- `mise run p:plugins:check` green (rule 9: the adapter contract file still
  names the two skills; rule 10: no technology name entered a vwf file — `auto`,
  `mobile` are platforms, allowed; rule 12: no retired spelling).

## Guardrails

- Do not touch `plugins/vwf/skills/setup/**` (U5),
  `plugins/vwf/skills/doctor/**` (U7), `plugins/stackgen/**` (U1, U6),
  `plugins/vwf/agents/**` (U1, U3),
  `plugins/vwf/skills/architecture/references/platforms.md` (U1).
- The `:51,89,108` "format 19" wording in `vwf-config.md` is a parked bug —
  leave it.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand. `vwf-config.md`'s schema block has very long comment lines by design;
  do not reflow them.
- Name no technology in a vwf file (checker rule 10).

## Commit

`feat: the stack-template invocation names its target repo; architecture decides, then invokes setup`
— written by the orchestrator after the wave gate, not by the unit. Bare type.
