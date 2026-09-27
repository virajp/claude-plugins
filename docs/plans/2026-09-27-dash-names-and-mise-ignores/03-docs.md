# U3 — Docs: reconcile the manual and record the reversal

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `site/src/content/docs/**`, `.claude/**`, `CLAUDE.md`, `readme.md`,
  `docs/memory/decisions/2026-09-27-mise-local-files-ignored-by-name.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** the `vwf:docs-sync` skill, then every file it or the list
  below names, before editing.
- **Lazy-load:** `docs/memory/decisions/2026-09-26-mise-conf-d-layout.md` (the
  line being superseded), the vwf memory asset for the decisions-doc shape.

## Ruling

> Decision 4 — The mise ignore patterns: Bare names `mise.local.toml`,
> `mise.*.local.toml`, `mise.local.lock`, `mise.*.local.lock`,
> `.mise.local.toml`, `.mise.local.lock`, plus the spelled-out
> `.config/mise/conf.d/*.local.toml` and `.config/mise/config*.local.toml`;
> every other hardcoded mise path is dropped. A reversal of conf-d-layout's
> hardcoded paths.

> Decision 3 — This repo's own copies: Out of scope: `.config/mise/tasks/**` and
> the root `.gitignore` are left to the next `/vwf:setup reshape`, as
> gate-hardening ruling B6 left them.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings.
2. Apply every `DOCS FALSIFIED:` line U1 and U2 returned.
3. Reconcile the survey's list:
   `site/src/content/docs/plugins/stackgen.md:315, :926, :949` (which mise local
   files are ignored, and how), and every place the site lists the pre-commit
   hooks tool-config ships (add `no-dash-names`, with its one-sentence reason)
   or says how sort-package-json runs. Leave `:282` (swift's `./`-prefixed
   paths) — it stays true.
4. Write `docs/memory/decisions/2026-09-27-mise-local-files-ignored-by-name.md`:
   the reversal — conf-d-layout's hardcoded paths (one of them wrong:
   `.config/mise/mise.local.lock` where mise writes `.config/mise.local.lock`)
   replaced by bare names that match at any depth, the two paths that stay
   spelled out and why, and `config*.local.toml` catching plain
   `config.local.toml`. Name the superseded line,
   `2026-09-26-mise-conf-d-layout.md:15`, and do not edit that memo.

## Verification

- `mise run p:site:check` green.
- `grep -rn 'mise/mise\.local\.lock' site/src/content/docs` returns nothing.
- `grep -rn 'no-dash-names' site/src/content/docs` has at least one hit where
  the shipped hooks are listed.

## Guardrails

- Do not edit plan folders or older decision memos — they are history.
- Do not edit any file under `plugins/` — report it as a `GAP:` instead.
- `CLAUDE.md`, `readme.md` and `site/**` are dprint-formatted; widening a table
  cell re-pads every row, so run `mise run code:format -- <file>` over only the
  files you edited. Never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`docs: dash-name block, sort-package-json pin and mise ignores`
