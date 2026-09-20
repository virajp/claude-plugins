# U2 — brownfield walk: every pass of the existing mode

- **Wave:** 1
- **Depends on:** —
- **Owns:** `docs/memory/problems/2026-09-20-init-shape-audit-brownfield.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/init/SKILL.md` whole;
  `plugins/vwf/skills/init/references/existing-repo.md` whole — every pass in
  order; `plugins/vwf/skills/init/references/fragments-and-sections.md`;
  `docs/memory/decisions/2026-09-12-init-brownfield-sidecar-and-diverged-files.md`;
  `docs/memory/decisions/2026-09-13-init-walks-the-members.md`;
  `docs/memory/decisions/2026-09-14-repo-name-is-the-folder.md`;
  `docs/plans/archived/2026-09-05-vwf-init/index.md:500-530` (the two recorded
  side effects); `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.
- **Lazy-load:** the three bundles' `conventions.md` and `config/` trees, to
  confirm what a pass compares against;
  `plugins/vwf/skills/doctor/references/stack-checks.md:284-453` (the
  predicates, since a brownfield run is also what `reshape` runs).

## Ruling

Decision 1 — Method: "**Read-only walks** … every finding cites `file:line` in
the plugin and, where it applies, the pack file that lands. No scratch-repo run,
no emulated fixture."

Decision 2 — Register shape: "One table per mode with the columns: landed path ·
source pack · what init reads first (or "nothing") · behaviour when the path
exists (overwrite / keep / offer / merge / splice / unspecified) ·
stack-conditional (yes / no / should be, with why) · duplicate or conflict risk
· pointer. Below each table, the findings as numbered lines, each with a
severity — blocks a user / surprises a user / cosmetic."

Decision 4 — Modes covered: "brownfield, every pass of `existing-repo.md` in
order; the members walk — base plus members — as a section under each."

Decision 5 — Lens: "*what did init read from this repo before landing it* ·
*what would a repo plausibly already have here, and what happens to it* · *is
this landing right for a repo whose stack the registry names*."

The user's observations that aim this walk, verbatim from the interview:
"Ignored what the repo already had"; "Duplicate / conflicting entries" beyond
`.vscode`; "there might be other side-effects which I haven't observed".

## Edits

1. **`docs/memory/problems/2026-09-20-init-shape-audit-brownfield.md`** — new.
   Sections, in order: the AAAK line; **The passes** — one subsection per pass
   of `existing-repo.md` in the file's order, each stating what the pass reads,
   what it compares against, what it writes, and what it explicitly exempts (the
   editor dir at `:69-72` is one); **The register** — the table of decision 2
   over every landed path, where "behaviour when the path exists" is the pass's
   actual rule (replace-or-keep offer, sidecar move, kept-and-listed, marker
   splice, or *unspecified* where no pass names the path); **Duplicates and
   conflicts** — every path where a landed file and a pre-existing file can both
   end up active (a root `mise.toml` beside `.config/mise.toml`; a root
   `.pre-commit-config.yaml` beside `.config/pre-commit-config.yaml`; a root
   `dprint.json` that is not the shim; two renovate configs; `.gitignore`
   entries doubled by an append; a `CONTRIBUTING.md` the repo wrote; a
   `SECURITY.md` that already exists; `.github/` templates beside a repo's own)
   — for each, what the passes do today with a pointer, or "nothing reads it";
   **The two recorded side effects** and whether the passes as written still
   permit each; **The members walk** — what differs per member and what the
   base's gitlink commit assumes; **Findings** — numbered, severity-tagged; **D2
   candidates** — the read-before-land rules the register shows missing.

## Verification

- `mise run code:precommit` green.
- Every row of the register carries a pointer; every finding cites at least one
  `file:line`.
- The "Duplicates and conflicts" section names every path in the Edits list
  above, each with a pointer or the words "nothing reads it".
- The file opens with the AAAK line.

## Guardrails

- Write **only** the owned file; read everything else. No edit under
  `plugins/**`.
- The `.vscode` collision is ruled — cite the `init-editor-dedupe` plan and do
  not re-audit it.
- Name findings, not fixes; D2 candidates are one line each.
- Do not end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`docs: init shape audit — brownfield walk` — written by the orchestrator after
the wave gate. Type from `.config/git-conventional-commits.yaml`; no scopes.
