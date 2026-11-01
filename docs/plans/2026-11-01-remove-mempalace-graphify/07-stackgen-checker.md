# U7 — stackgen tool-config and the checker

- **Read first:** every owned file you edit, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/scripts/` (only to confirm a render input; the script itself needs no change).

## Ruling

> D1: Remove completely: after the change no plugin names mempalace or
> graphify. The one exception is cleanup code: doctor's drift rule for
> leftovers and the config_format 24 migration in setup may name the old files
> and keys. Nothing else in any plugin names either tool.

> D3: vwf's own leftovers (the memory: key and memory.wing in
> .config/vwf.yaml, each per-tree mempalace.yaml) are removed by the setup
> migration to config_format 24, shown as numbered rows and applied on
> consent. stackgen tool-config stops shipping the graphify and mempalace
> files and has no removal code of its own; bootstrap's repo-sync owns that
> cleanup (a handoff prompt to bootstrap, written outside this plan). doctor
> reports each leftover as drift with its remedy: the setup migration for
> vwf's own, bootstrap M24 or a bootstrap remove tools instruction for the
> files.

> D6: execute drops its halt on a missing graphify CLI or graph and the
> code:graph step after a landing; setup drops its graph offer; tool-config
> drops .graphifyignore, the code:graph task, the graphify-refresh hook with
> the post-commit and post-merge hook types it alone uses, the graphify strip
> code in the setup/precommit asset and its re-run in setup/all, every
> graphify-out/ exclude, and the pipx:graphifyy and pipx:mempalace pins and
> MEMPALACE_* variables. python and uv stay, because pre-commit depends on
> them; only the comment that names graphify as their reason changes.

> D4: docs/memory/ is the one store, with four folders: decisions/, gaps/ and
> problems/ (each <date>-<slug>.md) and handoff/ (<name>.md). The palace rooms
> planning, runs and doctor are dropped: the plan folder and
> docs/plans/index.json hold the planning record, index.json and the action
> log hold the run state, and doctor reports again on each run. The skills
> that filed to the palace write the same records as these files and read them
> at recall. The location rules are the ones memory.md gives the file mirror
> today (the base repo, in a multi-repo product).

## Edits

1. **`plugins/stackgen/skills/tool-config/assets/.graphifyignore`** and
   **`assets/.config/mise/tasks/code/graph`** — delete with `rm`.
2. **`assets/.config/pre-commit-config.yaml`** — remove the `graphify-refresh`
   hook (`:111-120`), the `post-commit` and `post-merge` hook types (`:9-10`),
   and the graphify exclude (`:35`).
3. **`assets/.config/mise/tasks/setup/precommit`** — remove only the code that
   is for graphify alone inside `:23-84` (the raw-hook strip, the `.legacy`
   copies, the `merge=graphify` line and the `merge.graphify` config). Keep
   `HOOKS_PATH`, `HOOKS_DIR` and `OWN_HOOKS_DIR` (`:41-43`) and anything else
   that the code from `:88` on still uses. Keep the task working and its
   shebang and exec bit.
4. **`graphify-out/` excludes** — remove from `assets/.gitignore:27-28`,
   `assets/.config/dprint.json:18-19`, `assets/.config/taplo.toml:24`,
   `assets/.config/linter.yaml:20`, `assets/.config/gitleaks.toml:31`,
   `assets/.vscode/settings.json:72`. In `assets/.gitignore` also remove the
   ignores of `docs/memory/doctor/` and `docs/memory/runs/` (`:106-107`): D4
   drops those rooms.
5. **`templates/.config/mise/conf.d/ai/mise.dev.toml`** — remove the
   `pipx:mempalace` and `pipx:graphifyy` tables and the `MEMPALACE_*` `[env]`
   block; keep `jq` and `yq`. **`templates/.config/mise/conf.d/_base/mise.dev.toml`**
   (`:21`) — reword the python comment to name pre-commit, not graphify.
   **`templates/.config/mise/tasks/setup/all`** (`:44-46`) — remove the re-run
   that strips graphify.
6. **References** — delete `references/graphify.md` with `rm`; remove the
   graphify passages in `SKILL.md:4,50-51,268` (the frontmatter `description`
   too), `references/pre-commit.md:23,50,71,195-211`,
   `references/mise.md:50,94-95,344,395-408,523-527` (also its mempalace
   variables), `references/git.md:58`, `references/gitleaks.md:51`,
   `references/dprint.md:89`.
7. **`plugins/stackgen/skills/stackgen-stack-template/references/generator.md`**
   (`:42`) and **`plugins/stackgen/assets/taxonomy.md`** (`:50-51`) — remove
   the graph lines. **`stackgen-stack-template/references/materializer.md`**
   (`:86`) and **`plugins/stackgen/assets/output-tree.md`** (`:163-169`) —
   they name `mempalace.yaml` as a vwf-owned file a pack must not ship; remove
   `mempalace.yaml` from those lists and keep the rest of each rule.
   **`plugins/stackgen/assets/contracts/secrets.md`** (`:113`) — remove "the
   memory palace" from the list of places a secret must never reach; keep the
   rest.
8. **`scripts/src/check.ts`** — remove `.graphifyignore` from
   `TOOL_CONFIG_ROOT_FILES` (`:415-424`) and fix its doc comment; fix the
   comments at `:1958` and `:2230`. No rule changes behaviour otherwise.
9. **`scripts/src/check.test.ts`** (`:395`, `:421-425`, `:653-660`,
   `:786-797`, `:1874`) and **`scripts/src/tool-config-render.test.ts`**
   (`:224-243`) — remove or rewrite the cases that use graphify or mempalace
   so they test the same rule with another file or tool.
10. **`scripts/src/fixtures/tool-config/all-node.golden.json`** — update the
    golden output to the new render: no graphifyy pin, no graphify text in
    `setup:all`. Edit it to match; if the test file documents an update mode
    for its golden files, you may use that mode.

## Verification

- `mise x -- mise run code:format`
- `mise x -- pnpm vitest run scripts` passes.
- `mise x -- pnpm exec tsc --noEmit -p scripts` passes.
- `grep -rli -E 'mempalace|graphify|memory palace' plugins/stackgen scripts/src` finds nothing.
- `assets/.config/mise/tasks/setup/precommit` keeps its shebang and exec bit.

## Guardrails

- Do not touch this repo's own `.config/**`, `.graphifyignore` or `.gitignore` — out of scope; the user edits them.
- `plugins/*/stacks/*/*/config/` is payload, excluded from this repo's formatter; this unit edits no pack, so leave `stacks/` alone.
- Do not add a removal mechanism to the tool-config script (D3).
- Delete with `rm`, never `git rm`.
- Never write a lock file by hand.

## Commit

`feat!: stackgen tool-config no longer lands graphify or mempalace`
