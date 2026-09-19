# The Readme Stub, the Licence, and the Rest of Hygiene

The files a repository carries whatever it is written in. All of them are the
hygiene pack's; `init` places them, fills the three placeholders, and stops.

Everything here is **per repo**: one run shapes the base and every member, and
each repo takes its own row's answer and writes its own files at its own root.
A row's answer never reaches a repo other than the one it names.

## The readme

**Every repo that resolved to mode new gets a two-line stub at its own root,
and nothing more:**

```markdown
# <repo name>

<the one-line brief>
```

Both lines come from that repo's own answers to the two questions the new-repo
path asks — question 1 the name, question 3 the brief, each asked for every
repo that resolved to mode new and for no other. An **empty brief** writes the
H1 alone — an honest empty file beats an invented sentence about a product
nobody has described yet.

Then **name `/vwf:readme`** in the report as the command that fills the rest.
It writes the title, the project list, the architecture diagram, the setup
guide and the task list, and it does that by scanning a repo that has
something in it. Running it against a stub is the wrong order.

**An existing readme is never rewritten.** It is moved to the lowercase
filename, content untouched, as the existing-repo pipeline's second survey
pass lists it. `init` writes a stub only where there is no readme at all — a
member that already carries one is left as it is, exactly as the base is.

## The licence

The licence is gated on question 6's **visibility** answer, and the gate comes
first: a repo that answered **`private`** gets no licence row at question 6a
and **no `LICENSE`** — a licence grants the public rights a private repo is
not offering — and nothing below applies to it. A repo that answered
**`public`** has a row at 6a, and takes its own row's answer, one of three:

- **MIT** or **Apache-2.0** — copy that one text from the hygiene pack's
  licence catalogue to `LICENSE` at **that repo's** root, filling `<YEAR>` and
  `<HOLDER>`.
- **none** on a row — write no file in that repo. That is a legible answer,
  and it is not the same as a licence a tool picked on the author's behalf.

**A repo that already carries a licence file is listed as kept, never
replaced**, whichever visibility it answered — the licence a repository
already declares is a decision somebody made, and a row's answer is what a
repo with no licence gets rather than a rewrite of one that is there. A
private repo carrying one keeps it too: `init` removes no file on a
visibility answer.

The catalogue directory is **pack-private** and never lands in a repo: the
materializer skips it, and `init` reads one file out of it. A repo ends up
with `LICENSE`, never with the catalogue.

Both placeholders are resolved **per repo**, from that repo's own answers.
`<YEAR>` is the current year — the year the licence is first applied, not a
range, and not something a later run updates. `<HOLDER>` is `git config
user.name` read in the repo being written, confirmed in that repo's section of
the plan before applying; where git has no configured name, ask for it once
rather than writing an empty holder.

## The security contact

Question 6b is **one row per repo**, in the round that follows the visibility
answer, and the row takes one of two shapes:

- A **`public`** repo's row is a URL, proposed as **that repo's** origin
  remote's advisories page — the web URL, no trailing slash, with the
  advisories path appended. A repo with no origin of its own gets no default
  and is asked on its row like any other.
- A **`private`** repo's row is a **free contact** with no default — an email
  address, or an internal URL a reporter inside the organisation can reach.
  An advisories page is a public channel, and a private repo has no reporter
  outside it to offer one to.

Either answer is **spliced into the hygiene pack's security template** at its
one contact slot — the same slot the advisories URL filled before, and the
only fill that file takes — and the template reads naturally with an email as
with a URL; the pack's text is written for both. The slot takes the row's
answer as typed, never the origin URL §4 fills elsewhere. The pack's
issue-template chooser carries a *Report a vulnerability* link that follows the
same answer: where the contact is a URL, that entry's `url:` takes it; where the
contact is an email, or the row was declined, the **whole entry is removed** —
the forge accepts only a web address there, and an entry pointing nowhere is
worse than none.

**Declining a row writes no file in that repo, whichever shape it had.** A
repository with no private channel to point at is better off with none than
with one naming a channel nobody watches, and that is the pack's own rule
rather than a preference here.

## Copied as-is

The remaining hygiene files land exactly as the pack ships them, with no
placeholder and no question:

| File                         | Is                                                         |
| ---------------------------- | ---------------------------------------------------------- |
| the editor-shape defaults    | indentation and line endings a formatter has no plugin for |
| the attributes file          | line-ending normalisation, generated trees, binaries       |
| the dependency-update policy | the update cadence and the minimum release age             |

The ignore file is the exception among them — it lands as the pack's sectioned
base and then **grows** by the append in
[fragments and sections](fragments-and-sections.md).

**When the dependency-update policy lands, print the caveat the pack's
conventions state** about where that tool actually looks for its
configuration. The file sits where this repo shape puts configuration, which
is not where the hosted service searches; a repo that wants the service
enabled has one more thing to do, and saying so at write time is cheaper than
a policy nobody notices is inert.

## What `init` does not write here

- **`CLAUDE.md`** — `/vwf:setup`'s, out of scope outright.
- **A full readme** — `/vwf:readme`'s.
- **Anything at the repo root that is not on the hygiene doctrine's
  allowlist.** The materializer enforces that as a ceiling and refuses a pack
  that violates it; `init` holds itself to the same line, because a ceiling
  one caller can step over is not a ceiling.
