# Product Membership — how vwf finds the product from any repo

A product is **one blueprint**. In a `repo` or `monorepo` topology that is
trivially the checkout you are standing in. In a `multi-repo` topology the
product spans several repos, and every vwf command has to answer one question
before it can do anything else: **where is the base repo?**

This asset defines that answer. Read it in any skill that must resolve the
product root, enumerate members, or decide what to do about one that is not on
this machine.

## The members and the back-link

Since `config_format` 27 both directions live in bootstrap's
`.config/bootstrap/repo.toml`, and vwf reads them through
`bootstrap config get <key> --json`, never from the file
(`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md` — the progress pane is
the one exception it records).

**The base repo declares the membership.** Its `repo.toml` carries one
`[members.<name>]` table per member, naming where it sits, where to clone it
from, and how it is wired — its `type`:

```toml
topology = "multi-repo"

[members.acme-api]
folder = "../acme-api" # relative to the BASE repo root
type = "sibling" # submodule | sibling | folder
url = "git@github.com:acme/acme-api.git"

[members.acme-app]
folder = "apps/acme-app"
type = "submodule"
url = "git@github.com:acme/acme-app.git"
```

Which registry projects live in a member is vwf's fact, not bootstrap's:
`projects.<name>.repo` in the base's `.config/vwf.yaml` names the member, and a
project without it lives in the base repo
(`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`).

**Each submodule or sibling member back-links to the base.** Its own
`repo.toml` carries `[home]`, which bootstrap's sync writes there when
`setup:configs` runs from the base repo; `bootstrap config get repo.home --json`
reads it:

```toml
[home]
folder = "../acme-product" # the path from the member back to the BASE repo root
type = "sibling" # the member's type in the base
url = "git@github.com:acme/acme-product.git"
```

The base repo carries **no** `[home]` — it is the home, and its `repo.home`
reads null. A repo is a member when its `repo.home` has a value; with null it
acts as a base. A **`folder`** member gets no `[home]` either: it is a folder of
the base repo's own tree, not a separate repo, and its base is its git top
level. The format 26 back-link file, `.config/vwf-membership.yaml`, is gone; one
left in a member whose `repo.home` resolves is drift that `/vwf:doctor`
reports, and on consent deletes and commits through /vwf:git-workflow.

## Why both directions

A `submodule` member can always find its product structurally:
`git rev-parse --show-superproject-working-tree` walks up, and
/vwf:git-workflow already relies on exactly this. **A `sibling` member has no
such mechanism** — it is an ordinary repo that happens to sit next to some
others.

Without the back-link, membership would be one-directional: the base knows its
members, no member knows the base. That breaks the ordinary way of working,
because you run /vwf:plan and /vwf:execute from
**inside the repo you are coding in**. vwf would find no `.config/vwf.yaml`, no
registry and no blueprint there, and report a perfectly onboarded repo as
un-onboarded. The failure is silent and looks like a bug in the product, not in
the wiring.

`repo.toml` is committed and travels with the repo, so a fresh clone on another
machine is a member immediately.

## Resolving the base repo

From the current working directory, in order:

1. **Move to the git top level** (`git rev-parse --show-toplevel`). A `folder`
   member is part of the base repo's tree, so this step alone resolves it.
2. **Read `bootstrap config get repo.home --json`.**
   - **a value** → this repo is a member. Resolve `repo.home.folder` from this
     repo's main checkout — for a linked worktree (`git rev-parse --git-dir`
     differs from `--git-common-dir`), the parent of `--git-common-dir` — and
     read `.config/vwf.yaml` there. Done.
   - **null** → this repo acts as a base. `.config/vwf.yaml` in its main
     checkout → this is the base repo. Done. No `.config/vwf.yaml` → go to
     step 3, the fallback.
   - **code 2** (no `.config/bootstrap/`, or a broken one) → inside a
     superproject (`git rev-parse --show-superproject-working-tree` prints a
     path), move there and resolve again from step 1. Outside one, stop with
     the envelope's `errors` text as bootstrap gives it. An absent `bootstrap`
     binary stops with the contract asset's install hint.
3. **Fall back to the superproject walk**
   (`git rev-parse --show-superproject-working-tree`, run from the main
   checkout). A path → this is a `submodule` member whose back-link is
   missing; move there and resolve again from step 1 — /vwf:doctor reports
   the missing `repo.home` as drift. No path → **not a vwf repo**; say so and
   stop, and do not guess a parent directory.

A `sibling` member has no superproject, so the walk cannot find its base: its
`repo.home` is the only way back.

The worktree case matters more than it looks: every vwf pipeline runs in a
worktree, and a worktree of a *member* repo has to resolve two hops — main
checkout, then base repo.

**`[home]` and `[members.<name>]` must agree.** /vwf:doctor reports two
drifts. A `submodule` or `sibling` member the base lists whose own `repo.home`
is null is reported with its fix: from the base repo, run `setup:configs` with
the member's flag, `--<member>`. A leftover format 26 back-link file in a
member whose `repo.home` resolves is reported too, and on consent doctor
deletes it and commits the deletion through git-workflow. A member with no
`.config/bootstrap/` at all is /vwf:setup's report, at its 26 to 27 step: run
`bootstrap init` in the member, then `setup:configs --<member>` from the base.
Neither drift errors on its own — a one-directional link simply makes one of
the two entry paths silently wrong, which is the failure this whole contract
exists to prevent.

## Each member's type decides its path

Every member takes its own path from its own `type`, never from a product-wide
setting:

