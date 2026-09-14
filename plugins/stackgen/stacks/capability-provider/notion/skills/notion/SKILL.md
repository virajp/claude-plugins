---
name: notion
version: 0.1.0
category: development
description: Notion as this product's knowledge workspace — read this before
  searching, fetching or writing anything in the team's Notion pages, specs,
  tickets or databases, and before answering from the workspace or reporting
  it as empty. Covers when Notion is the right pin, how it satisfies the
  workspace contract, the authorisation flow that stands in place of an
  integration token, what the agent may reach and may write, cost shape, and
  why there is no local stack to compose. Also auto-applies when editing the
  repo's MCP wiring.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.mcp.json"
---

# Notion

The team's prose lives in a workspace and the agent reads it over one hosted
server. This skill carries the judgment; the server's current tool surface
belongs to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this provider | [Pick & trade](references/pick-and-trade.md) |
| Checking it against the workspace contract | [Contract satisfaction](references/contract-satisfaction.md) |
| Reasoning about who is authorised, and how | [Authorisation, not a token](references/oauth-not-token.md) |
| Wiring the server, or sizing what it can reach | [Integration & access shape](references/access-shape.md) |
| Sizing, or explaining a bill | [Cost shape](references/cost-shape.md) |
| Running anything offline, in CI, or without a seat | [Local stack](references/local-stack.md) |

**Two rules that do not wait for a reference:** search before you browse — a
workspace has no root worth walking — and write nothing unless the person asked
for it in this session, naming the page you will change before you change it.
