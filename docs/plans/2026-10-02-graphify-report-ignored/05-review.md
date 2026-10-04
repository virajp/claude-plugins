# U5 — Review: the tool-config script change

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — `cli.mjs`, `lib/tools/git.mjs`, `lib/tools/graphify.mjs` and their
tests, the runnable code this plan lands (decision 7). Reviews the branch delta
since the branch base. Particular attention: the `git rm --cached` path runs
only on an `ok`, never deletes the working-tree file, and never runs against a
repo other than the target.
