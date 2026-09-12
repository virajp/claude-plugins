# U1 — init's SKILL.md: resolve the members, plan per repo, report per repo

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom, before editing. Then
  `plugins/vwf/assets/membership.md` in full — it is the contract this unit
  cites and must not restate.
- **Lazy-load:** `plugins/vwf/skills/init/references/new-repo.md` §7 and §11,
  `references/existing-repo.md` "Plan" and "Report" (to keep heading names
  stable — U2 and U3 edit them, you do not);
  `plugins/vwf/assets/vwf-config.md:51-63`;
  `plugins/vwf/skills/doctor/SKILL.md:99-114` (the membership finding this unit
  refers to).

## Ruling

Quoted from `index.md`:

> **1** — init walks members itself: one survey across the base and every
> member, one plan with a section per repo, one consent, per-repo report
> sections.

> **2** — `.gitmodules` paths (walked recursively, as the pack's helper does)
> **union** the `members:` list in `.config/vwf.yaml`, deduped on realpath. A
> path in one source and not the other is reported as a membership disagreement,
> never shaped.

> **4** — Still seven rounds. Questions 2, 6 and 7 list one row per repo inside
> their single round (question 2 grouped by repo, each repo's own row first).
> Questions 4 and 5 are answered once and written into every repo. Questions 1
> and 3 apply per repo that resolved to mode new.

> **6** — A clone row inside the same plan —
> `git submodule update --init
> <path>` under submodules,
> `git clone <url> <path>` under siblings, per the membership asset — covered by
> the same yes; the member is then surveyed and shaped in the same run. A member
> with no clone source is reported as absent and uncloneable, with no row.

> **8** — Step 0's mode table is applied to each resolved repo on its own
> markers; a base can be existing while a member is new, and the plan says each
> repo's mode in its section.

> **10** — The base registry's `members[].projects` where the config declares
> them; else the member's own sub-project directories; else the member's name.
> Each member's own row carries its `REPO_NAME`.

> **12** — The ten file sections repeat under one heading per repo, base first;
> the git section prints the landing model once, then branches, commit and push
> one line per repo, then one `Gitlinks staged` line for the base.

> **13** — A second run on a fully shaped product prints an empty plan with a
> section per repo each reading nothing, and says the product is shaped.

Reversal 2, from the Goal: the hard rule "never writes outside the target repo"
becomes "never writes outside the repos it **resolved** as the base and its
members".

## Edits

1. **Hard rules.** Rewrite the "writes only what a pack declares" rule's framing
   and the idempotency rule so they read across the resolved repo set. Add the
   reversal-2 sentence where the target is first named. Keep every other hard
   rule's text; do not rename any bullet.
2. **Step 0 — Resolve the mode** becomes **Step 0 — Resolve the repos, then the
   mode of each.** Keep the heading text "Step 0" so cross-references hold.
   Replace `:102-105` ("The target is the repository the caller is already in…
   never operates on another directory. Shaping a different repository means
   running `/vwf:setup` there.") with: the caller's repo is the **base**; init
   resolves the base per the membership asset's five steps (a run started inside
   a member walks up to the base and runs from there — cite the asset, do not
   restate the steps); then resolves the **members** by ruling 2, stated in
   full, with the recursion and the realpath dedupe and the disagreement rule;
   then applies the mode table (unchanged) to **each** repo on its own markers
   (ruling 8). State that init still takes no arguments. Say the resolved set in
   one line before anything else: the base, each member with `present` or
   `absent`, and each repo's mode.
3. **Absent members** — a new short subsection under Step 0: ruling 6 verbatim
   in meaning, citing `assets/membership.md`'s sequence and naming the clone
   command per linkage as the asset names it. An absent member's section in the
   plan holds the clone row first and then reads "surveyed after the clone"; the
   survey of that member runs at apply time, immediately after the clone and
   before its own writes, and its rows are printed then. A member with no clone
   source (no `url:` under siblings, no `.gitmodules` url under submodules) is
   listed under **Deferred** with unlock "add the clone source".
4. **The questions.** Keep "Seven in all, each one round". Rewrite question 2 so
   the list is grouped by repo — each repo's own row first (name, slug, source
   "the repo's own name" or "the member's name"), then its projects (ruling 10
   for the source of a member's projects). Say each repo's own row is what that
   repo's `REPO_NAME` receives. Rewrite questions 6 and 7 to show one row per
   repo in the same round; question 7's default per row is that repo's own
   origin. Add one sentence to questions 4 and 5: answered once, written into
   every repo. Add one sentence to questions 1 and 3: asked for each repo that
   resolved to mode new, in one round listing those repos.
5. **The pipelines** table: both pipelines run **per repo**, members first, base
   last; say so in one sentence above the table and leave the rows.
6. **The report.** Replace the flat block with ruling 12: the ten file sections
   repeated under `── <repo> ──` headings, base first, each member by its path;
   then the git section — `Landing model` once, `Branches created`, `Commit` and
   `Pushed` one line per repo, then `Gitlinks staged <n>` for the base. Keep
   every section name and its counting rule. Keep the two next-step lines and
   their placement.
7. **When it runs again**: add one bullet — after a member is added or removed,
   or a member is cloned on a machine that lacked it. Add to the "empty plan"
   sentence: on a product, the empty plan has a section per repo (ruling 13).
8. Nowhere name a tool. Nowhere name a directory argument or a flag. Do not
   touch the frontmatter except that its `description` may gain "and every
   member repo it has" — keep it valid strict YAML.

## Verification

- `mise run p:plugins:check` green (rules 5, 7, 8, 11, 12 fire on this file).
- `grep -n "never operates on another directory" plugins/vwf/skills/init/SKILL.md`
  returns nothing; `grep -n "Shaping a different repository" …` returns nothing.
- `grep -c "Seven in all" plugins/vwf/skills/init/SKILL.md` is 1.
- `grep -n "Gitlinks staged" plugins/vwf/skills/init/SKILL.md` hits once.
- Every `references/<file>.md` link in the file still resolves.

## Guardrails

- Do not touch the four reference files — U2, U3 and U4 own them.
- Keep every existing heading's text; U2/U3/U5/U6 cite them.
- Cite `${CLAUDE_PLUGIN_ROOT}/assets/membership.md` by that token; never restate
  its resolution steps or its absent-member sequence.
- Strict-YAML frontmatter: a bad frontmatter drops the skill silently.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`feat: init resolves the members and plans one section per repo` — written by
the orchestrator after the wave gate.
