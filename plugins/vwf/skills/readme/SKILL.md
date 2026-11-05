---
name: readme
description: >-
  Creates or updates the repository's README from a scan of the codebase: the
  project list, an architecture diagram, infrastructure, local development, and
  the task-runner commands. Use as /vwf:readme [target-dir]. Not for reconciling
  docs after a change (use docs-sync).
argument-hint: "[target-dir]"
model: sonnet

user-invocable: true
disable-model-invocation: false
metadata:
  archetype: workflow
  depends-on: [documentation-standards]
---

# readme

Scans the repository and writes or updates its README, following the
`documentation-standards` skill: writing style, tables, and the mermaid diagram
rules. The target defaults to the current repo root. If `$ARGUMENTS` names a
directory, operate on `<dir>`.

## State

| File                                                | Access      | Owner      |
| --------------------------------------------------- | ----------- | ---------- |
| the existing `README.md` or `readme.md`             | read, write | this skill |
| `readme.md`, when the repo has no README            | written     | this skill |
| the repo's manifests, configs and task-runner files | read        | the repo   |
| `docs/blueprint/architecture.md`, if present        | read        | the repo   |

## Phases

| §   | Phase                                                                | Gate                           | File                            | Loads  |
| --- | -------------------------------------------------------------------- | ------------------------------ | ------------------------------- | ------ |
| 1–3 | Detect by a scan, ask what cannot be inferred, write the eight sections | user at §2, one batched round | [steps.md](references/steps.md) | always |

## Detect signals

The tool names stay in this file, because the plugin checker allows them in
`skills/readme/SKILL.md` and not in a reference. This skill documents a repo that
it did not choose, so it has to recognize what is there.

| Fact                    | Scan for                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title and description   | The repo or package name (`package.json` `name`, `pubspec.yaml`, `Cargo.toml`, `pyproject.toml`, the git remote, or the directory name), and any existing description or tagline                                                                                                                                                                                                                                                                                                                                                                       |
| Layout and projects     | Monorepo or multi-repo: `pnpm-workspace.yaml`, `package.json` `workspaces`, `melos.yaml`, `nx.json`, `turbo.json`, a Cargo `[workspace]`, `go.work`, or multiple package manifests in sub-directories                                                                                                                                                                                                                                                                                                                                                  |
| Architecture            | How the projects relate: workspace or import dependencies between packages, service boundaries (api, worker, web, db), entry points, and any existing `docs/blueprint/architecture.md` (for example a vwf Project Registry)                                                                                                                                                                                                                                                                                                                            |
| Infrastructure          | IaC (`*.tf`, Pulumi, CDK, CloudFormation); containers and orchestration (`Dockerfile`, `docker-compose*`, k8s manifests, Helm); CI/CD (`.github/workflows`, `.gitlab-ci.yml`); deploy configs (`vercel.json`, `netlify.toml`, `fly.toml`, `render.yaml`, `app.yaml`, `serverless.yml`); and cloud SDKs or services in dependencies or config (AWS, GCP, Azure, Firebase, Supabase, Vercel, Cloudflare, Neon, PlanetScale, …)                                                                                                                           |
| Local development       | The toolchain manager, env setup (`.env.example`, mise `[env]`), and prerequisites                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Task runner             | mise (`mise.toml` or `.config/mise*.toml`, then `mise tasks`), `package.json` `scripts`, a `Makefile`, or a `justfile`                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## Halt and pause

| ID | Condition                                  | Action                                            |
| -- | ------------------------------------------ | ------------------------------------------------- |
| H1 | A fact of §2 cannot be inferred from a scan | Ask in the one round of §2. Do not invent the fact |

## Output

State:

- Whether you created or updated the README.
- The layout detected, monorepo or multi-repo, and the projects listed.
- Anything you had to ask about, such as a cloud service that you flagged.
- Anything you could not determine, such as a service you could not confirm.

## Never

- Delete a section outside the eight, such as License, Contributing or badges.
  Refresh the eight in place, and keep every other section — they are not this
  skill's.
- Rename an existing uppercase README; keep its filename and casing — renaming
  is a repo-shape move. `/vwf:init` makes it, as one line of a surveyed plan.
- Invent a description, a cloud service or a project's purpose; ask — a guess
  reads as a fact in a README.
- Invent a task name; use real names from the detected runner — a reader runs
  these commands as written.
