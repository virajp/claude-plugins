---
name: repo-hygiene
version: 1.0.0
category: development
description: The repo's hygiene files — the sectioned ignore set, the editor
  and attribute defaults, the security contact and the dependency-update
  policy, the contributor guide and the editor baseline. Keep the sections,
  keep the why-comments, and never drop the local override patterns.
  Auto-applies when editing .gitignore, .graphifyignore, .editorconfig,
  .gitattributes, SECURITY.md, CONTRIBUTING.md, an issue form, an editor
  fragment or the Renovate config.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.gitignore"
  - "**/.graphifyignore"
  - "**/.editorconfig"
  - "**/.gitattributes"
  - "**/SECURITY.md"
  - "**/CONTRIBUTING.md"
  - "**/.github/ISSUE_TEMPLATE/*"
  - "**/.config/vscode.d/*.jsonc"
  - "**/.config/renovate.json"
  - "**/renovate.json"
---

# Repo hygiene

The files a repository needs before it has a stack. None of them runs, so none
of them is a gate — and each one is edited far less often than it is read,
which is why the shape below is worth preserving verbatim.

## `.gitignore`

**Sections are banners, and they stay.** Every entry lives under a
`# ==== <Name> ====` heading, and a new pattern joins the section it belongs
to rather than the end of the file. A stack's ignore set arrives as its own
appended banner; do not fold it into an existing section, and do not append a
pattern the file already carries.

**Keep the why-comments.** A pattern nobody can explain is a pattern nobody
dares delete, and the file grows forever. If you add a non-obvious entry, add
the line that says what it is.

**Never remove the toolchain manager's local-override patterns.** They cover
every path the manager loads a machine-local config from, and each one exists
because that path is real. Dropping one is how a local tool pin reaches a
review.

**A negation goes after the pattern it re-includes.** `!.env.example` under
`.env.*`. Reversed, git never applies it — and the failure is silent, because
the file simply stays ignored.

**A value never becomes an ignore entry.** If a secret was committed, the
answer is to rotate it; ignoring the file afterwards hides the next one too.

## `.graphifyignore`

A second reader, not a second `.gitignore`. This one says what the
code-intelligence graph does not ingest; the entry that ships is the graph's
own output directory, because ingesting it feeds the last run's summary back
in as source. In `.gitignore` the same directory is ignored *except* for
`GRAPH_REPORT.md`, which is prose about the graph and is worth diffing — the
negation goes after the pattern, as always.

## `.editorconfig`

The formatter is the authority for every file type it has a plugin for. This
file covers the rest, plus what an editor does *before* a formatter runs. Two
entries are not style preferences and should not be normalised away: Markdown
keeps its trailing whitespace (two spaces is a hard line break), and `Makefile`
keeps tabs (the syntax requires them).

## `.gitattributes`

Three jobs: normalise line endings, mark generated trees so review collapses
them and language statistics ignore them, and keep binaries out of both
normalisation and the diff. A `merge=<driver>` entry names a driver that some
tool registers elsewhere — the entry alone does nothing, and without the
registration git reports a conflict rather than resolving it, which is the
failure you want.

## `SECURITY.md` and `LICENSE`

Both are per-repo answers, not defaults. `SECURITY.md` names one private
channel; if the channel changes, this file is the only place that says so.
`LICENSE` is copied once, with the year and holder filled — editing the licence
body itself is not a hygiene edit, it is a relicensing decision.

## `CONTRIBUTING.md` and the issue forms

`CONTRIBUTING.md` is for someone changing the repository, and the readme is
for someone using it — a line that belongs in one does not belong in both.
What it must keep current: the setup command, the branch model, where the
commit scopes live, and the gate tasks. If a task is renamed, this file is one
of the places that goes stale silently.

`.github/` holds issue forms and their contact links and **nothing else**. A
workflow there is not a hygiene file, and this pack ships none.

## The editor fragment

`.config/vscode.d/repo-hygiene.jsonc` is a fragment, not the editor's settings
file: three keys — `settings`, `nesting`, `extensions` — merged with every
other pack's fragment into one marked block. Two rules hold it together.

**A key that names a tool belongs to that tool's pack.** A key present in two
fragments is not an error; it is a silent override decided by composition
order, so the only way to keep it legible is to keep the fragments disjoint.

**Every ignore file nests under `.gitignore`.** Whichever tool reads it — git,
the container build, the graph, the formatter — that is where someone goes
looking for it. Adding a new ignore file means adding it to that parent's
children in the fragment of whichever pack ships it.

## The dependency-update policy

The Renovate config is inert until a bot is enabled on the repository, so
treat it as a statement of policy: what gets grouped, how old a release has to
be before it is installed, and which managers are on. The minimum release age
matches the toolchain manager's own setting deliberately — change one and
change the other, or the two disagree about what "too new" means.
