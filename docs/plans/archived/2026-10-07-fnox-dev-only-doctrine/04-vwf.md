# U4 — vwf templates state the secrets split

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/environment.md`,
  `plugins/vwf/assets/examples/blueprint/environment.md`,
  `plugins/vwf/assets/templates/conventions.md`, `plugins/vwf/assets/memory.md`,
  `plugins/vwf/skills/readme/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned file's passages named below, with enough of the
  surrounding text to keep its voice.

## Ruling

> D5 — vwf's `environment.md` template and example, and `conventions.md`
> template, stop saying "secrets manager for each environment
> (dev/staging/prod)": development values live in the development secrets
> manager, CI's in the forge, staging and production in the cloud provider's
> store. A unit that finds a live doppler mention inside its Owns removes it;
> doppler strays in `tool-config` files are left (bootstrap replaces them).

## Edits

1. **`assets/templates/environment.md`** (about `:14` and `:96`),
   **`assets/examples/blueprint/environment.md`** (about `:14`, `:76`, `:83`),
   **`assets/templates/conventions.md`** (about `:45`) — D5's split,
   tool-neutral: "the secrets manager" for development, "the forge's secrets"
   for CI, "the cloud provider's secret store" for staging and production.
2. **`assets/memory.md`** (about `:162`) — drop `- .doppler/` from the
   `exclude_patterns` template.
3. **`skills/readme/SKILL.md`** (about `:75`) — the example "(`.env.example`,
   doppler, mise `[env]`)": drop doppler.

## Verification

- `grep -rn -i doppler plugins/vwf` prints nothing.
- `grep -rn 'dev/staging/prod\|dev / staging' plugins/vwf/assets` prints
  nothing.
- `mise run p:plugins:check` green (vwf names no technology — the rule is
  enforced by `TOOL_TOKENS`); the full wave gate.

## Guardrails

- Touch nothing outside Owns.
- vwf names no technology outside the places it already does; never write
  "fnox", "keychain", "GitHub" or "GitLab" in vwf prose.
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: vwf templates state the secrets split by environment`
