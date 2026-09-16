# Writing the Plan Folder (§7)

Read this at §7, once the shape is approved and every open decision is settled
— it is the shape of the artifact, not a gate. §6's approval gate and §8's
hand-off stay in `SKILL.md`.

Write `docs/plans/<date>-<HHMM>-<slice>/` from
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` — `index.md` plus one
`NN-<unit>.md` per unit. The template's sections are all required, the
cycle-only ones included; the frontmatter, the Status block, the Consent block,
the Units table, the Wave gate, the After landing table and the Run log have a
fixed shape because `/vwf:execute` parses and rewrites them.

**Frontmatter.** `type: vwf-plan`, `title`, **`covers:`** (the blueprint doc(s)
this element implements — one path, or the cycle element's set; the list the
`implementation:` stamp is written to), **`requires:`** (the folder paths of
this element's direct prerequisites in the chain, matched on the basename —
empty for the first), **`backlog:`** (the `docs/backlog.md` item ids this
element covers, matched by §2's recall — empty when the slice came from nowhere
in the backlog), and `exposure: dark` when the slice ships behind a flag. There
is no `status:` key: the **Status** block is the one status, `DRAFT` until §8
sets `APPROVED`.

**Slice.** Links the covered doc(s) and states the chain position ("Plan 2 of 3
— requires `<folder>`; required by `<folder>`"; or "no dependency chain").
Under `exposure: dark`, the flag's name, owner and removal date, and the unit
that removes it.

**One unit per step.** Each ordered step of the delta is one `NN-<unit>.md`
and one row of the Units table — `Kind: code`, Model `opus` unless the
interview recorded another tier, Wave from dependency order, Owns the files the
step touches (disjoint per wave), Depends-on the units it stands on, and a
**Test first** line naming the failing test that defines "done". The unit's
Ruling quotes the assumed-decisions rows that bind it, verbatim; its
Verification names the gate lines it must pass; its Commit line's type is one
the repo's convention file allows. A harness bootstrap unit orders before the
units whose verification depends on it; expand / backfill / contract units
order as `delta-checks.md` spells them. Waves are ordering only — `execute`
runs the units serially. The docs unit and the gates-and-bump unit close the
table, as the template says.

**Acceptance criteria.** Copy the Acceptance blocks of the flow docs this
element touches **verbatim** into `index.md`'s "Acceptance criteria (from
blueprint)" section (with a link to each flow), and make sure the units include
the **E2E tests** that cover each criterion — the coder implements them like
any TDD unit; `execute`'s acceptance stage independently maps and runs them. A
criterion no unit covers is a hole in the plan, not something to defer. When
the element maps to no flow, write `none — no flow touched`.

**Gaps surfaced during execution** is written empty — `execute` appends to it.
The **Run log** table is written empty too.
