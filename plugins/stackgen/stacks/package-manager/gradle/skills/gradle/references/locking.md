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

The language pack's task library writes and checks every lockfile in the
build:

```bash
mise run setup:deps:install:kotlin   # check every lockfile; write them only when none exists
mise run setup:deps:upgrade:kotlin   # re-lock every project after a catalog edit
```

Both pass Gradle a throwaway init script that registers a
`stackgenResolveAll` task in every project, resolving each resolvable
configuration — under `--write-locks` when writing — so each module's
`gradle.lockfile`, and `settings-gradle.lockfile`, is written in one run and
nothing is added to the build. `./gradlew dependencies --write-locks` is not
the same thing: it runs in the root project alone, and its report resolves
leniently, so a lock violation prints `FAILED` and still exits 0.

To move one module's entry without re-resolving the rest, pass
`--update-locks group:name` to the same resolve-everything run instead of
`--write-locks`.

## Rules

- **Never edit a lockfile by hand.** Only a `--write-locks` or
  `--update-locks` run writes it.
- **Moving a pin is its own change** — the catalog edit, if any, and every
  lockfile it touched, committed together and nothing else.
- **CI never writes a lock.** It runs without `--write-locks`, so a lockfile
  that no longer matches the declared graph fails the build instead of being
  rewritten on the runner.
- **A lockfile diff is read in review** like code: a new transitive entry is a
  new dependency.
- `build/`, `.gradle/` and `.kotlin/` are never committed.

## Supply chain

- **The lockfile is a version record, not an integrity check.** It names
  every resolved module at its exact version, which is what a repo scanner
  reads — the language pack's `setup:deps:audit:kotlin` runs grype over it —
  and what stops a dependency moving without a reviewed diff. It holds no
  artifact hash. A repository or mirror that serves different bytes under the
  same coordinates and version, or a swapped plugin artifact, resolves cleanly
  against the lock and runs at build time.
- **Artifact integrity is Gradle's dependency verification**, a layer a repo
  adds when it needs it; this pack does not turn it on. Generate
  `gradle/verification-metadata.xml` from a dependency set you already trust,
  with SHA-256 or SHA-512 only (MD5 and SHA-1 are not secure):

  ```bash
  ./gradlew --write-verification-metadata sha256 build
  ```

  Gradle records only what the run resolves, so run the tasks that resolve
  every configuration the build uses.

  Commit the file; from then on Gradle checks every artifact, plugins
  included, against it and fails the build on a mismatch or on an artifact it
  has no entry for. Re-run the same command in the change that adds or moves
  a dependency, and read the new checksums in review like the lockfile diff —
  regenerating it on a compromised resolution records the compromise. Signature
  verification (`verify-signatures`) is the stronger form, at the cost of
  maintaining trusted keys.
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
