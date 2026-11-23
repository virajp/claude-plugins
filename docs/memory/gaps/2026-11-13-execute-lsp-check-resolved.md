GAP 2026-11-13 ★3 | execute has no LSP check | open: the scripted start of
/vwf:execute gates on no LSP server — since R5b `checks.mjs` has a degraded
`lsp` row (a server of `bootstrap lsp --json` missing from `vwf-tools`), which
never halts a run — and preflight's consent.lsp rule is removed | resolved
2026-11-23 by 2026-11-18-lsp-check

**Source plan** `2026-11-12-execute-scripted-start` (decision D22, rulings
review gap 5).

- The plan replaces the doctor skill in `/vwf:execute` with `start.mjs`. The
  rule for "the local LSP plugin is enabled" was not settled: each entry of
  `claude plugin list --json` has `enabled`, `projectEnabled`, `scope` and
  `projectPath`, and the meaning of `projectEnabled` is not documented. On the
  maintainer's machine `vwf-tools@vwf-tools` is user scope, `enabled: false`.
- The user ruled: park the detection. Bootstrap will install LSP servers,
  which makes detection simple.
- Until then a run with a `code` unit has no LSP gate. `consent.lsp` is still
  written by `/vwf:plan` and still read by nothing in `/vwf:execute`.
- Pick it up in a plan after the bootstrap work lands: define "present" from
  what bootstrap installs, add the `lsp` rows to `checks.mjs` and `start.mjs`,
  and restore the preflight rule. Since R5b (`2026-11-15-vwf-over-bundles`,
  D8) `checks.mjs` carries the degraded `lsp` row; the gate in `start.mjs` and
  the preflight rule are still open.

Resolved: `checks.mjs` runs bootstrap's `code:lsp:check` and makes a degraded
`lsp-check` row for each missing server, a missing task or a failed check (D2).
`start.mjs` stops a plan with a `code` unit on any `lsp-check` row, and the user
fixes it before the run continues; a plan with no `code` unit continues, and its
final report lists the rows (D4). `consent.lsp` is retired, and `/vwf:plan` no
longer asks the LSP question (D5). This reverses the parked rule above
(`installed` stops, `proceed without` writes a gap and continues): no consent
applies (D12).
