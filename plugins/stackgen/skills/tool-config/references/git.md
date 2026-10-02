# git — what git ignores, and how it treats a path

Two files tell git how to treat the tree, and every repo needs both before it
has a stack. `.gitignore` says what git never tracks: machine state, build
output, a secret's file. `.gitattributes` says how it treats what it does:
line endings, which files are generated, which are binary. Both sit at the
repo root, because git reads them nowhere else.

This reference is the `git` row of the skill's tool table. The contract every
tool shares — the argument shapes, the block markers, drift, removal and the
lock record — is [the skill's](../SKILL.md); what follows is git's own. The
files it lands are under `${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/git/`,
laid out as they land under the repo root.

| Section                                                 | Read before                                         |
| ------------------------------------------------------- | --------------------------------------------------- |
| [1. What `all` lands](#1-what-all-lands)                | running `all`, or reading what it landed            |
| [2. The verbs](#2-the-verbs)                            | any instruction naming `git`                        |
| [3. The ignore file's rules](#3-the-ignore-files-rules) | writing any line into `.gitignore`                  |
| [4. Templates](#4-templates)                            | `add ignore template=`, or mise's `upgrade`         |
| [5. The migration](#5-the-migration)                    | running `all` on a repo the old hygiene pack shaped |

## 1. What `all` lands

| Landed           | As                                  |
| ---------------- | ----------------------------------- |
| `.gitignore`     | the frame, then one `git` block     |
| `.gitattributes` | the frame, then one `git` block     |

**The ignore base** is one block holding seven banner sections — macOS,
editors, AI tooling, mise, secrets and env, scratch, reports — each banner and
its why-comments kept inside the block. The mise patterns are load-bearing:
they cover every path mise loads a local override from, and the local lock it
writes beside one, and dropping one is how a machine-local pin ends up in a
review. They are bare file names — `mise.local.toml`, `mise.*.local.toml`,
`.mise.local.toml` — which match at any depth, plus `**/mise.local.lock`, the
one lock line; only `.config/mise/config*.local.toml` and
`.config/mise/conf.d/*.local.toml` are spelled out, since their file names do
not start with `mise`. graphify's lines are not here: the `graphify` tool asks
for them as its own block ([its reference](graphify.md)), so they land after
this one.

**The attribute base** is the lines every repo takes whatever its stack:
`* text=auto eol=lf`, `*.lock linguist-generated`, and the binaries as
`-text -diff`. A lockfile whose name does not end in `.lock` is its pack's to
mark, through [`add attribute`](#add-attribute) — pnpm's `pnpm-lock.yaml`,
SwiftPM's `Package.resolved`. No mise lock exists, so mise needs no line.

**The keys it reads**: none. It lands both files whatever `all` is given.

## 2. The verbs

| Instruction                        | Writes to                                |
| ---------------------------------- | ---------------------------------------- |
| `add ignore <pattern> …`           | `.gitignore` — the requester's block     |
| `add ignore template=<Name>`       | `.gitignore` — the requester's block     |
| `add attribute <pattern> <attr> …` | `.gitattributes` — the requester's block |
| `remove <requester>`               | every git file holding its blocks        |

A pack's `tool-config:` list may carry both ignore forms, in the order it
wants them written — the template first, its own patterns after.

### `add ignore`

`add ignore <pattern> …` writes each pattern, in the order given, into the
requester's block. A pattern is one git ignore line — a glob, a directory with
its trailing `/`, a `!` negation — holding no space. `add ignore
template=<Name>` fetches `<Name>.gitignore` from github/gitignore
([section 4](#4-templates)) into the requester's block. Both are filtered by
[the no-doubling rule](#3-the-ignore-files-rules) before they are written.

### `add attribute`

```text
add attribute <pattern> <attr> … [for <requester>]
```

writes `<pattern> <attr> …` as one line in the requester's block —
`git add attribute pnpm-lock.yaml linguist-generated for pnpm`. A pattern
another line already gives the same attributes writes nothing and is noted; a
pattern given a different value for the same attribute is a **conflict row**,
`keep-existing` or `overwrite`. A requester's entries are written sorted, as
every block's are; the `git` base keeps its asset's grouped order, each group
under its why-comment.

## 3. The ignore file's rules

**Entries keep written order, never sorted.** This is the one exception to
[the skill's](../SKILL.md#blocks) sorted-block rule, and it holds for every
block in `.gitignore`: git reads the file top to bottom and the last match
wins, so a negation works only after the pattern it re-includes —
`!.env.example` after `.env.*`, never before. A sort would silently undo it.

**Nothing is written twice.** Before a call writes, each incoming pattern is
compared with every pattern the file already carries — the base, every block,
the user's lines — **normalised**: a leading and a trailing `/` stripped, a
`**/` prefix ignored, blank and comment lines skipped. So `/node_modules/`,
`node_modules` and `**/node_modules/` are one pattern. A non-negation pattern
the file already carries is not written again; the line written is always the
incoming spelling, since normalisation decides equality and writes nothing. A
pattern another requester's block holds is [shared](../SKILL.md#blocks) and
recorded as `ignore[<pattern>]` under `shares:`, so its removal moves it into
the next sharer's block at the place that sharer's call put it. A negation is
always written: it lands after the pattern it re-includes, whichever block
holds that. The rule holds within one call too: a pattern a template repeats
is written at its first place only.

**A requester's block holds only its calls' lines** — its template's first,
then its own patterns. A fetched template's line that ignores a lock file is
not written, as the lock rule below says, so no pack negates a lock file. A
template carries its comments and blank lines inside the block, trimmed at
either end; a pattern call carries the patterns alone. After filtering, a
comment run left with no pattern below it before the next blank line is
dropped, and a run of blank lines is collapsed to one. Every template line
loses its trailing whitespace before it is written and hashed, as the commit
gate's trailing-whitespace hook would strip it anyway.

**No fetched line re-includes a secret.** A template's negation whose
pattern, normalised, the `git` base's secrets section ignores — `.env`,
`.env.*`, `*.pem`, `*.key`, `*.p12` — or matches one of them, is not
written: it is a **conflict row** naming the line and the upstream commit,
`keep-existing` (the line is dropped) or `overwrite` (written, on the
person's word). `!.env.example`, the base's own, is the one negation it
leaves alone.

**No fetched line re-ignores what must be tracked.** A template's positive
pattern that matches a path the `git` base negates — `.env*` over
`.env.example` — is the same **conflict row**, in the same shape:
`keep-existing` drops the line, `overwrite` writes it on the person's word. A
line the requester's own negation, later in its block, already re-includes the
path for is no conflict and is written.

**Lock files are tracked.** No lock file is ignored but `mise.local.lock`,
which the base's one lock line, `**/mise.local.lock`, ignores at any depth.
A line ignores a lock file when it is no negation and its last segment, a
trailing `/` stripped and read as a glob, matches a file name ending in
`.lock` but not in `local.lock`, or the directory name `locks` — so `*.lock`
and `pubspec.lock` do, and `**/mise.local.lock` does not. No mise lock
exists, so no line is held to account for one. When `all` lands, on a fresh
repo or a reshape, it scans every line of `.gitignore` — a template's line in
any block, and the user's lines outside every block — and raises one **delete
row**, answered `ok`, per line that ignores a lock file. On that answer `all`
removes the line, from its block or from the user's lines
([the skill's rule](../SKILL.md#blocks)). `/vwf:init` shows these rows from
`preview all` in its one consent, and `all` applies them before init's lock
step. A template fetched later is filtered the same way: its lock-ignoring
line is not written, and the preview shows it as the same delete row. No
negation line is written for a lock file.

**Ignoring is not allowlisting.** A secret that is ignored is a secret that was
never scanned, so an ignore line is never the answer to a scanner finding, and
one added because "the scanner keeps complaining" is the one call to refuse.
The allowlist is the scanner's own, by fingerprint —
[gitleaks'](gitleaks.md#2-the-allowlist).

## 4. Templates

**A template is fetched, never frozen.** A copy shipped here would age the
moment a language renamed a build directory, and a stale ignore line fails by
being silently absent from a diff. **It is pinned by commit**, so a re-run is
reproducible: the first fetch resolves github/gitignore's `main` with
`git ls-remote https://github.com/github/gitignore main`, fetches
`https://raw.githubusercontent.com/github/gitignore/<sha>/<Name>.gitignore`,
and records the SHA against the block in the lock, with a hash of the block
exactly as it was written. **Every re-run that writes or rewrites a template
block fetches it at the pinned SHA, never at `main`** — a `take-theirs`
answer, a shared entry moving in, a block deleted by hand and landed again —
so a re-run reproduces the block, and a block that differs from it is a real
local edit: drift, shown as the skill says. The `written:` hash is how that
difference is tested — the block against what was last written, so another
block's or a user line's change is never drift — and it is re-recorded on
each write. Only the skill's one upgrade verb,
[mise's `upgrade`](mise.md#4-the-verbs), moves it: inside that call's consent
it resolves `main` once, re-fetches every template a block holds at that
commit, shows each changed block as a row beside its old content, and on the
rows' approval rewrites them and moves each recorded SHA.

```yaml
- path: .gitignore
  source: tool-config/git@<stackgen version>
  hash: <content hash after the write>
  blocks: [git, graphify, pnpm, gitignore:Go]
  templates: # the template each block holds, at the commit it was fetched
    pnpm: { Node: <sha>, written: <block hash> }
    gitignore:Go: { Go: <sha>, written: <block hash> }
  shares:
    "template[Node]": [pnpm, typescript]
```

**A template several requesters ask for is written once**, in the first
asker's block, and recorded as `template[<Name>]` under `shares:`; its
removal moves it to the next sharer, and only the last one takes it out.

**Which pack asks which template.** A language pack asks for its language's
template in its own `tool-config:` list:

| Language | Template            | Asked by                            |
| -------- | ------------------- | ----------------------------------- |
| node     | `Node`              | `pnpm`, `typescript`                |
| python   | `Python`            | `uv`                                |
| dart     | `Dart`, `Flutter`   | `pub`; `flutter` adds `Flutter`     |
| swift    | `Swift`             | `swift`, `swiftpm`, `swiftui`       |
| go       | `Go`                | no pack — the fallback              |
| rust     | `Rust`              | no pack — the fallback              |

A secrets provider that keeps something machine-local asks for the pattern
itself — fnox `fnox.local.toml`, doppler `.doppler/` — so a repo never
carries an ignore line for a tool it does not run.

**The language keys are the stack read's own vocabulary**, so a pin and a
manifest resolve alike. `package-manager/pnpm` and `language/typescript` are
both `node`, as is a `package.json` in a repo that has pinned nothing yet, and
the three name **one** `Node` template — a template is per name, not per
source. A Flutter repo is `dart` with the `app-framework/flutter` pack pinned
and gets both templates: the Dart one covers the package tooling, the Flutter
one the app build output above it.

Swift resolves the same way. The `swift` language token, the `swift-package`
and `swift-swiftui` slugs, and a `Package.swift` or a root `*.xcodeproj`
directory the read finds are all `swift`, and name **one** `Swift` template —
fetched, never proposed. A Swift repo's generated trees — SwiftPM's `.build/`,
Xcode's `xcuserdata/` — are upstream `Swift.gitignore`'s, so a SwiftUI app
with its committed Xcode project needs no pattern beyond the template. `swift`
as the Flutter pack's `platform-edge` token names no template: that repo is
`dart`, and `Flutter.gitignore` covers its iOS host.

A language absent from the table, or a pin that names no language, has **no
row and needs none**. `language/bash` and `language/markdown` have no template
upstream at all; `framework/effect` is Node, already fetched for the language
that pins it; and the mise base, the toolchain gates, `datastore/postgres`,
`ci-system/github-actions`, the cloud packs, the deploy targets and the design
tools write nothing an ignore file has to learn — the `git` base already
covers them. Absence here is an answer, not an omission.

**The fallback is `/vwf:init`'s.** For a language its stack read detects and
no pinned pack covers, it calls `git add ignore template=<Name> for
gitignore:<Name>`, and the template lands as a `gitignore:<Name>` block. A
language with a row above takes that name. **A detected language with no row
is proposed, never guessed**: the caller names the template it would fetch
and waits for a yes, since a wrong name is a 404 and a 404 is a block that
silently never lands; once confirmed, the row belongs in this table.

**A failed fetch** — offline, rate-limited, a 404 — writes nothing for that
block and names it in the call's output, with the unlock: a later run with the
network reachable. Never a partial block, never a remembered template.

## 5. The migration

`all` on a repo the retired hygiene pack shaped brings both files onto this
layout, each step a row:

- **Banner sections become blocks.** The retired base's sections are the
  `git` asset's seven banner sections, word for word, plus a `graphify`
  section holding the `graphify` block's two patterns. A landed section
  matches when its banner names one of them and its patterns, normalised, are
  the same set — comments are not compared, so an edited comment still
  matches. A matching base section becomes part of the `git` block — its
  `graphify` section the `graphify` block — and one whose banner names a
  template a requester asks for, holding only that template's patterns at the
  SHA now pinned, becomes that requester's block. Any other section — a
  pattern added or removed, a banner nothing names — stays where it is,
  outside every block, as the user's, and the blocks written after it do not
  double its patterns. The comment that said stack sections are appended
  below it is deleted. No pattern is lost.
- **`.gitattributes`** keeps the base's lines in the `git` block; the lines the
  retired payload carried that the base no longer holds — the `pnpm-lock.yaml`
  and the old mise lock's markers, graphify's merge-driver line and its
  comment — are deleted, each a row, and pnpm's own call writes its marker
  back into pnpm's block. A line the payload never carried is the user's.
  `setup:precommit`'s strip deletes only the merge-driver line itself; its
  comment is this step's.
- **The lockfile entries** sourced from that pack for these two paths are
  re-recorded as `tool-config/git@<version>`.
