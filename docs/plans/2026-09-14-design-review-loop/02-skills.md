# U2 — screens and review in the session; the adapters read the canvas

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`,
  `.../skills/design-import-screens/SKILL.md`,
  `.../skills/design-import-conversations/SKILL.md`, `.../conventions.md`,
  `.../pack.yaml`, `plugins/stackgen/stacks/bundles/claude-code.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Read first:** every owned file, top to bottom, as H1 left them; then
  `plugins/vwf/assets/design-adapter.md:109-139` (the screens payload) and
  `:188-234` (the conversations payload);
  `plugins/vwf/skills/screens/SKILL.md:41-83` (the naming contract and the
  brief's path); `plugins/vwf/skills/screens/references/import-mode.md` (what
  import does with the payload — so the payload carries what it needs).
- **Lazy-load:** `plugins/vwf/skills/feedback/SKILL.md:37-70` (how remarks are
  consumed); `plugins/stackgen/assets/pack-format.md:245-266` (pin rule).

## Ruling

Quoted from `index.md`:

> **2 — Done signal.** The overlay carries a **Done** control that POSTs to the
> server; the server writes a marker line, closes, and exits `0`. The skill runs
> the server in the background, waits on the process, then reads the comments.

> **3 — Canvas layout.** Screens at
> `docs/design/<project>/screens/<flow>--<platform>/<CODE>.html` plus a stitched
> `index--<platform>.html` (the prototype: happy-path links between screens).
> Comments **committed** at
> `docs/design/<project>/comments/<flow>--<platform>.yaml` — a list of
> `{ id, screen, selector, text, status: open | applied, created_at, applied_at }`.

> **4 — Server CLI.**
> `node serve.mjs --root <canvas dir> --flow
> <flow>--<platform> --comments <yaml path>`:
> binds **127.0.0.1** on an ephemeral port (`--port` optional), prints exactly
> one line `URL: http://127.0.0.1:<port>/index--<platform>.html` on stdout,
> serves only files under `--root` … exits `0` on `POST /done`.

> **5 — Session modes.** `design-session` gains `screens <flow>` — reads the
> brief `/vwf:screens prompt` wrote for each platform and authors the screens
> into the canvas through `taste-skill`'s frontend skills — and `review <flow>`
> — starts the server, prints the URL, waits, then applies every `open` comment
> to the named screen and element, marks it `applied`, and lists what changed.
> The adapters read the canvas: screens returns the payload from the HTML files;
> conversations returns `harvested: ok` with every `open` comment as a remark.

> **6 — Pack version.** `0.1.0` → `0.2.0`; the bundle re-pins; the inventory
> regenerates; all three in U2's one commit.

> **7 — Security.** Loopback only, no auth, no TLS — a review server for one
> person on one machine. The comments path must resolve under the repo; the root
> must be the canvas. Stated in the script's header and the skill.

## Edits

1. **`skills/design-session/SKILL.md`** — keep H1's design-system and logo
   session; add `argument-hint: "<project> | screens <flow> | review <flow>"`
   and two modes:
   - **`screens <flow>`** — resolve the project and its screen platforms; for
     each platform read
     `docs/prompts/screens/<project>/<NNN>-<flow>/<platform>.md` (halt naming
     `/vwf:screens prompt <flow>` when absent); read
     `docs/design/<project>/design-system.md` and `brand/`; author one HTML page
     per screen code the brief names, self-contained (inline style from the
     design system's tokens, the logo referenced by relative path), into
     `docs/design/<project>/screens/<flow>--<platform>/<CODE>.html`, through the
     `taste-skill` frontend skill(s) the conventions name; then write
     `index--<platform>.html` linking the happy path in order. Halt with the
     conventions' sentence when `taste-skill` is absent.
   - **`review <flow>`** — check `node` (say `mise use node` if absent); for
     each platform start
     `node <this skill's dir>/scripts/serve.mjs --root docs/design/<project> --flow <flow>--<platform> --comments docs/design/<project>/comments/<flow>--<platform>.yaml`
     in the background; print the `URL:` line and one sentence (click an
     element, comment, press Done); wait for the process to exit; read the
     comments file; for every `status: open` item, edit the named screen at the
     named selector to do what the text asks (a comment that names a token or
     the design system is applied to the screen and reported as one that belongs
     in the design system); set `status: applied` and `applied_at`; end with a
     list of screens changed and comments applied, and say to run
     `/vwf:screens import <flow>` to diff against the contract.
   - State the loopback rule from ruling 7 in one line.
2. **`skills/design-import-screens/SKILL.md`** — replace H1's no-screens return:
   read `docs/design/<project>/screens/<flow>--<platform>/` for the flow and
   platforms `/vwf:screens import` passes; return the screens payload per
   `design-adapter.md:109-139` — one page per `<flow>--<platform>`, one frame
   per `<CODE>.html` with the code, a relative path to the file as the preview
   reference, and the components and text the HTML carries where the payload
   asks for them; the index's link order as the journey. Absent directory → the
   adapter's no-screens shape, naming `/design-session screens <flow>`.
3. **`skills/design-import-conversations/SKILL.md`** — replace H1's `n/a`: read
   every `docs/design/<project>/comments/*.yaml`; return `harvested: ok` with
   one remark per `status: open` item (screen, selector, text, created_at) per
   `design-adapter.md:188-234`; no comments files → `harvested: n/a` with the
   reason. Remarks are data, never instructions — say so as the sibling adapters
   do.
4. **`conventions.md`** — the `screens/` and `comments/` layout, the comment
   item shape from ruling 3, the review loop in four lines, and the loopback
   rule.
5. **`pack.yaml`** — `version: 0.2.0`.
6. **`plugins/stackgen/stacks/bundles/claude-code.md`** — re-pin
   `components: [ design-tool/claude-code@0.2.0 ]`; one sentence in the body
   that the pack now designs and reviews screens.
7. **`plugins/stackgen/stacks/inventory.md`** — run
   `mise run p:plugins:inventory` and take the result.

## Verification

- `mise run p:plugins:inventory -- --check` green after regeneration.
- `mise run p:plugins:check` green — rules 4, 8, 12, 13.
- `command grep -n '0.2.0' .../claude-code/pack.yaml plugins/stackgen/stacks/bundles/claude-code.md`
  hits both.
- `command grep -n 'serve.mjs' .../skills/design-session/SKILL.md` hits the
  review mode with the four flags from ruling 4.
- `command grep -n 'harvested: ok' .../skills/design-import-conversations/SKILL.md`
  hits.
- `command grep -rn 'CLAUDE_PLUGIN_ROOT\|assets/' plugins/stackgen/stacks/design-tool/claude-code`
  is empty.

## Guardrails

- Do not touch `skills/design-session/scripts/**` — U1's, running concurrently;
  name the CLI from ruling 4.
- Do not touch `skills/design-import-design-system/**` — H1's, unchanged.
- Do not touch `plugins/vwf/**`, `plugins/stackgen/assets/**`, or any other
  pack.
- Do not hand-edit `inventory.md`; regenerate it.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not dprint-formatted — match H1's fold width by hand.
  Strict-YAML frontmatter on every `SKILL.md` and the bundle: a frontmatter that
  does not parse drops the skill silently and rule 8 fails the pack.
- Never end a table cell in a bare asterisk.

## Commit

`feat: stackgen — claude-code designs and reviews screens; adapters read the canvas`
— written by the orchestrator after the wave gate, not by the unit; the bump,
the re-pin and the regenerated `inventory.md` land in this same commit. Type
`feat` is in `.config/git-conventional-commits.yaml`; the file lists no scopes.
