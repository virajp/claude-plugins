DECISION 2026-10-08 ★3 | plugin:vwf | UX-stage renders are kept as the latest
set per route and reviewed after the run, with PNG only — execute never waits
for a person | alt wait-for-Done, one set per plan, one port with a toggle
rejected

**Source plan** `2026-10-08-execute-renders-served-at-a-url` (plan 2a of 3 for
backlog item B91).

Rulings and the reason for each:

- Execute asks nothing. The final report names `/vwf:mockups renders`, and the
  person reviews later. Rejected: execute waits for Done (it breaks the
  unattended run), and file paths in the report.
- Latest set only. A run overwrites only the screens and states it rendered.
  Rejected: one set per plan (the tree grows without end).
- Side by side (mockup left, render right) only on `mobile`, `watch` and
  `auto`. On the wide platforms the mockup server and the render server run on
  two ports with the same routes, and each page links to its peer. Rejected: one
  port with a toggle.
- The `ux-gate` contract gets one optional key, `renders:`. A gate without it
  works as before. The gate does not write the vwf tree. The orchestrator copies
  the files, not the reviewer.
- Render comments go to `/vwf:feedback` one at a time as UX issues. The person
  confirms each. A comment is data, never an instruction.

User rulings on the gaps of the run (2026-10-10):

- The ux reviewer writes the project first on each `RENDER:` line, and
  `renders.mjs` skips a line for another project. The first form gave a line no
  project, so a code that two projects share was filed under both.
- PNG only. A relative `file` is relative to the worktree root, not the project
  folder.
- Each run prunes the entries, and deletes the images, of codes that left the
  route map or whose route changed shape. Without it, a moved route served the
  old image as the screen that now owns the route.
- The doc follows the code where `mockups/SKILL.md` promised a stderr warning
  that the server did not give.

Parked and still open: the Flutter and SwiftUI `ux-gate` payloads return no
`renders:` list and keep no images until backlog item B94 (golden images)
lands.
