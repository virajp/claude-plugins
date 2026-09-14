# U1 — vwf mints the `stylesheet` axis; config_format 19, blueprint_format 25

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-vocabulary.md`,
  `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/skills/architecture/SKILL.md`,
  `plugins/vwf/skills/architecture/references/stack-menu.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/skills/setup/references/format-lineage.md`,
  `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`
- **Model:** opus
- **Read first:** `stack-vocabulary.md` 60–95; `stack-adapter.md` 10–20,
  175–190, 215–260; `vwf-config.md` 25–45, 60–95, 138–200, 245–260, 540–560;
  `architecture/SKILL.md` 230–260; `stack-menu.md` whole; `materialize.md`
  28–84; `format-lineage.md` 30–140; `doctor/SKILL.md` 55–75, 168–200;
  `stack-checks.md` 25–60, 105–145.
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md` 35–51 (the `seo`
  token — read only, U2 edits it); `plugins/vwf/assets/design-adapter.md` (the
  shape `design`'s materialization follows — read only, for the parallel).

## Ruling

Decision 1: "A seventh vwf axis `stylesheet`, per project, mirroring `design` in
every rule: `projects.<name>.stylesheet: <slug>`, the slug is the config value,
required for a project declaring a `site` or `webapp` platform, absent
otherwise; `config_format` 18 → 19".

Decision 2: "Three shipped packs — `tailwindcss`, `stylex`, `plain-css` (tokens
as CSS custom properties, what this repo's site does) — plus stackgen's
`generate` door, which every menu carries". vwf names none of them: the menu
comes from the installed stack plugin, as on every axis.

Decision 14: "U1 writes both numbers in `vwf-config.md` (`config_format: 19`,
`blueprint_format: 25`), the `18 → 19` migration entry (which names the paired
blueprint bump), and both `format-lineage.md` rows; U2 writes
`assets/blueprint-format` and the blueprint-side files".

Decision 16: "The stylesheet round offers *defer this axis* like the technology
axes, recorded as `unresolved`; the `18 → 19` migration writes
`stylesheet: unresolved` on every project declaring `site` or `webapp` and
nothing else moves, so the materialize pass skips it, doctor reports it as a
deferred axis, and `/vwf:architecture` elicits it on its next run".

Decision 17: "A `site`/`webapp` platform file whose Screens rows carry no
`Metadata` block is `24` drift; the lineage row proposes one per row — `title`
from the Screen cell, `description` empty, `index: yes` for `site` and `no` for
`webapp`, `image: default` — and never auto-fixes".

Decision 9, for the migration entry's wording only: "A `Metadata` block per
Screens row on `site` and `webapp` platform files, headed by the row's code,
four fields: `title`, `description`, `index` (yes or no), `image` (default or a
slot). A `webapp` without `seo` pins `title` only; `blueprint_format` 24 → 25".

The user's words (2026-09-13, backlog B07): "Any web-based frontend (webapp or
site) can pick a stylesheet approach. Offer `tailwindcss` and `stylex`."

## Edits

1. **`stack-vocabulary.md`** (67–81) — the heading "The six axes" becomes "The
   seven axes"; the sentence "composed from six independent templates" and its
   pipe-separated axis list gain `stylesheet` at the end, and "the two tool axes
   as `design` and `cicd` pins" becomes "the three tool axes as `design`, `cicd`
   and `stylesheet` pins". Add the table row: **stylesheet** · per project · one
   · "The stylesheet approach and how the design-system tokens are realized, for
   `site` and `webapp` platforms".
