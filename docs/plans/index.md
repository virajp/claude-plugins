# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                            | Kind   | Plan                                                                                         | Target repo | Priority | Status   | Requires                            | Backlog     |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | ----------------------------------- | ----------- |
| docs/plans/2026-10-01-drop-vscode                 | change | Drop the vscode configuration from both plugins                                              | —           | 10       | COMPLETE | —                                   | B40         |
| docs/plans/2026-10-01-tool-config-script-mise     | change | tool-config's mise row moves onto a node script and templates                                | —           | 20       | COMPLETE | 2026-10-01-drop-vscode              | —           |
| docs/plans/2026-10-01-tool-config-script-gates    | change | tool-config's gate tools move onto the script — dprint, pre-commit, gitleaks, grype          | —           | 30       | COMPLETE | 2026-10-01-tool-config-script-mise  | —           |
| docs/plans/2026-10-01-installer-plugins-only      | change | The installer installs plugins only — graphify wiring removed                                | —           | 10       | COMPLETE | —                                   | —           |
| docs/plans/2026-10-05-fnox-dev-only               | change | fnox is the development-only secrets provider                                                | —           | 50       | APPROVED | 2026-10-05-reshape-migration        | —           |
| docs/plans/2026-10-03-setup-ai-validates-vwf      | change | setup:ai checks for vwf, installs it at user scope only when absent, and upgrades everything | —           | 10       | COMPLETE | —                                   | B86         |
| docs/plans/2026-10-05-tool-config-template-engine | change | tool-config's script gains a template engine, a stackgen.yaml reader and a values loader     | —           | 10       | COMPLETE | —                                   | —           |
| docs/plans/2026-10-05-vwf-callers-on-templates    | change | vwf's init, setup and doctor and stackgen's materializer run on the template renderer        | —           | 30       | COMPLETE | 2026-10-05-tool-config-templates    | B80 (piece) |
| docs/plans/2026-10-05-reshape-migration           | change | vwf setup reshape migrates stackgen-v2.0.0 repos onto the template layout                    | —           | 40       | APPROVED | 2026-10-05-vwf-callers-on-templates | B55         |
| docs/plans/2026-10-07-plans-carry-every-answer    | change | Plans carry every answer — the planners ask everything, execute asks nothing                 | —           | 10       | RUNNING  | —                                   | —           |
