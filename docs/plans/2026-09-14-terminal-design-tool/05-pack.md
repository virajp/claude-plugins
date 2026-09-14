# U5 — the `claude-code` design-tool pack and its bundle

- **Wave:** 2
- **Depends on:** U1, U3
- **Owns:** `plugins/stackgen/stacks/design-tool/claude-code/**` (new),
  `plugins/stackgen/stacks/bundles/claude-code.md` (new),
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Read first:** `plugins/vwf/assets/design-adapter.md` (U1's output — the
  three payloads, the `brand:` block, the halts, the no-screens shape);
  `plugins/stackgen/assets/pack-format.md` and `assets/kinds.md:911-` (U3's
  output — the `default:` key and the file-canvas paragraph); then every file
  under `plugins/stackgen/stacks/design-tool/claude-design/` and `.../stitch/`
  top to bottom (the shapes to mirror — the first has a server, the second has
  none); then the three bundles.
- **Lazy-load:** `plugins/vwf/skills/design-system/SKILL.md:143-161` (§5, what
  the importer does with the payload); `plugins/vwf/skills/init/SKILL.md:362`
  (question 5 — how a product declares a required plugin);
  `.claude/skills/plugin-authoring/references/checks.md:74-79` (rule 8), `:145`
  (rule 13).

## Ruling

Quoted from `index.md`:

> **1 — Slug and default.** The pack's slug is `claude-code`. A bundle's
> frontmatter may carry `default: true`; the stackgen menu payload passes it
> through on that entry; vwf's architecture menu **preselects whichever entry
> carries it**, as a generic rule that names no tool.

> **2 — taste-skill.** `taste-skill@taste-skill` is a **declared requirement**:
> the pack's `conventions.md` and its bundle name it as the plugin the product
> must add at init's question 5, so the repo's `setup:ai` installs it at project
> scope; every pack skill that needs it halts with one plain sentence when it is
> absent. No new pack key, no vendored copy, no vwf dependency.

> **3 — Canvas.** The tool's source of truth is `docs/design/<project>/`,
> **committed**: `design-system.md` in the shape `taste-skill` authors,
> `brand/logo.svg` with the variants the brand block names, and — from H2 —
> screens and comments. `docs/blueprint/design-system.md` stays vwf's import,
> written only by `/vwf:design-system`.

> **5 — Authoring skill.** The pack ships a fourth, **user-invocable** skill,
> `design-session`, beside the three fixed adapters: it runs the interactive
> session — design system first (through `taste-skill`'s design skills), then
> the logo (through `taste-skill:brandkit`) — writing the canvas. H1's session
> ends at the logo; layouts are H2.

> **6 — H1 adapters.** `design-import-design-system` reads the canvas into the
> payload, brand block included. `design-import-screens` returns the adapter's
> no-screens shape until H2 lands a screens canvas;
> `design-import-conversations` returns `harvested: n/a` until H2 lands
> comments. All three ship model-invocable so rule 8 passes.

> **9 — Wave order.** U5 (the pack) runs after U1 and U3 so it writes the brand
> block and the bundle flag as the contract defines them, not as guessed.

## Edits

1. **Confirm `taste-skill`'s surface first.** Run `claude plugin list` and read
   the installed `taste-skill` plugin's skill names from this machine (they
   appear as `taste-skill:<name>` in the session skill list — `taste-skill`,
   `brandkit`, `soft-skill`, `minimalist-skill`, `redesign-skill`, and others).
   Use the names as installed; if the plugin is absent on the machine, return
   `UNRESOLVED: taste-skill not installed —
   cannot confirm its skill names`
   and stop.
2. **`pack.yaml`** (new) — `name: Claude Code`, a one-line `summary` (the
   terminal you already work in, authoring the design system and the logo in
   session, into a canvas the repo commits), `version: 0.1.0`,
   `type: design-tool`, `kind: design-tool`, `axis: design`, `harness: n/a` per
   the kind. **No `mcp_servers:`** — the host is the tool.
3. **`conventions.md`** (new) — the canvas layout (`docs/design/<project>/`,
   `design-system.md`, `brand/logo.svg`, `brand/<variant>.svg`), the requirement
   sentence naming `taste-skill@taste-skill` as the plugin a product adds at
   init's question 5 so `setup:ai` installs it, the halt sentence every skill
   uses when it is absent, and the rule that the canvas is committed and
   reviewed like any doc.
