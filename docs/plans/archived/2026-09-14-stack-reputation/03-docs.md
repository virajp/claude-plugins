# U3 — docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`
- **Model:** opus
- **Read first:** every `DOCS FALSIFIED:` line U1 and U2 returned; the survey
  list below; then each owned file you will edit, top to bottom.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` (the
  procedure); `site/CLAUDE.md` (the link rule and the gate);
  `plugins/stackgen/skills/stackgen-reputation/SKILL.md` (U1's output — copy the
  argument syntax and verdict names from here, never retype them).

## Ruling

Quoted from `index.md`:

> **1 — Placement.** One skill, `stackgen-reputation`, invocable by the user and
> by the model. The generator calls it at assemble (step 4) over every concrete
> name the component will emit — packages, runner-invoked tools, actions, images
> — and the verdict table is shown beside the reviewer's verdict at the dry-run
> consent gate. Shipped packs stay hand-curated.

> **3 — Block policy.** A `block` halts that component's generation with the
> verdict table; the user picks a replacement, which is checked in turn. The
> generator never swaps a name silently — a swap is a new recommendation.

No reversal was confirmed in the interview, so this unit writes **no**
`docs/memory/decisions/` doc.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings.
2. Apply every `DOCS FALSIFIED:` line U1 and U2 returned.
3. The survey's own list, checked whether or not docs-sync names them:
   - **`.claude/skills/stackgen-plugin/SKILL.md`** and its `references/` — the
     dispatch rule and the skill table: two adapter skills plus `sync` becomes
     those plus `stackgen-reputation`, with its invocation mode (user **and**
     model) named as the third shape; wherever the generator's pipeline is
     summarised, the vetting step and the block rule.
   - **`.claude/docs/plugins.md`** — stackgen's skill inventory.
   - **`site/src/content/docs/plugins/stackgen.md`** — the skills section (a
     short entry for `/stackgen:stackgen-reputation` with the argument syntax
     and the three verdicts), and the generator's description (vetting before
     the consent gate; a block halts).
   - **`readme.md`** — where it describes what stackgen generates; one sentence.
   - **`CLAUDE.md`** — the stackgen row in the Plugins table, only if it
     enumerates the skills; otherwise untouched.
4. Edit only what the change falsified. Do not improve adjacent prose.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green (rule 12 scans `.md` repo-wide).
- `command grep -rln 'stackgen-reputation' .claude/skills/stackgen-plugin/SKILL.md .claude/docs/plugins.md site/src/content/docs/plugins/stackgen.md`
  lists all three.

## Guardrails

- Do not touch `plugins/**` — every plugin file is U1's or U2's, landed.
- Do not touch `docs/backlog.md` — the backlog skill owns it; the archive step
  moves B10.
- Do not touch version files or `.claude-plugin/marketplace.json` — U4's.
- Delete with `rm`, never `git rm`.
- `readme.md`, `CLAUDE.md`, `.claude/**/*.md` and the site docs **are**
  dprint-formatted: let the formatter re-pad tables.
- Never end a table cell in a bare asterisk.

## Commit

`docs: stack reputation — the skill, the generator's vetting step` — written by
the orchestrator after the wave gate, not by the unit. Type `docs` is in
`.config/git-conventional-commits.yaml`; the file lists no scopes.
