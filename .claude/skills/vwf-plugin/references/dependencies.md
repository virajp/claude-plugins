# vwf's dependencies, and the vendored code

Why vwf depends on exactly one plugin, what the retired dependencies became, and
why the Karpathy guidelines are vendored rather than depended on, and why memory
needs no dependency at all.

## Dependencies

`vwf` depends on one plugin — `stackgen` — **resolved from the `virajp-plugins`
marketplace itself**, so installing `vwf` needs no other marketplace registered.
It is authored here.

**`stackgen` is a dependency because without it the stack menu is empty.** The
eight stack axes are closed to what the installed stack plugins declare, and
since `config_format` 14 there is no *other (describe)* escape. Since 16 that is
no longer a dead end — the user can defer the axis as `unresolved` and keep
defining the product — but deferral only moves the wall: `plan` and `execute`
halt on an unresolved axis, so with no stack plugin installed nothing can be
built. The `devtools` plugin's adapter retired in Wave C, which left vwf
shipping with no answer to its own menu, and `devtools` itself has since
dissolved into stackgen. stackgen is the general-purpose stack plugin, so it is
the one that closes it. **Installing is not using**: stackgen acts only when an
axis is pinned, so a user adopting vwf first and choosing a stack later pays
nothing for having it present.

`andrej-karpathy-skills` used to be on that list and is gone as a plugin: vwf
**vendored** its skill. That is the one place third-party code is vendored into
this repo, and it buys something a dependency could not — see The vendored
guidelines below. `mempalace` was on it too, was vendored the same way, and has
since been removed outright — see Memory below.

**stackgen is load-bearing at `init` and at `setup`, not only at
`architecture`.** `/vwf:init` first calls `/stackgen:tool-config all`, which
lands the toolchain manager's config and the repo gates the `devtools` plugin
used to scaffold, with init's answers as its flags — the ignore and attribute
files among them since 2026-09-27 — and records those answers in the repo's
`.config/stackgen.yaml`, the file only its script writes; then writes its own
hygiene assets and materializes the secrets provider the user picked, the only
thing it fetches through the stack adapter; it fetches no bundle for its
baseline. With no stack adapter installed, `init` **halts** with the install
command rather than printing an empty plan that reads like an already-shaped
repo. All of it lands **per repo** — the base and every member `init` resolved,
each with its own `stackgen.yaml` — so a member is shaped on its own evidence.
`/vwf:setup` no longer fetches any of them: it checks that **each repo** carries
`.config/stackgen.yaml` with `format: 1` — and each repo's shape against
doctor's seven baseline predicates — and offers `/vwf:init` once when any of
them is missing or behind, which is why `init` is model-invocable and, being
hidden from the `/` menu, reached no other way. Note that `mise` legitimately
appears in two different meanings: the **tool** `stackgen:tool-config`
configures, and the **binary** `mise`, which is a mandate `/vwf:doctor` blocks
on once a stack axis is pinned.

