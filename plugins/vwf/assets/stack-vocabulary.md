# Stack Vocabulary

The **shape of a language fact** — what vwf needs to know about any language,
and where it reads which languages a project has. vwf holds no list of
languages.
Frameworks and dependencies are open: any lowercase-kebab token is valid, because
no useful check exists for them beyond presence in a manifest.

## Languages — the project's linked bootstrap tools

**vwf names no language, and records none.** Since `config_format` 28 a
project's languages are not a key of `.config/vwf.yaml`: a language is a
**bootstrap tool of category `languages`** — `node`, `go`, `python` and the
rest of bootstrap's catalog — whose `projects` list names the project, and the
project's package manager is a bootstrap tool of category `package-managers`
linked the same way. vwf reads both with `bootstrap describe --json`, run in
the repo that holds the project — `projects.<name>.repo`, else the base repo
(`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`): the `data.tools`
entries of those two categories whose `projects` list names it. A failed
`bootstrap` call is a refusal, with bootstrap's error text. `bootstrap detect
--add` writes the links; `bootstrap add tool <t>` adds a missing tool.

The language's name is the **tool name**, everywhere vwf uses one: the
per-language checks of `/vwf:doctor` walk the linked tools by that name. This
file defines only what a language fact consists of:

| Field        | Means                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| name         | The bootstrap tool name, of category `languages`                         |
| LSP plugin   | The plugin whose `lspServers` covers the language — for a materialized stack, stackgen's generated `vwf-tools` |
| manifest     | The file whose presence identifies a project of that language           |
| toolchain    | The bootstrap tool itself, which pins it                                 |

Any of these may legitimately be absent, and no absence among them is a failure.
A language with no LSP in this marketplace is reported as *unavailable here*
rather than *missing*, because there is no install command to suggest.

**A project with no linked language tool is drift.** `/vwf:doctor` reports it
as a **degraded** row, with the fix `bootstrap add tool <t>` or
`bootstrap detect --add` (a form: the real tool name follows
`## Passing values` of `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`);
a degraded row never stops `/vwf:execute`. A project
whose platforms are **all** `iac`, `cicd` or `misc` needs no language tool and
gets no row.

**There is no `unknown` language any more.** Until format 28 a token was
*known* only when the project's pinned template listed it under
`language_facts` or `optional_languages`, and an unlisted one was the
`unknown` finding. A template's tokens and bootstrap's tool names are
different vocabularies that cannot be compared, so that check is gone — from
`/vwf:doctor`, from `/vwf:setup` and from `/vwf:execute`'s start. Since the
stack plugin's bundles name bootstrap tools, a template carries no language
facts at all.

## A bundle's tools, and the knowledge that follows them

**A bundle's tools are bootstrap tool names.** A bundle — what a stack pin
names — lists the tools it needs under `tools:`, each a name of
`bootstrap catalog --json`, with no version: the version is bootstrap's pin.
`/vwf:setup` adds each missing one and links it to the project; from then on
the project's languages are read from the links as above, never from the
bundle.

**Tool knowledge follows the linked tools.** The skills and conventions
written for a tool land because the project links that tool (or the bundle
names it), never because anyone picked them from a menu: there is no menu
entry for them, and vwf names none.

## The eight axes

A stack is **composed from eight independent templates** — `project | backing |
deploy | repo | design | cicd | stylesheet | addon` — not one monolith. Each axis
answers a different question, and a project's `.config/vwf.yaml` answers each one
(the first three in its `stack` block — `template`, `services` and `deploy` —
the `repo` axis as `repo.stack.template`, the three tool axes as `design`,
`cicd` and `stylesheet` pins, and `addon` as the top-level `addons:` list, one
per product, absent or `[]` meaning no optional tool):

| Axis           | Scope       | Cardinality           | Owns                                                    |
| -------------- | ----------- | --------------------- | ------------------------------------------------------- |
| **project**    | per project | one                   | Language, framework, source layout, testing             |
| **backing**    | per project | a list (one per capability) | Datastore, identity, queue, storage, the local stack    |
| **deploy**     | per project | a list (one per delivery mechanism, since `config_format` 16) | Build artifact, release pipeline, hosting, environments |
| **repo**       | per repo    | one                   | Task runner, lint/format, workspace                     |
| **design**     | per project | one                   | The design tool and its adapter, for screen platforms   |
| **cicd**       | per project | one                   | The CI system that builds and releases the project      |
| **stylesheet** | per project | one                   | The stylesheet approach and how the design-system tokens are realized, for `site` and `webapp` platforms |
| **addon**      | per product | a list (any number, or none) | The optional tools the product picked, none preselected |

