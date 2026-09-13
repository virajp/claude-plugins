# U5 — setup pins: the materialize pass, and `unresolved` on an absent axis

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/onboard-pipeline.md`,
  `plugins/vwf/skills/setup/references/materialize.md` (new)
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md:108-152` (the invocation
  shape and catalog handover — read, never edit; U4 adds the `repo:` line, whose
  spelling is fixed in the ruling below);
  `plugins/vwf/assets/vwf-config.md:140-178` (the three axis states and the
  surfaces table — read, never edit); `plugins/vwf/assets/membership.md:15-22`
  (the `members:` schema);
  `plugins/vwf/skills/setup/references/migrate-pipeline.md` (only if the
  materialize step must be placed relative to the migrate path).

## Ruling

Decision 6: "One landing per (repo, slug), deduped: setup groups the projects
whose axis holds a slug not yet materialized in their target repo, dedupes by
slug per repo, and invokes stackgen once per (repo, slug) in registry order.
stackgen's landing rule ("one landing set, one commit" per slug) is unchanged."

Decision 7: "A new reference
`plugins/vwf/skills/setup/references/materialize.md`, invoked from `SKILL.md` as
its own step after the shape pass (Step 0) and before the doctor gate. An
`unresolved` axis is skipped silently. A declined landing is reported by setup,
the pin stays, and doctor's block stands as today (setup halts and reverts the
stamp)."

Decision 9: "Setup writes `unresolved` only for an **absent** project axis (or
repo axis) on a repo architecture has not run on, and continues. A pinned slug
is never rewritten — a pin the adapter never materialized is exactly what the
materialize pass lands."

Decision 5 (the spelling this unit must use when it names the invocation): "The
invocation's argument stays `<slug>`. The target repo travels as one optional
line beside the catalog paths, in the same payload style: `repo: <path>` — the
member's `path` relative to the base root, resolved as the member whose
`projects:` lists the project; absent means the current repo." The catalog paths
are `${CLAUDE_PLUGIN_ROOT}/assets/principles/index.md` and its entries, per
`stack-adapter.md:120-128`.

Decision 3 (this unit's own prefix line): "`chore(vwf):` becomes `ops:`."

Decision 8, the other half of the handoff: "Architecture's last step … invokes
`/vwf:setup` in-session." Setup must therefore be idempotent on a repo it
stamped minutes ago — the materialize pass proposes nothing when every pinned
axis is materialized, and the stamp step rewrites the same stamps.

Reversal 2: "`onboard-pipeline.md:72-77` ("setup never writes `unresolved` … An
axis setup could not settle is left absent") … reversed for one case: an
**absent** project axis on a repo architecture has not run on."

The user's model, verbatim: "setup is responsible for pinning the stack to
respective repos; setup is NOT responsible to decide the stack, that
responsibility is with architecture; setup will run before architecture as well
as after (this must be programmed), so the decision of stack and pinning are
covered."

## Edits

1. **`plugins/vwf/skills/setup/references/materialize.md`** (new) — the
   materialize pass, written to the shape of the sibling references. Contents:
   - **Inputs.** `.config/vwf.yaml` (`topology`, `linkage`, `members:`, every
     `projects.<name>.stack.template` and `repo.stack.template`), and each
     repo's `.claude/stackgen/lock.yaml` (the adapter's lockfile — the
     materialized set; read its slugs, never its bytes beyond that).
   - **Resolve the target repo** per project: the member whose `projects:` lists
     it, its `path` relative to the base root; a project no member lists is the
     base's; under `topology: repo`/`monorepo` everything is the base. A member
     whose checkout is absent (an empty submodule directory) is reported with
     its `git submodule update --init <path>` line and skipped.
   - **Build the landing list**: for every axis that holds a slug — the project
     axis and the repo axis — whose target repo's lockfile does not name that
     slug, one entry (repo, slug); dedupe by slug within a repo; order by
     registry order of the first project that needs it. `unresolved` is skipped
     silently. `[]` on a list axis is a decision, not a landing.
   - **Invoke** the stack adapter once per entry:
     `/<plugin>:<plugin>-stack-template <slug>` with the catalog paths and, when
     the target is not the current repo, the `repo: <path>` line, exactly as
     `stack-adapter.md`'s delegation protocol spells them. Each landing is the
     adapter's own consent line; setup adds no consent of its own.
   - **A declined landing**: record it in the report as "declined — pin stays;
     `/vwf:setup` offers it again", touch the pin not at all, and let the doctor
     gate that follows report it as blocking ("pinned, not materialized"), so
     the stamp step behaves as today.
   - **Write `unresolved`** for every project axis and repo axis that is
     **absent** — `template`, `backing_template`, `deploy_template`,
     `repo.stack.template` — as the bare scalar, and `languages: []` where
     `template` is now `unresolved` (the one legal empty). Never rewrite a slug.
     Never write into a member's config — the axes live in the base's
     `.config/vwf.yaml`.
   - **Report**: one line per landing (repo, slug, landed / declined / already
     materialized), one line per axis written `unresolved`, and the sentence
     "architecture decides; setup pins" so a reader knows where a slug came
     from.
