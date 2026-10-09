# Dependency locking

The catalog names direct versions; `gradle.lockfile` pins the whole resolved
graph, transitive dependencies included. Both are committed.

## Turning it on

Every project locks every configuration, in strict mode — through the
convention plugin every module applies, or in each `build.gradle.kts`:

```kotlin
dependencyLocking {
    lockAllConfigurations()
    lockMode.set(LockMode.STRICT)
}
```

`STRICT` fails a resolution whose configuration has no lock state, so a new
configuration cannot slip through unlocked. The settings script's own
classpath — the plugins `settings.gradle.kts` applies — is locked from
settings, into `settings-gradle.lockfile`:

```kotlin
// settings.gradle.kts
buildscript {
    configurations.classpath {
        resolutionStrategy.activateDependencyLocking()
    }
}
```

## Writing and moving the lock

```bash
./gradlew dependencies --write-locks                  # (re)write every lockfile
./gradlew dependencies --update-locks group:name      # move one module's entry
```

`dependencies` resolves the configurations it lists; in a multi-module build
run it for each module (`./gradlew :core:dependencies --write-locks`), or keep
a `resolveAndLockAll` task in the convention plugin that resolves every
resolvable configuration under `--write-locks`.

## Rules

- **Never edit a lockfile by hand.** Only `--write-locks` and
  `--update-locks` write it.
- **Moving a pin is its own change** — the catalog edit, if any, and every
  lockfile it touched, committed together and nothing else.
- **CI never writes a lock.** It runs without `--write-locks`, so a lockfile
  that no longer matches the declared graph fails the build instead of being
  rewritten on the runner.
- **A lockfile diff is read in review** like code: a new transitive entry is a
  new dependency.
- `build/`, `.gradle/` and `.kotlin/` are never committed.

## Supply chain

- **The lockfile is the supply-chain record.** It names every resolved module
  at its exact version, which is what a repo scanner reads — the language
  pack's `setup:deps:audit:kotlin` runs grype over it.
- **Repositories are few and declared once**, in settings, with
  `FAIL_ON_PROJECT_REPOS`: Maven Central and the Gradle Plugin Portal unless
  the user names another. A repository added for one library serves every
  coordinate it can, so ask before adding one.
- **Check by hand before adding or moving a dependency:** the group is the one
  the project's own documentation names (a look-alike group is a different
  publisher); the version is a release, not a snapshot; and the lockfile diff
  is what you expected.
- **A Gradle plugin runs code at build time** on every developer's machine and
  in CI — name that when asking for consent to add one.
- **The wrapper's `distributionSha256Sum` is set**, so the Gradle distribution
  itself is verified before it runs.

## Workspace

A multi-module build is one Gradle build — one `settings.gradle.kts`, one
catalog, one lockfile per module — and this pack covers it. Several
independent Gradle builds in one repo are the `workspace` bundle's concern,
and no Gradle workspace bundle ships.
