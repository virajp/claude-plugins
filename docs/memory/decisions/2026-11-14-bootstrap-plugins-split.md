DECISION 2026-11-14 ★5 | repo:bootstrap, repo:claude-plugins,
skill:git-workflow,
skill:architecture, plugin:stackgen | bootstrap owns every deterministic concern
(tools, repo config, tasks, git actions, LSP binaries, plugin installs);
claude-plugins owns every judgment concern; they meet at one versioned JSON
contract on the bootstrap CLI | alt rejected: clone-and-read files, prompt-only
handoff, vwf owns topology, stackgen packs

# The split between bootstrap and claude-plugins

The user approved this design on 2026-11-14 in three review rounds. The
reviewed design, with its diagrams, is the artifact
<https://claude.ai/artifact/BZKUcn2vbr1msAk7GLgsuE>. This record has the same
text in the `bootstrap` repo and in the `claude-plugins` repo.

## Principle

- If a script can do it with the same result every time, bootstrap owns it. If
  it needs a model, the plugins own it.
- Four layers: machine (bootstrap `macos/`), repo shape (bootstrap `repo/`),
  stack knowledge (stackgen), judgment (vwf). A higher layer calls a lower
  layer. A lower layer never names a higher layer.

## The contract (D1, D2, CT2)

- The plugins call the installed `bootstrap` CLI. Each command has `--json`
  and a contract version. Contract v1 ships inside bootstrap 4.0.0 (see
  Amendments).
- Commands: `contract`, `describe` (tools, members, LSP, ports), `config`
  (`get`, `set`, `unset`, `show`), `catalog`, `add` and `remove` (tool,
  plugin), `init --values`, `check`, `lsp`.
- Task ports that exist in every shaped repo (a port with no work is a no-op
  that exits 0): `code:format`, `code:lint`, `code:sec`, `code:precommit`,
  `git:merge:<b>`, `git:worktree:{create,setup,delete}`, `code:lsp:check`,
  `setup`, `test`, `test:e2e`, `test:golden`, `p:<id>:deploy`.
- The plugins never read or write a file in `.config/bootstrap/` directly.
- `docs/sync/vwf.md` stays as the human doc of the contract.
- bootstrap is pinned to the latest signed release. The CLI reads the catalog
  of that release, never the newest `main` (D9).

## Config layout (OW1, CF1, RT1)

`.config/bootstrap/` holds files that only the bootstrap CLI writes:

| File                 | Holds                                                         |
| -------------------- | ------------------------------------------------------------- |
| `repo.toml`          | Repo-level facts that any tool or skill reads                 |
| `tools.toml`         | Tool selection and tool values (was `.config/bootstrap.toml`) |
| `releases.toml`      | Pending release levels (was `.config/releases.yaml`)          |
| `repo-generated.tsv` | The sync manifest (was `.config/repo-generated.tsv`)          |

`bootstrap config` reads and writes them. The first segment of a key names the
file, for example `repo.branches.main.landing` or `releases.vwf`. Reads take
`--format json|yaml|toml`.

`repo.toml` keys (snake case):

- Identity: `repo_name`, `product_name` (replaces vwf `product.name`),
  `repo_url`.
- Git: `core_branches = [...]` at the root. `[branches.<b>]` has one key,
  `landing = "pr" | "direct-merge" | "direct-commit"`, plus `merge_from` and
  `merge_never`. `direct-merge` allows a merge without a PR but no direct
  commit. `direct-commit` allows both.
- Commits: `[commits]` with `style` and `scopes`.
- Engine: `environments` (mise environments), `bootstrap_commit`,
  `[worktree].files`. `[overrides.mise.*]` stays in `tools.toml`.
- Topology: `topology`, `topology_reason`, `[members.<name>]` with `folder`,
  `type` (`submodule | folder | sibling`), `url`, `label`,
  `worktree_install`. A member has a `[home]` back-link, so each repo finds
  the others. `linkage` goes away.
- Deploy: `release_env` and `[deploy.<env>]` with one URL for each project.

## vwf.yaml format 27 (VY1, key decisions)

- Stays: `config_format`, `blueprint_format`, `blueprint`, `ui`,
  `integrations`, `stacks`, `addons`, `enforcement`, `pipeline`, `design`,
  `docs_sync`, `after_landing`, and in each `projects.<p>`: `repo`, `design`,
  `cicd`, `stylesheet`, `coverage_target`, `harness.health`.
- `projects.<p>.stack` becomes a slim decision record: `frameworks`,
  `dependencies`, `services` (was `backing_template`), `deploy` (was
  `deploy_template`), `os`, `note`. `languages` and `package_manager` are read
  from bootstrap.
- Moves to `repo.toml`: `product`, `topology`, `topology_reason`, `linkage`,
  `members`, `environments`, `production_env`.
- Removed: `repo.stack`, `harness`, every `*_template` key.

