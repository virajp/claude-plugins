# Notion — pick & trade

## When it is the answer

**When the team already writes there.** This is the decisive one, and it is not
a technical argument. A workspace provider is not a choice about capability; it
is a choice about where the prose already is. Pinning Notion when the specs are
in Notion costs a line of config. Pinning it when they are somewhere else is a
migration nobody asked for, and the docs will drift back to wherever the team
actually types.

**When the docs, the specs and the tickets are one system.** A workspace that
also holds the task database means one search reaches the decision, the spec
that followed it and the ticket that implemented it. Splitting those across a
wiki and a tracker means two providers, two grants and two answers to every
question — and the workspace contract allows one server per provider precisely
because two answers is the failure.

**When the reach has to follow the person's own permissions.** Notion's model
is per-page and per-database sharing that the workspace already enforces, and
the hosted server inherits it. Nothing about wiring the agent widens anyone's
access — the review of who may read what stays where the team already does it.

**When you want the wiring to be one key and one grant.** The whole
materialization is an entry in `.mcp.json`. There is no client library, no
config file, no CLI to pin, nothing in the repo to keep in sync, and removing
the provider is deleting the entry.

## When it stops being the answer

**When the prose lives elsewhere.** A team on a self-hosted wiki, on a repo of
markdown, or in a different hosted workspace is better served by no pin at all
than by one pointing at a mostly-empty Notion. See
[contract satisfaction](contract-satisfaction.md) on the absence clause: a
project with nothing pinned loses nothing.

**When a third party holding the team's documents is not acceptable.** This is
the same objection a hosted secrets manager faces, and it has the same answer:
there is no configuration that resolves it. The documents are on someone else's
servers, and that is the product.

**When the work has to happen with no network, or on a machine with no
person.** Every read goes to a hosted service behind a browser authorisation
flow. CI has neither, and a contributor offline has neither — see
[local stack](local-stack.md), where that gap is stated rather than worked
around.

**When what you actually want is the product reading Notion at runtime.** That
is a different capability with a different contract — durability, latency and
failure modes all become the product's problem — and the workspace contract
says explicitly that it does not describe it. Do not reach for this pack to get
there.

## What the choice does not commit you to

**Not the product, and not any code.** The contract's rule that outranks the
rest — the agent reaches the workspace through a server, never through a key in
the tree or a file the application reads — means the whole integration is one
`.mcp.json` key. No manifest gains a dependency, no build reads a credential,
and swapping to another workspace provider changes that key and nothing else.

**Not writing anything into the workspace.** The default is read-only by
discipline, not by grant. See [access shape](access-shape.md).

**And not a ranking.** The neutral workspace contract declines to say which
tool is better, and so does this page. The axis is **where the team's prose
already is**; this is the case for one answer to that question, not a verdict
on the others.
