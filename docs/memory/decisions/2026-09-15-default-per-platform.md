# Decision — a bundle's default flag is unique per (axis, platform)

**Date** 2026-09-15 · **Branch** `2026-09-15-default-per-platform` · **Plan**
[`docs/plans/2026-09-15-default-per-platform/`](../../plans/2026-09-15-default-per-platform/index.md)
· **Widens** checker rule 14 and the stack-adapter contract; flags `astro-ssg`

## What was decided before

`default: true` in a bundle's frontmatter marks the entry vwf's architecture
menu preselects — highlighted, never assumed. The rule, written earlier on
2026-09-15 when the flag was introduced, was **at most one flagged bundle per
axis**: `p:plugins:check` rule 14 grouped `stacks/bundles/*.md` by `axis` and
refused a second, `stackgen-stack-menu` copied the key onto "that entry" of its
payload, and vwf preselected "whichever entry carries it". The design axis was
the only axis with a default — `claude-code`, the terminal as a design tool —
and no project-axis bundle carried the flag.

## What changed

**Two flagged bundles on one axis conflict iff either declares no `platforms:`
list, or their platform lists intersect.** The finding names both files and the
platform(s) they share, or the file that declares no list. An absent or empty
list means the bundle is offered on every round of its axis, so it conflicts
with every other flagged bundle there. An axis whose flagged bundles all declare
disjoint platforms may therefore carry one flagged bundle per platform.

**vwf preselects the one flagged entry among the entries it offers on a round**
— the list it has already filtered by the project's platforms. The menu payload
shape is unchanged: the flag is still copied verbatim from the bundle onto every
entry whose bundle carries it, never computed, and vwf still infers none. A flag
on an entry filtered out of the round highlights nothing there. Two flagged
entries reaching one round cannot happen when the adapter obeys its contract; if
it does, vwf highlights neither and falls through to the previous project's
answer.

**`astro-ssg` alone gains `default: true`.** Its `platforms: [site]` makes it
what a `site` project's architecture round highlights and nothing on any other
platform's round. It is one of the four Astro bundles
[`2026-09-06-astro-four-modes-four-bundles.md`](./2026-09-06-astro-four-modes-four-bundles.md)
made from the one `framework/astro` pack — the static one, built once and served
as files — and this decision makes it their default. No backend, `webapp`, `cli`
or other platform's bundle is flagged.

## Why

The request behind it: a plain-HTML static-site pack offered beside Astro, with
"Astro-SSG will still be the default". The survey found that default could not
be expressed. `astro-ssg` carried no flag, and under the per-axis rule flagging
it would have preselected a site stack on every project-axis round — the
backend's, the CLI's, the mobile app's — because the rule counted flags per axis
while the menu offers entries per platform. The mismatch is the defect: the menu
is filtered to a platform, so the uniqueness the preselect needs is per
platform, and a rule stricter than that cannot express a site default at all.

Not a reversal. The per-axis rule was written when the design axis was the only
axis with a default, and a design bundle declares no platforms. This widens the
rule for axes whose bundles declare platforms and leaves every other axis on the
rule as written — a bundle with no `platforms:` list still conflicts with any
other flag on its axis.

## The alternatives rejected

- **Strict per-axis, as written.** Cannot express a site default without
  preselecting it on backend rounds.
- **Per-platform only, ignoring unplatformed bundles.** An unplatformed flagged
  bundle is offered on every round of its axis, so it would overlap every
  platformed flag silently — exactly the file-order nondeterminism the rule
  exists to refuse.
- **vwf filtering by platform for the preselect.** It already filters the round;
  the preselect reads the filtered list and needs no second pass.
- **A new payload field.** Nothing new to carry — the flag, copied verbatim, and
  the round's own filter decide it together.
- **Flagging a default per platform across the board.** Nobody asked, and each
  is a separate ruling.

## What stands on it

The plain-HTML static-site pack plan, `docs/plans/2026-09-15-html-site-pack/`,
`requires:` this folder: it adds a second `site` bundle beside the four Astro
ones, and `astro-ssg` stays the preselected entry because the flag is now unique
per platform rather than per axis.
