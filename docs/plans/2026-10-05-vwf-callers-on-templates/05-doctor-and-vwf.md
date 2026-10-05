# U5 — doctor, vwf assets and the other ignore writers

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/**`, and the
  ignore-writing passages in vwf skills other than init and setup (mockups,
  screens/screen-review, git-workflow's worktree setup — confirm with the facts'
  grep and name each file in `CHANGED:`)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/doctor/SKILL.md`;
  `references/{stack-checks,code-intelligence,harness-and-memory}.md`;
  `plugins/vwf/assets/{vwf-config,stack-adapter,stack-vocabulary,memory}.md`;
  plan 2's index.md (E1, E3, Template names).

## Ruling

> F2 — shaped = `.config/stackgen.yaml` with `format: 1`; old layout without it
> = plan 4's trigger.

> F6 — doctor runs `preview all` and `preview pack --slug <s> --dir <d>` per
> pinned pack; each returned row is a drift finding carrying its diff; the LLM
> says whether it looks like a deliberate local edit or a stale file; the remedy
> is `/vwf:setup reshape`. No `check`.

> F7 — `answers:` leaves `vwf.yaml` (`config_format` 23): `answers.secrets` and
> `answers.repos.<path>.forge` live in each repo's `stackgen.yaml`; `update_bot`
> retires. `members:` and `linkage:` stay — doctor checks `vwf.yaml` `members:`
> equals the base repo's `stackgen.yaml` `members`.

> F8 — mockups, screen-review and worktree-setup stop writing `.gitignore` and
> `.graphifyignore`; the lines are tool-config's universal ones.

> F11 — doctor's remedy reads `MISE_ENV=dev mise run setup:precommit`.

## Edits

1. **`references/stack-checks.md`** — the drift check (lines 556-565) per F6;
   the `tool-config mise add-tool` remedy (line 105) becomes "pin it in the
   pack's `templates/` mise file or the repo's own `conf.d/<project>/`"; the
   baseline predicates on `tool-config/*` records and renovate (lines 290-300)
   become F2 plus the asset paths; marked-position predicates (lines 446-452,
   531-549, 613-618, 639, 653) read `stackgen.yaml` values; `tools*.toml` pin
   drift (lines 668-675, 720) reads `conf.d/_base/` and `conf.d/<pack>/`; a new
   predicate for F7's `members` agreement.
2. **`SKILL.md`** (lines 178, 214-216), **`references/code-intelligence.md`**
   (lines 16, 37 — F11), **`references/harness-and-memory.md`** (line 56) —
   names corrected.
3. **`plugins/vwf/assets/vwf-config.md`** — `config_format` 23: the `answers:`
   block (lines 123-128) removed from the schema with a retirement note beside
   the existing ones (lines 647-674); `members:`/`linkage:` (lines 62-73)
   unchanged. **`stack-adapter.md`** (lines 289, 373-379, 411-413),
   **`stack-vocabulary.md`** (line 56), **`memory.md`** (line 249) — `values:`
   for `machine_env`, `pack`/`pack-remove` for `tool-config:` lists, F2 for
   `source: tool-config/`.
4. **The other ignore writers** — remove each skill's `.gitignore` /
   `.graphifyignore` write, leaving a one-line note that tool-config's universal
   file carries it.

## Verification

- `rg -n "update.bot|renovate|apply-entries|machine_env|set-env|source: tool-config|tool-config check|MARKED POSITION|tools\.dev\.toml|shell_alias\.dev\.toml|env\.toml" plugins/vwf --glob '!**/init/**' --glob '!**/setup/**'`
  prints nothing.
- `rg -n ">> *\.gitignore|>> *\.graphifyignore" plugins/vwf` prints nothing.
- `mise run p:plugins:check` green.

## Guardrails

- Touch nothing outside Owns — init and setup are U3's and U4's.
- `plugins/**/*.md` is not dprint-formatted: match the fold width; code spans on
  one line.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf doctor previews for drift; vwf.yaml format 23 drops answers`
