# Decision — `init` moves behind `/vwf:setup`, and the ids are confirmed first

**Date** 2026-09-06 · **Branch** `2026-09-06-init-behind-setup` · **Plan**
[`docs/plans/2026-09-06-init-behind-setup/`](../../plans/2026-09-06-init-behind-setup/index.md)
· **Reverses**
[`2026-09-06-init-owns-the-first-commit.md`](./2026-09-06-init-owns-the-first-commit.md)'s
re-run doctrine (*"`init` must be run at regular interval"*, and the **When to
run it again** section it produced) and
`plugins/vwf/skills/doctor/references/stack-checks.md:212-215`, *"`/vwf:setup`
is not the remedy"* · **Umbrella**
[`2026-09-05-vwf-init-and-the-repo-shape.md`](./2026-09-05-vwf-init-and-the-repo-shape.md)

## What was decided before

Two things, both from 2026-09-06, both one release old.

**`init` was a command a user typed.** Its frontmatter carried an
`argument-hint` (`[--new | --existing] [target-dir]`) and no `user-invocable`
key, so it sat in the `/` menu; `skills-and-agents.md` described it as "User
**and** model-invocable, for setup's seam"; and its **When to run it again**
section told the user, in the second person, when to re-run it. `/vwf:setup`
offered it as a convenience for the repo that reached setup first — that offer
was explicitly *"for the **absent** shape"*.

**Setup was not the repo-shape remedy.** `stack-checks.md` said so in those
words: setup "checks whether the repo is shaped and offers `/vwf:init`, and
materializes no tooling itself". Doctor printed `/vwf:init` once for every §5
shape row.

**And `init` slugified project ids silently.** `new-repo.md` §7 resolved each id
from a three-source preference order — the registry, a sub-project directory,
the repo's own name — slugged it per the stack adapter's `assets/ids.md`, and
wrote the `p:<slug>:*` groups, the aggregator's member flags, the `setup-<id>`
aliases and `REPO_NAME` from the result. Nothing was shown, and nothing was
asked. The only confirmed value in the whole pipeline was the licence
`<HOLDER>`.

## What changed

The user's feedback after `/vwf:init`'s first release (`vwf-v19.13.0`, staged
2026-09-06, never tagged), verbatim:

> When detecting the project name to generate `p:<project-name>:*`, take user's
> consent with an option to customize by user

> Disable user invocation of this skill and let it be invoked by `vwf:setup`
> skill. I want to reduce the number of user invocable skills, since there are
> quite a few they are confusion users.

Asked whether the five other called-by-a-skill command skills should hide too,
the user ruled: *"Limit to init, stackgen-stack-menu, stackgen-stack-template
only"*.

**The sixth question.** `init` now asks six, and the second is the ids. One
list: the repo's own name first, then a row per project it will write a task
group for, each row carrying three things — the **name** the repo spells, the
**id** it slugifies to, and the **source** the name came from, in §7's own
words. Naming the source is the point of showing it: a row a user disagrees with
is usually a row whose source they did not expect. The answer is accept, or a
replacement for any row; a replacement is slugged by the same rule and shown
once more **only if slugging changed it**. Nothing downstream re-derives an id,
and nothing is written before the answer — not a `p:<slug>:*` group, not a
member flag, not a shell alias, not `REPO_NAME`. The slug rule itself did not
move: `plugins/stackgen/assets/ids.md` still owns it and both consumers still
cite it, per
[`2026-09-06-project-ids-are-slugged.md`](./2026-09-06-project-ids-are-slugged.md).
This decision wraps a consent *around* that rule and changes nothing *in* it.

**The fourth invocation mode: skill-invoked.** `user-invocable: false` **and**
`disable-model-invocation: false`, with no `paths:`. Hidden from the `/` menu,
reachable by the skill that owns the seam. Both keys are load-bearing together:
`disable-model-invocation: true` would remove the skill from the model's context
entirely and make setup's call a **silent no-op** rather than an error, and
`user-invocable: false` without it would be the auto-applying-doctrine state
minus its `paths:`. Three skills are in it — `init`, `stackgen-stack-menu` and
`stackgen-stack-template`. `init`'s `argument-hint` is gone with it: a hidden
skill has no user to hint, it takes no arguments at all, and shaping a different
repository means running `/vwf:setup` there.

