# U5 — stackgen's doctrine loses the unconditional bundle

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/{pack-format,taxonomy,output-tree}.md`,
  `plugins/stackgen/skills/{stackgen-stack-menu,stackgen-stack-template,stackgen-sync}/**`,
  `plugins/stackgen/stacks/readme.md`,
  `plugins/stackgen/agents/stackgen-skill-reviewer.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file at the lines index.md's Facts names;
  `grep -n 'repo-hygiene\|unconditional\|editorconfig\|hygiene' <file>` over
  each.

## Ruling

> - Decision 9: The `unconditional:` key retires everywhere — pack-format, the
>   menu's skip rule and empty case, init's fixed-slug fetch, the inventory
>   field and column, taxonomy, kinds, output-tree. Shaped means the
>   `tool-config/*` records are present.
> - Decision 10: The `repo-hygiene` kind retires (11 → 10 kinds).
> - Decision 2: Three new tools — `git`, `graphify`, `renovate` …
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`pack-format.md`** — :368-393 the `unconditional:` key and its prose go
   (the file-level `conditional:` stays); the bundle frontmatter example drops
   the key; :137, :158, :314 stop naming repo-hygiene (kind enum loses it; the
   vscode.d example names another pack); the shaped test names `tool-config/*`
   records alone.
2. **`taxonomy.md`** :52-59, :225-234 — the Repo-Hygiene-Bundle entry goes; the
   repo baseline is `stackgen:tool-config` plus init's own assets.
3. **`output-tree.md`** :138, :167 — `.editorconfig` leaves every allowlist
   tier; `.gitignore`, `.gitattributes`, `.graphifyignore`, `renovate.json` sit
   on the skill-lands tier, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE` and
   `.github/ISSUE_TEMPLATE/` on init's; :249 composition order drops
   repo-hygiene; :316-322 shaped test; :381 example names another pack.
4. **`stackgen-stack-menu/SKILL.md`** :27-43, :88-103, :107-111 — no skip rule
   and no unconditional empty case; every bundle is a menu entry.
5. **`stackgen-stack-template/SKILL.md`** :80 kind enum;
   **`references/materializer.md`** :86-91 root allowlist (as edit 3), :145-152
   composition order.
6. **`stackgen-sync/SKILL.md`** :120 composition order.
7. **`stacks/readme.md`** and **`agents/stackgen-skill-reviewer.md`** — any
   repo-hygiene kind or unconditional mention.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -rn 'repo-hygiene\|unconditional: true\|editorconfig'` over the owned
  paths returns nothing

## Guardrails

- `kinds.md` and `inventory.md` are U7's — do not touch them.
- `plugins/**/*.md` is not formatted: match the fold width by hand.
- No `git checkout`/`restore`.

## Commit

`refactor: stackgen doctrine drops the unconditional bundle` — written by the
orchestrator after the wave gate.
