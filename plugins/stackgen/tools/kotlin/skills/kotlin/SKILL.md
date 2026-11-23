---
name: kotlin
version: 0.1.0
category: development
description: Kotlin/JVM library development — the always-on coding baseline plus
  references for null safety and the error model, coroutines and flows,
  kotlin.test on JUnit 5, the JDK toolchain and the language server, the build,
  config and observability wiring. Auto-applies when editing any Kotlin file or
  Gradle build script.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.kt"
  - "**/*.kts"
---

# Kotlin

The single entry point for Kotlin/JVM library work. Each topic is its own
reference — **read the one matching your task**, not all of them. Start from
the baseline.

A library is code other builds compile against, so most of the judgment here
is about the **public surface**: what a consumer can see, what it can rely on,
and what a release is allowed to change. API reference is not here — look a
symbol up when you need it.

| Doing | Read |
| --- | --- |
| Anything — the always-on baseline, idioms, null safety, public API | [Coding standards](references/standards.md) |
| Modules, source sets, where a file goes | [Project layout](references/project-layout.md) |
| Deciding how a failure travels | [Error handling](references/error-handling.md) |
| Coroutines, flows, dispatchers, cancellation | [The async model](references/async-model.md) |
| Writing or running tests | [Testing](references/testing.md) |
| The JDK, the Gradle wrapper, the language server | [Toolchain](references/toolchain.md) |
| Building, the task wiring, releases | [Build & run](references/build-and-run.md) |
| Configuration a library accepts | [Config & env](references/config-and-env.md) |
| Emitting logs, metrics, traces | [Observability wiring](references/observability-wiring.md) |

For the build scripts, the version catalog, `gradle.lockfile` and dependency
hygiene, see the **gradle** skill; for formatting and the style lint,
**ktlint**; for the static-analysis gate, **detekt**. No framework doctrine
applies to a plain library — a framework component brings its own.
