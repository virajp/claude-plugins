# graphify — what the knowledge graph ingests, and what git keeps of it

graphify builds the code-intelligence graph from the tree. Two files decide
its edges: `.graphifyignore` says what the graph does not ingest, and two
lines in `.gitignore` say which of its output git keeps. They are different
files for different readers, and both sit at the root, where each reader
looks.

This reference is the `graphify` row of the skill's tool table. The contract
every tool shares — the argument shapes, the block markers, drift, removal and
the lock record — is [the skill's](../SKILL.md); what follows is graphify's
own. The file it lands is under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/graphify/`, laid out as it
lands under the repo root.

## 1. What `all` lands

| Landed            | As                                                           |
| ----------------- | ------------------------------------------------------------ |
| `.graphifyignore` | the frame, then one `graphify` block                         |
| `.gitignore`      | a `graphify` block after the `git` block, through git's verb |

**The ignore file's one entry is the graph's own output**, `graphify-out/`:
ingesting it would feed the last run's summary back in as source. A repo adds
its own paths below the block, as the user's lines.

**Its `.gitignore` lines are asked of git**, as a pack would ask, and land as
the `graphify` block, in this order:

```text
git add ignore graphify-out/* !graphify-out/GRAPH_REPORT.md for graphify
```

The graph is rebuilt locally on demand, so the graph itself is machine-local;
`GRAPH_REPORT.md` is prose about what the graph found, worth diffing in review,
so its negation follows the pattern that would otherwise swallow it — git's
[written-order rule](git.md#3-the-ignore-files-rules) keeps it there. The
block is graphify's base: `for graphify` is the skill's own spelling here, and
`git remove graphify` is refused as any base's removal is.

**Nothing is registered with git.** The graph is regenerated, never merged, so
no merge driver and no attribute is landed for it, and graphify's own raw
git hooks are never installed — the commit gate's refresh hook runs the graph
build instead ([pre-commit's](pre-commit.md#6-the-graph-refresh-hook)), and
`setup:precommit` strips whatever an earlier install left.

**The keys it reads**: none.

## 2. The verbs

None beyond `remove <requester>`, which every tool takes. The base is landed
by `all`; a repo's own paths are the user's lines, written by hand.

## 3. The migration

`all` on a repo the retired hygiene pack shaped rewrites a `.graphifyignore`
that still matches the retired payload as the `graphify` block, keeps any line
the payload never carried as the user's, and re-records the lockfile entry as
`tool-config/graphify@<version>`. The `graphify` banner section in
`.gitignore` becomes the `graphify` block there, as
[git's migration](git.md#5-the-migration) says.
