# U3 — The mise tool module and the repo-local mise skill

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `plugins/stackgen/skills/tool-config/scripts/lib/tools/index.mjs`,
  `plugins/stackgen/skills/tool-config/scripts/lib/tools/mise.mjs`,
  `plugins/stackgen/skills/tool-config/assets/mise/.claude/skills/mise/SKILL.md`
  (new), `scripts/src/tool-config-mise.test.ts`,
  `scripts/src/fixtures/tool-config/mise/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `TC/references/mise.md` §1 (layout, what goes where, one pin
  per tool), §2 (what `all` lands), §3 (marked positions and defaults), §4 (the
  verbs and what a call may carry), §5 (the migration); U1's
  `TC/scripts/lib/*.mjs`; every file U2 left under `TC/assets/mise/.config/`.
- **Lazy-load:** `TC/SKILL.md` *Blocks* and *Drift*; a swiftui `pack.yaml`
  (`machine_env:`).

## Ruling

> D2 — Every pin written is an exact version. A requested `latest` is resolved
> by the script with `mise latest <tool>` at write time and written as the exact
> version.

> D3 — The script applies every pack mise verb (add tool, add env, set env, add
> alias, remove), so a greenfield repo plus its packs needs no LLM.

> D7 — The script emits conflict rows for what it can decide (legacy
> `MERGE_MODEL`, a tool pinned at another version, a person's own line, a
> parseable old pack fragment) and a `needs-edit` row for the rest (a root mise
> config to split, a `merge` answer, an unparseable file), naming the file and
> the target layout.

> D11 — `all` lands `.claude/skills/mise/SKILL.md` into the repo: a static
> template (run tasks with `mise run`, discover with `mise tasks`,
> `MISE_ENV=dev`, where each config file lives, never bare `mise use`) plus a
> task table the script regenerates on every `all` and every pack change,
> between comment anchors.

> D12 — `tool-config.mjs mise upgrade` re-resolves every pin with `mise latest`,
> returns one row per changed pin (old → new, whose block), writes on answers.
> Dev only.

> D13 — Bare `mise use` is forbidden: a tool is entered into the config first,
> then installed with `mise install`. Stated in the repo-local skill …

> D14 — the `lock` verb and the lock half of `upgrade` are removed.

> D15 — The script's migration skips every `*.local.*` file (B75 item 2), and
> hoists a non-base tool pinned in two env files into `conf.d/tools.toml` (B75
> item 4).

User, verbatim: *"Mise lock is completed gone. It's creating more problems and
slows down the whole install process. However, this introduces version
pinning."* And: *"Yes, a repo-local mise skill is back."*

## Edits

1. **`lib/tools/index.mjs`** — the tool registry U1's entry imports: maps `mise`
   to `./mise.mjs`. Other tools are absent until plans 2–3; `all` reports them
   as `{tool, handled: "prose"}` so the skill knows to follow their references
   (D18).
2. **`lib/tools/mise.mjs`** — implements, on U1's engine:
   - **`all`**: land every file under `TC/assets/mise/.config/` at the same path
     under the repo root, the frame then one `mise` block; the task library
     whole, mode `755`, never overwriting a path whose lock record names a
     non-`tool-config` source; fill the ten marked positions from the `all` keys
     per `references/mise.md` §3 (values, defaults, the runtime table, member
     flags and aliases named by member slug); land the repo-local skill (edit 3)
     and fill its task table (edit 4).
   - **Pin resolution**: every pin whose requested version is `latest` is
     written as the output of `mise latest <tool>` run in the repo; a failed
     resolution is a refused call naming the tool, never a written `latest`.
   - **Verbs** `add-tool`, `add-env`, `set-env`, `add-alias`, `remove`,
     `upgrade` with the validation and conflict rows of `references/mise.md` §4
     (one pin per tool across the tools files; `set-env` finding the key outside
     the block; one alias per name). No `lock` verb.
   - **`upgrade`**: refused unless `MISE_ENV` contains `dev`; one row per pin
     whose `mise latest` differs from the written version.
   - **Migration** per `references/mise.md` §5: legacy `MERGE_MODEL` → the pair
     (row); an old pack fragment `conf.d/<name>.toml` split into that
     requester's blocks when it parses, else `needs-edit`; a root `.mise.toml`
     or `mise.toml`, or a top-level `.config/mise*.toml` still carrying sections
     → one `needs-edit` row naming the file and the target files; old
     `mise.lock` / `mise.<env>.lock` files → delete rows; the retired
     `.config/mise/tasks/setup/vscode` → a delete row, its lock record with it,
     where its content still matches that record and the repo's `setup/all` no
     longer calls it, else kept and reported; **skip every `*.local.*` file**
     throughout; **hoist** a tool pinned in two env files into
     `conf.d/tools.toml` as one row.
   - **`check`** contributions for mise blocks, for U1's drift report.
3. **New `TC/assets/mise/.claude/skills/mise/SKILL.md`** — strict-YAML
   frontmatter (`name: mise`, a one-line `description` saying it runs this
   repo's mise tasks and edits its mise config). Body, short:
   - run every task as `mise run <task>`; discover with `mise tasks`; tasks
     differ per repo, so never assume a name not listed;
   - `MISE_ENV=dev` for local work; `setup:all` refuses an unset `MISE_ENV`;
   - where things live: top-level `.config/mise*.toml` hold settings,
     `.config/mise/conf.d/<section>[.<env>].toml` hold `[tools]`, `[env]`,
     `[tasks]` and `[shell_alias]`; `mise.local.toml` is this machine's and
     never committed;
   - adding a tool: write the exact version into the right `conf.d/tools*.toml`
     file, then `mise install`. **Never a bare `mise use`** — it writes the
     top-level config the layout forbids;
   - one pin per tool across all tools files;
   - between `<!-- >>> tasks -->` and `<!-- <<< tasks -->`: a table
     `| Task | Description |` with no rows in the asset. No
     `${CLAUDE_PLUGIN_ROOT}` and no plugin-relative path anywhere in it (checker
     rule 13 — it lands in a repo).
4. **Task table regeneration** — on every `all` and every pack verb, list the
   repo's task files under `.config/mise/tasks/` (and inline `[tasks.*]` in
   `conf.d/tasks.toml`), read each file's `#MISE description=` header, skip
   `hide=true` tasks and `_scripts/`, and rewrite the rows between the two
   anchors, sorted by task name. The table is the base's block; never drift.
5. **`scripts/src/tool-config-mise.test.ts`** plus golden trees under
   `scripts/src/fixtures/tool-config/mise/` — spawn the script in `mkdtemp` git
   repos, with a fake `mise` on `PATH` (a small executable the suite writes)
   answering `latest` with fixed versions, so the suite is offline and
   deterministic. Cover: greenfield `all` equals the golden tree byte for byte;
   a second `all` returns no rows; each verb; the one-pin conflict row;
   `set-env` outside the block; alias clash; `upgrade` rows and its dev-only
   refusal; migration rows for `MERGE_MODEL`, an old fragment, a root
   `mise.toml` (`needs-edit`), an old lock (delete), a `*.local.toml` left
   untouched, a double pin hoisted; the task table regenerated after a task file
   is added; `check` clean after `all`.

## Verification

- `pnpm vitest run scripts/src/tool-config-mise.test.ts` green.
- `pnpm exec tsc --noEmit -p scripts` green.
- `mise run p:plugins:check` green once U4's allowlist change lands in the same
  wave — the orchestrator runs it after the wave, not this unit alone.
- The full wave gate.

## Guardrails

- Do not touch U1's `TC/scripts/tool-config.mjs` or `TC/scripts/lib/*.mjs`; an
  engine change you need is an `UNRESOLVED:` line naming it.
- Do not touch `TC/assets/mise/.config/**` (U2) or `scripts/src/check*.ts` (U4).
- No npm dependency, no python; the fake `mise` in tests is a shell script
  written into the sandbox, never a real install.
- Delete with `rm`, never `git rm`.

## Commit

`feat: tool-config mise module — exact pins, pack verbs, migration rows and the repo-local mise skill`
