# Notion — integration & access shape

## Where the boundary sits

**Between the agent and the workspace, and nowhere near the product.** The
running system never reaches Notion; the agent does, over one MCP server, while
a person is at the keyboard. There is no client to initialise, no failure mode
inside the application to handle, and no start-up ordering to get right —
because nothing the product runs is on this path at all.

That is the whole integration. Everything below is about what the agent may
reach through it and how to reach it well.

## The wiring

One entry in the repo's own `.mcp.json`, landed by the materializer behind its
own consent line:

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

That is the hosted server on its streamable HTTP transport. A legacy
server-sent-events endpoint exists for clients that cannot speak it; it is the
**same** server, so a client needing it changes this entry rather than gaining
a second one — see clause 1 in
[contract satisfaction](contract-satisfaction.md).

There is no `env` block, no header and no token. The first call opens a browser
and the host keeps the grant; see
[authorisation, not a token](oauth-not-token.md).

## What the agent can reach

**Exactly what the authorised person can open** — pages, databases, their
contents and their comments — and nothing outside the workspace they picked
during authorisation. The tool surface is a small set of families rather than
an API to learn:

| To | Reach for |
| --- | --- |
| Find anything at all | the search tool |
| Read one page or database row by id | the fetch tool |
| Ask a database a structured question | the data-source query tool |
| Create or update a page, when asked | the page write tools |

Names, arguments and the current set belong to Context7 at use time, not to
memory. One worth knowing by shape: the fetch tool answers for the identifier
`self` with the connected workspace and user, which is how to confirm *which*
workspace a grant actually reached before quoting anything from it.

## Search before browse

**A workspace is a graph with no root worth walking.** Nothing here rewards
enumeration: the page tree is deep, it is shaped by how people filed things
rather than by what they mean, and a top-down crawl spends its budget on
navigation pages. Start with a search, read the two or three hits that matched,
and follow links from those.

The one exception is a database whose schema you already know. Querying it is
not browsing — it is a structured read with a filter, and it returns rows
rather than a subtree.

## Identifiers are what make a claim checkable

**Quote with the page's own identifier.** Every fetch gives one, and it is what
turns "the spec says X" into something the reader can open. A summary with no
way back to its source is an assertion, and the contract's read discipline
exists to keep those two apart.

This matters more here than it would against a repo, because the reader may not
be able to see the page at all — the fence is each person's own permissions. An
identifier they cannot open is still an answer; a paraphrase they cannot trace
is not.

## Writing

**Read-only by default, and by discipline rather than by grant.** The grant
usually permits writes; the pack's rule is that the agent does not make them
unless the person asked in this session.

When one is asked for:

- **Name the page or database first**, in words the person will recognise
  without opening Notion, and get the nod before changing it.
- **One page at a time.** No bulk edits, no deletes. The workspace is shared
  and often the only copy.
- **Know that a large write may run asynchronously**, returning a handle rather
  than a result. Do not treat the call returning as the change having landed,
  and do not fire a second write on the assumption that the first did nothing.

## Nothing to catalogue in `environment.md`

No variable is injected, so there is no name and no issuer for the environment
catalogue to record. That is the one place this provider differs from every
other backing pin, and it is a consequence of clause 4's first path rather than
an omission.
