# Audit

Examples: `doctor`, `verify`, `stackgen-reputation`. Use a copy of
`assets/findings.schema.json`, so that reports stay comparable.

| Section  | Holds                                             |
| -------- | ------------------------------------------------- |
| Scope    | What is checked, and what is out of scope         |
| Checks   | Table: ID → check → severity → evidence source    |
| Findings | A link to the findings schema                     |
| Report   | A link to the template                            |
| Fix mode | Separate and opt-in. Needed only with write tools |

Keep check IDs stable — a stable ID makes reports comparable between runs. The
full catalog goes in `references/checks.md`.