2. **`stack-adapter.md`** — `:15` "The **six axes** (… per project, `repo` per
   repo)" → seven, `stylesheet` listed among the per-project ones; the enum at
   `:183` and `:248` gains `| stylesheet`; the passage at `:221` ("These two
   axes close that door, making six axes in all") becomes three axes and seven
   in all; the block at `:226-236` gains one paragraph after `cicd`'s sentence:
   `stylesheet` takes no `platforms:` either; it is required for a project
   declaring a `site` or `webapp` platform and absent otherwise, its value is
   the menu entry's slug, and — unlike `design` — its menu also offers *defer
   this axis*, recorded as `unresolved` (decision 16). State that the pinned
   entry materializes doctrine only — `conventions.md` and a skill — the way a
   `project`-axis framework component does, with no adapter skills of its own.
3. **`vwf-config.md`** — `:15` "the six axes `/vwf:doctor` checks" → seven.
   Schema heading `:38` → `(config_format 19)`; `:40` `config_format: 19`; `:41`
   `blueprint_format: 25`. After the `cicd:` key (`:91`) add
   `stylesheet: <slug>` with a comment in the house voice of the `design:` and
   `cicd:` comments: the STYLESHEET approach for this project's web surfaces;
   per project; a pin on the STYLESHEET AXIS (format 19), the value that menu
   entry's SLUG — one value, nothing to drift; required for a project declaring
   a `site` or `webapp` platform, absent for every other; `unresolved` when
   deferred; vwf names no approach — the menu is the installed stack plugin's.
   In "The three axis states" (`:138-197`) add `stylesheet` wherever the scalar
   axes are enumerated. In the migrations list, insert **before** the `16 → 18`
   entry (newest first, matching the file's order) a new bullet in that entry's
   exact shape, headed "18 → 19 migration (performed by /vwf:setup)": the key
   `projects.<name>.stylesheet` is added; for every project whose registry
   declares a `site` or `webapp` platform and whose config lacks the key, write
   `stylesheet: unresolved`; nothing else moves; a project with neither platform
   gets no key. State that `blueprint_format` moves with it, 24 → 25: a
   `site`/`webapp` platform file's Screens rows gain a `Metadata` block
   (decision 9's four fields), which is `24` drift when absent and is proposed
   per row per decision 17, never auto-filled. Keep the 13/17 sentence pattern
   the `16 → 18` entry uses.
4. **`architecture/SKILL.md`** (`:237-250`) — "composed from **six independent
   axes** (project / backing / deploy / design / cicd per project, repo per
   repo)" → seven, `stylesheet` added; "the `design` and `cicd` pins are the
   per-project keys of the same name" → the `design`, `cicd` and `stylesheet`
   pins. Add one sentence: the stylesheet round runs only for a project whose
   registry declares `site` or `webapp`, after the design round.
5. **`stack-menu.md`** — `:9` "Since format 19 a stack is composed from **six
   independent axes**" → the wording must not lose the historical "since format
   19" (that is the format that introduced axes); write "composed from
   independent axes — six since format 19, seven since config_format 19 of the
   *config* line (the `stylesheet` axis)" or clearer prose to the same effect,
   since the two "19"s are different lines and the sentence must say so. Add the
   table row: **stylesheet** · per project · stylesheet-axis entries ·
   `projects.<name>.stylesheet`. In the defer section (`:57-83`) the list
   "project, backing, deploy and repo rounds" gains "and stylesheet". Add a
   short `## The stylesheet round` subsection: asked only of a project with a
   `site` or `webapp` platform; menu entries are the installed stack plugin's
   stylesheet-axis bundles; record the slug or `unresolved`; the design-system
   is not consulted here — the pick is realization, the tokens are contract.
6. **`materialize.md`** — Inputs (`:31-36`): add `projects.<name>.stylesheet` to
   the list of axes read. The landing-list rule (`:62-80`) already covers "a
   scalar axis whose value is a slug"; add `stylesheet` to any explicit
   enumeration of scalar axes in the file.
7. **`format-lineage.md`** — two rows in the lineage table, kind `config-key`
   and `doc-section` respectively, no fan-out: (a) Retired: "no
   `projects.<name>.stylesheet` on a project declaring `site` or `webapp`" →
   Current: "`stylesheet: unresolved` — the axis config_format 19 introduced;
   nothing converts, the key is written so the deferred decision is visible";
   (b) Retired: "a Screens row on a `site`/`webapp` platform file with no
   `Metadata` block" → Current: "the block, blueprint_format 25 — propose per
   row: `title` from the Screen cell, `description` empty, `index: yes` for
   `site` / `no` for `webapp`, `image: default`; never auto-fix". Add `19` and
   `25` to whatever the file says about the two lines' current numbers.
8. **`doctor/SKILL.md`** — wherever the axis set is enumerated (`:60-72`,
   `:171-175`, `:192-196` and any other hit of `grep -n "cicd"`), add
   `stylesheet` beside `design`/`cicd`. No new finding class: a pin resolving to
   no menu entry is drift, a pin never materialized is *pinned, not
   materialized*, `unresolved` is a deferred axis.
9. **`stack-checks.md`** §5 (`:128-140`) — "**The six stack axes.**" → seven;
   the enumeration gains `stylesheet`; the list of pins checked gains
   "`projects.<name>.stylesheet`, whose slug is the config value itself and
   which is required only for a project declaring `site` or `webapp`". Leave
   `:112-113` (the loose `tailwindcss` framework match) as is — it is a
   language-frameworks check, not an axis check.

## Verification

- `mise run p:plugins:check` green.
- `command grep -rn "six axes\|six independent" plugins/vwf/` is empty.
- `command grep -c "stylesheet" plugins/vwf/assets/stack-adapter.md plugins/vwf/assets/vwf-config.md plugins/vwf/skills/doctor/references/stack-checks.md plugins/vwf/skills/architecture/references/stack-menu.md`
  is non-zero for each.
- `command grep -n "config_format: 19\|blueprint_format: 25" plugins/vwf/assets/vwf-config.md`
  shows both lines.
- `command grep -n "18 → 19" plugins/vwf/assets/vwf-config.md` hits once.

## Guardrails

- Do not touch `plugins/vwf/assets/blueprint-format`,
  `capability-vocabulary.md`, the templates, `blueprint-authoring/**` or any
  agent — U2 owns them.
- Do not touch `plugins/stackgen/**` — U3 and U4.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand; widen no table beyond its neighbours.
- Strict-YAML frontmatter: touch no frontmatter block.
- Every `${CLAUDE_PLUGIN_ROOT}` citation you write names a file inside
  `plugins/vwf/`.
- The two "19"s (blueprint-axes format 19, config_format 19) must never read as
  one number — say which line each time.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf — stylesheet axis, config_format 19, blueprint_format 25` — written
by the orchestrator after the wave gate, not by the unit.
