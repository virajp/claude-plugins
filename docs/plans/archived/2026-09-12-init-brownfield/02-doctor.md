# U2 — doctor: content drift and the two marked positions

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/doctor/references/harness-and-memory.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. The four predicates are
  `stack-checks.md:233-298`; the summary `SKILL.md:172-176`; the one-remedy rule
  `SKILL.md:203-210`. Then, read-only: how predicate (a) (`:244-261`) reaches a
  pack's version — through the adapter or the lockfile alone — because predicate
  5 must reach the pack's **bytes** the same way; and
  `plugins/vwf/assets/vwf-config.md`'s `enforcement:` block for ruling 4.
- **Lazy-load:** `plugins/stackgen/skills/stackgen-stack-template/SKILL.md` to
  see what the adapter returns for a materialized entry (whether file contents
  are among it).

## Ruling

Quoted from index.md:

> **5. Doctor predicate 5.** "Content drift." For each pack-owned path under
> `.config/` that the lockfile's packs ship, compare the repo's bytes with the
> pack's file at the locked version, reached exactly the way predicate (a)
> reaches the pack's version. A difference is one **warning** naming the file
> and `/vwf:setup reshape`; a file recorded as kept is skipped. If the adapter
> offers no way to read the pack's bytes at the locked version, U2 returns
> `UNRESOLVED: predicate 5 needs the adapter to return a pack file's content`.

> **6. Doctor predicate 6.** `MERGE_MODEL` absent from `.config/mise.toml`'s env
> block or not one of `direct`, `pr` → warning; `MEMBERS` absent on a product
> whose config reads `topology: multi-repo` with `linkage: siblings` → warning.
> Each names `/vwf:setup reshape` as the remedy, per the one-remedy rule.

> **4. Recording a kept file.** DECIDED 2026-09-12 by the user, after U1 and U2
> both returned the fallback: the record is a **new key**,
> `enforcement.kept_files:` — a map of `<path>: { reason: <one line> }`, the
> path as the lockfile names it — and `config_format` bumps 16 → 18 (U6 owns the
> schema, the lineage row and the migrate sentence). `init` writes the key,
> consented in its single plan, and never creates `.config/vwf.yaml` — on a repo
> `/vwf:setup` has not reached, the keep is applied and only the record is
> Deferred with unlock "run `/vwf:setup`, then `/vwf:setup reshape`". `init` and
> `doctor` read it; an absent block reads as empty.

## Edits

1. **`stack-checks.md`** — after predicate (d) (`:290-294`), add **(e) content
   drift** per ruling 5: the set of paths (every file the locked packs'
   `config/` payloads ship, as the lockfile names the packs), the comparison,
   the skip for a kept record (resume: it is `enforcement.kept_files.<path>` in
   `.config/vwf.yaml` — name that key where round 2 left "the same record `init`
   writes"), the "not checked — no lockfile" outcome when
   `.claude/stackgen/lock.yaml` is absent (a brownfield repo before its first
   reshape), and the single warning line. Then **(f) the two positions** per
   ruling 6. Both cite `/vwf:setup reshape` as the one remedy.
2. **`SKILL.md`** — `:172-176` summary says six predicates; the one-remedy rule
   paragraph unchanged unless it enumerates the four.
3. **`harness-and-memory.md`** — read; untouched unless it enumerates the
   predicates.

## Verification

- `grep -n 'content drift\|MERGE_MODEL\|MEMBERS' plugins/vwf/skills/doctor/references/stack-checks.md`
  hits all three.
- `grep -n 'no lockfile' …/stack-checks.md` hits.
- `mise run p:plugins:check` green; frontmatter untouched.

## Guardrails

- Do not touch `init` (U1), `setup` (U3), or `plugins/vwf/assets/`.
- Doctor reports; it never writes without consent — do not add a fix path.
- Doctor names no tool; it names paths and the reshape command.
- Strict-YAML frontmatter untouched; match fold width by hand.

## Commit

`feat: doctor reports pack-file content drift and the MERGE_MODEL and MEMBERS positions`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
