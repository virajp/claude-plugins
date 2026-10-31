# U2 — The generator names and vets the new kinds

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/skills/stackgen-stack-template/references/generator.md`,
  `plugins/stackgen/assets/artifact-doctrine.md`,
  `plugins/stackgen/skills/stackgen-sync/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/stackgen-reputation/SKILL.md` (read
  only — U1 owns it and edits it in this wave; write the grammar from the
  rulings below, never from that file)

## Ruling

> - Decision R1: The skill gains three prefixes: `spm:`, `mise:` and `maven:`.
>   `maven:` covers Maven coordinates and Gradle plugin ids. This plan finishes
>   B60.
> - Decision R2: Names in shipped packs stay exempt. No top-level Go, Cargo,
>   NuGet or RubyGems prefix. The offline `stackgen-skill-reviewer` agent does
>   not change.
> - Decision R3: `spm:<host>/<owner>/<repo>@<version>`, the host mandatory as
>   for `image:`.
> - Decision R4: `mise:<backend>:<path>[@<version>]`, the full backend form
>   only. A short registry name (`mise:swiftlint`) is `UNRESOLVED`; the
>   generator expands it first.
> - Decision R6: The top-level prefixes are `npm`, `pypi`, `pub`, `action`,
>   `image`, `spm`, `maven`, `mise`. Go, Cargo, Ruby and .NET tools are
>   reachable only as `mise:cargo:…`, `mise:go:…`, `mise:gem:…`,
>   `mise:dotnet:…`.
> - Decision R7: `maven:<group>:<artifact>@<version>`. A Gradle plugin id is
>   written as its marker coordinate, `maven:<id>:<id>.gradle.plugin@<version>`.
> - Decision R9: A concrete name now also covers each `Package.swift` dependency
>   (`spm:`) and each Maven dependency or Gradle plugin in a build file
>   (`maven:`). Every mise tool is written as `mise:<backend>:<path>`, the same
>   as its toml key, after a short name is expanded with `mise registry <name>`
>   (its first backend).

## Edits

1. **`generator.md:105-112`** — the concrete-name definition gains
   `Package.swift` dependencies and Maven dependencies and Gradle plugins in
   build files (`build.gradle.kts`, `settings.gradle.kts`,
   `gradle/libs.versions.toml`). Replace the prefix list with the eight of R6,
   and add a short mapping table: which name gets which prefix — a
   runner-invoked npm or Python tool keeps `npm:` or `pypi:`; a mise tool is
   always `mise:<backend>:<path>`; a SwiftPM dependency
   `spm:<host>/<owner>/<repo>@<version>`, read from its package URL; a Maven
   dependency `maven:<group>:<artifact>@<version>`; a Gradle plugin id its
   marker coordinate.
2. **`generator.md`, the same step** — the mise expansion rule: before vetting,
   a short mise name (no `:`) is expanded with `mise registry <name>`, run
   directly since mise is on PATH, and the first backend it prints is the name
   vetted and written into the toml. A name `mise registry` does not know stops
   generation as `UNRESOLVED`.
3. **`generator.md:112-121`, `:28-32`** — keep the block and `UNRESOLVED`
   policy; reword only where it lists the prefixes.
4. **`artifact-doctrine.md:209-217`** — the concrete-name definition and the
   prefix list follow edit 1. Keep `:231`, shipped packs exempt (R2).
5. **`stackgen-sync/SKILL.md:155`** — if it lists the kinds of names or the
   prefixes, make it agree with edit 1; otherwise leave it and say so in
   `DECIDED:`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` is green.
- `MISE_ENV=dev mise run code:precommit` is green.
- A grep for `pypi:` in `plugins/stackgen/assets` and
  `plugins/stackgen/skills/stackgen-stack-template` finds no prefix list left
  without `spm:`, `maven:` and `mise:`.

## Guardrails

- Do not touch `plugins/stackgen/skills/stackgen-reputation/**` — U1 owns it.
- Do not touch `plugins/stackgen/agents/**` (R2) or any pack under
  `plugins/stackgen/stacks/**`.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. Keep
  each code span on one line; never end a table cell in a bare asterisk.
- Rule 13: text that lands in a target repo cites no plugin path.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: stackgen generator vets SwiftPM, Maven and mise names`
