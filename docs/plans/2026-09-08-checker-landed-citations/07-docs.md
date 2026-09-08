# U7 — Docs: thirteen rules, the widened rule 4, the bundle-pin ruling, the decisions doc

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5, U6
- **Owns:** `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/plugin-authoring/**`, `.claude/skills/*-plugin/**`,
  `site/src/content/docs/**`, `readme.md`,
  `plugins/stackgen/assets/pack-format.md`,
  `docs/memory/decisions/2026-09-08-landed-pack-files-cite-nothing-by-path.md`
- **Model:** opus
- **Read first:** the wave-1 diff summary the orchestrator passes (the
  `docs-reconciler` findings plus every `DOCS FALSIFIED:` line), then each
  passage listed below in place. Do not load `CLAUDE.md` or the vwf manual
  whole; open the cited line ranges.
- **Lazy-load:** `scripts/src/check.ts` (the new rule's doc comment, to quote
  its doctrine accurately), `scripts/src/inventory.ts` (the new throw messages).

## Ruling

Quoted from index.md:

> **7. Bundle pins.** The inventory generator throws on a component ref that is
> malformed, names no `stacks/<type>/<slug>/pack.yaml`, or pins a version
> differing from that pack's `version`; `@generated` refs are skipped. The
> ruling is written into `pack-format.md`'s Rules section beside "a pack is
> copied, never referenced in place".
>
> **15. A decisions doc.** U7 writes
> `docs/memory/decisions/2026-09-08-landed-pack-files-cite-nothing-by-path.md`
> recording decisions 1–3 and 7 so recall finds them.

And the doctrine the docs must now state (decisions 1–6, 8–10 of index.md): rule
13 refuses, in a pack's landed tiers (`skills/`, `agents/`, `rules/`, `hooks/`,
`config/`, `conventions.md`, and `bundles/*.md`), the literal
`${CLAUDE_PLUGIN_ROOT}`, a bare `assets/…md` path, a `../` climb out of the
file's own skill, and a path into a sibling pack — because those files are
copied verbatim into a repo that has no plugin, where each resolves to nothing
silently; a bare `<type>/<slug>` component ref is an identifier and stays legal;
rule 6 no longer scans landed tiers; rule 4 now parses pack skills and pack
agents.

## Edits

1. **`.claude/skills/plugin-authoring/references/checks.md`**
   - `:29` heading "## The twelve rules" → thirteen; add item 13 after item 12,
     in the same voice: what it refuses, why each form is separately matched,
     the bare-ref exemption, the fence stripping, and that it is the second rule
     (after 12) to report a line number.
   - `:42-46` rule 4: state that it now covers pack skills and pack agents under
     `stacks/*/*/`, and why (they are what lands).
   - `:52-53` rule 6: state that it skips landed tiers, which rule 13 owns.
   - `:140-152` "The plugin-root trap (rule 6)": extend with the landing-side
     trap — inside the plugin every citation resolves, after landing none does —
     and point at rule 13. This section's prescribed fix ("name the contract and
     rely on the caller having it") is the rewrite doctrine; say so.
   - `:13` the `plugins:inventory` gate row: add "and every bundle pin resolves
     to a pack at that version".
   - In passing, since this file is owned: the gates table may note that
     `plugins:check` also runs `claude plugin validate --strict` over the
     marketplace and each plugin when `claude` is on PATH (a parked doc slip;
     one sentence, optional).
