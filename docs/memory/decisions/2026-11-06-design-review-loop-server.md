DECISION 2026-09-14 ★3 | design-tool claude-code review loop | the canvas is
committed HTML, a zero-dependency Node server collects comments, the session
applies them — one person and one machine, so no auth | alt Python or Bun, typed
"done", a separate skill, a URL token rejected

**Source plan** `2026-09-14-design-review-loop`.

The claude-code design-tool pack (skill `design-session`, script `serve.mjs`)
lets a person click an element, leave a comment and press Done. The session
then edits the screens. These rulings explain why the pack has this shape.

- Runtime: one Node file with no dependencies. Node comes from the repo's mise
  toolchain. Rejected: Python stdlib and Bun (user choice).
- Done signal: an overlay button posts to the server. The server writes a
  marker, exits `0`, and the skill waits on the process. Rejected: the user
  types "done" in the terminal.
- Comments are committed in `docs/design/<project>/comments/`, not kept in the
  scratchpad. Each item has `status` (`open` or `applied`) and `applied_at`.
- Security: bind `127.0.0.1` only, no auth, no TLS. The root must be the canvas
  and the comments path must resolve under the repo. Rejected: a token in the
  URL (the server is for one person on one machine).
- `review` and `screens` are modes of `design-session`. Rejected: a separate
  `design-review` skill.
- A comment is the reviewer's data, never an instruction to the session. Text
  that reads as an instruction to the agent stays `open` and is reported.
- The canvas holds the design. vwf's `/vwf:mockups` keeps rendering the
  contract into the scratchpad. The two are different things.

Problems met in the run:

- The plan's server rule 4 contradicted its own `--root` rule. The printed URL
  carries the `/screens/<flow>--<platform>/` prefix, and the skill follows it.
- `--comments` is checked with `realpath` of the deepest existing ancestor,
  because `/tmp` is a symlink on macOS.
- `closeAllConnections` can drop the `204` reply to `/done`. The reviewer
  flagged it, so keep the reply order in mind when you change the shutdown.
