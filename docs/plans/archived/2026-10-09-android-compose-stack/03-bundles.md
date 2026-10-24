# U3 — the kotlin-compose and android-library bundles

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/kotlin-compose.md`,
  `plugins/stackgen/stacks/bundles/android-library.md` (both new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/bundles/kotlin-library.md` (plan A),
  `plugins/stackgen/assets/pack-format.md:348-410` — read only.

## Ruling

> - Decision C6: `kotlin-compose` (kind `app-framework`, platforms `mobile` and
>   `tablet`, no default): `language/kotlin@0.1.0`,
>   `package-manager/gradle@0.1.0`, `toolchain-gate/ktlint@0.1.0`,
>   `toolchain-gate/detekt@0.1.0`, `framework/android@0.1.0`,
>   `app-framework/compose@0.1.0`. `android-library` (kind `language-bundle`,
>   platform `packages`): the same without `app-framework/compose`. The new
>   packs start at `0.1.0`.
> - Decision C1: The stack teaches Jetpack Compose only, with Material 3.

## Edits

1. **`kotlin-compose.md`** — frontmatter in the shape of `swift-swiftui.md` with
   the C6 pins and platforms, no `default:` key. Body: when to pick it (a native
   Android app in Kotlin with Compose), what each component brings, the
   platforms it covers today (`mobile`, `tablet`), and that `watch`, `tv`,
   `auto` and `spatial` are not yet covered — no plan path.
2. **`android-library.md`** — frontmatter in the shape of `kotlin-library.md`
   with the C6 pins for `android-library`. Body: when to pick it (an Android
   library module published as an AAR) versus `kotlin-library` (a plain JVM
   JAR).

## Verification

- `mise run p:plugins:check` (rule 14: no new default).
- The full wave gate after the orchestrator regenerates the inventory (the pins
  must match the packs' versions; plan A's packs read `0.1.0`).

## Guardrails

- Do not touch any file outside Owns. If a plan A pack does not read `0.1.0`,
  return `UNRESOLVED:` naming it.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (C9):
`feat: android compose stack — packs, bundles, supersets`.