4. **`skills/design-import-design-system/SKILL.md`** (new) — frontmatter
   `disable-model-invocation: false`, `user-invocable: false`; reads
   `docs/design/<project>/design-system.md` and `brand/`, returns the
   design-system payload including `brand:` when `brand/logo.svg` exists;
   returns the adapter's not-found halt when the canvas is absent, naming
   `design-session` as the way to create it. The `design_system_id`: decide
   between a content hash of the canvas and the canvas path; report the choice
   in `DECIDED:`.
5. **`skills/design-import-screens/SKILL.md`** (new) — same invocation keys; in
   H1 it looks for `docs/design/<project>/screens/<flow>--<platform>/` and,
   finding nothing, returns the no-screens shape `design-adapter.md` defines;
   one sentence that H2 lands the screens canvas.
6. **`skills/design-import-conversations/SKILL.md`** (new) — same invocation
   keys; returns `harvested: n/a` with the one-line reason the adapter allows,
   until a comments file exists (H2).
7. **`skills/design-session/SKILL.md`** (new) — user-invocable
   (`disable-model-invocation: true`), `argument-hint: "<project>"`. The
   session: resolve the project (halt if it has no screen platform), check
   `taste-skill` is present (halt sentence otherwise), then **design system** —
   invoke the `taste-skill` design skill(s) confirmed in edit 1, writing
   `docs/design/<project>/design-system.md` in that plugin's authored shape,
   reviewed with the user in the terminal; then **logo** — invoke
   `taste-skill:brandkit`, writing `brand/logo.svg` and the variants, and a
   short `brand/README.md` stating clear space, minimum sizes and the rules
   (this is what the adapter reads into `brand:`). End by telling the user to
   run `/vwf:design-system` to import. State plainly that layouts, mockups and
   the review server are not part of this session yet.
8. **`plugins/stackgen/stacks/bundles/claude-code.md`** (new) — frontmatter
   `name: Claude Code`, `axis: design`, `kind: design-tool`, `default: true`,
   `components: [ design-tool/claude-code@0.1.0 ]`; a body in the sibling
   bundles' voice: the terminal is the tool, the canvas is a directory, the
   required plugin, and that this bundle is the axis default.
9. **`plugins/stackgen/stacks/inventory.md`** — run
   `mise run p:plugins:inventory` and take the result.

## Verification

- `mise run p:plugins:inventory -- --check` green after regeneration.
- `mise run p:plugins:check` green — rules 4, 8 (three adapters present and
  model-invocable), 12, 13, and U4's default assertion (exactly one).
- `command ls plugins/stackgen/stacks/design-tool/claude-code/skills` lists the
  four skill directories.
- `command grep -rn 'CLAUDE_PLUGIN_ROOT\|assets/' plugins/stackgen/stacks/design-tool/claude-code`
  is empty.
- `command grep -n 'taste-skill@taste-skill' plugins/stackgen/stacks/design-tool/claude-code/conventions.md plugins/stackgen/stacks/bundles/claude-code.md`
  hits both.
- `command grep -c 'mcp_servers' plugins/stackgen/stacks/design-tool/claude-code/pack.yaml`
  is `0`.

## Guardrails

- Do not touch `plugins/stackgen/assets/**`, `skills/**` or `stacks/readme.md` —
  U3's, landed; cite by role.
- Do not touch `plugins/vwf/**` — U1's and U2's, landed.
- Do not touch the other three design-tool packs or bundles.
- Do not write a server, a port, an HTML mockup, or a comment loop — H2.
- Do not hand-edit `inventory.md`; regenerate it.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match the sibling packs' fold
  width by hand. Strict-YAML frontmatter on every `SKILL.md` and the bundle: a
  frontmatter that does not parse drops the skill silently, and rule 8 then
  fails the pack.
- Never end a table cell in a bare asterisk.

## Commit

`feat: stackgen — the claude-code design-tool pack, the axis default` — written
by the orchestrator after the wave gate, not by the unit; the regenerated
`inventory.md` lands in this same commit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
