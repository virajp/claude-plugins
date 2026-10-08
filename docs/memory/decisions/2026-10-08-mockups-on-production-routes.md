# Decision — mockups are a connected site on the production routes, served per platform

**Date** 2026-10-08 · **Branch** `2026-10-08-mockups-served-at-a-url` · **Plan**
[`docs/plans/2026-10-08-mockups-served-at-a-url/`](../../plans/2026-10-08-mockups-served-at-a-url/index.md)
· **Reverses** the first version of that plan: one server per flow, the
`<NNN>-<flow>/<platform>/<slug>.html` tree, file paths when `node` is absent,
two chained plans · **Backlog** B91 (piece 1 of 3)

## What prompted it

The mockups `/vwf:mockups` and the `/vwf:blueprint` §6a screen review rendered
showed one screen, and their other links were broken. Each `mockup-generator`
wrote its links itself, with no map of the screens and knowing only its own
flow, and nothing examined the links before the user was handed a list of file
paths to open in a browser.

This is plan 1 of 3 for B91. Plans 2a (vwf) and 2b (stackgen) serve the renders
of the built app that the `/vwf:execute` UX stage makes.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **One server per platform (D3).** Every flow's screens of one platform render
  into `docs/scratchpad/<project>/mockups/<platform>/` and are served together
  by a loopback-only server shipped with the `mockups` skill, at one
  `http://127.0.0.1:<port>/` URL. Rejected: one server per flow; one server per
  run.
- **Route to file (D4).** The route `/a/b` is `<root>/a/b/index.html`, `/` is
  `<root>/index.html`, and `/__mockups/` is a list of every flow, screen and
  state, built in memory. Rejected: `<route>.html`; a list page at `/`.
- **States (D5).** A state is `<route>?state=<state>`, the file
  `index--<state>.html` beside `index.html`; the overlay carries a state
  switcher. Rejected: a reserved state path.
- **No route (D7).** A screen with an empty Route cell gets `/<code>-<slug>`,
  and the run reports it so the user can pin a route. Rejected: a Route
  mandatory on every screen platform.
- **Broken links (D12).** A link check runs before any review; broken links go
  back to the owning flow's generator for at most 2 rounds, and if any remain
  the skill starts no server, gives no URL, asks for no review and sets no
  `flows_rendered` stamp. Rejected: stop at once; serve with a warning.
- **No `node` (D17).** The skill renders nothing and stops, with the remedy
  `MISE_ENV=dev mise run setup:all`; §6a reports that the flow's review waits
  for `node`. Rejected: hand over file paths with no check.

The route map (D8), link targets (D9), the placeholder for an unrendered target
(D10), comments returned as proposals (D15) and the old tree left for the user
to delete (D18) are recorded in the plan's table.
