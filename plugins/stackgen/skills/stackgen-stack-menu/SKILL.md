---
name: stackgen-stack-menu
description: Return the stack options the stackgen plugin offers — its shipped
  bundles, the repo's own bundles, the design tools and the addons, plus the
  one open entry, compose-a-bundle — as a vwf menu payload; and, as
  `compose:`, write a repo bundle. Invoked by /vwf:architecture and
  /vwf:setup when `stackgen` is listed in the config's `stacks:` — not a
  general-purpose skill.
argument-hint: "[compose:]"
disable-model-invocation: false
user-invocable: false
model: sonnet
effort: low
---

# stackgen-stack-menu

Return the options this plugin offers, per the vwf stack-adapter contract.
**Return the payload and nothing else** — no prose, no recommendation, no
comparison. Choosing is the user's job and presenting the choice is vwf's.
Called with `compose:`, it writes one repo bundle instead
([Composing a bundle](#composing-a-bundle)).

> **`disable-model-invocation` must stay `false`, and `user-invocable` must
> stay `false` too.** A user-only skill is removed from the model's context
> entirely and cannot be invoked programmatically — vwf does not get an
> error, it gets an empty menu. And no user types this skill: it answers vwf
> in a payload shape only vwf reads, so it stays out of the `/` menu, which
> is shorter for it.

## How to answer

1. **The bundles.** List `${CLAUDE_PLUGIN_ROOT}/stacks/bundles/*.md`, then
   the repo's own bundles, `.claude/stackgen/bundles/*.md` at the root of
   the current repo. **Each is one menu entry** — a bundle is what a user
   picks, because a component answers "what is this language" and a bundle
   answers "what is a service in it". Its slug is the filename, and `name`,
   `axis`, `kind`, `platforms`, `artifact` and `tools` come from the
   frontmatter (`${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`). Take the
   `summary` from the body's opening sentence. **The `tools:` list is copied
   as the bundle gives it** — `/vwf:setup` reads it from this payload to add
   and link the bootstrap tools before it materializes.

   **The repo baseline is no bundle.** The toolchain manager, the gates and
   the hygiene configs are bootstrap's, and `/vwf:init` writes
   the prose files from its own assets — so nothing here is a choice that
   is not one.

   **Never list bare components.** `stacks/<type>/<slug>/pack.yaml` files,
   the tool-knowledge entries under `${CLAUDE_PLUGIN_ROOT}/tools/` and the
   bootstrap tools themselves are the parts a bundle composes, not options —
   offering them would ask the user to assemble a stack rather than choose
   one. Tool knowledge is never offered at all: it follows the tools.

   **Copy `default: true` from the bundle, never compute it.** An entry
   carries the key exactly when its bundle file's frontmatter does, and omits
   it otherwise — vwf preselects whichever entry carries it, and this skill
   has no opinion of its own about which bundle that should be. More than one
   entry on an axis may carry it when their `platforms` differ — one per axis
   per platform, where a bundle declaring no `platforms:` covers every
   platform on its axis; which of them a round highlights is vwf's per-round
   rule, applied after it has filtered the entries by the project's
   platforms, not this skill's. Two overlapping on a platform is the
   checker's to refuse, not this skill's to resolve. A repo bundle never
   carries the key.
2. **The design tools.** List the folders of
   `${CLAUDE_PLUGIN_ROOT}/design-tools/` that hold a `tool.yaml` — the
   `skills/` folder beside them is the three generic role skills, not a
   tool. **Each is one `design`-axis entry**: the folder name is the slug,
   and the token `projects.<name>.design` holds; `name` and `summary` come
   from its `tool.yaml`. No design entry carries `default: true` or a
   `kind`.
3. **The addons.** Read `${CLAUDE_PLUGIN_ROOT}/assets/addons.yaml`. **Each
   item is one `addon`-axis entry**: its `name` is the slug and the display
   name, its `summary` the summary, and its `plugin`, `marketplace` and
   `repo` are copied as they stand — `/vwf:setup` declares a picked addon in
   the `claude` tool's `plugins.project` as
   `"<plugin>@<marketplace>" = "<repo>"` and runs `setup:ai`. An item whose
   `design_tools` list is not empty carries `needed_by`, naming those tools:
   "the claude-code design tool". No addon entry carries `default: true` or a
   `kind`.
4. Return the payload below. The `compose` block is present on **every**
   answer — it is the open entry, and it is what makes an empty bundle list
   read as a decision rather than a fault.

```yaml
plugin: stackgen
note: Bundles listed here are curated and their packs copied verbatim. Any
  combination no bundle covers can be COMPOSED — name its bootstrap tools
  and its knowledge packs, an item no pack covers as the ref
  <type>/<slug>@generated, and the first template fetch runs the generation
  pipeline for that ref (researched from current sources, Context7 first
  when Context7 is installed, else the official documentation and the
  package registries; instantiated against vwf's principles catalog, gated
  by review and your consent) directly into the repo's committed .claude/
  tree.
templates:
  - slug: <bundle filename without .md, design-tool folder name, or addon name>
    axis: <bundle frontmatter axis, design, or addon>
    kind: <bundle frontmatter kind> # assets/kinds.md — bundles only
    platforms: [ <platform> ] # project axis only
    tools: [ <bootstrap tool name> ] # bundles only — the bundle's tools:, [] when none
    name: <display name>
    summary: <one line>
    default: true # only when the bundle frontmatter carries it — omitted otherwise
    plugin: <plugin name> # addon axis only — equals the slug
    marketplace: <marketplace name> # addon axis only
    repo: <owner/repo> # addon axis only — the marketplace's repo
    needed_by: <what needs it> # addon axis only — omitted when nothing does
compose:
  verb: compose
  axes: [ project, backing, deploy, repo, cicd, stylesheet ]
  kinds: [ language-bundle, database, cloud-provider, capability-provider, ci-system, app-framework, deploy-target, stylesheet ] # the bundle kinds compose takes
  summary: Compose a repo bundle from bootstrap tools and knowledge packs;
    an item no pack covers is generated with principles-grounded skills and
    conventions. Explicit, reviewed, consent-gated — never a silent run.
```

**`kinds:` omits `workspace` deliberately**, and the omission is a recorded
decision rather than an oversight — an unstated gap here reads as one
either way, which is why it is written down. It is not generatable
**today** (`toolchain-manager` and `repo-gate` are no kind since 2026-09-26,
nor is repo hygiene since 2026-09-27; their files are
bootstrap's):

- **`workspace`** — newly minted. Generating one is untested capability, not
  preserved capability, and the open entry is a promise about the former
  only. Its three curated bundles cover the pnpm and bun shapes; an uncovered
  workspace ecosystem is a bundle to author, not a run to offer.

It is a `kinds.md` kind regardless, and may be added here once the
condition above stops holding.

**If no bundle exists** — `stacks/bundles/` and the repo's bundles both
empty — **return the bundle entries as none**, with the design tools, the
addons, the same `note` and the `compose` block — the open entry is what
makes an empty list read as a decision rather than a fault.

**The `stylesheet` axis answers like every other axis, and filters on
nothing.** Every `axis: stylesheet` bundle is an entry, the `compose` block
carries the open door, and vwf offers *defer this axis* the way it does on the
technology axes — a deferral is recorded `unresolved` and elicited again later.
vwf asks the round only of a project declaring a `site` or `webapp` platform,
and **that condition is vwf's, not this skill's**: filtering here would mean
reading the registry, which the rules below forbid, and for exactly this
reason — a menu that varied by project would be a second place for the
platform condition to live, and two places for one rule is how they disagree.

**The `addon` axis is the tools round, and it is multi-select.** Every
`addons.yaml` item is an entry — slug, name, summary, plugin, marketplace and
repo, none marked default, each with its `needed_by` note where it has one —
and the user picks any number of them, or none. The `compose` block's `axes`
leave `addon` and `design` out on purpose: an addon is a Claude plugin that
vwf's setup declares in the `claude` tool's `plugins.project` and installs
with `setup:ai`, and a design tool is one this plugin ships, not a technology
to research.

**A bundle whose packs are partly `@generated` is listed normally**, with
no warning and no asterisk. Mixing copied and generated components is the
dispatch rule working, and the lockfile records which was which; flagging it in
the menu would present a routine outcome as a defect.

## Composing a bundle

`/stackgen:stackgen-stack-menu compose:` writes a **repo bundle** for a
combination no shipped bundle covers. `/vwf:architecture` calls it; a bundle
is never mandatory, and a pick from the menu needs no call. The caller passes,
one per line beside the argument:

```yaml
slug: <kebab> # the bundle's slug — the template slug vwf pins
axis: project | backing | deploy | repo | cicd | stylesheet
kind: <bundle kind> # one of the compose block's kinds
platforms: [ <platform> ] # project axis only
tools: [ <bootstrap tool name> ] # no version
packs: [ <type>/<slug>@<version> | <type>/<slug>@generated ]
```

1. **Check the slug.** A slug a shipped bundle already holds is refused:
   return `ERROR: <slug> is a shipped bundle — pin it instead.` and write
   nothing. A repo bundle of that slug is rewritten. A `kind` outside the
   compose block's `kinds` is refused the same way, naming the kind.
2. **Check each tool** against `mise x -- bootstrap catalog --json`: a name
   that is not a `name` of its `data.tools` is refused. A failed call stops
   the verb with the envelope's `errors`, as bootstrap gives them, and
   nothing is written.
3. **Check each pack ref.** A `<type>/<slug>@<version>` ref must name
   `${CLAUDE_PLUGIN_ROOT}/stacks/<type>/<slug>/pack.yaml` at exactly that
   `version`. An `@generated` ref takes a pack type as its prefix, as a
   shipped bundle's does (`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`); it
   names an item no pack covers and is researched on the first template
   fetch. A refused tool or ref returns
   `ERROR:` naming each one, and nothing is written.
4. **Write** `.claude/stackgen/bundles/<slug>.md` at the root of the current
   repo: the frontmatter `name` (the slug), `axis`, `kind`, `platforms`
   where given, `tools` and `packs`, in the shape of
   `${CLAUDE_PLUGIN_ROOT}/assets/pack-format.md`'s bundle files, and a body of
   one heading and one sentence naming the tools and packs. It commits
   nothing: the file joins the caller's own commit.
5. **Return** one line, the slug.

## Rules

- **Bundles are exhaustive; composing is the only open door.** Never invent a
  bundle entry, and never present a composed or generated item as if it were
  a curated pack — the trust level differs and the user is choosing between
  them.
- Do not read the registry or `.config/vwf.yaml`. The one repo read is the
  repo's own bundles, `.claude/stackgen/bundles/`, and the one repo write is
  `compose:`'s; every other answer is the same in every product, and the
  dispatch happens in `/stackgen:stackgen-stack-template`, not here.
