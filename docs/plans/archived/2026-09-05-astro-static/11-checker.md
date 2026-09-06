# U11 — The checker: the widened allowlist, editor fragments, the whole pre-commit config

- **Wave:** 1
- **Depends on:** —
- **Owns:** `scripts/src/**` — `check.ts`, `check.test.ts` and any fixture they
  need. Touch nothing outside this list; `inventory.ts` and `marketplace.ts` are
  not this unit's.
- **Model:** opus
- **Read first:** `scripts/src/check.ts` — rule 11 whole (`:343-420`), the root
  allowlist constant (`:301`), the `pre-commit.d` parse (`:257`, `:400-418`);
  `scripts/src/check.test.ts` — the rule-11 cases, especially the pass fixture
  and the `netlify.toml` negative case added on 2026-09-05.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` for rule
  11's prose (U3's file — read, never edit).

## Ruling

D36: "Root allowlist gains `dprint.json`, `.npmrc`, `CONTRIBUTING.md`,
`.graphifyignore`, `.github/` — with `.github/workflows/` refused inside it."

D26: the fragment is "a JSONC object with exactly three optional top-level keys:
`settings`, `nesting`, `extensions`" at `config/.config/vscode.d/<pack>.jsonc`.

Gate delta from the survey: "the pre-commit pack ships a **whole** config at
`config/.config/pre-commit-config.yaml` — not a fragment, not at the `config/`
root — so no rule parses it at all."

The charter fence stands for CI: a payload may never land a workflow file.

## Edits

1. **`scripts/src/check.ts`** — the root allowlist gains `dprint.json`,
   `.npmrc`, `CONTRIBUTING.md`, `.graphifyignore`, keeping the array's existing
   sort. A root **directory** allowlist (introduce it if the check is file-only
   today) admits `.config` and `.github`; inside `.github/`, a path under
   `workflows/` is a finding worded as the CI fence ("a pack states which task
   CI runs and never writes the workflow"). `.vscode/` at a `config/` root stays
   refused — fragments live under `.config/vscode.d/`.
2. **`scripts/src/check.ts`** — rule 11 walks `config/.config/vscode.d/*.jsonc`:
   each parses as JSONC (strip `//` and `/* */` comments and trailing commas,
   then `JSON.parse` — no new dependency), is an object, and carries only
   `settings` (object), `nesting` (object whose values are arrays of strings)
   and `extensions` (array of strings) at the top level. Any other key, or a
   wrong shape, is a finding naming the file and the key.
3. **`scripts/src/check.ts`** — rule 11 parses any
   `config/.config/pre-commit-config.yaml` a pack ships with the same YAML
   assertion the `pre-commit.d/*.yaml` fragments get: it parses, and carries a
   top-level `repos:` list. Reuse the existing helper.
4. **`scripts/src/check.test.ts`** — cases: the five new root names pass;
   `.github/ISSUE_TEMPLATE/bug.md` passes; `.github/workflows/ci.yml` fails with
   the fence wording; `.vscode/settings.json` at a config root fails; a
   `vscode.d/x.jsonc` with comments and a trailing comma passes; one with a
   fourth top-level key fails; one whose `nesting` value is a string fails; a
   pack `pre-commit-config.yaml` without `repos:` fails; the existing
   `netlify.toml` negative case still fails.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` passes; `pnpm vitest run` passes.
- `pnpm exec tsc --noEmit -p scripts` clean.
- `mise run plugins:check` exits 0 on the wave-1 tree — the payload files U6, U7
  and U8 add are what this allowlist admits, so run it last, after theirs land,
  and say if it is red for a reason outside this unit.

## Guardrails

- Do not edit `plugins/**` or any doc; rule 11's prose in
  `.claude/skills/plugin-authoring/references/checks.md` is falsified by this
  edit — report it as `DOCS FALSIFIED:` with the line.
- Add no npm package; the JSONC strip is a few lines.
- Write with Write/Edit; `cat` is `bat`.

## Commit

`ops: widen the root allowlist, parse editor fragments and the whole pre-commit config`
— written by the orchestrator after the wave gate, not by the unit.
