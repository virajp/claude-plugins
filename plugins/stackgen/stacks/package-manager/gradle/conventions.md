# Gradle — conventions

Gradle is the only build tool and the only package manager, and it runs from
the wrapper the repo commits: nothing installs Gradle beside the JDK, and
nothing pins it but `gradle/wrapper/gradle-wrapper.properties`.

**The wrapper is committed, and it is the only way Gradle runs.** `gradlew`,
`gradlew.bat`, `gradle/wrapper/gradle-wrapper.jar` and
`gradle/wrapper/gradle-wrapper.properties` are tracked, and every command is
`./gradlew …` — never a `gradle` on `PATH`, whose version is whatever the
machine carries. Moving Gradle is `./gradlew wrapper --gradle-version <x>`, run
twice (the second run lets the new wrapper rewrite itself), with
`distributionSha256Sum` set, committed on its own.

**The Kotlin DSL, and only the Kotlin DSL.** `settings.gradle.kts` and
`build.gradle.kts`; no Groovy build script is added beside them. Build logic
shared by several modules is a convention plugin in an included build
(`build-logic/`), never `allprojects {}` or `subprojects {}`.

**The version catalog is the one place a version is written.**
`gradle/libs.versions.toml` declares every library and plugin version; a build
script reads `libs.<alias>` and never spells a coordinate with a version in it.

**`gradle.lockfile` is the pin, and it is committed.** Dependency locking is on
for every configuration, so a dynamic or ranged version still resolves to the
exact versions the lockfile records. Only `./gradlew dependencies --write-locks`
(or `--update-locks <group>:<name>`) writes it; a lockfile is never edited by
hand, and CI never writes one — a stale lockfile fails the build.

**Updates are reported, not applied.** The `gradle-versions-plugin`, declared in
the catalog, reports what has moved; moving a version is a catalog edit and a
`--write-locks` run, committed together.

**The build cache and the configuration cache are on.** `gradle.properties`
sets `org.gradle.caching=true` and `org.gradle.configuration-cache=true`, so a
build that breaks either is caught the day it is written.

**`build/`, `.gradle/` and `.kotlin/` are regenerable** and never committed;
the universal `.gitignore` tool-config lands carries them.

## What this pack writes

Nothing into the repo. The dependency subtasks — `setup/deps/<verb>/kotlin` —
call `./gradlew`, and they belong to the language pack, which owns the JDK they
run on.

Full judgment: the `gradle` skill.
