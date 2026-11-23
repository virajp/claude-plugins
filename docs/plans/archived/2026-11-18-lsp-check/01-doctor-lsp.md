# U1 — Doctor reports the LSP check

- **Read first:** every owned file, top to bottom, before editing. Start with
  `plugins/vwf/skills/doctor/scripts/checks.mjs`, `lib/index.mjs` and the
  setup of `scripts/src/doctor-checks.test.ts` (its `mise` stub, about lines
  45-130).
- **Lazy-load:** bootstrap's task source, only if the output format below is
  not clear:
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/repo/tools/mise/tasks/code-lsp-check`.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D1:** The doctor checks (`plugins/vwf/skills/doctor/scripts/lib/`) run
  `mise run code:lsp:check` once, from the base repo root, and make one row for
  each output line of the form `<server>: <command> not found - <fix>`:
  `rule` `lsp-check`, `severity` `degraded`, `project` `null`, `subject` the server,
  `message` the line, `remedy` the fix after ` - `. `/vwf:doctor` and
  `start.mjs` get the same rows.
- **D2:** The user ruled: `/vwf:execute` must stop if the target repo does not
  have `code:lsp:check`, or if the check fails, and the user fixes it before
  the run continues. When `mise tasks ls --hidden` does not list
  `code:lsp:check`, the checks make one `lsp-check` row, `subject`
  `code:lsp:check`, `remedy`: run the bootstrap sync (`bootstrap sync`) so that
  the mise tool writes the task. When the task exits 2, or exits 1 with no
  not-found line, the checks make one `lsp-check` row, `subject` `code:lsp:check`,
  with the last stderr line of the task as the `message` and the `remedy`.
  Exit 0 makes no row.
- **D3:** `degraded`. `checks.mjs` keeps exit 0 when only `lsp-check` rows are
  present.
- **D6:** A row names its server, as `code:lsp:check` prints it (for example
  `dart-lsp`). No map from server to language.
- **D7:** The tests use a stub `mise` on a temporary `PATH`, as
  `doctor-checks.test.ts` does today. The stub answers
  `mise tasks ls --hidden` and `mise run code:lsp:check` with fixture output
  and exit codes 0, 1 and 2, and a case where the task is absent.
- **D8:** This plan runs after R5b, whose U4 changed the doctor LSP rows to the
  `lspServers` of `vwf-tools`. Add the `lsp-check` rows beside those rows; do not
  change them.
- **D13 (adds to D2):** Any failure of the check is one row with subject
  `code:lsp:check`: an exit code other than 0 with no not-found line, a
  non-zero exit of `mise tasks ls --hidden`, or a failed spawn. When `mise` is
  not on `PATH`, the present blocking `mise` row already stops the run, and no
  `lsp-check` row is added. The message and the remedy are the last stderr
  line that mise did not write (skip a line of the form
  `[<task>] ERROR ...`); when there is no such line, the message is
  `code:lsp:check failed with exit <n>` and the remedy is
  `run mise run code:lsp:check and fix what it prints`.
- **D16:** The check runs in the base repo only, once, from its root. A member
  repo's servers are not checked.
- **D17:** The rule name is `lsp-check`. No R5b row may share it.
- **D19:** When `mise` is not on `PATH`, also add one `lsp-check` row with
  subject `code:lsp:check` (the `mise` row can be `degraded`, `stack.mjs` about
  line 55). This replaces the `mise`-row sentence of D13. The `message` of a
  row is the line without its ANSI colour codes and its label prefix (the
  `print_error` of bootstrap's helpers). Also change the header of
  `lib/index.mjs` (about line 2, "LSP parked by D22").
- **D20:** `code:lsp:check` runs `bootstrap lsp --json`, which can fetch the
  bootstrap clone at each run. Before you edit, run `bootstrap lsp --json`
  once with the network off (or with a failing fetch), and record what it does
  in a DECIDED line. The headers of `checks.mjs` and `lib/index.mjs` drop "no
  network" for this one call and name it. An offline failure is a normal
  `lsp-check` row.
- **D22:** The default `mise` stub of `doctor-checks.test.ts` lists
  `code:lsp:check` in `tasks ls --hidden` and passes it, so the present tests
  keep their results; only the new cases change the stub. When the exit status
  is null (a failed spawn or a signal), the message is
  `code:lsp:check did not run: <the spawn error or the signal>`, with the
  remedy of D13. Also remove "no network read" from `doctor/SKILL.md` (about
  line 204) and name the `bootstrap lsp --json` call there.
- **D24:** Add `lsp-check:degraded` to the expected rule lists of the doctor
  tests that run with no `mise` on `PATH` (`doctor-checks.test.ts` about lines
  189-190, 212-214, 223-224, 409-411); D22 applies only to the tests where
  `mise` is on `PATH`. The spawn of `mise run code:lsp:check` has a timeout of
  60 seconds (`spawnSync` `timeout: 60000`); a timeout is a signal, so D22
  makes it a row. Add a test case for the timeout.

## Edits

1. **`plugins/vwf/skills/doctor/scripts/lib/`** — add the LSP check per D1 and
   D2, in a new module `lsp.mjs` or beside the existing repo-level checks,
   whichever matches the structure R5b left. Call it once from the function
   that `checks.mjs` runs, for the repo-level checks, so `--projects ""` also
   runs it. Use `spawnSync` with no shell. Strip the ANSI colour codes and the
   `[ERROR]` or similar prefix of the output line before you parse it. Keep the
   scripts dependency-free (checker rule 16).
2. **`plugins/vwf/skills/doctor/scripts/checks.mjs`** — the header comment
   (about line 14) says "no LSP (parked)". Change it to say that the checks run
   `code:lsp:check` and report each missing server as a degraded `lsp-check` row.
3. **`scripts/src/doctor-checks.test.ts`** (and fixtures under
   `scripts/src/fixtures/doctor-checks/` when you need them) — add cases: exit
   0 → no `lsp-check` row; exit 1 with two not-found lines → two rows with the
   servers and the fixes; exit 2, and exit 3 with only mise's
   `[code:lsp:check] ERROR task failed` line on stderr → one row each with
   subject `code:lsp:check` and the D13 message; `mise tasks ls` fails → one
   row; task
   absent → one row with the `bootstrap sync` remedy; each case keeps exit 0 of
   `checks.mjs` when no other row is blocking.
4. **`plugins/vwf/skills/doctor/SKILL.md`** — the passage that says the
   blocking checks run no LSP (about line 200) and the passage on the LSP
   findings and `consent.lsp` (about lines 363-368): state D1 to D3, and that
   `/vwf:execute` stops a plan with a code unit on an `lsp-check` row. Remove each
   mention of `consent.lsp` and of the parked gap.
5. **`plugins/vwf/skills/doctor/references/stack-checks.md`** — in "3.
   Languages — LSP and toolchain" (about line 62), add the `code:lsp:check`
   row: what it runs, the row shape, the severity, and the fixes it prints
   (`MISE_ENV=dev mise install`; the Xcode Command Line Tools for
   `sourcekit-lsp`).

## Verification

- `mise x -- pnpm vitest run scripts/src/doctor-checks.test.ts` passes.
- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.
- In this repo, `node plugins/vwf/skills/doctor/scripts/checks.mjs --projects ""`
  shows no `lsp-check` row (here the check passes).

## Guardrails

- Touch nothing outside the owned paths. `start.mjs` belongs to U3.
- Do not run `code:lsp:check` with a fix; the check only reads.
- Delete with `rm`, never `git rm`. Do not run a formatter with `--fix`, and
  do not run `git checkout` or `git restore`.
- `plugins/**/*.md` is not formatted: keep the fold width by hand.

## Commit

`feat: doctor reports the LSP servers that code:lsp:check cannot resolve`
