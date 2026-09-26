# Repo hygiene — conventions

The files a repository needs **before** it has a stack. Nothing here runs, so
nothing here is a gate: this is the ignore set, the editor and attribute
defaults, the licence and the security contact, and the dependency-update
policy — the four topics of the `repo-hygiene` bar in stackgen's kind
vocabulary.

This bundle is **unconditional**: there is exactly one pack for the slot, so
nothing is picked and nothing is recorded in `.config/vwf.yaml`. It is fetched
by the fixed slug `repo-hygiene`, the way `mise` and `repo-gates` are.

## What this pack writes

| Lands at              | Is                                                      |
| --------------------- | ------------------------------------------------------- |
| `.gitignore`          | the sectioned base; stack sections are appended to it   |
| `.graphifyignore`     | what the code-intelligence graph does not ingest        |
| `.editorconfig`       | the shape defaults a formatter has no plugin for        |
| `.gitattributes`      | line-ending normalisation, generated trees, binaries    |
| `CONTRIBUTING.md`     | setup, the branch model, commits, the gates             |
| `.github/ISSUE_TEMPLATE/` | the bug and feature forms, and the two contact links — **conditional**, `forge: github` |
| `renovate.json`       | the dependency-update policy — at the root, where Renovate reads it — **conditional**, `update_bot: renovate` |
| `.config/vscode.d/repo-hygiene.jsonc` | the editor baseline every other fragment sits on — **conditional**, `editor: vscode` |
| `SECURITY.md`         | the private report channel — written only when asked for |
| `LICENSE`             | one of `_licenses/`, **copied by the initializer**      |

Three of these are **conditional**: `pack.yaml`'s `conditional:` list names
each with the one answer the initializer already holds that lands it — the
forge the origin resolves to, the update bot the repo runs, the editor in use
— and the materializer skips the file where the answer differs. A GitLab repo
gets no GitHub issue forms, a Dependabot repo no Renovate policy, a repo
edited elsewhere no VS Code fragment. Everything else in this pack lands
unconditionally.

Most of these sit at the repo root, which is the whole of the exception list —
everything a repo configures otherwise lives under `.config/`. The allowlist
names what may **sit** at a shaped repo's root, and it has two tiers. A pack
may land `.gitignore`, `.graphifyignore`, `.editorconfig`, `.gitattributes`,
`.npmrc`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `readme.md`,
`fnox.toml`, `eslint.config.mjs`, the linter's root shim, `dprint.json`, the
formatter's — because each of those two discovers its config only at the
root — `wrangler.jsonc`, which wrangler discovers only at the root,
`renovate.json`, because Renovate's discovery is root-first
(`renovate.json`, then `.github/`, `.gitlab/`, `.renovaterc`) and never
`.config/`, and the directory `.github/` **with `.github/workflows/` refused
inside it**. Two more may sit at that root but are **vwf's — no pack lands
them**: `CLAUDE.md`, which the workflow merges its own section into, and
`mempalace.yaml`, which the memory mine discovers at the root and nowhere
else. A language's manifests and lockfiles are **not** on the list at all —
a manifest is fenced out, and a lockfile is its shadow. A tool that merely
*prefers* the root is configured under `.config/` and pointed at from the
command line. Both tiers are stackgen's root-allowlist doctrine, stated in
its output-tree contract and enforced there by the materializer; this list
restates that contract and adds nothing to it.

**`config/_licenses/` is the one path in this tree that is NOT copied into a
repo.** It is a two-file catalogue the initializer reads: it asks which
licence the repo takes, copies that one file to `LICENSE`, and fills the
placeholders. A repo ends up with `LICENSE`, never with `_licenses/`.

## The gitignore section rule

Every section is a `# ==== <Name> ====` banner and its entries, and each
entry that is not self-evident carries a one-line why above it. Three rules
hold the file together:

- **Sections are appended, never interleaved.** The initializer appends a
  stack's ignore file from `github/gitignore` as its own banner at the end,
  and appends nothing whose pattern the file already carries. A repo that
  already has a `.gitignore` keeps it whole: the initializer merges **section
  by section**, appending each banner section of this base whose patterns
  are not already present, and compares patterns **normalised** — a leading
  `/` and a trailing `/` stripped, a `**/` prefix ignored, blank and comment
  lines skipped — so a pattern the file carries under another spelling is
  never doubled.
- **The mise local patterns are load-bearing.** They cover every path mise
  loads a local override from; dropping one is how a machine-local pin ends
  up in a review.
- **A negation follows the pattern it re-includes.** `!.env.example` after
  `.env.*`, never before, or git never sees it. The `graphify` section is the
  second case: `graphify-out/*` then `!graphify-out/GRAPH_REPORT.md`, because
  the graph is rebuilt locally but its report is prose worth diffing.

