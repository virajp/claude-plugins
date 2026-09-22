# U3 — gitleaks allowlist, grype baseline passage

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/gitleaks/config/**`,
  `…/gitleaks/conventions.md`, `…/gitleaks/skills/**`,
  `plugins/stackgen/stacks/toolchain-gate/grype/config/**`,
  `…/grype/conventions.md`, `…/grype/skills/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing —
  `gitleaks.toml` whole (the `dir`-mode note at `:27-31`, the allowlist at
  `:42-49`), `gitleaks/conventions.md:53-56` (the baseline passage to mirror),
  `grype.yaml` whole (`:15` threshold, `:36` `ignore: []`).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/code/sec`
  (how each tool is invoked — read, never edit).

## Ruling

Decision 5 — gitleaks: "`gitleaks.toml`'s allowlist gains `^\.env$`,
`^\.env\..*`, and `.venv/` beside `node_modules/`; `code:sec`'s full mode stays
`dir` (the comment at `sec:54-56` stands)."

Decision 6 — grype: "`G/grype/conventions.md` and its skill gain an
"Establishing a baseline on an existing repo" passage in the shape of gitleaks'
(`gitleaks/conventions.md:53-56`): run the scan, copy each finding's
vulnerability id into `ignore:` with a one-line reason; `code:sec` prints that
remedy on a grype failure. The threshold stays `medium` — making it a value is
plan 5."

## Edits

1. **`gitleaks/config/.config/gitleaks.toml:42-49`** — the allowlist paths gain
   `^\.env$`, `^\.env\..*` and `^\.venv/` (regex form matching the file's
   existing entries), each with the file's comment style; the `dir`-mode note at
   `:27-31` gains one sentence: a gitignored `.env` is read by `dir` mode, which
   is why it is allowlisted here.
2. **`gitleaks/conventions.md`** and **`gitleaks/skills/**`** — where the
   allowlist is enumerated, add the three entries.
3. **`grype/conventions.md`** — after the threshold passage (`:34-35`), a
   section **Establishing a baseline on an existing repo** in the shape of
   gitleaks' `:53-56`: run `mise run code:sec`, read each grype finding's
   vulnerability id, add it under `ignore:` in `.config/grype.yaml` with a
   one-line `# reason`, re-run until green; the threshold stays `medium`.
   **`grype/skills/**/SKILL.md`** (`:34, 55-64`) gains the same in one paragraph
   and points at the conventions section.
4. **`grype/config/.config/grype.yaml:36`** — a comment above `ignore: []`
   naming the baseline procedure in one line (no plugin path).

## Verification

- `mise run p:plugins:check` green (rule 13 — no plugin path in `config/`).
- `grep -n "\.env" plugins/stackgen/stacks/toolchain-gate/gitleaks/config/.config/gitleaks.toml`
  — the two entries present.
- `grep -n "baseline" plugins/stackgen/stacks/toolchain-gate/grype/conventions.md plugins/stackgen/stacks/toolchain-gate/grype/skills -r`
  — hits in both.
- `grep -n "fail-on-severity: medium" plugins/stackgen/stacks/toolchain-gate/grype/config/.config/grype.yaml`
  — unchanged, one hit.

## Guardrails

- `config/` is payload — no formatter; TOML and YAML by hand in the file's
  style.
- Do not edit `code/sec` (U1) — the remedy line is U1's.
- No `pack.yaml` bump — U7.
- No doc outside the two packs — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` outside `config/` is not dprint-formatted: match the fold
  width by hand; strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`fix: gitleaks allowlists .env and .venv; grype documents a baseline step` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
