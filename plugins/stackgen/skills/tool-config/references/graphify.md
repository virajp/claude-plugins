# graphify — what the knowledge graph ingests, and what git keeps of it

graphify builds the code-intelligence graph from the tree. Two files decide
its edges: `.graphifyignore` says what the graph does not ingest, and
`.gitignore` says that git keeps none of its output. They are different files
for different readers, and both sit at the root, where each reader looks.

This reference is graphify's part of the universal files tool-config lands.
What every file shares — the values, the render, the rows, the six marked
files and drift — is [the skill's](../SKILL.md).

## 1. What lands

| File              | As                                                         |
| ----------------- | ---------------------------------------------------------- |
| `.graphifyignore` | an asset, marked — `graphify-out/` between the pair        |
| `.gitignore`      | `graphify-out/` in its AI tooling section ([git's](git.md)) |

**The ignore file's one shipped entry is the graph's own output**,
`graphify-out/`: ingesting it would feed the last run's summary back in as
source. It sits between `# >>> tool-config` and `# <<< tool-config`; a repo
adds its own paths below the closing marker, and those survive every render
([the marked files](../SKILL.md#the-marked-files)).

**git keeps none of the output.** The graph is rebuilt on every commit, per
checkout, so `graphify-out/` is ignored whole.

**Nothing is registered with git.** The graph is regenerated, never merged, so
no merge driver and no attribute is landed for it, and graphify's own raw git
hooks are never installed — the commit gate's refresh hook runs the graph
build instead ([pre-commit's](pre-commit.md#5-the-graph-refresh-hook)), and
`setup:precommit` strips whatever an earlier install left.

The graph tool's pin, `pipx:graphifyy` with the `uv` and `python` it locks
with, and the `code:graph` task are [mise's](mise.md#3-the-task-library). The
PyPI name really is `graphifyy`, double y; never correct it.
