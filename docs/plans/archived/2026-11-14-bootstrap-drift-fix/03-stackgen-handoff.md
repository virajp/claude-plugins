# U3 — stackgen's bootstrap handoff matches docs/sync/vwf.md

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/sync/vwf.md` (the whole file, the one contract), `.../bootstrap/docs/design/bootstrap-config.md`.

## Ruling

D10: the handoff reads `docs/sync/tools/<tool>.md` for each tool. That path is
valid, with one exception: the claude tool's doc is
`docs/sync/tools/claude-tool.md`.

Facts of bootstrap today (from `docs/sync/vwf.md`):

- Tool verbs: `bootstrap: add [<tool>, …]` and `bootstrap: remove [<tool>, …]`,
  each followed by a `reason:` line. A name is a tool folder or a pack.
- Plugin verbs are unchanged: `bootstrap: add <scope> plugins [...]` and
  `bootstrap: remove <scope> plugins [...]`.
- The clone is `git clone --filter=blob:none`, not `--depth 1`.
- Paths in the clone: `repo/packs.toml`, `repo/tools/<tool>/tools.toml`.
- The plugin tables are `[tools.claude.plugins.<scope>]`.

## Edits

1. **`plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`**
   - Lines 30-36 (step 2): say "a clone with no file content until read"
     (blobless) instead of "a shallow clone", and change the command to
     `git clone --quiet --filter=blob:none https://github.com/virajp/bootstrap.git "$tmp"`.
   - Line 20: `tools/` becomes `repo/tools/`.
   - Lines 41-42 (step 3): `tools/packs.toml` becomes `repo/packs.toml`;
     `tools/<tool>/tools.toml` becomes `repo/tools/<tool>/tools.toml`. After
     `docs/sync/tools/<tool>.md`, add the D10 exception in one clause.
   - Line 60: `[claude.plugins.<scope>]` becomes
     `[tools.claude.plugins.<scope>]`.
   - Line 68: `bootstrap: add tools [<tool>, …]` becomes
     `bootstrap: add [<tool>, …]`.
   - Line 98: `bootstrap: remove tools […]` becomes `bootstrap: remove […]`.
   - Any other `add tools` or `remove tools` verb, or old path, in the file gets
     the same change.
2. **`plugins/stackgen/assets/ids.md`** line 63: `commit_scopes` becomes
   `[tools.git].commit_scopes`.

## Verification

- `mise x -- mise run code:format` passes.
- Over the two owned files, `grep -nF` finds none of: `--depth 1`,
  `add tools`, `remove tools`, `[claude.plugins`, `tools/packs.toml`.
- `grep -nF 'repo/tools/<tool>/tools.toml'` finds step 3 of the handoff.

## Guardrails

- Touch nothing outside the two owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change the handoff's steps, consent or commit rules; change only
  names, paths, verbs and the clone flag.
- Delete with `rm`, never `git rm`.

## Commit

`fix: stackgen's bootstrap handoff uses the current paths, verbs and keys`
