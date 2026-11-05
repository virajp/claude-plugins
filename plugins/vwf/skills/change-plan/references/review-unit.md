# A `review` unit in a change plan

Add one only when the change lands runnable code: anything that executes rather
than is read, such as shipped shell or hook scripts, build or tooling source, or
an installable package. Its reason is an entry in the `decisions` list.

`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md` owns its shape: `owns`
`[]`, `depends_on` the units it covers, a `range` of `{"from": "", "to": ""}`,
and a `NN-review.md` file.
`${CLAUDE_PLUGIN_ROOT}/skills/execute/references/review-unit.md` owns the one
rule for what it covers.

- Place it in a wave strictly later than every unit it covers — in the same wave
  it runs before their commit and reviews nothing, since it scopes by commit
  range.
- Cover, directly or transitively through `depends_on`, every unit in an earlier
  wave that no earlier review unit covers: the units that land the code and
  every other `edit` unit alike. It reviews the whole range since the previous
  review, and a finding on a unit it left out would be routed there anyway.
- Name at least one covered unit in `depends_on`, never `[]` — a review that
  covers nothing reviews nothing.

Preflight refuses a review unit in the wave of a unit it covers, one that covers
nothing, and one that leaves out an earlier unit no earlier review covers.
