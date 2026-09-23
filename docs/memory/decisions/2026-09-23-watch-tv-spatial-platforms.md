# Decision — watch, tv and spatial are device screen platforms, and device viewports are overridable per product

**Date** 2026-09-23 · **Branch** `2026-09-23-watch-tv-spatial-platforms` ·
**Plan**
[`docs/plans/2026-09-23-watch-tv-spatial-platforms/`](../../plans/2026-09-23-watch-tv-spatial-platforms/index.md)
· **Adds** the `watch`, `tv` and `spatial` platform tokens and the
`design.viewports` config key

## What was decided before

The frontend role's platform vocabulary was closed at `packages`, `site`,
`webapp`, `desktop`, `mobile`, `tablet`, `auto` and `cli`. Its standing rule is
form factors, not vendors: `mobile` hides iOS and Android, and `auto` — added
additively in vwf 5.12.0 with no format bump — hides CarPlay and Android Auto.
watchOS, tvOS and visionOS had no token, so no stack could declare them. Each
device platform's canvas viewport was a fixed size in the Layout block of the
canvas conventions template, which `/vwf:screens prompt` regenerates.

This is **plan 1 of 2 for backlog item B56**, full Swift support for every app
type Xcode builds. Plan 2 is the Swift pack set, requires this plan, and carries
the backlog id; the public release is held for it.

## The decisions

**Three tokens, form-factor nouns (D2).** `watch` covers watchOS and Wear OS,
`tv` covers tvOS and Android TV, and `spatial` covers visionOS, Android XR and
Quest — the way `mobile` hides iOS and Android. Rejected: `wearable`, `tv` and
`xr`; vendor names `watchos`, `tvos` and `visionos`, which break the form-factor
rule.

**No pairing rule (D3).** Each of the three may be declared alone, since each
can ship as a standalone app. The `auto`-needs-`mobile` rule stays specific to
`auto`. Rejected: `watch` requires `mobile`; asking at architecture time.

**All three are device screen platforms (D5).** Store-shipped, in the device
column of the standard flows (`splash` and `home` mandatory), goldens required,
`deploy_template: []`, the app changelog applies, and outside the web-head
contract.

**Each carries its own interaction contract (D6)**, in the blueprint beside the
in-car rules `auto` carries, which they mirror: `watch` — glanceable screens,
the Digital Crown, complications, short sessions; `tv` — focus-based navigation
with a remote, the ten-foot distance, no touch; `spatial` — gaze and pinch,
windows, volumes and immersive spaces. Rejected: tokens only, with interaction
left to the design system.

**Every device platform keeps a default viewport, overridable per project
(D7).** The override is `design.viewports.<project>.<platform>: <W>x<H>` in
`.config/vwf.yaml`, in points, beside the canvas pin it sizes. It cannot live in
the canvas conventions file's Layout block, which is generated. It is
hand-edited — nothing writes it — and valid only for a device platform the
project declares; a malformed or off-platform entry is reported by `/vwf:doctor`
as a non-blocking finding and ignored, falling back to the default. The screens
skill, the canvas Layout block and both design adapters read the resolved size.
Rejected: a list of sizes per product (parked with the OS-specific-features
plan); an override for the new three only; a fixed default only; no default.

**Default sizes (D8).** `watch` 208×248 (a 46mm Apple Watch), `tv` 1920×1080
(the tvOS point grid), `spatial` 1280×720 (the visionOS default window), beside
the existing `mobile` 390×844, `tablet` 834×1194, `desktop` 1440×900 and `auto`
800×480. Rejected: the Ultra watch at 205×251, and a 4K TV.

**No format bump (D4).** The change is additive, on the precedent of `auto`;
neither `blueprint_format` (25) nor `config_format` (21) moves. Rejected:
bumping `blueprint_format` to 26.

## Not in scope

Flutter claims none of the three — it has no watchOS, tvOS or visionOS target
(D9). OS- and vendor-specific features inside one form factor, such as the
Dynamic Island inside `mobile`, are parked for a dedicated plan, together with
multiple frame sizes per platform.
