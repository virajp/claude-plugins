# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` and
`/vwf:execute all` read to pick the next runnable plan.

## Plans

| Folder                                            | Kind   | Plan                                  | Target repo | Priority | Status   | Gaps                                       | Requires                                                                  | Backlog      |
| ------------------------------------------------- | ------ | ------------------------------------- | ----------- | -------- | -------- | ------------------------------------------ | ------------------------------------------------------------------------- | ------------ |
| docs/plans/2026-10-09-kotlin-language-stack       | change | Kotlin language stack                 | —           | 50       | COMPLETE | 0 — moved to 2026-10-19-stackgen-gap-fixes | 2026-10-08-typescript-ux-gate-renders, 2026-10-08-release-levels-recorded | B57 (piece)  |
| docs/plans/2026-10-09-android-compose-stack       | change | Android Compose stack                 | —           | 60       | COMPLETE | 0 — moved to 2026-10-19-stackgen-gap-fixes | 2026-10-09-kotlin-language-stack                                          | B57 (piece)  |
| docs/plans/2026-10-10-os-device-frames            | change | OS device frames on the design canvas | —           | 20       | COMPLETE | 0 — moved to 2026-10-19-stackgen-gap-fixes | 2026-10-10-swiftui-third-party-integrations                               | B58          |
| docs/plans/2026-10-18-packs-hand-off-to-bootstrap | change | Packs hand off to bootstrap           | —           | 10       | RUNNING  | -                                          | —                                                                         | B102 (piece) |
| docs/plans/2026-10-18-vwf-hands-off-to-bootstrap  | change | vwf hands off to bootstrap            | —           | 20       | APPROVED | -                                          | 2026-10-18-packs-hand-off-to-bootstrap                                    | B102 (piece) |
| docs/plans/2026-10-18-retire-tool-config          | change | Retire tool-config                    | —           | 30       | APPROVED | -                                          | 2026-10-18-vwf-hands-off-to-bootstrap                                     | B102         |
| docs/plans/2026-10-19-stackgen-gap-fixes          | change | Stackgen gap fixes                    | —           | 20       | APPROVED | -                                          | 2026-10-18-packs-hand-off-to-bootstrap                                    | —            |
| docs/plans/2026-10-21-execute-monitor-in-vwf      | change | Execute monitor inside vwf            | —           | 10       | RUNNING  | -                                          | —                                                                         | B101 (piece) |
