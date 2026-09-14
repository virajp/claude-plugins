# U5 — vwf says Flutter covers four platforms

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/assets/templates/registry.yaml`,
  `plugins/vwf/assets/topologies/repo.md`,
  `plugins/vwf/agents/architecture-writer.md`,
  `plugins/vwf/skills/architecture/references/platforms.md`,
  `plugins/vwf/skills/setup/references/topology-detection.md`,
  `plugins/vwf/assets/examples/blueprint/registry.yaml`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing — the passages
  are at `stack-adapter.md:195-196`, `vwf-config.md:74`,
  `templates/registry.yaml:45-46`, `topologies/repo.md:30-31`,
  `architecture-writer.md:115-117`, `platforms.md:23-25`,
  `topology-detection.md:98-100`; line numbers may be off by a few.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md:202-207` (the covering
  rule — read, never edit);
  `plugins/vwf/skills/doctor/references/stack-checks.md:221-231` (the cover
  check — not owned).

## Ruling

Decision 5: "Every vwf passage naming Flutter's five platforms says four; the
platform vocabulary itself is unchanged (`webapp` stays a valid frontend
platform for other stacks); doctor's existing cover check is what refuses a
Flutter project declaring `webapp`." Rejected: "a new doctor finding kind; a
framework-to-platform table in vwf".

The user's words: "As of now we will NOT support Flutter for webapp." vwf names
no technology as doctrine; the Flutter mentions in these files are examples of
the covering rule, and stay examples — with the right list.

## Edits

1. **`plugins/vwf/assets/stack-adapter.md:195-196`** — "one Flutter template
   covers mobile, tablet, desktop and webapp" → "mobile, tablet, desktop and
   auto". Where the sentence uses the count, "four".
2. **`plugins/vwf/assets/vwf-config.md:74`** — "Flutter template covers
   mobile+tablet+desktop+webapp+auto" → without `webapp`.
3. **`plugins/vwf/assets/templates/registry.yaml:45-46`** — the comment "five
   platforms (mobile, tablet, desktop, webapp, auto)" → four, no `webapp`. The
   per-role platform list at `:34-35` is the vocabulary and is **not** edited.
4. **`plugins/vwf/assets/topologies/repo.md:30-31`** and
   **`plugins/vwf/skills/setup/references/topology-detection.md:98-100`** —
   "mobile, tablet, desktop, web and auto… five platforms" → four, no web.
5. **`plugins/vwf/agents/architecture-writer.md:115-117`** and
   **`plugins/vwf/skills/architecture/references/platforms.md:23-25`** — the
   example `platforms: [mobile, tablet, desktop, webapp, auto]` →
   `[mobile, tablet, desktop, auto]`.
6. **`plugins/vwf/assets/examples/blueprint/registry.yaml`** — read it; if any
   project pins a Flutter template **and** declares `webapp`, drop `webapp` from
   that project (it would now fail the cover check the example is meant to
   pass). If no project pins Flutter, leave the file untouched and say so in
   `DECIDED:`.
7. `command grep -rn -i "flutter" plugins/vwf/ | command grep -i "webapp\|five"`
   — every remaining hit outside your Owns is a `DOCS FALSIFIED:` line (do not
   edit it); a hit inside your Owns is a missed edit.

## Verification

- `command grep -rn "webapp" <each owned file> | command grep -i flutter` is
  empty across the eight owned files.
- `command grep -rn -i "flutter" plugins/vwf/assets/stack-adapter.md plugins/vwf/assets/vwf-config.md plugins/vwf/assets/templates/registry.yaml plugins/vwf/assets/topologies/repo.md plugins/vwf/agents/architecture-writer.md plugins/vwf/skills/architecture/references/platforms.md plugins/vwf/skills/setup/references/topology-detection.md | command grep -c "five"`
  is `0`.
- `mise run p:plugins:check` green (the agent frontmatter of
  `architecture-writer.md` still parses).
- Fold width kept by hand; `plugins/**/*.md` is not formatted. YAML files keep
  their indentation.

## Guardrails

- Do not touch the platform vocabulary (`platforms.md:18-19`,
  `registry.yaml:34-35`): `webapp` remains a frontend platform.
- Do not touch the covering rule, doctor, the stylesheet-axis passages (already
  correct), the stackgen tree, or any doc under `site/`, `readme.md`,
  `CLAUDE.md`, `.claude/` — those are U3's and U6's.
- Do not add a rule, a table, or a new finding: the ruling is a list change.
- Delete with `rm`, never `git rm`; stage nothing.

## Commit

`refactor: vwf — the Flutter example covers mobile, tablet, desktop, auto` —
written by the orchestrator after the wave gate, not by the unit.
