GAP 2026-11-25 ★2 | skill:architecture, setup, doctor | a project name that
is not a valid bootstrap key has no rename route | parked: raised at the
rulings review of 2026-11-23-bootstrap-value-quoting

**Source** The rulings review of
`docs/plans/2026-11-23-bootstrap-value-quoting/`, round 4, gap 3. That plan
makes doctor, setup and the landing refuse a project name that is not a valid
bootstrap key (letters, digits, `_` and `-` only; D4). Its reports tell the user
to rename the project by hand in `docs/blueprint/registry.yaml` and in each
`projects.<name>` key of `.config/vwf.yaml`, then run `/vwf:setup` and
`/vwf:doctor` (D32).

`/vwf:architecture` has no step that renames a registry project together with
its blueprint docs, its `projects.<name>` keys and its `repo.projects.<name>`
bootstrap key. A later plan can add that step, then point the reports of D6,
D21 and D28 to it.
