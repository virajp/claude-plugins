# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` and
`/vwf:execute all` read to pick the next runnable plan.

## Plans

| Folder                                                 | Kind   | Plan                                         | Target repo | Priority | Status   | Requires                                                                  | Backlog     |
| ------------------------------------------------------ | ------ | -------------------------------------------- | ----------- | -------- | -------- | ------------------------------------------------------------------------- | ----------- |
| docs/plans/2026-10-08-mockups-served-at-a-url          | change | Mockups served at a URL                      | —           | 10       | COMPLETE | —                                                                         | B91 (piece) |
| docs/plans/2026-10-08-execute-renders-served-at-a-url  | change | Execute renders served at a URL              | —           | 20       | COMPLETE | 2026-10-08-mockups-served-at-a-url                                        | B91 (piece) |
| docs/plans/2026-10-08-release-levels-recorded          | change | Release levels recorded                      | —           | 40       | COMPLETE | 2026-10-08-typescript-ux-gate-renders                                     | B96 (piece) |
| docs/plans/2026-10-08-release-tasks-bump               | change | Release tasks bump                           | —           | 50       | COMPLETE | 2026-10-08-release-levels-recorded                                        | B96         |
| docs/plans/2026-10-09-kotlin-language-stack            | change | Kotlin language stack                        | —           | 50       | COMPLETE | 2026-10-08-typescript-ux-gate-renders, 2026-10-08-release-levels-recorded | B57 (piece) |
| docs/plans/2026-10-09-android-compose-stack            | change | Android Compose stack                        | —           | 60       | COMPLETE | 2026-10-09-kotlin-language-stack                                          | B57 (piece) |
| docs/plans/2026-10-09-android-form-factors             | change | Android form factors                         | —           | 70       | COMPLETE | 2026-10-09-android-compose-stack                                          | B57         |
| docs/plans/archived/2026-10-09-android-device-features | change | Android device features                      | —           | 80       | COMPLETE | 2026-10-09-os-feature-declarations, 2026-10-09-android-form-factors       | B58 (piece) |
| docs/plans/2026-10-09-web-canvas-layout                | change | Web canvas layout                            | —           | 10       | COMPLETE | —                                                                         | B59         |
| docs/plans/2026-10-09-reputation-spm-mise-maven        | change | Reputation for SwiftPM, mise and Maven names | —           | 90       | RUNNING  | 2026-10-09-android-device-features                                        | B60         |
