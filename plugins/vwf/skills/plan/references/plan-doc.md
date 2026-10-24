# Writing the Plan Folder (§7)

Read this at §7, once the shape is approved and every open decision is settled
— it is the shape of the artifact, not a gate. §6's approval gate and §8's
hand-off stay in `SKILL.md`.

Write `docs/plans/<date>-<HHMM>-<slice>/` from
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — `index.json`,
`index.md` and one `NN-<unit>.md` per unit. `index.json` holds every
structured fact `/vwf:execute` reads and rewrites — `status` through
`plan-management`, the rest itself, each with
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs`. `index.md`
holds the prose only: the goal, the Slice, the facts the survey established,
Out of scope and Parked. Every key of the template is required, the
cycle-only ones included; an empty list is written `[]`.

Write `index.json` **once**, whole, with the Write tool, then run
`node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`
— the Write and its validate are one step, the creation. A red validate
means the creation is not finished: correct the content and Write the whole
file again, then validate again, until it prints
`<folder>/index.json: valid`; no Edit touches `index.json`. From that first
green validate on, every change is one `plan.mjs set` or `plan.mjs append`
call; never an Edit, never a whole-file rewrite.

**The three gates.** `gates.unit` runs once before each unit's commit,
`gates.wave` once before wave 1 and after every wave, `gates.plan` once over
the finished tree — each a list of command lines. When the repo's
`mise tasks ls` lists them, propose `mise x -- mise run code:format` for the
unit gate, `mise x -- mise run code:lint` for the wave gate and
`mise x -- mise run code:precommit` for the plan gate, beside the harness
lines the slice needs; the user confirms them at §6. A check that runs the
whole hook pass or a slow test suite belongs in the plan gate.
`gates.keeps` lists the gates the orchestrator keeps, each
`{id, check, pass}`.

**The keys.** `format` `1`; `type` `vwf-plan`; `title`; **`covers`** (the
blueprint doc(s) this element implements — one path, or the cycle element's
set; the list the `implementation:` stamp is written to); **`requires`** (the
folder paths of this element's direct prerequisites in the chain, matched on
the basename — `[]` for the first); **`source`** (the `Bnn` prefixes of the
backlog items this element was made for — the ids `$ARGUMENTS` named and the
items §2's recall matched to the slice; each also sits on `backlog` or
`backlog_pieces`, and the list is empty only when no item asked for the
slice); **`backlog`** (the `Bnn` prefixes of the backlog project's items this
element **finishes**, matched by §2's recall — landing sets them `Done`;
empty when the slice came from nowhere in the backlog);
**`backlog_pieces`** (the `Bnn` prefixes of the items this element lands
**one piece of** — landing sets them `Partially done`; each needs at least one
`- Bnn: <piece>` line under *Parked* in `index.md`, naming the chained folder
where one already covers the piece; no id sits on both lists, and the last
plan of a chain moves the id to `backlog`); **`gaps_of`** (the landed plan
folders whose gaps this element takes — interview item 2b;
`plan-management add` sets each one's `gaps` in the plan index to `open` `0`,
with this folder on its `moved_to`); and `exposure` `dark` when the slice
ships behind a flag, else no `exposure` key. **`status`** is
`{state, detail}`: `state` `DRAFT` and `detail` `DRAFT <date>` until §8's
`plan-management add` sets `APPROVED`; from then on that skill rewrites it on
the executor's behalf, and `requires` is never re-pointed by anyone.

**`consent`** carries `merge` (the landing answer), `end_all_run`, and
`lsp` — one key per language §2 asked about, `installed` or
`proceed without`, `{}` when none was asked. **`after_landing`** lists each
confirmed step as `{id, step, mode, notes}`, `mode` always `run`.
**`release_levels`** has one `{id, level, reason}` per project the units
touch, the project name as `id`, `NONE` included. **`dependencies`** lists
each new third-party package as
`{id, package, purpose, preferred_over, unit}`. **`decisions`** lists each
assumed decision as `{id, decision, ruling, rejected, units}`.
**`shared_files`** lists each file two units would write, as
`{id, file, why, owner}`.

**Slice.** In `index.md`: links the covered doc(s) and states the chain
position ("Plan 2 of 3 — requires `<folder>`; required by `<folder>`"; or "no
dependency chain"). Under `exposure` `dark`, the flag's name, owner and
removal date, and the unit that removes it.

**One unit per step.** Each ordered step of the delta is one `NN-<unit>.md`
and one entry of the `units` list — `kind` `code`, `model` `opus` unless the
interview recorded another tier, `wave` from dependency order, `owns` the
files the step touches (disjoint per wave), `depends_on` the units it stands
on, `waits` the named reason it waits when its wave is above 1, `title` the
text of the unit file's H1, `status` `pending`, `commit` `""` and `rounds`
`0`. The unit file has no header lines; it opens with its H1,
`# U<n> — <title>`, and carries a **Test first** line naming the failing test
that defines "done". The unit's Ruling quotes the `decisions` entries that
bind it, verbatim; its Verification names the gate lines it must pass; its
Commit line's type is one the repo's convention file allows. A harness
bootstrap unit orders before the units whose verification depends on it;
expand / backfill / contract units order as `delta-checks.md` spells them.
Waves are ordering only — `execute` runs the units serially. The docs unit
and the gates unit close the list, as the template says. A `review` unit has
`owns` `[]`, a non-empty `depends_on` and a `range` of
`{"from": "", "to": ""}`; no other unit has a `range`.

**Acceptance criteria.** Copy the Acceptance blocks of the flow docs this
element touches **verbatim** into the `acceptance` list — one
`{id, text, flow}` per criterion, `flow` the path of its flow doc — and make
sure the units include the **E2E tests** that cover each criterion — the
coder implements them like any TDD unit; `execute`'s acceptance stage
independently maps and runs them. A criterion no unit covers is a hole in the
plan, not something to defer. When the element maps to no flow, write
`acceptance` as `[]`.

**Run state** is written empty: `gaps` and `overrides` are `[]`, each of the
four `stages` — `renders`, `acceptance`, `ux`, `reconcile` — is
`{"state": "pending", "detail": ""}`, and `run` is `{}`. `execute` fills
them.
