---
name: cloudflare-agents
version: 0.1.0
category: development
description: Cloudflare Agents SDK development — the Agent class and what it
  persists, the Durable Object binding and migration it cannot run without,
  routing and client connections, scheduled work, and testing. Layers on top
  of the TypeScript baseline rather than replacing it. Auto-applies when
  editing an agent project's TypeScript or its Wrangler configuration.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.mts"
  - "**/*.cts"
  - "**/wrangler.jsonc"
  - "**/wrangler.toml"
---

# Cloudflare Agents SDK

Layers on the TypeScript baseline — read that skill's standards first; this
adds to them and replaces none of them.

**An agent is a Durable Object: there is no agent without the class
declaration and its SQLite storage in the Worker's Wrangler configuration.**
Everything else here — state, SQL, schedules, connections — is a property of
that object, and the object's own doctrine belongs to the
`cloud-service/durable-objects` component, not to this one.

| Doing | Read |
| --- | --- |
| Designing the class — state, SQL, lifecycle, hibernation | [Agent model](references/agent-model.md) |
| Declaring the class, its storage, or renaming and removing one | [Durable Object wiring](references/durable-object-wiring.md) |
| Routing requests in, connecting a client, authenticating either | [Connections](references/connections.md) |
| Anything that runs later — delays, dates, cron | [Scheduling](references/scheduling.md) |
| Writing or wiring tests, or running the agent locally | [Testing](references/testing.md) |

API signatures are Context7's at use time
(`/websites/developers_cloudflare_agents`); these references carry patterns,
placement and judgment only.
