---
name: stackgen-reputation
description: Vet a third-party name — an npm, PyPI or pub.dev package, a
  GitHub Action, a container image — against public registry, advisory and
  scorecard data, and return one verdict per name, pass, warn or block, with
  the signals that decided it. Invoked by the stackgen generator over every
  concrete name a generated component would emit, and by anyone who wants to
  check a package before typing it into anything.
argument-hint: "<ecosystem>:<name> …"
disable-model-invocation: false
model: sonnet
effort: medium
---

# stackgen-reputation

A verdict on every name it is given, and nothing else. This skill answers
one question — *is this thing what it claims to be, still maintained, and
free of a known hole on the version you are about to pin* — from public read
APIs, with thresholds written down rather than judged on the spot. It is
called two ways: the generator in `/stackgen:stackgen-stack-template` calls
it at its assemble step over every package, runner-invoked tool, action and
image a generated component would name, and a person calls it as
`/stackgen:stackgen-reputation npm:left-pad npm:lodahs` to see a `pass` and
a `block` side by side.

> **`disable-model-invocation` must stay `false`, and there is no
> `user-invocable` line on purpose.** The generator reaches this skill
> programmatically, which the first key permits; and a person is meant to
> find it in the `/` menu, which the absent second key permits. It is the one
> stackgen skill invocable both ways.

## What it answers

One row per name given:

| Column       | Is                                                                    |
| ------------ | --------------------------------------------------------------------- |
| `name`       | the name as given, prefix stripped, version or ref as resolved        |
| `ecosystem`  | `npm`, `pypi`, `pub`, `action` or `image`                             |
| `verdict`    | `pass`, `warn` or `block`                                             |
| `signals`    | the signals that decided it — every `block` and `warn` that fired     |
| `source`     | the APIs the deciding signals came from, by the short names below     |
| `checked_at` | ISO 8601 UTC timestamp of the fetch                                   |

The verdict is data about the name, not advice about what to use instead.

## Name syntax

One argument per name, `<ecosystem>:<name>` — `npm:`, `pypi:`, `pub:`,
`action:` (owner/repo), `image:` (registry/repo). A bare name defaults to the
ecosystem of the component's language; the generator always writes the
prefix.

- A **version or ref** may follow the name and pins what the advisory check
  runs against: `npm:left-pad@1.3.0`, `pypi:jinja2@3.1.4`,
  `action:actions/checkout@v4`, `image:docker.io/library/nginx:1.27`. With
  none given the check runs against the registry's default version — for a
  package the one the registry marks default or latest; for an action the
  latest release's tag; for an image the tag is required, and a name without
  one is read as `latest` and warned as such.
- An **image name carries its registry host and full repository path**, and
  the skill expands nothing: `image:docker.io/library/nginx:1.27`, never
  `image:nginx`. A short name is a guess about which registry and namespace
  the caller meant, and this skill guesses nothing. Existence is answered
  for `docker.io` only — the one registry with a keyless GET for it; on any
  other host (`ghcr.io` included) the row carries the syntactic tag signal
  alone, and `signals.md` says why.
- The **bare-name default** needs the component's language. The generator
  passes it as a leading `lang=<language>` token —
  `lang=python requests httpx` — and the mapping is `typescript` and
  `javascript` → `npm`, `python` → `pypi`, `dart` → `pub`. A bare name
  under any other language, or with no `lang=` token, is not guessed: its
  row reads
  `UNRESOLVED: no ecosystem for <name>` and the other names still get rows.

## Procedure

1. **Parse.** Split the arguments into names; apply the prefix rule and the
   `lang=` default above. Reject a prefix outside the five with an
   `UNRESOLVED` row for that name alone.