The templates themselves live in the **stack plugins**, never in vwf
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`). Since config_format 13 every
axis but `repo` is pinned **per project** — a product may run its site on one
cloud and its API on another — and `addon`, added in `config_format` 25, is the
product's.

**An axis may also be unanswered.** Since `config_format` 16 any of the seven
other than `addon` may read `unresolved` — deferred rather than decided
(`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states"); `addons:`
is always a list and never holds it. The
axes stay independent under deferral too: one may be pinned while the other
three are not, and nothing infers one from another. Deferral costs the doc
surfaces nothing and costs `plan` and `execute` everything — they have no
`conventions:` prose to read, so they halt.

The split exists because these vary **independently**: one service framework
runs against any datastore, on any host. Folding them into one document is what
made the old templates specific to a single product while their frontmatter only
ever declared the language and framework.

The axes are genuinely orthogonal, so nothing merges and no precedence rule is
needed. Where one axis must refer to another it names the *axis*, not a vendor —
a project template says "the identity provider the backing axis selects", never
a provider by name.

## What vwf contracts of a template

**Every payload declares `axis:`**, whichever axis it is on — that key is what
says which menu it joins. A project-axis payload carries `platforms:`
*alongside* `axis:`, never instead of it: the platform list is real data, but
it is not the axis.

A stack plugin's template files are its own business — their layout, their
frontmatter and where they sit in the plugin's tree are not vwf's to describe.
What vwf contracts is the **payload** `stackgen-stack-template` returns for a
slug, whose keys are listed in the template-payload section of
`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`.

A template's **conventions** prose reaches `/vwf:plan` and `/vwf:execute` as
the `conventions:` field of that payload — neither reads a template file, and
the config block records only which template was picked, never what it says.
The fetch rule (deduped by slug, once per run, a failure halts) is *Resolving
the conventions* in `${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`.

Nothing in `docs/blueprint/` ever reads it, and nothing should: the prose names
technology, which is exactly what a blueprint doc may not.

## Frameworks vs dependencies

Within a project template these two fields are both open, and the distinction
only matters for how doctor checks a project — so keep it mechanical:

- **`frameworks`** — what the code is *written against*, and what shapes its
  file layout. Removing one means rewriting the project.
- **`dependencies`** — libraries the project *uses*. Removing one means losing a
  feature, not restructuring.
- Neither is exhaustive. Record what a new engineer needs to know before opening
  the repo; the manifest is the complete list and always wins on detail.

## What is deliberately absent

There is no "recommended" or "default" marker on any template. vwf ships a menu:
`/vwf:architecture` presents every template for a project's `role` and the user
picks. There is **no free-text escape hatch** — no *other (describe)* option, and
`template: custom` is not a value the config accepts (retired in
`config_format` 14). An axis for which no installed plugin ships a fitting
template has **three ways forward, never a free-text pin**: install the stack
plugin that has one, write it
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`, "Writing a stack plugin"), or
**defer the axis** — record `unresolved` and carry on defining the product
(`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states"). Before
`config_format` 16 only the first two existed, so an empty menu was a halt; the
third is what makes it a postponement instead.

That refusal is the point. A `custom` pin recorded a stack vwf had no template
for — so no `conventions` prose for `plan` and `execute` to read, and no
`harness` block for `/vwf:doctor` to check — and the pipeline ran on with those
inputs missing and said nothing. Closing it makes the menu the whole vocabulary,
and makes adding to it a plugin rather than a config value.

**`unresolved` is not `custom` returning.** `custom` asserted a stack, and the
pipeline then ran against inputs that did not exist while saying nothing — that
is what made it dangerous. `unresolved` asserts the opposite: that no stack has
been chosen, which is why `plan` and `execute` refuse rather than proceed. One
was a silent hole in a closed menu; the other is the hole named out loud.
