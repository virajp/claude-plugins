# U4 — repo-hygiene's SECURITY.md and CONTRIBUTING.md, dprint-clean

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/SECURITY.md`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files;
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`.

## Ruling

> **B5** — repo-hygiene's `SECURITY.md` and `CONTRIBUTING.md` are reflowed with
> the dprint pack's shipped config.

## Edits

1. Make a scratch directory under `/tmp`, copy the two files and the dprint
   pack's `dprint.json` into it, and run `dprint fmt` there with that config
   (`--config ./dprint.json`). This repo's own dprint config must never touch
   them (CLAUDE.md: payload is formatted only with the shipped config).
2. Copy the two formatted files back over the owned paths with the Write tool.
   The diff must be line breaks only — no word changed. The `<REPO_URL>`
   placeholder on `SECURITY.md:7` stays exactly as it is.

## Verification

- In the scratch directory, `dprint check --config ./dprint.json` exits 0.
- `git diff --word-diff=porcelain` on both files shows no added or removed word.
- `mise run p:plugins:check` passes.

## Guardrails

- Touch nothing else in repo-hygiene — `pack.yaml` is U7's.
- Never run this repo's `code:format --fix` on payload.
- Delete with `rm`, never `git rm`.

## Commit

`fix: repo-hygiene SECURITY.md and CONTRIBUTING.md pass the shipped dprint config`
