# Fragments and Sections

The three merge algorithms both pipelines share. All three are
**re-runnable**: a second run over an already-merged file changes nothing,
which is what makes the empty-plan invariant hold.

Both write files the packs own the *shape* of. `init` is the only thing that
merges them, deliberately — a pack that edited a shared file would stop being
a fragment, and two packs editing one file is a lost update nobody sees.

## Ignore sections

The hygiene pack ships a **sectioned** ignore file. Each section is a banner
and its entries:

```text
# ==== <Name> ====
```

Per-technology sections are **appended at run time**, one banner each, from
the community template collection at
`https://raw.githubusercontent.com/github/gitignore/main/<Name>.gitignore`. A
pack that froze them would age the moment a language renamed a build
directory, and a stale ignore line fails by being silently absent from a diff.

### The algorithm

1. **Resolve the section names.** The **hygiene pack's conventions** own the
   mapping and are the only source for it — read the table there. It is keyed
   on the **pinned pack**, never on a file that happened to be found in the
   tree, so the pins the materializer's lockfile records are the input. Two
   pinned packs may name the same template, so resolve to the set of
   **distinct** names: a section is per template, not per pack.

   A pinned pack with **no row** is one of two things and the conventions say
   which. Most of them need no template at all — the base sections already
   cover them — and that absence is an answer written down rather than an
   omission. Only a pinned pack the conventions neither give a row nor
   account for is **proposed**: name the template in the plan, wait for a
   yes, and never guess silently, because a wrong name is a 404 and a 404 is
   a section that quietly never appears. The conventions also say where a
   confirmed name then belongs — that table — so the next repo does not
   re-ask.
2. **Skip what is already there.** A banner already present means that
   section was appended before. Skip it whole — do not re-fetch, and do not
   diff its contents against the current template. The file is the repo's
   once it lands, and a template that changed upstream is not a reason to
   overwrite lines somebody may have edited.
3. **Fetch each remaining template.** One request per section.
4. **Append**, in the order the sections were resolved, each as its own
   banner followed by the template's body verbatim. **Sections are appended,
   never interleaved** — the pack's own rule, and what keeps the base
   sections readable as one block.
5. **Append nothing the file already carries.** That is the hygiene pack's
   own rule for this file, stated in its conventions, and it is
   authoritative — filter the incoming template against the patterns already
   present and append what is left. The filter reads the file, never the
   other appended sections: what is already there is what counts.

   **A negation and the pattern it re-includes are one unit.** Dropping the
   pattern while keeping the line that re-includes a file under it leaves the
   negation with nothing to negate, and it fails by being silently inert.
   Drop both or keep both.

   A section the filter empties is a section the file already covers — skip
   its banner too, rather than appending a heading with nothing under it.

### When the fetch fails

**Offline, rate-limited, or a 404 — skip that section and print its name.**
Never write a partial section, never substitute a remembered template, and
never fail the run: the ignore file's base sections are already in place and
cover what every repo needs.

The skipped names go in the report's **Deferred** list, with the unlock — a
later `/vwf:setup reshape` with the network reachable — so a repo shaped on a
plane is a repo somebody can finish shaping later.

## Hook fragments

Each pack that contributes to the commit gate drops a standalone fragment —
its own `repos:` list — and the materializer copies it verbatim and stops.
Merging them into the gate's single configuration file is `init`'s job alone.

The paths and markers below are the packs' spelling, and the contract between
them and this step.

### The markers

One pair per fragment, and the fragment's filename is what names them:

```text
# >>> pre-commit.d/<name>.yaml
  … the fragment's entries …
# <<< pre-commit.d/<name>.yaml
```

### The algorithm

1. **Collect** every `.config/pre-commit.d/*.yaml`, sorted by filename. The
   sort is what makes the merged file byte-stable across runs and across
   machines.
2. **For each fragment**, take its `repos:` entries and place them between its
   marker pair inside the gate config's top-level `repos:` list:
   - markers **present** → replace everything between them;
   - markers **absent** → append the pair, and its entries, at the end of the
     list.
