# Decision — git, graphify and renovate move into stackgen:tool-config; init fetches no bundle

**Date** 2026-09-27 · **Branch** `2026-09-26-tool-config-hygiene` · **Plan**
[`docs/plans/2026-09-26-tool-config-hygiene/`](../../plans/2026-09-26-tool-config-hygiene/index.md)
· **Backlog** B66 (third piece of three, finished), B72 (finished)

## The ask

Finish moving the repo baseline out of packs. After the mise (T1) and gates (T2)
plans, the `repo-hygiene` pack and its unconditional bundle were the last thing
`/vwf:init` fetched through the stack adapter for a baseline. Split it by kind,
retire the bundle key, stop landing `.editorconfig` and `merge=graphify`, and
stop the installer from installing graphify's raw git hooks.

## What changed

1. **Content home.** The config files became `stackgen:tool-config` tools; the
   prose files and the VS Code baseline became init's own assets under
   `plugins/vwf/skills/init/assets/hygiene/` — `CONTRIBUTING.md`, `SECURITY.md`,
   `licenses/{MIT,Apache-2.0}.txt`, the issue forms,
   `.config/vscode.d/hygiene.jsonc` — with no lock record.
2. **`all` lands eight tools.** `git` (`.gitignore`, `.gitattributes`),
   `graphify` (`.graphifyignore`, plus its `.gitignore` lines as a `graphify`
   block through git's verb) and `renovate` (`renovate.json`, only on
   `update_bot=renovate`, yielding to any existing policy spelling) land after
   the five.
3. **Pack asks.** `git add ignore <pattern…>`, `git add ignore template=<Name>`
   and `git add attribute <pattern> <attr…>`. node → `Node` from pnpm and
   typescript; python → `Python` from uv; dart → `Dart` from pub, `Flutter` from
   flutter (both follow with `!pubspec.lock`); swift → `Swift` from swift,
   swiftpm and swiftui; fnox → `fnox.local.toml`; doppler → `.doppler/`; pnpm
   and swiftpm mark their lockfiles `linguist-generated`.
4. **Templates pinned.** The lock records github/gitignore's commit SHA per
   template and a `written:` hash of the block; every re-run fetches at that
   SHA, and only mise's `upgrade` moves it. A fetched line re-including a base
   secret, or re-ignoring a committed file, is a conflict row.
5. **Order in `.gitignore`.** Entries keep written order, never sorted, so a
   negation follows its pattern. The normalised no-doubling rule stays.
6. **init fetches no bundle** for its baseline: `tool-config all`, then its own
   assets, then the secrets provider — the only adapter fetch. Its section merge
   and its commit-type pass are gone (the rename table is a pre-commit conflict
   row now); the shaped survey is ten passes. For a detected language no pack
   covers, init asks for a `gitignore:<Name>` template block.
7. **Retired.** The `repo-hygiene` pack, its bundle, its kind (11 → 10 kinds)
   and the `unconditional:` key everywhere. Shaped means the `tool-config/*`
   records are present. `.editorconfig` lands nowhere; reshape offers deleting a
   landed one identical to the retired payload.
8. **graphify.** No merge driver; `setup:precommit` strips any raw graphify
   hook, a `merge=graphify` line and the `merge.graphify.*` git config. The
   installer runs `graphify install` alone; `--uninstall` still runs
   `graphify hook uninstall` to clean old hooks.
9. **Checker.** The three git verbs parse; a pack's `config/` landing any of the
   moved root files is a finding; each tool-config tree admits its own root
   files; init's asset trees get the landed-file checks with no root allowlist.
10. **This repo.** `.editorconfig` deleted; `setup/precommit` and `setup/ai` are
    byte-copies of the tool-config assets.

## The reversals

Each was confirmed at the interview, one at a time.

- **The `unconditional:` bundle key and init's fixed-slug fetch**
  (`2026-09-05-vwf-init-and-the-repo-shape.md`) retire outright.
- **`.gitignore`'s banner sections and init's section merge** become tool-config
  blocks, kept in written order; the git tool converts a landed sectioned file
  on adoption.
- **"init copies the hygiene pack's payload"** becomes "init writes its own
  hygiene assets".
- **A covered language stops fetching its template** was caught at write time as
  a reversal of the no-freeze rule; the interview kept the rule — covered
  languages still get GitHub's template, asked by the pack, pinned by commit.

## What follows

The gaps this run left open go to reconciliation:

- normalisation treats `/x` and `x` as one pattern, so a broader template line
  is skipped (decision 7 suspect);
- init's assets have no lock record, so an updated asset never reaches a shaped
  repo (decision 11 suspect);
- doctor's `setup:precommit` remedy lacks `MISE_ENV=dev`;
- review residuals: renovate's pre-commit manager misses
  `.config/pre-commit-config.yaml`; `memory-tree.md` still appends a banner;
  `setup/ai` says the graph refresh is by hand; `git.md`'s dart row; the init
  asset root and pack-negation guards in `check.ts`;
- `Flutter.gitignore` is the SDK repo's own file and `Dart.gitignore` ignores
  `pubspec.lock` (decision 21 suspect);
- stale mentions: init's orphaned `gitignore:<Name>` block, `pack-format.md`'s
  `.gitignore` example, `output-tree.md` and `materializer.md` section appends,
  `bundles/fnox.md`;
- `setup/precommit` under `core.hooksPath` and a failing
  `graphify hook uninstall`;
- a repo not shaped by init gets no graph refresh (decision 18 suspect);
- `template=<Name>` is checked by form only.

Next: **B67** (`docs/plans/2026-09-26-init-commits-the-lock`), which requires
this plan; then the gap-closing plans.
