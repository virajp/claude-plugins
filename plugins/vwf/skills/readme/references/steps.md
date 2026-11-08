# Steps

## §1 — Detect

Gather the facts before writing, from the Detect signals table in `SKILL.md`.

- Record each project's path, name, language or stack, and purpose.
- Use the architecture facts to draw the diagram and capture the key decisions.
- Local development: this marketplace standardizes on **mise**.
  `MISE_ENV=dev mise run setup` alone is the single bootstrap entrypoint. It
  installs the pinned tools itself, over the `setup:*` steps that it already
  orders.
- Note `MISE_ENV=dev mise run setup:worktree` too, where the repo has one. It is
  the lighter bootstrap that a fresh worktree runs. A contributor who does not
  know it exists runs the slow path forever.
- Task runner: prefer mise when more than one is present. Read the tasks from
  whichever exists. Pick the ones used day to day: setup, the lint, test and
  build gates, dev or run, and release. If none exists, there is no section 8.

## §2 — Ask

Ask in one batched round, and only for what the scan cannot answer:

- The one-line description or tagline, if none exists.
- Which detected cloud services are in use, and which are vestigial.
- Confirmation of the architecture's boundaries, before you draw the diagram.
- A project's purpose, where the scan does not show it.

## §3 — Write

Update an existing README in place, and keep its filename and casing,
`README.md` or `readme.md`. Otherwise create `readme.md`. Lowercase is the
default, because every other file this toolkit lays at a repo root is lowercase.
A README that shouts is the one exception nobody chose.

The README must contain these sections, in this order:

1. **Title** — the project name as the `#` H1.
2. **Short description** — one or two sentences on what the project is and does.
3. **List of projects** — every project or package in the repo. Use a table for
   a monorepo, and a single entry for a multi-repo member.
4. **Architecture** — a `mermaid` diagram of how the projects and services fit
   together. Add the notes a reader needs: boundaries, data flow, key decisions.
5. **Infrastructure** — every cloud tool or service the repo uses.
6. **Local Development** — a step-by-step guide to run the repo locally.
7. **Projects** — one detailed section per project in a monorepo, or a single
   project section for a multi-repo member.
8. **Important tasks** — the commands a developer runs day to day, from the
   repo's task runner. Omit the section when the repo has no task runner.

Follow the `documentation-standards` skill:

- Use short sentences, the active voice and no filler. Put a language id on
  every code block.
- Use tables for the list of projects, infrastructure, and important tasks.
- **List of projects** is a table: `| Project | Path | Stack | Purpose |`.
- **Infrastructure** is a table: `| Tool / Service | Used for |`.
- **Architecture diagram**: use `mermaid`, with the type chosen by purpose:
  `flowchart` for topology or dependencies, `sequenceDiagram` for request flows.
  - Use no `%%{init}%%` or custom themes, for GitHub and GitLab portability.
  - Quote any label with special characters: `A["api (node)"]`.
  - Animate any dotted or loop-back edge.
  - Draw one concept per diagram, and split one that sprawls.
  - Make each note state the why, not just the what.
- **Local Development** is ordered, copy-pasteable steps:
  1. Clone.
  2. Set up the env.
  3. Run `MISE_ENV=dev mise run setup`, with no `mise install` before it.
  4. State how to run it.
  5. Add `MISE_ENV=dev mise run setup:worktree` for a fresh worktree, when the
     repo defines it.
- **Projects**, per project: what it is, its stack, how to run and test it, and
  its key tasks.
- **Important tasks** is a table: `| Task | What it does |`. Use real names from
  the detected runner: `mise tasks`, `package.json` scripts, the `Makefile`
  targets, or the `justfile` recipes.
