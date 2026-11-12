GAP 2026-11-13 ★3 | execute has no LSP check | open: the scripted start of
/vwf:execute checks no LSP server, and preflight's consent.lsp rule is removed
until bootstrap installs LSP servers | parked, waits on bootstrap

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
  and restore the preflight rule.
