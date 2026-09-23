# SwiftUI — build, flavours & signing

The build is declared in Tuist's manifests and run through the repo's tasks.
Nothing about it is configured by clicking in Xcode — see
[project layout](project-layout.md) for why that change would not survive.

## The pipeline

Two Tuist steps, always in this order: `tuist install` resolves the external
packages the dependency manifest declares, and `tuist generate` then writes the
Xcode project and workspace from `Project.swift`. They go together because the
generated project links what the install fetched — a project generated before
the install describes a dependency graph that is not there.

The repo's `setup:deps:install` task is that pair: it runs `tuist install`,
then `tuist generate` without opening Xcode. Run it after a fresh checkout,
after any manifest change, and after the lockfile moves. Its `--frozen` flag
resolves exactly what the lockfile records and fails when the manifest needs
something else, rather than rewriting it — the mode CI runs. Build and test
through the repo's tasks rather than the tools by hand; a CI job runs the same
tasks.

## The Xcode pin

The Xcode version is part of the build's inputs: it decides the Swift compiler,
the SDKs and the simulators. `Tuist.swift` declares the compatible Xcode
versions, and Tuist refuses to generate against any other. Xcode is not
installed by mise, and Tuist is — so the tasks check that `xcodebuild` and
`tuist` are on the path before doing any work. A machine without Xcode, or one
that has not run `mise install` yet, fails at the first line with what to
install, not halfway through a build. Which Xcode is acceptable stays the pin's
call, not the tasks'.

Moving to a new Xcode is one change: update the pin, fix what the new compiler
and SDK report, re-record goldens whose rendering the new SDK changed (and say
so in the change), and land it together.

## Configurations and schemes

- **Configurations are Debug and Release**, plus one per extra flavour the
  product needs — a staging build, a beta channel. Each configuration's
  settings come from an `.xcconfig` the manifest references, so a setting is a
  reviewed line in a file.
- **Schemes are declared** in the manifest: one per app target and flavour,
  naming the build, test and run actions and the configuration each uses.
  Tuist's generated default schemes are fine until a flavour needs its own.
- **Flavour differences are build settings, not code forks.** The API base URL,
  the bundle identifier suffix, the display name, the icon set — each is a
  setting the configuration fills, read by the app through its Info.plist or a
  generated constant. Code that branches on a flavour name is a smell; code
  that reads a configured value is not.

## Info.plist, entitlements and capabilities

Declared in the manifest, synthesized into `Derived/` on generate. Every
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
  live in the manifest or its `.xcconfig` files.
- **Local development uses automatic signing** against the developer's own
  team; release builds use the explicitly declared identity and profile, so a
  release never depends on whatever the building machine happened to have.
- **Every target signs**, extensions included; an extension with a mismatched
  team or App Group is the commonest archive failure.

## Versions

The marketing version and the build number are two settings. The marketing
version is a product decision; the build number increases on every build a
store receives, set by CI, never by hand.
