# Decision — `stackgen-reputation` vets SwiftPM, Maven and every mise backend, through eight prefixes

**Date** 2026-10-09 · **Branch** `2026-10-09-reputation-spm-mise-maven` ·
**Plan**
[`docs/plans/2026-10-09-reputation-spm-mise-maven/`](../../plans/2026-10-09-reputation-spm-mise-maven/index.md)
· **Completes** B60

## What was decided before

The skill took five prefixes — `npm:`, `pypi:`, `pub:`, `action:` and `image:` —
and any other prefix came back `UNRESOLVED`. The Swift chain parked SwiftPM
names as backlog item B60 on 2026-09-23. The Kotlin plan widened B60 to Maven
and Gradle names on 2026-10-09. The generator wrote one of the five prefixes and
halted on `UNRESOLVED`, so a Swift or Kotlin component could not be generated
without a halt.

## The interview reversal

The user first accepted "no Go, Cargo, NuGet or RubyGems" as a non-goal, then
asked that every mise backend be supported. So those four ecosystems are in
scope, reachable only through `mise:` (R5, R6). No standing decision doc is
reversed.

## The decisions

**Ecosystems (R1).** Three new prefixes: `spm:`, `mise:` and `maven:`. `maven:`
covers Maven coordinates and Gradle plugin ids. Rejected: `spm:` and `mise:`
only; a separate `gradle:` prefix on the Plugin Portal.

**Non-goals (R2).** Names in shipped packs stay exempt. No top-level Go, Cargo,
NuGet or RubyGems prefix. The offline `stackgen-skill-reviewer` agent does not
change. Rejected: add Go and Cargo; a shipped-pack audit.

**spm syntax (R3).** `spm:<host>/<owner>/<repo>@<version>`, the host mandatory
as for `image:`. On `github.com` the name gets the checks `action:` takes plus
the deps.dev project Scorecard, with the version checked against the repo's
tags. On any other host it gets the syntactic signals only, and `exists` is
`unavailable`, so it warns at most. Rejected: `spm:<owner>/<repo>`, GitHub only;
the full git URL from `Package.swift`.

**mise syntax (R4).** `mise:<backend>:<path>[@<version>]`, the full backend form
only. A short registry name (`mise:swiftlint`) is `UNRESOLVED`; the generator
expands it first. Rejected: the skill resolves short names from mise's registry
file; no `mise:` prefix.

**mise backends (R5).** The backend decides the checks. `core` is first-party
and passes when the name is a mise core tool. `aqua`, `github` and `ubi` get the
GitHub repo checks plus the Scorecard. `npm` gets the npm checks, `pypi` and
`pipx` the PyPI checks, `spm` the spm checks. `cargo`, `go`, `gem` and `dotnet`
go to the deps.dev systems cargo, go, rubygems and nuget. `asdf` and `vfox` get
the GitHub repo checks on the plugin repo when the path is `owner/repo`, else
syntactic only. `gitlab`, `forgejo`, `conda`, `http`, `s3`, `packslip` and
`spinel` get syntactic signals only and warn at most. No mise backend is
`UNRESOLVED`; a backend mise adds later is syntactic only until a plan maps it.
Rejected: `http:` warns and the rest halt; every unknown backend warns; every
unknown backend blocks.

**Prefix surface (R6).** The cargo, go, rubygems and nuget checks are reachable
only as `mise:cargo:…`, `mise:go:…`, `mise:gem:…` and `mise:dotnet:…`. The
top-level prefixes are `npm`, `pypi`, `pub`, `action`, `image`, `spm`, `maven`
and `mise`. Rejected: also add `cargo:`, `go:`, `gem:` and `nuget:` at the top
level.

**Maven (R7).** `maven:<group>:<artifact>@<version>`, through the deps.dev
`maven` system. A Gradle plugin id is written as its marker coordinate,
`maven:<id>:<id>.gradle.plugin@<version>`. A deps.dev 404 is repository-aware:
for `androidx.`, `com.android.` and `com.google.android.` groups, and for plugin
markers, `exists` is `unavailable` — unless the Context7 check shows deps.dev
indexes that repository. A 404 on any other name blocks. At run time the
Context7 check showed deps.dev lists Google Maven and the Gradle Plugins
repository as sources, so the skill as written blocks on every Maven 404.
Rejected: add Google Maven and Plugin Portal sources; any 404 blocks.

**Verification (R8).** Every new endpoint and every new deps.dev system row is
verified against Context7 before it is written. A row Context7 cannot confirm is
not written: it goes under "Not verified", and its signal is `unavailable` —
never `UNRESOLVED` for the ecosystem.

**Generator (R9).** A concrete name now also covers each `Package.swift`
dependency (`spm:`) and each Maven dependency or Gradle plugin in a build file
(`maven:`). Every mise tool is written as `mise:<backend>:<path>`, the same as
its toml key, after a short name is expanded with `mise registry <name>` (its
first backend). The skill's `lang=` map gains swift to `spm`, and kotlin and
java to `maven`. Rejected: keep `npm:` and `pypi:` for mise tools; prefixes
only, no widening.

## Not in scope

Top-level `cargo:`, `go:`, `gem:` and `nuget:` prefixes — parked as B51. Google
Maven and the Gradle Plugin Portal as verified sources of their own — parked.
The audit mode over shipped packs — parked by the 2026-09-14 stack-reputation
plan.
