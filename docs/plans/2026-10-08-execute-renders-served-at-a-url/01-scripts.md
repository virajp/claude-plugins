# U1 — The render copy script and the render mode of the server

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/mockups/scripts/**` (new: `renders.mjs`; edited:
  `serve.mjs`, `lib/**`, and `routes.mjs` only when the Screens-table parse
  moves into `lib/`), `scripts/src/mockups-renders.test.ts` (new),
  `scripts/src/mockups-serve.test.ts`, `scripts/src/mockups-routes.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** plan 1's
  `docs/plans/archived/2026-10-08-mockups-served-at-a-url/index.md` (or the same
  folder under `docs/plans/` when it is not archived) — its D3-D15 and D19-D20;
  then every file under `plugins/vwf/skills/mockups/scripts/`.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md:338-346`
  (rule 16).

## Ruling

> - Decision E2:
>   `docs/scratchpad/<project>/renders/<platform>/<route>/index.png` and
>   `index--<state>.png`, with plan 1's route rules (D4-D7). Latest set only: a
>   run overwrites only the screens and states it rendered.
>   `renders/<platform>/__renders/renders.json` records, for each image,
>   `{ code, state, route, file, plan, date }`.
> - Decision E5: After the last ux round, before the landing, the orchestrator
>   runs
>   `node ${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/renders.mjs --worktree <worktree> --main <main checkout> --project <project> --plan <folder>`
>   with the `RENDER:` lines on stdin. The script builds the route map from the
>   worktree's `docs/blueprint/flows/<project>/*/<platform>.md` (plan 1's
>   parse), copies each file into
>   `<main>/docs/scratchpad/<project>/renders/<platform>/<path>/`, and updates
>   `renders.json`. A `RENDER:` line for an unknown code or a missing file is
>   one `SKIPPED:` stdout line; the rest are copied. stdout ends with one
>   `COPIED: <n>` line.
> - Decision E7: On `mobile`, `watch` and `auto`, the render server shows each
>   route as one page: the mockup of the same route and state in a frame on the
>   left, the render image on the right. A route with no mockup shows the render
>   alone.
> - Decision E8: On `site`, `webapp`, `tablet`, `desktop`, `tv` and `spatial`,
>   the mockup server and the render server run on two ports with the same
>   routes. The overlay of each page has a link that opens the same route and
>   state on the other port in a new window.
> - Decision E9:
>   `node serve.mjs --renders --root docs/scratchpad/<project>/renders/<platform> --mockups docs/scratchpad/<project>/mockups/<platform> [--url-file <path>] [--peer-file <path>] [--port <n>]`.
>   `--url-file` writes the server's own `URL:` value to that file at start;
>   `--peer-file` names the other server's URL file, read at each request
>   (absent → no window link), so the two servers start in any order. Plan 1's
>   mockup mode takes the same two flags. It needs `__renders/renders.json`, not
>   `__mockups/routes.json`. It keeps every guard of plan 1 (loopback, realpath
>   under `--root` and `--mockups`, one `URL:` line). Each route page shows the
>   image, the state switcher (states from `renders.json`), the plan and date of
>   the image, a link to `/__renders/` (the list of every rendered screen),
>   comments and Done.
> - Decision E10: Render comments go to
>   `renders/<platform>/__renders/comments.yaml`, in plan 1's item shape plus
>   `plan`.
> - Decision E12: `renders.mjs` and the renders mode of `serve.mjs` reuse plan
>   1's `lib/routes.mjs` and its Screens-table parse; when the parse lives in
>   `routes.mjs`, U1 moves it into `lib/` and keeps `routes.mjs` working.
> - Decision E13: `scripts/src/mockups-renders.test.ts` (new) and new cases in
>   `scripts/src/mockups-serve.test.ts` for the renders mode.

## Edits

1. **`scripts/renders.mjs`** — E5. Parse each stdin line
   `RENDER: <code> <platform> <state> <file>`; ignore blank lines; any other
   line is one stderr warning. Resolve `<file>` under `--worktree` (realpath;
   outside → `SKIPPED:`). Group by platform; build each platform's route map
   from the worktree with the shared parse. Write `index.png` for `default` and
   `index--<state>.png` otherwise, at the screen's `path` under
   `<main>/docs/scratchpad/<project>/renders/<platform>/`; create directories;
   `--main` must hold a `.git` entry. Merge the copied items into
   `__renders/renders.json` (replace an existing `{ code, state }`, keep every
   other entry), with `date` in ISO 8601 UTC and the route map's `route`. Keep a
   copy of the route map at `__renders/routes.json`. Shebang, `chmod +x`.
2. **`scripts/serve.mjs`** — the `--renders` mode of E9. Without `--renders`,
   nothing changes. With it:
   - `GET <route>` resolves through `lib/routes.mjs` against
     `__renders/routes.json`; `?state=` picks `index--<state>.png`. The server
     builds the page in memory: on `mobile`, `watch` and `auto` (the platform is
     in `routes.json`), a frame with the `--mockups` page of the same route and
     state (served by this server under a reserved prefix, from `--mockups`,
     with plan 1's guards) on the left and the image on the right (E7); on the
     other platforms, the image alone and, when the `--peer-file` exists, a link
     to the same route and state on the URL it holds, `target="_blank"` (E8).
   - `--url-file <path>`: at start, write the server's own URL (the value of its
     `URL:` line) to that file; the path must resolve under
     `<cwd>/docs/scratchpad/`. `--peer-file <path>`: read at each request, the
     same path rule; absent or not a loopback URL → no window link.
   - The image files themselves are served with `image/png`.
   - `/__renders/` lists every entry of `renders.json` by flow: code, screen,
     route, states, plan, date. No other path under `/__renders/` is served.
   - The overlay of plan 1 (state switcher, list link, comments, Done), with
     comments written to `__renders/comments.yaml` (E10), each item with its
     `plan` from `renders.json`.
   - In mockup mode, `--url-file` and `--peer-file` work the same way, and the
     peer file adds the same new-window link to each mockup page (E8).
3. **`lib/**`** — move the Screens-table parse into `lib/` when it is not there
   (E12); `routes.mjs` keeps its CLI and output.
4. **Suites.**
   - `mockups-renders.test.ts`: the four `RENDER:` lines of index.md's smoke run
     → `COPIED: 3`, one `SKIPPED:` for an unknown code; a file outside the
     worktree is `SKIPPED:`; a second run replaces one entry and keeps the
     others in `renders.json`; `renders.json` holds `plan` and `date`.
   - `mockups-serve.test.ts`, new cases: renders mode on `mobile` serves the
     page with the mockup frame and the image; on `web` with a `--peer-file`
     written after the start, the page links the peer route in a new window, and
     before it is written the page has no link; `--url-file` holds the `URL:`
     value; a peer file with a non-loopback URL gives no link; `?state=` with no
     image is 404; `/__renders/renders.json` is 404; a traversal under
     `--mockups` is 404; `POST /comment` writes `plan`; mockup mode without the
     two flags is unchanged.
   - `mockups-routes.test.ts`: still green after the parse moves.

## Verification

- `pnpm vitest run scripts/src/mockups-*.test.ts` — green.
- `pnpm exec tsc --noEmit -p scripts` — green.
- `mise run p:plugins:check` — green (rule 16).
- `test -x plugins/vwf/skills/mockups/scripts/renders.mjs`, and its `head -1`
  reads `#!/usr/bin/env node`.

## Guardrails

- Touch nothing outside Owns — `plugins/vwf/skills/mockups/SKILL.md` is U2's.
- No new dependency; `node:` built-ins only.
- Never write a page into a root; every page is built in memory.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf mockups — copy execute renders and serve them beside the mockups`
