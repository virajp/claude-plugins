# U7 — vwf prose: doctor, readme, init's lock step, setup, worktree setup

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/skills/doctor/**`,
  `plugins/vwf/skills/readme/SKILL.md`, `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the passages cited below in each owned file; U1's
  `TC/scripts/lib/drift.mjs` and `TC/scripts/tool-config.mjs` (the `check`
  command's output).

## Ruling

> D5 — Drift is "render what this block should be, compare with the file" —
> exposed as a script `check` command that `/vwf:doctor` calls.

> D13 — Bare `mise use` is forbidden: a tool is entered into the config first,
> then installed with `mise install`. … doctor's remedies say so.

> D14 — … init's §11(b) lock step [is] removed in this plan, not left for plan 4
> — the init step fails on every run today.

> D17 — `vwf:readme` runs only `MISE_ENV=dev mise run setup:all`, no
> `mise install` before it (B75 item 6).

User, verbatim: *"base `mise use` command must be forbidden. All mise tools must
be first entered into the config and then use `mise install`."*

## Edits

1. **Doctor.**
   - `references/stack-checks.md:103` — the missing-binary remedy: pin the tool
     at an exact version in the right `.config/mise/conf.d/tools*.toml` (or ask
     `/stackgen:tool-config` to add it), then `mise install`. Never a bare
     `mise use`.
   - `references/code-intelligence.md:14` — graphify's remedy: it is pinned in
     the repo's `conf.d/tools.dev.toml` by tool-config; run
     `MISE_ENV=dev mise install`. No `mise use -g`.
   - `references/stack-checks.md:548-561` — the `tool-config/…` drift check
     invokes `/stackgen:tool-config check` (the skill, never the script's path —
     vwf may not cite a stackgen path) and reports its rows.
   - Remove any lock finding or lock remedy (`grep -n -i lock` the doctor tree;
     uv's and package managers' own lockfiles stay).
2. **`plugins/vwf/skills/readme/SKILL.md:73,109`** — the setup instructions run
   `MISE_ENV=dev mise run setup:all` alone; drop the `mise install` before it.
3. **init's lock step.**
   - `references/new-repo.md:709-752` — §11(b): drop "the ignore fix before the
     lock" lock-specific framing, the
     `git check-ignore -v .config/mise/mise.lock` check, the
     `mise tasks info setup:mise` probe, the `setup:mise --lock-only` run, the
     lock staging and the `lock failed` / `lock deferred` report lines. Keep:
     checking out `develop`, staging exactly what the run wrote, the base's
     moved gitlinks.
   - `SKILL.md:129-130` (the git-pass summary's `--lock-only` clause) and
     `SKILL.md:691` ("installs uv and Python to write or fill its mise lock") —
     remove; the report's Lock line goes with them (`SKILL.md:848` or wherever
     the report table carries it).
   - `references/existing-repo.md:1155-1159` — remove the lock paragraph.
   - Where init states the `all` call's grammar, use the flag form (D8).
4. **`plugins/vwf/skills/setup/references/materialize.md:170-310`** — the
   preview/answers relay and the machine-value `set env` call in the flag form
   (`… mise set-env --key <K> --value <v> --for <pack>`), through
   `/stackgen:tool-config`.
5. **`plugins/vwf/skills/git-workflow/references/worktree-setup.md:116-117`** —
   no `.config/mise/mise.lock`, no `mise install --locked`: the worktree's tools
   install from the exact pins.

## Verification

- `grep -rn -E 'mise\.lock|lock-only|mise install --locked' plugins/vwf` prints
  nothing.
- `grep -rn 'mise use' plugins/vwf` prints only lines that forbid it.
- `grep -rn 'skills/tool-config/scripts' plugins/vwf` prints nothing (rule 6).
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Init's other passes and steps (bootstrap, `_default`, passes 3–9) are plan 4's
  — edit only the lock passages and the call grammar.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand; keep code
  spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: vwf drops the mise lock step and bare mise use, doctor drift runs tool-config check`
