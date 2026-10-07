# U6 — stackgen prose: the skill relays the script

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/mise.md`, the mise-lock
  passages only in
  `plugins/stackgen/skills/tool-config/references/{dprint,pre-commit,git}.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
  `plugins/stackgen/stacks/ci-system/github-actions/skills/github-actions/references/toolchain.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file whole; U1's and U3's
  `TC/scripts/tool-config.mjs`, `TC/scripts/lib/**` — the interface this prose
  now describes.

## Ruling

> R2 — the user: *"The script does the initial job of creating the config, LLM
> knows how to edit the config if needed. A greenfield work will not need LLM,
> brownfield will likely need."*

> D7 — The script emits conflict rows for what it can decide … and a
> `needs-edit` row for the rest (a root mise config to split, a `merge` answer,
> an unparseable file), naming the file and the target layout. The LLM makes
> that edit per a short section of `references/mise.md`, then re-runs the
> script's `check`.

> D8 — Flag-style: e.g.
> `tool-config.mjs mise add-tool --name <n> --version <v> --env dev --for <pack>`;
> `tool-config.mjs preview all --repo <slug> …`;
> `--answers r1:ok,r2:keep-existing`.

> D13 — Bare `mise use` is forbidden: a tool is entered into the config first,
> then installed with `mise install`.

> D14 — Every lock passage, the `lock` verb, the lock half of `upgrade`,
> `lockfile_platforms` … are removed.

> D17 — the github-actions reference installs the pinned tools before running
> tasks, with no lock (B75 item 7).

> D18 — Until plans 2–3 land, tool-config's `all` = the script for mise, then
> the existing prose for the other seven tools; the rows of both are returned as
> one numbered set.

## Edits

1. **`TC/SKILL.md`** — keep the strict-YAML frontmatter; update `description`
   and `argument-hint` to the flag form. The body becomes: how to run the script
   (`node "${CLAUDE_PLUGIN_ROOT}/skills/tool-config/scripts/tool-config.mjs" <flags>`,
   `node` from `PATH`, never `mise x node@lts`; plan 2 moves it to
   `mise x -- node`); that mise is handled by the script and the other seven
   tools still by their references (D18), with how their rows are merged into
   one numbered set; how to relay rows and pass `--answers`; what a `needs-edit`
   row asks of the LLM; the `check` command for drift. The Blocks, Drift,
   Removal and lock-record sections shrink to a short human description pointing
   at the script as the authority — keep only what the LLM still needs for the
   seven prose tools.
2. **`TC/references/mise.md`** — rewrite as: (a) what the script does for mise,
   in brief, for a human reader; (b) **the LLM's part**: each `needs-edit` case
   (splitting a root `.mise.toml` / `mise.toml` or a sectioned top-level
   `.config/mise*.toml` into the layout; combining a `merge`; an unparseable
   file) with the target layout and the rule to re-run `check` after; (c) the
   layout table and what-goes-where, kept — the LLM edits configs by hand on
   brownfield; (d) exact pins — no lockfile, `latest` resolved at write,
   `mise upgrade` the only mover, never a bare `mise use`; (e) the repo-local
   mise skill; (f) the task library, the trust step, CI parity and the legacy
   names table, kept. Remove every lock passage (§1 `mise.lock` row,
   `lockfile_platforms`, `locked = true`, the sidecar, "Freshness and the one
   lock", the `lock` verb, `upgrade`'s lock half, the migration's lock re-write,
   `setup:mise --lock-only`). The migration step that **deletes** the repo-local
   mise skill is reversed (R4). §5's "The retired editor task" bullet keeps its
   behaviour, now pointing at the script's migration step U3 implements.
3. **`TC/references/{dprint,pre-commit,git}.md`** — only the passages that
   describe `mise.lock` or `.config/mise/locks/` (`dprint.md:134`,
   `pre-commit.md:109`, `git.md:139,268`): drop the locks exclusion row and
   reword the lock mentions to "no mise lock exists".
4. **`materializer.md`** — where it previews and applies a pack's `tool-config:`
   list (`:335-342`, `:381-387`, `:429-431`, `:124-127`): a mapping entry runs
   as `tool-config.mjs apply-entries --pack <slug> --file <pack.yaml>` (preview,
   then with `--answers`); a string entry still goes to the skill's prose path
   until plans 2–3. `remove <pack>` runs the script for mise.
5. **`github-actions/references/toolchain.md`** — the CI step installs the
   pinned tools (`mise install`, or the mise action's install) before any
   `mise run`, since `task.run_auto_install = false`; no lock, no `--locked`;
   never a bare `mise use`.

## Verification

- `grep -rn -E 'mise\.lock|mise/locks|lock-only|lockfile_platforms|locked = true' plugins/stackgen/skills plugins/stackgen/stacks/ci-system`
  prints nothing.
- `grep -rn 'mise use' <owned files>` prints only lines that forbid it.
- `mise run p:plugins:check` green (strict-YAML frontmatter, rule 6 paths).
- The full wave gate.

## Guardrails

- In `dprint.md`, `pre-commit.md` and `git.md`, edit the lock passages only —
  those tools' behaviour is plans 2–3.
- vwf files are U7's; human docs are U10's.
- `plugins/**/*.md` is not dprint-formatted: match each file's fold width by
  hand; keep code spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: tool-config prose relays the script for mise and drops the lock`
