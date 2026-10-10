# U1 — The reputation skill learns spm, mise and maven

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-reputation/**` — `SKILL.md`,
  `references/sources.md`, `references/signals.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/skills/stackgen-stack-template/references/generator.md:105-121`
  (read only — U2 owns it)

## Ruling

> - Decision R1: The skill gains three prefixes: `spm:`, `mise:` and `maven:`.
>   `maven:` covers Maven coordinates and Gradle plugin ids. This plan finishes
>   B60.
> - Decision R2: Names in shipped packs stay exempt. No top-level Go, Cargo,
>   NuGet or RubyGems prefix. The offline `stackgen-skill-reviewer` agent does
>   not change.
> - Decision R3: `spm:<host>/<owner>/<repo>@<version>`, the host mandatory as
>   for `image:`. On `github.com` the name gets every `github` source signal
>   plus the deps.dev project Scorecard, the route `action:` takes, with the
>   version checked against the repo's tags. On any other host it gets the
>   syntactic signals only and `exists` is `unavailable`, so it warns at most.
> - Decision R4: `mise:<backend>:<path>[@<version>]`, the full backend form
>   only. A short registry name (`mise:swiftlint`) is `UNRESOLVED`; the
>   generator expands it first.
> - Decision R5: The backend decides the checks. `core`: first-party, pass when
>   the name is a mise core tool. `aqua`, `github`, `ubi`: the GitHub repo
>   checks plus the Scorecard. `npm`: the npm checks. `pypi` and `pipx`: the
>   PyPI checks. `spm`: the spm checks. `cargo`, `go`, `gem`, `dotnet`: the
>   deps.dev systems cargo, go, rubygems, nuget. `asdf`, `vfox`: the GitHub repo
>   checks on the plugin repo when the path is `owner/repo`, else syntactic
>   only. `gitlab`, `forgejo`, `conda`, `http`, `s3`, `packslip`, `spinel`:
>   syntactic signals only, `exists` `unavailable`, warn at most. No mise
>   backend is `UNRESOLVED`; a backend mise adds later is syntactic only until a
>   plan maps it.
> - Decision R6: The cargo, go, rubygems and nuget checks are reachable only as
>   `mise:cargo:…`, `mise:go:…`, `mise:gem:…`, `mise:dotnet:…`. The top-level
>   prefixes are `npm`, `pypi`, `pub`, `action`, `image`, `spm`, `maven`,
>   `mise`.
> - Decision R7: `maven:<group>:<artifact>@<version>`, through the deps.dev
>   `maven` system. A Gradle plugin id is written as its marker coordinate,
>   `maven:<id>:<id>.gradle.plugin@<version>`. A deps.dev 404 is
>   repository-aware: for groups under `androidx.`, `com.android.` and
>   `com.google.android.`, and for plugin markers, `exists` is `unavailable` —
>   unless the Context7 check shows deps.dev indexes that repository. A 404 on
>   any other name still blocks.
> - Decision R8: Every new endpoint and every new deps.dev system row is
>   verified against Context7 before it is written, per the `sources.md` header
>   rule. A row Context7 cannot confirm is not written: it goes under "Not
>   verified" and its signal is `unavailable` — never `UNRESOLVED` for the
>   ecosystem.
> - Decision R9 (the skill's half): The skill's `lang=` map gains swift to
>   `spm`, and kotlin and java to `maven`.

## Edits

1. **`SKILL.md` frontmatter `:3-9`** — the description names the new kinds: a
   SwiftPM package, a mise tool (any backend), a Maven artifact or Gradle
   plugin, beside the five it lists. Keep strict YAML (a folded plain scalar, no
   unquoted `:` inside it). The argument hint is unchanged.
2. **`SKILL.md` body `:16-24`** — the sentence on what the generator vets gains
   SwiftPM dependencies, Maven and Gradle names, and mise tools by backend. Add
   one `spm:` or `mise:` example beside the npm one only if it reads naturally.
3. **`SKILL.md:39`, `:133`, `:140`** — the ecosystem column and the return enum
   list eight values: `npm`, `pypi`, `pub`, `action`, `image`, `spm`, `maven`,
   `mise`. For a `mise:` row, add a `backend:` field to the return shape naming
   the backend, and say which checks it took (R5).
4. **`SKILL.md:49-67`** — the grammar gains three bullets per R3, R4 and R7,
   with the version rule for each: `spm:` and `maven:` take `@<version>`;
   `mise:` takes `@<version>` after the path; an unpinned name gets the existing
   unpinned signal. State the R7 marker-coordinate form for a Gradle plugin id.
   State that a `mise:` name with no backend is `UNRESOLVED` (R4).
5. **`SKILL.md:68-74`** — the `lang=` map gains `swift` to `spm`, and `kotlin`
   and `java` to `maven` (R9).
6. **`SKILL.md:78-80`** — "the five" becomes the eight top-level prefixes (R6).
   Add the R5 backend table: one row per backend, the checks it routes to.
   `pipx` is mise's older name for `pypi`. A backend not in the table is
   syntactic only, warn at most, never `UNRESOLVED`.
7. **`references/sources.md`** —
   - In the `depsdev` section, verify through Context7 (`resolve-library-id`
     then `query-docs` on `/google/deps.dev`) the system names and the package
     path for `maven`, `cargo`, `go`, `rubygems` and `nuget`, and the Maven
     package-name form (group and artifact joined by `:`, URL-encoded). Add the
     rows Context7 confirms; change `:25-28` "does not yet address" to the
     systems the skill now addresses. While on the deps.dev docs, find which
     Maven repositories it indexes, for R7.
   - For `spm:` on `github.com`, reuse the `github` source rows that `action:`
     uses (repo, tags). Add a row only for an endpoint `action:` does not
     already read, verified the same way.
   - For `mise:core`, the "core tool" fact: if Context7 confirms a keyless GET
     that lists mise's core tools, add it; otherwise write the list of core tool
     names into the skill as a fixed table taken from Context7's mise docs, with
     the date read, and say so.
   - Every endpoint or field Context7 cannot confirm goes under "Not verified —
     and therefore not here", with the reason (R8).
8. **`references/signals.md`** — the Ecosystems cells at `:22`, `:38` and the
   package table `:20-45` gain `maven` and the four deps.dev systems where the
   signal applies. Add an `spm` section in the style of Actions (`:56-68`):
   exists, archived, last release, Scorecard, the version against the tags, and
   the non-github host rule (R3). Add a `mise` section: the R5 routing table and
   the syntactic-only signals (pinned version, `http:` with no checksum warns, a
   mutable `latest`). State the R7 404 rule where `exists` is decided.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` is green (strict-YAML frontmatter,
  rule 4).
- `MISE_ENV=dev mise run code:precommit` is green.
- `grep -n "the five" plugins/stackgen/skills/stackgen-reputation/SKILL.md`
  returns nothing.
- Each of `spm:`, `mise:`, `maven:` appears in the grammar, the enum and the
  signals file.
- No source row lacks a Context7 id.

## Guardrails

- Do not touch `generator.md`, `artifact-doctrine.md` or `stackgen-sync` — U2
  owns them. A passage there that disagrees is a `DOCS FALSIFIED:` line.
- Never type an endpoint, a field or a system name from memory: Context7 first,
  else "Not verified" (R8).
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- Keep `disable-model-invocation: false` and add no `user-invocable` line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: stackgen-reputation vets spm, mise and maven names`
