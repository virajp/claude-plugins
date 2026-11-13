# Stack Vocabulary

The **shape of a language fact** — what vwf needs to know about any language,
and what it does when the pinned template lists none. vwf holds no list of
languages.
Frameworks and dependencies are open: any lowercase-kebab token is valid, because
no useful check exists for them beyond presence in a manifest.

## Languages — closed to what the installed plugins declare

**vwf names no language.** A language token is whatever a stack template
declares, and the facts `/vwf:doctor` checks are supplied by the
**pinned template** that lists it, never by a table here. This file defines only
what such a fact consists of:

| Field        | Means                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| token        | The lowercase-kebab name the template's `languages:` frontmatter carries |
| LSP plugin   | The plugin whose `lspServers` covers the language — for a materialized stack, stackgen's generated `vwf-tools` |
| manifest     | The file whose presence identifies a project of that language           |
| toolchain    | The mise tool that installs it, where mise manages one                   |

Any of these may legitimately be absent, and no absence among them is a failure.
A language whose toolchain does not come from mise has none; a language with no
LSP in this marketplace is reported as *unavailable here* rather than *missing*,
because there is no install command to suggest.

**What is not open is the set of tokens.** vwf holds no list: the template its
project pins **is** the list. A token is **known** only when that pinned,
materialized template lists it, under `language_facts` or
`optional_languages`; no installed plugin is read. A token it does not list is
reported as `unknown`. **`/vwf:setup` stops on it**: setup is the one-time
place for the setup-shape checks. `/vwf:doctor` and `/vwf:execute` only report
it, as a **degradation** — `/vwf:execute` asks the user whether to continue or
stop on it.

**Why setup stops rather than degrading.** vwf is an opinionated workflow
— it plans against a template's conventions, builds against its harness, and
gates a UI slice on its UX contract. A language no template lists supplies none
of those, so a run against it loses every one of those guarantees *while
reporting itself healthy*. That is worse than a refusal, because the run looks
exactly like every other run. The menu is deliberately closed: many options, all
of them defined by a template here. "Works with anything" is not a goal vwf has.

Adding a language means **a template that lists it**, whose facts supply the
rows this file used to hardcode. It does not mean editing vwf. Until the
project's pinned template lists it, `/vwf:setup` declines the repo rather than
half-running against it.

**Where the facts come from.** A template is read as materialized into the repo
(the materialized-template variant in
`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`): a language is **known** when
the project's pin resolves to a materialized template whose payload lists the
token. Under **`language_facts`** it carries the facts for that token — how the
LSP is provided, the mise tool, the manifest, and the optional `binaries` —
executables the stack needs on `PATH` that mise does not manage, absent
meaning none, each a bare name or a `{ name, probe }` map whose probe must
exit 0 — four language facts in all, emitted into the template when it was
materialized. Beside them the payload may carry one fact that is not per
language: `lockfile:`, where the package manager's lockfile may sit — five
facts in all. A token listed only under **`optional_languages`** is known but
carries no facts of its own, so its rows read *unverified* rather than passing.
`/vwf:doctor` verifies the repo against those facts, and `n/a` in a fact is an
answer, not an absence. The facts entered the config through a consent-gated
materialization, not through free text. A token the pinned template lists under
**neither** key stays `unknown`, whatever plugin is installed.

**Setup stops on unknown, but only once the project has a stack.** Since
`config_format` 16 a project's `template` may read `unresolved` — deferred, not
yet chosen (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis
states"). A project in that state records `languages: []` and there is no token
to be unknown; if it carries tokens anyway, an unlisted one is a **degradation**
even to setup, because the template that would list it is exactly what has not
been chosen yet. The moment the project axis is pinned, the rule reverts:
`setup` stops on it. `doctor` and `execute` report it as a degradation either
way, and `execute` asks continue or stop. Setup's rule follows the pin, never
the calendar.

## The eight axes

A stack is **composed from eight independent templates** — `project | backing |
deploy | repo | design | cicd | stylesheet | addon` — not one monolith. Each axis
answers a different question, and a project's `.config/vwf.yaml` answers each one
(the first four in its `stack` block, the three tool axes as `design`, `cicd` and
`stylesheet` pins, and `addon` as the top-level `addons:` list, one per product,
absent or `[]` meaning no optional tool):

| Axis           | Scope       | Cardinality           | Owns                                                    |
| -------------- | ----------- | --------------------- | ------------------------------------------------------- |
| **project**    | per project | one                   | Language, framework, source layout, testing             |
| **backing**    | per project | a list (one per capability) | Datastore, identity, queue, storage, the local stack    |
| **deploy**     | per project | a list (one per delivery mechanism, since `config_format` 16) | Build artifact, release pipeline, hosting, environments |
| **repo**       | per repo    | one                   | Package manager, task runner, lint/format, workspace    |
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
