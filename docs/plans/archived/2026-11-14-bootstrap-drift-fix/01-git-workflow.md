# U1 — git-workflow reads the current merge-model key

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/design/bootstrap-config.md` (lines 33-73) and `.../bootstrap/docs/sync/migrate.md` (the M34 table, about lines 788-798), only to confirm a key name.

## Ruling

D4, the user's answer, verbatim:

> New key only: Read only `[tools.git.branch.<b>]`. A repo in the old form
> reads as `direct` until a bootstrap sync migrates it, which is today's silent
> behavior.

D20, the user's answer to a rulings-review gap, verbatim:

> Name bootstrap init (Recommended): Any prose that names the migration says
> "run bootstrap init", the words bootstrap itself prints. D4's ruling (new key
> only) does not change.

D23, the user's answer to a rulings-review gap, verbatim:

> U1 and U5 rewrite (Recommended): U1 rewrites SKILL.md:156-158 and U5 rewrites
> vwf.md:3796-3797: code:precommit runs every hook over every file of the tree,
> with no flag. Nothing else in those passages changes.

D30, the user's answer to a rulings-review gap, verbatim. It narrows D23:

> Say tracked files only (Recommended): The rewrite says: it runs every hook
> over every file git tracks, with no flag; a new file is checked once it is
> `git add`-ed, or by the commit hook at commit. The clause "nothing has to be
> staged" is corrected to match.

D7: the same key rule appears in U2's files. In `teams` mode, agree the wording
with U2: the merge model of a branch is `merge_model` in the
`[tools.git.branch.<branch>]` table of `.config/bootstrap.toml`; an absent table
or key reads as `direct`.

## Edits

1. **`plugins/vwf/skills/git-workflow/SKILL.md`**
   - Lines 37-38 and 212-213: each names `merge_model` of `[branch.develop]` and
     `[branch.main]`. Change each table name to `[tools.git.branch.develop]` and
     `[tools.git.branch.main]`. Keep the sentences otherwise.
   - Line 223, inside `read_merge_model()`: change the yq expression from
     `'.branch[strenv(B)].merge_model // "direct"'` to
     `'.tools.git.branch[strenv(B)].merge_model // "direct"'`. Change nothing
     else in the function: the file test, `-p toml -o yaml`, the `pr`/`direct`
     normalization and the `|| return 1` stay.
2. **`plugins/vwf/skills/git-workflow/references/landing.md`**
   - Lines 18, 40-41 and 71-72: each names `merge_model` of `[branch.develop]`
     or `[branch.main]`. Change each to `[tools.git.branch.develop]` or
     `[tools.git.branch.main]`.
3. **`plugins/vwf/skills/git-workflow/SKILL.md`** lines 156-158: the passage
   says `code:precommit` reads the working tree's changed files, staged and
   unstaged. Rewrite it per D23: it runs every hook over every file of the
   tree, with no flag. Then apply D30 (tracked files only).
4. In both files, any other `[branch.` table name you find while reading gets
   the same change. Report each one under `CHANGED`.

## Verification

- `mise x -- mise run code:format` passes.
- `grep -nF '[branch.' plugins/vwf/skills/git-workflow/SKILL.md plugins/vwf/skills/git-workflow/references/landing.md` finds nothing.
- `grep -nF '.branch[strenv' plugins/vwf/skills/git-workflow/SKILL.md` finds only the line with `.tools.git.branch[strenv(B)]`.

## Guardrails

- Touch nothing outside the two owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width of the
  surrounding text by hand.
- Do not add a fallback to the old key (D4).
- Delete with `rm`, never `git rm`.

## Commit

`fix: git-workflow reads merge_model from [tools.git.branch.*]`
