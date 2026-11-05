# Analysis (draft)

Answers an open question by testing hypotheses against evidence. An audit starts
from a known catalog of checks. When an analysis keeps finding the same things,
promote those checks to an audit.

| Section  | Holds                                                             |
| -------- | ----------------------------------------------------------------- |
| Question | The question, the decision it serves, and who reads the answer    |
| Scope    | Accounts, regions, repos, commit SHA, time window, and exclusions |
| Access   | A read-only role or token, and how to verify that it is read-only |
| Collect  | Scripts that write to `data/` with a provenance manifest          |
| Analyze  | Table: hypothesis → evidence that confirms or refutes → script    |
| Findings | The findings schema, plus confidence and impact                   |
| Report   | A link to the template, with the answer first                     |

| Subtype        | Topic files                                                      |
| -------------- | ---------------------------------------------------------------- |
| infrastructure | `scope-and-access`, `sources`, `metrics`, `cost-model`, `method` |
| codebase       | `scope`, `map`, `signals`, `method`                              |
| incident       | `timeline`, `signals`, `contributing-factors`, `actions`         |

## Rules

- Compute numbers in scripts, and not in prose — mental arithmetic over large
  data drifts.
- Write raw data to files, and not through context — large results truncate
  silently.
- Cite evidence on each finding: a resource ID, a `file:line`, or a query and
  result — the reader can examine it.
- Mark each finding observed or inferred — readers act differently on each.
- Pin the snapshot: collection time and commit SHA — re-runs become comparable.
- Throttle and cache paid or rate-limited APIs — queries cost money and hit
  limits.
- Redact account IDs, IPs and internal hostnames before a report leaves the team
  — they expose internal structure.
- Keep `data/` out of git unless the snapshot is meant to stay — the data can be
  large or sensitive.
