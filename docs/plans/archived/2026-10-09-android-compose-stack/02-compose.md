# U2 — app-framework/compose

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/compose/**` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/kinds.md:519-600`, the whole
  `plugins/stackgen/stacks/app-framework/swiftui/` pack (the pattern), and
  `plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md` (the
  `renders:` shape) — read only.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md:418-463` (the `ux-gate`
  contract), `plugins/vwf/assets/harness.md` (goldens),
  `.claude/skills/plugin-authoring/references/checks.md`

## Ruling

> - Decision C1: The stack teaches Jetpack Compose only, with Material 3.
>   Views/XML is out of scope.
> - Decision C3: Roborazzi renders the screens. `test:golden` records and
>   verifies the goldens, and the `ux-gate` returns `renders:` in the shape of
>   the TypeScript `ux-gate`.
> - Decision C4: E2E tests are Compose UI tests on a headless emulator, run
>   through Gradle Managed Devices (`./gradlew connectedCheck`).
> - Decision C5: `app-framework/compose` (`native-ui`) holds the Compose
>   doctrine, the `ux-gate` and the goldens.
> - Decision C6: The new packs start at `0.1.0`.
> - Decision C7: The app doctrine is a ViewModel with StateFlow, Hilt,
>   Navigation Compose and Room. A Jetpack `integrations/` reference set follows
>   the SwiftUI pattern.

## Edits

1. **`pack.yaml`** — `name: compose`, `version: 0.1.0`, `type: app-framework`,
   `category: native-ui`, the kind the swiftui pack uses, no `platforms:`,
   `languages:` kotlin as `primary` with the facts plan A's `language/kotlin`
   declares, `harness:` `goldens` → task `test:golden`. Pass the kinds.md
   app-framework ownership test in a comment-free way the swiftui pack does (if
   the test fails for Compose, return `GAP:` with the reason and keep the type).
2. **`config/.config/mise/tasks/test/golden`** — executable bash:
   `./gradlew recordRoborazziDebug` with a `--record` flag, else
   `./gradlew verifyRoborazziDebug` (read Roborazzi's current task names through
   Context7).
3. **`skills/compose/`** — a router `SKILL.md` (strict YAML) and the 12
   app-framework topics in the swiftui split: state and recomposition, layouts
   and Material 3 theming, navigation (Navigation Compose), architecture
   (ViewModel + StateFlow, unidirectional data flow), DI (Hilt), persistence
   (Room), accessibility, previews, testing (unit, Roborazzi goldens, Compose UI
   tests on the emulator per C4), performance, and `integrations/` for Jetpack
   libraries (one reference each: Hilt, Room, Navigation, DataStore,
   WorkManager, Paging, CameraX — the topic-12 bar).
4. **`skills/ux-gate/SKILL.md`** — the fixed-name UI gate: runs the Roborazzi
   capture for each screen and state the flow names, writes PNGs named
   `<code>--<state>.png`, returns `rendered: ok|n/a`, findings, and the
   `renders:` list in the TypeScript `ux-gate`'s shape.
5. **`conventions.md`**.

## Verification

- `mise run p:plugins:check` passes for the new tree (rules 4, 11, 13, 17).
- The full wave gate after the orchestrator regenerates the inventory (C9).

## Guardrails

- Do not touch any file outside Owns; never edit `framework/android` (U1), plan
  A's packs, `inventory.md` or a bundle.
- Name other packs by name only, never by path (rule 13).
- Read each library's current docs through Context7 before writing its usage.
- Write files with the Write tool, never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (C9):
`feat: android compose stack — packs, bundles, supersets`.
