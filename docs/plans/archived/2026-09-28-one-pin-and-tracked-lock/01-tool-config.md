# U1 — tool-config: graphify's needs, one pin per tool, tracked lock files

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/mise.md`,
  `plugins/stackgen/skills/tool-config/references/git.md`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/conf.d/tools.dev.toml`,
  `plugins/stackgen/skills/tool-config/assets/git/.gitignore`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts; `SKILL.md` on conflict rows (:66-71, :89-91,
  :207-212, :236-262, :360); `references/mise.md` on the one-pin rule (:77-80,
  :128-130, :420-424), the `all` migration (:483-511) and the graphify passage
  (:217-218); `references/git.md` :121-128; the owned `tools.dev.toml` whole.
  Line numbers may have moved.

## Ruling

> - Decision 1: graphify requires python and uv, and every passage that names
>   its needs says both.
> - Decision 2: The one-pin check runs for every tool the base mise block pins,
>   on `all` and on a reshape, as well as on `add tool`. A clash is a conflict
>   row whose two answers are the repo's existing version or the base's
>   `latest`; the winner is pinned once.
> - Decision 3: A tool one environment needs is pinned in
>   `.config/mise/conf.d/tools.<env>.toml`; a tool several environments need is
>   pinned in `.config/mise/conf.d/tools.toml`.
> - Decision 4 (ruled at resume 2026-09-28, reversing the approved ruling): no
>   lock file is ignored except `mise.local.lock`, at any depth. The shipped
>   `.gitignore` carries one lock line, `**/mise.local.lock`, in place of
>   `mise.local.lock`, `mise.*.local.lock` and `.mise.local.lock`. When a repo's
>   `.gitignore` has a line ignoring any lock file (e.g. `*.lock`, `mise.lock`,
>   `locks/`), init removes that line, one removal row per line in the one
>   consent. No negation lines.
> - Decision 8: Any sentence a unit adds is one sentence, wrapped at the fold.

## Edits

1. **`references/mise.md`, graphify** — the sentence near :217-218 says the
   graph tool needs python and uv; no passage says a repo with no Python still
   gets it.
2. **`references/mise.md`, one pin** — the one-pin rule states decision 2: the
   check runs when `all` lands the base block (a fresh repo and a reshape) for
   every tool the base block pins, not only on `add tool`. Name the row's two
   answers and state decision 3's placement for the winner. Keep the existing
   `keep-existing` / `overwrite` vocabulary if it maps cleanly (`keep-existing`
   = the repo's version, `overwrite` = the base's `latest`), and say so in one
   line.
3. **`SKILL.md`** — where conflict rows are described, one line each: `all`
   raises a row for a base-block tool the repo already pins, and the answers of
   decision 2.
4. **`references/git.md`** — decision 4 as tool-config's rule: lock files are
   tracked; the negation lines and when a removal row is needed instead; the
   existing guard at :121-128 extends to `.config/mise/locks/`.
5. **`assets/mise/.config/mise/conf.d/tools.dev.toml`** — the header's sentence
   that the overlap with a runtime pack's python pin "is accepted" is rewritten
   to decision 2: a repo that already pins python is asked which version to
   keep, and it is pinned once. Refold by hand, then run the shipped taplo
   config over the file (`assets/dprint/.config/taplo.toml`, e.g.
   `mise x -- taplo fmt --config <it> <file>`) and confirm a second pass changes
   nothing.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- the shipped-taplo pass over `tools.dev.toml` changes nothing on a second run

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line; no `|` inside a table cell.
- Touch nothing outside the owned paths — not init, not the site.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: tool-config asks which version to keep and pins each tool once` — written
by the orchestrator after the wave gate.
