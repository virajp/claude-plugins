# U1 — The backlog bootstrap snapshots and restores Status across the trim

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files top to bottom; the plan's Facts section (the
  line pointers and what the API did on project #2).
- **Lazy-load:**
  `docs/memory/decisions/2026-09-19-backlog-status-vocabulary.md:40-72` (the
  ruling being corrected — read, never edited).

## Ruling

Decisions 1 and 2, quoted:

> **1.** The bootstrap's Status steps run in this order: (1) field-list —
> exactly the four, skip to `Group`; (2) item-list filtered to
> `Ready`/`In review` — any, stop as today; (3) **snapshot** — item-list, every
> item that has a `status` key, written as `<item-id>\t<status>` lines to a
> `mktemp` file, its path printed before the mutation; (4) the
> colour/description query; (5) the four-option replace mutation; (6) field-list
> re-read for the new option ids; (7) **restore** — for each snapshot line,
> `item-edit --single-select-option-id` with the new id of that name, one call
> per item; print the count restored. Any failed `item-edit` stops the verb
> naming the item and the snapshot path — the field is never left half-restored
> silently. An item with no `status` key is skipped on both sides.

> **2.** The reference states the hazard generically — **any** replace of a
> single-select field's option list reissues every option's id, kept names
> included, and an item's value is bound to the old id — so "step 2 is what
> makes it safe" becomes "the stop covers the removed options and the restore
> covers the kept ones; neither alone is safe".

## Edits

1. **`SKILL.md` — the bootstrap paragraph** (`:87-96`): after the sentence
   ending "it never moves an item itself", add that the replace also reissues
   the ids of the options it keeps, so the bootstrap snapshots every item's
   Status to a temp file before the mutation and writes each back afterwards; an
   item is never left without the Status it had. Keep "the reference specifies
   the procedure and both mutations". Fold at the neighbouring width.
2. **`references/github.md` — Bootstrap, the intro** (`:84-89`): one sentence
   stating the generic hazard of decision 2 — a replace reissues every option id
   and an item's value is bound to the old one — before the numbered steps.
3. **`references/github.md` — Bootstrap, the steps** (`:90-141`): renumber to
   the seven of decision 1. Today's 1 and 2 stay as 1 and 2. New **3**
   (snapshot): the `item-list` command with a `--jq` that emits
   `[.id, .status] | @tsv` for items that have a `status` key, redirected to
   `$(mktemp)`, and the sentence that prints the path before anything is
   mutated. Today's 3, 4 and 5 become 4, 5 and 6; in 5 (the mutation), replace
   "step 2 is what makes it safe" with the sentence of decision 2. New **7**
   (restore): read the snapshot line by line, map each status name to the id
   step 6 returned, run the per-verb Status edit
   (`item-edit --id <item-id>
   --project-id <project-id> --field-id <status-field-id>
   --single-select-option-id <id>`)
   per line, print "restored N of N"; a non-zero exit stops the verb naming the
   item id and the snapshot path. Give the one-line shell for the loop. State
   that an item with no `status` key is absent from the snapshot and untouched
   by the restore.
4. **`references/github.md` — Bootstrap, the closing sentence of the old step
   4** (`:137-139`): "Every option not sent … is deleted; that is the point of
   the trim" stays; the clause after it is decision 2's sentence.
5. **`SKILL.md` — the `close` verb** (`:163-164`): unchanged in substance —
   confirm "adding the option to the field first when it is absent" still reads
   as running the bootstrap, which now snapshots and restores.

## Verification

- `grep -n 'mktemp' plugins/vwf/skills/backlog/references/github.md` hits in the
  Bootstrap section, and `grep -n 'restore' …/github.md` hits at least twice
  (the step and the count).
- `grep -n 'step 2 is what makes it safe' plugins/vwf/skills/backlog/references/github.md`
  returns no hit.
- `grep -n 'snapshot' plugins/vwf/skills/backlog/SKILL.md` hits in the bootstrap
  paragraph.
- The Bootstrap section's numbered steps run 1–7 with no gap.
- `mise run p:plugins:check` green; `mise run code:precommit` green (run twice;
  the first pass may re-pad the plan folder's own `index.md`, which is the
  orchestrator's — leave it).

## Guardrails

- Touch nothing outside the two owned files.
- Do not run `gh` against GitHub; the commands are written, not executed.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width (≤ 80 columns).
- Strict-YAML frontmatter: keep every key and its quoting.
- No escaped backtick inside a code span; no table cell ending in a bare
  asterisk; no pipe character inside a table cell.
- Delete nothing; `rm` nothing.

## Commit

`fix: backlog — the trim snapshots every item's Status and restores it after the replace`
— written by the orchestrator after the wave gate. `fix` is in
`.config/git-conventional-commits.yaml`.
