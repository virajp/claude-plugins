# U2 — init writes its own hygiene and fetches no bundle

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md` whole;
  `references/{new-repo,existing-repo,fragments-and-sections,readme-and-license,tool-configs}.md`
  at the lines index.md's Facts names; the repo-hygiene pack's `conventions.md`
  :163-244 and its `config/` prose files as source material.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/SKILL.md` for the `all`
  keys.

## Ruling

> - Decision 1: Split by kind: the config files become tool-config tools; the
>   prose files and the VS Code baseline become init's own assets.
> - Decision 3: … init's fallback fetches a template only for a detected
>   language no pack covers, as a `gitignore:<Name>` block. … The template table
>   moves to `references/git.md`.
> - Decision 8: On adoption the git tool converts landed banner sections …
>   init's section merge is removed.
> - Decision 9: The `unconditional:` key retires everywhere — … init's
>   fixed-slug fetch … Shaped means the `tool-config/*` records are present.
> - Decision 11: `plugins/vwf/skills/init/assets/hygiene/` holds
>   `CONTRIBUTING.md`, `SECURITY.md`, `licenses/{MIT,Apache-2.0}.txt`,
>   `.github/ISSUE_TEMPLATE/*`, `.config/vscode.d/hygiene.jsonc`, laid out as
>   they land. The placeholder, licence and security doctrine moves into init's
>   reference. No lock record for them.
> - Decision 12: Stops landing. Reshape offers deleting a landed `.editorconfig`
>   byte-identical to the retired payload, inside its one consent; an edited one
>   is left as the user's.
> - Decision 13: Reshape replaces a `repo-hygiene/repo-hygiene` lock record with
>   `tool-config/{git,graphify,renovate}` records and renames a landed
>   `.config/vscode.d/repo-hygiene.jsonc` to `hygiene.jsonc`.
> - Decision 15: … init's pass 8 is removed and later passes renumbered.
> - Decision 16: init `SKILL.md:317` and the description stop naming fixed slugs
>   and bundles.
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`assets/hygiene/`** (new) — byte-copy from the pack's `config/`:
   `CONTRIBUTING.md`, `SECURITY.md`, `_licenses/*` → `licenses/*`,
   `.github/ISSUE_TEMPLATE/*`, `.config/vscode.d/repo-hygiene.jsonc` →
   `.config/vscode.d/hygiene.jsonc`. No `.editorconfig`, `.gitignore`,
   `.gitattributes`, `.graphifyignore`, `renovate.json`.
2. **`SKILL.md`** — description (:5-7) and the pack framing (:42-68): init calls
   `/stackgen:tool-config all` and writes its own hygiene assets; the only
   adapter fetch left is the secrets provider the user picked. :227 mode row and
   :317 name `tool-config/*` records only. :364-383 language keys feed the git
   tool's fallback, not a section merge. Questions :594, :614, :640-654 stop
   naming the hygiene pack. :741-752 drop the ignore-section merge (the
   editor-fragment merge stays). :754-774 baseline order: `all`, then init's
   assets, then the secrets provider.
3. **`references/new-repo.md`** — §2 :80-122 drops the hygiene fetch; §4
   placeholders use init's assets; §5 :289-317 becomes the git tool's fallback
   call for uncovered languages; :1019 names init's `CONTRIBUTING.md`.
4. **`references/existing-repo.md`** — pass 6 diffs against tool-config and
   init's assets, no bundles; pass 8 removed and later passes renumbered
   (cross-references in this skill follow); a reshape step for decision 12's
   `.editorconfig` offer and decision 13's lock-record migration and fragment
   rename; :610-621 names init's assets.
5. **`references/fragments-and-sections.md`** — the ignore-section half
   (:16-118) is removed, pointing at `/stackgen:tool-config`'s git tool; the
   editor-fragment half stays, its input now including init's `hygiene.jsonc`.
6. **`references/readme-and-license.md`** — retitled (the rest of hygiene is
   init's own); the placeholder vocabulary, licence and security rules from the
   pack's conventions :190-244 move in; "Copied as-is" is replaced: the
   attributes file is the git tool's, the update policy the renovate tool's.
7. **`references/tool-configs.md`** — the renovate row's owner is
   `stackgen:tool-config` (renovate tool); add rows for `.gitignore`,
   `.gitattributes`, `.graphifyignore` (owner the git or graphify tool).

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `grep -rn 'repo-hygiene\|unconditional\|editorconfig\|fixed slug' plugins/vwf/skills/init`
  returns only decision 12 and 13's migration text
- the pass numbers in `existing-repo.md` run without a gap, and every "pass N"
  citation inside `plugins/vwf/skills/init/` matches

## Guardrails

- Read the repo-hygiene pack; never edit or delete it — U7 does.
- Do not touch `plugins/vwf/skills/{setup,doctor}` — U3.
- `plugins/**/*.md` is not formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: init writes its own hygiene and fetches no bundle` — written by the
orchestrator after the wave gate.
