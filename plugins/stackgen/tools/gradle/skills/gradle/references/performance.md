# Build performance

Both caches are on from the first commit, in the root `gradle.properties`:

```properties
org.gradle.caching=true
org.gradle.configuration-cache=true
org.gradle.parallel=true
```

## The build cache

`org.gradle.caching=true` lets Gradle reuse a task's outputs when its inputs
have not changed — across branches and clean builds, not only incremental ones.

- **A task declares its inputs and outputs**, so its cache key is complete. A
  custom task with an undeclared input is a cache-poisoning bug: it serves
  stale outputs.
- **No absolute paths in inputs.** Use relative path sensitivity, so two
  checkouts share entries.
- A remote build cache is a deliberate later decision with its own credentials
  — never enabled as a side effect.

## The configuration cache

`org.gradle.configuration-cache=true` stores the configured task graph and
skips configuration on the next run with the same inputs.

- **Configuration does no work.** No file reads, no process launches, no
  network calls at configuration time — they become configuration inputs, or
  break the cache outright.
- **A task action never reaches `project`.** Capture what it needs as a
  `Property` or provider while configuring.
- **A plugin that cannot run under the cache is a finding**, not a reason to
  turn the cache off. Mark one task `notCompatibleWithConfigurationCache(...)`
  with the reason, and only for a task that genuinely cannot comply.

## `gradle.properties`

- **Tracked, at the root, build-wide settings only** — the caches, parallel
  execution, JVM arguments for the daemon (`org.gradle.jvmargs`), and Kotlin
  compiler flags such as `kotlin.code.style=official`.
- **Never a secret.** A credential is an environment variable the build reads
  through a provider, or the user's own `~/.gradle/gradle.properties` — never
  this file.
- `local.properties` is per-machine, ignored, and never read for anything a
  build depends on.
