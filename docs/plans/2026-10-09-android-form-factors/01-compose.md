# U1 — Compose: Wear OS, Android TV, Android Auto, Glance

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/compose/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** the whole `app-framework/compose/` pack (plan B), and
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/platforms/`
  (the pattern) — read only for the latter.

## Ruling

> - Decision F1: `kotlin-compose` gets `watch` (Wear OS), `tv` (Android TV /
>   Google TV) and `auto` (Android Auto / Automotive OS). `spatial` (Android XR)
>   is out of scope, and B57 finishes without it.
> - Decision F2: `app-framework/compose` gets
>   `platforms/{wear-os,android-tv,android-auto}.md` (Compose for Wear OS with
>   tiles and complications, Compose for TV with D-pad focus, the Car App
>   Library templates) and a Glance widgets reference. Version `0.1.0` →
>   `0.2.0`.
> - Decision F3: The `ux-gate` returns `rendered: n/a` for `auto` screens, with
>   a finding that gives the reason: Roborazzi cannot render Car App Library
>   templates.

## Edits

1. **`skills/compose/references/platforms/wear-os.md`, `android-tv.md`,
   `android-auto.md`** — one reference per form factor in the shape of the
   SwiftUI platform references: the UI library, navigation and input model,
   layout limits, the manifest feature, testing and goldens for that form
   factor, and what differs from `mobile`.
2. **`skills/compose/references/glance-widgets.md`** — Jetpack Glance app
   widgets.
3. **`skills/compose/SKILL.md`** — the router lists the new references.
4. **`skills/ux-gate/SKILL.md`** — `auto` screens: `rendered: n/a` with a
   finding naming the reason (F3); `watch` and `tv` screens render through
   Roborazzi at the form factor's device size.
5. **`pack.yaml`** — `version: 0.2.0`.

## Verification

- `mise run p:plugins:check` passes (rules 4, 13).
- The full wave gate after the orchestrator regenerates the inventory (F8).

## Guardrails

- Do not touch any file outside Owns; never edit a bundle or `inventory.md`.
- Name other packs by name only (rule 13). Read each library's current docs
  through Context7.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (F8): `feat: android form factors — wear os, tv, auto`.