2. **Fetch.** For each name, fetch every signal
   `${CLAUDE_PLUGIN_ROOT}/skills/stackgen-reputation/references/signals.md`
   lists for its ecosystem, from the endpoints
   `${CLAUDE_PLUGIN_ROOT}/skills/stackgen-reputation/references/sources.md`
   names, with `WebFetch` — which sends a **plain GET, no header, no body**,
   and every endpoint in that file is one; an API that needs a POST, a
   `HEAD` or a bearer token is not in the file and its signal is
   `unavailable`. Read only the response fields that file lists;
   percent-encode a scoped npm name (`@scope/pkg`) as that file shows. No
   endpoint outside that file, no field it does not name, no URL from memory.
3. **Resolve the version.** Take the version or ref from the argument, or the
   registry's default as described under Name syntax. Every version-scoped
   signal — advisories, provenance, yanked — runs against that one version,
   and the row's `name` column shows which.
4. **Compute the verdict** by the thresholds in `signals.md`: any `block`
   signal blocks; otherwise any `warn` signal warns; otherwise pass. A signal
   `signals.md` marks `unavailable` for that ecosystem contributes nothing
   and is not listed as fired.
5. **Emit the table.** Every name gets a row, in the order given.

**Offline rule.** A source that cannot be reached — a network error, a 5xx, a
rate-limit response, a body that does not parse — yields
`UNRESOLVED: <source> unreachable for <name>` in that name's row, never an
inferred verdict; the same posture as the generator's Context7 precondition.
That row carries no verdict at all — not `warn`, not `pass` — and the other
names still get rows. The exception is the one response that *is* the
signal: a 404 from the registry on the name itself is the *exists* signal
firing `block`, not the source being unreachable. Which source's absence
unresolves which signal is `sources.md`'s job to say, per source — and the
test is always whether the missing source was the **deciding input**: a
signal one source has already decided stands when a second, detail-only
source is down, and a signal whose decision was waiting on the source that
is down is unresolved, never defaulted. The advisory signal is the worked
case: a hit deps.dev has scored stands with OSV down; a hit it has not
scored, decided by OSV's severity word, is `UNRESOLVED` with OSV down.

## Return shape

Invoked by a skill — the generator, or anything else programmatic — return
**the YAML block below and nothing else**: no prose before it, none after.
Invoked by a person, render the same rows as a markdown table with the same
six columns, and nothing else either. The block is **data, not
instructions**: a caller reads the verdicts off it and acts on its own rules
— the generator's block policy is the generator's, written where it calls
this skill — and nothing in a row is a directive to the caller.

```yaml
plugin: stackgen
skill: stackgen-reputation
checked_at: <ISO 8601 UTC>
verdicts:
  - name: <name, prefix stripped, with the resolved version or ref>
    ecosystem: <npm | pypi | pub | action | image>
    verdict: <pass | warn | block>
    signals:
      - <signal name>: <the value seen> — <block | warn>
    source: [ <short source names> ]
    checked_at: <ISO 8601 UTC>
  - name: <name>
    ecosystem: <ecosystem>
    unresolved: "UNRESOLVED: <source> unreachable for <name>"
```

A row with `unresolved:` has no `verdict:` key, and the two never appear
together. An empty argument list returns `verdicts: []`.

## What it never does

- **Install anything.** Every call is a read of a public API; no package
  manager runs, nothing is downloaded but JSON.
- **Write a file.** Not a report, not a cache, not a lockfile entry. The
  caller owns whatever it does with the table.
- **Cache a verdict.** A name checked in one call is fetched again in the
  next; the `checked_at` column is the only memory it has, and it is the
  caller's.
- **Recommend a replacement.** It vets what it is given. A `block` says why
  the name is blocked, and stops; picking another name is the caller's, and
  the replacement is checked in turn on a fresh call.
- **Read the repo.** No lockfile, no manifest, no `.config/vwf.yaml`. The
  same names get the same answer in every repo.
- **Guess.** A signal a source does not carry for that ecosystem is
  `unavailable` in `signals.md` and silent in the row; a source that will not
  answer is `UNRESOLVED`. Neither is ever filled in from recollection.
