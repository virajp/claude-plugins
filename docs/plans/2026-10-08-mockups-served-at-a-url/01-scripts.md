# U1 — The route map, the link check and the review server

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/mockups/scripts/**` (new: `serve.mjs`,
  `routes.mjs`, `links.mjs`, `lib/routes.mjs`, and any other `lib/` module),
  `scripts/src/mockups-serve.test.ts`, `scripts/src/mockups-routes.test.ts`,
  `scripts/src/mockups-links.test.ts` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/scripts/serve.mjs`,
  top to bottom — the source this unit adapts (read only, never edit); and
  `plugins/vwf/assets/templates/flow-platform.md:30-60` — the Screens table that
  `routes.mjs` reads.
- **Lazy-load:** `scripts/src/tool-config-render.test.ts` (how an existing suite
  spawns a shipped node script),
  `.claude/skills/plugin-authoring/references/checks.md:338-346` (rule 16).

## Ruling

> - Decision D2: Adapt stackgen's design-session `serve.mjs` into
>   `plugins/vwf/skills/mockups/scripts/serve.mjs`.
> - Decision D3: One server for each platform, with all flows. The root is
>   `docs/scratchpad/<project>/<platform>/`.
>   `node serve.mjs --root <platform dir> [--port <n>]`; `--root` must resolve
>   under `<cwd>/docs/scratchpad/` and hold `__mockups/routes.json`. Binds
>   `127.0.0.1` only, ephemeral port unless `--port`, prints exactly one stdout
>   line `URL: http://127.0.0.1:<port>/`. Serves nothing outside `--root`
>   (realpath check, no `..` or symlink escape). Non-HTML files are served with
>   the MIME table of the source. No auth, no TLS.
> - Decision D4: A screen with the route `/a/b` is the file
>   `<root>/a/b/index.html`; the route `/` is `<root>/index.html`. `GET /`
>   serves the app's `/` screen. `GET /__mockups/` is a list of every flow,
>   screen and state of the platform, built in memory and never written; it
>   marks a screen with no file "not rendered yet". `/__mockups/` is reserved:
>   no other path under it is served.
> - Decision D5: A state is the URL `<route>?state=<state>`; its file is
>   `index--<state>.html` beside `index.html`. A `?state=` with no such file is
>   404. The overlay shows a state switcher with every state file of the page's
>   directory, and a link to `/__mockups/`.
> - Decision D6: A segment `:id`, `{id}` or `[id]` in a route is the folder
>   `[id]`, for example `orders/[id]/index.html`. A link uses a sample value,
>   for example `/orders/1042`. The server serves any value of that segment from
>   the `[id]` folder; a static folder wins over a `[param]` folder.
> - Decision D7: A screen whose Route cell is empty, `—`, `-` or `n/a` gets the
>   route `/<code>-<slug>`, where `<slug>` is the kebab-case Screen name. The
>   report lists each such screen.
> - Decision D8: `node routes.mjs --project <project> --platform <platform>`,
>   from the repo root, reads `## Screens` of every
>   `docs/blueprint/flows/<project>/*/<platform>.md` and writes
>   `docs/scratchpad/<project>/<platform>/__mockups/routes.json`:
>   `{ "project", "platform", "screens": [ { "code", "screen", "slug", "flow", "route", "path", "routed" } ] }`.
>   `path` is the directory under the root (empty for `/`); `routed` is false
>   for a D7 route. Two codes with one route, or one code twice, is an error:
>   stderr, non-zero exit. stdout is one summary line, plus one
>   `NO ROUTE: <code> <screen>` line per D7 screen.
> - Decision D10: A link to a code in `routes.json` with no file opens a
>   placeholder page from the server: the code, the screen name, the flow, "not
>   rendered yet", and a link to `/__mockups/`. A code in no Screens table is a
>   broken link.
> - Decision D11: `node links.mjs --root <platform dir>` reads every `.html`
>   under the root (except `__mockups/`) and every `href`. A `#` link is
>   correct. A root-absolute link is correct when the server would serve it: a
>   file, a `[param]` match, or a D10 placeholder; and its `?state=` file
>   exists. Any other href (relative, `http:`, `mailto:`) is broken. Broken
>   links: one `BROKEN: <page> -> <href> — <reason>` line each, exit 1. None:
>   one `LINKS OK: <n> links in <m> pages` line, exit 0.
> - Decision D15: `POST /comment` takes `{ path, state, selector, text }`; the
>   server finds the code and the route from `routes.json` and appends
>   `{ id, code, route, state, selector, text, status: open, created_at, applied_at: null }`
>   to `<root>/__mockups/comments.yaml`; a missing field is 400. `POST /done`
>   appends a done marker, responds 204 and exits 0. The file survives a render.
> - Decision D19: The files on disk stay self-contained with no JS. The server
>   injects the overlay into HTML as it serves it; the list page and the
>   placeholder pages are built in memory, never written.
> - Decision D20: `serve.mjs` and `links.mjs` match a URL path to a file through
>   one module, `plugins/vwf/skills/mockups/scripts/lib/routes.mjs`, so the
>   server and the check agree.
> - Decision D21: `scripts/src/mockups-serve.test.ts`, `mockups-routes.test.ts`
>   and `mockups-links.test.ts`, vitest suites that spawn each script on a temp
>   root.

