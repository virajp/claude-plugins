# U1 — the review server

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/**`
  (new — `serve.mjs`, and the overlay it injects, inline or as a sibling file it
  reads at start)
- **Model:** opus
- **Read first:**
  `plugins/stackgen/stacks/design-tool/claude-code/conventions.md` and
  `skills/design-session/SKILL.md` as H1 left them (the canvas layout; read, do
  not edit — U2 rewrites the skill concurrently).
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md:145`
  (rule 13 — a landed file cites nothing by plugin path);
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.gitignore` (read to
  confirm `docs/design/` is not ignored — it is the committed canvas).

## Ruling

Quoted from `index.md`:

> **1 — Server runtime.** A **single-file Node script with zero dependencies**,
> `skills/design-session/scripts/serve.mjs`, plus the overlay it injects. Node
> comes from the repo's mise toolchain; the skill says `mise use node` when it
> is absent.

> **2 — Done signal.** The overlay carries a **Done** control that POSTs to the
> server; the server writes a marker line, closes, and exits `0`. The skill runs
> the server in the background, waits on the process, then reads the comments.

> **4 — Server CLI.**
> `node serve.mjs --root <canvas dir> --flow
> <flow>--<platform> --comments <yaml path>`:
> binds **127.0.0.1** on an ephemeral port (`--port` optional), prints exactly
> one line `URL: http://127.0.0.1:<port>/index--<platform>.html` on stdout,
> serves only files under `--root` (no traversal, no symlink escape), injects
> the overlay into every `text/html` response, appends one YAML list item per
> `POST /comment`, writes the marker and exits `0` on `POST /done`. No other
> endpoint.

> **7 — Security.** Loopback only, no auth, no TLS — a review server for one
> person on one machine. The comments path must resolve under the repo; the root
> must be the canvas. Stated in the script's header and the skill.

## Edits

1. **`scripts/serve.mjs`** (new) — `#!/usr/bin/env node`, ESM, imports from
   `node:http`, `node:fs`, `node:path`, `node:url` only. Header comment: what it
   is, the CLI, the loopback rule, that it ships with the `claude-code`
   design-tool pack and is run by the `design-session` skill. Behaviour per
   ruling 4:
   - parse `--root`, `--flow`, `--comments`, optional `--port` (default `0`);
     resolve `--root` to an absolute path; refuse to start if it does not exist
     or `--comments` does not resolve under the current working directory (exit
     `2` with one line on stderr);
   - `GET <path>`: resolve under `--root` with `path.resolve` and a
     `startsWith(root + sep)` guard after `fs.realpathSync`; `404` otherwise;
     serve with a content type from the extension (html, css, js, svg, png, jpg,
     webp, woff2 — a small map, `application/octet-stream` else); for
     `text/html`, inject the overlay `<script>` before `</body>` (or append if
     absent) and the marker `<!-- design-review-overlay -->`;
   - `GET /` redirects to `/screens/<flow>/index--<platform>.html` where
     `<platform>` is the suffix of `--flow` after `--`;
   - `POST /comment`: JSON body `{ screen, selector, text }`; append to
     `--comments` as one YAML list item with `id` (`c` + zero-padded counter),
     `screen`, `selector`, `text` (quoted), `status: open`, `created_at` (ISO).
     Create the file with a one-line header comment when absent. Respond `204`.
     Malformed body → `400`;
   - `POST /done`: append `# done: <ISO>` to the comments file, respond `204`,
     close the server, exit `0`;
   - listen on `127.0.0.1` at `--port`; on `listening`, print the single `URL:`
     line and nothing else on stdout; all logging to stderr.
2. **The overlay** — inline in `serve.mjs` as a template string, or a sibling
   `overlay.js` read once at start (say which in `DECIDED:`). Plain JS, no
   framework: on load, a fixed toolbar with the flow name, a comment count and a
   **Done** button; hover highlights the element under the cursor; click selects
   it, computes a stable selector (id if present, else a tag+nth-child path from
   `body`), opens a small textarea; submit POSTs `{ screen, selector,
   text }`
   where `screen` is the page's filename stem; Done POSTs `/done` and replaces
   the page body with a one-line "review sent" note. Links between screens keep
   working — the overlay never intercepts navigation.
3. **Exec bit** — `chmod +x scripts/serve.mjs` (a convention, not a gate; rule
   11 does not reach here).

## Verification

- `node --check plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/serve.mjs`
  exits `0`.
- The smoke from `index.md`'s orchestrator gates, run by the unit itself against
  a `/tmp` fixture: start, read `URL:`, `curl` the index (marker present), POST
  a comment, POST done, process exits `0`, YAML has one item with
  `status: open`.
- `command grep -n "^import" .../serve.mjs` shows only `node:` specifiers.
- `command grep -n '0.0.0.0' .../serve.mjs` is empty; `127.0.0.1` hits the
  listen call.
- `command grep -rn 'CLAUDE_PLUGIN_ROOT\|assets/' .../scripts` is empty.
- `mise run p:plugins:check` green.

## Guardrails

- Do not touch any `SKILL.md`, `conventions.md`, `pack.yaml`, the bundle or the
  inventory — U2's, running concurrently.
- Do not touch `plugins/vwf/**` or `scripts/src/**`.
- Do not add `package.json`, a lockfile, or any dependency.
- Do not bind anything but `127.0.0.1`; do not add an endpoint the ruling does
  not name.
- Delete with `rm`, never `git rm`.
- The file is a landed pack payload: cite nothing by plugin path.

## Commit

`feat: stackgen — the claude-code pack's review server` — written by the
orchestrator after the wave gate, not by the unit. Type `feat` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
