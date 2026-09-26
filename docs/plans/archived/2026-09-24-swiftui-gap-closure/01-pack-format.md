# U1 — The pack format: binary probes, lockfile paths, machine env

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/taxonomy.md`,
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/skills/stackgen-stack-template/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts, Assumed decisions and Shared-file rule;
  `pack-format.md:59-62`, `:157-186`, `:197+`, `:392-396`; `taxonomy.md:21-25`;
  `output-tree.md:17`; `stackgen-stack-template/SKILL.md:80-190` and
  `references/materializer.md` around `:413`.

## Ruling

Quoted from index.md:

- **F1** — "A `binaries:` entry is a bare name (PATH lookup, as today) or a map
  `{ name: <binary>, probe: "<command>" }`; `/vwf:doctor` runs the probe and
  requires exit 0, with the same severity as today (blocking once pinned,
  degradation while `unresolved`)."
- **F2** — "A new `lockfile:` fact on a package-manager pack: a list of
  repo-relative paths or globs, any match passes. `/vwf:doctor`'s
  `package_manager resolves` check reads it."
- **F3** — "A new `machine_env:` fact: a list of `{ name, detect, question }` —
  `name` an env var, `detect` a shell command whose stdout is the default,
  `question` the prompt. `/vwf:setup`'s materialize pass, when it lands a pack
  declaring it, runs each `detect`, offers the value preselected (the person may
  type another), fills the pack's marked position for that var, and re-records
  the file's lockfile hash. A `detect` that fails offers no default and still
  asks."

## Edits

1. **`pack-format.md`** — in the `pack.yaml` field list: extend
   `languages[].facts.binaries` to the two entry forms (F1), with an example of
   each and the doctor behaviour in one sentence; add `lockfile:` (F2) — where
   it sits (a package-manager pack's facts, beside `package_manager`), its
   shape, that doctor reads it; add `machine_env:` (F3) — a pack-level field,
   its shape, that the pack must land a file whose marked positions are named
   for each `name` (typically a `config/.config/mise/conf.d/<pack>.toml` `[env]`
   table, per the conf.d passage at `:59-62`), and what setup does with it. Keep
   the `:392-396` principle consistent with F1.
2. **`taxonomy.md`** — the facts passage at `:21-25` names the probe form and
   the two new facts in one line each.
3. **`output-tree.md`** — `:17` and any passage listing the facts a template
   payload carries: add `lockfile` and `machine_env`.
4. **`stackgen-stack-template/SKILL.md`** and **`references/materializer.md`** —
   the template payload passes `binaries` entries through in either form, passes
   `lockfile` beside `package_manager`, and passes `machine_env` so `/vwf:setup`
   can ask; state that the materializer lands the `conf.d` fragment with its
   marked positions unfilled and that the caller (setup) fills them. No new
   consent tier.

## Verification

- `mise run p:plugins:check` green.
- Every example in the new text parses as YAML.

## Guardrails

- Touch nothing outside Owns — the checker is U2's, vwf's docs U3's, the packs
  U4–U6's.
- `plugins/**/*.md` is not formatted: match the surrounding fold width by hand.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns.

## Commit

Wave 1 lands as one commit (F12):
`feat: pack facts — binary probes, lockfile paths, machine env`
