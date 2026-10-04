# U7 — Gates (no bump)

- **Wave:** 4
- **Depends on:** U6
- **Owns:** —
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

> D9 — None: the chain's unreleased vwf minor and stackgen major, and site
> `1.1.50`, already cover the intent.

## Edits

1. Confirm D9 holds: `git tag --list 'vwf-v*' 'stackgen-v*' 'site-v*'` and the
   manifests (`plugins/vwf/.claude-plugin/plugin.json`,
   `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`) show vwf
   at least one minor above its latest tag, stackgen at least one minor above
   its latest tag, and the site at least one patch above its latest tag. If any
   does not, return `UNRESOLVED:` naming it — a bump would then be needed, and
   this plan does not authorise one.
2. Run every Wave gate line with `MISE_ENV=dev` exported. Edit nothing.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `git status --short` is clean after the run.

## Guardrails

- No version edit, no generator run, no tag, no `p:plugins:release`, no
  `p:site:release`.

## Commit

None — this unit changes no file. When a gate line reformats a file, report it
as a `GAP:` line instead of keeping the change.
