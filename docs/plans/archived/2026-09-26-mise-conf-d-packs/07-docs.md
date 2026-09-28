# U7 — Docs

- **Wave:** 3
- **Depends on:** U3, U4, U6
- **Owns:** `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-26-mise-conf-d-packs.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Goal and Facts; every `DOCS FALSIFIED:` line U1–U5 returned;
  `docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md`;
  `plugins/vwf/assets/memory.md`.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–8 of index.md, as the behaviour the docs now describe (quoted in
`01-five-packs.md` to `05-checker.md`). The Goal, quoted:

> After this lands, the five packs that shipped a `conf.d/<pack>.toml` fragment
> — pnpm, swiftlint, fnox, doppler, swiftui — keep their mise lines in `mise.d/`
> inside the plugin, never landed; `/vwf:init` merges them into
> `.config/mise/conf.d/<section>[.<env>].toml` between per-pack markers, and on
> drift asks the user what to do.

The decision doc records the charter fence's kind (d) as retired and the drift
rule, quoting the user: *"skill must check with user on what to do and
accordingly do it"*. Any sentence you add is short (B65).

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply findings inside Owns.
2. **Every passage** naming `conf.d/<pack>.toml`, a provider's own `conf.d`
   fragment, or `machine_env` filled "in the pack's fragment" —
   `.claude/skills/stackgen-plugin/SKILL.md` (:187, :314),
   `.claude/skills/plugin-authoring/references/checks.md` (rule 11),
   `.claude/docs/repo-shape.md:190`, `CLAUDE.md` (rule 11 text),
   `site/.../plugins/stackgen.md` and `vwf.md`,
   `site/.../how-to/operate/choosing-your-stack.md:58`.
3. **The decision doc.**
4. **Every `DOCS FALSIFIED:` line** from U1–U5.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:site:check` green

## Guardrails

- Dprint-formatted files: let `code:precommit` pad tables; no table cell ends in
  a bare `*`; no code span wraps a line.
- Never touch a skill, a pack or a version.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: mise conf.d packs — the manual, the skills and the decision` — written by
the orchestrator after the wave gate.
