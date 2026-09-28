# U1 — tool-config gains git, graphify and renovate

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `SKILL.md` whole; `references/pre-commit.md` (the raw-hook
  strip :343-348 and the convention-file section); `references/mise.md` (the
  upgrade verb and the lock); `assets/mise/.config/mise/tasks/setup/precommit`
  :120-145; the repo-hygiene pack's `conventions.md` :13-162 and :245-270 and
  its `config/.gitignore`, `config/.gitattributes`, `config/.graphifyignore`,
  `config/renovate.json`; init's `references/existing-repo.md` pass 8 (:636-680)
  and `references/fragments-and-sections.md` :16-118 as source material only;
  index.md's Facts.
- **Lazy-load:** `references/dprint.md` for how T2 wrote a tool reference.

## Ruling

> - Decision 1: Split by kind: the config files become tool-config tools; the
>   prose files and the VS Code baseline become init's own assets.
> - Decision 2: Three new tools — `git` (`.gitignore`, `.gitattributes`),
>   `graphify` (`.graphifyignore`, plus its `.gitignore` lines as a `graphify`
>   block through `git add ignore`), `renovate` (`renovate.json`, only on
>   `update_bot=renovate`, keeping the yield rule). `all` lands eight tools, the
>   three after the five. Each gets `references/<tool>.md` and `assets/<tool>/`.
> - Decision 3: A pack asks with `git add ignore <pattern…>` or
>   `git add ignore template=<Name>` in its `tool-config:` list, or both. A
>   template is fetched from github/gitignore into the pack's block; one several
>   packs ask for is written once and removed when no requester is left (the
>   shared-entry rule). init's fallback fetches a template only for a detected
>   language no pack covers, as a `gitignore:<Name>` block. The provider rows
>   retire into fnox's and doppler's `pack.yaml`. The template table moves to
>   `references/git.md`.
> - Decision 4: The lock records the upstream commit SHA per template (resolved
>   with `git ls-remote https://github.com/github/gitignore main`, fetched from
>   `raw.githubusercontent.com/github/gitignore/<sha>/<Name>.gitignore`);
>   re-runs fetch the same SHA, so drift is a real local edit; the tool-config
>   upgrade verb re-fetches `main` and moves the SHA inside its consent.
> - Decision 5: `git add attribute <pattern> <attr…>`. The base `.gitattributes`
>   keeps the universal lines — `* text=auto eol=lf`,
>   `*.lock linguist-generated`, the binaries — and no `merge=graphify`; a pack
>   adds its own lockfile's generated marker when the lockfile does not end in
>   `.lock`.
> - Decision 6: Entries inside a `.gitignore` block keep written order, never
>   sorted, so a negation follows its pattern — an exception to the sorted-block
>   rule. The base is one `git` block with its banner comments kept inside it.
> - Decision 7: The normalised comparison (leading and trailing `/` stripped,
>   `**/` ignored, blanks and comments skipped) stays: a non-negation pattern
>   the file already carries is not written again.
> - Decision 8: On adoption the git tool converts landed banner sections: one
>   whose content matches the retired base section or a fetched template becomes
>   the matching block; anything else stays outside every block as the user's.
>   init's section merge is removed.
> - Decision 14: The raw-hook strip in `setup/precommit` also removes a
>   `merge=graphify` line from `.gitattributes` and every `merge.graphify.*` key
>   from the local git config; it never deletes `.gitattributes`.
> - Decision 15: The commit-type rename table and its "a type in neither column
>   is asked" rule move into `references/pre-commit.md` as an adoption conflict
>   row; init's pass 8 is removed and later passes renumbered.
> - Decision 25: Any comment or sentence a unit adds is one line (B65).

## Edits

1. **`assets/git/`** (new) — `.gitignore`: the retired base's eight sections as
   one `# >>> git` … `# <<< git` block, banners and why-comments kept inside,
   minus the `graphify` section (moves to graphify) and minus the stack-append
   marker :71-72. `.gitattributes`: `* text=auto eol=lf`,
   `*.lock linguist-generated`, the binaries, as a `git` block; no
   `pnpm-lock.yaml` line, no `.config/mise/mise.lock` line (covered by
   `*.lock`), no `merge=graphify`. Copy text from the pack; do not retype.
2. **`assets/graphify/`** (new) — `.graphifyignore` from the pack, as a
   `graphify` block.
3. **`assets/renovate/`** (new) — `renovate.json` byte-copied from the pack
   (plain JSON: no markers, keys recorded in the lock).
4. **`references/git.md`** (new) — the tool's doctrine: the two files; verbs
   `add ignore <pattern…>`, `add ignore template=<Name>`,
   `add attribute <pattern> <attr…>`, `remove`; decision 6's order exception and
   decision 7's no-doubling rule; decision 4's pin, the lock shape for a
   template SHA, and the upgrade path; the fallback for an uncovered language
   (`gitignore:<Name>` block, requester init) and the template table's fallback
   rows (go, rust) plus which pack asks which template; the "detected language
   with no row is proposed, never guessed" rule; decision 8's adoption and
   banner conversion; the seam with secret scanning (conventions :150-162).
5. **`references/graphify.md`** (new) — `.graphifyignore`, and that the tool
   asks `git add ignore graphify-out/* !graphify-out/GRAPH_REPORT.md` for its
   own block, in that order.
6. **`references/renovate.md`** (new) — the policy, the root location and why
   (conventions :245-270), the yield rule over every spelling, and the
   `update_bot: renovate` condition — a repo on dependabot or none gets a
   Skipped row.
7. **`SKILL.md`** — the tools table gains git, graphify and renovate (eight);
   `all` lands them after the five and reads `update_bot` for renovate; the
   block grammar names the `.gitignore` order exception; the verb list and
   lock-record section name the template SHA; the description names the three
   tools.
8. **`references/pre-commit.md`** — adds the commit-type adoption step (decision
   15): the rename table from init's pass 8 and the ask-for-unknown rule, as a
   conflict row; the raw-hook strip text (:343-348) names the merge driver
   removal.
9. **`assets/mise/.config/mise/tasks/setup/precommit`** — decision 14: after the
   raw-hook strip, delete any `merge=graphify` line from `.gitattributes` and
   run `git config --local --remove-section merge.graphify` when present; never
   delete the file. POSIX sh, BSD sed-safe.
10. **`assets/pre-commit/.config/pre-commit-config.yaml:194`** — the comment
    stops naming `.editorconfig`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:plugins:shellcheck` green (the `setup/precommit`
  edit)
- every new asset passes the shipped dprint config: run the skill's own
  `assets/dprint/.config/dprint.json` over them, never this repo's
- `grep -rn 'merge=graphify\|editorconfig' plugins/stackgen/skills/tool-config`
  returns only the strip's own match
- in `assets/git/.gitignore` no negation precedes the pattern it re-includes

## Guardrails

- Read the repo-hygiene pack; never edit or delete it — U7 does.
- Do not touch init's files — U2 removes pass 8 and the section merge.
- `plugins/**/*.md` is not formatted: match the fold width by hand.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: tool-config gains git, graphify and renovate` — written by the
orchestrator after the wave gate.
