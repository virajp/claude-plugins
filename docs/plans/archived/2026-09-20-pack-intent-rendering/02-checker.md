# U2 — the checker: rule 11 learns `conditional:`, rule 15 asserts the exclusion sets

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/check.ts`, `scripts/src/check.test.ts`,
  `.claude/skills/plugin-authoring/references/checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `scripts/src/check.ts` whole — rule 11's walk of a pack's
  `config/` tier and its `pack.yaml` parse, rule 14's shape (the newest rule, a
  good template), the finding/report shape; `check.test.ts` whole — how a rule's
  fixtures are built; `checks.md:34-210`.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (U1's — the
  `conditional:` shape, cited by key name); the four files rule 15 reads:
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json:5-16`,
  `…/dprint/config/.config/taplo.toml:10-16`,
  `…/gitleaks/config/.config/gitleaks.toml:42-49`,
  `…/pre-commit/config/.config/pre-commit-config.yaml:39` (read only — U4 edits
  them).

## Ruling

Decision 1, the checker's part: "Rule 11 validates the key (known paths, known
vocabulary)."

Decision 5 — Values: "Checker **rule 15**: across the dprint pack's
`dprint.json` and `taplo.toml`, the gitleaks allowlist and the pre-commit global
`exclude`, the exclusion sets agree after normalisation (strip `^`, `/`, `**/`,
trailing `/`, regex escapes); a difference names the file and the entry."

## Edits

1. **`check.ts`** — rule 11 gains two assertions: every `conditional:` entry
   names a path or glob that resolves to at least one file under the pack's
   `config/` tier, and its `when:` carries exactly one of the four axes with a
   value from the vocabulary (`forge`: github, gitlab; `editor`: vscode;
   `secrets`: any slug; `update_bot`: renovate, dependabot, none). Rule 15, new,
   in rule 14's shape: parse the four lists, normalise each entry (strip a
   leading `^`, leading `/`, a `**/` prefix, a trailing `/`, and the regex
   escape before `.`), compare as sets, report each entry present in some files
   and absent from others with the files on each side. Register the rule in the
   runner and its summary line.
2. **`check.test.ts`** — fixtures for both: a pack with a valid `conditional:`
   passes; an unknown axis, an unknown value and a path that resolves to nothing
   each fail with the expected message; a four-file fixture whose sets agree
   passes, one entry removed fails naming the file.
3. **`checks.md`** — rule 11's paragraph gains the two assertions; a rule 15
   paragraph in the file's shape; the count "fourteen rules" wherever it appears
   in this file becomes fifteen (the rest of the tree's counts are U8's — report
   them as `DOCS FALSIFIED:`).

## Verification

- `pnpm vitest run` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green against the live tree — rule 15 must be green
  on the packs as they are after U4's edits in the same wave; if it is red at
  the wave gate, the finding names the entry and U4 is the unit to fix it, not
  this one.
- `grep -n "rule 15\|Rule 15" .claude/skills/plugin-authoring/references/checks.md`
  — present.

## Guardrails

- Only the three owned files; the packs (U3, U4) and the assets (U1) are read,
  never edited.
- `scripts/**` is dprint-formatted and linted — run `mise run code:format --fix`
  over the two TypeScript files before returning; the linter runs at the wave
  gate.
- No doc outside `checks.md` — `DOCS FALSIFIED:` lines (the "fourteen rules"
  counts in `CLAUDE.md`, `.claude/docs/repo-shape.md`, the site).
- Delete with `rm`, never `git rm`.

## Commit

`feat: checker — rule 11 validates conditional files; rule 15 asserts the exclusion sets agree`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
