---
name: skill-kit
description: >-
  Creates, lints and rewrites skills to one compact standard, and proves that a
  rewrite keeps every rule. Use when writing or changing any skill in this repo,
  or as /skill-kit new, lint or rewrite. Not for plugin manifests or hooks (use
  plugin-authoring).
argument-hint: "new <archetype> <name> | lint [path | --all] | rewrite <path>"
allowed-tools: Read Grep Glob Edit Write Bash Agent
user-invocable: true
disable-model-invocation: false
metadata:
  archetype: workflow
---

# skill-kit

Holds the standard for every skill in this repo. Scripts decide exact rules, and
a fresh reviewer decides judgment rules. In all commands, `<skill-kit>` is the
folder of this skill.

## Invoke

| Form                     | Workflow                           | Loads     |
| ------------------------ | ---------------------------------- | --------- |
| `new <archetype> <name>` | [new.md](workflows/new.md)         | sometimes |
| `lint [path \| --all]`   | [lint.md](workflows/lint.md)       | sometimes |
| `rewrite <path>`         | [rewrite.md](workflows/rewrite.md) | sometimes |

## Routing

| Doing                           | Read                                              | Loads     |
| ------------------------------- | ------------------------------------------------- | --------- |
| Writing any part of a skill     | [standard.md](references/standard.md)             | always    |
| Writing prose                   | [style.md](references/style.md)                   | always    |
| Choosing an archetype           | [archetypes.md](references/archetypes.md)         | sometimes |
| Reading a lint finding          | [rules.md](references/rules.md)                   | sometimes |
| Moving this skill into a plugin | [move-to-plugin.md](references/move-to-plugin.md) | sometimes |

## State

| File                              | Access     | Owner                  |
| --------------------------------- | ---------- | ---------------------- |
| The target skill folder           | read/write | this skill, by consent |
| The scratch copy of the old skill | read/write | this skill             |
| The scratch ledger of a rewrite   | read/write | this skill             |
| `assets/config.json`              | read       | this repo              |
| `assets/archetypes.json`          | read       | this skill             |

## Phases

| Phase            | Gate                  | File                               |
| ---------------- | --------------------- | ---------------------------------- |
| Choose archetype | user, only if two fit | [new.md](workflows/new.md)         |
| Scaffold         | auto                  | [new.md](workflows/new.md)         |
| Lint             | auto                  | [lint.md](workflows/lint.md)       |
| Ledger           | auto                  | [rewrite.md](workflows/rewrite.md) |
| Drop a rule      | user                  | [rewrite.md](workflows/rewrite.md) |

## Halt and pause

| ID | Condition                                    | Action                      |
| -- | -------------------------------------------- | --------------------------- |
| H1 | The target folder exists at `new`            | Stop, and name the folder   |
| H2 | A lint error remains                         | Fix it, then run lint again |
| H3 | A ledger entry has no match after two rounds | Stop, and show the entries  |
| H4 | The rewrite wants to drop a rule             | Ask the user for each entry |

## Output

- `new`: a skill folder with TODO markers, and the lint result.
- `lint`: one line per finding, and a count per rule.
- `rewrite`: the rewritten skill, the settled ledger, and word counts before and
  after.

## Never

- Never rewrite with no ledger; extract one first — a lost rule fails silently
  at run time.
- Never change behavior in a rewrite; make a separate change — each needs its
  own review.
- Never copy a rule that `p:plugins:check` owns; link to it — two owners drift
  apart.
- Never bump a version in a rewrite; record the release level — a version moves
  only at release.
- Never commit, merge or push without consent; ask first — the user owns each
  landing.
