# U1 — init: the visibility question and the forge pass

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/readme-and-license.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/backlog/SKILL.md` and
  `plugins/vwf/skills/backlog/references/github.md` (the precondition shape and
  the missing-project procedure this unit cites — read, never edit);
  `plugins/vwf/skills/doctor/references/stack-checks.md:284-453` (the six
  predicates, for the re-run doctrine wording);
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`
  (the by-hand line the fallback points at).

## Ruling

Decision 1 — Visibility question: "Q6 becomes **visibility**: one row per repo,
`public` / `private`; the default is read from the forge when the repo has an
`origin` (`gh repo view --json visibility`, `glab repo view`), else `private`.
The licence choice becomes **Q6a**, shown only for a `public` repo, MIT /
Apache-2.0 / none as today; a `private` repo gets no licence row and no LICENSE.
The count stays seven."

Decision 2 — Security contact: "**Q6b** replaces Q7's slot under the same
question: a `public` repo keeps the advisory-URL default; a `private` repo is
asked a free contact — an email or an internal URL — with no default; decline
writes no `SECURITY.md` either way."

Decision 3 — Default branch: "In the forge pass, one row per repo with an
`origin`, `develop` preselected, `main` the other; applied with
`gh repo edit --default-branch <b>` / `glab repo update --defaultBranch <b>`.
The forge is the record — no key in the tree; a repo with no remote gets nothing
and the hygiene pack's by-hand line still covers it."

Decision 4 — Protection rules: "On both `develop` and `main`, always: **no
force-push, no deletion**; when `MERGE_MODEL` is `pr`, additionally **require a
pull request** (no approval count). GitHub: one **ruleset** per branch named
`vwf-<branch>` through `gh api` (rulesets, not classic protection); GitLab:
`protected_branches` through `glab api`; any other forge: print the rules and
ask the user to set them. **Idempotent**: a ruleset or protection already
present on that branch is left untouched and reported, never merged with."

Decision 5 — Forge pass placement: "A new step at the **end of the git pass,
after the push**, run only for repos whose answer was *commit + push*; *commit*
or *leave it* skips the repo and lists it as pending. **One consent for the
whole product**, listing per repo what it will set (default branch, the two
protections) plus the backlog project for the base. The backlog step runs once,
base only, last."

Decision 6 — Backlog project: "init invokes the **backlog skill's
missing-project procedure** — the browser hand-over, the title rule, the field
bootstrap afterwards — and never `gh project create`; a project already present
is reported and skipped. GitLab: the skill's "not yet supported" line is printed
and the run continues; another forge: ask the user to create it by hand."

Decision 8 — Precondition: "The forge pass reuses the backlog skill's
precondition shape: CLI on PATH, logged in to the origin host
(`gh auth status --hostname <host>` / `glab auth status --hostname <host>`); a
miss **reports the reason and falls back to the by-hand list**, never blocks the
run. Scope: `gh` needs `repo`; the ruleset call fails without admin on the repo,
and that failure is reported the same way."

Decision 11 — Vocabulary: "The pass is named the **forge pass** everywhere … The
CLI is named per forge (`gh`, `glab`) only in the init references and the
hygiene pack, never in vwf's `SKILL.md` prose beyond what the backlog skill
already does."

Reversal, from index.md's Goal: init's git pass may now write forge settings —
the default branch and branch protection — on consent; the hygiene pack's
by-hand line becomes the fallback for a forge with no CLI. The existing refusals
at `SKILL.md:96`, `:532-535` and `new-repo.md:55-57` are rewritten to say what
the forge pass does and does not do (it never creates a remote, never pushes
without the push consent, never touches a setting outside the default branch,
the two protections and the backlog project).

## Edits

1. **`plugins/vwf/skills/init/SKILL.md`** — the questions section (`:252-414`):
   Q6 becomes the visibility question per decision 1, with its default rule; the
   licence choice moves under it as Q6a (its text from `:401-405`, now
   conditional on `public`); the security contact moves under it as Q6b (its
   text from `:406-411`, split per decision 2). Renumber so the count reads
   seven and the summary line naming the questions (`:85-100` and anywhere
   "seven questions" is enumerated) lists the new Q6/Q6a/Q6b. The git-pass
   summary gains one sentence naming the forge pass and its consent (decision
   5). The refusals at `:96` and `:532-535` are rewritten per the reversal
   above. The re-run doctrine (`:552-604`) names forge drift as a seventh reason
   `/vwf:setup reshape` is offered, citing doctor's predicate (g) by letter only
   — never restating its checks.
2. **`plugins/vwf/skills/init/references/new-repo.md`** — after the push step
   (`:585-598`), a new **Forge pass** section carrying, in order: the
   precondition (decision 8), the eligibility rule (commit + push repos only,
   decision 5), the per-repo default-branch row (decision 3), the protection
   rules and the exact calls per forge (decision 4 — the GitHub ruleset payload
   as one `gh api` invocation per branch with the three rules,
   `non_fast_forward`, `deletion`, and `pull_request` only under `pr`; the
   GitLab `protected_branches` call with `allow_force_push: false`), the
   idempotence check (a ruleset named `vwf-<branch>` or any protection on the
   branch → report, skip), the one product-wide consent listing every write, the
   backlog step (decision 6 — invoke the backlog skill's missing-project
   procedure by name, base repo only, last), and the by-hand list printed for a
   forge with no CLI or a failed precondition. The refusal at `:55-57` is
   rewritten per the reversal. Q6's default-read commands go beside the
   question's procedure where the file carries the questions' mechanics.
3. **`plugins/vwf/skills/init/references/existing-repo.md`** — the existing
   mode's git pass (`:827-858`) points at the same Forge pass section rather
   than restating it, and its consent line says the pass is idempotent on a repo
   that already has protection or a default branch set (reported, not
   rewritten). Q6's forge-read default applies here too — an existing repo
   almost always has an `origin`.
4. **`plugins/vwf/skills/init/references/readme-and-license.md`** — the licence
   procedure (`:37-55`) is gated on the repo's visibility answer: `private` → no
   LICENSE copy, and the "existing LICENSE is kept" rule stands; the security
   section (`:64-74`) carries the two contact shapes of decision 2 and says the
   pack's template is spliced with either an email or a URL.

## Verification

- `mise run p:plugins:check` green (rule 6 — every `${CLAUDE_PLUGIN_ROOT}`
  reference resolves; rule 10 — no technology token outside the enumerated list;
  `gh`/`glab` are not in that list, but keep them to the references per decision
  11).
- `grep -n "seven questions\|Seven questions" plugins/vwf/skills/init/SKILL.md`
  — the count is still seven, and the enumeration names visibility.
- `grep -n "forge pass" plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/*.md`
  — at least one hit in each of `SKILL.md`, `new-repo.md`, `existing-repo.md`.
- `grep -n "never touches the forge\|no forge setting\|forge's own settings"`
  over the owned files — zero hits of the old refusal wording.

## Guardrails

- Do not touch `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/backlog/**` or
  `plugins/vwf/skills/doctor/**` — U4 and U2 own them; cite their sections by
  name.
- Do not edit the hygiene pack — U3 owns it; point at its `CONTRIBUTING.md` by
  the file's landed path only.
- No doc outside `plugins/vwf/skills/init/` — report every falsified passage as
  `DOCS FALSIFIED:`.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width by
  hand; strict-YAML frontmatter — change nothing above the first `---` close.
- Delete with `rm`, never `git rm`.

## Commit

`feat: init asks visibility and runs a forge pass` — written by the orchestrator
after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml`; the file lists no scopes.
