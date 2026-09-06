# U3 — Docs reconciled; the sibling-bundle decision and the three amendment reversals recorded

- **Wave:** 2
- **Depends on:** U1, U2, U5, U6, U7, U8, U9, U10, U11
- **Owns:** `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/stackgen-plugin/**`, `.claude/skills/plugin-authoring/**`,
  `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/*`. Touch nothing outside this list.
- **Model:** inherit
- **Read first:** index.md's **Facts** and **Run log**, then the
  `docs-reconciler` findings the orchestrator passes in, then every
  `DOCS FALSIFIED:` line the wave-1 units returned.
- **Lazy-load:** the wave-1 diff for any passage whose falsification you need to
  verify rather than take on report; the required plan's docs commit
  (`50008365`), so the manual's Cloudflare entry, this plan's Astro entries and
  the init passage read as one story;
  `docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md` and
  `2026-09-05-vwf-init-and-the-repo-shape.md` for the voice and shape of a
  decision doc that records a reversal.

## Ruling

The whole assumed-decisions table, as the docs must describe the tree that
landed. For the Astro half: D1 (a sibling bundle per mode, on the CLI
precedent), D3 (one pack, both modes) and D5 (the named dist fact) — and the
framing that this is **not** a reversal of the 2026-08-17 north-star decision.

For the amendment, the three confirmed reversals:

1. "The fence's editor-settings clause is narrowed to 'nothing a pack cannot
   compose': whole `.vscode/` files stay outside, fragments merged by init come
   inside. `dprint.json` joins `eslint.config.mjs` as a root shim whose only
   content is a pointer into `.config/`."
2. Init now touches git history — D16, D17, D18 — replacing `new-repo.md:20`.
3. The slug reason — D15 — replacing the 2026-09-05 wording in
   `materializer.md:57-68`.

And the user's framing, to be quoted where the manual explains why the baseline
is what it is: "while I am open-sourcing this for the world, it's specifically
designed for my way of using and setting up projects, that's why it's
`opinionated`."

## Edits

1. **`docs/memory/decisions/2026-09-05-astro-modes-are-sibling-bundles.md`** —
   new. What was decided (one real `framework/astro` pack carrying both output
   modes; three `site` bundles; the dist contract as a named fact in the
   framework pack's conventions), the alternatives rejected from the table (a
   mode field, a per-project setting, two packs, keeping `@generated`, folding
   React in, a `build_output:` payload field), why (the first real greenfield
   run; the frontmatter has no mode key; SSR is load-bearing in the existing
   body; the CLI precedent), and the explicit note that the north-star
   decision's "closed menu" objection is not reopened because the generator's
   open entry still ships.
