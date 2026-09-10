---
name: astro
version: 0.1.0
category: development
description: Astro development — the four rendering modes and the two config
  values they rest on, file routes and content collections, islands, the
  build-output contract, and testing. Layers on top of the TypeScript baseline
  rather than replacing it. Auto-applies when editing an Astro project's
  pages, config or content.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.astro"
  - "**/astro.config.*"
  - "**/src/content/**"
---

# Astro

Layers on the TypeScript baseline — read that skill's standards first; this
adds to them and replaces none of them. Astro owns the build, so a Vite plugin
belongs inside Astro's `vite` block and nowhere else.

**Astro has two `output` values, `static` and `server`.** Four project shapes
are built on them plus the adapter and the client directives. Read
[Framework doctrine](references/framework-doctrine.md) before deciding which
one a project is; read the per-mode reference once it is decided.

| Doing | Read |
| --- | --- |
| Deciding the mode, or understanding what Astro is for | [Framework doctrine](references/framework-doctrine.md) |
| A fully prerendered site | [SSG](references/ssg.md) |
| A site rendering on demand | [SSR](references/ssr.md) |
| A prerendered site with some request-time routes | [Hybrid](references/hybrid.md) |
| A browser-routed application in an Astro shell | [CSR](references/csr.md) |
| Routes, content collections, markdown, `src/` layout | [Content and routing](references/content-and-routing.md) |
| Anything about `dist/` — deploy, post-build steps | [Build output](references/build-output.md) |
| Writing or wiring tests | [Testing](references/testing.md) |
