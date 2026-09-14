# U2 — wire the check into the generator, the gate, the reviewer and the doctrine

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/skills/stackgen-stack-template/references/generator.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/stackgen/skills/stackgen-sync/SKILL.md`,
  `plugins/stackgen/assets/artifact-doctrine.md`,
  `plugins/stackgen/agents/stackgen-skill-reviewer.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:53-59`
  (the menu's trust note — read to keep the two consistent, do not edit);
  `plugins/vwf/assets/stack-adapter.md:110-128` (vwf's delegation table — read
  to confirm nothing there needs to change; it names menu and template only).

## Ruling

Quoted from `index.md`:

> **1 — Placement.** One skill, `stackgen-reputation`, invocable by the user and
> by the model. The generator calls it at assemble (step 4) over every concrete
> name the component will emit — packages, runner-invoked tools, actions, images
> — and the verdict table is shown beside the reviewer's verdict at the dry-run
> consent gate. Shipped packs stay hand-curated.

> **3 — Block policy.** A `block` halts that component's generation with the
> verdict table; the user picks a replacement, which is checked in turn. The
> generator never swaps a name silently — a swap is a new recommendation.

> **6 — Reviewer.** A tenth, stateless check: every concrete name the generated
> component emits has a row in the verdict table the orchestrator hands the
> reviewer, and no row reads `block`. The reviewer's tools stay
> `Read, Grep, Glob`.

> **7 — Name syntax.** One argument per name, `<ecosystem>:<name>` — `npm:`,
> `pypi:`, `pub:`, `action:` (owner/repo), `image:` (registry/repo). A bare name
> defaults to the ecosystem of the component's language; the generator always
> writes the prefix.

> **8 — Read path.** The check runs only where a name is first emitted —
> generator step 4 and, through it, sync's regeneration. Template step 1
> (read-back for `/vwf:plan` and `/vwf:execute`) stays network-free.

## Edits

1. **`references/generator.md`** — in step 4 (assemble, `:81-97` today), after
   the component's declared names are final and before the reviewer gate: a
   sub-step that lists every concrete third-party name the component emits —
   `mise_tool` entries, runner-invoked tools in harness tasks (`dlx`, `npx`,
   `uv run --with`, `uvx`), `mcp_servers` commands, action references, image
   references — each written with its ecosystem prefix per ruling 7, and invokes
   `stackgen-reputation` with the list. Then the block rule, ruling 3 verbatim
   in meaning: a `block` row halts this component here; the table is reported;
   the user names the replacement; the replacement is checked before the step
   resumes. `warn` rows travel to the gate. An `UNRESOLVED:` row halts the same
   way a Context7 outage does (`:12-27`). Add the verdict table to what step 5
   hands the reviewer (`:98-108`), beside the catalog. Add one line to the
   preconditions (`:12-27`): the sources `stackgen-reputation` names must be
   reachable, or generation halts — same sentence shape as the Context7 line.
2. **`references/materializer.md`** — at the dry-run consent gate (`:181-190`),
   beside "the reviewer's clean verdict": the reputation table, every row, with
   `warn` rows called out in one line each. State that a gate never shows a
   `block` row — a block halted upstream — so a `block` at the gate is a defect
   to report, not a choice to offer.
3. **`stackgen-stack-template/SKILL.md`** — in Resolution step 3 (`:55-65`),
   where the generate branch is described, one sentence: generation vets every
   concrete name it emits through `stackgen-reputation` and halts on a block. Do
   **not** touch step 1 (`:32-40`) or the "reads are cheap and pure" rule
   (`:106-109`) except to add, to that rule, the clause that the reputation
   check belongs to generation and never to a read.
4. **`stackgen-sync/SKILL.md`** — where re-sync offers regeneration, one
   sentence: a regenerated component goes through the generator and so through
   the reputation check; a name that passed at first generation is re-checked at
   regeneration.
5. **`assets/artifact-doctrine.md`** — a short numbered section beside §5
   (`:154`, "stackgen holds no registry"): **a name stackgen emits is vetted
   before it is landed** — what "concrete name" means, that the check is a skill
   anyone can call, the three verdicts by name, the block rule, and that shipped
   packs are hand-curated and outside the check. Cite the skill by name, not by
   path.
6. **`agents/stackgen-skill-reviewer.md`** — a tenth check after the ninth
   (`:29-98` today): **every name has a verdict** — the orchestrator hands the
   reviewer the verdict table; the reviewer greps the generated component for
   every concrete third-party name (the same list shape as edit 1) and fails the
   review for a name with no row, or any row reading `block`. State that the
   reviewer does no lookup of its own. Leave `tools:` untouched. If the file's
   inputs section enumerates what the orchestrator passes, add the table there.

## Verification

- `mise run p:plugins:check` green — rules 4 (agent frontmatter), 12, 13.
- `command grep -ln 'stackgen-reputation' plugins/stackgen/skills/stackgen-stack-template/references/generator.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md plugins/stackgen/skills/stackgen-stack-template/SKILL.md plugins/stackgen/skills/stackgen-sync/SKILL.md plugins/stackgen/assets/artifact-doctrine.md plugins/stackgen/agents/stackgen-skill-reviewer.md`
  lists all six.
- `command grep -n '^tools:' plugins/stackgen/agents/stackgen-skill-reviewer.md`
  is unchanged: `Read, Grep, Glob`.
- `command sed -n '32,40p' plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  (step 1) contains no `reputation` and no `WebFetch`.
- `command grep -c 'block' plugins/stackgen/skills/stackgen-stack-template/references/generator.md`
  is greater than zero.

## Guardrails

- Do not touch `plugins/stackgen/skills/stackgen-reputation/**` — U1's, running
  concurrently. Name the skill and its argument syntax from the ruling above,
  not from U1's file.
- Do not touch `plugins/stackgen/skills/stackgen-stack-menu/**` — the menu names
  no package.
- Do not touch `plugins/vwf/**` — vwf's delegation table names menu and template
  only, and the generator calls the new skill itself.
- Do not add a network tool to the reviewer.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match each file's fold width by
  hand. Strict-YAML frontmatter on `SKILL.md` and the agent file.
- Never end a table cell in a bare asterisk.

## Commit

`feat: stackgen — the generator vets every name it emits` — written by the
orchestrator after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
