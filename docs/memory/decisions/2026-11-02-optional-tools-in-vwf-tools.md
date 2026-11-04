DECISION 2026-11-02 ★5 | plugins:vwf+stackgen | context7, notion, taste-skill →
optional `addon` packs picked in /vwf:architecture; every LSP and MCP server in
the `vwf-tools` local plugin; `mcp_servers:` and `.mcp.json` retired |
alt default installs rejected

# Decision — optional tools in vwf-tools

**Date** 2026-11-02, landed 2026-11-04 · **Plan**
`docs/plans/2026-11-02-optional-tools-in-vwf-tools`

## Why

A table of every external dependency of the two plugins showed vwf installs
Context7 for everyone, though no vwf skill, agent or reference calls it. Notion
and taste-skill had the same shape: tools that serve the agent, installed by a
default or a backing pick nobody made as a tool choice.

## Two reversals

- **R1. vwf no longer ships Context7.** This reverses the absorption of the old
  context7 plugin into vwf's manifest. vwf declares no MCP server.
- **R2. The project-scoped `mcp_servers:` pack key and the tier-2 `.mcp.json`
  write path are retired.** This reverses the three-sibling-keys design.
  `user_mcp_servers:` and `lsp_servers:` stay.

## Decisions

- **D1.** One multi-select tools menu, nothing preselected, only picks
  installed.
  A re-run shows the current pick and asks only whether to change it.
- **D2.** Every picked MCP server lands in `vwf-tools`, user scope, like the LSP
  servers. The pick is the product's, in `addons:`; each machine gets the
  servers
  when its owner runs `/vwf:setup`.
- **D3.** The claude-design server moves to `vwf-tools` and stays required,
  declared under `user_mcp_servers:`, with no menu step.
- **D4.** `mcp_servers:`, the `.mcp.json` write path and its consent line are
  removed; `stackgen-sync` removes a repo's recorded entries behind consent.
- **D5.** `user_mcp_servers:` keeps its name.
- **D6.** Each tool is a pack and bundle of type, kind and axis `addon`, no
  `default: true`: `addon/context7`, `addon/notion` (moved from
  `capability-provider/notion`), `addon/taste-skill`. Every "seven axes" count
  is
  eight; "the three tool axes" stays design, cicd and stylesheet.
- **D7.** A top-level `addons:` list in `.config/vwf.yaml`, one per product.
- **D8.** `/vwf:architecture` shows the menu after the stack menu and writes
  `addons:`; `/vwf:setup` materializes each pick on every run and removes a
  dropped one.
- **D9.** The generator halts only when no Context7 server is reachable from any
  source, naming the remedy: tools menu, `/vwf:setup`, restart. A duplicate
  registration is the user's choice.
- **D10.** `design-session` halts as before with the new remedy; the three
  import
  skills do not need taste-skill.
- **D11.** taste-skill still installs through the bootstrap handoff; `vwf-tools`
  holds servers only.
- **D12.** Migration keeps what the repo has: recorded tools go into `addons:`,
  context7 is one yes/no question, and the lockfile block is renamed. Narrowed
  by
  gaps G13 and G15, below.
- **D13.** Tool mismatches are drift, never blocking.
- **D14.** `config_format` moves to 25, since moving notion out of
  `backing_template` is not additive.
- **D15.** The `context7` entry is the command vwf's manifest declared,
  unchanged.
- **D16.** The roughly 130 passive "API belongs to Context7 at use time" pack
  hints
  stay; a sweep is parked.
- **D17.** The addon pack unit ran the inventory generator as its last step, so
  the pack, bundle, versions, `kinds.md` and inventory land in one commit.
- **D18.** One security review row covers the edit units, since `check.ts`
  changed.
- **D19.** The `stackgen-lsp` migration is one tier-3 offer: write `vwf-tools`
  with
  the union, register it, uninstall the old plugin, remove its marketplace,
  delete
  its directory. Each step is idempotent; a failed or declined step stops and
  the
  next run resumes.
- **D20.** Server tools are named `mcp__plugin_vwf-tools_claude-design__<op>`;
  the
  design-tool guard in `check.ts` matches the new form too.
- **D21.** notion joins `addons:` from a `backing_template` entry or any repo's
  lockfile record.
- **D22.** A lockfile naming `stackgen-lsp` on a machine without the directory
  is
  rewritten with no prompt, and its servers merge behind normal consent.
- **D23.** A fixed relocation table in `stackgen-sync` re-attributes moved items
  in
  the base repo, never removing and re-adding. The lockfile records owners as a
  list; an old-shape entry reads as owners unknown and doctor skips it.
- **D24.** `addons:` is always a list, `[]` when none, never `unresolved`.
- **D25.** Addons materialize in the base repo only, and doctor reads its
  lockfile.
- **D26.** `vwf-tools/.claude-plugin/claims.json` maps each server key to the
  repos
  claiming it; a key leaves the manifest only when no repo claims it. An absent
  file means every key is unclaimed and kept.
- **D27.** A declined migration writes nothing: no server is served twice, new
  servers land nowhere, `.mcp.json` entries stay, doctor reports drift, and the
  offer returns on each later setup or sync.
- **D28.** The stdio runner guard in `check.ts` also reads every pack's
  `user_mcp_servers:`.
- **D29.** Migration reads the lockfile of every locally cloned repo; a member's
  own
  sync removes its old items, and a plugin another repo claims through an addon
  is
  never removed by a member.
- **D30.** Migration seeds claims for the current repo. Narrowed by gap G22,
  below.
- **D31.** The menu payload gains the addon round's shape: product-level,
  multi-select, no default, no generate, no defer, an optional `needed_by`.
- **D32.** A user ruling during review. URLs in env values are vetted and the
  consent gate shows the env values, and `lsp_servers:` entries take the same
  command, args and wrapper rules as the other generated servers.
- **D33.** A user ruling during review. `pipx run --spec` is read, so the name
  `--spec` gives is what is vetted, and a shell `env` starts counts as a shell
  (`env sh -c`). **The written limit:** the generator vets the names it can read
  from the declared command, the gate shows the full command and env values, and
  the person at the gate is the control for any form the vetting does not parse.

## Where the run narrowed a decision

- **G13, G15 — shipped-pack keys only.** D12 said recorded `.mcp.json` entries
  move
  to `vwf-tools`. The security review found that copying a declaration out of a
  committed file would be a process in every session on the machine, past the
  project approval `.mcp.json` itself gets. So a key moves only when a shipped
  pack
  declares it, or the relocation table maps to one, and takes the pack's
  declaration; any other key stays and is reported.
- **G22 — narrowed seed.** D30 seeded every key the lockfile claims. A committed
  lockfile cannot earn a claim, so the seed covers only keys whose old-manifest
  declaration matches the shipped pack's or a same-run generator emission. A
  generated or stale key stays unclaimed and kept. A ruling may widen it.
- **G14.** The gate and the notion conventions state the cross-repo reach of an
  authenticated user-scoped server.
- **G17.** No reputation source vets a remote host, so every generated `host:`
  row
  blocks and a generated http MCP server cannot land. A ruling may want a vetted
  path.

## What the user does on this machine

- Add `addons: [context7]` to this repo's `.config/vwf.yaml` by hand; the plan
  does
  not edit this repo's `.config/` files. The file's stamp moves to 25 with
  `/vwf:setup`.
- Let stackgen migrate `stackgen-lsp`, the plugin this machine has registered:
  run
  `/vwf:setup` or `/stackgen:stackgen-sync` and accept the offer, then restart
  the
  session.
