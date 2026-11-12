# U1 — Queue verbs and the YAML reader in plan.mjs

- **Read first:** every owned file that exists, top to bottom, before editing:
  `plan.mjs`, `lib/schema.mjs`, `lib/path.mjs`, and
  `plugins/vwf/skills/plan-management/references/plan-index.md` sections
  *Resolution*, *The pick*, *Reading the queue* and *Writing a row — the claim,
  and the completion* (read only; U2 owns it).
- **Lazy-load:** `scripts/src/plan-script.test.ts` (how the existing suite
  spawns `plan.mjs` over fixture copies), `plugins/vwf/assets/membership.md`
  (base-repo resolution, for a member-repo folder).

## Ruling

> D1: "In this plan." (The claim — stash, checkout, pull, two plan.mjs set
> calls, the queue commit, push, rejected-push loop — is scripted.)

> D3: "plan.mjs gains the verbs pick, resolve and claim (logic in
> plan-management/scripts/lib/queue.mjs)."

> D4: "An own subset reader, plugins/vwf/skills/plan-management/scripts/lib/yaml.mjs:
> block maps and lists, flow lists and maps, comments, single- and
> double-quoted scalars, multi-line plain scalars, | and >- block scalars, and
> frontmatter between --- fences. It throws a named error on anchors,
> aliases, tags, and a multi-document file. Tested against fake config files
> shaped on the schemas (D24)."

> D17: "plan.mjs pick prints JSON {pick: {folder, kind, priority}} exit 0, or
> {nothing: [{folder, waits}]} exit 1. plan.mjs resolve <folder> prints
> {runnable, entries: [{entry, kind, satisfied, reason}]} exit 0 runnable, 1
> not. plan.mjs claim <folder> runs the plan-index.md claim procedure (git
> fetch, read the tip, stash when dirty, checkout develop, pull --ff-only, set
> the row RUNNING and the folder run key, git add the two files, mise x -- git
> commit -m 'docs: plan queue — <basename> running', push, the rejected-push
> loop, restore) and prints {claimed: true, commit} exit 0 or {claimed: false,
> reason} exit 1. A member-repo folder's run edit is a direct commit on that
> member's develop with the same message. All three read the tip of
> origin/develop, never the working copy. Unclaim and completion stay model
> procedures."

> D19: "Base first: the row in the base is the claim. Then the member commit of
> the folder run key runs the same procedure in the member checkout (stash
> when dirty, checkout develop, pull --ff-only, commit, push, the
> rejected-push loop, restore). If the member push still fails, claim returns
> {claimed: false, reason} and start.mjs returns refused; the message names
> the failure and the plan-management unclaim <folder> request, because the
> row is already RUNNING."

> D20: "start.mjs and plan.mjs claim take --worktree <repo-relative path>.
> Without it, the default <dir>/<plan name> applies."

> D32: "Undo and refuse. Drop the local claim commit (git reset --soft
> HEAD~1, then git checkout HEAD -- on the two files), restore the checkout,
> return {claimed: false, reason} with the git error. [...] The clean-rebase
> retry of a rejected push is capped at 3 attempts, then the same refusal."

> D33: "The claim already landed: return {claimed: true, commit, warning}. On
> a failed pop, run git reset --merge so the tree is back at HEAD; git keeps
> the stash entry. The warning, and start.mjs message, name the stash (vwf
> plan queue <folder>) and say to apply it by hand."

> D34 (U1 parts): "G1: reset --soft HEAD~1 runs only when the claim commit
> exists; when the commit fails, restore the two files with git checkout
> HEAD --, restore the checkout, return {claimed: false, reason}. [...] G4: a
> member folder is read from the member origin/develop tip [...] G7: U1 and
> U4 add the D20 --worktree flag to edits and tests. G8a: the archived-folder
> test and the covers docs are read from the tip (git ls-tree, git show),
> never from disk."

> D35: "No network read. The entry is unsatisfied with the reason: member
> <name> is not cloned; clone it to resolve this requirement. The plan is not
> runnable until the member is cloned."

> D37 (U1 part): "G2: the claim result has a kind field: {claimed: false,
> kind: lost|member-failed|failed, reason}; start.mjs reads kind, never
> reason." (lost: a same-row conflict; member-failed: D19; failed: D32.)

> D9 (f), (g): "The integration branch is develop on remote origin; the script
> refuses with a clear message when origin/develop does not exist." "The full
> rejected-push loop of plan-index.md, every exit restoring the checkout."

## Edits

1. **`lib/yaml.mjs`** (new, no shebang) — export `parseYaml(text)` and
   `parseFrontmatter(text)` (returns the parsed map between the first two `---`
   lines, or `null` when the file has none). Plain scalars: `true`, `false`,
   `null`, `~`, integers and floats become their JS types; everything else is a
   string. Throw `YamlError` with the 1-based line number on an anchor (`&`),
   an alias (`*`), a tag (`!`), a second document (`---` after content), a tab
   used for indentation, or a structure the subset does not know.
