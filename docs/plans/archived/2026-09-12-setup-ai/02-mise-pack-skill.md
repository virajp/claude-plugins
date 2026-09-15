# U2 — The mise pack's skill: `setup:ai`, its flags and its two marked positions

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`,
  `.../skills/mise/references/task-library.md`,
  `.../skills/mise/references/config-files.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom; the `setup:ai` row is
  `task-library.md:154`, the `setup:all` tree `:245-260`, the marked positions
  `SKILL.md:146-153` and `config-files.md:84-86` (plan 1 added `MERGE_MODEL` and
  `MEMBERS` beside `REPO_NAME` — read what landed).
- **Lazy-load:** `01-setup-ai-task.md` for the exact flag names and row shapes
  you document.

## Ruling

Quoted from index.md, rulings 1–6 (the task's behaviour), and:

> **3.** … `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS` become marked positions …
> `init` runs `mise run setup:ai --inventory`, shows the rows as an MCQ, and
> writes the confirmed rows into the two positions.

## Edits

1. **`references/task-library.md`** — the `setup:ai` row shows
   `[--user] [--inventory]` and says: installs and updates the repo's required
   plugins at **project** scope through `claude plugin`, never touches user
   scope, `--inventory` lists what this machine has for the orchestrator's
   question. Add a short **`setup:ai`** subsection under §200 *setup* (beside
   `setup:vscode` §327) covering: the two modes it must survive (a marketplace
   registered from a repo or from a directory, never re-added), the required set
   (`vwf` plus the two slots), project scope and the `--user` exception,
   graphify wiring, the statusline hint. Keep it to the length of the
   `setup:vscode` section.
2. **`references/config-files.md`** — the marked-positions passage lists the two
   arrays in `setup/ai` beside `REPO_NAME`, `MERGE_MODEL`, `MEMBERS`, with their
   row shapes.
3. **`SKILL.md`** — `:146-153` marked positions: add the two; wherever the skill
   says the pack installs plugins through the installer, say `claude
   plugin`
   instead.
4. **`conventions.md`** — one sentence: the repo's agent plugins are declared at
   project scope by `setup:ai`; a user's own plugins are theirs.

## Verification

- `grep -n 'inventory' …/task-library.md …/SKILL.md` hits.
- `grep -rn 'pnpx\|installer' plugins/stackgen/stacks/toolchain-manager/mise/skills plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`
  shows no passage claiming the task uses the installer.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch `config/` (U1) or `pack.yaml` (U6).
- Match fold width by hand; `plugins/**/*.md` is not formatted.
- Delete with `rm`, never `git rm` (nothing to delete).

## Commit

`docs: task library describes setup:ai's project scope, its two modes and its inventory`
— written by the orchestrator after the wave gate. Type `docs`; no scope.
