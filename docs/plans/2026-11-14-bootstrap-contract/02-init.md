# U2 — init drives the bootstrap CLI

- **Read first:** every owned file, top to bottom, and
  `plugins/vwf/assets/bootstrap-contract.md` (U1).
- **Lazy-load (D19):** the contract plans that U1 cites, and `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/design/cli.md` as it is after 4.0.0
  (`init --json`, `--answer`, `data.plan.pending`).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D7:** `init` runs, in each repo that Step 0 resolved (the base first, then
  each member), `bootstrap init --json --dry-run`. It asks the user each
  question of `data.plan.pending`, one at a time, then runs
  `bootstrap init --json --yes` with each answer as
  `--answer <tool>.<key>=<value>`. The readme prompt and every mention of
  bootstrap's `docs/sync` as the way in go.
- **D4:** the gate after the step, and every "a repo with a
  `.config/bootstrap.toml`" test, is the shaped test of the contract asset.
- **D6 (as init uses it):** green means shaped and
  `bootstrap sync --json --dry-run` lists no change. It replaces
  `mise run setup:configs --dry-run`.
- **D8:** with no contract, `init` stops before its plan with the asset's
  install hint.
- **D23:** `bootstrap init` makes no commit and needs a git repository. The
  commit step of `init` makes the first commit, through `git-workflow`, on the
  branch that `git init` made (new-repo.md, about line 33). The core branches
  after that are R3b's.
- **D24:** if `init --json --yes` still gives code 2 with new
  `data.plan.pending` items, ask them and run the command again. After 3
  rounds, stop and list the questions that are still open.
- **D16:** on code 2, show the envelope's `errors` messages as bootstrap gives
  them, and stop.
- **D12, D14:** keep every passage on branches, landing or `merge_model` as it
  is (R3b owns them in `init` and its hygiene `CONTRIBUTING.md`), and every passage on plugins (R3c), topology and members
  tables (R4) and packs (R5). The member list still comes from Step 0.

## Edits

1. **`plugins/vwf/skills/init/SKILL.md`**:
   - the frontmatter description (about line 5) and the "bootstrap owns the
     repo shape" paragraph (about lines 35-42): the values live in
     `.config/bootstrap/`, written by the bootstrap CLI; `init` reaches it
     through the bootstrap step (D7).
   - *The bootstrap step* (about lines 380-400): replace the quoted prompt and
     its paragraph with D7's steps; keep "if bootstrap leaves its sync
     uncommitted, commit it first" and the commit step.
   - *The apply order*, item 3 (about line 368): D4.
   - *Green, per repo* (about lines 409-418): D6, and the passage on what the
     dry-run executes (the clone, `main` with no pin, the trust gate) becomes:
     the dry-run reads bootstrap's cached clone, as the contract's 30-minute
     fetch rule says.
2. **`plugins/vwf/skills/init/references/new-repo.md`**,
   **`existing-repo.md`** (about line 95, the `setup:configs --dry-run`
   run: D6, D33), **`readme-and-license.md`**: each
   `.config/bootstrap.toml` test becomes D4; each `docs/sync` step becomes
   D7; new-repo.md about line 33 (the first commit) becomes D23; `repo_name`
   (new-repo.md, about line 234, and readme-and-license.md, about lines
   68-69) is read with
   `bootstrap config get repo.repo_name --json`; the commit types and scopes
   (readme-and-license.md, about line 35) with
   `bootstrap config get repo.commits --json`. new-repo.md about line 128
   (`[overrides.gitignore]`): say that the repo's own ignore lines are an
   override in `.config/bootstrap/tools.toml`, set through `bootstrap config`.
   Keep about line 376 (`merge_model`) as it is (D12).
3. **`plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md`** (about line
   37): name `.config/bootstrap/` in place of `.config/bootstrap.toml`, and
   keep the branch text as it is (D12).

## Verification

- `mise x -- mise run code:format` passes.
- `grep -rnF '.config/bootstrap.toml' plugins/vwf/skills/init/` finds only
  passages that D12 keeps.
- `grep -rnF 'docs/sync/index.md' plugins/vwf/skills/init/` finds nothing.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change the hygiene files' content, `kept_files` or the forge pass.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init drives the bootstrap CLI through its JSON contract`
