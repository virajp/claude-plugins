# Fragments and Sections

The three merge algorithms both pipelines share. All three are
**re-runnable**: a second run over an already-merged file changes nothing,
which is what makes the empty-plan invariant hold.

All three run **per repo** — the base and every member the run resolved — each
against that repo's own `.config/`, so every path below is relative to the
repo being shaped, a member's fragments never reach the base's files, and the
idempotency notes hold per repo.

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

This is a **section merge**, and it is the one thing that ever changes an
ignore file: the repo's file is **kept whole**, and each section it lacks is
appended to it. The pack's base sections and the per-technology ones are
merged the same way, so a repo that arrived with its own `.gitignore` gets
the sections it lacks exactly as a repo that got the pack's file whole — the
file is never replaced, and it is never offered as replace-or-keep. **Every
file gets the sections it lacks**, and only those.

1. **Resolve the section names.** The **pack's base sections** come first,
   read from the sectioned file the pack ships, in the order they sit there.
   Then the per-technology sections, whose input is the **language set the
   stack read produced** — SKILL.md's *The stack read*, which takes the
   config's pins first, the lockfile's components next, and in `source` mode
   the manifests it finds; a `blank` repo's set is empty and adds no section
   past the base ones. The read carries **one more component** beside the
   languages: the **pinned secrets provider's slug**, question 4's answer,
   passed as it is and in every mode, so the **provider row** the same table
   keeps applies — a provider whose files keep something machine-local gets
   its ignore section, under a banner named for the slug, only in a repo that
   runs it, and a **none** answer carries no component. The **hygiene pack's
   conventions** own the mapping from that set to template names and
   provider sections and are the only source for it — read the table there.
   Two languages may name the same template, so resolve to the set of
   **distinct** names: a section is per template, not per language. A
   provider section names no template and is fetched from nowhere: its body
   is the table cell's own pattern, appended like a base section's.

   A language with **no row** is one of two things and the conventions say
   which. Most need no template at all — the base sections already cover
   them — and that absence is an answer written down rather than an omission.
   Only a language the conventions neither give a row nor account for is
   **proposed**: name the template in the plan, wait for a yes, and never
   guess silently, because a wrong name is a 404 and a 404 is a section that
   quietly never appears. The conventions also say where a confirmed name
   then belongs — that table — so the next repo does not re-ask.
2. **Skip what is already there.** A banner already present means that
   section was appended before. Skip it whole — do not re-fetch, and do not
   diff its contents against the current template or the pack's copy. The
   file is the repo's once it lands, and a template that changed upstream is
   not a reason to overwrite lines somebody may have edited.
3. **Fetch each remaining per-technology template.** One request per
   section. A base section needs no fetch — its body is the pack's.
4. **Append**, in the order the sections were resolved, each as its own
   banner followed by the section's body verbatim. **Sections are appended,
   never interleaved** — the pack's own rule, and what keeps the base
   sections readable as one block.
5. **Append nothing the file already carries.** That is the hygiene pack's
   own rule for this file, stated in its conventions, and it is
   authoritative — filter the incoming section against the patterns already
   present and append what is left. The filter reads the whole file — the
   hand-written lines, the banner sections, whatever is there — never only
   the other appended sections: what is already there is what counts.

   **Patterns are compared normalised**, never as raw lines. Before the
   comparison, on both sides: a leading `/` is stripped, a trailing `/` is
   stripped, a `**/` prefix is ignored, and blank lines and comment lines are
   skipped — they are not patterns and match nothing. So `/node_modules/`,
   `node_modules` and `**/node_modules/` are one pattern, and a pattern the
   file already carries under a different spelling is **never doubled**. The
   line that is appended is the incoming section's own spelling, not the
   normalised form — normalisation decides equality and writes nothing.

   **A negation and the pattern it re-includes are one unit.** Dropping the
   pattern while keeping the line that re-includes a file under it leaves the
   negation with nothing to negate, and it fails by being silently inert.
   Drop both or keep both.

   A section the filter empties is a section the file already covers — skip
   its banner too, rather than appending a heading with nothing under it.
