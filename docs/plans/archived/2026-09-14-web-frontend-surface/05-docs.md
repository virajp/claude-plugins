# U5 — docs

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`,
  `docs/backlog.md`
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` — run it
  over the run's branch delta (`git diff develop...HEAD --stat` names the
  files); then every `DOCS FALSIFIED:` line the wave-1 and wave-2 reports
  returned; then the survey list below.
- **Lazy-load:** the unit files `01`–`04` of this folder, for the wording of a
  ruling a doc must restate.

## Ruling

Every decision in `index.md`'s table as it reaches a human-facing doc; the
sentences a manual page must now say are, in the plan's words:

Decision 1: "A seventh vwf axis `stylesheet`, per project, mirroring `design` in
every rule … required for a project declaring a `site` or `webapp` platform,
absent otherwise; `config_format` 18 → 19".

Decision 2: "Three shipped packs — `tailwindcss`, `stylex`, `plain-css` … plus
stackgen's `generate` door".

Decision 5: "Mint `stylesheet` in `kinds.md` … type `stylesheet` in
`taxonomy.md`; one bundle per pack".

Decision 6: "Doctrine + contract + one task: Astro's `conventions.md` gains
`## Head`; the pack lands `config/.config/mise/tasks/p/_project/icons` …".

Decision 8: "`site`: the full set, always. `webapp`: favicons + manifest +
`<title>` always; the SEO/OG set … only when the project's registry
`capabilities:` lists `seo`".

Decision 9: "A `Metadata` block per Screens row on `site` and `webapp` platform
files … `blueprint_format` 24 → 25".

Decision 10: "Text facts … in `docs/blueprint/conventions.md` under the
`web-metadata` section; visual assets … named by the design system under a
`Brand assets` section".

## Edits

1. **The survey's list, every hit** — "six axes" at
   `site/src/content/docs/plugins/vwf.md:103,549,584`,
   `site/src/content/docs/plugins/stackgen.md:205` ("six axes — `design` and
   `cicd` — are **tool axes**" → three tool axes, seven in all),
   `site/src/content/docs/how-to/operate/choosing-your-stack.md:3,12` (the
   frontmatter `description:` **and** the body — frontmatter is strict YAML),
   `site/src/content/docs/how-to/index.md:63`; then grep `readme.md`,
   `CLAUDE.md`, `.claude/` and `site/src/content/docs/` for "six axes", "six
   independent", "twelve kinds", "12 kinds" and "fourteen" for whatever else
   counts them.
2. **`site/src/content/docs/plugins/stackgen.md`** — the pack-type list gains
   `stylesheet` with its three packs and the `generate` door; the kinds count;
   the Astro pack row says it lands an `icons` task and carries the head
   doctrine at `0.2.0`; a short passage on `contracts/web-head.md`.
3. **`site/src/content/docs/plugins/vwf.md`** — the axis table gains the
   `stylesheet` row (per project, `site`/`webapp` only, slug is the value,
   deferrable); the `/vwf:architecture` section names the stylesheet round; the
   blueprint section names the per-screen `Metadata` block and the two
   product-wide homes; the format numbers wherever the page states them
   (`config_format` 19, `blueprint_format` 25).
4. **`site/src/content/docs/how-to/operate/choosing-your-stack.md`** — one axis
   section for `stylesheet`: when it is asked, the three entries and what each
   trades, `generate`, defer.
5. **The greenfield / brownfield how-tos** —
   `how-to/greenfield/{single-repo,multi-repo,ui-with-design-tool}.md` and
   `how-to/brownfield/{onboard-existing-codebase,migrate-old-vwf-repo}.md`:
   where a walk-through lists the axis rounds, add the stylesheet round for a
   `site`/`webapp` project; where one shows a `.config/vwf.yaml`, add the key;
   `migrate-old-vwf-repo.md` names the `18 → 19` migration (writes
   `stylesheet: unresolved`) and the `24 → 25` blueprint drift (the `Metadata`
   block, proposed never auto-filled).
6. **`readme.md`** and **`CLAUDE.md`** — wherever either counts axes, packs or
   kinds, or describes what the Astro pack lands; `CLAUDE.md`'s plugin table
   cell for `stackgen` if it enumerates pack types. Both are dprint-formatted —
   widening a table cell re-pads the table, which is fine.
7. **`.claude/docs/plugins.md`** — the inventory summary (packs, bundles,
   kinds); **`.claude/skills/stackgen-plugin/`** and
   **`.claude/skills/vwf-plugin/`** wherever they enumerate types, kinds or
   axes.
8. **`docs/backlog.md`** — B07 and B08 already read `planned` with this folder's
   path; touch only if docs-sync finds a passage there.
9. No decisions doc: nothing was reversed.

## Verification

- `mise run p:site:check` green (astro check, the build, the link checker over
  every page and its markdown mirror).
- `command grep -rn "six axes\|six independent\|twelve kinds\|12 kinds" readme.md CLAUDE.md .claude/ site/src/content/docs/`
  is empty.
- `command grep -rn "stylesheet" site/src/content/docs/plugins/vwf.md site/src/content/docs/plugins/stackgen.md site/src/content/docs/how-to/operate/choosing-your-stack.md`
  hits in each.
- `command grep -n "config_format\|blueprint_format" site/src/content/docs/plugins/vwf.md`
  shows no `18` or `24` presented as current.

## Guardrails

- Do not touch `plugins/**`, `site/src/**` outside `content/docs/`,
  `site/package.json`, or any manifest.
- The manual's link rule (`site/CLAUDE.md`): relative links between docs pages,
  every anchor resolvable — the link checker is the gate.
- Frontmatter `description:` fields are strict YAML; keep the quoting.
- `readme.md`, `CLAUDE.md`, `site/CLAUDE.md` are dprint-formatted; the manual
  pages are too. Never end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`.

## Commit

`docs: stylesheet axis, web-head contract, per-screen metadata — manual, readme, repo docs`
— written by the orchestrator after the wave gate, not by the unit.
