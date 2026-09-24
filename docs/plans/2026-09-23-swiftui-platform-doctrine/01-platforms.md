# U1 — SwiftUI per-platform references

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** the landed swiftui router and topic files (for voice and
  depth), `plugins/stackgen/assets/artifact-doctrine.md`, and — for the
  interaction contracts —
  `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md` and
  `plugins/vwf/skills/blueprint/references/platforms.md` (read only).

## Ruling

Quoted from index.md:

- **E4** — "One reference per platform (iOS/iPadOS, macOS, CarPlay, watchOS,
  tvOS, visionOS) … Third-party integrations parked."
- **E18** — "Units resolve Apple framework behaviour through Context7 … before
  writing about it — never from training knowledge."

## Edits

One file per platform, each naming the vwf platform token it realises and the
interaction contract it must meet:

- `ios-ipados.md` — `mobile` and `tablet`: size classes, iPad multitasking,
  Dynamic Type; no vendor-specific feature doctrine (plan 1's P1);
- `macos.md` — `desktop`: windows, menus, keyboard, the settings scene;
- `carplay.md` — `auto`: CarPlay templates and the in-car rules;
- `watchos.md` — `watch`: glanceable screens, the Digital Crown, complications,
  standalone versus companion apps;
- `tvos.md` — `tv`: the focus engine, remote input, the 10-foot distance, top
  shelf;
- `visionos.md` — `spatial`: windows, volumes, immersive spaces, gaze and pinch,
  ornaments, RealityKit boundaries.

No API surface listings.

## Verification

- `mise run p:plugins:check` green.
- Exactly the six fixed `platforms/` filenames exist.

## Guardrails

- Touch nothing outside Owns — the router is U3's, integrations U2's.
- Cite no plugin path (rule 13) — the vwf files are read for content, never
  linked.
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: SwiftUI per-platform doctrine — iOS, iPadOS, macOS, CarPlay, watchOS, tvOS, visionOS`
