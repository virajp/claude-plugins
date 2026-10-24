# U3 — Kotlin, Flutter and kinds.md

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/language/kotlin/pack.yaml`,
  `plugins/stackgen/stacks/language/kotlin/conventions.md`,
  `plugins/stackgen/stacks/language/kotlin/skills/kotlin/references/toolchain.md`,
  `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`,
  `plugins/stackgen/stacks/bundles/kotlin-library.md`,
  `plugins/stackgen/assets/kinds.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then every owned
  file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/package-manager/gradle/skills/gradle/references/locking.md`
  (the STRICT rule, read only),
  `plugins/stackgen/stacks/app-framework/compose/conventions.md` (read only — U2
  owns it).

## Ruling

> - Decision D1: Keep `type: app-framework` for Compose. `kinds.md` adds, after
>   the four-part test, the Compose case: the UI toolkit is the root when the
>   build SDK (AGP) is a `framework` member of the bundle.
> - Decision D9: The `manifest:` fact of the Kotlin and Compose packs is
>   `gradle/libs.versions.toml`. `settings.gradle.kts` stays the project marker.
> - Decision D10: Both Flutter entries take the `mise x -- <binary>` form:
>   kotlin-lsp `[x, --, kotlin-lsp, --stdio]`, the same as the Kotlin pack, and
>   dart-lsp `[x, --, dart, language-server, --protocol=lsp]`.
> - Decision D11: The Kotlin `conventions.md` tells the build to set
>   `LockMode.STRICT` and points to the Gradle skill's locking rule by skill
>   name, never by path.
> - Decision D12: Remove the Windows sentence at `toolchain.md:82-83` (no
>   Windows support). `kotlin-library.md:31`: the `setup:deps` tasks write the
>   lockfile of every project. `kotlin-library.md:41`: an Android library module
>   is the `android-library` bundle, an Android app the `kotlin-compose` bundle.
> - Decision D16: The dart-lsp entry is fixed in this plan, because it is the
>   same defect in the same file as gap 26.

This plan runs after `2026-10-18-packs-hand-off-to-bootstrap`, so the line
numbers in Facts can be stale: find each passage by its text. If the hand-off
already made an edit below, record it as `DECIDED:` and move on. In particular,
the hand-off can move the `setup:deps` tasks to bootstrap: then
`kotlin-library.md` names the task that writes the lockfile of every project as
the hand-off left it.

## Edits

1. **`assets/kinds.md`** — after the sentence "Where all four hold, the SDK is
   the root. Where they do not, it is an ordinary `framework` …", add one short
   paragraph for D1: the Compose case — the build SDK (AGP) owns the manifest
   and the build, so two of the four parts fail for the UI toolkit alone; the UI
   toolkit is still the root when the build SDK is a `framework` member of the
   same bundle, so the pair passes the test together. Name Compose with AGP as
   the example. Keep the bullets that follow.
2. **`language/kotlin/pack.yaml`** — the `manifest:` fact: D9. Never touch the
   `version:` line.
3. **`language/kotlin/conventions.md`** — where the file describes the
   dependency tasks and the lockfiles: one rule, D11 — the build sets
   `lockAllConfigurations()` with `LockMode.STRICT`, so a new module without a
   lockfile fails instead of resolving unlocked; "see the `gradle` skill's
   locking reference" by name.
4. **`language/kotlin/skills/kotlin/references/toolchain.md`** — remove the
   sentence that tells Windows users to install kotlin-lsp by hand (D12). If the
   paragraph then reads wrong, close it in the words around it.
5. **`app-framework/flutter/pack.yaml`** — the two `lsp_servers` entries: D10.
   Keep the extensions, the timeout and every other key.
6. **`bundles/kotlin-library.md`** — the lockfile sentence and the "not yet
   covered by a shipped bundle" sentence: D12. Never touch the pin line.

## Verification

- `grep -rn "x, kotlin@latest\|x, flutter@latest" plugins/stackgen/stacks/app-framework/flutter/pack.yaml`
  shows no hit.
- `grep -n -i "windows" plugins/stackgen/stacks/language/kotlin/skills/kotlin/references/toolchain.md`
  shows no hit.
- `grep -n "not yet covered" plugins/stackgen/stacks/bundles/kotlin-library.md`
  shows no hit.
- The wave gate lines `mise run p:plugins:check` and `mise run code:precommit`
  are green.

## Guardrails

- Touch nothing outside the six owned files. Never touch a `version:` line or a
  bundle pin.
- The Windows comment in
  `plugins/stackgen/stacks/language/kotlin/templates/.config/mise/conf.d/kotlin/mise.dev.toml`
  is out of scope.
- `plugins/**/*.md` is not formatted by a tool: fold by hand at the width of the
  lines around the edit. `pack.yaml` is strict YAML: keep the flow-sequence
  style the file uses.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns. Delete
  with `rm`, never `git rm`.

## Commit

`fix: point Gradle builds at the version catalog and correct the Kotlin and Flutter pack facts`
