GAP 2026-09-08 ★3 | pack-tier checker coverage, open | the checker still passes
six pack faults that the 2026-09-08 survey found no rule for | all pass on the
tree today, so each is a risk, not a live defect

**Source plan** `2026-09-08-checker-landed-citations`.

That plan added rule 13 (landed citations), pack skill frontmatter parsing and
the bundle pin throw. It parked these checks. The checker code has none of them.

- **Unreferenced packs.** A pack that no bundle names. Day one it flags
  `package-manager/uv` and `toolchain-gate/ruff`, which are the known gap
  `2026-09-01-python-packs-authored-but-unreachable`. The check needs an
  allowlist keyed on that gap.
- **`pack.yaml` shape.** `type` equals its directory. The directory is a
  taxonomy type. `category` exists where the type has categories. `axis`,
  `platforms` on `language`, and `extensionToLanguage` on `lsp_servers` are
  present. A `mcp_servers` and `user_mcp_servers` name collision, which halts a
  run, is caught by nothing. The inventory requires only `name`, `summary`,
  `version` and `kind`.
- **Pack `hooks.yaml`.** Event and matcher shape is read by nothing.
- **Skill and agent `name:` against the directory or file name.**
- **Invocation rulings in `kinds.md`.** Only `design-tool` packs (rule 8) and
  the
  two adapter skills (rule 9) are asserted. Paths-scoped routers and
  model-invocable cloud skills are not.
- **Relative markdown links outside `assets/examples/`.** The survey found 90
  links, 37 unresolved, all template placeholders. A real broken link would
  pass.
  The rule needs to skip `<...>` segments.

One doctrine point also stays open. The technology-free guard
(`TOOL_TOKENS` in `scripts/src/check.ts`) is a hand list. It lacks
`cloudflare`, `wrangler`, `flutter`, `vercel` and `mise`. vwf names `mise` as a
prescribed command about 90 times. Whether that breaks "vwf names no
technology" is a ruling the guard does not make.
