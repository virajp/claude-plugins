# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` and
`/vwf:execute all` read to pick the next runnable plan.

## Plans

| Folder                                            | Kind   | Plan                                                                                         | Target repo | Priority | Status   | Requires                           | Backlog     |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | ---------------------------------- | ----------- |
| docs/plans/2026-10-01-tool-config-script-gates    | change | tool-config's gate tools move onto the script — dprint, pre-commit, gitleaks, grype          | —           | 30       | COMPLETE | 2026-10-01-tool-config-script-mise | —           |
| docs/plans/2026-10-03-setup-ai-validates-vwf      | change | setup:ai checks for vwf, installs it at user scope only when absent, and upgrades everything | —           | 10       | COMPLETE | —                                  | B86         |
| docs/plans/2026-10-05-tool-config-template-engine | change | tool-config's script gains a template engine, a stackgen.yaml reader and a values loader     | —           | 10       | COMPLETE | —                                  | —           |
| docs/plans/2026-10-05-vwf-callers-on-templates    | change | vwf's init, setup and doctor and stackgen's materializer run on the template renderer        | —           | 30       | COMPLETE | 2026-10-05-tool-config-templates   | B80 (piece) |
| docs/plans/2026-10-07-fnox-dev-only-doctrine      | change | stackgen's doctrine makes fnox the development-only secrets provider                         | —           | 10       | APPROVED | —                                  | —           |
