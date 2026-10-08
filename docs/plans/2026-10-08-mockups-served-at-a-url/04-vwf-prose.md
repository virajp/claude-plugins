# U4 — The mockup generator writes connected pages on production routes

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/agents/mockup-generator.md`,
  `plugins/vwf/assets/templates/project-claude.md`,
  `plugins/vwf/skills/plan/references/delta-checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned file, top to bottom; then
  `plugins/vwf/assets/templates/flow-platform.md:30-90` — the Screens table and
  the Components rules that name "the coded screen it navigates to".

## Ruling

> - Decision D4: A screen with the route `/a/b` is the file
>   `<root>/a/b/index.html`; the route `/` is `<root>/index.html`. `/__mockups/`
>   is reserved.
> - Decision D5: A state is the URL `<route>?state=<state>`; its file is
>   `index--<state>.html` beside `index.html`.
> - Decision D6: A segment `:id`, `{id}` or `[id]` in a route is the folder
>   `[id]`, for example `orders/[id]/index.html`. A link uses a sample value,
>   for example `/orders/1042`.
> - Decision D8: `routes.json` is
>   `{ "project", "platform", "screens": [ { "code", "screen", "slug", "flow", "route", "path", "routed" } ] }`;
>   `path` is the directory under the root (empty for `/`).
> - Decision D9: A link goes to the route of the target screen code, from
>   `routes.json`, with a sample value for each parameter. An action with no
>   pinned target screen gets no href, `aria-disabled="true"`, and a visible
>   mark "no target in contract"; the generator returns it as an `UNLINKED:`
>   line, and the skill reports it as a contract gap.
> - Decision D19: The files on disk stay self-contained with no JS. The server
>   injects the overlay into HTML as it serves it.

## Edits

1. **`plugins/vwf/agents/mockup-generator.md`** —
   - **Inputs.** Replace the render-directory input with: the platform root
     (`docs/scratchpad/<project>/<platform>/`, absolute), the `routes.json`
     path, and the flow it renders. Write only the files of this flow's screens.
   - **File naming.** Replace the flat `<screen-slug>.html` rule (lines 44-50)
     with D4 and D5: `<root>/<path>/index.html` for the default view and
     `<root>/<path>/index--<state>.html` for each pinned state, `path` read from
     `routes.json` for the screen's code; create the directories. Never write
     under `__mockups/`.
   - **Links — a new section.** Every action the Components rules say navigates
     to a coded screen is an `<a href>` (or a form `action`) to that code's
     `route` from `routes.json`, root-absolute, with a sample value for each
     `[param]` segment (D6), and with `?state=<state>` only when the contract
     names a state. Every other `href` is `#` or absent; never a relative path,
     never an external URL, never a guessed route. An action with no target code
     follows D9. A target in another flow is linked the same way — the server
     serves a placeholder when it has no page yet.
   - **Return contract.** Each manifest line is `<path> | <code> | <state>`; add
     one `UNLINKED: <code> | <component> — no target in contract` line per D9
     action.
   - Line 15 ("in their own browser"): the user reviews the pages through the
     local review server the calling skill starts. Line 54's rule (inline
     `<style>`, no external assets, no JS) stays, with one clause: the server
     adds the review overlay when it serves a page.
   - **Re-dispatch.** When the prompt carries `BROKEN:` lines, fix each named
     link in the named page, by the Links section, and touch nothing else.
   - Tools (line 8) are unchanged.
2. **`plugins/vwf/assets/templates/project-claude.md:20-21`** — the browser
   review wording says the mockups are a connected site on the production
   routes, reviewed at the local URL `/vwf:mockups` prints. This template lands
   in user repos: cite no plugin-relative path (rule 13).
3. **`plugins/vwf/skills/plan/references/delta-checks.md:72`** — the same change
   of wording, where it names browser review.

## Verification

- `mise run p:plugins:check` — green (rule 13 over the template).
- `grep -n 'own browser' plugins/vwf/agents/mockup-generator.md` — no hit.
- `grep -n '<screen-slug>.html' plugins/vwf/agents/mockup-generator.md` — no
  hit.
- `grep -n 'UNLINKED:' plugins/vwf/agents/mockup-generator.md` — the return
  contract names it.

## Guardrails

- In the template and `delta-checks.md`, change only the review wording.
- `plugins/**/*.md` is not formatted — match the fold width by hand; keep each
  code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf mockup generator — production routes and links from the route map`
