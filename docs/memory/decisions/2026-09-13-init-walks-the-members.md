# Decision — `init` walks the members: one survey, one plan, one consent

**Date** 2026-09-13 · **Branch** `2026-09-13-init-walks-the-members` · **Plan**
[`docs/plans/2026-09-13-init-walks-the-members/`](../../plans/2026-09-13-init-walks-the-members/index.md)
· **Reverses**
[`2026-09-06-init-behind-setup.md`](./2026-09-06-init-behind-setup.md)'s **What
stays outside** bullet on the target directory (*"`init`'s `[target-dir]` is not
forwarded … A different directory means running `/vwf:setup` there"*) and
`site/src/content/docs/how-to/greenfield/multi-repo.md`'s per-repo sentence
(*"each member repo gets its own `init` run when it is created, since the shape
is per repo, not per product"*) · **Umbrella**
[`2026-09-05-vwf-init-and-the-repo-shape.md`](./2026-09-05-vwf-init-and-the-repo-shape.md)

## What was decided before

**`init` shaped the repo it stood in, and nothing else.** Step 0 detected the
mode in cwd; the hard rules said in so many words that it *never writes outside
the target repo*; and the one thing it knew about members was a marked position
it filled — `MEMBERS`, from the registry's member list, under sibling linkage
only. Under submodule linkage it filled nothing and descended nowhere.

**The manual said that was the design.** `multi-repo.md` told a user each member
gets its own `init` run "since the shape is per repo, not per product", and the
2026-09-06 decision that hid `init` behind `/vwf:setup` dropped its
`[target-dir]` argument with the line "a different directory means running
`/vwf:setup` there". The two agreed, and together they made shaping a four-repo
product four separate runs a user had to remember to make.

**`/vwf:doctor` and `/vwf:setup` agreed with them.** Doctor's six repo-shape
predicates were root-scoped, and setup's Step 0 asked its two questions of the
directory it was standing in. Doctor already walked every locally-present member
for graphify; the shape check did not.

**The motivating observation.** The user's own 95octane run shaped the base and
left `backend`, `frontend` and `devops` untouched — each still on `c/`, `k/`,
`w/`, `merge/develop` and `flutter/` while the root had moved to the contract
names. Nothing failed and nothing was reported: the members were simply never
looked at. That is the silence this decision is about.

## What changed

**The shape is per repo; the run is per product.** Both halves of the old
sentence were kept and the conjunction between them was reversed. A member is
still a repository in its own right — its own `.config/`, its own task library,
its own gates, its own adapter lockfile, shaped or not on its own evidence. What
is no longer per repo is the *run*: `init` resolves the base and every member,
surveys all of them, presents **one plan with a section per repo**, and applies
it on **one yes**. Two plans would be two chances to stop halfway, which is
exactly the state one repo renamed into the contract beside neighbours still
calling the old names.

**`init` still takes no argument.** The reversal of the 2026-09-06 bullet is not
the return of `[target-dir]`: `init` reaches other repositories by **walking**
its declared membership, never by being told one. The hard rule it replaces
reads *never writes outside the repos it resolved as the base and its members* —
which is what lets a sibling member at `../<name>`, outside the base tree, be
shaped at all.

**The member set is a union, and a one-sided source is not a disagreement.**
`.gitmodules` walked recursively, unioned with the `members:` list in
`.config/vwf.yaml`, deduped on realpath. Where only one of the two exists — the
ordinary case, and the case 95octane is in — that list *is* the member set,
whole. Only where **both** exist does a path in one and not the other become a
membership disagreement: reported in the plan, naming both sources, and never
shaped, because settling it by picking a side would write a repo into the
product on `init`'s own authority.

**Mode resolves per repo**, on that repo's own markers, so a base can come out
`existing` while a member beside it comes out `new`, and each section says which
it got. The eleven existing-repo passes and the ten counted plan sections repeat
per repo; each section carries its own total and the document a product total.

> **Two details superseded by
> [`2026-09-14-repo-name-is-the-folder.md`](./2026-09-14-repo-name-is-the-folder.md).**
> Question 2 no longer shows each repo's own row — the repo is question 1's —
> and a member project with no declaration and no sub-directory is now proposed
> from its **platform token**, not from the member's own name.

**Seven questions, still seven rounds.** A round is one round for the **whole
product**: a question whose answer differs per repo shows one row per repo
inside its single round and never becomes a second round. Questions 2 (the ids,
grouped by repo with each repo's own row first), 6 (the licence) and 7 (the
security contact, defaulted from *that* repo's origin) carry a row per repo; 4
(the secrets provider) and 5 (the agent plugins) are answered **once** and
written into every repo, because a product keeps its secrets in one place and
the plugin inventory is the machine's rather than a repo's; 1 and 3 carry a row
per repo that resolved **new**. A member's projects come from the base config's
`members[].projects` first, then that member's own sub-directories, then its own
name.

> **Superseded on one point by
> [`2026-09-14-repo-name-is-the-folder.md`](./2026-09-14-repo-name-is-the-folder.md).**
> The last sentence of this paragraph — "The project id keeps exactly two
> surfaces: the `p:<id>:*` task group and `REPO_NAME`" — no longer holds.
> `REPO_NAME` takes the repo's folder name, slugified; the project id names the
> task group and the commit scopes. Everything else in this paragraph stands.

**The member flags and the `setup-<slug>` aliases stop being id surfaces.** The
bootstrap aggregator's flags and the shell aliases beside them are one per
**member repo**, named for the member. They widen a run to another repository,
which is what a member is — so a member holding three projects is one flag, and
a list an earlier version generated from project ids is rewritten by a reshape
as a drift row. The project id keeps exactly two surfaces: the `p:<id>:*` task
group and `REPO_NAME`. `MEMBERS` is untouched by this: still filled from the
resolved members under siblings, still left as shipped under submodules.

**The git pass asks once and applies everywhere.** The landing model and the
three-answer commit question are asked once for the run. **Members commit
first**; the base then commits the run's files *plus* the moved **gitlinks**,
which `init` deliberately stages so the base's record of where each member
points is not left a commit behind. Push, on the commit-and-push answer, pushes
every repo, and the `develop`/`main` pair is created per repo that lacks it. The
gate-configuration-first commit applies **per repo**, since each repo's
pre-commit is its own — so an existing-mode repo makes two commits and a
new-mode repo one, and a repo's `Commit` report line names every commit the run
made there.

**An absent member is a row, not a second question.** Its section opens with the
clone command the membership asset spells for the linkage in force —
`git submodule update --init <path>`, or `git clone <url> <path>` — followed by
*then survey and shape it*, covered by the same one yes and surveyed at apply
time. A decline clones nothing and is recorded nowhere. A member with no clone
source gets no row: it is Deferred, unlock *add the clone source*, because
inventing a remote would be a guess at somebody's.

**Doctor and setup follow.** All six repo-shape predicates evaluate per repo —
the base and every locally-present member, resolved the way `init` resolves them
— with every row printed under the repo it was found in and one remedy for the
product, since `reshape` walks the members too. An absent member is a blind spot
(`not present, not checked`), never a finding. Beside (b) sits the new
comparison on the base alone: the member flags and aliases against the resolved
member set. Setup's Step 0 asks both of its questions of every repo and makes
**one** offer naming which repos showed what — a current base with one behind
member is still an offer, because the product is shaped only when all of them
are. A `reshape` started inside a member reshapes the product.

**One kept-file record for the product.** A member carries only its back-link
and no `.config/vwf.yaml`, so a keep taken inside a member is recorded in the
**base's** `enforcement.kept_files`, keyed by its base-relative path — the
member's path as prefix — and doctor's content check reads that one block for
every repo it evaluates.

**Idempotency is a product property.** A second run on a fully shaped product
prints an empty plan carrying a section per repo, each reading nothing, and says
the *product* is shaped. Getting there took three fixture rounds and one ruling:
pass 1 reads root **entries** and recognises `.claude/` and every resolved
member path; pass 6 compares a pack-owned file against its lockfile record's
hash rather than the pack's current bytes; pass 9 tests a marker the fill
**removes** rather than a value equal to a shipped default; pass 10 exempts the
init-authored `_default` slot beside `_scripts/local`. A plan that named only
the base would leave a reader unable to tell a member that was checked from one
that was skipped.

**The packs needed no functional change** — only their prose. A pack's `config/`
payload lands relative to the nearest config root, and `setup:all --all` already
loops the members and runs each member's own library. The toolchain-manager pack
went `1.2.0` → `1.2.1` for comment and prose alone, so that doctor does not
report unexplained content drift on every shaped repo; the three cloud-service
packs went `0.1.0` → `0.1.1` for the same reason, their `deploy` comment having
named the flags and aliases as id surfaces.

## Rejected

Every alternative the plan's assumed-decisions table weighed and turned down:

| Decision                                  | Rejected                                                                                                        |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Where the member loop lives               | setup driving the loop with one `init` per repo; report-only                                                    |
| The member source                         | submodules only; config `members:` only                                                                         |
| The git pass                              | leaving the gitlinks unstaged; dropping the git pass for a multi-repo run                                       |
| The seven questions                       | one answer everywhere; a product round plus a round per repo                                                    |
| The member flags and the `setup-` aliases | leaving the conflation; flags from members but aliases from projects                                            |
| An absent member                          | skip and record; a separate round before the plan                                                               |
| Doctor's shape predicates                 | one new member predicate; doctor root-only                                                                      |
| Mode resolution                           | one mode for the run                                                                                            |
| Apply order                               | base first                                                                                                      |
| Project ids inside a member               | reusing the base's project list for every member                                                                |
| `MEMBERS` env fill                        | filling `MEMBERS` under submodules too                                                                          |
| The report                                | one flat report                                                                                                 |
| Idempotency across the product            | reporting only the base; relaxing it to "totals zero"; pass 1 over files only                                   |
| The gate-config-first commit              | once for the run                                                                                                |
| The toolchain pack version                | minor; leaving the pack version alone — doctor would then report unexplained content drift on every shaped repo |
| The fixture                               | a copy of 95octane; a sibling fixture                                                                           |
| The cloud-service `deploy` comment        | accepting the stale comment                                                                                     |

## What stays outside

- **The `config_format` migration.** `polyrepo` → `multi-repo` + `linkage`, and
  the `members:` key itself. The union rule was chosen precisely so this change
  needs none of it: a submodule product with no `members:` key is shaped from
  `.gitmodules` alone.
- **What `linkage:` means, and `plugins/vwf/assets/membership.md`'s contract.**
  `init` and `doctor` consume the asset; nothing here edits it.
- **The toolchain pack's `members()` helper.** Its else-chain and `init`'s union
  agree under the contract, since `linkage:` is single-valued, so the helper
  stays as it is.
- **Running `init` against the real 95octane.** The fixture is synthetic; the
  real reshape is the user's to run after `mise run p:plugins:local` and a
  restart.
- **`stackgen-stack-template`'s "name a member repo" target rule.** That is the
  template skill's; `init` reaches members by walking, not by naming one.
- **Tagging and publishing.** The three version bumps are intent; the tags wait
  for a later `/release`.
- **The landing consent override is one-plan-only.** The standing rule — that a
  merge to the integration branch, a push and a release each need explicit
  in-the-moment consent — is unchanged. The user granted an unattended landing
  for *this plan*, recorded in its Consent table as a deliberate override, and
  it expires with it.

### Parked

- **95octane's own migration** — `config_format` 14 → 16, `polyrepo` →
  `multi-repo` + `linkage: submodule`, and the registry role/platform remap
  written out on 2026-09-12. Carried over from the 2026-09-12 plan.
- **A sibling-linkage fixture.** Proving the union's second half and the
  outside-the-tree write needs a base with a `members:` list and a `../` member,
  so it belongs to the plan that lands the config migration.
- **The union versus the else-chain.** If a product ever declared both
  `.gitmodules` and sibling `members:`, `init` would shape a sibling that
  `setup:all --all` never visits. Out of contract today; revisit only if
  `linkage:` becomes multi-valued.
- **Cross-repo symlinks in 95octane.** A member shaped by the packs gets its own
  copies; what to do with the existing links is a question for the real reshape.
- **Pre-existing existing-pipeline prose the fixture surfaced** — the
  `.github/ISSUE_TEMPLATE/config.yml` placeholder no pass fills, the forge-link
  source being the raw origin, the unreachable "stage those paths only", and the
  `Calls rewritten` count overstating because replaces run before callers are
  rewritten. All outside every ruling here.
