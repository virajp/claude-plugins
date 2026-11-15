# U8 — Docs

- **Read first:** the DOCS FALSIFIED lines of U1 to U6 and U10, and the run of
  `vwf:docs-sync` over the delta of waves 1 and 2.

## Ruling

- Every owned passage that describes architecture's stack round, setup's
  materialize pass, doctor's stack checks, the design adapters or addons
  describes the R5b behaviour (D2-D8).
- `.claude/skills/vwf-plugin/`: the stack and design adapter passages.
- The site manual: `plugins/vwf.md`, `how-to/operate/choosing-your-stack.md`,
  `greenfield/ui-with-design-tool.md` and each other page the sync names.

## Verification

- `mise x -- mise run code:format` passes.
- `mise x -- mise run p:site:check` passes.

## Guardrails

- Touch nothing outside the owned paths.
- `CLAUDE.md`, `readme.md` and the site pages are dprint-formatted; run
  `code:format` after each edit.

## Commit

`docs: vwf over stackgen bundles, bootstrap tools and vwf-tools design tools`