2. **`lib/queue.mjs`** (new, no shebang) — export `pick({base})`,
   `resolve({base, folder})` and `claim({base, folder})` with the D17 results.
   - Every git call is `node:child_process` `execFileSync`/`spawnSync` with an
     argument array, never a shell string. The commit runs `mise` with the
     arguments `x -- git commit -m <message>`.
   - The tip read is `git fetch origin`, then `git show origin/develop:docs/plans/index.json`.
   - Resolution and the pick follow plan-index.md *Resolution* and *Reading
     the queue* exactly. A cycle requirement reads each `covers` doc's
     frontmatter `implementation` key with `parseFrontmatter`.
   - The claim follows *Writing a row — the claim*: steps 1 to 8, the claim
     branches of step 7 only. The `run` value is `{"worktree": "<dir>/<branch>", "log": "~/Library/Caches/vwf/<repo>/<basename>.jsonl"}`,
     where `<dir>` is `.worktrees` unless only `worktrees` exists, `<branch>`
     the plan's name (the `<name>` of `<date>-<name>`, the `<slice>` of
     `<date>-<HHMM>-<slice>`), `<repo>` the basename of the directory that
     holds the git common dir. The row and `run` edits go through the same
     write path `plan.mjs set` uses, so `started` is stamped and the result is
     validated before it is written.
3. **`plan.mjs`** — add the verbs `pick`, `resolve <folder>` and
   `claim <folder>` to the dispatch and to `USAGE`, calling `lib/queue.mjs`;
   print the JSON result on stdout. Keep every existing verb, flag and exit
   code unchanged. Update the header comment to list the three verbs.
4. **`scripts/src/plan-yaml.test.ts`** (new) — table tests for every
   construct in the subset and every refusal. Write, as fixtures under
   `scripts/src/fixtures/plan-queue/yaml/`, a fake `.config/vwf.yaml` of a
   multi-repo product (members with `url:`, axis pins with `project/` and
   `repo/` prefixes, `unresolved` and `[]` axes, `harness:`, a multi-line
   plain scalar, comments), a fake `docs/blueprint/registry.yaml`, a fake
   `.claude/stackgen/lock.yaml` (entries with bare and `sha256:` hashes,
   `local_plugin`), and a fake template with frontmatter. Shape them on the
   schemas in `plugins/vwf/assets/vwf-config.md`,
   `plugins/vwf/assets/templates/registry.yaml` and
   `plugins/stackgen/assets/output-tree.md`. Assert that each parses and that
   named keys hold the expected values.

> D24: "Use ONLY fake data." Every fixture holds invented names, paths, hosts
> and URLs (e.g. `example-product`, `git@example.com:example/api.git`); no
> file is copied from a real repo.
5. **`scripts/src/plan-queue.test.ts`** (new) — build temp repos with a bare
   `origin` (`mkdtempSync` under `tmpdir()`, `realpathSync`), as
   `scripts/src/mockups-serve.test.ts` does. Cover: pick order (priority, date,
   name), a `RUNNING` row never picked, nothing runnable with its waits; resolve
   of a change requirement (`COMPLETE` row, archived folder with no row,
   `APPROVED` row), a cycle requirement by frontmatter, an unresolvable entry;
   claim on a clean tree, on a dirty tree (stash taken and popped), from
   another branch (checked out back), a clean-rebase retry, and a same-row
   conflict (restored, exit 1, nothing pushed); `origin/develop` absent.
   Set `GIT_AUTHOR_*`, `GIT_COMMITTER_*` and a `PATH` where `mise x --` can run
   `git`, or stub `mise` with a script on `PATH` that runs its arguments after
   `--`.

## Verification

- `mise x -- pnpm vitest run scripts/src/plan-yaml.test.ts scripts/src/plan-queue.test.ts scripts/src/plan-script.test.ts`
- `mise x -- pnpm exec tsc --noEmit -p scripts`
- `mise x -- mise run p:plugins:check`
- `node plugins/vwf/skills/plan-management/scripts/plan.mjs pick` in this repo
  prints JSON and exits 0 or 1.

## Guardrails

- Touch nothing outside `owns`. `plan-index.md` is U2's.
- Rule 16: import only `node:` built-ins and relative paths; no `require(`;
  no `from "x"` or `import("x")` text in a comment or a string.
- Never `--force`, `reset --hard` or `--no-verify` in the claim code.
- Write files with the Write tool, never `cat > file` (`cat` is aliased to
  `bat`). The Bash tool runs fish: wrap loops in `bash -c`.
- A test file importing a `.mjs` needs `// @ts-expect-error`, as
  `scripts/src/execute-log.test.ts` does.

## Commit

`feat: plan.mjs pick, resolve and claim verbs and a YAML subset reader`
