# Context7 — conventions

An optional tool: one MCP server that serves current library documentation.

**What it serves.** The agent, when a task turns on a library's current API,
and the stackgen generator, which researches an uncovered component through it
and halts when no Context7 server is reachable from any source.

**Where it lands.** One `context7` entry in `vwf-tools`, the local plugin
stackgen generates, at user scope. The pick is the product's, committed in
`.config/vwf.yaml`'s `addons:`; each person's machine gets the server in their
own `vwf-tools` when they run `/vwf:setup`, behind that write's consent line.

**The runner is the person's.** `CONTEXT7_RUNNER` overrides the default
`pnpm dlx`, so `bunx`, `npx -y` or an absolute path also answer.
`CONTEXT7_API_KEY` is optional: the server runs without it, and a value reaches
the server only as a process environment variable, never through the tree.

**What it needs.** `node` and `pnpm` on `PATH`, unless `CONTEXT7_RUNNER` names
something else that runs the package.

## What this pack writes

| Lands at    | Is                                      |
| ----------- | --------------------------------------- |
| `vwf-tools` | one `context7` server entry, user scope |

Nothing lands in the repo.
