# U1 — Pack tasks as Python uv scripts, and checker rules 11 and 17

- **Read first:** every owned file, top to bottom, before editing. Then read
  the reference for the task form, outside this repo, read-only:
  `~/Projects/github.com/virajp/bootstrap/docs/sync/migrate.md` sections
  "M48: The tasks are Python scripts, and the shell libraries are gone" and
  "M51", and the section "Task scripts" and "Python tasks" of
  `~/Projects/github.com/virajp/bootstrap/CLAUDE.md`.
- **Lazy-load:** `~/Projects/github.com/virajp/bootstrap/repo/tools/mise/tasks/helpers.py`
  (the print functions), and one shipped task as a model,
  `~/Projects/github.com/virajp/bootstrap/repo/tools/vscode/tasks/setup-vscode.py`.

## Ruling

> D1 — All five to Python: rewrite all five as `deploy.py` / `icons.py` uv
> scripts in bootstrap's form (standard library only, imports `helpers`, mode
> 755), with the same names, flags and exit codes, and the same output plus
> M51's success line (D22). Rule 11 accepts the uv shebang and the `.py` name.
> Matches M51 in full.

> D35 — The move from Wrangler to Cloudflare's `cf` CLI is a second plan
> folder that requires this one. In this plan the ported deploy tasks keep
> `wrangler deploy` exactly as today.

> D5 — Python uv only: each file under a pack's `p/_project/` must be
> `<name>.py`, mode 755, with the `#!/usr/bin/env -S uv run --script` shebang.
> A bash task, which could source a retired library, then fails the check. One
> rule, and no list of library names to keep in step.

> D10 — The message of a bare `mise use` finding points to
> `bootstrap add tool <tool>`, not to a hand edit of the config; the
> function's doc comment and checks.md say the same.

> D11 — Rule 11 and the five tasks land in one unit and one commit: the
> current rule accepts only the bash, node and python3 shebangs and the
> pre-commit hook runs it, so tasks committed first fail the old rule and a
> rule committed first fails the bash tasks.

> D3b — Generated only: the rule covers generated skills. Shipped skills keep
> their task names, because a person reviews them and the checker can guard
> them. The plan fixes only the wrong names (D2) and the stale helpers text.
> Shipped skills say once that the repo's mise skill lists every task.

> D6 — Each landed SKILL.md: one line in each SKILL.md that lands in a repo's
> .claude/skills/ (packs, tool knowledge, design tools) and names a task —
> 'The repo's mise skill, .claude/skills/mise/, lists every task.' An agent
> reads it where it uses the task. 'Names a task' is read per skill folder:
> the SKILL.md or one of its references names a mise task; the line goes in
> that folder's SKILL.md. stackgen's own skills do not get it (D31).

> D4 — The units cite the skill as `.claude/skills/mise/` and assume nothing
> more about it.

> D15 — Keep K1: run each task as a scratch copy under `p:vwfcheck:*` in this
> synced repo with `--help`, and each deploy with `--dry-run` and no
> credentials; delete the copies. U1's Verification runs it.

## Edits

