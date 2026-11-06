DECISION 2026-09-01 ★3 | dev marketplace for the authoring machine | the author
must run the working tree, not a tag, so a second manifest serves it | alt cut
tags to unblock, alt `ref: develop` (both rejected)

**Source plan** `2026-09-01-dev-marketplace`.

What broke: vwf `19.2.0` stayed installed on the author's machine, because an
update needs a tag. Its manifest still declared the `devtools` dependency.
The registered marketplace was a directory source, so it read the checked-out
branch. When the dissolution landed on `develop`, `devtools` left the registry.
A stale plugin with a vanished dependency fails to load. There is no state in
between.

Options rejected:

- Cut `vwf-v19.9.1` and `stackgen-v0.19.0`. This publishes the dissolution to
  users just to unblock one machine. The machine would track released content
  again and hit the same wall at the next change. `p:plugins:release` also
  refuses to run off `main`.
- `ref: develop` as the source. It works with no symlink, but it serves only
  pushed commits. The failure to fix is "I cannot run what I just changed",
  and a push-first loop only shortens it. It stays the named fallback.
- A `--dev` flag on the generator. A flag is one more thing to forget. A stale
  dev manifest fails as a plugin that quietly serves yesterday's tree. Both
  manifests are written and checked together.

Facts measured against the real CLI (hermetic config dir):

- Claude rejects every source path that is absolute or contains `..`, so the
  staged copies must live inside the marketplace directory. A symlink to
  `../plugins` was the first design and could not work.
- Both manifests must carry the same marketplace `name`, because a
  `dependencies` edge names its marketplace by name.
- Registering the dev marketplace makes `claude plugin list` on that machine
  no evidence about what a user gets. The `target-verifier` agent exists for
  that and runs in its own config dir.
