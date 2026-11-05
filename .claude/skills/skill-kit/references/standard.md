# The standard

## Folders

Only `SKILL.md` is mandatory. Add a folder only when it has content, and use
these names.

| Path          | Holds                                   | Rule                                         |
| ------------- | --------------------------------------- | -------------------------------------------- |
| `SKILL.md`    | The entry point and router              | Routes to depth, and holds no depth          |
| `references/` | Depth that loads on demand              | One topic per file, no subfolders, no cap    |
| `workflows/`  | One file per invoke form                | Required at two or more forms                |
| `scripts/`    | Deterministic work                      | Node or bash only, idempotent, no user paths |
| `templates/`  | Skeletons of what the skill produces    | Required for generators                      |
| `assets/`     | Static inputs: schemas, contracts, data | Never loaded as prose                        |
| `examples/`   | Good and bad pairs for judgment calls   | Use instead of adjectives                    |

Evals go in one eval directory per plugin, because `claude plugin eval` reads it
there. Do not add `evals/` to a skill.

## Description

The description is the only part that is always in context. State what the skill
does, when to use it, and what it is not for. The mechanism goes in the body.

A doctrine description states scope and "Auto-applies when editing …". An
adapter description states "Implements X for Y. Invoked by Z by fixed name. Not
for direct use."

## Frontmatter

```yaml
name: execute
description: >-
  Runs an approved plan folder to completion in its own worktree. Use as
  /vwf:execute <folder>, next or all. Not for writing plans (use plan).
argument-hint: "<plan-folder> | next | all"
disable-model-invocation: true
metadata:
  archetype: workflow
  subtype: cloud-service
  depends-on: [ plan-management, git-workflow ]
  implements: stackgen/design-import-screens@1
  invocation-reason: why the state differs from the archetype default
  deprecated: true
```

- `metadata.archetype` is required — every budget and section rule reads it.
- `metadata.depends-on` names the skills that this skill delegates to — the lint
  finds a user-only target through it.
- `metadata.invocation-reason` is required only when the state differs from the
  default and no skill depends on this one — the reason stays beside the
  exception.
- No per-skill version or changelog — a tracked version moves only at release.
- Keep an existing `version` or `category` key of a pack — the pack format owns
  those keys.

## Invocation

Follow `plugins/stackgen/assets/artifact-doctrine.md` §2. A skill must be
model-invocable when anything delegates to it, because a user-only skill leaves
the model's context with no error.

## Compact

The measure is always-loaded words: the `SKILL.md` body, plus each file that a
table marks `always`.

Each table that routes to a file has a `Loads` column, with the value `always`
or `sometimes`. A file that most runs read is `always`.

The budget is a warning. It never blocks, and `sometimes` references have no
cap.

## Duplication

Shared doctrine lives in one place, and other skills link to it. A section over
about 20 lines moves to `references/` and leaves a Routing row.
