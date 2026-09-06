# U9 — `/vwf:init`: the git pass, the slug, the editor composition, the re-run doctrine

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**`. Touch nothing outside this list — not
  `doctor` (U10), not `setup`, not any stackgen file.
- **Model:** opus
- **Read first:** `SKILL.md` (187 lines — hard rules, mode resolution, the five
  questions, the pipeline table, the report; `:84-85` on when `.config/vwf.yaml`
  exists), `references/new-repo.md` (198 — `:12-20` §1 branches, `:77-82` step
  6, `:84-99` §7 ids, `:100-117` the marked positions, `:119-137` `_default`,
  `:180-191` steps 9–10), `references/existing-repo.md` (194 — `:113-121` the
  group classification, `:163`, `:191-194` the idempotence claim),
  `references/fragments-and-sections.md` (130 — `:96-127` the `pre-commit.d`
  algorithm and its markers), `references/readme-and-license.md`. Then, by name,
  the stackgen files this unit cites: `plugins/stackgen/assets/ids.md` (U5), the
  editor-fragment subsection of `plugins/stackgen/assets/pack-format.md` (U5),
  and the three tasks U6 adds — `setup:vscode` (run through `setup:all`, never
  named here), `setup:default-branch`, and the `REPO_NAME` key. If a cited file
  is not there yet, write against the name and return a `GAP:`.
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md` for the commit
  ritual's spelling (`mise x -- git commit`, no `--no-verify`);
  `.claude/skills/plugin-authoring/references/checks.md` for rule 10's token
  list, only if `plugins:check` rejects a word.

## Ruling

D16 — the user, verbatim: "If the git is empty, start with `develop` and NOT
`main`. Once a commit is done, add `main`" and "`init` to ensure that there's
`main` as well as `develop` branch. Ask user which branch must be default branch
in remote (GitHub/GitLab/etc) with `develop` being default selection. No matter
which is default branch, work must flow from feature branches/worktree to
develop to main."

D17 — "Set it when it can, print it when it can't": init asks, then runs
`setup:default-branch <branch>`; the task decides.

