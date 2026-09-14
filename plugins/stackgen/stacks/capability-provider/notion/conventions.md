# Notion — conventions

The team's prose already lives somewhere; here it is Notion. The docs, the
specs, the tickets, the meeting notes and the decisions nobody wrote into the
repo are in a workspace, and this pack does one thing — it gives the agent a
door into it. Nothing the product runs goes through that door.

**The server is the only reach, and it lands behind its own consent line.**
One `notion` entry in the repo's `.mcp.json`, written when the person says yes
to that write specifically — separately from saying yes to these skills.
Landing a pack's judgment and granting an agent access to the team's documents
are two decisions, and a person who wants the first must be able to decline the
second. That is the workspace contract's rule that outranks every other, and
this pack has nothing to add to it.

**A decline leaves the skills landed and the workspace unreachable, and the
agent says so.** No entry in `.mcp.json` means the answer to "what does the
spec say" is *the workspace is not wired*, never *the workspace has nothing*.
The contract's degrade-legibly clause exists because the silent version of that
failure is indistinguishable from a workspace nobody wrote in — and the reader
acts on the wrong one.

**Authorisation is the person's, not the repository's.** The hosted server
authenticates through a flow the agent host runs on first use; the browser
opens once per machine and the grant is held by the host. No integration token
enters this tree, which is why the secrets contract is not engaged here at all
— there is no name to catalogue and no value to inject.

**The agent reaches what the authorised person reaches, and no more.** Notion's
own permissions are the fence. The grant covers the pages and databases that
person can already open, so wiring the server widens nobody's access; it only
lets the agent use access that already exists. Reviewing who may read what is a
workspace-side task, and it stays one.

**Search before browse.** A workspace is a graph with no root worth walking.
Enumerating it is slow, expensive and returns the wrong things; the first move
against any question is a search, and the second is fetching the two or three
results that matched.

**Quote with the page's own identifier**, so the reader can open the source.
A summary with no way back to where it came from is an assertion.

**The default is that the agent writes nothing.** A write happens only where
the person asks for it in the session, and the agent names the page or database
it is about to change first, in words that person will recognise without
opening the tool. No bulk edits and no deletes: the workspace is shared, it is
often the only copy, and the blast radius of a loop is other people's work.

**The workspace is a source, never the truth.** Where it and the repo's own
docs disagree, the disagreement is the finding — the agent reports both and
does not pick a winner. The durable contracts live in the repo; the workspace
is where the team's reasoning happens to be written down.

## What this pack writes

| Lands at    | Is                                             |
| ----------- | ---------------------------------------------- |
| `.mcp.json` | one `notion` server entry, behind its own line |

Nothing else. There is no config file, no CLI to pin and no task to overlay:
the server is hosted, the authorisation is the person's, and the repo carries
one key that removing the provider deletes.

Full judgment: the `notion` skill's references. The contract it cites is
stackgen's neutral workspace contract.
