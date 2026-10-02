# Decision — a pack's mise `tool-config:` entries are structured mappings

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-mise` · **Plan**
[`docs/plans/2026-10-01-tool-config-script-mise/`](../../plans/2026-10-01-tool-config-script-mise/index.md)
· **Supersedes** [`2026-09-26-tool-config.md`](./2026-09-26-tool-config.md)
items 6 and 10 for mise — the string grammar
`mise add tool|env|alias … to <scope>` and the checker's parse of it

## What was decided before

A pack listed `tool-config:` instructions in `pack.yaml` as strings in the
skill's word grammar, and checker rule 11 parsed each against a set of regexes
that restated that grammar.

## What changed

- **D9 — mappings.** A mise entry is
  `{tool: mise, verb: add-tool, name: …, version: …, env: …}`, and `add-env` and
  `add-alias` the same way. The schema and `validateEntry` live in the script's
  `scripts/lib/schema.mjs`; `scripts/src/check.ts` imports them, so the checker
  and the script refuse the same entries. The script's `apply-entries` runs a
  pack's list, which the materializer previews and then runs.
- **D10 — mise only, for now.** The 11 mise entries in swiftui, doppler, fnox,
  pnpm and swiftlint moved. A mise entry written as a string is a finding
  pointing at `assets/pack-format.md`. Every other tool's entry stays a string
  until plans 2 and 3 move it, and `apply-entries` hands those back for the
  prose half. A `machine_env` name must be set by a valid mise `add-env` entry.

## The alternatives rejected

- **Flag strings in `pack.yaml`** — still a grammar to parse twice, in two
  languages.
- **Migrate all 45 entries now** — the other tools are not on the script yet;
  their entries would have no reader that understands the new shape.