Setup is the third site, and the one that grew: since the consumer-gaps work
`/vwf:architecture` records a pin and materializes nothing, and **`/vwf:setup`'s
materialize pass** is what invokes `-stack-template` for every pinned axis, once
per `(repo, slug)`, in the repo the project belongs to, carrying the pack's
`values:` it gathered (each entry's `detect`, else its `question`) for the
materializer's `tool-config pack` call. So the adapter is reached from `init`
(`tool-config all` and the secrets provider), from `setup` (every pinned axis)
and from `plan`/`execute` (pure conventions reads) — `architecture` reaches only
`-stack-menu`.

**Required binaries are no longer gated at install time.** A plugin used to
declare `requires:`, and the CLI computed the union over the dependency-expanded
set and refused the install — explicitly not overridable by `--force`. That gate
stayed retired when the CLI's plugin installs came back as a thin wrapper.

**Doctor does not fully replace it, and the gap is worth stating precisely.** Of
the binaries vwf shells out to, `/vwf:doctor` blocks on **`mise` conditionally**
— since `config_format` 16 a missing `mise` is blocking only once some axis in
the repo is pinned or some harness capability is claimed, and a degradation
before that, since a repo with no stack has no toolchain to resolve. A missing
language server is an ordinary finding; a **degradation** finding in §5 is,
since 2026-09-18, a forge CLI (`gh`) that is absent, not logged in, or without
the `project` scope, which leaves `/vwf:backlog` with nothing to read and every
planner's recall of it empty, since the backlog is a GitHub Project with no file
fallback — and where a product picks the `context7` tool, the **Context7 runner
is not checked at all**, a missing one surfacing as a dead MCP server. That
runner is `pnpm dlx` by default and `${CONTEXT7_RUNNER}` overrides it, so what a
check would have to verify is whatever the user pinned, not `pnpm`.

So the trade is slightly worse than "doctor already blocked on it": one blocks
once a stack is pinned, one degrades, and one is silent. It was still worth
taking — `claude plugin install vwf` cannot now fail for a reason the user did
not ask about — but `readme.md`'s caveat states the gap rather than implying
doctor covers it, and that is the honest version. **If a Context7-runner check
is ever added to doctor, this paragraph is what should shrink.**

`markdown` used to be on that list and is gone as a plugin: vwf **absorbed** it.
Its two skills (`documentation-standards`, `readme`) are vwf skills now,
authored
here, required by the workflow, and useful only alongside it — a separate plugin
bought nothing but a dependency edge. `/markdown:readme` is therefore
`/vwf:readme`, and vwf-only; that is intended.

`context7` went the same way and then left. **vwf declares no MCP server.** No
vwf skill, agent or reference uses Context7 at run time, so its one `mcpServers`
entry installed a server for everyone that vwf itself never called. It is now a
stackgen `addon` pack, `addon/context7`, picked on `/vwf:architecture`'s tools
round and landed in `vwf-tools` by `/vwf:setup`, and the one thing that needs
it,
the stackgen generator, halts with that remedy when no Context7 server is
reachable from any source. This reverses the absorption; the record is
[the optional-tools decision](../../../../docs/memory/decisions/2026-11-02-optional-tools-in-vwf-tools.md).

The dependency list is declared in **one** place —
`plugins/vwf/.claude-plugin/plugin.json` — and the marketplace entry is
generated from it, so the two can no longer drift. (They were once separate
files kept in sync by hand, which is what `p:plugins:check` used to compare.)
The checker now verifies each name resolves to a real plugin instead.

**`design-tools` is gone entirely, and vwf now names no design tool at all.**
Its three import skills became vwf's own in Wave C — `/vwf:import-screens`,
`/vwf:import-design-system`, `/vwf:import-conversations`, invoked only when a
project declares a `design:` tool. Wave D finished the job: the three per-tool
references left vwf for stackgen `design-tool` packs, and the manifest that
carried the Claude Design MCP server was deleted once `.mcp.json` became a
permitted target.

The seam is **two hops of fixed names**, and no constructed name anywhere. vwf
calls its own three skills; those delegate to three more fixed names in the
repo's own `.claude/` — `design-import-screens`, `design-import-design-system`,
`design-import-conversations` — which is what the project's `design:` pin
materializes. It is the same mechanism that dissolved `<plugin>-ux-gate`, reused
rather than reinvented.

Two consequences worth knowing. **The technology-free guard's allowlist got
smaller, not bigger** — the three exceptions those references needed are
retired, which is the intended direction whenever an entry stops feeling
arguable. And **the guard's MCP rule was generalized**: it matched the
plugin-scoped `mcp__plugin_design-tools_` prefix, which a project-scoped
`.mcp.json` server never produces, so matching only that would have quietly
stopped catching anything. It was widened once more when `.mcp.json` stopped
being a target at all: a design tool's server now lands in `vwf-tools`, whose
prefix is `mcp__plugin_vwf-tools_<token>__`.

**There is no CI dependency edge at all any more.** vwf owns the
delivery-pipeline **contract** (`assets/delivery-pipeline.md`), which states
what a deploy must guarantee and names no mechanism; the mechanism belongs to
whichever CI system the project's `cicd` axis pins — since the `cicd` plugin
dissolved, a `stackgen` `ci-system` bundle behind
`contracts/release-trigger.md`. Nothing in vwf delegates to it, so nothing in
vwf has to force an install.

When `vwf` is enabled, Claude Code (≥ 2.1.143) **auto-installs and
auto-enables** these dependencies at the same scope. Key rules:

- **A new dep is one edit, not two.** Add a `{marketplace, name}` entry to
  `dependencies` in `plugins/vwf/.claude-plugin/plugin.json`; the marketplace
  entry is generated from it. Keep it inside `virajp-plugins`: a
  cross-marketplace dep is blocked at install time unless the **root**
  marketplace allowlists it via `allowCrossMarketplaceDependenciesOn`.
- **Auto-enable is event-driven**, firing only when the parent (`vwf`) is
  enabled — not on a continuous reconcile. If a dependency is later disabled on
  its own, re-enable it directly or toggle `vwf` off/on.

### Memory: files, no dependency

vwf's memory is the `docs/memory/` file store — `decisions/`, `gaps/` and
`problems/` committed, `handoff/` gitignored — defined by
`plugins/vwf/assets/memory.md`. It needs no server, no tool and no plugin, so it
is no dependency at all.

It used to be a mempalace palace: the two upstream skills vendored under
`plugins/vwf/vendor/mempalace/`, a stdio server vwf declared in its manifest,
two auto-save hooks reimplemented here, and the files as a mirror beside it. The
2026-11-01 removal plan took all of it out, reversing the 2026-08-08 "mempalace
absorbed into vwf" ruling, and graphify's code-intelligence layer went with it —
see
[the removal decision](../../../../docs/memory/decisions/2026-11-01-remove-mempalace-graphify.md).
The only plugin text left naming either tool is cleanup: doctor §8's leftovers
table and setup's `config_format` 24 migration. The transport history and the
palace-hygiene rulings stay in their own decision records under
`docs/memory/decisions/`.

### The vendored guidelines

**The Karpathy guidelines were vendored because a url source failed quietly**,
and the reasoning for keeping them is the provenance: `andrej-karpathy-skills`
was url-sourced, so three of the four targets installed `vwf` and got **none**
of the behavioural guidelines it assumes are on — each failing quietly. That
failure mode is gone with the targets; the vendoring stays because the
provenance travelling with the code is worth more than the dependency edge.

`karpathy-guidelines` ships under `plugins/vwf/skills/`, taken **verbatim**,
with provenance in `plugins/vwf/vendor/andrej-karpathy-skills/`. One local edit
was needed: the repo's lint gate requires a language on every fence, so one bare
fence became `text`. It is recorded under **Local edits**, which is the only
thing that makes vendor drift survivable — an unrecorded edit is silently
reverted by the next resync.

The licence position is deliberate. Upstream declares MIT in its skill
frontmatter and its `plugin.json`, but **publishes no licence text** — GitHub
reports the repo as unlicensed. So this vendor directory carries a `NOTICE.md`
quoting both declarations verbatim rather than a `LICENSE` file. Shipping an MIT
text the upstream author never published would be worse than an honest note.