3. **Preserve everything outside the markers byte-for-byte.** The base config
   is the gate pack's, and a repo may have added its own entries to it. This
   step owns the marked blocks and nothing else — no reordering, no
   reformatting, no comment stripping. A merge that rewrites the whole file is
   a merge that silently reverts somebody's edit.
4. **A fragment whose file is gone** leaves its markers behind on the next
   run. Remove the pair and its contents — an orphaned block runs hooks for a
   pack the repo no longer has, and it fails as a missing hook rather than as
   a stale merge.
5. **Validate.** Run the gate's own configuration validator against the merged
   file, passing the path explicitly — the file does not sit where the tool
   looks by default, which is exactly why every caller passes the path. A
   validation failure is a **halt** for this step: report the error verbatim
   and leave the previous file in place, restoring it if it was already
   written. A gate config that does not parse is a gate that does not run, and
   it fails at the next commit rather than here.

### Idempotency

Steps 2 and 3 together are what make a re-run a no-op: the same fragments,
sorted the same way, produce the same blocks between the same markers, and
everything else in the file was never touched. That is the property the
existing-repo pipeline's empty plan rests on.

## Editor fragments

The same shape again, for the files a repository is *worked in* rather than
built by. Packs contribute per-pack fragments; `init` composes them; the whole
editor files are never a pack's to ship, because two packs writing one of them
is the lost update this whole tier exists to avoid.

**Never name the editor here.** The **convention names its target** — it lives
in the stack adapter's `assets/pack-format.md`, in its editor-fragment
subsection, and it owns the fragment path, the two output files, the marker
spelling and the name of the nesting setting. This section is the algorithm
alone. Read the convention for every literal it uses.

### Inputs

Every `.config/vscode.d/*.jsonc` present in the repo after the packs have
landed, taken in the **composition order the materializer documents** — the
same order the packs themselves landed in, so a later pack's opinion wins
where two disagree, exactly as it does for a shared file.

Parse each one as JSONC — comments and trailing commas are part of the format.
A fragment that does not parse is a **halt for this step**, naming the file:
merging a half-read fragment produces an editor configuration that is wrong in
a way nobody notices until the editor behaves oddly.

Three keys, and nothing else is merged:

| Key          | Is                                        | Merged by                                     |
| ------------ | ----------------------------------------- | --------------------------------------------- |
| `settings`   | editor settings, an object                | deep merge, later fragment wins on a conflict |
| `nesting`    | a parent file name → its child file names | union of children, per parent                 |
| `extensions` | recommended extension ids, a list         | union                                         |

### Outputs

The **two editor files the convention names**. Each gets exactly one marked
block, and the block goes **first** — at the top of the object for the
settings file, at the top of the array for the recommendations file — so that
anything a human wrote afterwards sits after it and, for the settings file,
wins by ordinary later-key precedence.

1. **`settings`** merges into the first file, deep, later fragment winning.
2. **`nesting`** renders into the single nesting setting the convention names.
   Merge per parent as a **union of children**, sort the children, and join
   them with the separator that setting takes. One parent collecting every
   ignore file any pack ships is the point of the union: no pack knows what
   the others contribute.
3. **`extensions`** is a sorted union, no duplicates, rendered as the
   recommendations list.

### The marked block

Markers are the convention's — one pair, spelled there, using that file's own
comment syntax. Then:

- **Markers present** → replace everything between them.
- **Markers absent** → insert the pair, with the merged content, at the top.
- **Everything outside the pair survives byte-for-byte.** No reordering, no
  reformatting, no comment stripping. A key somebody added by hand after the
  block is theirs, it wins over the block's value, and a second merge must
  leave it exactly as it was.
- **A file that does not exist yet** is created holding the block alone.

### Validate

Parse the **result**. A merged file that does not parse is a halt for this
step: report the parse error verbatim, restore the previous file, and let the
run continue to the report with the failure in **Deferred**. An editor
configuration that does not parse is silently ignored by the editor, so it
fails as behaviour nobody can explain rather than as an error anybody sees.

### Idempotency

Same fragments, same composition order, same sorts — same block between the
same markers, and nothing outside it touched. That is what makes a second run
an empty plan.
