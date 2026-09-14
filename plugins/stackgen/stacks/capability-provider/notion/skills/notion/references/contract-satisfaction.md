# Notion — contract satisfaction

Clause by clause against stackgen's neutral workspace contract. It cites, and
does not restate.

## The rule that outranks every other

**Satisfied by construction.** The agent reaches Notion over an MCP server the
pack lands in the repo's `.mcp.json`, and there is no other path: no client
library enters a manifest, no credential enters a config the build reads, and
the application never learns that Notion exists. Removing the provider is
deleting one key.

The consent half is satisfied by the materializer rather than by this pack —
the `.mcp.json` write is its own declinable line, separate from landing these
skills. What the pack contributes is having nothing else to land, so a decline
costs exactly the reach and nothing else.

## Clause 1 — reached by one project-scoped server

**Satisfied.** One entry, keyed `notion`, in the repo's own `.mcp.json`, so the
wiring travels with the checkout and shows up in a diff.

**One server per provider is a rule this pack can break and must not.** Notion
publishes the same hosted server on two transports — the modern streamable HTTP
endpoint, which this pack pins, and a legacy server-sent-events endpoint for
clients that cannot speak it. They are one server, not two providers. Adding
the second as a fallback entry would give the agent two names for one workspace
and the lockfile two writers, which is precisely what the clause forbids. A
client that genuinely needs the legacy transport changes the entry; it does not
gain one.

## Clause 2 — record its key where the materialization is recorded

**Satisfied, by the materializer.** The landed server key is written into the
lockfile alongside the rest of the materialization, which is what lets a later
re-sync present it as its own declinable line rather than silently re-landing
it after someone deliberately removed it.

The pack's obligation here is only to declare **one** key with a stable name,
which it does. A pack that generated a key name from configuration would defeat
the record, because the next run would compute a different one.

## Clause 3 — degrade legibly when declined

**Satisfied by discipline, and this is the clause with no mechanism behind
it.** Nothing in the wiring can tell the agent to explain itself; the pack's
conventions say it and the skill's two standing rules repeat it.

The failure to guard against is specific: the server is absent, a search
therefore returns nothing, and the agent reports *the workspace does not
mention it* instead of *the workspace is not wired*. Those two sentences send a
reader to opposite conclusions, and only one of them is true. If the `notion`
entry is not in `.mcp.json`, say that, and stop — do not substitute the repo's
own docs and present the result as though the workspace had been searched.

## Clause 4 — authenticate the person, not the repository

**Satisfied by the first of the clause's two paths.** The hosted server
authorises through a flow the agent host runs on first use: a browser opens,
the person picks the workspace, and the host holds the grant. Nothing under
version control carries a credential, and there is no name for
`environment.md` to catalogue because no variable is injected.

The clause's second path — a token reaching the server only as an injected
process environment variable — is what a self-hosted server would need, and it
is the path this pack does not take. Why, and what would change if it did, is
[authorisation, not a token](oauth-not-token.md).

## Clause 5 — scope the reach to what the authenticated person can see

**Satisfied, with one property the person authorising should understand
first.** The grant is to a workspace, and inside it Notion's own page and
database permissions apply unchanged — the agent sees what that person sees.
Wiring the server therefore widens nobody's access.

**The fence is the authoriser's own, which cuts both ways.** An account with
broad access grants broad reach, and that is not a defect the pack can fix from
this side: the answer is who authorises, not what the pack configures. A
workspace where sensitive material is separated by permission rather than by
convention is one where this clause means something; a workspace where
everything is shared with everyone is one where the clause is technically
satisfied and practically empty.

## Read

**Satisfied, and the discipline is the contract's.** Search reaches the
workspace's own index, fetch retrieves a page or a database row by identifier,
and both return identifiers a human can open — so the contract's
quote-with-the-source rule has something to quote with. Enumerating is possible
and is the wrong move; see [access shape](access-shape.md).

The treat-it-as-a-source-never-the-truth rule needs no mechanism and gets none.
It is a judgment the agent applies when the workspace and the repo disagree,
and the contract already says what to do: report the disagreement.

## Write

**Satisfied, and the risk is real rather than theoretical.** The server exposes
page creation and page updates, and some of them run asynchronously on large
payloads — which means a write can be in flight after the call returns. That is
the shape of the blast radius the contract's no-bulk-edits rule is about.

The pack adds nothing to the rule and subtracts nothing from it: write only
when asked in the session, name the page first, one page at a time, no deletes.

## Scope

**Satisfied by what this pack deliberately is not.** Nothing the product runs
touches Notion. The server is wired for the agent; the application has no
client, no credential and no dependency on Notion being reachable. A product
that wants its own code reading a Notion database as application data is
describing a different capability, and the contract says so — this pack is not
the way to get there, and extending it would be the reversal, not a feature.

## Absence

**Satisfied.** A project with no workspace pinned works: every vwf step reads
the repo's own docs, which is where the durable contracts live. This pack adds
reach to what the team wrote elsewhere and removes no obligation to write
things down here — see [local stack](local-stack.md), where absence and the
offline case are the same answer.
