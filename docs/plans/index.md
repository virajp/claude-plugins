# Plans

The product's plans as a set — the one file every vwf command reads to find a
plan without walking the member repos, and the queue `/vwf:execute next` reads
to pick the next runnable plan.

## Plans

| Folder                                                | Kind   | Plan                                                                                                | Target repo | Priority | Status   | Requires                                                          | Backlog |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- | ----------- | -------- | -------- | ----------------------------------------------------------------- | ------- |
| docs/plans/2026-09-23-swift-stack-mechanism           | change | Swift stack mechanism — the binaries fact, doctor, init detection, exclusion lists                  | —           | 20       | COMPLETE | 2026-09-23-watch-tv-spatial-platforms                             | —       |
| docs/plans/2026-09-23-swift-package-stack             | change | Swift package stack — language/swift, SwiftPM, swift-format and SwiftLint, the swift-package bundle | —           | 30       | COMPLETE | 2026-09-23-swift-stack-mechanism                                  | —       |
| docs/plans/archived/2026-09-23-swift-tasks-git-compat | change | Swift tasks git compatibility — no silent pass when git ls-files fails                              | —           | 40       | COMPLETE | 2026-09-23-swift-package-stack                                    | —       |
| docs/plans/2026-09-23-swiftui-app-stack               | change | SwiftUI app stack — the swiftui pack, Tuist, goldens, topics 1–11, the swift-swiftui bundle         | —           | 40       | RUNNING  | 2026-09-23-swift-package-stack, 2026-09-23-swift-tasks-git-compat | —       |
| docs/plans/2026-09-23-swiftui-platform-doctrine       | change | SwiftUI platform doctrine — per-platform references and Apple core integrations                     | —           | 50       | APPROVED | 2026-09-23-swiftui-app-stack                                      | B56     |
