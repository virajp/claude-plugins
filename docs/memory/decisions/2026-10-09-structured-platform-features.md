# Decision — an OS-specific feature inside a form-factor platform is a structured `features:` entry

**Date** 2026-10-09 · **Branch** `2026-10-09-os-feature-declarations` · **Plan**
[`docs/plans/2026-10-09-os-feature-declarations/`](../../plans/2026-10-09-os-feature-declarations/index.md)
· **Adds** the `features:` list to a flow platform file's frontmatter

## What was decided before

Platform tokens are form factors only, never vendors
(`plugins/vwf/assets/standard-flows.md:190-191`, with its corollary at
`:195-196`). Every OS or vendor difference inside one form factor was free prose
in the platform file's Platform deviations section
(`plugins/vwf/assets/templates/flow-platform.md:123-137`, and `:19-21`); the
Components section had no per-OS field (`flow-platform.md:85-88`). The SwiftUI
pack called device and OS features out of scope and routed them to a Platform
deviations entry and an availability check
(`plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/ios-ipados.md:68-72`).
The `2026-09-23-watch-tv-spatial-platforms` decision parked OS-specific features
for a dedicated plan; this is that plan.

This is **folder 1 of 2 for backlog item B58**. It lands the blueprint rules and
the iOS side; folder 2 (`2026-10-09-android-device-features`) adds the Android
device families. Neither folder finishes B58.

## The decisions

**Scope values (D1).** `scope` is the OS name from the platform doctrine: `ios`
now; `watchos`, `tvos`, `visionos`, `carplay`, `macos` later. Folder 2 adds
`android:<vendor>`. Rejected: free text; a closed enum in `registry.yaml`.

**A structured record (D2).** A `features:` list in the `flow-platform.md`
frontmatter, each entry carrying `name`, `scope` and `fallback`. Rejected: a
separate features document.

**No format bump (D3).** The change is additive, on the precedent of decision D4
in `2026-09-23-watch-tv-spatial-platforms`. Rejected: bumping the blueprint
format.

**The fallback is required (D4)** on every entry. Rejected: an optional
fallback.

**Enforcement by the reviewer (D5).** The blueprint reviewer returns a gap for a
missing fallback or an unknown scope, and the flow contract states the rule. No
new checker rule. Rejected: a `p:plugins:check` rule; a doctor finding.

**Any form-factor platform may carry entries (D6).** The stack rule covers iOS
only in this plan. Rejected: `mobile` only.

## The reversal

The standing rule kept OS and vendor differences as free prose in Platform
deviations. D2 makes an OS-specific feature a structured `features:` entry
instead; every other vendor difference stays a deviation. No vendor token is
added, so the form-factors-not-vendors rule still holds. **Confirmed by the user
on 2026-10-09.**

## Not in scope

Android device families (Samsung, OnePlus) — folder 2. Canvas frame sizes per
platform — parked, no folder yet. Android XR (`spatial`) — out of scope for B57
and therefore for this item.