D18 — "Init commits on consent; push is a second consent": "One question with
three answers — commit, commit and push, leave it — then init runs
`mise x --
git commit` itself with a fixed `ops:` message, and pushes only if
that was the answer and a remote exists. The new-repo first commit needs no
hooks; the existing-repo pre-commit commit goes first." The user: "At the end of
`init`, ask user to commit (local commit, push, etc)" and "When there's a change
in `.config/pre-commit-config.yaml`, it must be committed independently (along
with it's dependencies like `.config/git-conventional-commits.yaml`".

D19 — the branch guard payload is unchanged; the fix is ordering: the first
commit lands before the hooks are wired.

D22 — "`commitScopes` and forge links: comments say init fills them **on a
re-run** once the registry / remote exist; init gains that step." The user: "In
greenfield it will be impossible for `init` to fill this fully but it can still
have commit scopes when it's re-run at later stages."

D23 — "Doctrine names the moments (after architecture, after a pack bump, fresh
clone)". The user: "Ideally `init` skill must be run regularly so that the base
setup/configuration is maintained" and "`init` must be run at regular interval
to keep everything in sync (state of the repo and it's config/setup)".

D24 — "A re-run after architecture renames `p/<repo>/` → `p/<registry-id>/`; the
report says 'id source changed', not 'a pack moved'."

D25 — "The bootstrap offer is conditional on step 9 having run."

D26 — the editor composition: init merges the packs' `vscode.d/*.jsonc`
fragments per the convention in `pack-format.md`; "Init never names the editor:
the fragment convention names the target."

D28 — the existing-repo path moves a root `dprint.json` into `.config/` and
leaves the shim the dprint gate ships.

D15 / D30 — ids are slugified per `assets/ids.md`; `REPO_NAME` is a fourth
marked position and carries the slug.

Reversal 2 (confirmed): init now touches git history. `new-repo.md:20` —
"Nothing else in this pipeline touches git history" — is retired.

Rule 10 stands: this skill names no tool. The editor, the forge and their CLIs
are named by pack files and pack tasks; init runs tasks and cites conventions.

## Edits

1. **`references/new-repo.md` §1 (`:12-20`)** — rewritten. Where no repository
   exists: `git init -b develop`; nothing else until step 11. Where one exists
   with commits: leave its branches alone **here**; step 11 creates what is
   missing. Delete the sentence at `:20`; replace with a forward reference to
   the git pass.
2. **`references/new-repo.md` §7 (`:84-99`)** — the three-source preference
   order stays and gains, after it: "the resolved id is then slugified per the
   stack adapter's `assets/ids.md`" with the one worked example the asset uses;
   note that source 1 (registry ids) is live only on a re-run, since the file it
   reads is written after init. The marked positions at `:100-117` gain a fourth
   — `REPO_NAME` in the toolchain config — filled with the slug, plus the
   sentence that aliases which vary only by repo read it from the user's global
   config and are not this pipeline's.
3. **`references/new-repo.md` — the git pass, new §11 after step 10**, in order:
   (a) stage exactly what this run wrote; (b) **one consent** with three answers
   — commit, commit and push, leave — showing the file count and the branch
   first; on commit, `mise x -- git commit` with the fixed message
   `ops: shape the repo with the toolchain, gates and hygiene baselines` (the
   message the first real run used); (c) on a repository that had no commits,
   `git branch main` from that commit, so both branches exist and `develop` is
   checked out; on one that had `main` only, `git branch develop main`; (d) the
   forge-default question, `develop` preselected, then
   `mise run
   setup:default-branch <answer>` — the task sets it or prints the
   command; init says only what the task reported; (e) push only if (b)'s answer
   was commit-and-push and a remote exists: `git push -u origin develop` and
   `main`. State plainly that the first commit on a new repository precedes hook
   wiring by construction — step 10 wired nothing until `setup:all` ran, and
   `setup:all` runs after this commit on the new path — so the shipped
   `no-commit-to-branch` never sees it.
4. **`references/new-repo.md` steps 9–10 (`:180-191`)** — step 10's offer is
   conditional on step 9 having run; when step 9 deferred, step 10 repeats the
   deferral in one sentence and offers nothing.
5. **`references/existing-repo.md`** — (a) the apply step: if the plan touched
   `.config/pre-commit-config.yaml`, `.config/git-conventional-commits.yaml` or
   anything under `.config/pre-commit.d/`, those paths are staged and committed
   **first, as their own commit**
   (`ops: update the pre-commit
   configuration`), before anything else is
   staged — with the reason: a modified-but-unstaged pre-commit config aborts
   every commit that follows; then the git pass of edit 3 for the rest. (b)
   Branches: `develop` created from `main` where missing, `main` from `develop`
   where missing, then the forge-default question — same wording as edit
   3(c)–(d). (c) `:113-121`: when a group's segment is a previous id source's
   value (the repo name) and the resolved id now comes from the registry, the
   plan row reads "id source changed: `<old>` → `<new>` (repo name → registry)",
   never "a pack moved"; `:191-194`'s idempotence claim is scoped to "for the
   same id source". (d) A survey pass for the **fills**: `commitScopes` from the
   registry's project ids when `.config/vwf.yaml` (or the registry it points to)
   exists, else left as shipped; the forge links in
   `git-conventional-commits.yaml` from `git remote get-url origin` when a
   remote exists. Both are marked positions the gate pack ships (U7 words them);
   the plan shows each fill as a row. (e) The move rule: a root `dprint.json`
   that is a real config (not the two-line `extends` shim) moves to
   `.config/dprint.json` and the shim the dprint gate ships takes its place;
   recorded as a rename row.
6. **`references/fragments-and-sections.md`** — a third algorithm, in the same
   shape as `:96-127`: **editor fragments**. Inputs: every
   `.config/vscode.d/*.jsonc` in the repo after the packs landed, in composition
   order. Outputs: the two editor files the convention in the stack adapter's
   `pack-format.md` names. Rules: parse each fragment as JSONC or halt naming
   the file; `settings` keys deep-merged, later wins; `nesting` merged per
   parent as a union of children, rendered into the nesting setting the
   convention names, children sorted and comma-joined; `extensions` a sorted
   union. The merged result is written inside one marked block — markers per the
   convention — placed **first** in each file; everything after the block is
   preserved byte-for-byte; a block that exists is replaced, one that does not
   is inserted at the top of the object or array. Validate the result parses or
   halt. Do not name the editor; say "the editor files the convention names".
7. **`SKILL.md`** — (a) hard rules: the git pass and its two consents replace
   any "never touches git" wording; (b) the pipeline table gains the git pass
   and the fills; (c) a **When to run it again** section per D23: after the
   registry is written (commit scopes become fillable and ids may change
   source), after a stack pack version moves, on any fresh clone that reports
   drift, and whenever `/vwf:doctor` says so — and that `/vwf:setup` already
   offers it when the shape is missing; (d) the report gains a git section:
   branches created, the commit hash, what was pushed, what the forge task
   reported.
8. **`references/readme-and-license.md`** — unchanged unless a passage claims
   nothing is committed.

## Verification

- `mise run plugins:check` exits 0 — rules 4, 6, 7, 10 and 12 all reach this
  tree. If rule 10 rejects a token, rephrase through the convention or the task
  name; never request an exemption.
- `grep -rn "touches git history" plugins/vwf/skills/init/` returns nothing.
- `grep -rn "ids.md" plugins/vwf/skills/init/` hits `new-repo.md`.
- `grep -rn "setup:default-branch" plugins/vwf/skills/init/` hits both
  pipelines.
- `grep -rn "vscode.d" plugins/vwf/skills/init/references/fragments-and-sections.md`
  hits; `grep -rn "\.vscode/" plugins/vwf/skills/init/` — every hit is inside a
  citation of the convention, not a bare path init invents.
- `grep -rn "id source changed" plugins/vwf/skills/init/references/existing-repo.md`
  hits.

## Guardrails

- Name no editor, forge, or CLI (`code`, `gh`, `glab`) — the pack tasks do.
  `git` itself is fine; `git-workflow` already names it.
- Do not edit `plugins/vwf/skills/doctor/**` (U10) or `setup/**`; a passage
  there this change falsifies is `DOCS FALSIFIED:`.
- Strict YAML frontmatter in `SKILL.md`; `plugins/**/*.md` fold width by hand;
  `cat` is `bat` — Write/Edit only.
- The fixed commit message contains no backticks.

## Commit

`feat(vwf): init gains the git pass, the slug, the editor composition and the re-run doctrine`
— written by the orchestrator after the wave gate, not by the unit.
