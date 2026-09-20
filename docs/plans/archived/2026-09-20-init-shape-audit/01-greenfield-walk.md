# U1 — greenfield walk: blank, and with source

- **Wave:** 1
- **Depends on:** —
- **Owns:** `docs/memory/problems/2026-09-20-init-shape-audit-greenfield.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/init/SKILL.md` whole;
  `plugins/vwf/skills/init/references/new-repo.md` whole;
  `plugins/vwf/skills/init/references/fragments-and-sections.md` whole;
  `plugins/vwf/skills/init/references/readme-and-license.md` whole;
  `plugins/vwf/skills/setup/SKILL.md` Step 0, the blank-vs-code fork and the
  materialize pass; `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the file shape and
  the AAAK first line).
- **Lazy-load:** the three bundles' `pack.yaml` and `conventions.md` under
  `plugins/stackgen/stacks/toolchain-manager/mise/`,
  `plugins/stackgen/stacks/toolchain-gate/*/`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/`; their `config/` trees
  only to confirm a landed path; `plugins/stackgen/assets/pack-format.md`.

## Ruling

Decision 1 — Method: "**Read-only walks** of the init skill, its references and
the three unconditional bundles' payloads; every finding cites `file:line` in
the plugin and, where it applies, the pack file that lands. No scratch-repo run,
no emulated fixture."

Decision 2 — Register shape: "One table per mode with the columns: landed path ·
source pack · what init reads first (or "nothing") · behaviour when the path
exists (overwrite / keep / offer / merge / splice / unspecified) ·
stack-conditional (yes / no / should be, with why) · duplicate or conflict risk
· pointer. Below each table, the findings as numbered lines, each with a
severity — blocks a user / surprises a user / cosmetic."

Decision 4 — Modes covered: "Greenfield blank and greenfield-with-source, as one
walk with two columns where they differ (both are "new" today); … the members
walk — base plus members — as a section under each."

Decision 5 — Lens: "Three questions asked of every landed path: *what did init
read from this repo before landing it* · *what would a repo plausibly already
have here, and what happens to it* · *is this landing right for a repo whose
stack the registry names*."

## Edits

1. **`docs/memory/problems/2026-09-20-init-shape-audit-greenfield.md`** — new.
   Sections, in order: the AAAK line; **How "new" is decided** (the rule, its
   pointer, and what a repo with source but no `.config/` gets); **What init
   reads on a new repo** — the exhaustive list with pointers (folder name,
   `.gitmodules`, `members:`, the registry when present, the materializer
   lockfile, git `user.name`, `origin`), and what it does not read (manifests,
   lockfiles, existing dotfiles, `stacks:`); **The register** — the table of
   decision 2 over every landed path, with a "with source" column noting where a
   source-bearing repo plausibly already has the path (`.gitignore`,
   `.editorconfig`, `.gitattributes`, `CONTRIBUTING.md`, `renovate.json`, a root
   `dprint.json`, a `.github/` tree, a `.vscode/` pair, a pre-existing
   `mise.toml` at the root); **The members walk** — what changes per member;
   **Findings** — numbered, severity-tagged, each with the three lens questions
   answered in one line each; **D2 candidates** — what the greenfield mode would
   have to read to choose its shape (the registry's platforms and languages,
   `stacks:` pins, the manifests) and which landed paths would become
   conditional.

## Verification

- `mise run code:precommit` green (the file is dprint-formatted).
- Every row of the register carries a pointer; every finding cites at least one
  `file:line` — `grep -c ":[0-9]" <owned file>` is at least the number of
  findings.
- The file opens with the AAAK line the memory shape asks for.

## Guardrails

- Write **only** the owned file; read everything else. No edit under
  `plugins/**`.
- Do not re-audit the `.vscode` collision — cite
  `docs/plans/2026-09-20-init-editor-dedupe` (live or archived) and move on.
- Do not propose fixes beyond naming D2 candidates; a fix is a ruling D2's
  interview makes.
- Do not end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init shape audit — greenfield walk` — written by the orchestrator after
the wave gate. Type from `.config/git-conventional-commits.yaml`; no scopes.