**Setup is the one door, and it opens on drift too.** Step 0 asks two questions
now, not one: is the shape *there* (all three unconditional slugs in the
adapter's lockfile), and is it *current* (the four predicates under **"The repo
shape against its baseline"** in doctor's `stack-checks.md` — pack versions,
project ids behind the generated surfaces, the `develop`/`main` pair, the
repo-name environment key). Setup **cites** those predicates and reads the same
artifacts; it restates none of them, so the two can never drift apart. Anything
missing or behind reaches the same offer. A decline is a recorded deferral whose
unlock is now `/vwf:setup reshape`.

**`/vwf:setup reshape`.** One word, and setup skips the mode fork entirely:
`init` runs — surveying, showing its one plan, taking its own consents — its
report prints verbatim, and setup stops. No validation, no stamp, no doctor, no
commit. A re-shape never touches `.config/vwf.yaml`, so a user who wants both
runs `/vwf:setup` again afterwards. Setup gains `argument-hint: "[reshape]"`;
`init`'s mode flags and target directory are **not** forwarded through it.

**Doctor's one remedy is `/vwf:setup reshape`.** Every §5 shape row shares it,
printed once with the rows underneath, and the `stack-checks.md` finding for a
repo with no `.config/mise*.toml` at all prints the same line at the same
severity. The argument is what separates it from the config-side nudge: plain
`/vwf:setup` reconciles what the config declares, `reshape` reconciles the
shape. Doctor still applies nothing — the consent to re-shape a repo is `init`'s
to take behind the door.

**Rule 9 asserts the pair.** `scripts/src/check.ts`'s stack-adapter rule now
requires both literal lines — `disable-model-invocation: false` and
`user-invocable: false` — on both adapter skills of every plugin keyworded
`vwf-stack-adapter`, in both directions. The explicit `false` is asserted rather
than the mere absence of `true`, because absence is not a claim about the one
thing vwf depends on. `stackgen-stack-template` keeps its `argument-hint`: it
costs nothing on a hidden skill and documents the one argument the caller
passes. `init` carries the same pair as one skill's choice, not a contract, so
rule 4 and `claude plugin validate` are all that check it — a general
called-only rule was deliberately not written.

## Rejected

Every alternative the plan's assumed-decisions table weighed and turned down:

| Decision                                      | Rejected                                                                                                                                            |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| What "called-only" is, in frontmatter         | `disable-model-invocation: true` (setup's call would silently no-op); folding `init` into `setup` as a reference — the user said "invoked by setup" |
| The sixth question's mechanics                | `init` restating the slug rule; an editable plan row (init's plan has no revise loop)                                                               |
| How Step 0 detects drift                      | duplicating doctor's four predicates in setup                                                                                                       |
| Doctor's absent-shape remedy                  | a distinct remedy per severity                                                                                                                      |
| `init` mentions in other skills and pack docs | renaming `init`; scrubbing every mention — "init" as the actor that lays a file down stays                                                          |
| Who owns rule 9's `checks.md` text            | the docs unit — the rule and its doc land in one commit                                                                                             |
| Argument hints                                | forwarding `[--new \| --existing] [target-dir]` through setup                                                                                       |
| The decisions doc                             | two docs, one per reversal                                                                                                                          |
| The rule 9 test                               | replacing the explicit-line assertion — the existing one is kept, and the new one added beside it                                                   |

## What stays outside

- **The three `vwf:import-*` skills stay user-visible.**
  `vwf:import-design-system`, `vwf:import-screens` and
  `vwf:import-conversations` exist only to be called by `/vwf:design-system`,
  `/vwf:screens import` and `/vwf:feedback canvas`, and the user's reason for
  hiding `init` applies to them word for word. The user limited the scope; the
  reason was not stated, so it should be asked rather than assumed to have been
  scope alone. Rule 8, the design-adapter twin of the rule 9 change, is
  untouched with them.
- **`plugins/stackgen/assets/ids.md` is not edited.** The consent wraps the
  rule; the rule does not move.
- **`init`'s `[target-dir]` is not forwarded.** The user chose "Drop both; init
  detects mode in cwd". A different directory means running `/vwf:setup` there.
- **No general checker rule for called-only skills.** One skill is not a
  contract.