**`.graphifyignore` is a different file for a different reader.** `.gitignore`
says what git does not track; this one says what the code-intelligence graph
does not ingest, and its one shipped entry is the graph's own output — feeding
the last run's summary back in as source. Both live at the root and nest under
`.gitignore` in the editor, which is the grouping rule below.

### Which template a detected language takes

The initializer's **stack read** names the template — the languages it learned
from the repo's pins, else its lockfile's components, else the manifests it
found at the root and in each sub-project directory — and the read is the
only input: a file that merely happened to be in the tree names nothing. The
read passes the **pinned secrets provider** as a component too, so a provider
row below resolves the same way a language row does. Every language name
below resolves at
`https://raw.githubusercontent.com/github/gitignore/main/<Name>.gitignore`,
and each was fetched to confirm it does; a provider row names no template —
its section is the pattern in the cell, under a banner named for the slug.

| Language | Template appended                                     |
| -------- | ----------------------------------------------------- |
| node     | `Node.gitignore`                                      |
| python   | `Python.gitignore`                                    |
| dart     | `Dart.gitignore`, plus `Flutter.gitignore` on Flutter |
| go       | `Go.gitignore`                                        |
| rust     | `Rust.gitignore`                                      |
| swift    | `Swift.gitignore`                                     |

| Provider | Section appended                                                              |
| -------- | ----------------------------------------------------------------------------- |
| fnox     | `fnox.local.toml` — the machine-local override; `fnox.toml` beside it is committed |
| doppler  | `.doppler/` — the CLI's per-checkout scope, which its pack says is ignored    |

The provider rows are why the base `.gitignore` names no secrets manager: a
repo that picked doppler has no `fnox.local.toml` to ignore, and an ignore
line for a tool the repo does not run is a line nobody can explain. A provider
absent from this table keeps nothing machine-local in the tree and needs no
row.

The language keys are the read's own vocabulary, so a pin and a manifest
resolve alike: `package-manager/pnpm` and `language/typescript` are both
`node`, as is a `package.json` in a repo that has pinned nothing yet, and the
three name **one** `# ==== Node ====` section — the append rule is per
section, not per source. A Flutter repo is `dart` with the
`app-framework/flutter` pack pinned and gets both templates: the Dart one
covers the package tooling, the Flutter one the app build output above it.

Swift resolves the same way. The `swift` language token, the
`swift-package` and `swift-swiftui` slugs, and a `Package.swift` or a root
`*.xcodeproj` directory the read finds are all `swift`, and name **one**
`# ==== Swift ====` section — appended, never proposed. A Swift repo's
generated trees — SwiftPM's `.build/`, Xcode's `xcuserdata/` — are upstream
`Swift.gitignore`'s, so a SwiftUI app with its committed Xcode project needs
no pattern beyond the template. `swift` as the Flutter pack's `platform-edge`
token names no section: that repo is `dart`, and `Flutter.gitignore` covers its
iOS host.

A language absent from this table, or a pin that names no language, has **no
row and needs none**. `language/bash` and `language/markdown` have no template
upstream at all; `framework/effect` is Node, already appended for the language
that pins it; and the mise base `stackgen:tool-config` lands, the toolchain
gates, `datastore/postgres`, `ci-system/github-actions`, the cloud packs, the
deploy targets and the design tools write nothing an ignore file has to learn
— the base sections already cover them. Absence here is an answer, not an
omission.

**A detected language with no row is proposed, never guessed.** The
initializer names the template it would fetch and waits for a yes; a wrong
name is a 404, and a 404 is a section that silently never lands. Once
confirmed, the row belongs in this table.

**The seam with secret scanning.** Ignoring a file and allowlisting it are two
different acts, and this file only does the first. A secret that is ignored is
a secret that was never scanned — so an ignore entry is never the answer to a
scanner finding, and an entry added because "the scanner keeps complaining" is
the one edit to refuse. The allowlist belongs to the scanner's own config, by
fingerprint.

## The editor baseline

The editor is set up by the same composition that sets up everything else. No
pack ships a whole `.vscode/settings.json`; each ships a fragment at
`config/.config/vscode.d/<pack>.jsonc` — `settings`, `nesting`, `extensions` —
and the initializer merges them into the editor's two files inside one marked
block, with hand-written keys after the block winning. The convention is
stackgen's pack format.

