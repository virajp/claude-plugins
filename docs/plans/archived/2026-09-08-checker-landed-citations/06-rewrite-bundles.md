# U6 — Rewrite the bundle bodies' citations

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/*.md`
- **Model:** opus
- **Read first:** every owned file that a grep below reports, top to bottom,
  before editing it.
- **Lazy-load:** the cited asset, read-only, when a rewrite must state its rule
  inline — `plugins/stackgen/assets/contracts/*.md`, `assets/output-tree.md`;
  `plugins/vwf/assets/delivery-pipeline.md` for the `npm-package` passage. Never
  edit anything under either `assets/`.

## Ruling

Quoted from index.md:

> **1. Rule 13 scope.** Refuse all four citation forms in landed tiers: (a) the
> literal `${CLAUDE_PLUGIN_ROOT}` anywhere, **pathless included**; (b) bare
> `assets/<path>.md`; (c) any `../` chain in a bundle; (d) a path into another
> pack.
>
> **2. Landed tiers** include `stacks/bundles/*.md`: a bundle's body lands as
> part of the body of `.claude/stackgen/templates/<slug>.md`
> (`skills/stackgen-stack-template/SKILL.md:40,92`).
>
> **8. Rewrite doctrine.** Name the cited asset **by role** when the sentence
> already carries its own reason; **state the rule inline** when the passage
> depends on the cited content. Never delete a sentence to satisfy the rule.
>
> **9. Canonical role names.** `contracts/<x>.md` → "stackgen's <x> contract";
> `output-tree.md` → "stackgen's output charter"; `taxonomy.md` → "stackgen's
> taxonomy"; `delivery-pipeline.md` → "vwf's delivery-pipeline contract".
>
> **10.** A path into a sibling pack becomes "the `<type>/<slug>` component's
> conventions, in this composition's template" (bare ref allowed).
>
> **12. `bundles/npm-package.md:31`.** Rewritten without the literal — "no path
> from this plugin spells vwf's root" — rather than exempted.

**Frontmatter is out of scope.** The `components:` refs (`<type>/<slug>@<ver>`)
are identifiers and must not change; U2 is adding a check that every one of them
resolves. Edit bodies only.

## Edits

The survey found 23 affected bundle files: 35 form-(b) hits (about one per
bundle, mostly a contract cited in the first paragraph), 4 form-(d) hits, and
the one pathless form-(a) at `npm-package.md:31`.

```sh
cd plugins/stackgen/stacks/bundles
grep -n 'CLAUDE_PLUGIN_ROOT' *.md
grep -nE '(^|[^A-Za-z0-9_./])assets/[A-Za-z0-9_./-]+\.(md|ya?ml)' *.md
grep -nE '(^|[^A-Za-z0-9_])(\.\./)+[A-Za-z0-9_./-]+' *.md
grep -nE '(^|[^A-Za-z0-9_./-])(app-framework|capability-provider|ci-system|cloud-provider|cloud-service|datastore|deploy-target|design-tool|framework|language|package-manager|repo-hygiene|toolchain-gate|toolchain-manager)/[a-z0-9-]+/[A-Za-z0-9_]' *.md
```

Skip a hit inside a fenced code block. Per hit, in order of preference:

1. **The sentence already carries its reason** — drop the path and name the
   asset by its canonical role, or drop the citation if the role adds nothing.
2. **The sentence depends on the cited content** — state that one fact inline
   and name the asset by role as its source.
3. **A path into a pack** — the decision-10 phrasing. In a bundle, every
   component named in `components:` lands in this same template, so "in this
   composition's template" is literally true.
4. **`npm-package.md:31`** — the passage argues that `${CLAUDE_PLUGIN_ROOT}`
   resolves to this plugin's root and nothing spells another plugin's, to
   justify not copying vwf's delivery-pipeline contract. Rewrite the argument
   without the literal: no path from this plugin spells vwf's root, so the
   contract is named — "vwf's delivery-pipeline contract" — and relied on from
   the caller that has it, never copied here.

Keep every sentence's meaning. Match the surrounding fold width by hand —
`plugins/**/*.md` is **not** dprint-formatted. Do not reflow a paragraph you did
not change.

## Verification

- The four greps above return nothing outside fenced blocks.
- `node scripts/src/check.ts 2>&1 | grep 'stacks/bundles/'` prints nothing once
  U1 has landed (concurrent — the greps are the check until then).
- `mise run plugins:inventory --check` reports the inventory up to date: you
  changed no frontmatter.
- No new rule-12 (retired vocabulary) finding in your Owns.
- `git diff --stat` touches only `plugins/stackgen/stacks/bundles/*.md`.

## Guardrails

- Never edit a bundle's frontmatter — not `components:`, not `unconditional:`,
  not `kind:`.
- Do not edit any pack directory (U3–U5's), anything under either plugin's
  `assets/`, or any doc.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.
- A hit you cannot rewrite without inventing doctrine is an `UNRESOLVED:`.

## Commit

`refactor(stackgen): bundle bodies cite contracts by role, never by plugin path`
— written by the orchestrator after the wave gate, not by the unit.
