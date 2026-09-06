# U1 — init: called-only, and the slug is confirmed before it is written

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/**` (`SKILL.md`, `references/new-repo.md`,
  `references/existing-repo.md`, `references/fragments-and-sections.md`,
  `references/readme-and-license.md`)
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/assets/ids.md` (the slug rule — cite, never
  copy); `plugins/vwf/skills/setup/SKILL.md:63-80` (the caller's seam — read
  only, U2 edits it); `.claude/skills/vwf-plugin/SKILL.md:132-134` (the
  invocation table — read only, U6 edits it).

## Ruling

The user, on the feedback that produced this plan:

> When detecting the project name to generate `p:<project-name>:*`, take user's
> consent with an option to customize by user

> Disable user invocation of this skill and let it be invoked by `vwf:setup`
> skill. I want to reduce the number of user invocable skills, since there are
> quite a few they are confusion users.

The user's answers in the interview: slug consent — *"A sixth pre-plan
question"*; init's arguments — *"Drop both; init detects mode in cwd"*; doctor's
and the doctrine's remedy line — *"`/vwf:setup reshape`, once"*.

From index.md's assumed decisions:

> **1.** `user-invocable: false` **and** `disable-model-invocation: false`, with
> no `paths:`. A fourth row, **skill-invoked**, in the vwf-plugin invocation
> table: hidden from the `/` menu, reachable by the skill that owns the seam.

> **2.** One question after question 1: each detected id, its slug, its source
> (registry / directory / repo name), the repo's own name → `REPO_NAME`. Accept,
> or type a replacement; a replacement is slugged by `assets/ids.md` and shown
> once more only if slugging changed it.

> **7.** init's `argument-hint` line is removed (it has no user to hint).

## Edits

1. **`SKILL.md` frontmatter (`:1-13`).** Add `user-invocable: false` beside the
   existing `disable-model-invocation: false` (`:12`) — keep the latter, do not
   reorder other keys. Delete the `argument-hint` line (`:9`). Rewrite the
   `description` so its first clause says what init does and its last says it is
   invoked by `/vwf:setup` — Step 0's offer or `/vwf:setup reshape` — and is not
   typed by a user. Strict YAML: no tabs, quote any value with a colon.
2. **`SKILL.md` — the invocation note.** Directly under the frontmatter, add a
   short blockquote in the shape the stackgen adapter skills use
   (`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:18`): both keys, why
   (`disable-model-invocation: true` would make setup's call a silent no-op;
   `user-invocable: false` is what keeps the `/` menu short), and that setup is
   the only caller.
3. **`SKILL.md` Step 0 (`:76-87`).** Remove any reading of `--new` /
   `--existing` / `[target-dir]`: mode is the table's detection alone, the
   target is the working directory setup runs in. If the table already detects
   without the flags, the edit is only to drop the override sentences.
4. **`SKILL.md` — the questions (`:123-158`).** "Five in all" (`:125`) becomes
   six. Insert **question 2 — the ids** immediately after question 1 (the repo
   name), renumbering the rest. It shows, as one list: the repo's own name and
   its slug (this is what `REPO_NAME` receives), then every project id init will
   create task groups for, each with its slug and its **source** named in the
   words `new-repo.md` §7 uses (registry / directory / the repo's own name). The
   answer is accept, or a replacement per id. A replacement is slugged by the
   rule in `${STACK_ADAPTER_ROOT}/assets/ids.md` (cite the asset as §7 does —
   never restate the rule) and, **only if slugging changed it**, shown once more
   for acceptance; an unchanged replacement is taken silently. State that the
   confirmed slugs are what the plan shows and what §7 writes — nothing
   downstream re-derives them. Keep "Ask them **before** presenting the plan"
   (`:157-158`) true for the new question.
5. **`references/new-repo.md` §7 (`:96-187`).** The three-source preference
   order (`:98-104`) stays as the way init **proposes** ids. The silent slugging
   at `:113-125` becomes: the slugs are the ones **confirmed in question 2**; §7
   consumes them and writes the four surfaces (task groups, aggregator flags,
   aliases, `REPO_NAME`). Keep the `ids.md` citation and the sentence "Read the
   asset; never re-derive the rule here". The repo-level slug at `:156-157`
   likewise reads the confirmed value, not a fresh derivation. Do not renumber
   sections; if a sentence must move, keep every `§7` cite in
   `existing-repo.md:134`, `:243` true.
6. **`references/existing-repo.md`.** Its id resolution (the step citing
   new-repo §7 at `:134`) consumes the confirmed slugs the same way. The "id
   source changed" rows keep their words; add that a slug the user replaced in
   question 2 is compared against the **confirmed** slug, so a customised id is
   not reported as drift on the next run. Where the file tells a user to run
   `/vwf:init`, it now names `/vwf:setup reshape`.
7. **`SKILL.md` — When to run it again (`:226-257`).** The moments stay. Every
   "run `/vwf:init`" becomes "run `/vwf:setup reshape`" (or, where the text
   describes doctor, "doctor prints `/vwf:setup reshape`"). The closing
   paragraphs (`:253-257`) already hand off to setup's offer; make them say
   setup's Step 0 also offers init when the shape has **drifted**, not only when
   it is missing, and that `reshape` forces the offer.
8. **Everywhere in the owned tree**, a passage instructing a user to type
   `/vwf:init` changes per decision 5 of index.md; a passage naming init as the
   actor stays. Grep the tree for `/vwf:init` and judge each hit.

## Verification

- `mise run plugins:check` green (rule 4 strict-YAML frontmatter;
  `claude plugin validate --strict` if `claude` is on PATH).
- `grep -c '^user-invocable: false$' plugins/vwf/skills/init/SKILL.md` → `1`;
  `grep -c '^disable-model-invocation: false$'` → `1`;
  `grep -n 'argument-hint' plugins/vwf/skills/init/SKILL.md` → nothing.
- `grep -n 'Six in all\|six questions' plugins/vwf/skills/init/SKILL.md` finds
  the count; `grep -c 'Five in all'` → `0`.
- `grep -n 'ids.md' plugins/vwf/skills/init/SKILL.md plugins/vwf/skills/init/references/new-repo.md`
  — the asset is cited from the new question and from §7; the slug rule's
  alphabet is written in neither file.
- `grep -rn '/vwf:init' plugins/vwf/skills/init/` — no remaining hit tells a
  user to type it.
- `pnpm exec markdownlint-cli2` is what pre-commit runs over these files; the
  wave gate covers it. Match the surrounding fold width by hand —
  `plugins/**/*.md` is **not** dprint-formatted.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/init/**`. `setup/`, `doctor/`,
  `readme/` and every doc are other units'; report what they must say as
  `DOCS FALSIFIED:` lines.
- Never edit `plugins/stackgen/assets/ids.md`; cite it.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Strict-YAML frontmatter: an unparseable header drops the skill silently
  (`.claude/skills/plugin-authoring/`). Re-read the header after editing.
- Checker rule 10: init names no technology; every file still comes from a pack.
  Do not name mise, git forges or an editor where the text does not already.
- Write files with the Write/Edit tools, not `cat` heredocs (`cat` is aliased to
  `bat` on this machine).

## Commit

`feat(vwf): init becomes setup's door — slug consent before p:<slug>:* is written`
— written by the orchestrator after the wave gate, not by the unit.