- **`submodule`** — a git submodule of the base: cloned with
  `git submodule update --init <folder>`, its gitlink committed by the base.
- **`sibling`** — a separate repo at its `folder`, usually outside the base:
  cloned with `git clone <url> <folder>`, worktreed and landed on its own.
- **`folder`** — a folder of the base repo's tree. It has **no** separate
  worktree, clone or landing: its work is the base repo's work.

## Which members are on this machine is **not** a product fact

A `submodule` or `sibling` member is **present** when its resolved `folder`
exists and is a git work tree; a `folder` member is present whenever the base
is. This is per-developer, per-machine, and changes daily — a twenty-repo
product where three are cloned is the normal state, not a degraded one.

So **presence is detected on every run and never recorded** — not in
`.config/vwf.yaml`, not in `repo.toml`.
A committed key would be one developer's laptop asserted as the product's shape,
and it would be wrong for everyone else the moment it was written.

This is also why a small product with every repo cloned and a large product with
a handful cloned are the *same configuration* to vwf. They differ only in what
detection finds.

## An absent member

Commands split cleanly by what they actually need:

- **Docs only** — /vwf:product,
  /vwf:architecture, /vwf:design-system,
  /vwf:blueprint, /vwf:screens,
  /vwf:mockups, /vwf:feedback,
  plan-management. These read the blueprint, which is wholly in the
  base repo. **Absence is not a condition for them** — never detect, never ask.
- **Code** — /vwf:plan, /vwf:execute,
  /vwf:doctor, /vwf:verify. These follow the
  sequence below.

**The sequence, identical in every one of them:**

1. **Detect.** Resolve each member the run needs — for `plan`, every repo
   holding a project in the slice's dependency chain (the member a project's
   `projects.<name>.repo` names, else the base); for `execute`, the target
   repo; for `doctor`, every member. A `folder` member is never absent.
2. **Offer.** For each absent one, say what it is needed *for*, then offer a
   consent-gated clone by its `type`: `git submodule update --init <folder>`
   for a `submodule` member, `git clone <url> <folder>` for a `sibling`. Never
   clone uninvited — it writes to the user's disk outside the repo they
   invoked you in.
3. **On accept** — clone, then, for a `submodule` member, put the member on a
   branch. A submodule arrives detached at the commit the base's gitlink
   records, and a detached member cannot take a shaping commit — `init`
   refuses it — so a member this run cloned is never left detached. Pick the
   remote branch whose history **contains the recorded commit** — prefer
   `origin/develop`, then `origin/main`, then the one `origin/HEAD` names —
   and check it out **at the remote tip**: `git checkout -B <branch>
   origin/<branch>`. The member is then current, the shaping commit lands
   ahead of the tip, and the base commits its gitlink to it at the end
   (members first, base last) — the gitlink moving forward is the expected
   outcome of the run, not drift. Where **no** remote branch contains the
   recorded commit, the member has diverged: create a branch at the recorded
   commit — named for the first of `origin/HEAD`'s target, `develop`, `main`
   that exists on the remote — report the divergence, and treat the member
   as a deferred row — its shaping skipped, the base's gitlink for it unmoved
   — never resolved by moving the tree. A sibling clone is on its default
   branch already. Then proceed normally.
4. **On decline** — **proceed with that project excluded, and record the blind
   spot.** Name every project that could not be inspected in the command's own
   output, and in whatever artifact it writes: `plan` stamps them in the plan
   doc so a reader knows the delta was computed without seeing them. A plan
   written against incomplete knowledge is useful; one that *looks* complete is
   not.
5. **`execute` is the exception** — it **halts**. You cannot write code into a
   repo you do not have, and there is no honest partial result.

A decline is per-run, not persisted. The next run asks again, because the answer
genuinely changes — the usual reason to decline is "not right now".

## Where a plan lives

**A plan lives in the repo whose code it changes.** A cycle plan is a
**folder** — `docs/plans/<date>-<HHMM>-<slice>/`, `index.json` and `index.md`
plus one file per unit. In a `repo` or `monorepo` topology that folder sits in
the base repo, so the rule costs nothing and needs no configuration; in
`multi-repo` it sits in the `submodule` or `sibling` member, and a `folder`
member's plan sits in the base repo, whose work it is. The base keeps a thin
index at `docs/plans/index.json` — one row per plan folder in its `plans`
list, whose `target_repo` names the member holding the folder, per
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.

Two things follow that are worth knowing before implementing against this:

- **This does not remove /vwf:execute's cross-repo write.**
  `execute` sets the `implementation:` stamp on the blueprint's flow and entity
  docs, and those are in the base repo by definition — that is what makes the
  blueprint the source of truth. What distribution buys is the absence of merge
  contention on one shared `docs/plans/`, and each plan folder reviewed in its
  own repo's flow.
- **The dependency-chain gate is unaffected.** `execute` halts until every
  `requires` folder's `covers` docs read `implementation: complete`, and those
  are blueprint docs. So the chain resolves entirely from the base repo even
  when the folders themselves are scattered across twenty members — an upstream
  plan's own repo need not be present to know its work landed. The index row
  is what `next`, the claim and visibility use; it is not that test.

## Memory lives in the base repo

`docs/memory/` is one store per product, and in `multi-repo` it sits in the
**base repo**, whatever its members' types — beside the blueprint, never in a
member.
A member's run, review or handoff writes its records there, so a recall from
any repo of the product reads one tree. Full contract:
`${CLAUDE_PLUGIN_ROOT}/assets/memory.md`.
