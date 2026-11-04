---
name: Notion
axis: addon
kind: addon
components:
- addon/notion@1.0.0
---

# Add-on — Notion

The team's prose — docs, specs, tickets, the decisions nobody wrote into the
repo — lives in a Notion workspace, and the agent reads it there. Pinning this
is a statement about where the writing already happens, not a capability the
product gains.

**The composition is stackgen's neutral workspace contract plus this one
provider.** The contract leads with the rule that outranks the rest — the agent
reaches the workspace through an MCP server the pack lands in `vwf-tools`, at
user scope, never through a key in the tree and never through a file the
application reads — which is what makes the provider replaceable, and what
keeps this bundle one entry rather than a client library in every service.

**The reach is the agent's, never the product's.** Nothing that runs in any
environment touches the workspace: no service imports a client, no build reads a
credential, and no deployed path depends on a third party being up. A product
whose own code needs to read a Notion database as application data is describing
a different capability, and the contract declines to describe it.

**Authorisation is a person's, obtained once per machine.** The hosted server
runs an authorization flow the agent host opens on first use, so no integration
token enters the tree and the agent reaches exactly what the authorised person
reaches. The cost of that shape is stated rather than hidden: nothing headless —
CI, a scheduled job, a fresh clone — can read the workspace at all, so nothing
automated may depend on it and anything durable belongs in the repo.

**What it lands.** The pack's skills in the repo, and a `notion` server entry in
`vwf-tools`, the local plugin stackgen generates, at user scope, which this
bundle wires in behind its own consent line — landing the pack's skills is one
decision and granting an agent a door into the team's documents is another, and
declining the second leaves the first intact. The pick is the product's, recorded
in `.config/vwf.yaml`'s `addons:`; each person's machine gets the server when
they run `/vwf:setup`. There is no config file, no CLI pin and no task, so
removing the provider is deleting one key.

Full judgment: the component's own skill and its references. The contract it
cites is stackgen's workspace contract.
