# SwiftUI — build, flavours & signing

The build is the committed Xcode project, run through the repo's tasks. A
project change is made in Xcode and committed, or made by an agent editing
`project.pbxproj` with care — see [project layout](project-layout.md) for
which changes need one at all.

## The pipeline

Every task that builds or resolves calls `xcodebuild` on the single root
`.xcodeproj`, and `swift` for formatting — no other tool stands between the
repo and Xcode. Packages are resolved by Xcode's own SwiftPM integration
against the project, and their pinned versions are the `Package.resolved`
committed inside it.

The repo's `setup:deps:install` task resolves the project's packages without
opening Xcode. Run it after a fresh checkout, after a package is added or
moved, and after the lockfile moves. Its `--frozen` flag resolves exactly what
`Package.resolved` records and fails when the project needs something else,
rather than rewriting it — the mode CI runs. Build and test through the repo's
tasks rather than the tools by hand; a CI job runs the same tasks.

## The Xcode pin

The Xcode version is part of the build's inputs: it decides the Swift compiler,
the SDKs and the simulators. The repo pins it as `XCODE_VERSION` in
`.config/mise/conf.d/swiftui.toml`, which `/vwf:setup` fills from this
machine and the repo commits, and every task that builds checks the selected
Xcode against it before doing any work: `xcodebuild -version` must succeed —
a Mac with only the Command Line Tools fails it, since they carry no
`xcodebuild` that can build an app — and must report the pinned version. On a
mismatch the task stops and names both the version it wants and the one
selected, so the fix is switching Xcode, not reading a compiler error halfway
through a build. An unset or empty `XCODE_VERSION` is refused the same way,
since an unpinned build checks nothing, and so is a pin the fragment does not
hold as a plain string, one holding a template delimiter (`{{`, `{%`, `{#`) or
a `$`, or one another mise config overrides — the pack's `conventions.md`
spells out each. Xcode is not installed by mise; the pin says which one, and
installing it stays a person's step.

Moving to a new Xcode is one change: update the pin, fix what the new compiler
and SDK report, re-record goldens whose rendering the new SDK changed (and say
so in the change), and land it together.

## Configurations and schemes

- **Configurations are Debug and Release**, plus one per extra flavour the
  product needs — a staging build, a beta channel — each added in Xcode's
  project settings. A configuration's settings come from an `.xcconfig` file
  the project assigns to it, so a setting is a reviewed line in a file rather
  than a value buried in `project.pbxproj`.
- **Schemes are shared and committed**: one per app target and flavour, naming
  the build, test and run actions and the configuration each uses. The scheme
  Xcode creates with the app target is fine until a flavour needs its own;
  mark every scheme the tasks or CI run as shared.
- **Flavour differences are build settings, not code forks.** The API base URL,
  the bundle identifier suffix, the display name, the icon set — each is a
  setting the configuration fills, read by the app through its Info.plist or a
  generated constant. Code that branches on a flavour name is a smell; code
  that reads a configured value is not.

## Info.plist, entitlements and capabilities

Declared in the project — the target's Signing & Capabilities pane, its
Info.plist keys and its entitlements file — and committed with it. Every
capability the app uses — push, associated domains, App Groups, HealthKit,
background modes, iCloud — is declared there with the usage-description strings
the OS shows the user. A capability used in code but missing from the
entitlements fails at runtime, often silently; declare it in the same change
that first uses it.

## Signing

- **Signing identities and provisioning profiles are secrets.** They never land
  in the repo; CI receives them from the repo's secrets provider and installs
  them into a temporary keychain for the job.
- **The team id and bundle identifiers are configuration**, not secrets, and
  live in the project or its `.xcconfig` files.
- **Local development uses automatic signing** against the developer's own
  team; release builds use the explicitly declared identity and profile, so a
  release never depends on whatever the building machine happened to have.
- **Every target signs**, extensions included; an extension with a mismatched
  team or App Group is the commonest archive failure.

## Versions

The marketing version and the build number are two settings. The marketing
version is a product decision; the build number increases on every build a
store receives, set by CI, never by hand.
