# Decision — Flutter does not cover `webapp`

**Date** 2026-09-14 · **Branch** `2026-09-14-loose-ends` · **Reverses** the
five-platform coverage the `app-framework/flutter` pack and vwf's assets
declared, and the argument for it in the pack's
`skills/flutter/references/pick-and-trade.md` · **Partly reverses**
[`2026-09-13-consumer-gaps.md`](./2026-09-13-consumer-gaps.md) lines 53-55,
which widened the list to five — the count, not the `auto` platform that
widening added

## What was decided before

`app-framework/flutter` declared five platforms — `mobile`, `tablet`, `desktop`,
`webapp` and `auto`. The `dart-flutter` bundle carried the same list, titled
itself `mobile · tablet · desktop · webapp · auto` and said "one template, five
platforms". The pack's `pick-and-trade.md` argued Flutter's web build was an
acceptable trade, and its `deps/install` ran `flutter config --enable-web` so
the target was there. Across vwf, the stack-adapter contract, the config
doctrine, the registry template, `architecture-writer`, the platform vocabulary,
the topology references and the manual all said five.

## What changed

The pack is `0.4.0` and declares `platforms: [mobile, tablet, desktop, auto]`.
The bundle re-pinned it, narrowed its own list and now reads "one template, four
platforms". `pick-and-trade.md` inverts: a web surface is now a reason **not**
to pick this template — Flutter can build for the web, but the output is a
canvas-rendered application rather than a document, so a product with a web
surface pins a web stack for it, as a `site` or web-application project of its
own beside the app. The flutter skill's pin reasons that asserted a shipped web
surface were rewritten, and `deps/install` no longer enables the web target.
vwf's seven Flutter passages say four, and so do the two manual passages.

The platform **vocabulary** is untouched: `webapp` remains a valid frontend
platform, and every other stack that serves it still does. Only Flutter's
coverage narrowed.

## Why

A `webapp` is not merely a screen size. It is a project on the stylesheet axis —
vwf asks that round of exactly a project declaring `site` or `webapp` — and
stackgen's `contracts/web-head.md` binds any web framework pack serving one to a
head set, icon sizes, a manifest, robots and a sitemap. Flutter's web target
shares none of that stack: there is no stylesheet to answer for, no document for
a head to describe, and SEO, text selection and initial load all behave unlike a
web framework's. Declaring the platform promised a surface the pack does not
realize, and the promise was load-bearing — it is what put a Flutter project on
the stylesheet round it can never answer.

No new rule was needed to enforce the narrowing. The covering rule already says
a project's pinned template must cover every platform the project declares,
architecture offers only covering templates, and `/vwf:doctor` reports non-cover
as a **blocking** finding. Narrowing the pack's list is therefore the whole
mechanism; a framework-to-platform table in vwf, or a doctor predicate naming
Flutter, would have put a stack-specific rule in a stack-agnostic checker.

The level follows the consumer-gaps ruling that a platform-list widening is a
minor pack bump: this is its inverse and takes the same level, `0.3.0` →
`0.4.0`.

## What it costs, stated plainly

A product that already declared `webapp` on a Flutter project fails doctor's
cover check until it re-declares — either dropping the platform, or pinning a
web stack for that surface as a project of its own. Nothing migrates it: the
blocking finding *is* the migration notice, which is the same bargain every
platform rule in this toolkit makes.

The door is left open deliberately. The user's words were "As of now we will NOT
support Flutter for webapp" — *as of now*. If a pack ever realizes the web-head
contract over Flutter's web output, the platform comes back on a minor bump, the
same way `auto` arrived.
