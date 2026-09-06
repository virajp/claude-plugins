# Wave 2 — the `docs-reconciler` findings, 2026-09-06

Written by the orchestrator for U3. Condensed to
`path:line — stale claim →
what it should say`; U3 reads each file itself. Paths
are worktree-relative. The `DOCS FALSIFIED:` lines the wave-1 units returned are
in index.md's Run log and are U3's second input; the three under
`plugins/stackgen/` that no unit owns are routed to U5 by the orchestrator and
are **not** U3's.

## site/src/content/docs/plugins/stackgen.md

- :250 — charter fence lists "editor settings" as outside it → whole editor
  *files* stay out; per-pack `vscode.d/*.jsonc` fragments came in 2026-09-06
- :320 — hygiene pack file list stops at LICENSE/Renovate → add
  `.graphifyignore`, `CONTRIBUTING.md`, three `.github/` issue templates, the
  editor baseline fragment
- :374 — five-file split documents no lockfile at all → one tracked lockfile per
  tools-declaring config, `.config/mise.dev.lock`, `locked = true` in CI
- :421 — `code/*` task list omits a task → add `code/count`
- :428 — `code/merge/*` predicates list is short one → both refuse a destination
  branch missing locally, checked up front
- :437 — `setup:all` call order and task list stale → `setup:vscode` runs last;
  `setup:default-branch` exists, run by `/vwf:init`, not `setup:all`
- :501 — "Two things no pack can know" → more than two: add `REPO_NAME`,
  commit-gate scopes, forge links; `REPO_NAME` is literal, never derived (a
  worktree's directory is the branch name)
- :578 — caveat repeats "your editor settings" as a prerequisite → a whole
  editor file, not editor settings; fragments are inside the fence
- the Cloudflare passages — two services → three (Zero Trust Access, Workers
  Static Assets, Workers SSR); `cloudflare-workers-ssr` as the deploy for
  `astro-ssr` / `astro-hybrid` (U12's `DOCS FALSIFIED:`)

## site/src/content/docs/plugins/vwf.md

- :733 — doctor row omits a check → add "repo shape" (widens the cell; the whole
  table re-pads)
- :788 — shaped-repo inventory predates the additions → add `CONTRIBUTING.md` /
  issue templates / `.graphifyignore`, the repo-name slug, the composed
  `.vscode/` files
- :814 — "survey walks nine checks" → ten; the tenth is the gate-config fills,
  and pass 1 gained the root `dprint.json` move-and-shim
- :837 — report has six sections and two next-step lines → a seventh git section
  (branches, commit, pushed, forge default); the git pass itself is undocumented
  (U9's `DOCS FALSIFIED:` `:770-847`)
- :844 — "a second run produces an empty plan" unqualified → scoped to the same
  id source; add the "when to run it again" doctrine

## site/src/content/docs/how-to/operate/choosing-your-stack.md

- :41 — project axis names no website option → four Astro bundles `astro-ssg` /
  `astro-ssr` / `astro-hybrid` / `astro-csr`, differing by `output` and adapter
- :61 — managed deploy alternatives list three → add `cloudflare-workers-ssr`: a
  script in front of its own static assets, one deploy

## readme.md

- :249 — pack-owned config list omits two kinds → add the deploy target's
  config + deploy task, and the editor fragment `/vwf:init` merges; whole editor
  files join the fence line at :255

## CLAUDE.md

- :145 — rule 11 described as four assertions → seven: add the `.github/` root
  dir, the `.github/workflows/` refusal, the whole `pre-commit-config.yaml`,
  `vscode.d/*.jsonc` (U11's `DOCS FALSIFIED:`)

## .claude/docs/repo-shape.md

- :151 — "five assertions in one rule" → seven, the same four additions

## .claude/skills/plugin-authoring/references/checks.md

- :80 — rule 11 header says "Five assertions" → Seven
- :94 — root allowlist missing five entries → add `.graphifyignore`, `.npmrc`,
  `CONTRIBUTING.md`, `dprint.json`, and the `.config/` + `.github/` directories
- :95 — lists `CLAUDE.md` as allowlisted; `scripts/src/check.ts` never did —
  pre-existing, fix here (point at the code, do not restate)
- :105 — assertion bullets stop at the pre-commit fragment → append three:
  workflows refused, whole pre-commit config parsed, editor fragment three-key
  check

## .claude/skills/stackgen-plugin/SKILL.md

- :96 — workers-static-assets called the first cloud pack with a `config/` tree
  → workers-ssr ships the same pair (`main` entry); both are first
- :103 — "six kinds of entry" and the fenced-out list → a seventh entry (g)
  editor fragment, the `dprint-editor.jsonc` exception; the fence adds whole
  editor files, workflows refused inside `.github/`
- :105 — says `CLAUDE.md` is on the payload root allowlist — pre-existing error,
  same as checks.md:95
- :118 — rule 11 summary lists four assertions → seven

## .claude/skills/vwf-plugin/SKILL.md

- :64 — "merges the pre-commit fragments" → three merges (ignore sections,
  pre-commit, editor) plus the consent-gated git pass
- any passage describing init as writing files only (U9's `DOCS FALSIFIED:`)

## .claude/skills/vwf-plugin/references/skills-and-agents.md

- :19 — `init` row names only the `pre-commit.d/` merge → add the `vscode.d/`
  merge and the git pass (widens the cell; the table re-pads)

## Already correct (reconciler sweep)

`site/CLAUDE.md`, `.claude/docs/{plugins,ci-and-releases,dev-marketplace}.md`,
`site/src/content/docs/installer/*`, the greenfield and brownfield how-tos, the
generated `stacks/inventory.md`; no surface still names
`typescript-astro-react`.

## Routed to U5, not U3 (under `plugins/stackgen/`, no U3 ownership)

- `plugins/stackgen/assets/output-tree.md:155` — says `CLAUDE.md` is on the
  payload root allowlist; the code never listed it
- `plugins/stackgen/skills/stackgen-stack-template/SKILL.md:118-121` — "what it
  still may not write — … editor settings …" restates the pre-narrowing fence
- `plugins/stackgen/skills/stackgen-sync/SKILL.md` — restates the payload root
  allowlist, which now admits `dprint.json` and four more
