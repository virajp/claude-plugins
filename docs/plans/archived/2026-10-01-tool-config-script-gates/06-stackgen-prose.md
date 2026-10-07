# G6 — stackgen prose relays the script for the gate tools

- **Wave:** 3
- **Depends on:** G3
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/dprint.md`,
  `plugins/stackgen/skills/tool-config/references/pre-commit.md`,
  `plugins/stackgen/skills/tool-config/references/gitleaks.md`,
  `plugins/stackgen/skills/tool-config/references/grype.md`, the formatter and
  node passages only in
  `plugins/stackgen/skills/tool-config/references/mise.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file; G1's and G3's script modules.

## Ruling

> G3 — Tools run only as `mise x -- <tool>` … never `mise x <tool>@… --`.

> G4 — `all` = land every file → `MISE_ENV=dev mise run setup:all` → format and
> validate the files it wrote → record hashes. Trust is assumed.

> G5 — every written file passes through `mise x -- dprint fmt …`.

> G8 — node is pinned in the base `conf.d/tools.dev.toml`; the script runs as
> `mise x -- node …`.

## Edits

1. **`TC/SKILL.md`** — the four tools and the cross-tool exclude are now
   script-handled: drop them from the "still prose" list; describe the `all`
   sequence (G4), trust as a prerequisite, `mise x --` invocation, and run the
   script as
   `mise x -- node "${CLAUDE_PLUGIN_ROOT}/skills/tool-config/scripts/tool-config.mjs" …`
   (plain `node` only for the first `all` on a repo with no mise config). The
   flag shapes for the new verbs, including the trailing-`/` directory rule.
2. **`references/{dprint,pre-commit,gitleaks,grype}.md`** — rewrite the way plan
   1 rewrote `mise.md`: what the script does, for a human; the LLM's part (each
   `needs-edit` case and how to make it, then re-run `check`; helping a person
   word a grype `--reason`); keep the doctrine a person editing by hand needs.
   Fix B77's stale passage (`pre-commit.md:142-143`). Record the fold rule as
   "the shipped formatter decides", the post-merge refresh, and `always_run` on
   post stages.
3. **`references/mise.md`** — the node pin and the formatter step, those
   passages only.
4. **`materializer.md`** — mapping entries for every script-handled tool run
   through `apply-entries`; only git strings still take the prose path.

## Verification

- `grep -rn -E 'mise x [a-z@]' plugins/stackgen/skills` prints nothing.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- `references/git.md`, `graphify.md`, `renovate.md` are plan 3's.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand; keep code
  spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: tool-config prose relays the script for the gate tools`
