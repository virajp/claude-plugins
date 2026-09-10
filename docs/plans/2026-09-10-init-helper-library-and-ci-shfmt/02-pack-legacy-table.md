# U2 — The pack's legacy table maps the old print vocabulary

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
- **Model:** opus
- **Read first:** the owned file top to bottom, with care over `:82-114` (the
  library and the print vocabulary) and `:505-529` (the legacy table).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/_scripts/helpers`
  (read-only; the nine printers the rows point at).

## Ruling

From index.md's assumed decisions, verbatim:

> **2.** **Nine rows in the pack's legacy table**, applied by init:
> `print_normal` → `print_yellow`; `print_normal_wait` → `print_wait`;
> `print_green` → `print_success`; `print_green_wait` → `print_wait`;
> `print_yellow_wait` → `print_wait`; `print_red` → `print_error` (a red line
> moves to stderr — say so in the row's reason); `print_red_wait` →
> `print_wait`; `print_header_wait` → `print_header`; `print_subheader_wait` →
> `print_subheader`. `print_header`, `print_subheader`, `print_yellow`,
> `print_newline`, `print_warn`, `print_error`, `print_success` are unchanged
> and get no row. The mapping is a pack fact, so vwf's prose names no function.

And the reason it lives here, from the file's own preamble at `:507-509`: the
renaming is a fact about this task library, and vwf's prose names no tool.

## Edits

1. **`task-library.md`, the legacy table (`:514-524`)** — append the nine rows
   after the `_scripts/_checks` row, in the order the ruling lists them, using
   the table's existing three columns (`Was` / `Is now` / `Why it moved`), the
   `→` prefix in the middle column, and the existing fold and padding by hand.
   Each reason is one clause; the `print_red` row's reason says the line moves
   to stderr. Suggested reasons, to keep in one voice: the `_wait` variants
   collapsed into `print_wait` because an in-progress line has one colour; the
   colour-named printers became role-named ones (`print_success`, `print_error`)
   because a task says what happened, not what colour it is; `print_normal`
   became `print_yellow` because the vocabulary has no uncoloured line and a
   plain yellow line is its nearest.
2. **`task-library.md`, the preamble (`:507-512`)** — add one sentence after
   "Apply the rows top to bottom …": the print rows are how `/vwf:init` rewrites
   a repo's own tasks when it replaces a diverged `_scripts/helpers` with this
   pack's; a call to a name with no row here is flagged, never rewritten. Name
   no vwf pass number and no vwf file.
3. **`task-library.md`, `:82-86`** — after "A repo that grows a library of its
   own adds a sibling here rather than a directory", add one sentence: a repo
   carrying an older `helpers` of its own is not a sibling but a diverged copy,
   and the legacy table below is what maps its vocabulary onto this one.

## Verification

- `mise run plugins:check` green (rule 13 in particular: the file lands in no
  repo, so plugin-relative citations are allowed, but add none).
- `grep -c '^| .print_' plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  → `9` (the dot stands for the backtick that opens the code span in each row).
- `grep -n 'print_red' …/task-library.md` → the row, and its reason contains
  `stderr`.
- No line you wrote exceeds the file's fold width (`awk 'length > 80'` over the
  file lists only pre-existing table rows, which the file already lets run
  long).
- `mise run plugins:inventory --check` green — the inventory counts packs, not
  rows, so no regeneration is expected.

## Guardrails

- Do not touch the pack's `config/` payload — `helpers` is correct as shipped.
- Do not touch `plugins/vwf/**` (U3) or any doc (U4).
- `plugins/**/*.md` is **not** dprint-formatted: match the fold by hand; the
  table's padding is hand-kept too.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Write with Write/Edit, never a `cat` heredoc.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on any path.

## Commit

`feat(stackgen): the task library's legacy table maps the old print vocabulary`
— written by the orchestrator after the wave gate, not by the unit. Type `feat`
is in `.config/git-conventional-commits.yaml`'s list; scopes are unconstrained.
