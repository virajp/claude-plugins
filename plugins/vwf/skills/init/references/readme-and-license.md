# The Hygiene Assets — the Readme Stub, the Licence, the Security Contact

The files a repository carries whatever it is written in and that no tool
reads. They are `init`'s own, under
`${CLAUDE_PLUGIN_ROOT}/skills/init/assets/hygiene/`, laid out as they land;
`init` places them, fills the three placeholders, and stops. They run after
the bootstrap step, in a repo that step left with a `.config/bootstrap.toml`.
The ignore file, the attributes file and the issue forms are not among them —
they are bootstrap's git and github tools.

Everything here is **per repo**: one run shapes the base and every member, and
each repo takes its own row's answer and writes its own files at its own root.
A row's answer never reaches a repo other than the one it names.

## What the assets carry

| Asset                                           | Lands at      | When               |
| ----------------------------------------------- | ------------- | ------------------ |
| `CONTRIBUTING.md`                               | the repo root | always             |
| `licenses/MIT.txt` or `licenses/Apache-2.0.txt` | `LICENSE`     | question 2a, below |
| `SECURITY.md`                                   | the repo root | question 2b, below |

They land in the new-repo pipeline's *The hygiene assets*, after the bootstrap
step; the licence and the security file wait for their answers and land in its
*The readme stub, the licence and the security file*. No lock record is written
for any of them.

**The already-there rule covers every asset.** One the repo already carries
is **kept, never replaced, and reported as kept** — no offer, no
`kept_files` entry, since nothing was decided — and one it lacks is a create.
So a second run finds every asset present and plans nothing for it.

`CONTRIBUTING.md` is developer-facing and repo-neutral: setup in one command,
the branch model and where its two landing models live
(`.config/bootstrap.toml`), where the commit types and scopes live, the gate
tasks — `code:format`, `code:lint`, `code:sec` and `code:precommit` — the merge
tasks `code:merge:develop` and `code:merge:main`, and the pointer to
`SECURITY.md`.

## The placeholder vocabulary

Three, and no others: nothing else in the assets uses a placeholder, so a `<`
in a landed asset is one of these or a bug.

| Placeholder  | Filled with                                         |
| ------------ | --------------------------------------------------- |
| `<REPO_URL>` | the repository's web URL, no trailing slash         |
| `<YEAR>`     | the year the licence is first applied               |
| `<HOLDER>`   | the copyright holder — a person or the legal entity |

One position reads differently: in `SECURITY.md` the same `<REPO_URL>` token
stands alone on its own line and is filled with the **security contact** —
an advisory URL or an email — never with the repo URL plus a suffix, per the
security contact below. The sources each placeholder is filled from are
[new repo](new-repo.md)'s *The placeholders*.

## The readme

**Every repo that resolved to mode `blank` or `source` and carries no readme
gets a two-line stub at its own root, and nothing more:**

```markdown
# <repo name>

<the one-line brief>
```

The name is the `repo_name` bootstrap's `docs/sync` wrote into that repo's
`.config/bootstrap.toml`, read and never edited. The brief is that repo's own
answer to question 1, asked for every such repo and for no other. An **empty
brief** writes the H1 alone — an honest empty file beats an invented sentence
about a product nobody has described yet.

Then **name `/vwf:readme`** in the report as the command that fills the rest.
It writes the title, the project list, the architecture diagram, the setup
guide and the task list, and it does that by scanning a repo that has
something in it. Running it against a stub is the wrong order.

**An existing readme is never rewritten.** In `shaped` and `old layout` mode it
is moved to the lowercase filename, content untouched, as the existing-repo
pipeline's *The readme* lists it. In `blank` or `source` mode a `README.md` the
repo already carries is **kept as-is, never stubbed and reported as kept** —
that pass is not run here. `init` writes a stub only where there is no readme at
all — a member that already carries one is left as it is, exactly as the base
is.

## The licence

The licence is gated on question 2's **visibility** answer, and the gate comes
first: a repo that answered **`private`** gets no licence row at question 2a
and **no `LICENSE`** — a licence grants the public rights a private repo is
not offering — and nothing below applies to it. A repo that answered
**`public`** has a row at 2a, and takes its own row's answer, one of three:

- **MIT** or **Apache-2.0** — copy that one text from the assets'
  `licenses/` directory to `LICENSE` at **that repo's** root, filling `<YEAR>`
  and `<HOLDER>`. Both are permissive; they differ in whether the grant is
  explicit about patents and about what a contributor is contributing.
- **none** on a row — write no file in that repo. That is a legible answer,
  and it is not the same as a licence a tool picked on the author's behalf —
  "all rights reserved".

**A repo that already carries a licence file is listed as kept, never
replaced**, whichever visibility it answered — the licence a repository
already declares is a decision somebody made, and a row's answer is what a
repo with no licence gets rather than a rewrite of one that is there. **Every
spelling counts**: `LICENSE`, `LICENSE.md`, `LICENCE` and `COPYING` are each
"already carries a licence file", and a repo with any one of them at its root
has no licence row at 2a and takes no `LICENSE` beside it — only `LICENSE` is
on the allowlist, but the other three are the repo's own and are neither
moved nor doubled. A private repo carrying one keeps it too: `init` removes
no file on a visibility answer.

The `licenses/` directory never lands in a repo: `init` reads one file out
of it. A repo ends up with `LICENSE`, never with the directory.

Both placeholders are resolved **per repo**, from that repo's own answers.
`<YEAR>` is the current year — the year the licence is first applied, not a
range, and not something a later run updates. `<HOLDER>` is
`git config user.name` read in the repo being written, confirmed in that repo's section of
the plan before applying; where git has no configured name, ask for it once
rather than writing an empty holder.

## The security contact

**A repo that already carries a security file is listed as already there —
kept, never replaced**, in every mode. The channel a repository already names
is a decision somebody made, and the row's answer is what a repo with no such
file gets rather than a rewrite of one that is there. The asset's template is
written only where the file is absent, and **question 2b is asked only for a
repo where it will be written**: a repo keeping its own file has no row at
that question, and the plan's section for it reports the file as kept.

Question 2b is **one row per repo**, in the round that follows the visibility
answer, and the row takes one of two shapes:

- A **`public`** repo's row is a URL, proposed as **that repo's** origin
  remote's advisories page — the web URL, no trailing slash, with the
  advisories path appended. A repo with no origin of its own gets no default
  and is asked on its row like any other.
- A **`private`** repo's row is a **free contact** with no default — an email
  address, or an internal URL a reporter inside the organisation can reach.
  An advisories page is a public channel, and a private repo has no reporter
  outside it to offer one to.

Either answer is **spliced into the assets' security template** at its
one contact slot — the same slot the advisories URL filled before, and the
only fill that file takes — and the template reads naturally with an email as
with a URL; the asset's text is written for both. The slot takes the row's
answer as typed, never the origin URL *The placeholders* fills elsewhere.

**Declining a row writes no file in that repo, whichever shape it had.** A
repository with no private channel to point at is better off with none than
with one naming a channel nobody watches, and that is the rule rather than
a preference.

## What `init` does not write here

- **`CLAUDE.md`** — `/vwf:setup`'s, out of scope outright.
- **A full readme** — `/vwf:readme`'s.
- **Anything at the repo root that is not on the stack adapter's root
  allowlist.** The materializer enforces that as a ceiling and refuses a pack
  that violates it; `init` holds its own assets to the same line, because a
  ceiling one caller can step over is not a ceiling.
