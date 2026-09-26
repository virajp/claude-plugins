# The Tool-Config Table

The root spellings a repo may already carry for a tool a pack ships, and what
the survey does with each. The existing-repo pipeline's **pass 1** reads this
table: beside the allowlist and the rename map it walks the root and the
inside of `.github/` for every spelling in the second column, and each hit is
one **plan row** whose outcomes — move by default, keep both, delete only on
the user's explicit pick — pass 1 states and this file does not restate; a
`handed` row's hit is the one exception, and is no row of init's. The table is
the list of what to look for and the shape the move takes; the offer, the
consent and the report are the pipeline's.

The first column is the tool, the second its known root spellings, the third
the path the pack's `config/` tree lands the same tool's configuration at, and
the fourth the merge shape — one of three:

- **`move-and-offer`** — the repo's file becomes the `.config/` copy, and that
  copy is then offered through pass 6 against the pack's, exactly as any
  other pack-owned file whose content diverged: replace, or keep. Nothing is
  read and dropped; the settings the repo had are what the offer shows. Where
  the pack also lands a root stand-in of the same basename, this is pass 1's
  move-and-shim case, and the stand-in takes the root spot the real file left.
- **`yield`** — the repo's file wins and the pack's twin is **not landed**;
  the plan says so in that row, and nothing is moved. This is the shape for a
  tool whose discovery is root-first and whose pack file is itself a root
  file: moving the repo's copy under `.config/` would put it where the tool
  never looks.
- **`handed`** — the file is `/stackgen:tool-config all`'s to fold, by its
  own migration, and init writes no row of its own for it: not a move, not a
  keep, not a stray. The skill's rows — what it splits, what it deletes — are
  printed in the repo's section under **Tool-config rows**, per pass 1's
  toolchain migration, and the one consent covers them.

| Tool       | Root spellings                                          | Pack path                                                     | Merge shape      |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| pre-commit | `.pre-commit-config.yaml`                               | `.config/pre-commit-config.yaml`                              | `move-and-offer` |
| gitleaks   | `.gitleaks.toml`                                        | `.config/gitleaks.toml`                                       | `move-and-offer` |
| grype      | `.grype.yaml`                                           | `.config/grype.yaml`                                          | `move-and-offer` |
| dprint     | `.dprint.json`, root `dprint.json`                      | `.config/dprint.json`; root `dprint.json` is the pack's shim  | `move-and-offer` |
| renovate   | `.github/renovate.json`, `.renovaterc`, `renovate.json` | root `renovate.json`                                          | `yield`          |
| dependabot | `.github/dependabot.yml`                                | none — the pack ships no Dependabot file                      | `keep both`      |
| mise       | `.mise.toml`, root `mise.toml`                          | `.config/mise/` — split by the skill, not moved               | `handed`         |

Two rows need a word:

- **dprint.** Root `dprint.json` is on the allowlist because the pack itself
  lands one there — the two-line stand-in that points at `.config/`. A real
  config of that name at the root is the move-and-shim case, not a
  keep-both: it moves, the stand-in replaces it, and the settings are read
  through the stand-in. `.dprint.json` has no stand-in and simply moves.
- **renovate and dependabot.** Renovate's discovery is root-first —
  `renovate.json`, then `.github/`, then `.renovaterc`, never `.config/` — so
  the pack lands its policy at the root, and a repo that already has one
  under any spelling keeps it and the pack's is not landed. A
  `.github/dependabot.yml` is the same job done by a different service, and
  its row is **keep both** — pass 1's outcome, not a third shape: the repo's
  file stays and is reported as a second dependency policy. Whether the
  pack's `renovate.json` lands beside it is not this row's to decide: the
  same evidence seeds question 8's update-bot row — a renovate spelling
  preselects `renovate`, a `dependabot.yml` preselects `dependabot`, both
  preselects `renovate` and the row says it found both — and the pack's
  file is `conditional:` on `update_bot: renovate`, so it lands only where
  that answer stands and is a **Skipped** row otherwise.

A tool `/stackgen:tool-config` owns has a `handed` row listing every root
spelling its migration folds, so the survey recognises the file without
acting on it — the skill's toolchain reference names the spellings, and this
row follows it. A tool with no row here is not on the survey's list: a root
file for it is off the allowlist and is reported, as pass 1 says, never moved.
Adding a tool to the packs, or a spelling to the skill's migration, means
adding its row here in the same change.
