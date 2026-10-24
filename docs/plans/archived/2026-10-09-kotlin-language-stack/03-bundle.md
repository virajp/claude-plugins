# U3 — the kotlin-library bundle

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/kotlin-library.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/stacks/bundles/swift-package.md` (the
  pattern) and `plugins/stackgen/assets/pack-format.md:348-410` — read only.

## Ruling

> - Decision K2: The bundle covers only Kotlin/JVM libraries (JAR). The Android
>   library module (AAR) is in plan B. Kotlin Multiplatform is out of scope.
> - Decision K10: The bundle is `kotlin-library.md`: kind `language-bundle`,
>   platform `packages`, no `default: true`. Pins: `language/kotlin@0.1.0`,
>   `package-manager/gradle@0.1.0`, `toolchain-gate/ktlint@0.1.0`,
>   `toolchain-gate/detekt@0.1.0`. Each pack starts at `0.1.0`.

## Edits

1. **`plugins/stackgen/stacks/bundles/kotlin-library.md`** — frontmatter in the
   shape of `swift-package.md`: `name: kotlin-library`, `axis: project`,
   `kind: language-bundle`, `platforms: [packages]`, `components:` the four pins
   of K10, no `default:` key. Body: when to pick it (a Kotlin/JVM library
   published as a JAR), what each component brings, and that an Android library
   module (AAR) or an Android app is a later bundle — say "not yet covered"
   without naming a plan path.

## Verification

- `mise run p:plugins:check` (rule 14: no new default).
- The full wave gate after the orchestrator regenerates the inventory (the pins
  must match the packs' `0.1.0`).

## Guardrails

- Do not touch any file outside Owns.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (K13):
`feat: kotlin language stack — packs, bundle, init row, supersets`.
