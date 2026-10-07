# U5 — stackgen-sync removes what a pack stopped shipping

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-sync/SKILL.md`,
  `plugins/stackgen/assets/output-tree.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom.
- **Lazy-load:**
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  (lock records, hook copies, `settings_keys`);
  `plugins/stackgen/skills/tool-config/references/pre-commit.md` and
  `gitleaks.md` (how those files are laid out, to describe the detector).

## Ruling

> D8 — `stackgen-sync` gains a general rule: a path a component no longer ships
> that is still present **and** whose hash still matches the lock record is
> offered for removal on consent; a modified one is reported only — this removes
> the old `.claude/hooks/fnox-ciphertext-guard.sh`. Plus a narrowed one-off fnox
> detector in the same pass: it removes, on consent, a gitleaks allowlist entry
> naming `fnox.toml` (now the repo's own line outside the `tool-config`
> markers), and flags — never edits — a non-empty top-level `[secrets]` or any
> age/KMS provider in `fnox.toml`. A hand-added `fnox-ciphertext` pre-commit
> hook is left to tool-config, which shows it as a diff row on the whole-owned
> `pre-commit-config.yaml`.

> D9 — `/vwf:setup reshape` (init's existing-repo pass) offers to run
> `/stackgen:stackgen-sync` once stackgen components are materialized, on the
> same consent as the rest of the plan; it never runs it silently.

## Edits

1. **`stackgen-sync/SKILL.md`**
   - Replace the rule that a still-present path the component no longer ships
     "is not this rule's" (around `:63-72`) with D8's general rule: unmodified
     (hash matches the lock) → a removal row, applied on consent, lock record
     dropped with it; modified → reported, kept, lock record kept. A whole
     vanished pack stays "reported, never deleted" (`:60-61`, `:233-236`) — D8
     covers paths of a component that still exists.
   - Add a short, clearly-scoped **retired fnox encrypt mode** step, run when
     the lock lists `capability-provider/fnox`: detect (a) a gitleaks allowlist
     entry whose `paths` names `fnox.toml`, outside the `tool-config` markers,
     shown as a removal row applied on consent — the `fnox-ciphertext`
     pre-commit hook is not this step's (tool-config's diff row covers it; say
     so in one line); (b) in `fnox.toml`, a non-empty top-level `[secrets]` or a
     provider of type `age` or a KMS type — flagged with what to do by hand,
     never edited. Note that a value once committed must be rotated at its
     source. The guard script itself is covered by the general rule (its lock
     record's hash).
   - Say that `/vwf:setup reshape` offers this skill (D9), and it remains
     consent-gated either way.
2. **`assets/output-tree.md`**
   - `:273-274` — fnox is no longer a precedent for a pack shipping a hook
     script; name the remaining one(s) only.
   - `:402-408`, `:443-449` — the lockfile rules gain D8's removal of an
     unmodified no-longer-shipped path.

## Verification

- `grep -n 'fnox.toml' plugins/stackgen/skills/stackgen-sync/SKILL.md` prints
  the detector.
- `grep -n -i 'fnox' plugins/stackgen/assets/output-tree.md` prints no hook
  precedent claim (the `fnox.toml` root-file allowance stays).
- `mise run p:plugins:check` green; the full wave gate.

## Guardrails

- Touch nothing outside Owns — the vwf side of D9 is U6's.
- Keep `disable-model-invocation: true` — the skill stays user-invoked; D9's
  offer is a prompt to the user, not a programmatic call.
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand; strict
  YAML frontmatter.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: stackgen-sync removes files a pack no longer ships`