2. **`docs/memory/decisions/2026-09-06-editor-fragments-inside-the-fence.md`** —
   new. The reversal: what the fence said (editor settings outside, decided
   2026-09-05 and reopened once for gate configs), what changed (per-pack
   `vscode.d/*.jsonc` fragments composed by init; `dprint.json` as a root
   `extends` shim, and why a shim and not a symlink — dprint's discovery is
   root-only and `extends` takes a relative path), the alternatives rejected
   (one whole hygiene payload; a user-level profile for the common set; a
   symlink), the two facts that forced it (recommendations are per-workspace and
   only prompt; the user's real repos carry byte-identical settings by hand),
   and the per-repo profile mechanism with its one-time cost stated plainly.
   Quote the user on grouping.
3. **`docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md`** — new.
   The reversal of "nothing else in this pipeline touches git history": the
   branch sequence (D16), the two consents (D18), the forge default (D17), the
   pre-commit-first commit and why (defect 9), what stays outside (init never
   writes to `~/.config`, never resolves a conflict, never pushes without the
   second consent). Quote the user's rulings verbatim.
4. **`docs/memory/decisions/2026-09-06-project-ids-are-slugged.md`** — new,
   short. The measured mechanism (the last-segment extension rule and
   `_default`), the asset that now defines the id, the four surfaces, the
   correction of the 2026-09-05 reason, and that `REPO_NAME` carries the slug.
5. **`site/src/content/docs/plugins/stackgen.md`** — (a) Astro: wherever the
   manual lists project-axis bundles or the `site` platform, the three Astro
   bundles, one sentence each, and that all three pin the `astro` pack; the
   framework pack beside `effect` wherever framework packs are listed; the dist
   contract stated once, cross-linking the Cloudflare Workers entry. (b)
   Amendment: the fence passage names editor fragments as inside and whole
   editor files as outside; the allowlist enumeration gains the five names; the
   config-tier ownership list gains the mise pack's editor task and the gate
   packs' fragments; `:429-436` (the merge tasks) gains the branch-exists
   predicate; `:444` and the lockfile sentence state the per-config, tracked
   rule; `:501-510` (the `p:<id>` groups) says where `<id>` comes from and that
   it is slugged, citing the asset; the mise pack's entry names `REPO_NAME`,
   `setup:vscode`, `setup:default-branch`, `code:count` and the three settings;
   the pnpm pack's entry names `.npmrc` and the `npx` alias; the eslint gate's
   entry names `.config/linter.yaml`; the hygiene pack's entry names
   `.graphifyignore`, the graphify ignore section, `CONTRIBUTING.md` and the
   issue templates. Every link and anchor must resolve — `site:check` is the
   gate.
6. **`site/src/content/docs/plugins/vwf.md:770-847`** — the init passage gains
   what it never had: the branch model (develop first on an empty repo, both
   branches always, the forge-default question), the two consents at the end,
   the pre-commit-first commit on an existing repo, the editor composition
   (named through the packs, one paragraph), the four marked positions including
   `REPO_NAME`, the slug with one example, and a **when to run it again**
   paragraph per D23 naming the doctor finding. The doctor page gains the
   finding. Do not name the editor, the forge or their CLIs in the vwf page any
   more than the skill does; say the pack tasks do.
7. **`site/src/content/docs/how-to/**`** — only where a how-to walks through
   init or a first commit and is now wrong; one clause each.
8. **`.claude/skills/plugin-authoring/references/checks.md`** — rule 11: the
   allowlist enumeration gains the five names and the `.github/` directory with
   its workflow refusal; the fragment parse (`vscode.d/*.jsonc`, three keys) and
   the whole-pre-commit-config parse are listed as what the rule asserts. Rule
   10's note, if it lists what vwf may not name, gains the sentence that init
   names pack tasks and conventions instead.
9. **`.claude/skills/stackgen-plugin/SKILL.md`** — (a) Astro: wherever it says
   only one framework pack exists, or lists `framework/*` refs as all
   `@generated`, update; the counts are generated (`inventory.md`) — never
   hand-type one. (b) Amendment: the config-tier entries gain the editor
   fragment as a kind of entry (with the letter U5 assigns it, if the
   enumeration is lettered) and the root shim; the "where output lands" section
   names the two editor files init composes; the `p/_project` rename cites
   `ids.md`.
10. **`.claude/skills/vwf-plugin/**`** — the init row of the skill table gains
    the git pass and the re-run doctrine; the doctor row gains the finding;
    anything saying init never commits is corrected.
11. **`.claude/docs/repo-shape.md`** and
    **`.claude/docs/ci-and-releases.md:30-33`** — where they restate what rule
    11 checks or the branch model, one clause each; leave `:104-108` alone
    (parked).
12. **`readme.md`** and **`CLAUDE.md`** — only if a passage is falsified: the
    "Plugins" table cell for stackgen if it enumerates what the packs ship; the
    workflow sentence if it says init leaves git alone. Expect one clause or
    nothing.
13. Every `DOCS FALSIFIED:` line the wave-1 units returned — including any in
    `plugins/stackgen/skills/stackgen-sync/SKILL.md` or the packs' own prose
    that no wave-1 unit owned — verified against the diff before applying. **A
    falsified passage under `plugins/` is not yours to edit**: report it back as
    `DOCS FALSIFIED:` with the owning unit named, and the orchestrator routes
    it.

## Verification

- `mise run site:check` exits 0.
- `mise run plugins:check` exits 0.
- `dprint check` clean over every dprint-formatted file you touched
  (`readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/**`, `site/src/content/docs/**`, `docs/memory/decisions/*`) —
  run the formatter, do not hand-pad.
- `ls docs/memory/decisions/2026-09-05-astro-modes-*.md docs/memory/decisions/2026-09-06-*.md`
  lists four files.
- `grep -n "setup:default-branch\|REPO_NAME" site/src/content/docs/plugins/vwf.md site/src/content/docs/plugins/stackgen.md`
  hits both files.
- `grep -rn "never touches git\|touches git history" site/ .claude/ readme.md CLAUDE.md`
  returns nothing that still asserts it.

## Guardrails

- Do not edit anything under `plugins/`; report a stale passage there as
  `DOCS FALSIFIED:`.
- `cat` is aliased to `bat` — Write/Edit only. A pipe containing `npm` is
  rewritten to `pnpm` — use Write for any such line.
- Do not describe `framework/react@generated` as a gap; describe it as the
  generated path, which is first-class.
- The decision docs quote the user's rulings verbatim where the plan quotes
  them; they do not paraphrase a quoted ruling.

## Commit

`docs: document the astro pack and site bundles, init's git pass, the editor fragments and the slug`
— written by the orchestrator after the wave gate, not by the unit.
