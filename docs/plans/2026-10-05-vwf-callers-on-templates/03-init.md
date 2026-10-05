# U3 — init on the renderer

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/init/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/init/SKILL.md` whole;
  `references/{new-repo,existing-repo,tool-configs,readme-and-license}.md`;
  `assets/hygiene/CONTRIBUTING.md`; plan 2's index.md (E1, Template names) and
  the landed `plugins/stackgen/skills/tool-config/SKILL.md`.

## Ruling

> F2 — A repo is shaped when `.config/stackgen.yaml` exists with `format: 1`. A
> repo with old-layout files and no `stackgen.yaml` is "shaped on the old
> layout" — plan 4's trigger; until plan 4 lands, setup and init say so and stop
> rather than reshaping it.

> F3 — init passes `--node true`. F4 — init passes `--external false`.

> F7 — `answers:` leaves `vwf.yaml`; `answers.secrets` and
> `answers.repos.<path>.forge` are passed to `all --secrets`/`--forge`;
> `update_bot` retires. `members:` and `linkage:` stay — init passes `--members`
> from `members:`.

> F9 — `--repo-name`, `--merge-model-develop`, `--merge-model-main` (defaults
> `direct`, `pr`), `--members`, `--scopes`, `--node true`, `--external false`,
> `--forge` (from `origin`'s host), `--secrets`. `--linkage`, `--runtimes`,
> `--update-bot` and init's renovate question go; mode detection uses F2.

User, verbatim: *"Split with recommendation for develop to be direct and main to
be pr"*.

## Edits

1. **`SKILL.md`** — the baseline step calls `/stackgen:tool-config all` with
   F9's flags (`preview` first inside init's one consent, then with
   `--answers`); mode detection by F2 (lines 61, 231); the merge-model and scope
   answers become flags, not marked positions (lines 118-126, 514-515, 657,
   667); the `answers:` write (lines 579-622) goes — secrets and forge become
   flags; no runtime list (line 393).
2. **`references/new-repo.md`** — the flag table (lines 82-115) rewritten to F9;
   the renovate/update-bot section (lines 143-197) removed; the `gitignore:`
   fallback requester (lines 293-295) and the `add-hook` example (line 335) go;
   the marked-position passages (lines 461-480) and merge-model rows (lines
   640-673) restated as values in `stackgen.yaml`; `machine_env` (line 497)
   gone.
3. **`references/existing-repo.md`** — every `tool-config all` call, the
   `all add-exclude` call (line 160), `.vscode` (line 114), renovate (line 234),
   `source: tool-config/` (line 480), marked positions (lines 491-562, 992-995),
   update_bot (line 629), scopes (lines 795-817) per F2/F7/F9; an old-layout
   repo is reported as plan 4's and not reshaped here.
4. **`references/tool-configs.md`** — what `all` lands, from tool-config's
   SKILL; the renovate policy (lines 47-75) goes.
5. **`references/readme-and-license.md`** (lines 27, 177-180) and
   **`assets/hygiene/CONTRIBUTING.md`** (lines 38-70) — `code:format:all`,
   `code:lint:all`, `code:check:all`; `.config/stackgen.yaml` for the merge
   models; no `env.toml`.

## Verification

- `rg -n "update.bot|renovate|apply-entries|add-exclude|add-hook|MARKED POSITION|marked position|machine_env|set-env|source: tool-config|--runtimes|--linkage|env\.toml|tools\.dev\.toml" plugins/vwf/skills/init`
  prints nothing.
- Every flag init's prose passes to `all` is in plan 2's E1 list.
- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/init/**`.
- `plugins/**/*.md` is not dprint-formatted: match the fold width; code spans on
  one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf init shapes a repo through tool-config all and stackgen.yaml`
