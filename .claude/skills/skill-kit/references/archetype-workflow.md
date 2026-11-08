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

A small workflow can keep its steps in `SKILL.md`, in a Steps section. With no
`references/` or `workflows/` folder, a Phases row has no File column. A move to
a file that each run loads saves no words.

Ask the user only at a gate that Phases declares — a run asks nowhere else, and
may have no one to answer.
