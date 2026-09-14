# Notion — authorisation, not a token

The constraint that bites. It is not the server's latency, its uptime or its
bill — it is that **the workspace is reachable only by a person who is
present**. Every read is made under an interactive grant held by the agent
host, obtained the first time by opening a browser. There is no credential in
the repo to hand to anything else.

That is the contract's clause 4 satisfied in its cleanest form, and it is also
the property that reshapes what may depend on the workspace at all.

## Nothing headless can read the workspace

CI has no browser and no person. Neither does a scheduled job, a container, a
teammate's checkout before they have authorised, or a fresh clone on a machine
that has never seen this tool. All of them have the repo; none of them have the
workspace.

The practical rule that follows is short: **nothing automated may depend on the
workspace being readable.** No gate reads it, no check asserts against it, no
build step fetches from it. A step that did would pass on the laptop that
authorised and fail everywhere else, which is the worst version of a
configuration error — it looks like a flake.

## What is durable belongs in the repo

The corollary is the one that costs something. A decision found in a workspace
page is not a decision the repo has: the next reader may be offline, may not be
in that workspace, or may be a reviewer three months from now with no seat.

**When the workspace answers a question the repo should have answered, write it
down here.** That is not busywork routed around a tool limitation — the
contract's absence clause makes the same point from the other end: the
workspace adds reach to what the team wrote elsewhere and removes no obligation
to write things down in the repo. This constraint is what turns that from
doctrine into a habit, because the alternative is a repo whose reasoning is
only legible to people holding a particular grant.

## The grant is a session property, not a repo property

Two consequences worth holding:

- **Two people can get different answers to the same question**, legitimately,
  because the fence is each person's own permissions. If a claim from the
  workspace matters, quote it with its page identifier so the next reader can
  check whether they can see the source at all.
- **The grant expires and is renewed by the person**, not by anything the repo
  can automate. A reach that stops working is re-authorised interactively; it is
  never fixed by adding a credential somewhere.

## The path this pack does not take

Notion also publishes an open-source stdio server, `notion-mcp-server`, which
runs locally and authenticates with an integration token — conventionally
`NOTION_TOKEN` — supplied as a process environment variable; that is the
contract's second authentication path, and it would make the workspace reachable
headlessly, at the cost of a long-lived credential scoped to whatever pages the
integration was shared with rather than to a person, plus a secrets manager to
hold it and an entry in the environment catalogue. This pack does not ship it:
the constraint above is a real cost, and it is still the cheaper one, because a
token that nothing revokes when someone leaves is the failure the person-shaped
grant does not have. A product that needs the headless path should say so
explicitly and pin a provider that offers it, rather than bolting a token onto
this one.
