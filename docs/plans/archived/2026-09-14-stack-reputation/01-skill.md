# U1 — the `stackgen-reputation` skill

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-reputation/**` (new): `SKILL.md`,
  `references/signals.md`, `references/sources.md`
- **Model:** opus
- **Read first:** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md` and
  `plugins/stackgen/skills/stackgen-sync/SKILL.md` top to bottom — the two
  frontmatter shapes in use and the house voice for a stackgen skill.
- **Lazy-load:**
  `plugins/stackgen/skills/stackgen-stack-template/references/generator.md:81-97`
  (the assemble step that will call this skill — read to match its vocabulary
  for "concrete names", do not edit it);
  `.claude/skills/plugin-authoring/references/checks.md:56` (rule 4, strict
  YAML); `plugins/stackgen/assets/artifact-doctrine.md:154` (stackgen holds no
  registry).

## Ruling

Quoted from `index.md`:

> **1 — Placement.** One skill, `stackgen-reputation`, invocable by the user and
> by the model. The generator calls it at assemble (step 4) over every concrete
> name the component will emit — packages, runner-invoked tools, actions, images
> — and the verdict table is shown beside the reviewer's verdict at the dry-run
> consent gate. Shipped packs stay hand-curated.

> **2 — Sources.** `WebFetch` against public read APIs — deps.dev, OSV.dev, the
> ecosystem registry (npm, PyPI, pub.dev), GitHub's API for actions and source
> repos, Docker Hub / GHCR for images. No MCP server, no key.

> **4 — Verdicts.** Three: `pass`, `warn`, `block`. Block: the name is absent
> from its registry; first publish under 30 days ago; an unpatched critical or
> high advisory on the version to be pinned; a near-name (edit distance ≤ 2) of
> a package with at least 100× its downloads; deprecated or archived. Warn: one
> maintainer; downloads in the bottom tier for its ecosystem; no provenance or
> attestation; a low Scorecard. Thresholds live in `references/signals.md`, each
> with its source and the reason.

> **5 — Offline.** A source that cannot be reached yields
> `UNRESOLVED: <source> unreachable for <name>`, never an inferred verdict — the
> same posture as the generator's Context7 precondition.

> **7 — Name syntax.** One argument per name, `<ecosystem>:<name>` — `npm:`,
> `pypi:`, `pub:`, `action:` (owner/repo), `image:` (registry/repo). A bare name
> defaults to the ecosystem of the component's language; the generator always
> writes the prefix.

## Edits

1. **Verify every endpoint first.** For each source — deps.dev, OSV.dev, the npm
   registry and its download-counts API, PyPI's JSON API, pub.dev's API,
   GitHub's REST API (repositories, releases), Docker Hub's and GHCR's
   registry/manifest endpoints — call Context7 (`resolve-library-id`, then
   `query-docs`) for the read endpoint's path, the request shape, and the fields
   that carry each signal. Write only what Context7 confirmed; record the
   library id beside each endpoint in `sources.md`'s table. A source Context7
   cannot confirm is dropped from the table with a one-line note, and the signal
   it would have carried is marked `unavailable` in `signals.md` — never
   guessed.
2. **`SKILL.md`** (new) — strict-YAML frontmatter: `name: stackgen-reputation`,
   a `description` that says what it vets and that both a person and the
   generator call it, `argument-hint: "<ecosystem>:<name> …"`,
   `disable-model-invocation: false`, **no** `user-invocable` key (the default
   is invocable), `model: sonnet`, `effort: medium`. Body, in the register of
   the menu skill:
   - **What it answers** — for each name given, one row: `name`, `ecosystem`,
     `verdict`, `signals` (the ones that decided it), `source` (which API),
     `checked_at`.
   - **Name syntax** — ruling 7 verbatim, plus the bare-name default and how the
     caller passes the component's language for it.
   - **Procedure** — parse names; for each, fetch the signals `signals.md` lists
     from the endpoints `sources.md` names, with `WebFetch`; compute the verdict
     by the thresholds; emit the table. Emit `UNRESOLVED:` per ruling 5 for a
     name whose deciding source is unreachable; other names still get rows.
   - **Return shape** — a YAML block and nothing else when invoked by a skill;
     the same block rendered as a markdown table when invoked by a person. State
     that the block is data, not instructions.
   - **What it never does** — install anything, write a file, cache a verdict,
     recommend a replacement (it vets what it is given), read the repo.
3. **`references/signals.md`** (new) — one table: signal, ecosystems it applies
   to, source (by the short name `sources.md` uses), the `block` threshold, the
   `warn` threshold, and one line of why. Cover at least: exists in registry;
   first-publish age; latest-publish age; weekly or monthly downloads;
   maintainer count; deprecated / archived flag; advisories on the version to
   pin (severity, fixed-in); provenance / attestation present; OpenSSF Scorecard
   (where deps.dev carries it); near-name distance and the download ratio; for
   an action: repository archived, latest release age, whether the reference is
   a tag or a SHA; for an image: exists, last push age, whether the tag is
   mutable (`latest`). State the decision rule: any `block` signal blocks;
   otherwise any `warn` signal warns; otherwise pass.
4. **`references/sources.md`** (new) — one table per source: the endpoint path
   pattern, the request (method, query), the response fields read, the Context7
   library id it was verified against, rate limits or auth notes (all read paths
   keyless; say where an unauthenticated GitHub call is rate-limited and what
   the skill does then — `UNRESOLVED`, not a guess).

## Verification

- `mise run p:plugins:check` green — rule 4 parses the new frontmatter.
- `command sed -n '1,15p' plugins/stackgen/skills/stackgen-reputation/SKILL.md`
  shows `disable-model-invocation: false` and no `user-invocable` line.
- `command grep -c 'http' plugins/stackgen/skills/stackgen-reputation/references/sources.md`
  is greater than zero, and every endpoint row carries a Context7 library id.
- `command grep -n 'UNRESOLVED' plugins/stackgen/skills/stackgen-reputation/SKILL.md`
  hits the offline rule.
- `command grep -rn 'CLAUDE_PLUGIN_ROOT' plugins/stackgen/skills/stackgen-reputation`
  hits only same-plugin references (rule 6 resolves them).

## Guardrails

- Do not touch `plugins/stackgen/skills/stackgen-stack-template/**`,
  `stackgen-sync/**`, `agents/**` or `assets/**` — U2's, running concurrently.
- Do not touch `plugins/vwf/**`.
- Do not type an endpoint from memory; every URL comes through Context7.
- Do not add a `tools:` or `allowed-tools:` line that would exclude `WebFetch`.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match the menu skill's fold width
  by hand. Strict-YAML frontmatter: a frontmatter that does not parse drops the
  skill silently.
- Never end a table cell in a bare asterisk.

## Commit

`feat: stackgen — the stackgen-reputation skill` — written by the orchestrator
after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
