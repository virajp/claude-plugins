# Decision — `REPO_NAME` is the folder, the task group is the project

**Date** 2026-09-14 · **Branch** `2026-09-14-repo-name-split` · **Plan**
[`docs/plans/2026-09-14-repo-name-split/`](../../plans/2026-09-14-repo-name-split/index.md)
· **Reverses**
[`2026-09-06-project-ids-are-slugged.md`](./2026-09-06-project-ids-are-slugged.md)'s
**Four surfaces** paragraph (*"`REPO_NAME`, the toolchain manager's environment
key, which carries the same slugification applied to the repo's own name"*) and
[`2026-09-13-init-walks-the-members.md`](./2026-09-13-init-walks-the-members.md)'s
member-flags paragraph (*"The project id keeps exactly two surfaces: the
`p:<id>:*` task group and `REPO_NAME`"*) · **Backlog** B04

## What was decided before

**One slugged project id filled both surfaces.** The 2026-09-06 decision listed
four surfaces the id reached and made `REPO_NAME` the fourth of them, "which
carries the same slugification applied to the repo's own name". `init`'s
question 2 was where a user saw that id, and the doctrine sentence in the mise
pack's conventions read *"`REPO_NAME` is the repo's own id … the same token the
`p:<id>:*` task group uses"* — with `assets/ids.md` adding that deriving the id
once was "the whole point".

**The 2026-09-13 decision narrowed the list to two and kept the conflation.**
When the member flags and the `setup-<slug>` aliases stopped being id surfaces —
they name member **repos** — the sentence that replaced them read: "The project
id keeps exactly two surfaces: the `p:<id>:*` task group and `REPO_NAME`." Two
surfaces, one token.

**Where the name came from.** With no registry, `init` resolved a project id
from the registry, then a sub-project directory, then **the repo's own name** —
so a single-project repo's group was named for the repo, and `REPO_NAME` for the
same thing, and the two agreeing looked like a rule rather than the coincidence
it was.

## The ruling

Decisions 1, 2, 3, 4 and 11 of the plan's assumed-decisions table, as approved:

**1 — `REPO_NAME`.** The slugified basename of the repo's **main checkout**
folder, by `ids.md`'s slug rule, proposed by question 1 and written literally —
never derived at load time, since a linked worktree's folder is named for the
branch. A member repo names its own folder, never the base's. (User: "REPO_NAME
is folder name".)

**2 — Group id proposal.** With a registry: the registry ids, unchanged. Without
one: per project, the primary platform token, asked in question 2 as a choice
over the role's platform list plus a free "other" the user types; two projects
that would share a token in one repo are proposed as `<token>-<directory-slug>`
each; every row stays editable and a replacement is slugified as today. (User,
MCQ.)

**3 — One token.** The project id is the group id and the commit scope. No
`task_group` key, no `config_format` bump; doctor's predicate (b) is untouched.
(User, MCQ.)

**4 — Architecture.** One sentence where it proposes ids: prefer the project's
primary platform token as its id when it is unique within its repo, and on a
shaped repo seed the ids from the existing `p/<id>/` groups so a re-run of init
reports no "id source changed".

**11 — Wording.** The phrase for the key is "the repo's folder name, slugified";
"the repo's own id" and "the repo's own slug" are retired wordings wherever they
describe `REPO_NAME`.

## What changed beside them

**`assets/ids.md` is one rule with two applications.** Retitled *Project ids and
repo names*: the slug rule and its measured reason are unchanged, the "Where the
id lands" table becomes two rows with two **sources** — the project id from the
project's name, the repo name from the main checkout's folder — and the sentence
calling the single derivation "the whole point" is gone. A single-project repo
whose folder spells its project id is named as a coincidence, and nothing may
read one token to infer the other.

**The commit-scope list fills on every run.** It was described as re-run work by
construction, on the reasoning that the registry is its only source and no
registry exists on a first run. It is not: the scopes take the ids question 2
**confirmed**, whatever proposed them, so a repo with no registry fills the list
on its first run like any other. A registry is where a proposal came from and
never a precondition. The falsified passage lived in three places — init's
`SKILL.md` and both of its references, the pre-commit pack's marked-position
comment and its `conventions.md`, and the site manual — and the greenfield
fixture is what caught it, returning `commitScopes: []`.

**Question 1 settles the key.** It was already the mode-new repo-name question;
it now says so — the answer, slugified, is what that repo's repo-name key
receives, no project id reaches it and no answer there reaches a task group.
Question 2 drops the repo's own row, since the repo is no longer one of the
things it names.

**Doctor's predicate (d) checks the folder.** The repo-name key is read against
the basename of that repo's **main checkout** — resolved through
`git rev-parse --git-common-dir`, never the working directory, since a linked
worktree is named for its branch. A value that is not that folder's slug is a
drift row, remedied by `/vwf:setup reshape`, which shows it as init's
`repo-name key: <old> → <new>` replace row and applies it on the one consent.

**A marked position's value is not content drift, which decision 5 forces.** For
that one row to be the whole of what a user sees, init's existing-repo pass 6
and doctor's predicate (e) both take **two tests**: the file's hash against the
lock, and, on a mismatch, a splice of the repo's current value at every marked
position into the pack's payload at the pinned version. Equal, and the
divergence lies wholly inside those positions — no pass-6 offer and no (e) row,
only the owning pass's row. A record sourced `generated` has no payload to
splice into, so the second test is skipped. The same consequence makes a
**keep** cover content alone: the fills still reach the positions inside a kept
file.

**Five packs moved for prose alone**, so that doctor does not report unexplained
content drift on every shaped repo: the toolchain-manager `mise` pack `1.2.1` →
`1.2.2`, the three cloud-service packs `containers`, `workers-ssr` and
`workers-static-assets` `0.1.1` → `0.1.2`, and — found at run time, beyond what
the plan's consent block listed — `toolchain-gate/pre-commit` `1.1.0` → `1.1.1`
for the commit-scope comment.

## Why

**The user's own words, from the B04 backlog item.** "`init` uses the same `id`
for `REPO_NAME` as well as creating tasks group `p:<id>:*`. This needs to be
separated, REPO_NAME is usually different than tasks group id. E.g.: REPO_NAME =
"95octane", task group id will be "service", "worker", "console", etc. Ideally
the recommended task group id is the project type whereas REPO_NAME is folder
name."

**A task group names what a task acts *on*.** `p:service:deploy` deploys the
service; `p:95octane:deploy` names the repository the service happens to live
in, which is not a thing anybody deploys. The repo's name was the old fallback
precisely where there was nothing better to read — and it was the wrong answer,
not a missing one, which is why the fallback becomes a **question** about the
project's platform rather than a different reading of the tree.

**This repo is the standing counter-example.** `REPO_NAME = "claude-plugins"`
sits beside the groups `p/i`, `p/plugins`, `p/scripts` and `p/site`. Not one of
them is the repo's name, and the repo has been shaped that way since before the
rule claimed otherwise — the doctrine was describing a single-project special
case as though it were the model.

**A linked worktree is why the value is literal.** Derived at load time,
`REPO_NAME` would read `2026-09-14-repo-name-split` inside this very worktree,
and every launcher alias and per-repo editor profile reading it would follow it
to a repo that does not exist.

## Rejected

| Decision                | Rejected                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `REPO_NAME`             | the project id; derived at load time                                                                  |
| Group id proposal       | today's order (registry, directory, repo name); the project's **role** as the token                   |
| One token               | a `task_group` mapping key in `.config/vwf.yaml`, and the `config_format` bump it would have needed   |
| Architecture            | leaving architecture alone                                                                            |
| Re-run on a shaped repo | a silent rewrite of the key; a doctor-only finding with no init row                                   |
| The overlays            | leaving the three cloud-service `deploy` comments stale                                               |
| The mise pack           | a unit per pack                                                                                       |
| `ids.md`                | a second asset for the repo name                                                                      |
| This repo               | waiting for a reshape to re-land its own comment                                                      |
| Ordering                | running this plan concurrently with the `2026-09-13-vwf-process` group it shares three doc files with |
| Wording                 | keeping "the repo's own slug"                                                                         |

## What stays outside

- **A `task_group` mapping key and a `config_format` bump** — decision 3. One
  token stays one token; only what proposes it changed.
- **`MEMBERS`, the member flags and the `setup-<slug>` aliases** — already named
  for member repos by the 2026-09-13 decision; untouched here.
- **The materializer's `p/_project/` rename** — still the pinned project's
  slugged id, which is exactly what this decision keeps.
- **The registry's `role:` and `platforms:` vocabulary** — read, not edited.
  `console` stays retired in favour of `backend` + `[service, webapp]` +
  `operator-rbac`, is offered on no list, and is typed as *other* when wanted.
- **Running `init` against the real 95octane** — the user's, after
  `mise run p:plugins:local` and a restart.

### Parked

- **95octane's own migration** — carried from the 2026-09-12 and 2026-09-13
  plans. Under this decision its `REPO_NAME` stays `95octane`, which is its
  folder name, and its groups `service`, `worker` and `console` are already
  type-shaped ids, so the split costs it nothing.
- **`console` as a first-class token** — if a type vocabulary for ids ever needs
  it back, that is an architecture-platforms plan, not this one.
- **A durable init fixture in the repo** — three plans have now rebuilt one
  under `/tmp`; a committed synthetic fixture with a scripted answer file would
  make the orchestrator's gate reproducible.
