# U1 — existing-repo.md: the passes read before they land

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/existing-repo.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom (963 lines; plan 2 re-worded its
  lead-in and pass 6's input — locate every passage below by its pass heading,
  not by line): pass 1 `:38-127`, pass 2 `:129-134`, pass 3 `:136-170`, pass 4,
  pass 6 `:271-414`, pass 8 `:436-451`, pass 9 `:453-594`, pass 10 `:597-637`,
  the plan and consent `:694-790`, the landing `:808-809`, the appends
  `:846-848`, the gate-first commit `:850-876`, the hand-off to `N` §11
  `:878-889`, the report `:919-923`.
- **Lazy-load:** `references/tool-configs.md` (U2's new table — cite by name,
  its rows are the input to pass 1's new step); `new-repo.md` §3, §4, §8, §9,
  §10 (U3's — cite by section number); `fragments-and-sections.md` (U2's — the
  merge and append algorithms); `plugins/stackgen/assets/output-tree.md:352-371`
  (the lockfile schema).

## Ruling

Decision 1 — Root tool configs: "Pass 1 reads inside `.github/` for the table's
paths. Every root hit is a plan row with one outcome: **move** (default) — the
repo's file becomes the `.config/` copy and is then offered through pass 6
against the pack's, the dprint move-and-shim model generalised; **keep both** —
the file stays and is reported as unread by the gate; **delete** — only on the
user's explicit pick. A twin the pack itself lands at the root (`renovate.json`)
yields: the repo's `.github/renovate.json` or `.renovaterc` wins and the pack's
is not landed, reported as such."

Decision 2 — Rename map: "Matches full declared pack paths plus the table's root
spellings; never a task-file basename (the task library is excluded from the
map); skips entries `.gitignore` ignores; a directory holding a manifest or
source (plan 2's sub-project rule) is reported **once** as a project, never
under Deferred; `.git/` is exempt by name."

Decision 4 — Hook manager: "Pass 1 reads the local `core.hooksPath`, `.husky/`,
`lefthook.yml`, `.lefthook.yml`; a hit is one plan row "switch hook manager to
pre-commit", **default keep**; on keep the gate-first commit runs under the
installed hooks and `setup:precommit` is not invoked; on switch the run invokes
`setup:precommit --force` (plan 1's flag) as its last shaping step and says so."

Decision 5 — Post-landing steps: "After its landing and before the git pass, the
existing pipeline runs `N` §3 (placeholders), §4 (licence and security files),
§8 (secrets provider), §9 (fills it does not already own) and §10 (the
aggregator offer) exactly as `N` states them — cited by section, not restated;
every mode shares those five steps."

Decision 6 — Hashes: "Every writer is named: the materializer at landing; pass
6's **replace and keep both re-record** the file's hash after the fills; and
init, as its **last step before the git pass**, re-hashes every file it filled,
appended to or merged (the ignore sections, the hook fragments, the editor
block, the marked positions) into the lockfile."

Decision 7 — Inline tasks and the rest: "Passes 3, 4 and 10 read inline
`[tasks.*]` in every mise config as tasks; a moved root `mise.toml` is merged
into the pack's split (its `[env]` and `[tools]` into the matching files, its
tasks per pass 3) rather than kept whole; pass 2 rewrites README callers the way
pass 3 rewrites task callers; pass 8 asks the user for a type outside both sets
instead of guessing; `LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING` all count as
"already carries a licence file"."

## Edits

1. **Pass 1** — (a) the rename map (`:48-55`) per decision 2: full declared
   paths, the tool table's spellings (cite `tool-configs.md`), the task library
   excluded, gitignored entries skipped, `.git/` exempt by name; (b) a new step
   **root tool configs**: for each table row, look for its spellings at the root
   and inside `.github/`; each hit is a plan row with the three outcomes and the
   default (decision 1), and the pack twin rule for `renovate.json`; (c) a new
   step **hook manager** per decision 4; (d) the Deferred report (`:919-923`) no
   longer lists a project directory — those are listed once under a **Projects**
   heading.
2. **Pass 2** (`:129-134`) — after the README move, rewrite every caller (links
   and task descriptions that name `README.md`) the way pass 3's `:147-152`
   rewrites task callers.
3. **Passes 3, 4, 10** — each reads inline `[tasks.*]` from every mise config
   file as tasks alongside task files; pass 3 gains the rule for a moved root
   `mise.toml`: its `[env]` and `[tools]` go into the matching pack files, its
   tasks through pass 3; the file is not kept whole (decision 7); pass 9's rule
   for a kept file lacking the keys (B14) is thereby moot — say so in one line.
4. **Pass 6** — the input list gains the moved root tool configs (decision 1);
   test 1's comparison of an unrecorded file uses the pack's bytes **after** the
   placeholder and scope fills, never the raw payload; the replace and the keep
   outcomes each end with "and records the file's post-fill hash in the
   lockfile" (decision 6); the licence spellings of decision 7 where pass 6 or
   the allowlist names `LICENSE`.
5. **Pass 8** (`:436-451`) — a type outside both sets is asked, with the closed
   set as the choices plus "keep as is".
6. **After the landing** (`:808-809`) — a new paragraph: run `N` §3, §4, §8, §9,
   §10 in that order, cited by section (decision 5); then the appends and merges
   (`:846-848`); then **re-hash** (decision 6): one paragraph naming what is
   re-hashed and that it is the last step before the git pass. The gate-first
   commit (`:850-876`) gains the hook-manager clause (decision 4). The hand-off
   to `N` §11 (`:878-889`) stands.
7. **The plan and consent** (`:694-790`) — the new rows (root tool configs, hook
   manager, projects) appear in the plan's shape and the one consent question
   covers them.

## Verification

- `mise run p:plugins:check` green.
- `grep -n "tool-configs.md" plugins/vwf/skills/init/references/existing-repo.md`
  — cited at pass 1 and pass 6.
- `grep -n "hooksPath\|husky\|lefthook" plugins/vwf/skills/init/references/existing-repo.md`
  — the hook-manager step exists.
- `grep -n "re-hash\|records the file's post-fill hash" plugins/vwf/skills/init/references/existing-repo.md`
  — both outcomes and the last step name the writer.
- `grep -n "§3\|§4\|§8\|§9\|§10" plugins/vwf/skills/init/references/existing-repo.md`
  — the five sections cited after the landing.
- `grep -n "COPYING" plugins/vwf/skills/init/references/existing-repo.md` — the
  spellings present where the file names `LICENSE`.

## Guardrails

- Only the one file. `tool-configs.md`, `fragments-and-sections.md`,
  `readme-and-license.md` are U2's; `SKILL.md`, `new-repo.md` are U3's; packs
  and stackgen assets are U4's — cite, never edit.
- No doc — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: existing pipeline reads root tool configs, hooks and inline tasks before landing; re-hashes what it writes`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