1. **The five tasks** — for each of
   `plugins/stackgen/stacks/cloud-service/{workers-ssr,workers-static-assets,containers}/config/.config/mise/tasks/p/_project/deploy`
   and `plugins/stackgen/stacks/framework/{astro,html}/config/.config/mise/tasks/p/_project/icons`:
   write `<name>.py` beside it, then `rm` the old file. Each new file:
   - starts with `#!/usr/bin/env -S uv run --script`, then the PEP 723 block
     (`requires-python = ">=3.14"`, `dependencies = []`), then the M51 form
     of the mise lines (D22): `# MISE description=…` and
     `# MISE dir="{{ config_root }}"` with the old values,
     `# MISE tools={uv="latest", python="3.14"}`, then each old `#USAGE` line
     as `# USAGE …` with the same flag (deploy: `--dry-run`);
   - carries no `Synced from bootstrap` header (it is the repo's own task);
   - keeps the comment that `_project` is a MARKED POSITION renamed to the
     project's id on landing, and derives the id the same way, from the
     directory name: `os.path.basename(os.path.dirname(os.path.abspath(__file__)))`;
   - imports `helpers` as bootstrap's tasks do:
     `sys.dont_write_bytecode = True`, then
     `sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")`,
     then `import helpers  # noqa: E402`;
   - uses `helpers.print_header`, `print_subheader`, `print_warn`,
     `print_error` where the bash used the same-named functions;
   - reads a flag as bootstrap's tasks do:
     `os.environ.get("usage_dry_run", "false") == "true"`;
   - keeps the bash `have_task` check (D18): it runs `mise tasks`, reads the
     first column of each line after the header, and matches the name
     `p:{project_id}:build` exactly, so a build task that a repo defines in TOML
     still runs. It does not use `helpers.has_own_task`, which finds only a
     file task. The bash comment "Not in helpers — `setup/mise` defines its
     own copy; keep the two in step" is false now; replace it with one
     comment (D24): the check queries `mise tasks` because
     `helpers.has_own_task` finds only a file task, and a build task that a
     repo defines in TOML must still run;
   - keeps every step, message text, branch and exit code of the bash file
     (deploy: the credentials check skipped on `--dry-run`, the optional
     build, `pnpm exec wrangler` when `pnpm-lock.yaml` exists else
     `npx wrangler`; icons: the same search for the mark, the same outputs,
     the temporary directory removed on exit). Each `icons.py` also gets a
     `# USAGE` header with no flags (D37), so mise answers `--help` with the
     usage and exits 0 without running the task. In the M51 form (D22, bootstrap
     `docs/sync/migrate.md` M51, about :1581-:1610), each external command runs
     through `helpers.tool(...)`, as bootstrap's own tasks call a tool, and a
     failed command exits with its code; the last line on success is
     `helpers.print_success(...)`. The output is the bash output plus that
     one success line;
   - uses the standard library only, and is mode 755 (`chmod 755`).
   Keep the containers deploy's extra steps exactly as its bash has them.
2. **The pack text** — in each owned `conventions.md` and
   `references/pipeline.md`, every path or file name of the task
   (`.config/mise/tasks/p/<project-id>/deploy`, `p/_project/deploy`,
   `.config/mise/tasks/p/_project/icons`, and the head.md "The icons task"
   sections) names the `.py` file. The task names (`p:<project-id>:deploy`,
   `p:<project-id>:build`, the icons task) do not change. Where the text says
   the task is bash or sources a helper library, it says it is a Python uv
   script that imports bootstrap's `helpers.py`.
3. **D6 line** — add the one line of D6, as its own paragraph, to each of
   these SKILL.md files, placed after the skill's opening paragraph:
   `workers-ssr/skills/workers-ssr/SKILL.md`,
   `workers-static-assets/skills/workers-static-assets/SKILL.md`,
   `containers/skills/cloudflare-containers/SKILL.md`,
   `framework/astro/skills/astro/SKILL.md`,
   `framework/html/skills/html/SKILL.md`. The text, exactly:
   `The repo's mise skill, .claude/skills/mise/, lists every task.`
4. **`scripts/src/check.ts`, rule 11** — in `checkPackConfigTier`'s
   `landedTree`, a file under `.config/mise/tasks/` of a pack `config/` tier
   must end in `.py`, be executable, and start with
   `#!/usr/bin/env -S uv run --script`. Replace `PACK_TASK_SHEBANGS` with that
   one shebang (one constant) and add the `.py` name check with its own
   message naming bootstrap's M51 form. Update the doc comment's "known
   shebang" bullet to say this. The init asset trees walk the same function;
   none ships a task today, so the rule holds for them too. Rule 11 then has
   seven assertions (D32): set the count in the doc comment (about :434).
5. **`scripts/src/check.ts`, rule 17** — `checkBareMiseUse`'s message becomes
   `runs a bare \`mise use\` — add the tool with \`bootstrap add tool <tool>\``,
   and its doc comment says a tool is added through bootstrap, never by a
   hand edit of the config.
6. **`scripts/src/check.test.ts`** — update every fixture that writes a pack
   task (D27): a fixture meant to pass writes a `.py` uv task (name and
   shebang); a fixture that tests another fault keeps its file, and its exact
   expected findings add the new rule 11 finding. Find them with
   `grep -n 'mise/tasks' scripts/src/check.test.ts`; add cases: a bash-shebang task is refused, a task without `.py` is
   refused, a `.py` uv task passes. Update the rule 17 expectations (around
   :641-:679) to the new message.
7. **`.claude/skills/plugin-authoring/references/checks.md`** — rule 11's
   text (about :113) and rule 17's text (about :262-:272) say the same as
   edits 4 and 5; rule 11's count of assertions becomes seven (D32).
8. **`.claude/skills/plugin-authoring/SKILL.md`** (about :140-:144) — rule
   17's fix says what D10 says: add the tool with `bootstrap add tool <tool>`,
   not by a hand edit of the `conf.d/` folder's `mise.toml` and `mise install`.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `mise x -- pnpm exec vitest run scripts/src/check.test.ts` green, and
  `mise run p:plugins:check` green.
- `grep -rn '_scripts/helpers"' plugins/stackgen` and
  `find plugins/stackgen -path '*p/_project/*' ! -name '*.py' -type f` print nothing.
- K1: for each new task, copy it to `.config/mise/tasks/p/vwfcheck/<name>.py`
  (mode 755), run `mise x -- mise run p:vwfcheck:<name> -- --help` (exit 0, usage
  printed), and for each deploy run
  `env -u CLOUDFLARE_API_TOKEN -u CLOUDFLARE_ACCOUNT_ID npm_config_offline=true mise x -- mise run p:vwfcheck:deploy -- --dry-run`
  with `npm_config_offline=true` set. Pass (D34): the task prints its
  'Validating the deploy (--dry-run)' subheader and then calls wrangler; any
  wrangler exit code after that passes. Fail: a Python traceback or an import
  error before that step. Then `rm -r .config/mise/tasks/p/vwfcheck`.
- K1 leaves no change (D33): record the hash of each lock file under
  `~/.config/mise` before K1. After the scratch folder is removed,
  `git status --porcelain` is empty and each hash is the same. If anything
  changed, K1 fails and the run reports it; revert nothing.

## Guardrails

- Touch nothing outside the owned paths. Do not edit `pack.yaml`,
  `inventory.md` or a bundle: U6 bumps them.
- Delete with `rm`, never `git rm`. No `git checkout`, `git restore`, and no
  formatter `--fix` outside the owned paths.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width
  by hand.
- The payload tree `plugins/*/stacks/*/*/config/` is excluded from this
  repo's formatter on purpose: never run this repo's formatter over it.
- Keep the phrase `never … a bare \`mise use\`` wherever rule 17's forbidding
  form needs it.

## Commit

`fix(stackgen): ship pack tasks as Python uv scripts, and check that form`
