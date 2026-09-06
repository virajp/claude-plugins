# Decision — a project id is slugged, and `assets/ids.md` owns the rule

**Date** 2026-09-06 · **Branch** `2026-09-05-astro-static` · **Plan**
[`docs/plans/2026-09-05-astro-static/`](../../plans/2026-09-05-astro-static/index.md)
· **Replaces** the reason written into
`skills/stackgen-stack-template/references/materializer.md:57-68` on 2026-09-05

## What was decided before

Nothing. No slugification existed anywhere: `new-repo.md` resolved a project id
from the registry, a directory name or the repo's own name and used it raw, and
the registry field is documented as "free text (short identifier)". A single
sentence in `materializer.md`, written 2026-09-05, gave a reason for hyphenating
one — and that reason was wrong.

## The measured mechanism

On mise 2026.9.1:

- A directory `tasks/p/virajp.dev/` holding a file `deploy` lists as
  `p:virajp.dev:deploy` — the dot survives.
- The **same directory holding `_default`** lists as `p:virajp`.

`_default` collapses into its parent, which makes the parent directory the
task's **last** segment — and mise strips what looks like a file extension from
the last segment. So an id carrying a dot silently loses everything after it,
and the task the repo shows a user is not the task it has.

The 2026-09-05 wording — *"mise reads `p/virajp.dev/deploy` as a task with an
extension"* — is false as written: that path lists correctly. It is the
`_default` slot, which `init` authors for every project, that moves the dot into
the position where it is stripped.

The live `virajp.dev` repo never hit this. Commit `a85b7a6` wrote
`p/virajp-dev/` already hyphenated, by hand, and nothing recorded that it had
been.

## What changed

**One asset, `plugins/stackgen/assets/ids.md`**, owns the rule and is the only
place it is written down: lowercase, every run of characters outside the slug
alphabet collapsed to a single `-`, leading and trailing separators trimmed. So
`My.App` resolves to `my-app`.

`/vwf:init` §7 and the materializer both **cite** it rather than restating it,
and the task library's `p:<id>:*` section does the same. Nothing re-derives the
rule, and nothing re-derives the reason.

**Four surfaces** take the slugged id, not three: the per-project task groups
(`p/<slug>/`), the bootstrap aggregator's member flags, the `setup-<id>` shell
aliases, and — new — `REPO_NAME`, the toolchain manager's environment key, which
carries the same slugification applied to the repo's own name. The extension
rule is the reason for the first; the flag and alias grammars are the reason for
the rest, and they would have forced the same rule on their own.

`REPO_NAME` is written **literally** and never derived at read time: a linked
worktree's config root is named for the branch, so a derived value would change
identity every time somebody cut one.

## Rejected

- **Defining the rule inside `/vwf:init`.** Two consumers need it — init and the
  materializer — and vwf naming a toolchain manager's parsing quirk is exactly
  what checker rule 10 exists to catch.
- **Handling dots only.** The alphabet is closed rather than a blocklist; a
  space or a slash in a free-text id fails the same grammars.
- **A shell `slugify` helper.** No shell consumer exists. Both consumers are
  prose.
