# U3 — the import-* skills are hidden; their two callers say their names

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/import-design-system/SKILL.md`,
  `plugins/vwf/skills/import-screens/SKILL.md`,
  `plugins/vwf/skills/import-conversations/SKILL.md`,
  `plugins/vwf/skills/design-system/SKILL.md`,
  `plugins/vwf/skills/screens/SKILL.md`
- **Model:** opus
- **Read first:** the three `import-*` frontmatters (`:1-12` each) and their
  "must stay false" notes (`:18`/`:19`/`:20`); `design-system/SKILL.md:120-135`;
  `screens/SKILL.md:80-95`; `plugins/vwf/skills/init/SKILL.md:18-24` (the
  two-key doctrine, to cite in the notes).
- **Lazy-load:** `plugins/vwf/assets/design-adapter.md:20-35` (the spelling
  `/vwf:import-*` the callers must match).

## Ruling

From index.md's assumed decisions, verbatim:

> **3.** `user-invocable: false` + `disable-model-invocation: false` on all
> three — the `init` combination: out of the `/` menu, still callable. The "must
> stay false" notes stay. `skills-and-agents.md`'s "one — init — is
> skill-invoked" becomes four.

> **4.** `design-system/SKILL.md:128` and `screens/SKILL.md:87` name
> `/vwf:import-design-system` and `/vwf:import-screens`, matching
> `assets/design-adapter.md:27-29`.

> **5.** Rule 8 untouched.

The user: *"Hide them"*.

## Edits

1. **Each `import-*/SKILL.md` frontmatter** — add `user-invocable: false` beside
   `disable-model-invocation: false`, in the key order `init`'s frontmatter
   uses. Strict YAML: same indentation, no tabs, keys the loader knows.
2. **Each "must stay false" note** — extend by one sentence: `user-invocable` is
   `false` too, and why both together — hidden from `/`, still reachable by
   `/vwf:design-system`, `/vwf:screens import`, `/vwf:feedback canvas` (cite
   `init/SKILL.md:18-24` in its own words: a user-only skill vanishes from the
   model's context and the call becomes a silent no-op).
3. **`design-system/SKILL.md:128`** — `/<tool>:<tool>-import-design-system` (or
   whatever the stale spelling is) → `/vwf:import-design-system`.
4. **`screens/SKILL.md:87`** — the same, → `/vwf:import-screens`.
5. Nothing in `feedback/SKILL.md` (`:47` is already right; U1's file).

## Verification

- `mise run plugins:check` green — rule 9's twin checks nothing here, but the
  frontmatter loader must still see all three skills:
  `claude plugin
  validate --strict` passes inside `plugins:check`.
- `grep -c 'user-invocable: false' plugins/vwf/skills/import-*/SKILL.md` → 1
  each.
- `grep -rn '<tool>:<tool>-import\|-import-design-system\|-import-screens' plugins/vwf/skills`
  → hits only inside the `import-*` skills' own prose describing the pack side,
  if any; none in `design-system` or `screens`.
- `grep -n '/vwf:import-design-system' plugins/vwf/skills/design-system/SKILL.md`
  → one; `grep -n '/vwf:import-screens' plugins/vwf/skills/screens/SKILL.md` →
  one.
- Fold width by hand.

## Guardrails

- Do not touch `feedback/**` (U1), `archive/**` (U2), any doc (U4),
  `plugin.json` (U5), `scripts/**` (rule 8, decision 5).
- Frontmatter is strict YAML — a malformed key drops the skill silently; re-run
  `plugins:check` after every frontmatter edit.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`refactor(vwf): the import-* skills leave the / menu; their callers name them` —
written by the orchestrator after the wave gate, not by the unit.
