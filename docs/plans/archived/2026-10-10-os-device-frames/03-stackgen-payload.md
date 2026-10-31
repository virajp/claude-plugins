# U3 — The `os:` key in the stackgen bundle format and payload

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/stackgen/assets/pack-format.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions; then both owned files,
  top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/stacks/bundles/dart-flutter.md` (a bundle's
  frontmatter — read only; U7 owns it).

## Ruling

> - Decision D3: A bundle's frontmatter declares an optional `os:` map,
>   `<platform>: [ <os> ]`, beside `platforms:`. The stackgen stack-template
>   payload passes it through. vwf keeps the one table that maps (platform, OS)
>   to a frame, so vwf names no technology.
> - Decision D14: One OS vocabulary for each platform, in `standard-flows.md`,
>   serves both the frames and the `features:` scopes: `mobile` `ios` `android`;
>   `tablet` `ios` `android`; `desktop` `macos` `windows` `linux`; `auto`
>   `carplay` `androidauto`; `watch` `watchos` `wearos`; `tv` `tvos`
>   `androidtv`; `spatial` `visionos` `androidxr`. Quest has no token, so it
>   gets the generic spatial frame.

## Edits

1. **`pack-format.md`** — in the bundle frontmatter shape (`:359`) and the prose
   after it (`:385-402`), add `os:`: optional, project axis only, a map from
   each platform in the bundle's `platforms:` list to the OS tokens it targets
   there, in the order the canvas shows them (the first is the primary). Each
   key must be in `platforms:`. List the tokens of D14 inline, since a landed
   pack file must not cite a vwf path (rule 13). A bundle with no `os:`, or a
   platform missing from it, gets vwf's generic frame.
2. **`stackgen-stack-template/SKILL.md`** — in the payload block (`:74-100`),
   add `os:` below `platforms:`, with the comment "project axis only — the
   bundle's `os:` map, passed through; omitted when the bundle declares none".
   Generated bundles may emit it under the same rule; no generator change.

## Verification

- The full wave gate, notably `mise run p:plugins:check`.
- `grep -n "os:" plugins/stackgen/assets/pack-format.md plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  finds a hit in each.

## Guardrails

- Touch nothing outside the two files. Never edit a bundle, a `pack.yaml` or
  `inventory.md` — U7 owns them.
- No `plugins/`, `CLAUDE_PLUGIN_ROOT` or vwf path citation in a file that lands
  in a target repo (rule 13).
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold width
  by hand. Keep every code span on one line.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.

## Commit

`feat: add the os map to the stackgen bundle format and template payload`