## Edits

1. **`scripts/lib/routes.mjs`** — the shared module, no shebang:
   - Read and validate `routes.json`.
   - Turn a route into a `path` (D4, D6: `:id`, `{id}`, `[id]` → `[id]`).
   - Match a URL path to a result: a static file, a `[param]` file (a static
     folder wins), a placeholder (a code with no file), or none. Apply `?state=`
     (D5).
   - Never resolve outside the root: realpath every candidate and require it
     under the root.
2. **`scripts/routes.mjs`** — D8. Parse each `## Screens` table by its header
   row, by column name (`Code`, `Screen`, `Route`), never by column position.
   Strip backticks from cells. A Route cell with no `/` token is a D7 route.
   Create `__mockups/` when absent. Write `routes.json` with two-space indent.
   The `flow` value is the flow directory name (`<NNN>-<flow>`).
3. **`scripts/serve.mjs`** — start from a byte copy of the stackgen script (use
   `cp`, then edit; never retype it), then:
   - Rewrite the header comment: vwf's mockup review server, run by
     `/vwf:mockups` and `/vwf:blueprint` §6a; the D3 usage line; the one `URL:`
     line; the endpoints below; loopback, no auth, no TLS; zero dependencies.
   - Arguments: `root` and `port` only — drop `--flow` and `--comments`. Refuse
     to start (stderr, non-zero exit) when `--root` does not resolve under
     `<cwd>/docs/scratchpad/`, is not a directory, or has no
     `__mockups/routes.json`.
   - `GET` — through `lib/routes.mjs`: a file (HTML gets the overlay), a
     `[param]` file, a `?state=` file, or the D10 placeholder; `/__mockups/` is
     the D4 list, grouped by flow, each screen with its code, its name, a link
     to its route and a link to each state; any other path under `/__mockups/`
     is 404; anything else is 404.
   - The overlay: the D5 state switcher (the `index--*.html` files of the page's
     directory), a link to `/__mockups/`, click-to-comment and Done. The overlay
     sends `{ path, state, selector, text }`.
   - `POST /comment`, `POST /done` — D15.
   - Print exactly one stdout line, `URL: http://127.0.0.1:<port>/`; every other
     message goes to stderr.
4. **`scripts/links.mjs`** — D11, through `lib/routes.mjs`. Read `href="…"` and
   `href='…'` attributes. Report pages relative to the root.
5. Each of `serve.mjs`, `routes.mjs` and `links.mjs`: `#!/usr/bin/env node` as
   line 1, `node:` imports and relative imports only, no `require(`, `chmod +x`.
6. **The three suites**, each spawning its script with `node` in a temp
   directory:
   - `mockups-routes.test.ts`: two flow files of one platform → one
     `routes.json` with every code, `path` for `/`, a static route, a `:id`
     route and a D7 route; one `NO ROUTE:` line; a duplicate route and a
     duplicate code each exit non-zero; a table with its columns in another
     order parses the same.
   - `mockups-links.test.ts`: a correct tree → `LINKS OK:`, exit 0; a missing
     target, a missing `?state=` file, a relative href and an `http:` href → one
     `BROKEN:` line each, exit 1; a link to a code with no file is correct
     (D10); `/orders/1042` matches `orders/[id]/`.
   - `mockups-serve.test.ts`: exactly one stdout line matching
     `^URL: http://127\.0\.0\.1:\d+/$`; `/` is `index.html` with the overlay and
     the file on disk unchanged; `/orders/7` is the `[id]` page; a static folder
     wins over `[id]`; `?state=error` is the state file and a missing state is
     404; `/__mockups/` names every code; `/__mockups/routes.json` is 404; a D10
     placeholder; a `..` path and an outside symlink are 404; `POST /comment`
     writes one `status: open` item with its `code` and `route`, and a missing
     field is 400; `POST /done` is 204 and the process exits 0; a `--root`
     outside `docs/scratchpad/` or with no `routes.json` refuses to start; the
     listening address is `127.0.0.1`.

## Verification

- `pnpm vitest run scripts/src/mockups-*.test.ts` — green.
- `pnpm exec tsc --noEmit -p scripts` — green.
- `mise run p:plugins:check` — green (rule 16 over the new scripts).
- `test -x` on each of the three entry scripts, and `head -1` of each reads
  `#!/usr/bin/env node`.
- `grep -rn 'require(' plugins/vwf/skills/mockups/scripts` — no hits.

## Guardrails

- Never edit the stackgen source script; it is read only.
- Touch nothing outside Owns — `plugins/vwf/skills/mockups/SKILL.md` is U2's.
- No new dependency; `node:` built-ins only in the scripts.
- Never write a page into the root; the list and the placeholders are in memory.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf mockups — route map, link check and a review server per platform`
