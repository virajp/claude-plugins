# The LSP Rule (Setup step 2)

Read this at Setup step 2 **only when `doctor` reports a missing LSP server**.
A clean preflight, or one whose only findings are non-LSP, never needs it — and
a `blocking` finding is a hard halt handled in `SKILL.md`, not here.

The question was asked once, at `/vwf:plan`'s stack gate, and its answer is a
row in the folder's **Consent** block — `LSP <language>`, reading `installed` or
`proceed without`. This run reads the row and asks nothing:

- **`installed`, and the server is still missing** → halt with the remedy: the
  plan was approved on a promise that did not hold. Name the language, say to
  install the server via `/plugin` (Discover) or to change the row to
  `proceed without` in the folder, then re-launch `/vwf:execute <folder>`.
- **`proceed without`** → log it as a Run log detail and continue; degraded
  type-safety is a known condition of the run, not a gap.
- **No row for the flagged language** → treat it as `proceed without`, and
  write one `GAP:` line into the folder's *Gaps surfaced during execution*:
  the plan did not carry the LSP answer for `<language>`, and the run proceeded
  without the server.
- A language doctor reports as **unavailable** (no LSP ships in this
  marketplace) is not gated — there is nothing to install. Note it as a gap and
  proceed.
- A language doctor reports as **unknown** is not handled here at all: no
  installed plugin declares it, so it is a `blocking` finding and a hard halt in
  `SKILL.md`. It is not a missing LSP — it is a stack vwf has no template,
  conventions or harness for, and there is nothing to proceed without.

Everything else doctor reports is noted and carried into the run's gap list, not
blocked on.
