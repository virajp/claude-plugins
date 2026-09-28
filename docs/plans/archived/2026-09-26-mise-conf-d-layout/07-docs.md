# U7 — Docs

- **Wave:** 3
- **Depends on:** U2, U3, U4, U6
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`,
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/assets/pack-format.md`, the other packs' comment mentions of
  a base `mise.toml` pin (pnpm, eslint, flutter, swift code/lint files at the
  lines the Facts name) except swiftui and doppler,
  `plugins/stackgen/stacks/readme.md`, `site/src/content/docs/**`, `readme.md`,
  `CLAUDE.md`, `.claude/**`,
  `docs/memory/decisions/2026-09-26-mise-conf-d-layout.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Facts and Reversals; every `DOCS FALSIFIED:` line U1–U5
  returned; the four reversed decision docs; `plugins/vwf/assets/memory.md`.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–10 of index.md, as the behaviour the docs now describe (quoted in
full in `01-mise-pack.md`, `03-init.md`, `04-doctor-and-callers.md`). The Goal,
quoted:

> After this lands, a shaped repo's mise config is split by section under
> `.config/mise/conf.d/` — `.config/miserc.toml` turns on environment suffixes,
> the top-level mise files hold only settings and top-level keys, and every
> environment's tools lock into one `.config/mise/mise.lock`, written only when
> it is missing or under `--upgrade` in dev.

The four reversals in index.md's Goal become one decision doc,
`docs/memory/decisions/2026-09-26-mise-conf-d-layout.md`, which links each
reversed doc as superseded or amended, and quotes the user: *"`mise` config
files are becoming large and difficult to manage"*.

Decision 12: any sentence you add is short; trimming is B65's. `pack-format.md`
and `output-tree.md`: change only the mise-layout and lock lines; the
`conf.d/<pack>.toml` fragment convention is B2's.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns.
2. **The mise pack's docs** — `conventions.md` (:60–61, :78–79, :160, :164, the
   five-file split), `skills/mise/SKILL.md` (:66, :91, :103, :260),
   `references/config-files.md` (:27, :40, :222, :272–276),
   `references/task-library.md` (the setup rows and the no-clobber contract).
3. **stackgen assets and the other packs' comments** — per Owns.
4. **Site, `readme.md`, `CLAUDE.md`, `.claude/**`** — every passage naming the
   five-file split, `mise.lock` / `mise.<env>.lock`, or `mise run setup:all`
   without `MISE_ENV=dev`.
5. **The decision doc.**
6. **Every `DOCS FALSIFIED:` line** from U1–U5.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:site:check` green

## Guardrails

- Never touch a task file, a config payload, a vwf skill U3/U4 own, or a
  version.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- No table cell ends in a bare `*`; no code span wraps a line.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: mise conf.d layout — the manual, the pack docs and the decision` —
written by the orchestrator after the wave gate.
