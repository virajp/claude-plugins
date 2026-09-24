# Decision — init reads a brownfield repo's root configs, hooks and tasks before landing over them

**Date** 2026-09-21 · **Branch** `2026-09-20-init-brownfield-reads` · **Plan**
[`docs/plans/2026-09-20-init-brownfield-reads/`](../../plans/2026-09-20-init-brownfield-reads/index.md)
· **Backlog** B28, piece D2, plan 3 of 5 · **Problem**
[`2026-09-20-init-shape-audit.md`](../problems/2026-09-20-init-shape-audit.md)
(candidates 5–10, 12, 13; B2, B4–B12, B14–B20, G4, G5, L4 init's half, L6, L7,
L12, B18's four passages)

## What was decided before

The "adopt, not flatten" doctrine
(`2026-09-12-init-brownfield-sidecar-and-diverged-files.md`) gave the
existing-repo pipeline its replace-or-keep offer, the `_scripts/local` sidecar
and the `kept_files` record, and plan 2 (`2026-09-20-init-mode-seam`) extended
the offer to `source` and `blank`. Around that offer the pipeline still landed
over what a brownfield repo had. Pass 1's rename map was the **basename** of
every pack `config/` path, the task library included, so a root file sharing a
name with a shipped task was a candidate for the library; the packs declare only
`.config/` paths and a root `dprint.json`, so `.pre-commit-config.yaml`,
`.mise.toml`, `.gitleaks.toml`, `.grype.yaml`, `.dprint.json` and `.renovaterc`
matched nothing, were off the allowlist and were **reported, not read**, while
`.github/renovate.json` and `.github/dependabot.yml` sat inside an allowlisted
directory the survey read as one entry and were never seen at all. Nothing read
`core.hooksPath`, `.husky/` or lefthook — the gate-first commit assumed the
installed hooks read the file it committed. `.gitignore` was an ordinary pass-6
row, default keep, so the base sections never reached a kept file; passes 3, 4
and 10 read task **files** only, so inline `[tasks.*]` tables were invisible;
pass 2 moved `README.md` with no caller rewrite; pass 8 mapped ten commit-type
spellings and guessed at an eleventh; only `LICENSE` counted as a licence file.
The pipeline jumped from the gate-first commit to new-repo §11, skipping §3, §4,
§8, §9 and §10 — the placeholders, licence and security files, secrets provider,
bootstrap and aggregator — though every question feeding them was asked in every
mode. Pass 6 compared an unrecorded file against the pack's **raw** bytes, which
carry `<REPO_URL>` and an empty scope list, so a file exactly as a landing would
have written it was re-offered every run. The lockfile hash was written by the
materializer at landing alone; every fill, append and merge init made
afterwards, and every replace-or-keep answer, left a hash that read as drift the
next morning. `init` never created `.config/vwf.yaml`, so a keep or an editor
answer on a repo setup had not reached became a Deferred line and was re-asked
on every reshape. Four passages were stale: the hygiene conventions and the
readme reference said `renovate.json` lands under `.config/` (it lands at the
root); the mise task-library said an unmapped helper call is "flagged" (it moves
to the sidecar); the pre-commit config's trailing comment said fragments are
"merged below this line" (they are appended inside the `repos:` list between
markers).

## What changed

**A tool-config table**, new at
`plugins/vwf/skills/init/references/tool-configs.md` — one row per tool a pack
ships: the tool, its known root spellings, the `.config/` path the pack lands,
and the merge shape. Seven rows: pre-commit, mise, gitleaks, grype, dprint,
renovate, dependabot. Pass 1 reads every spelling at the root **and inside
`.github/`**; each hit is one plan row, `root tool config`, with three outcomes
decided in the plan and applied on the one consent: **move** (default) — a
`git mv` to the `.config/` path, run before the creates, and then the file is
offered through pass 6 against the pack's, the dprint move-and-shim model
generalised; **keep both** — the repo's file stays, the pack's lands, and the
report lists it under Deferred as unread by the gate; **delete** — only on the
user's explicit flip, never proposed. Three merge shapes: `move-and-offer`
(pre-commit, gitleaks, grype, dprint), `move-and-split` (mise — the root file's
`[env]` and `[tools]` merge into the pack's split files, its tasks go through
pass 3 as inline tasks, the emptied file is removed, and a table no split file
owns keeps a cut-down file alive as repo-owned), `yield` (renovate — the repo's
policy under any spelling wins, the pack's root `renovate.json` is **not
landed**, the row says so) — and one row with no shape: dependabot reads
`keep both`, pass 1's outcome (the pack ships no Dependabot file; the repo's
stays, the pack's `renovate.json` still lands, and whether it should beside a
Dependabot policy is plan 5's).

**The rename map** matches full declared pack paths plus the table's spellings;
never a task-file basename (the library is excluded whole); an entry
`.gitignore` ignores is skipped without a row; `.git/` is exempt by name; a
directory holding a manifest or source — plan 2's sub-project — is listed
**once** under a new **Projects** heading with the id question 2 confirmed,
never under Deferred.

**The hook manager** is a survey subject: pass 1 reads
`git config --local core.hooksPath`, `.husky/`, `lefthook.yml` and
`.lefthook.yml`; a hit is one plan row, `switch hook manager to pre-commit`,
**default keep**. On keep the gate-first commit runs under the installed hooks,
`setup:precommit` is not invoked, and the report names the manager and says the
shipped gate landed unwired (the aggregator, if accepted, refuses the foreign
manager without `--force` — plan 1's flag). On switch the run invokes
`setup:precommit --force` as its last shaping step, after every apply row and
before the gate-first commit, and says so.

**`.gitignore` is a section merge**, never a replace-or-keep row: the repo's
file is kept whole, each pack banner section — base and per-technology alike —
whose patterns are not already present is appended, and patterns are compared
**normalised**: leading and trailing `/` stripped, a `**/` prefix ignored, blank
and comment lines skipped, so a pattern present under another spelling is never
doubled. The appended line is the incoming section's own spelling.

**The five post-landing steps run in every mode.** After its landing and before
the git pass the existing pipeline runs new-repo §3 (secrets provider), §4
(placeholders, across landed *and replaced* files), §8 (readme stub, licence and
security file — retitled to name the security file), §9 (bootstrap) and §10 (the
aggregator offer), cited by section and not restated; §7's fills are pass 9's on
a shaped repo and are not run twice.

**Three hash writers, named.** The materializer at landing; pass 6's **replace
and keep both re-record** the file's post-fill hash (creating the record for a
kept file that had none); and init, as its **last step before the git pass**,
re-hashes every file it filled, appended to or merged — marked positions,
placeholders, ignore sections, hook fragments, the editor block — into the
lockfile. Pass 6's unrecorded-file compare is against the pack's bytes **after
the fills**. A file a pack task rewrote under `--update` / `--upgrade` reads as
drift until the next reshape's keep re-records it — accepted. The stackgen
lockfile schema (`assets/output-tree.md`) and the materializer reference name
init as a hash writer.

**The stub config.** Where no `.config/vwf.yaml` exists, init writes a stub
carrying `config_format` and the `enforcement` block alone, as one create row,
so `kept_files` and `editor_keys` always have a home; setup's migration and fill
passes complete it later. The Deferred rule for those two records is gone.

**And the rest**: passes 3, 4 and 10 read inline `[tasks.*]` tables as tasks (a
legacy hit is a rename into the library, a miss is repo-owned and listed with
its file and table; an inline task's shebang is the manager's shell setting);
pass 2 rewrites README callers as pass 3 rewrites task callers; pass 8 **asks**
a type in neither column, once per type, with the closed set plus *keep as is*,
recording nothing; `LICENSE`, `LICENSE.md`, `LICENCE` and `COPYING` all count as
"already carries a licence file". The plan and the report gain three sections —
Root tool configs, Hook manager, Projects — ten becomes thirteen. B18's four
stale passages are corrected in place. Pack bumps: hygiene `1.1.2` → `1.1.3`,
pre-commit `1.1.2` → `1.1.3`, mise `1.4.0` → `1.4.1`; vwf `19.39.0` → `19.40.0`,
stackgen `1.23.0` → `1.23.1`, site `1.1.35` → `1.1.36`.

## The alternatives rejected

- **Report only, or move only, for a root tool config** — report leaves the
  repo's gate settings unread and the pack's landing over them; move-only takes
  a decision the user may not want, and a twin the tool reads root-first would
  be moved to where the tool never looks.
- **Keep basename matching in the rename map** — a root file named like a
  shipped task is not that task, and the collision is silent.
- **Binary replace-or-keep for `.gitignore`** — a keep leaves the base sections
  out forever; a replace drops the repo's own patterns.
- **Silent hook-manager switch** — a team's installed hooks stop running the
  morning after a reshape, with nothing in the plan saying so.
- **Skip §3/4/8/9/10 in `shaped` mode** — the questions are asked in every mode;
  answering and running nothing on the answers was the hole.
- **Region-specific splice rules for pack-task rewrites, or dropping the
  `--update` / `--upgrade` flags** — decision 6 accepts the drift-until-reshape
  reading instead.
- **Defer `kept_files` and `editor_keys` and re-ask every reshape** — a record
  with no home is a question asked forever; the stub costs one create row.
- **Leave B18's passages to docs-sync** — they are pack prose init cites, not
  human docs.
- **A review row, per-unit pack bumps** — prose and one payload comment; the
  pins and inventory land in one commit.

## Still out of scope

- The git pass, branch names, a detached member (B3, B13, G6, L14) — plan 4.
- Rendering the hygiene root set from answers, the editor baseline split, the
  gate values, the `setup:ai` graphify post-commit hook, and whether
  `renovate.json` lands at all beside a Dependabot policy — plan 5.
- A consent row per first-run effect (L8: the format hook is staged-files only;
  the whole-tree reformat is the merge safety net's) — decision 10.
- Wave review, contested at the round cap: pass 1's keep-both bullet assumes a
  `.config/` twin and an unread-by-the-gate line; the dependabot keep-both row
  has neither, and the reviewer left it.
- B28 closes when plan 5 lands; this landing's `done` may need the item moved
  back to Backlog by hand.
