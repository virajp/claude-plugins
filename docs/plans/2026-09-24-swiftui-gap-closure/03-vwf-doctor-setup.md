# U3 — vwf: doctor runs probes and reads lockfile paths; setup asks machine env

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/**`, `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/assets/stack-vocabulary.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions;
  `doctor/references/stack-checks.md:1-20`, `:100-115`, `:265-280`;
  `doctor/SKILL.md:170-250`; `setup/SKILL.md:15-30`, `:190-205`;
  `setup/references/materialize.md` whole; `stack-adapter.md:350-365`;
  `stack-vocabulary.md:45-60`;
  `plugins/vwf/skills/init/references/new-repo.md:430-446` (marked positions)
  and the hash re-recording passage in `plugins/vwf/skills/init/SKILL.md`.

## Ruling

Quoted from index.md:

- **F1** — "`/vwf:doctor` runs the probe and requires exit 0, with the same
  severity as today (blocking once pinned, degradation while `unresolved`)." A
  bare-name entry keeps today's `command -v` lookup.
- **F2** — "`/vwf:doctor`'s `package_manager resolves` check reads it" — the
  `lockfile:` list of repo-relative paths or globs, any match passes.
- **F3** — "`/vwf:setup`'s materialize pass, when it lands a pack declaring it,
  runs each `detect`, offers the value preselected (the person may type
  another), fills the pack's marked position for that var, and re-records the
  file's lockfile hash. A `detect` that fails offers no default and still asks."
  Setup is the asker, not init (a reversal of "at init time").
- **F14** — Apple CLI behaviour checked on this machine, never from training
  knowledge.

vwf names **no technology**: nothing here may say Xcode, simulator or Swift
except as an example clearly marked as one.

## Edits

1. **`doctor/references/stack-checks.md`** — `:104-111`: a map entry's `probe`
   is run (from the repo root, with the repo's mise environment, a timeout
   stated), exit 0 required; a bare name stays `command -v`. The finding names
   the probe and its exit status. `:272-274`: the lockfile check reads the
   `lockfile:` fact — any listed path or glob matching passes; a package-manager
   pack with no `lockfile:` fact keeps today's behaviour, stated. Update the
   summary at `:4-6`.
2. **`doctor/SKILL.md`** — the rows at `:176`, `:199`, `:244` match.
3. **`setup/references/materialize.md`** (and the two `setup/SKILL.md` mentions)
   — the machine-env step inside the materialize pass: after the template lands,
   for each `machine_env` entry run `detect` in the repo, ask `question` with
   the detected value preselected (one question per entry, or one grouped
   question per pack — your call, `DECIDED:`), fill the marked position named
   for `name` in the landed file, re-record that file's lockfile hash; on a
   re-run, a position already filled is shown as the current value and kept
   unless the person changes it.
4. **`stack-adapter.md`** `:355-362` and **`stack-vocabulary.md`** `:48-56` —
   the facts a template payload carries now include the probe form, `lockfile`
   and `machine_env`; re-count "four facts" wherever it is counted.

## Verification

- `mise run p:plugins:check` green.
- `grep -n -i -E "xcode|simulator|swift" plugins/vwf/skills/doctor plugins/vwf/skills/setup plugins/vwf/assets/stack-adapter.md plugins/vwf/assets/stack-vocabulary.md -r`
  shows only lines that were there before or are marked as examples.

## Guardrails

- Touch nothing outside Owns — `init` is not edited (F3 moved the question to
  setup); report any init passage the change falsifies as `DOCS FALSIFIED:`.
- `plugins/**/*.md` is not formatted: match the surrounding fold width by hand.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns.

## Commit

Wave 1 lands as one commit (F12):
`feat: pack facts — binary probes, lockfile paths, machine env`