## Ownership (OW2)

- Git: the `git-workflow` skill is the one place for git decisions (branch,
  timing, consent, commit message, plan bookkeeping). Any skill calls it.
  bootstrap's `git:*` tasks do the actions (direct merge or PR with `gh` or
  `glab`; worktree create, setup, delete). A person can run the same tasks by
  hand (D4, D5, GW1).
- Stack: packs go. `/vwf:architecture` decides with `bootstrap catalog`.
  stackgen stays without packs: dependencies in the project manifests,
  reputation checks, conventions and skills in `.claude/`, LSP registration
  (FL2, ST1).
- Tools per project: each tool in `tools.toml` has a `projects` list.
  Scripts that ship in bootstrap detect it; `bootstrap detect` proposes it and
  `bootstrap check` verifies it (ST2).
- LSP: each language or runtime tool in bootstrap pins its LSP server and has
  an `[lsp]` block. `bootstrap lsp` lists the servers; `code:lsp:check`
  checks them. stackgen writes the Claude LSP entries in `vwf-tools` and
  installs nothing (D6, LS1).
- Plugins: `setup:ai` installs a listed plugin at user scope only when it is
  not there. When a plugin leaves the list, it is removed from the project
  scope only. A bootstrap tool named `virajp-plugins` carries the vwf
  `.gitignore` lines and plugin entries. The engine and the shared files name
  no vwf file (D7, D8).
- Drift: `bootstrap check` reports repo drift. `/vwf:doctor` calls it and adds
  the judgment checks (D10).

## Phases

| Phase | Repo           | Content                                                                |
| ----- | -------------- | ---------------------------------------------------------------------- |
| P0    | claude-plugins | Fix the drift against today's bootstrap key names, paths and verbs     |
| R1a   | bootstrap      | Config folder, key schema, `config` verb                               |
| R1b   | bootstrap      | Contract v1: `contract`, `describe`, `catalog`, `--json` envelope      |
| R1c   | bootstrap      | Task ports as no-op defaults                                           |
| R2    | bootstrap      | `git:*` tasks, LSP blocks and check, `virajp-plugins` tool, `setup:ai` |
| —     | bootstrap      | Release 4.0.0, with the user's consent                                 |
| R3    | claude-plugins | Plugins use the contract; `git-workflow` over `git:*`                  |
| R4    | claude-plugins | `vwf.yaml` format 27 and its migration                                 |
| R5    | claude-plugins | Stack without packs                                                    |
| R6    | both           | One release in each repo; each plan carries its own docs               |

A vwf plan runs only in its own repo, and `requires` cannot name a plan in the
other repo. R3 starts only after the bootstrap 4.0.0 release. The user
confirms that release by hand.

## Amendments 2026-11-14 (R1a and R1b planning)

These rulings come from the plan folders `docs/plans/2026-11-14-config-folder`
(R1a) and `docs/plans/2026-11-14-contract-commands` (R1b) in the bootstrap
repo. The phase table and the release references above match them.

- **The release (R1a D1, D36; R1b D16).** 3.0.0 (the selection model) and
  3.1.0 (the TUI) ship first. R1a, R1b, R1c and R2 then land before one
  `bootstrap@4.0.0` tag; until then the user tests with a local binary. R3
  waits for 4.0.0. R1b D16 reverses R1a D69 (tag 4.0.0 at once after R1a),
  and R1a D92 records that in R1a.
- **R1 is three plans (R1a D2).** R1a: the `.config/bootstrap/` folder, the key
  schema and the `config` verb. R1b: the contract commands. R1c: the task
  ports as no-op defaults. R1b and R1c each require R1a.
- **`settings` (R1a D3).** The old engine-settings command becomes
  `bootstrap settings`; `bootstrap config get|set|unset|show` is the
  repo-config verb.
- **Overrides (R1a D5).** The `[tools.*]` overrides move into `tools.toml`,
  under `[overrides.tools.*]`.
- **`releases.toml` (R1a D10).** R1a defines its schema, but does not move
  `.config/releases.yaml`. R3 switches vwf and the release tasks to
  `bootstrap config`, and its migration moves the file.
- **The envelope (R1b D1, D7, D12).** Every `--json` command prints one
  compact object on stdout: `contract`, `command`, `ok`, `code`, `data`,
  `errors`, `warnings`. Human lines go to stderr, and the exit code equals
  `code`. The contract version is an integer: an additive change keeps it, and
  a break raises it.
- **`describe` (R1b D10).** It reports the repo facts, tools, members and
  ports, with no LSP field. R2 adds the field.
- **The clone cache (R1b D5, D6).** `config set`, `config unset`, `catalog`
  and `describe` fetch when the last fetch is more than 30 minutes old. If the
  fetch fails, they use a clone less than 7 days old, else they exit 5. This
  reverses the 7-day skip of R1a D23 and D52.
