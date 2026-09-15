# Workspace — the capability contract

What **any** knowledge workspace has to satisfy to serve a vwf product,
stated without naming one. The provider packs under
`stacks/capability-provider/` say how a particular tool satisfies it.

A **workspace** is where the team's prose lives: the docs, the specs, the
tickets, the meeting notes, the decisions nobody wrote into the repo. It is
the **agent's** knowledge source, not the product's runtime — which is why
the contract below is about reach and permission rather than about
availability, latency or failure modes.

**Capability tokens realized here: none today**, and unlike `secrets-manager`
this is not a vwf-side gap waiting to be filled — the component taxonomy says
why. Nothing in a blueprint chooses a workspace, because nothing the product
runs depends on one; components leave `capability` unset and nothing here
mints a token. Blueprint prose, on the rare occasion it needs the noun, calls
it **the workspace**.

## The rule that outranks every other

**The agent reaches the workspace through an MCP server the pack lands in
the repo's `.mcp.json` behind its own consent line — never through an API
key in the tree, and never through a file the application reads.**

Both halves matter. A server is the only reach shape that keeps the
workspace out of the product: no client library enters a manifest, no
credential enters a config the build reads, and removing the provider is
deleting one key. And the consent line is separate on purpose — landing a
pack's skills is one decision, granting an agent a door into the team's
documents is another, and a person who wants the first must be able to
decline the second.

## What a workspace must be able to do

1. **Be reached by one project-scoped server.** Project-scoped means the
   repo's `.mcp.json`, so the wiring travels with the checkout and is
   reviewable in a diff. **One server per provider** — two entries naming
   the same workspace give the agent two answers to the same question and
   the lockfile two writers.
2. **Record its key where the materialization is recorded.** The lockfile
   carries the server key the pack landed, which is what lets a later
   re-sync diff it as its own declinable line rather than silently
   re-landing it.
3. **Degrade legibly when declined.** A decline leaves the pack's skills
   landed and the workspace unreachable, and **says so** — the agent reports
   that the tool is not wired rather than reporting that the workspace is
   empty. A silent empty result is the failure this clause exists to
   prevent.
4. **Authenticate the person, not the repository.** Either an authorization
   flow the agent host runs on first use, or an integration token that
   reaches the server **only** as a process environment variable injected at
   the boundary — that second path is the secrets contract's rule, cited
   here and not restated. Nothing under version control carries a
   credential, and a pack that cannot offer one of the two paths does not
   ship.
5. **Scope the agent's reach to what the authenticated person can see.**
   The workspace's own permissions are the boundary; a provider whose server
   reaches more than its operator does has widened access as a side effect
   of wiring, which no consent line covered.

A clause a tool cannot satisfy is **stated as such** in its pack's contract-
satisfaction topic, the kind's second bar topic, never omitted.

## Read

What the agent may read is whatever the authenticated person may read —
pages, databases, comments — and the discipline around it is the same
wherever the workspace is hosted:

- **Search before browse.** A workspace is a graph with no root worth
  walking; enumerating it costs tokens and returns the wrong things.
- **Quote with the source's own identifier**, so a human can open the page
  the claim came from. A summary with no way back to its source is an
  assertion, not evidence.
- **Treat it as a source, never as the truth.** Where the workspace and the
  repo's own docs disagree, the disagreement is the finding — the agent
  reports it rather than picking a winner.

## Write

**The default is that the agent writes nothing.** A write happens only
where the person asks for it in the session, and then:

- The agent **names the page or database it will change before changing
  it**, in terms the person can recognize without opening the tool.
- **No bulk edits and no deletes.** A workspace is shared, versioned
  unevenly, and often the only copy — the blast radius of a loop that edits
  fifty pages is other people's work.

## Scope

The workspace serves vwf's own steps and the person's questions. It is
**not a runtime dependency of the product**: a product whose code talks to a
workspace at runtime — reading a database as application data, writing
records as part of a flow — is a different capability with a different
contract, and this one does not describe it.

## Absence

**A project with no workspace pinned loses nothing.** Every vwf step works
from the repo's own docs, which is where the durable contracts live anyway;
a workspace adds reach to what the team wrote elsewhere and removes no
obligation to write things down here.

## What this contract does not decide

- **Which tool.** That is the user's pick from the menu, pinned per project
  on the backing axis.
- **What lives in the workspace.** That is the team's, and it changes
  without telling the repo — which is exactly why clause 5 makes the
  person's own permissions the fence.
- **Whether a product must have one at all.** Mandating one would be a
  vwf-side statement; this contract only says what one has to do once
  selected.
