# Before and after stats of the change-plan rewrite

The before values are the table in `index.md`, measured at `8d81706d`. The after
values come from the commands of `06-stats.md`, run on 2026-11-05. Each percent
is the change over the before value, to two decimals.

| Measure                | Before | After | Change             |
| ---------------------- | ------ | ----- | ------------------ |
| `SKILL.md` body words  | 4,912  | 886   | -4,026 (-81.96%)   |
| Always-loaded words    | 4,912  | 4,483 | -429 (-8.73%)      |
| Total words            | 5,082  | 4,783 | -299 (-5.88%)      |
| `SKILL.md` bytes       | 31,097 | 7,640 | -23,457 (-75.43%)  |
| Description chars      | 924    | 291   | -633 (-68.51%)     |
| Files in the skill     | 1      | 10    | +9 (+900.00%)      |
| Lint errors            | 2      | 0     | -2 (-100.00%)      |
| Long sentences (ST101) | 76     | 25    | -51 (-67.11%)      |
| Ledger entries         | 123    | 123   | 0 (0.00%)          |

## Always-loaded words against the budget

The always-loaded words are 4,483, and the budget is 1,500. That is 2,983 words
over the budget, or 298.87% of it, so lint warns with SK003. The number is below
the before value of 4,912, so D13 does not stop the run. D8 records the warning.

## Ledger

| Status    | Entries |
| --------- | ------- |
| `kept`    | 120     |
| `no-rule` | 3       |
| `dropped` | 0       |
| `missing` | 0       |
| `pending` | 0       |

The check reports 0 open, and it exits 0.

Restored rules: 0. The sum over the three sections of `round.md` is 0 + 0 + 0.

### `no-rule` entries

Each line number is the one that `check` prints, from the ledger: a line of the
`SKILL.md` before the rewrite, which now has 122 lines.

- `SKILL-19`, `SKILL.md:23`: The skill's title heading; it holds no rule.
- `SKILL-23`, `SKILL.md:41`: A section heading with no rule; the phases table
  replaces it.
- `SKILL-115`, `SKILL.md:509`: A section heading with no rule; each list item
  under it is its own entry.

### `dropped` entries

None.

## Lint warnings that remain

Lint reports 0 errors and 26 warnings: 1 SK003 and 25 ST101. D12 lets these
stand. All paths are under `plugins/vwf/skills/change-plan/`.

| Rule  | Location                         | Message                               |
| ----- | -------------------------------- | ------------------------------------- |
| SK003 | `SKILL.md:1`                     | 4483 always-loaded words, budget 1500 |
| ST101 | `SKILL.md:36`                    | sentence has 26 words, limit 25       |
| ST101 | `SKILL.md:113`                   | sentence has 34 words, limit 25       |
| ST101 | `SKILL.md:119`                   | sentence has 31 words, limit 25       |
| ST101 | `references/gates-consent.md:10` | sentence has 28 words, limit 25       |
| ST101 | `references/gates-consent.md:27` | sentence has 28 words, limit 25       |
| ST101 | `references/gates-consent.md:33` | sentence has 26 words, limit 25       |
| ST101 | `references/recall-survey.md:19` | sentence has 32 words, limit 25       |
| ST101 | `references/recall-survey.md:25` | sentence has 31 words, limit 25       |
| ST101 | `references/recall-survey.md:58` | sentence has 30 words, limit 25       |
| ST101 | `references/recall-survey.md:71` | sentence has 38 words, limit 25       |
| ST101 | `references/review-unit.md:3`    | sentence has 31 words, limit 25       |
| ST101 | `references/review-unit.md:13`   | sentence has 31 words, limit 25       |
| ST101 | `references/review-unit.md:16`   | sentence has 30 words, limit 25       |
| ST101 | `references/review-unit.md:23`   | sentence has 29 words, limit 25       |
| ST101 | `references/scope-check.md:3`    | sentence has 29 words, limit 25       |
| ST101 | `references/scope-check.md:22`   | sentence has 31 words, limit 25       |
| ST101 | `references/self-review.md:7`    | sentence has 47 words, limit 25       |
| ST101 | `references/self-review.md:18`   | sentence has 29 words, limit 25       |
| ST101 | `references/self-review.md:22`   | sentence has 26 words, limit 25       |
| ST101 | `references/self-review.md:25`   | sentence has 28 words, limit 25       |
| ST101 | `references/shape-gate.md:13`    | sentence has 21 words, limit 20       |
| ST101 | `references/shape-gate.md:20`    | sentence has 33 words, limit 25       |
| ST101 | `references/write-folder.md:3`   | sentence has 26 words, limit 25       |
| ST101 | `references/write-folder.md:59`  | sentence has 29 words, limit 25       |
| ST101 | `references/write-folder.md:75`  | sentence has 32 words, limit 25       |

## `skill-kit` defects

None. The `gaps` list of `index.json` holds nine entries, G1 to G9, and none
reports a defect in `.claude/skills/skill-kit/`. G1 and G2 record lint warnings
that the tool reported correctly. G3, G4 and G5 concern `change-plan` and its
assets. G6 concerns the wording of `SKILL.md:120`. G7 and G8 concern how U5 kept
fresh. G9 concerns how this file shows the old line numbers that `check` prints,
which `06-stats.md` leaves open.
