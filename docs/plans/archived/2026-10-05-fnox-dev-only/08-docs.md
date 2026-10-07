# U8 — Docs and the decisions doc

- **Wave:** 3
- **Depends on:** U1, U4, U5, U6, U7
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-02-fnox-development-only.md`,
  `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
  (one line)
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`
  (standalone mode); `plugins/vwf/assets/memory.md` (the decisions doc shape);
  one recent file in `docs/memory/decisions/` as a model.

## Ruling

> D1 — fnox manages secrets for the development environment only. The OS
> keychain is the default provider; any single secret may instead reference a
> fnox-supported cloud store (mixed per secret). No encrypted secret ever enters
> a repo: no age, no KMS, no committed ciphertext.

> D4 — Staging and production never run mise or fnox — their secrets come from
> the cloud provider. CI's secrets come from the forge (GitHub or GitLab).

> D10 — Done by plan 2 of the template chain (`2026-10-05-tool-config-templates`
> E14): the pack, its bundle and its overlay are gone, and plan 4's sweep
> removed its names. A unit that still finds a live mention of doppler inside
> its Owns removes it; repos that materialized it are left untouched — no
> migration.

> D15 — Both reversals are recorded as
> `docs/memory/decisions/2026-10-02-fnox-development-only.md`; the 2026-09-06
> decision doc gains one "superseded in part by" line.

## Edits

1. Run `vwf:docs-sync` over the branch delta since the branch base (exclude
   `docs/plans/`) and apply its findings, plus every `DOCS FALSIFIED:` line the
   wave-1 units returned (the orchestrator appends them to this prompt).
2. **`site/src/content/docs/plugins/stackgen.md`** — `:237-242` ("three packs"
   deleted a curated skill, naming doppler) — fix the count and drop doppler;
   `:605-611` (fnox's repo-wide gate, the four conditions, the guard as the
   first shipped hook script) — rewrite for D1 and D5; `:732-733` and `:927`
   (doppler examples) — use fnox or a neutral name; `:1274` ("the secrets
   providers") — singular. Leave `:1222` and `:1373` (history).
3. **`site/src/content/docs/how-to/operate/choosing-your-stack.md:118-119`** —
   fnox is the development secrets provider; CI and deployed environments per
   D4.
4. **`site/src/content/docs/plugins/vwf.md:965`** — drop doppler's `.doppler/`
   example.
5. **`.claude/skills/stackgen-plugin/SKILL.md`** — `:227,230` drop doppler;
   `:386-391` "Two scripts" — the fnox guard no longer ships, fix the count and
   list. **`.claude/skills/vwf-plugin/references/skills-and-agents.md:27`** —
   drop doppler's `.doppler/`.
6. Write the decisions doc (D15): the ruling (D1, D4, D7, D10), the two reversed
   rules and their old rationale, the rejected alternatives (encrypt-into-git
   kept for staging; a guard hook; fnox in CI; keeping Doppler), and the cleanup
   path (D8, D9). Add to the 2026-09-06 doc one line under its header:
   superseded in part — CI no longer takes secrets from fnox — by the new doc.

## Verification

- `grep -rn -i doppler site/src/content/docs .claude readme.md CLAUDE.md` prints
  only the two history lines in `plugins/stackgen.md` and
  `.claude/docs/ci-and-releases.md:20`, which lists this repo's own toolchain
  (out of scope — the maintainer edits `.config` by hand).
- `grep -rn -i 'ciphertext\|encrypt-into-git' site/src/content/docs .claude`
  prints nothing.
- `mise run p:site:check` green; `mise run code:precommit` green (dprint re-pads
  tables); the full wave gate.

## Guardrails

- Touch nothing under `plugins/` or `docs/plans/`; a falsified passage there is
  a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: the manual and a decisions doc for development-only fnox`