6. **Re-hash.** The file the merge wrote is one the materializer's lockfile
   records, and the hash it recorded at landing no longer matches. `init`
   re-records it in the existing-repo pipeline's re-hash step — the last
   before the git pass, which covers every file this run filled, appended to
   or merged — so the next run reads the merged file as current, not as
   drift.

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

1. **Collect** every `.config/pre-commit.d/*.yaml` in this repo, sorted by
   filename. The sort is what makes the merged file byte-stable across runs
   and across machines.
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
6. **Re-hash.** The gate config is the gate pack's, and the lockfile hash it
   landed under no longer describes the merged file. `init` re-records it in
   the existing-repo pipeline's re-hash step — the last before the git pass —
   so a merged gate config is never read as a diverged one on the next run.

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

Every `.config/vscode.d/*.jsonc` **that landed** in this repo — present in
the tree **and** carrying an `entries:` record in the lockfile, whichever run
landed it — **minus** any path this run's dry-run reports as skipped, taken
in the **composition order the materializer documents** — the same order the
packs themselves landed in, a fragment an earlier run landed keeping its
place in it, so a later pack's opinion wins where two disagree, exactly as
it does for a shared file. The lockfile is the record, not this run's
dry-run: a reshape fetches the three baselines and the provider alone, and
a fragment a stack pin's materialize pass landed earlier is in no dry-run
of this run yet is as much an input as any the run just landed.

**A skipped fragment is not read.** Every editor fragment a pack ships is
conditioned on the `editor` axis, and the materializer's conditional
evaluation step lands it only where question 7's answer passed that axis
the editor's value — on a **no**, `none` is passed, no fragment lands, this
step has no input, and it composes nothing: the two output files are neither
created nor touched, and a hand-written one is left exactly as it was. A
fragment already in the tree from an earlier run, whose condition the
dry-run now finds false, is not an input either — the answer decides, never
the directory listing — and it is not a **Skipped** row: the materializer
keeps a path its lockfile records and lists it as *landed earlier, condition
now false — kept*, which is the row the plan shows for it.

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

**The existing output file is an input too**, where one exists. Read each of
the two editor files **whole**, as JSONC — comments and trailing commas
tolerated — and keep what sits **outside** the marked block apart from what
sits inside it: the hand section is what the collision step below compares
against, and nothing else in this step reads it. A file that does not parse
is a halt for this step on the same terms as a fragment that does not.

### Outputs

The **two editor files the convention names**. Each gets exactly one marked
block, and the block goes **first** — at the top of the object for the
settings file, at the top of the array for the recommendations file — so
that anything a human wrote afterwards sits after it, apart, and readable as
theirs. A hand key wins because the block **omits** it — the collision step
below is what takes it out — never because the file carries the key twice
and the format happens to tolerate that.

1. **`settings`** merges into the first file, deep, later fragment winning.
2. **`nesting`** renders into the single nesting setting the convention names.
   Merge per parent as a **union of children**, sort the children, and join
   them with the separator that setting takes. One parent collecting every
   ignore file any pack ships is the point of the union: no pack knows what
   the others contribute.
3. **`extensions`** is a sorted union, no duplicates, rendered as the
   recommendations list.

That is the **composed set**. It is not yet the block: the collision step
runs over it first.

### Collisions with the hand section

A **collision** is a key present both in the composed set and **outside the
block** in the existing file: a top-level `settings` key, a parent of the
nesting setting, or an extension id. Two packs shipping one key is not a
collision — that is the composition order's business and stays silent; a
collision is always a pack against a person, and it is **never resolved
silently**. It is asked, once, and the answer is recorded so it is not asked
again.

**Collect, then decide each.** Intersect the hand section's keys with the
composed set. For each key in the intersection:

- a recorded answer exists under **`enforcement.editor_keys`** in the base's
  `.config/vwf.yaml` — `<file>: { <key>: keep | take | union }`, the file
  spelled base-relative with the member's path as prefix exactly as
  `kept_files` spells its paths — and that answer applies, without asking;
- otherwise the key joins the **collision round**.

**The collision round** belongs to the plan step — it is not one of
SKILL.md's nine questions, and a run with no collision asks nothing. One
round per run, whatever the repo count, one row per collision, each row
reading `file · key · hand value · pack value · choice`, and the choice is
one of three:

