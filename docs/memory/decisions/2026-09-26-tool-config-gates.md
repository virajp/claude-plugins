# Decision — stackgen:tool-config owns the gates

**Date** 2026-09-26 · **Branch** `2026-09-26-tool-config-gates` · **Plan**
[`docs/plans/2026-09-26-tool-config-gates/`](../../plans/2026-09-26-tool-config-gates/index.md)
· **Backlog** B66 (second piece of three), B72 (the gates side)

## What changed

1. **Content home.** The dprint, pre-commit, gitleaks and grype packs moved into
   `stackgen:tool-config`: each `config/**` became `assets/<tool>/**`, and each
   pack's conventions and skill became `references/<tool>.md`. The four packs,
   `bundles/repo-gates.md` and the `repo-gate` kind are gone.
2. **`all` lands five tools.** init calls `/stackgen:tool-config all` for mise
   and the gates, passing the commit scopes as `scopes=`. The skill fills the
   forge links from `origin`. init fetches only `repo-hygiene`.
3. **Pack calls.** A pack asks through `tool-config:` lines:
   `dprint add plugin`, `all add exclude [generated]`,
   `pre-commit add linter-ignore`, `pre-commit add hook`, `grype add ignore`.
4. **graphify.** The pre-commit config installs `post-commit`; a local
   `graphify-refresh` hook runs `code:graph`. This repo took it too.
   `setup:precommit` removes graphify's raw hook.
5. **Checker.** Rule 11 drops the `pre-commit.d` and whole-config parses; a pack
   `pre-commit.d` file is a finding, and so is a lone-tool exclude. Rule 15
   reads the skill's assets; a missing list is a finding.

## Base versus pack

| What           | Base                                                                     | Added by packs                                                                                                                      |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| dprint plugins | markdown, pretty_yaml, json, exec (taplo)                                | typescript; malva (stylesheets, astro, html); markup_fmt (astro, html); dockerfile (container-image, containers, cloud-run)         |
| Excludes       | `.claude .git graphify-out build dist *.lock`, plus `.config/mise/locks` | pnpm `node_modules .turbo *-lock.json *-lock.yaml`; uv `.venv`; swiftpm `.build .swiftpm`; swiftui `Derived DerivedData *.xcassets` |
| linter ignores | `build graphify-out .config/mise/locks`                                  | flutter `.dart_tool`; swiftpm `.build .swiftpm`; swiftui `Derived DerivedData`; uv `.venv`                                          |

`target` was dropped. A plugin or exclude several packs ask for is written once;
`remove` drops it when no requester is left.

## The reversals

- **The `pre-commit.d/` fragment contract** — retired; a pack calls
  `pre-commit add hook … for <pack>`.
- **The unconditional `repo-gates` bundle** — deleted; the four tools are the
  skill's.
- **The per-tool skills copied into target repos** — folded into
  `references/<tool>.md`, copied nowhere.
- **The base carrying every stack's excludes and ignores** — the base keeps the
  universal ones; each pack adds its own.

## What follows

T3 (`docs/plans/2026-09-26-tool-config-hygiene`) moves repo-hygiene, drops
`merge=graphify` and finishes B66 and B72.
