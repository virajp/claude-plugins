# U3 — Doctor probes the forge CLI

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files top to bottom;
  `plugins/vwf/skills/backlog/SKILL.md` (U1's, committed — the forge rule and
  the precondition, which this check mirrors and never redefines).
- **Lazy-load:** `plugins/vwf/skills/backlog/references/github.md` for the exact
  scope-check invocation.

## Ruling

Decisions 7 and 9, quoted:

> **7.** The base repo's `origin` host decides: `github.com`, or any host
> `gh auth status` lists, is GitHub; `gitlab.com`, or any host
> `glab auth status` lists, is GitLab; anything else is unsupported.

> **9.** One paragraph after the `rtk` one in stack-checks: `gh` on `PATH`,
> `gh auth status` green for the base remote's host, the `project` scope present
> — each missing one a **degradation** with its remedy, never blocking, reported
> every run; on a GitLab remote the same three for `glab`, with "backlog not yet
> supported there" noted. Doctor's checks-table row names it.

## Edits

1. **`skills/doctor/references/stack-checks.md`** — after the `rtk` paragraph
   (`:252-262`), one paragraph in the same voice: **the forge CLI is
   recommended, never required.** `/vwf:backlog` keeps the product's backlog on
   the base repo's forge and needs its CLI: resolve the forge as the `backlog`
   skill does (cite `${CLAUDE_PLUGIN_ROOT}/skills/backlog/SKILL.md` for the
   rule; do not restate it), then three probes — the binary on `PATH` (`gh`, or
   `glab` on GitLab), `auth status` green for the remote's host, and on GitHub
   the `project` scope in the token — each miss a **degradation** naming what it
   costs (the backlog is unreadable; the planners' recall proceeds without it)
   and its remedy (`brew install gh` or the releases page; `gh auth login`;
   `gh auth refresh -s project`). On GitLab, note that the backlog is not yet
   supported there, so the probe reports the CLI state as information. An
   unsupported host reports `n/a — no forge CLI`. Reported every run, like
   `rtk`, for the same reason.
2. **`skills/doctor/SKILL.md:140-163`** — the 3–5 row's Covers cell adds "the
   recommended forge CLI" beside "the recommended `rtk`". Nothing else.

## Verification

- `grep -n 'forge CLI\|gh auth refresh -s project' plugins/vwf/skills/doctor/references/stack-checks.md`
  hits both.
- `grep -n 'forge CLI' plugins/vwf/skills/doctor/SKILL.md` hits once.
- `grep -n 'blocking' plugins/vwf/skills/doctor/references/stack-checks.md`
  gains no hit in the new paragraph.
- `mise run p:plugins:check` green.
- `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the two owned files — not `skills/backlog/`, not the
  callers (U2, same wave), not `code-intelligence.md` or
  `harness-and-memory.md`.
- Do not run `gh` against GitHub.
- Do not restate the forge rule or the scope check — cite the skill.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width; the checks table's cells are long by design, match them.
- No escaped backtick inside a code span; no table cell ending in a bare
  asterisk.
- Delete nothing; `rm` nothing.

## Commit

`feat: doctor — the forge CLI behind the backlog, reported as a degradation` —
written by the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
