# U7 — Gates

- **Wave:** 3
- **Depends on:** U6
- **Owns:** `.config/releases.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent, Release levels and Wave gate sections.

## Ruling

> - Decision D3: The file is `.config/releases.yaml`. It has one key for each
>   project, with the value `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key
>   reads as `NONE`. An absent file reads as all `NONE`.
> - Decision D13: U7 creates `.config/releases.yaml` with this plan's own levels
>   (`vwf: MAJOR`, `site: PATCH`). Only this one time does a unit write the
>   file. No `plugin.json` changes.

## Edits

1. **`.config/releases.yaml`** — create it with exactly:

   ```yaml
   # Pending release levels, one key per project: NONE, PATCH, MINOR or MAJOR.
   # Written by /vwf:execute at landing (highest level wins); cleared by the release tasks.
   vwf: MAJOR
   site: PATCH
   ```

   If the file already exists, raise each key only when the new level is higher,
   and never lower one.
2. Run no generator and bump no version: no `plugin.json`, no `package.json`, no
   `p:plugins:marketplace` write, no `p:i:version`, no `p:site:version`, no tag,
   no `p:plugins:release`, no `p:plugins:local`.
3. Pass the full wave gate.

## Verification

- Every wave-gate line in index.md, with `MISE_ENV=dev`.
- `git diff --name-only <base>..HEAD -- plugins/vwf/.claude-plugin/plugin.json .claude-plugin/marketplace.json`
  is empty.

## Guardrails

- Do not touch any file outside Owns.
- If `.config/releases.yaml` is not formatted as the formatter wants, accept the
  formatter's whitespace only; keep the keys and values.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`ops: record the release levels of the release-levels plan`
