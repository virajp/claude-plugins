# Archetypes

An archetype is the shape of a skill, not its topic. It sets the invocation
default, the sections and the budget. `assets/archetypes.json` holds the
numbers.

| Archetype                           | Membership test                                                       | Default         | Budget                         | Description |
| ----------------------------------- | --------------------------------------------------------------------- | --------------- | ------------------------------ | ----------- |
| [workflow](archetype-workflow.md)   | Runs phases with gates, and reads or writes project state             | User            | 1,500                          | 350         |
| [doctrine](archetype-doctrine.md)   | States how files must be written, and applies while editing them      | Model + `paths` | 400, or 700 with no references | 250         |
| [reference](archetype-reference.md) | Holds the judgment for choosing and using one service or provider     | Both            | 400                            | 300         |
| [adapter](archetype-adapter.md)     | Implements a host's contract for one provider, under a fixed name     | Both, forced    | 600                            | 300         |
| [generator](archetype-generator.md) | Writes files into a repo from templates, and records them for re-sync | User            | 1,200                          | 300         |
| [audit](archetype-audit.md)         | Runs read-only checks from a known catalog, and returns findings      | User            | 1,200                          | 300         |
| [analysis](archetype-analysis.md)   | Answers an open question from evidence, with conclusions              | User            | 1,200                          | 300         |
| [runbook](archetype-runbook.md)     | Does an operational procedure on live systems, with a blast radius    | User, forced    | 1,200                          | 300         |

A workflow can start from a user or from another skill. A skill that another
skill calls is model-invocable, whatever its archetype.

Analysis and runbook are draft. No skill in this repo tests them yet, so expect
changes at the first real skill.
