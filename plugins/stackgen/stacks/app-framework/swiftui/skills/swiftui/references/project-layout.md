# SwiftUI — project layout & the generated boundary

The Xcode project is **generated**. Tuist reads Swift manifests the repo owns
and writes the `.xcodeproj` and `.xcworkspace` from them. Knowing which side of
that line a file sits on is the difference between a change that survives the
next `tuist generate` and one that silently disappears.

## The shape

| Path                           | Owner   | Committed | Is                                                    |
| ------------------------------ | ------- | --------- | ----------------------------------------------------- |
| `Tuist.swift`                  | product | yes       | Tuist's configuration, the accepted Xcode versions    |
| `Project.swift`                | product | yes       | the project: targets, destinations, settings, schemes |
| `Tuist/Package.swift`          | product | yes       | external SwiftPM dependencies the project integrates  |
| `Tuist/Package.resolved`       | product | yes       | their pinned versions                                 |
| `<App>/Sources/**`             | product | yes       | the app's Swift source, per target                    |
| `<App>/Resources/**`           | product | yes       | asset catalogs, string catalogs, fonts                |
| `*.xcodeproj`, `*.xcworkspace` | Tuist   | **no**    | generated on every `tuist generate`                   |
| `Derived/`                     | Tuist   | **no**    | synthesized Info.plists, entitlements, accessors      |
| `Tuist/.build/`                | Tuist   | **no**    | resolved dependency checkouts                         |

`tuist init` creates the manifests; no pack lands them. From then on they are
the repo's, reviewed like source.

## Generated output is not a place to put anything

Tuist's own guidance on synthesized files: the content is generated into
`Derived/`, and that directory belongs in `.gitignore`. The same holds for the
project and workspace themselves.

The failure is quiet: a build setting toggled in Xcode's editor, a file dragged
into a group, a scheme edited by hand — all work locally, and all vanish on the
next generate, on someone else's machine or in CI, with no error.

**The rule: every project change is a manifest change.** A build setting goes
in `Project.swift` (or an `.xcconfig` it references); a new file goes under a
glob the manifest already covers; a scheme is declared, not clicked. If Xcode's
editor is the only way you know to make a change, find its manifest spelling
before committing.

## Targets

- **One app target per product shape** — see
  [pick & trade](pick-and-trade.md) for when platforms share a target through
  several destinations and when each gets its own.
- **Feature modules as framework targets** the app targets depend on. A
  feature is a module — its models, views and tests — and the app target is the
  composition root that assembles them.
- **One shared core module** for the domain types, clients and design-system
  views every feature uses. Keep it small; a core that knows about features is
  a cycle waiting to happen.
- **A test target per module**, declared beside it — unit tests for a feature
  live next to that feature, not in one app-wide bucket. Goldens are the one
  exception: a snapshot test target of their own, see [testing](testing.md).
- **Extensions are targets too** — a widget, an App Intents extension, a watch
  complication. Each depends on the modules it needs, never on the app target.

## Module boundaries are enforced, not hoped for

Declare every dependency edge in the manifest and let the build refuse the
ones that are not declared. An import that compiles only because some other
target happened to link the module is a hidden edge; turning on Tuist's
explicit-dependency enforcement makes it a build error. What each module may
see is [standards & architecture](standards-and-architecture.md)'s.

## Single repo, one project

The app is one repo with one Tuist project at its root. Where the product has
a backend, the backend is its own repo; where several Apple apps share code,
the shared code is a Swift package they both depend on, not a second project
nested in this one.
