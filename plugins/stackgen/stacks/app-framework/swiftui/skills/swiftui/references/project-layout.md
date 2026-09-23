# SwiftUI — project layout & the generated boundary

The Xcode project is **committed**. A person creates it once in Xcode and the
repo owns it from then on: `<App>.xcodeproj` is reviewed like source, and no
generator writes it. What is generated sits beside it — build products,
resolved package checkouts — and is never committed. Knowing which side of that
line a file sits on is the difference between a change that reaches the next
checkout and one that lives only on the machine that made it.

## The shape

| Path                                                                          | Owner   | Committed | Is                                                   |
| ----------------------------------------------------------------------------- | ------- | --------- | ---------------------------------------------------- |
| `<App>.xcodeproj/project.pbxproj`                                             | product | yes       | the project: targets, packages, settings             |
| `<App>.xcodeproj/xcshareddata/xcschemes/`                                     | product | yes       | the shared schemes the tasks and CI run              |
| `<App>.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`   | product | yes       | the pinned versions of every package the app adds    |
| `<App>/**`                                                                    | product | yes       | the app's Swift source and resources, per target     |
| `SnapshotTests/**`                                                            | product | yes       | the golden tests and their `__Snapshots__` images    |
| `<App>.xcodeproj/xcuserdata/`, `project.xcworkspace/xcuserdata/`              | Xcode   | **no**    | one developer's window state and breakpoints         |
| `.build/`, `DerivedData/`                                                     | tooling | **no**    | build products, test result bundles, golden renders  |

No pack lands the project. It is created in Xcode — New Project, the App
template — then a Unit Testing Bundle target named `SnapshotTests` is added,
and swift-snapshot-testing is added through Xcode's package dependencies,
attached to that test target only. The whole `.xcodeproj` is committed except
its `xcuserdata/`.

## Changing the project

**Source files need no project edit.** The target folders are synchronized
folders: a file created, moved or deleted under a target's folder is part of
that target on the next build, with no change to `project.pbxproj`. Adding a
screen, a model or a test is a source change and nothing more.

**Targets, packages and build settings are project changes.** They are made in
Xcode's editor and committed — the `project.pbxproj` diff is the reviewed
record of the change. An agent may make one by editing `project.pbxproj`
directly, with care: the file is a graph of objects cross-referenced by
generated identifiers, a broken reference is a project Xcode will not open, and
a merge conflict in it is resolved by reading both sides, never by taking one
wholesale. Where the change is more than a setting's value — a new target, a
new package — prefer asking a person to make it in Xcode.

**Schemes are shared.** A scheme the tasks or CI run is marked shared, so it
lives under `xcshareddata/` and is committed; a scheme left in a developer's
`xcuserdata/` does not exist on anyone else's machine.

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
- **A test target per module**, beside it — unit tests for a feature live next
  to that feature, not in one app-wide bucket. Goldens are the one exception:
  the `SnapshotTests` target of their own, see [testing](testing.md).
- **Extensions are targets too** — a widget, an App Intents extension, a watch
  complication. Each depends on the modules it needs, never on the app target.

## Module boundaries are enforced, not hoped for

Declare every dependency edge in the target's own frameworks and libraries,
never lean on another target's. An import that compiles only because some
other target happened to link the module is a hidden edge, and it breaks the
day that target stops linking it; a new edge shows in the `project.pbxproj`
diff, where review can refuse it. What each module may see is
[standards & architecture](standards-and-architecture.md)'s.

## Single repo, one project

The app is one repo with one `.xcodeproj` at its root — the tasks find it as
the single root project and refuse none or several. Where the product has a
backend, the backend is its own repo; where several Apple apps share code, the
shared code is a local Swift package they both depend on, not a second project
nested in this one.
