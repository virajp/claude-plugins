# Rules

Three owners, and one owner per rule. The script decides exact rules. A fresh
reviewer decides judgment rules. `p:plugins:check` keeps the rules that it owns,
such as strict YAML (rule 4) and plugin-root paths (rule 6).

SK011 is the lint's own reader, and not a copy of rule 4. Rule 4 reads plugins
only, so SK011 is the one guard for a repo-local skill.

## Script: all skills

| ID    | Rule                                                            | Severity    |
| ----- | --------------------------------------------------------------- | ----------- |
| SK001 | Description has a trigger and a "Not for" (doctrine: a trigger) | error       |
| SK002 | Description within the target, and 1,024 chars at most          | warn, error |
| SK003 | Always-loaded words within the budget                           | warn        |
| SK004 | Each relative link in the body resolves                         | error       |
| SK005 | No folder inside `references/`                                  | error       |
| SK007 | `metadata.archetype` is present and valid                       | error       |
| SK008 | No unknown frontmatter key                                      | warn        |
| SK009 | No hardcoded user path in a script                              | error       |
| SK010 | No text that looks like a secret                                | error       |
| SK011 | The frontmatter can be read                                     | error       |
| SK012 | Both invocation keys are present, each `true` or `false`        | error       |
| SK013 | A link reaches each file in `references/` and `workflows/`      | warn        |
| SK014 | The Routing table has a `Loads` column                          | warn        |
| SK015 | Required sections are present, and in order                     | warn        |
| SK016 | Required folders are present                                    | warn        |
| ST101 | Sentence within 20 words in a numbered step, and 25 elsewhere   | warn        |
| ST102 | No filler phrase from the denylist                              | warn        |
| ST103 | At most 3 bold MUST or NEVER                                    | warn        |
| ST105 | Each bullet in a rules section has a " — " reason               | warn        |

## Script: collection (`--all`)

| ID    | Rule                                               | Severity |
| ----- | -------------------------------------------------- | -------- |
| CL201 | Total description chars of always-installed skills | warn     |
| CL203 | `depends-on` targets exist, and form no cycle      | error    |
| CL204 | No dependency on a deprecated skill                | warn     |
| CL205 | No dependency on a user-only skill                 | error    |
| AD604 | Providers of one contract have the same sections   | warn     |

The `descriptionBudget` in `assets/config.json` is a value of this repo, and not
a limit of the host. A name in `hostSkills` satisfies CL203, because the host
ships that skill.

Lint skips each folder in `exclude`, such as a vendored skill, because this
standard does not apply to third-party text. The collection rules still read
that skill as a target.

## Script: archetypes

| ID    | Rule                                              | Severity |
| ----- | ------------------------------------------------- | -------- |
| WF301 | Phases exists; with depth folders, each row links | error    |
| WF303 | Halt and pause is a table with an ID column       | warn     |
| DC403 | At most 3 inline rules                            | warn     |
| RF501 | Each topic of the subtype exists                  | error    |
| RF502 | Each reference cites a source URL                 | warn     |
| AD602 | `metadata.implements` resolves to a contract file | error    |
| AD603 | `name` equals the contract's name                 | error    |
| GN701 | Preview comes before Write                        | error    |
| GN702 | A Record section exists                           | warn     |
| GN703 | A Verify section exists                           | error    |
| AU801 | Check IDs exist and are unique                    | error    |
| AU802 | Findings links a findings schema                  | error    |
| AU803 | Write tools need a Fix mode section               | warn     |
| AN901 | Question names the decision, and Scope exists     | error    |
| AN902 | Each collector writes to `data/`                  | warn     |
| AN903 | No mutating verb in a collector                   | error    |
| AN904 | The report template has the required parts        | error    |
| AN905 | Findings links a findings schema                  | error    |
| AN907 | Each topic of the subtype exists                  | error    |

## Reviewer: judgment list

A fresh reviewer answers this list through
`templates/judgment-reviewer-prompt.md`.

| ID    | Question                                                        |
| ----- | --------------------------------------------------------------- |
| ST104 | Does each prohibition name the correct action?                  |
| ST106 | Does one thing have two names? Is one name used for two things? |
| CL202 | Does the description overlap a sibling's triggers?              |
| CL206 | Does prose delegate to a skill that `depends-on` omits?         |
| WF302 | Does State list each file that the skill writes?                |
| WF304 | Do user questions appear only at declared gates?                |
| DC402 | Does the Doing column state a task, and not a rule?             |
| DC404 | Does a language router cover the topic bar?                     |
| RF503 | Do limits, prices and quotas carry an as-of date?               |
| RF504 | Does the body state the API boundary?                           |
| GN704 | Do generator templates pass this standard?                      |
| AN906 | Do collectors throttle and cache paid or limited APIs?          |
| ALL   | Is an `always` or `sometimes` mark wrong for a typical run?     |

## Deferred

- The `eval` form and SK006 — no skill has evals yet, and the ledger proves a
  rewrite. Add them after the pilot.
- The PostToolUse hook, `p:plugins:check` and CI wiring — turn on enforcement at
  the end of the rollout.
