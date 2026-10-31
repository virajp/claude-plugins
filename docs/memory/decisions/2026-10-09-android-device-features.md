# Decision — Android device families are two named `scope` values, built behind a capability check, with no worked case

**Date** 2026-10-09 · **Branch** `2026-10-09-android-device-features` · **Plan**
[`docs/plans/2026-10-09-android-device-features/`](../../plans/2026-10-09-android-device-features/index.md)
· **Adds** `android:samsung` and `android:oneplus` to the `features:` scope
values on `mobile`, and the Compose pack's device-feature rule

## What was decided before

Folder 1 (`2026-10-09-os-feature-declarations`) made an OS-specific feature a
structured `features:` entry (`name`, `scope`, `fallback`) in a flow platform
file, named the iOS scope `ios`, and reserved the Android form
`android:<vendor>` for this folder (its decision D1). It parked the Android
device families here.

This is **folder 2 of 2 for backlog item B58**. It lands a piece of B58 and does
not finish it: the vendor worked cases and the canvas frame-size piece remain.

## The decisions

**Named scope values (D1).** `android:samsung` and `android:oneplus`, defined in
the mobile doctrine. Confirmed by the user. Rejected: any vendor string.

**Detection (D2).** A capability check; the vendor name is a label only.
Confirmed by the user. Rejected: a manufacturer check (`Build.MANUFACTURER`).

**Worked cases (D3).** None. No stable public API was verified for either
vendor, so the pack ships the rule only, and a case waits for verifiable
documentation. Rejected: a Samsung case from the unverified Galaxy Edge SDK.

**Fallback (D4).** Required on every entry, inherited from folder 1. Rejected:
an optional fallback.

**Blueprint scope check (D5).** The reviewer accepts only the values the
platform doctrine names for the platform. Rejected: accepting any `android:`
string.

## The vendor research, and why no worked case ships

The research ran at plan time. Samsung's Galaxy Edge SDK page
(`https://developer.samsung.com/GlxyEdge`) is old: it names widgets and service
components, not a current detection method, and no current Edge Panel SDK
capability check was confirmed. OnePlus has no public developer API, and it
dropped the Alert Slider in March 2025. With nothing verifiable for either
vendor, the Compose pack's phone-and-tablet reference ships the rule alone: the
platform's own feature test (`PackageManager.hasSystemFeature`, where a vendor
documents a flag — the rule does not claim any vendor does), the vendor as a
label, and the declared `fallback` where the check fails.

## Not in scope

The vendor worked cases (Samsung, OnePlus) — parked until documentation can be
verified. Canvas frame sizes per platform — parked, no folder yet. Android XR
(`spatial`) — out of scope for B57 and therefore for this item.
