# Doctrine

Examples: `typescript`, `astro`, `eslint`, `blueprint-authoring`. Use
`user-invocable: false` with `paths`.

A doctrine with a `references/` folder is a router. A doctrine with no such
folder is a single file.

| Router section        | Holds                                         |
| --------------------- | --------------------------------------------- |
| Title line            | The purpose, in 1–2 lines                     |
| Routing               | Table: Doing, Read, Loads. Baseline row first |
| Rules that don't wait | At most 3, each with a reason                 |
| Neighbours            | "For X, see skill Y" links                    |

| Single-file section | Holds                                     |
| ------------------- | ----------------------------------------- |
| Owns                | What this gate owns, and what it does not |
| Run                 | The tasks to run                          |
| Config rules        | `rule — reason` bullets                   |
| Overrides           | How to scope a disable                    |
| Failures            | Table: symptom → remedy                   |

A language router covers the topic bar in `plugins/stackgen/assets/kinds.md`.
Link to that bar, and do not restate it.
