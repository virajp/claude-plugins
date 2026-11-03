# U3 — doctor judges shape and drift through bootstrap

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/setup/SKILL.md` Step 0 and
  `plugins/vwf/skills/recall/SKILL.md` (read only: both cite doctor's
  baseline mode), bootstrap's `docs/sync/index.md` in a fresh clone (read
  only, removed after).

## Ruling

> - D6: Shaped means the repository has .config/bootstrap.toml. Drift means
>   mise run setup:configs --dry-run shows a change (bootstrap
>   docs/sync/index.md, the done-check of step 6). A repository with
>   .config/stackgen.yaml and no .config/bootstrap.toml is old layout: setup
>   Step 0 offers init. A .config/stackgen.yaml beside a .config/bootstrap.toml
>   is a doctor Leftovers row. init deletes .config/stackgen.yaml after a green
>   adoption. The doctor checks of stackgen.yaml members, repo_name and the
>   mise layout (miserc, conf.d _base/ and ai/) are deleted; the PR-rule check
>   reads [branch.*].merge_model.
> - D3: git-workflow reads merge_model of [branch.<destination>] from the
>   .config/bootstrap.toml of each repository it lands in, the root and each
>   member. When the file or the key is missing, the value is direct,
>   bootstrap's own default.
> - D5: init keeps the forge pass (the backlog project; the PR rule expected
>   from [branch.*].merge_model in .config/bootstrap.toml).
> - D12: optional-tools runs first; read the owned files as that plan left
>   them.
> - D16: By the exit code and the output. Exit 0 with no change listed means
>   no drift; a listed change means drift; exit 5, or any other failure, means
>   drift unknown. doctor reports unknown as a warning with the reason; setup
>   Step 0 says it could not check drift and continues as current; init treats
>   the repository as not green, keeps .config/stackgen.yaml and names the
>   repository in the report.
> - D17: Yes. baseline runs mise run setup:configs --dry-run in each
>   repository. recall's text changes to match: baseline is no longer file
>   reads only, and recall's not-shaped test is no .config/bootstrap.toml.
> - D19: The dry-run prints its lines on stderr, each with the prefix
>   repo-sync: (bootstrap's _scripts/repo-sync, _rs_log). Read stderr. After
>   that prefix, a line that starts with would (would update, would remove,
>   would chmod, would set bootstrap_commit) is a change. Lines that read
>   unchanged, kept seed or skip are not. No would line and exit 0 means no
>   drift. doctor, setup, init and recall all parse it this way.
> - D20: baseline reads no forge, as doctor and recall say today; the forge
>   check stays in doctor's full mode. The dry-run writes nothing in the
>   repository; it refreshes bootstrap's own clone cache under
>   ~/.cache/bootstrap, which D17 accepts.

> - D21: Every live mention of MISE_ENV=dev mise run setup:all becomes
>   MISE_ENV=dev mise run setup, and a bare mise run setup:all becomes mise
>   run setup; setup is the task bootstrap ships (setup/_default). The
>   MISE_ENV=dev prefix stays where it is today, because bootstrap loads no
>   conf.d file without MISE_ENV. History rows keep their text.
> - D22: git-workflow reads it as bootstrap's _scripts/merge does: pr means
>   pr; any other value, or no value, means direct. doctor reports a value
>   other than direct or pr as a warning with the remedy to fix
>   .config/bootstrap.toml.

## Edits

1. **`plugins/vwf/skills/doctor/SKILL.md`**
   - `baseline` mode (48–55): its predicates become (a) each repository —
     base and each locally present member — has `.config/bootstrap.toml`;
     (b) in each, `mise run setup:configs --dry-run` shows no change (D19;
     unknown per D16); keep any other predicate that names no tool-config
     file. baseline reads no forge (D20). Renumber the predicates; setup Step 0 and recall
     cite the mode by name, so keep the mode name `baseline`.
   - The drift list (228–240): delete `stackgen.yaml` `members` against
     `vwf.yaml`, `repo_name`, every `preview all` / `preview pack` row,
     `forge` and `merge_model.*` from `stackgen.yaml`, and the mise layout.
     Add one row: `setup:configs --dry-run` shows a change → drift, remedy
     `/vwf:setup reshape`.
   - 168: no tool-config preview.
2. **`plugins/vwf/skills/doctor/references/stack-checks.md`**
   - 297–310: mise is still required; the remedy is `/vwf:setup reshape`
     (bootstrap installs mise config), not `tool-config all`.
   - 311–323: shaped = `.config/bootstrap.toml`; old layout =
     `.config/stackgen.yaml` without it, or the older layouts; delete the
     `tool-config/<tool>` lockfile rows (also 417–419).
   - 453–512: delete checks (b) members, (d) `repo_name`, (e) the preview
     drift; put the `setup:configs --dry-run` check in their place.
   - 531–534: the forge contradiction no longer reads `stackgen.yaml`;
     delete the row if nothing else records the forge.
   - 559, 581–595: kept files still skip by `enforcement.kept_files`; drop
     the "tool-config files are judged by preview" sentence.
   - 606–659: delete (f) `merge_model.*` validity from `stackgen.yaml`,
     `members` linkage from `stackgen.yaml`, and the mise layout
     (`miserc.toml`, `conf.d` `_base/`, `ai/`). Put the `merge_model`
     validity row of D22 in their place: it reads `.config/bootstrap.toml`.
   - 701–703: (g) the PR rule is expected when `[branch.main].merge_model`
     or `[branch.develop].merge_model` in the base's
     `.config/bootstrap.toml` is `pr`; missing file or key = `direct`.
   - 566–567: "existing-repo pass 6" — cite the pass by its title, "Missing
     files", with no number (D24: U1 renumbers the passes in the same wave).
   - Keep the heading "The repo shape against its baseline" (371)
     exactly: `setup/SKILL.md` (120) cites it by that title.
   - 434: check (b) cites "init's own **§7**" in `new-repo.md`. U1
     renumbers that file in the same wave, so cite the section by its
     title, "The project ids", with no section number. U1 renames §7 to
     exactly that title.
   - Leftovers (the table is in `doctor/SKILL.md` §8, 185–200, not in
     this file): add a row there — `.config/stackgen.yaml` present beside
     `.config/bootstrap.toml` → a leftover values file from before
     bootstrap, remedy: delete it (do not write the word tool-config in
     the row).
   - Renumber the check letters left and every cross-reference inside the
     owned files. Per D30, keep the bold title of each kept predicate —
     Pack versions, Project ids, Branches, Content drift (without its
     preview half) and Forge state — and title the new dry-run check
     **Bootstrap drift**. Other skills cite these titles.
3. **`plugins/vwf/skills/doctor/references/harness-and-memory.md`** — 25:
   the `.gitignore` handoff line comes from the repo's `.gitignore`, synced
   by bootstrap's git tool.
4. **`plugins/vwf/skills/recall/SKILL.md`** — 75–82: it cites "the local
   baseline predicates (a)–(f)" and prints the shape-drift line. Cite the
   local baseline predicates by title, not by letter (D30), and make the
   drift line
   name `/vwf:setup reshape`. Per D17, drop "file reads only" (baseline now
   runs the dry-run, which clones bootstrap), and make the not-shaped test
   "no `.config/bootstrap.toml`". Per D16, an unknown drift prints a
   one-line warning, not the drift line. Change nothing else in recall.

- **D31** — the user's ruling: Project ids (431–445) drops its
  `commitScopes` check and keeps the task-group check only. Commit scopes
  are bootstrap's `commit_scopes`; Bootstrap drift covers them.
- **D45** — the user's ruling: the remedy of a pack row (Pack versions,
  the hash half of Content drift, a missing pack lockfile, Project ids) is
  `/vwf:setup`; the remedy of a bootstrap row (Bootstrap drift, Branches,
  not shaped) is `/vwf:setup reshape`. Rewrite "All seven sub-checks carry
  the same remedy" (stack-checks.md 380–384) and the remedy sentences at
  425–429, 566–571 and 581–584 to match, and make §9 print one remedy line
  per remedy. Forge state names `/vwf:setup reshape`. Also rewrite every
  other single-remedy passage: stack-checks.md 393–395, 729–730 and
  738–742, `doctor/SKILL.md` 54–55, and the baseline mode; recall (Edit 4)
  prints one line per remedy, with the rows that led to it. A file in
  `enforcement.kept_files` is still skipped by every check, a pack file
  included; delete only the sentences that say init or pass 6 records pack
  files (D41).
- **D42** — the user's ruling: Project ids checks a `p/<id>/` task group
  only for a project whose pinned pack ships `p/_project/` tasks; setup's
  materialize pass creates the group. A project with no such pack is not a
  finding.
- **D43** — the user's ruling: bootstrap creates `develop` and `main`. The
  Branches remedy (471) is bootstrap's `docs/sync`, reached through
  `/vwf:setup reshape`; delete "which creates the missing branch" as an act
  of init.
- **D33** — "shaped" (has `.config/bootstrap.toml`) is not a titled
  predicate: as today, doctor reports "not shaped" on its own line and
  evaluates no predicate in that repo. Edit 1's "(a) each repository has
  `.config/bootstrap.toml`" becomes that line, not a lettered predicate.
- **D30** — doctor's predicates keep their bold titles; every citation
  outside the doctor skill names a predicate by its title.

- **D21, every owned file** — replace each live `setup:all` with
  `setup`, keeping a `MISE_ENV=dev` prefix where the line has one (for example stack-checks.md 627); leave history rows as they are. Verify with
  `grep -rn "setup:all"` over the owned paths: only history rows remain.
- **D22** — the merge_model row reads `.config/bootstrap.toml`: a value other
  than `direct` or `pr` is a warning, remedy: fix the value.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  are green.
- `grep -rn -iE 'tool-config|preview (all|pack)|miserc|MERGE_MODEL' plugins/vwf/skills/doctor/`
  returns nothing.
- `grep -rn 'stackgen.yaml' plugins/vwf/skills/doctor/` returns only the
  old-layout and Leftovers lines.
- `grep -n 'setup:configs --dry-run' plugins/vwf/skills/doctor/SKILL.md`
  returns at least one line.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/doctor/**` and
  `plugins/vwf/skills/recall/SKILL.md`. If setup Step 0 cites a predicate
  letter you renumbered, report it as `DOCS FALSIFIED:`.
- doctor reports and never writes without consent: the dry-run writes
  nothing in the repository (it refreshes bootstrap's cache, D20) and is
  the only bootstrap command doctor runs.
- Delete with `rm`, never `git rm`. Match the fold width by hand.

## Commit

`feat: doctor judges repo shape and drift through bootstrap`
