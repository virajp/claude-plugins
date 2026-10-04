# Decision — trust is the user's; `setup:all` is part of `tool-config all`

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-gates` ·
**Plan**
[`docs/plans/2026-10-01-tool-config-script-gates/`](../../plans/2026-10-01-tool-config-script-gates/index.md)
(ruling G4) · **Supersedes** `vwf:init`'s new-repo §9 trust step and §10
aggregator offer, as recorded in
[`2026-09-06-init-owns-the-first-commit.md`](./2026-09-06-init-owns-the-first-commit.md)
(D19's "§10 offers the bootstrap aggregator") and
[`2026-09-20-init-brownfield-reads.md`](./2026-09-20-init-brownfield-reads.md)
(the post-landing steps and "the aggregator, if accepted")

## The user's words

> `mise trust` is expected to be run before hand by user, script must expect
> that this is in-place. `mise run setup:all` is the best way to get the repo
> setup. Initially it can be simply installing all mise tool & config but once
> the skill is done, `setup:all` mise task must be capable to setup all the
> things required to run/contribute in the respective repo

## What was decided before

`init`'s §9 ran `mise trust --all` after the landing, and §10 *offered* the
bootstrap aggregator, `setup:all`, as a separate consent.

## What changed

- **Trust is a prerequisite.** The person trusts the repo's mise config before
  the call — typically its path in `trusted_config_paths` in the global mise
  config, or `mise trust --all` in a repo that already has its config. The
  script reads trust and never grants it: any call but `check` on an untrusted
  config is refused, naming the remedy. `init` checks it in the survey, names
  the remedy in the plan and waits; it never runs it.
- **`all` runs `setup:all`.** `tool-config all` = land every file →
  `MISE_ENV=dev mise run setup:all` → format and validate the files it wrote →
  record hashes. An untrusted config or a failed `setup:all` leaves the files
  written and unrecorded (exit 2); re-running the same `all` covers them.
- **§10 retired; §9 is the executable bit alone.** `init`'s post-landing steps
  are four — §3, §4, §8, §9.
- **A kept foreign hook manager** (ruled 2026-10-04): `setup:precommit` without
  `--force` warns, installs nothing and exits 0, so `all` completes; a
  successful `all` returns `setup:all`'s output tail as `setup`, which the
  caller relays so the "landed but not wired" warning reaches the person.
  `--force` against a `core.hooksPath` set outside the repo still exits 1.

## The alternatives rejected

- **The caller runs `setup:all`** — every caller would have to remember it, and
  `all` would not end in a usable repo.
- **Refuse until installed** — a fresh repo has nothing installed; `all` is what
  installs it.
