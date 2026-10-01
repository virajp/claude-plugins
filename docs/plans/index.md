# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                         | Kind   | Plan                                                                                | Target repo | Priority | Status   | Requires                           | Backlog |
| ---------------------------------------------- | ------ | ----------------------------------------------------------------------------------- | ----------- | -------- | -------- | ---------------------------------- | ------- |
| docs/plans/2026-10-01-drop-vscode              | change | Drop the vscode configuration from both plugins                                     | —           | 10       | COMPLETE | —                                  | B40     |
| docs/plans/2026-10-01-tool-config-script-mise  | change | tool-config's mise row moves onto a node script and templates                       | —           | 20       | APPROVED | 2026-10-01-drop-vscode             | —       |
| docs/plans/2026-10-01-tool-config-script-gates | change | tool-config's gate tools move onto the script — dprint, pre-commit, gitleaks, grype | —           | 30       | APPROVED | 2026-10-01-tool-config-script-mise | —       |
