---
name: html
version: 0.1.0
category: development
description: Hand-authored HTML5 static site development — the page tree with
  no framework behind it, multi-page Vite input, the per-page head checklist,
  ES-module scripts, the build-output contract and its copy-only opt-out, and
  validation. Layers on top of the TypeScript baseline rather than replacing
  it. Auto-applies when editing a page, the Vite config, or the site's CSS
  and JS directories.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.html"
  - "**/vite.config.*"
  - "**/src/css/**"
  - "**/src/js/**"
---

# HTML

Layers on the TypeScript baseline — read that skill's standards first; this
adds to them and replaces none of them. There is no framework: a page is a
complete HTML document written by hand, Vite serves the tree in development
and builds it, and a stylesheet plugin goes in `vite.config.ts` because that
is the only build config there is.

**Every page is listed in the Vite config's `input`, or it is not built.**
That is the one fact a person editing this tree gets wrong first, and
[Pages and navigation](references/pages-and-navigation.md) is where it is
explained. Read [Framework doctrine](references/framework-doctrine.md) before
adding anything that looks like a template, a component or a router: it says
when a site has outgrown this pack.

| Doing | Read |
| --- | --- |
| Understanding what this pack is for, and when to leave it | [Framework doctrine](references/framework-doctrine.md) |
| Adding a page, linking between pages, the 404 page | [Pages and navigation](references/pages-and-navigation.md) |
| Anything about `dist/` — deploy, the copy-only opt-out, post-build steps | [Build output](references/build-output.md) |
| The head — the per-page checklist, canonical, robots, sitemap, icons | [Head](references/head.md) |
| Writing a script, `.ts` or `.js`, what may be imported | [Scripts](references/scripts.md) |
| Validating pages, and what is not tested here | [Testing](references/testing.md) |
