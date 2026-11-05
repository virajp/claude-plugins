---
name: documentation-standards
version: 0.3.1
category: development
description: Opinionated standards for writing and maintaining Markdown
  documentation — writing style, code blocks, tables, CHANGELOGs, and diagrams.
  Auto-applies when editing any Markdown file.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write
paths:
  - "**/*.md"
metadata:
  archetype: doctrine
---

# Markdown & Documentation Standards

Holds the standards for each Markdown file, and for keeping docs current.

## Routing

| Doing                                     | Read                                  | Loads     |
| ----------------------------------------- | ------------------------------------- | --------- |
| Writing or editing any Markdown file      | [writing.md](references/writing.md)   | always    |
| Adding or changing a diagram              | [diagrams.md](references/diagrams.md) | sometimes |
| Changing code that docs describe          | [upkeep.md](references/upkeep.md)     | sometimes |
| Bumping a version, or writing a CHANGELOG | [upkeep.md](references/upkeep.md)     | sometimes |

## Neighbours

- For a repository README, see the `readme` skill, which follows these standards.
- Under `docs/blueprint/`, `blueprint-authoring` and `design-system-authoring`
  apply together with this skill.
