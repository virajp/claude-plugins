# U1 — The mockup review server

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/mockups/scripts/serve.mjs` (new),
  `scripts/src/mockups-serve.test.ts` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/serve.mjs`,
  top to bottom — the source this unit adapts (read only, never edit).
- **Lazy-load:** `scripts/src/tool-config-render.test.ts` (how an existing suite
  spawns a shipped node script),
  `.claude/skills/plugin-authoring/references/checks.md:338-346` (rule 16).

## Ruling

> - Decision D2: Adapt stackgen's design-session `serve.mjs` into
>   `plugins/vwf/skills/mockups/scripts/serve.mjs`.
> - Decision D3:
>   `node serve.mjs --root <flow dir> --comments <yaml path> [--port <n>]`.
>   `--root` must resolve under `<cwd>/docs/scratchpad/`; `--comments` must
>   resolve under the cwd. Binds `127.0.0.1` only, ephemeral port unless
>   `--port`, prints exactly one stdout line `URL: http://127.0.0.1:<port>/`.
>   Serves nothing outside `--root` (realpath check, no `..` or symlink escape).
>   No auth, no TLS.
> - Decision D4: One server per flow, all its platforms. `--root` is
>   `docs/scratchpad/<project>/<NNN>-<flow>/`. `GET /` returns an index page the
>   server builds from the root: one section per platform subdirectory, one link
>   per `.html` file, the base screen before its `--<state>` variants.
> - Decision D5: Keep the overlay. `POST /comment` takes
>   `{ platform, screen, selector, text }` and appends one item
>   `{ id, platform, screen, selector, text, status: open, created_at, applied_at: null }`
>   to `docs/scratchpad/<project>/<NNN>-<flow>/comments.yaml`. `POST /done`
>   appends a done marker, responds 204 and exits 0.
> - Decision D6: The files on disk stay self-contained with no JS. The server
>   injects the overlay into HTML as it serves it; the index page is built in
>   memory, never written.
> - Decision D9: Add `scripts/src/mockups-serve.test.ts`, a vitest suite that
>   spawns the script on a temp root.

## Edits

1. **`plugins/vwf/skills/mockups/scripts/serve.mjs`** — start from a byte copy
   of the stackgen script (use `cp`, then edit; never retype it), then:
   - Rewrite the header comment: vwf's mockup review server, run by
     `/vwf:mockups` and `/vwf:blueprint` §6a; the usage line of D3; the one
     `URL:` line; the endpoint list below; loopback, no auth, no TLS; zero
     dependencies.
   - Arguments: `root`, `comments`, `port` only — drop `--flow`. Refuse to start
     (stderr message, non-zero exit) when `--root` does not resolve under
     `<cwd>/docs/scratchpad/`, is not a directory, or `--comments` does not
     resolve under the cwd.
   - `GET /` — the in-memory index: a title naming the flow directory, one
     section per immediate subdirectory of the root (the platform), one link per
     `.html` file in it, ordered so `<slug>.html` precedes every
     `<slug>--<state>.html`. Plain HTML, inline style, no JS.
   - `GET <path>` — a file under the root, realpath-checked as today; HTML gets
     the overlay injected; anything else 404.
   - The overlay sends `platform` (the first path segment of the page) with
     `screen` (the file name without `.html`), `selector` and `text`.
   - `POST /comment` — validate the four string fields (400 otherwise); append
     the D5 item shape as YAML; first write creates the file with a one-line `#`
     header naming the flow directory.
   - `POST /done` — as today: done marker, 204, close, exit 0.
   - Print exactly one stdout line, `URL: http://127.0.0.1:<port>/`; every other
     message goes to stderr.
   - Keep `#!/usr/bin/env node` as line 1, `node:` imports only, no `require(`;
     `chmod +x` the file.
2. **`scripts/src/mockups-serve.test.ts`** — spawns the script with `node`, cwd
   a temp directory holding `docs/scratchpad/demo/001-login/{web,ios}/`
   fixtures, and asserts:
   - exactly one stdout line, matching `^URL: http://127\.0\.0\.1:\d+/$`;
   - `GET /` is 200 and links every fixture file, base before `--state`;
   - a screen is 200 and carries the overlay; the file on disk is unchanged;
   - a `..` path and a symlink pointing outside the root are 404;
   - `POST /comment` writes one `status: open` item with its `platform`; a body
     missing a field is 400;
   - `POST /done` is 204 and the process exits 0;
   - `--root` outside `docs/scratchpad/` refuses to start, non-zero exit;
   - the listening address is `127.0.0.1`.

## Verification

- `pnpm vitest run scripts/src/mockups-serve.test.ts` — green.
- `pnpm exec tsc --noEmit -p scripts` — green.
- `mise run p:plugins:check` — green (rule 16 over the new script).
- `test -x plugins/vwf/skills/mockups/scripts/serve.mjs` and `head -1` of it
  reads `#!/usr/bin/env node`.
- `grep -n 'require(' plugins/vwf/skills/mockups/scripts/serve.mjs` — no hits.

## Guardrails

- Never edit the stackgen source script; it is read only.
- Touch nothing outside Owns — `plugins/vwf/skills/mockups/SKILL.md` is U2's.
- No new dependency; `node:` built-ins only in the script.
- Never write `.html` into the root; the index is in memory.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf mockups — a loopback review server for one flow`