2. **`plugins/vwf/skills/setup/SKILL.md`** —
   - Add the materialize pass as its own step between Step 0 (the shape offer,
     anchor "the six baseline predicates") and the doctor gate (anchor "**Halt
     on a `blocking` finding, and revert the stamp**"), pointing at
     `references/materialize.md`; number it as the file's numbering allows
     without renumbering later steps (a `0b`/`1a`-style label if the file
     already uses one, else a new heading before the doctor step whose name the
     run log can cite).
   - The doctor-gate paragraph (`:188-193`): keep the halt-and-revert rule; add
     that a declined landing is the expected way to reach the "pinned, not
     materialized" blocking finding, and that `unresolved` never blocks.
   - The chain-forward step (`:215-221`, "**Chain forward.** Print the ordered
     chain and stop" / "**setup runs none of them**"): keep it; add one sentence
     that `/vwf:architecture` will invoke setup again at its end so the pins it
     decides are materialized — the user need not remember.
   - `:204` "`/vwf:git-workflow` with a `chore(vwf):` or `docs:` message" →
     "with an `ops:` or `docs:` message".
   - The mode table / pipeline summary near the top (anchor "Chain forward" at
     `:20` if present): name the materialize pass where the pipeline is
     summarised.
3. **`plugins/vwf/skills/setup/references/onboard-pipeline.md`** —
   - `:72-77` "setup never writes `unresolved` … An axis setup could not settle
     is left absent" → setup **writes `unresolved`** on an axis it finds absent
     (decision 9); a slug is never rewritten; architecture is what replaces
     `unresolved` with a slug.
   - `:104-118` "**Manifest → candidate templates.**" and `:125-128` "leave that
     project's axis **unrecorded**, name what would supply it, and let
     `/vwf:architecture` settle it" → record `unresolved`, name what would
     supply it, let architecture settle it; then the materialize pass
     (`references/materialize.md`) lands whatever is already a slug.

## Verification

- `command grep -n "materialize.md" plugins/vwf/skills/setup/SKILL.md` hits.
- `command grep -n "never writes \`unresolved\`\|left absent\|unrecorded"
  plugins/vwf/skills/setup/references/onboard-pipeline.md` is empty.
- `command grep -n "chore(vwf)" plugins/vwf/skills/setup/SKILL.md` is empty.
- `command grep -n "repo: <path>\|repo:" plugins/vwf/skills/setup/references/materialize.md`
  hits;
  `command grep -n "principles/index.md" plugins/vwf/skills/setup/references/materialize.md`
  hits.
- `mise run p:plugins:check` green (rule 4 frontmatter; rule 6 root-relative
  refs — the new reference is cited by a path relative to the skill; rule 10 no
  technology name; rule 12 no retired spelling).
- The orchestrator's materialize fixture (index.md, "Gates the orchestrator
  keeps") passes steps 3–5 after this wave — that is this unit's real proof.

## Guardrails

- Do not touch `plugins/vwf/skills/setup/references/topology-detection.md` (U1
  owns its one line), `plugins/vwf/skills/architecture/**`,
  `plugins/vwf/assets/**` (U4), `plugins/vwf/skills/doctor/**` (U7),
  `plugins/vwf/skills/init/**` (not in this plan), `plugins/stackgen/**` (U1,
  U6).
- The materialize pass **never** touches a member's `.config/vwf.yaml` — there
  is none; the axes are the base's.
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- Strict-YAML frontmatter on `SKILL.md`; the new reference has none.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.
- Name no technology (checker rule 10) — the fixture's Flutter is the
  orchestrator's business, not this prose's.

## Commit

`feat: setup pins — a materialize pass per (repo, slug), and unresolved on an absent axis`
— written by the orchestrator after the wave gate, not by the unit. Bare type.