| Choice    | The block                  | The hand copy                               |
| --------- | -------------------------- | ------------------------------------------- |
| **keep**  | omits the key              | untouched                                   |
| **take**  | carries the pack's value   | removed — the exact lines shown in the plan |
| **union** | carries pack + hand merged | removed — the exact lines shown in the plan |

**The shape of the key decides which choices are offered:**

- a **scalar** setting — keep or take. There is nothing to union.
- an **object-valued** setting, or a **nesting parent** — keep, take or
  union. Union composes the pack's entries and the hand entries into the
  block's one value — for a nesting parent, the union of children, sorted
  and joined as the setting takes them; for an object, the pack's keys and
  the hand keys, the hand value winning where both name one key.
- an **extension id** — the id is the value, so a colliding id is the same
  id twice, and every choice ends the same way: the file recommends it once.
  **Keep, and do not ask** — the block omits the id, the hand line stays
  exactly where it is, and nothing is recorded, since there is no answer to
  record. Say so in the plan as one line per id. An id that differs cannot
  collide; the sorted union the recommendations list already is covers the
  rest.

**Keep is the default** on every row, and it is the behaviour a run that was
never asked would have shown: the block omits the key, and the hand copy is
exactly as it was.

**Then the block is composed** — the composed set **minus** every `keep` key,
**plus** the union value in place of the pack's for every `union` key — and
the hand copy of every `take` and `union` key is **removed** from outside the
block. That removal is the **one** edit this step makes outside the markers,
and it is made only on a recorded or just-given answer. The plan shows the
exact lines it will remove, before the one consent. A hand copy that was the
last member of its object leaves a valid file behind — the trailing comma on
the member before it goes with it.

**Recording the answers.** Every answer the round takes — keep, take or
union — is written under `enforcement.editor_keys` in the **base's**
`.config/vwf.yaml`, merged into whatever the block already holds, on the same
single consent as everything else and at the same point in the apply as the
`kept_files` record. It is the second of the two keys `init` writes into that
file. On a repo `/vwf:setup` has not reached, the file is the **stub config**
SKILL.md describes — `config_format` and the `enforcement` block alone,
written by this same run so the two keys have a home — and the answer is
recorded there like anywhere else. Nothing about an editor answer is ever
deferred: a run that asked is a run that recorded.

**Editing the block is how a user is re-asked.** A recorded answer applies
for as long as the key collides; a key that stops colliding — the hand copy
gone, or the pack no longer shipping it — makes the record inert, and a user
who wants a different answer edits the block or the hand section and runs
`/vwf:setup reshape`, which sees the collision afresh only where the record
no longer describes it.

### The marked block

Markers are the convention's — one pair, spelled there, using that file's own
comment syntax. Then:

- **Markers present** → replace everything between them.
- **Markers absent** → insert the pair, with the merged content, at the top.
- **Everything outside the pair survives byte-for-byte.** No reordering, no
  reformatting, no comment stripping. A key somebody added by hand after the
  block is theirs: the block **omits** it, so the file carries it once and the
  hand value is the one the editor reads, and a second merge must leave it
  exactly as it was. The **one** carve-out is the collision step's: the hand
  copy of a `take` or `union` key is removed, on the user's word and never
  otherwise.
- **A file that does not exist yet** is created holding the block alone —
  there is no hand section, so no collision.
- **Re-hash.** Where the lockfile records the editor file, the hash it holds
  describes the file before the block went in. `init` re-records it in the
  existing-repo pipeline's re-hash step — the last before the git pass — so
  the block is not read as drift the next morning.

### Validate

Parse the **result**. A merged file that does not parse is a halt for this
step: report the parse error verbatim, restore the previous file, and let the
run continue to the report with the failure in **Deferred**. An editor
configuration that does not parse is silently ignored by the editor, so it
fails as behaviour nobody can explain rather than as an error anybody sees.

### Idempotency

Same fragments, same composition order, same sorts, same recorded answers —
same block between the same markers, and nothing outside it touched. A `keep`
still collides on the next run and is still omitted, without a question; a
`take` or `union` removed its hand copy, so it no longer collides at all. That
is what makes a second run an empty plan.
