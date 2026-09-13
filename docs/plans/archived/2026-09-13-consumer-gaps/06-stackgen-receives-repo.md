# U6 — stackgen receives the target repo

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/skills/stackgen-stack-template/references/generator.md:12-27`
  (the preconditions — read, never edit; unchanged);
  `plugins/stackgen/assets/output-tree.md:41,304-312` (the lockfile path and the
  shape test — read, never edit).

## Ruling

Decision 5: "The invocation's argument stays `<slug>`. The target repo travels
as one optional line beside the catalog paths, in the same payload style:
`repo: <path>` — the member's `path` relative to the base root, resolved as the
member whose `projects:` lists the project; absent means the current repo.
stackgen documents receiving it; the materializer writes there and keeps that
repo's own lockfile. Every vwf caller passes it under `multi-repo`."

Decision 6: "One landing per (repo, slug), deduped … stackgen's landing rule
("one landing set, one commit" per slug) is unchanged."

Reversal 1 (the caller list this skill names): "Materialization moves from
architecture to setup … architecture only records the decision and invokes setup
at its end."

From the request: "make sure the stackgen skill documents how it *receives* the
target repo (an argument, the cwd, or the payload) rather than only saying the
caller 'may name' it."

## Edits

1. **`plugins/stackgen/skills/stackgen-stack-template/SKILL.md`** —
   - `:139-142` "**The target repo is the current one by default.** In a
     multi-repo product the caller may name a member repo; each repo gets its
     own independent copies and its own lockfile — never one repo's copies
     pasted around." → keep the first and last sentences; replace "the caller
     may name a member repo" with **how**: the caller passes one optional
     `repo: <path>` line beside the catalog paths (the vwf stack-adapter
     contract's delegation protocol), a path relative to the current repo's
     root; when present, every read of `.claude/stackgen/…` in steps 1–3 and
     every write of the materializer resolve under that path, and the lockfile
     is that repo's `.claude/stackgen/lock.yaml`. Absent means the current repo.
     The argument itself stays `<slug>`.
   - `:31-32` (reads `.claude/stackgen/templates/<slug>.md` "at the repo root"):
     add "of the target repo (the `repo:` line, else the current one)".
   - `:3-8` the description: the callers stay `/vwf:architecture`, `/vwf:setup`,
     `/vwf:plan`, `/vwf:execute` **only if** the text says what each does;
     architecture now reads the menu and records a pin, **setup** is the
     first-pin materializer. Rewrite the description's first-pin clause so it
     does not say or imply architecture materializes. Keep it under the
     frontmatter's strict-YAML rules (a folded scalar, no unquoted colon
     trouble).
   - `:106-109` "**Dispatch is per component; landing is per bundle.**" —
     unchanged; add one sentence: a caller landing several slugs in one repo
     invokes this skill once per slug, and gets one consent and one commit per
     slug.
   - Do not change `argument-hint` — it stays `"<slug>"`.
2. **`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`**
   — `:9-15` inputs: "The target repo root — the current repo by default; in a
   multi-repo product the caller may have named a member repo instead" → "the
   current repo by default, or the repo the invocation's `repo: <path>` line
   names"; every later mention of "the repo root" for a write or the lockfile
   (`:166`) resolves under that root. The commit the materializer makes (`:272`,
   "a conventional commit message") is made **in that repo**; under
   `linkage: submodule` say the base's gitlink is left for the caller to stage —
   the materializer never commits in two repos.

## Verification

- `command grep -n "repo: <path>\|repo:" plugins/stackgen/skills/stackgen-stack-template/SKILL.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  hits in both.
- `command grep -n "may name a member repo\|may have named a member repo" plugins/stackgen/skills/stackgen-stack-template/**`
  is empty.
- `command grep -n 'argument-hint: "<slug>"' plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  hits once.
- `mise run p:plugins:check` green (rule 4 frontmatter; rule 9 the adapter skill
  still exists under the keyword; rule 13 nothing this skill **lands** gained a
  plugin-relative citation — these two files are not landed, so the rule does
  not apply to them, but confirm no `config/` payload was touched).

## Guardrails

- Do not touch `references/generator.md` — its preconditions are unchanged and
  correct.
- Do not touch `plugins/stackgen/stacks/**` (U1), `plugins/vwf/**` (U4, U5).
- Delete with `rm`, never `git rm`. Never `git checkout`, `git restore`,
  `git stash`, or a formatter `--fix` outside Owns.
- Strict-YAML frontmatter on `SKILL.md`: the description is a folded block —
  keep the indentation; re-read it after editing.
- `plugins/**/*.md` is not dprint-formatted — match the surrounding fold width
  by hand.

## Commit

`feat: the stack-template skill receives its target repo as a repo: line` —
written by the orchestrator after the wave gate, not by the unit. Bare type.