**This pack's fragment is the baseline the others sit on**: the nesting map,
the three exclude lists, the editor-wide keys that name no language and no
tool, and every extension no other pack owns. Its organising rule is the
user's: *"all ignore files are ideally grouped under gitignore; logic being
that my brain thinks gitignore when we talk about any ignore files and then I
expand it to find the one I am looking for."* So the `.gitignore` parent
collects every ignore file any pack ships — `.dockerignore`, `.graphifyignore`,
`.prettierignore` — alongside `.gitattributes` and `.gitmodules`.

A key that names a tool belongs to that tool's pack, not here — and so does an
extension id. The baseline is conditional on the editor alone — never on a
stack — so anything it recommends reaches every repository that uses the
editor, including the one that pinned the alternative; an
extension for a framework, a language or a tool is that pack's fragment's to
recommend. A duplicated key is not an error, it is a silent override decided
by composition order, so keeping the fragments disjoint is the whole
discipline.

## Contributing and the issue forms

`CONTRIBUTING.md` is developer-facing and repo-neutral: setup in one command,
the branch model in three lines, where the commit types and scopes live, the
gate tasks, and the pointer to `SECURITY.md` for a vulnerability. It says
nothing the readme should say — a user who is not changing the repo has no
reason to open it.

`.github/ISSUE_TEMPLATE/` carries a bug form, a feature form and `config.yml`,
which turns blank issues off and points at the docs and the private advisory
channel. **Nothing else goes under `.github/`** — a workflow is the CI pack's,
and the initializer lays none down.

## The placeholder vocabulary

Three, and no others. The initializer fills them; nothing else in this pack
uses a placeholder, so a `<` in a shipped file is one of these or a bug.

| Placeholder  | Filled with                                                  |
| ------------ | ------------------------------------------------------------ |
| `<REPO_URL>` | the repository's web URL, no trailing slash                  |
| `<YEAR>`     | the year the licence is first applied                        |
| `<HOLDER>`   | the copyright holder — a person or the legal entity          |

One position reads differently: in `SECURITY.md` the same `<REPO_URL>` token
stands alone on its own line and is filled with the **security contact the
initializer was given** — an advisory URL or an email — never with the repo
URL plus a suffix, so the file reads the same whichever shape the contact is.
The issue forms' "Report a vulnerability" link is the same slot: its `url:` is
the bare token, filled with the contact when the contact is a URL — and the
whole entry is **removed** by the initializer when the contact is an email or
was declined, since a contact link there must be a web address. The
"Documentation" link above it keeps the repo URL, as everywhere else.

## Licence and security contact

**Both follow the repository's visibility, and both are asked, never
assumed.** The initializer asks whether each repo is public or private first,
and the two files take their shape from the answer.

A **public** repo is offered a licence — MIT or Apache-2.0: permissive either
way, differing in whether the grant is explicit about patents and about what a
contributor is contributing — or none. Declining gets no `LICENSE` file, which
is a legible answer — "all rights reserved" — and not the same as a licence
chosen by a tool on the author's behalf. A **private** repo is offered no
licence and gets no `LICENSE`: a grant to the public has no reader there.

`SECURITY.md` is the same call, with the contact shaped by visibility: a
public repo's default is its forge's private advisory page; a private repo is
asked for a contact of its own — an email or an internal URL — with no
default. Either shape fills the one position in the template. A repository
with no private channel to point at is better off with no file than with one
naming a channel nobody watches, so declining the contact writes no file
whichever the visibility.

## Dependency updates

`renovate.json` is a policy, not an installation — nothing here adds a bot to
the repository, and the file is inert until one is enabled on it, which is why
it lands only where the initializer's update-bot answer is `renovate`. It sits at
the repo root because that is the first path Renovate's config discovery
reads; under `.config/` it is a file the bot never opens. What
it encodes: the recommended baseline, minor and patch grouped into one pull
request, weekly lockfile maintenance, and a **ten-hour minimum release age**,
which is the same number the toolchain manager pins its fuzzy resolution to.
The two are one decision — a version too new to have been withdrawn yet is not
a version this repo installs — so they move together.

Two managers are enabled by name. The mise manager reads the toolchain
manager's config files (including `.config/mise/conf.d/*.toml`, which is where
a secrets provider declares its tool) and is on by default; the pre-commit
manager is **off** by default and has to be asked for, or the hook revisions
are the one pinned set nothing updates.

**Renovate's own config discovery does not include `.config/`.** That is why
this file is the one policy that lands at the root rather than under
`.config/`: Renovate reads `renovate.json` first, then `.github/`,
`.gitlab/` and `.renovaterc`, and never `.config/`. A repo that already
carries a policy under one of those names — `.github/renovate.json`,
`.renovaterc` — keeps it: the repo's file wins, this pack's copy is not
landed, and the initializer reports that it was not.