2. **`.claude/skills/plugin-authoring/SKILL.md`** — `:103` ("rule 11 covers a
   stackgen pack's payload scripts from the other end"): add that rule 13 covers
   the payload's *prose* — no plugin-relative citation survives landing — and
   rule 4 its frontmatter. Keep the fold width.
3. **`CLAUDE.md`** — `:62` and `:145`: twelve → thirteen; `:145` sentence gains
   one clause naming rule 13 as the newest ("rule 13 refuses a plugin-relative
   citation in anything a pack lands"); `:142-144` (`plugins:inventory`): add
   that `--check` also fails a bundle pin that names no pack or a version the
   pack no longer carries. `CLAUDE.md` **is** dprint-formatted: run
   `mise x -- dprint fmt CLAUDE.md` after editing and accept the re-padded table
   rows.
4. **`.claude/docs/repo-shape.md`** — `:69`, `:148`: twelve → thirteen;
   `:140-147`: inventory's throw conditions now include the pin resolution;
   `:166-169`: rule 4 scoped to plugin and pack skills/agents, rule 6 scoped to
   non-landed files, and a rule-13 clause in the enumeration. Formatted by
   dprint; run it.
5. **`.claude/skills/stackgen-plugin/SKILL.md`** — `:204-206` ("the generator
   throws on a `kind` that `assets/kinds.md` does not define"): add the pin
   rule. The "Authoring a pack" section gains one bullet: **a landed file cites
   nothing by plugin path** — the four forms, the bare-ref exemption, the
   role-name convention, and that `plugins:check` rule 13 enforces it. The "Two
   scripts" section's sentence that rule 6 "follows only a plugin's own
   `hooks/hooks.json`" stays true; leave it.
6. **`.claude/skills/vwf-plugin/SKILL.md`** — `:41`: twelve → thirteen. `:157`
   stays true.
7. **`plugins/stackgen/assets/pack-format.md`** — Rules section (`:256-285`):
   two new bullets beside "A pack is copied, never referenced in place":
   - **A bundle pins the pack's current `version`.** `<type>/<slug>@<version>`
     must name an existing pack at that exact version, or `@generated`;
     `plugins:inventory` fails generation otherwise. Bumping a pack means
     re-pinning every bundle that names it — the bundle is the recorded
     composition, and `stackgen-sync` diffs on that version.
   - **A landed file cites nothing by plugin path.** Everything under `skills/`,
     `agents/`, `rules/`, `hooks/`, `config/`, plus `conventions.md` and a
     bundle's body, is copied verbatim into a repo that has no plugin, so
     `${CLAUDE_PLUGIN_ROOT}`, a bare `assets/…` path, a `../` climb out of the
     skill, and a path into a sibling pack all resolve to nothing there. Name
     the asset by role ("stackgen's secrets contract") or state its rule inline;
     a sibling component's conventions are "in this composition's template". A
     bare `<type>/<slug>` ref is an identifier and is fine. `plugins:check` rule
     13 enforces it. This file is `plugins/**/*.md`: **not** dprint-formatted;
     match the fold width by hand. It is not a landed tier, so it may keep its
     own `${CLAUDE_PLUGIN_ROOT}` citations.
8. **`site/src/content/docs/plugins/stackgen.md`** — `:747` (strict-YAML
   frontmatter as a generator/reviewer gate): add that the repo's checker now
   parses every shipped pack skill too. If a sentence there describes what a
   pack may cite, align it with bullet 7. Run `mise run site:check` if you
   touched a link.
9. **`docs/memory/decisions/2026-09-08-landed-pack-files-cite-nothing-by-path.md`**
   — new, in the shape of the neighbouring decision docs (read one, e.g.
   `2026-09-06-editor-fragments-inside-the-fence.md`, for the frontmatter and
   headings). Records: the landed-tier citation rule and its four forms with the
   bare-ref exemption (decisions 1–3), the bundle-pin rule (7), the ids.md
   invariant ruling (11), and the rejected alternatives — token-only scope,
   warn-on-mismatch, restating the slug rule.
10. **`readme.md`** — nothing expected; the survey found no rule count and only
    a link to the inventory. Confirm and leave it.
11. Apply every `docs-reconciler` finding and every `DOCS FALSIFIED:` line from
    wave 1 that is not already covered above.

## Verification

- `mise x -- dprint check CLAUDE.md .claude/docs/repo-shape.md .claude/skills/plugin-authoring/references/checks.md .claude/skills/plugin-authoring/SKILL.md .claude/skills/stackgen-plugin/SKILL.md .claude/skills/vwf-plugin/SKILL.md readme.md`
  clean.
- `grep -rn "twelve" CLAUDE.md .claude/docs .claude/skills/plugin-authoring .claude/skills/stackgen-plugin .claude/skills/vwf-plugin`
  returns only historical uses (e.g. "the eight rules that retired"), none
  stating the live count.
- `node scripts/src/check.ts` still green: `pack-format.md` is not a landed
  tier, and `plugins/stackgen/assets/**` is scanned by rule 12 only — no retired
  term introduced.
- `mise run site:check` green if `site/` was touched beyond prose.

## Guardrails

- Do not edit any `plugin.json`, generated file, `scripts/**`, or any landed
  pack file.
- Do not restate the checker's regexes in prose; describe the forms in words, as
  `checks.md` does for rule 12.
- `.claude/skills/**/SKILL.md` frontmatter is strict-YAML and drops the skill
  silently on error; touch only the body.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`docs: thirteen checker rules — landed pack files cite nothing by plugin path; bundle pins resolve`
— written by the orchestrator after the wave gate, not by the unit.
