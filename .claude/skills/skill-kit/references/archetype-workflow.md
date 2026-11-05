# Workflow

Examples: `plan`, `execute`, `init`, `backlog`. Add `workflows/` at two or more
invoke forms.

| Section        | Holds                                                    |
| -------------- | -------------------------------------------------------- |
| Title line     | The purpose, in 1–2 lines                                |
| Invoke         | Table: form → workflow file. Needed at two or more forms |
| State          | The files read and written, and the owner of each        |
| Phases         | Table: phase → gate (auto or user) → file                |
| Halt and pause | Table: ID → condition → action                           |
| Output         | A link to the report template, or a short list           |
| Never          | At most 5 bullets, each with a reason                    |

Ask the user only at a gate that Phases declares — an unattended run has no one
to answer.
