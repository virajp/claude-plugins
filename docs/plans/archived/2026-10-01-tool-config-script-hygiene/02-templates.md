# H2 — Hygiene templates, vendored `.gitignore` files, the refresh task

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/assets/git/**`,
  `plugins/stackgen/skills/tool-config/assets/graphify/**`,
  `plugins/stackgen/skills/tool-config/assets/renovate/**`,
  `plugins/stackgen/skills/tool-config/templates/gitignore/**` (new),
  `.config/mise/tasks/p/plugins/gitignore-templates` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned asset; `TC/references/git.md` §4 (the template
  table `:198-205`); an existing `.config/mise/tasks/p/plugins/*` task (the
  shape to copy).

## Ruling

> H1 — The `.gitignore` templates (Node, Python, Dart, Swift, Go, Rust) are
> vendored under `TC/templates/gitignore/<Name>.gitignore`, each with its
> upstream github/gitignore commit SHA in a header line. … A repo task
> `p:plugins:gitignore-templates` refreshes them from upstream; a stackgen
> release moves them. … They sit outside `assets/`, which the checker treats as
> a landed repo root.

> H4 — renovate's pre-commit manager matches `.config/pre-commit-config.yaml`
> (B80 item 3).

## Edits

1. **Vendored templates** — create
   `TC/templates/gitignore/{Node,Python,Dart,Swift,Go,Rust}.gitignore`: each the
   github/gitignore file at one commit on `main`, byte for byte below a first
   line `# github/gitignore <Name>.gitignore @ <sha>`. Fetch them once in this
   unit (network allowed here):
   `git ls-remote https://github.com/github/gitignore main` for the SHA, then
   the raw file at that SHA.
2. **`.config/mise/tasks/p/plugins/gitignore-templates`** — a bash task (mode
   `755`, `#MISE description=…`, the repo's helper `source` line) that resolves
   `main`'s SHA, re-fetches every file present in `TC/templates/gitignore/`,
   rewrites the header line, and prints which files changed. `--check` exits 1
   when any vendored file differs from upstream at the recorded SHA (no network
   beyond that fetch). BSD-`sed` safe.
3. **`TC/assets/renovate/renovate.json`** — the `pre-commit` manager gets a file
   match for `.config/pre-commit-config.yaml` (Renovate's
   `managerFilePatterns`/`fileMatch` key as Context7 documents it for the
   current Renovate — check before writing).
4. **`TC/assets/git/**`, `TC/assets/graphify/**`** — keep every `# >>>` block
   and banner as it is; add an anchor only where the script cannot find a
   position unambiguously.

## Verification

- `ls plugins/stackgen/skills/tool-config/templates/gitignore/` lists the six
  files; each first line names its SHA.
- `MISE_ENV=dev mise run p:plugins:gitignore-templates -- --check` green.
- `mise run p:plugins:check` green; `mise run code:precommit` green (the new
  task is shellchecked and formatted).
- The full wave gate.

## Guardrails

- Vendored files are payload: never format them; if a formatter or linter
  reaches `TC/templates/`, report a `GAP:` naming the exclusion needed (H10
  cannot add it; the orchestrator decides).
- Delete with `rm`, never `git rm`.

## Commit

`feat: vendor the gitignore templates tool-config lands, with a refresh task`
