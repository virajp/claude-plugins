---
name: swift
version: 0.1.0
category: development
description: Swift package development — the always-on coding baseline plus
  references for public-API design, the error model, strict concurrency, Swift
  Testing, the build, config and observability wiring. Auto-applies when editing
  any Swift file or the package manifest.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.swift"
  - "**/Package.swift"
---

# Swift

The single entry point for Swift package work. Each topic is its own
reference — **read the one matching your task**, not all of them. Start from
the baseline.

A package is a library other code builds against, so most of the judgment here
is about the **public surface**: what a consumer can see, what it can rely on,
and what a release is allowed to change. API reference is not here — look a
symbol up when you need it.

| Doing | Read |
| --- | --- |
| Anything — the always-on baseline, module layout, public API | [Coding standards](references/standards.md) |
| Deciding how a failure travels | [Error handling](references/error-handling.md) |
| Concurrency, actors, `Sendable`, cancellation | [The async model](references/async-model.md) |
| Writing or running tests | [Testing](references/testing.md) |
| Building, the task wiring, DocC, releases | [Build & run](references/build-and-run.md) |
| Configuration a library accepts | [Config & env](references/config-and-env.md) |
| Emitting logs, metrics, traces | [Observability wiring](references/observability-wiring.md) |

For `Package.swift`, `Package.resolved` and dependency hygiene, see the
**swiftpm** skill; for formatting, **swift-format**; for the lint gate,
**swiftlint**. No framework doctrine applies to a plain package — a framework
component brings its own.
