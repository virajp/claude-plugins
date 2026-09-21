# Decision — a pack file may be conditional on an answer init holds; the editor baseline is editor-wide; the gates share one exclusion set

**Date** 2026-09-22 · **Branch** `2026-09-20-pack-intent-rendering` · **Plan**
[`docs/plans/2026-09-20-pack-intent-rendering/`](../../plans/2026-09-20-pack-intent-rendering/index.md)
· **Backlog** B28, piece D2, plan 5 of 5 — **B28 closes here** · **Problem**
[`2026-09-20-init-shape-audit.md`](../problems/2026-09-20-init-shape-audit.md)
(candidates 14, 15, 16 and 19; closes L9, L10, L11, L12's rendering half, L13,
L17–L22, G9, G11, G12)

## What was decided before

The pack format had no per-file condition. `pack.yaml`'s keys were the manifest,
the servers, the harness map; the only condition anywhere was the bundle-level
`unconditional: true`, and the sole per-path switch was `config/_<name>/`,
pack-private and never copied. So the hygiene pack landed its three
`.github/ISSUE_TEMPLATE/` forms on a GitLab repo, its `renovate.json` beside a
Dependabot policy, and a `fnox.local.toml` ignore line in a repo on doppler or
on no provider; every pack's `vscode.d/` fragment landed in a repo nobody opens
in VS Code, and `setup:vscode` composed them there. Init asked seven questions
and knew nothing of the editor or the update bot. The hygiene editor fragment
carried Node, Dart, Astro, pnpm and Turbo keys against its own rule that a
tool-naming key belongs to that tool's pack, and the dprint fragment bound
`editor.defaultFormatter` editor-wide — overriding Dart's formatter by
composition order. Four exclusion lists — `dprint.json`, `taplo.toml`, the
gitleaks allowlist, the pre-commit global `exclude` — restated the same trees in
four syntaxes, and nothing held them together: the pre-commit one had drifted to
`^graphify-out/` alone. `bundles/repo-gates.md` still claimed each gate shipped
a `pre-commit.d/` fragment, and the hygiene `CONTRIBUTING.md` named `/vwf:init`,
which nobody can type.

## What changed

**`conditional:` is an optional `pack.yaml` key.** Each entry is a `config/`
path or glob, spelled as the pack's tree spells it before the `p/_project/`
rename, and a `when:` map of **exactly one axis to one value** from a fixed
vocabulary: `forge` (`github`, `gitlab`), `editor` (`vscode`), `secrets` (a
capability-provider slug), `update_bot` (`renovate`, `dependabot`, `none`). A
path not named is unconditional — the key narrows, and absence is what every
existing pack already had. A glob names a set; a file depending on two answers
is two entries on one path, both of which must hold. `unconditional:` stays the
**bundle's** word and `conditional:` is the **file's**: an unconditional bundle
may carry a pack whose issue forms land only on GitHub. Rule 11 gained an eighth
assertion over it — a relative path with no `..` matching at least one file
under `config/` by the checker's own walk (so `**` enters `.config/`), one known
axis, a value it takes, `secrets: none` refused.

**The materializer evaluates, records and skips; nothing else reads the key.**
Evaluation sits at the end of step 1, after the landing set is assembled and
before the collision check, against an optional `answers:` map the caller passes
beside `repo:`. **False** — the axis is answered and differs — drops the path;
**unanswered** reads **true** and lands it, so a caller that passes nothing
lands what it always landed. A dropped path the lockfile has **never landed** is
written to a new `skipped:` list as `{ path, pack, when }` — never a create,
never a conflict, no hash; a file already there is the repo's own. A dropped
path that **has** an `entries:` record keeps it, is never removed and is named
in the plan as *landed earlier, condition now false — kept*: a path is in
`entries:` or `skipped:`, never both. A run rewrites `skipped:` **for the packs
it evaluated** only, since it materializes one slug and can judge no other
pack's conditions. The plan lists skips under their own heading, present even
when empty, not deselectable. `/vwf:doctor` treats a `skipped:` path as
intentionally absent, never missing, and a file at that path as the repo's own —
never a drift row; an `entries:` path is hash-checked whatever its condition
reads today; and one new row reads the config: a pinned provider with a row in
the hygiene provider table must have its ignore section, else drift naming the
provider.

**Init asks nine questions and passes every answer.** Question 7, the
**editor**, once per product — is VS Code in use, defaulted yes where any
resolved repo carries `.vscode/` or `code` is on `PATH`, the question saying
which decided it. Question 8, the **update bot**, one row per repo — `renovate`,
`dependabot`, `none` — seeded from the survey: a renovate spelling from the
tool-config table preselects `renovate`, `.github/dependabot.yml` preselects
`dependabot`, neither preselects `renovate`, both preselects `renovate` and says
so. Every fetch — the three baselines and the provider — carries an `answers:`
map keyed `forge` (from each repo's `origin` host, `github` or `gitlab`),
`editor`, `secrets` (question 4's slug) and `update_bot`. **Every key is always
present, and `none` is the spelling of no answer** — because an omitted axis is
a silent yes. On `forge`, `editor` and `secrets` `none` is init's **no-match**
value: no `when:` names it, so the file is skipped (a repo with no remote gets
its forge files on the reshape after the remote). On `update_bot` alone `none`
is a **legal `when:` value**, so a pack may condition a file on no bot being
picked. Init evaluates nothing itself. Nothing about the two answers is written
into the tree; a later run asks again, defaulted the same way. The editor merge
takes only fragments that **landed** — in the tree and carrying an `entries:`
record, minus this run's skips — so an editor **no** composes nothing and a
hand-written `.vscode/` file is left as it was; an editor block an earlier run
merged is left as-is on a later no.

**The hygiene conditions.** `.github/ISSUE_TEMPLATE/*` on `forge: github`,
`renovate.json` on `update_bot: renovate` (beside the yield rule, which covers a
repo that already has a policy), and `.config/vscode.d/repo-hygiene.jsonc` on
`editor: vscode`. The `fnox.local.toml` line left the base `.gitignore`: the
stack read passes the pinned provider slug as one more component, and the
hygiene ignore table gained a **provider** section — fnox's `fnox.local.toml`,
doppler's `.doppler/` (added on doppler's own conventions, G-3) — appended under
a banner named for the slug, only in a repo that runs that provider.
`setup:vscode` is not gated; `CONTRIBUTING.md` names `/vwf:setup`'s forge pass;
`bundles/repo-gates.md` says no gate ships a hook fragment.

**Every editor fragment is conditional on the editor** — all ten: hygiene,
dprint-editor, pre-commit, eslint, ruff, tsconfig, analysis-options, mise, and
the two new ones. R7's late re-run found eslint, ruff and mise shipping a
fragment with no `conditional:` (L1); their `pack.yaml` files were widened into
U4's Owns and conditioned, and `mise.jsonc` no longer lands on every repo.

**The editor split.** The hygiene fragment keeps editor-wide keys alone
(indentation and suggestion defaults — format-on-save is the dprint fragment's —
todo-tree, the non-stack nesting rows, the generic extensions). Moved:
`node_modules`, the two tsbuildinfo excludes, the template-string converter keys
and its extension, `*.js` nesting → the tsconfig fragment; `.dart_tool` →
analysis-options; `.astro` → a **new** `framework/astro` fragment; `.turbo`, the
pnpm lockfile exclude and the `package.json` children → a **new**
`package-manager/pnpm` fragment (Turbo is a generated component the pnpm-turbo
bundle carries, so its exclude lives beside the manager); `yaml.*` and
`redhat.vscode-yaml` → the pre-commit fragment; the fish extension **dropped**.
`editor.defaultFormatter` is set per language in the dprint fragment — a
`[<language>]` scope per plugin `dprint.json` carries, `[toml]` to
even-better-toml — never editor-wide. L18: the even-better-toml fallback keys
now equal `taplo.toml`. L19: `.env` nests under `.gitignore` only, `CLAUDE.md`
under `readme.md` only, the `AGENTS.md` parent dropped whole. `.editorconfig`
and `.gitattributes` keep their stack lines — one file, no fragment mechanism.

**Rule 15 — three formatter lists equal, the scanner a subset (ruling 5a).** The
plan's decision 5 asked for four-way equality; at wave 1 U2's rule was red on
six entries the three formatter lists carry and `gitleaks.toml` — which no unit
owned — lacked, and the gitleaks header forbids allowlisting tracked trees. The
run-time ruling: the dprint pack's `dprint.json` and `taplo.toml` and the
pre-commit global `exclude` are the **formatters'** three and state one set; the
gitleaks `[allowlist] paths` is the **scanner's** and is held to a **subset** of
their union, never the reverse — the pack extends upstream's default config,
whose built-in allowlist already skips `.git`, `node_modules` and the named
lockfiles; `.claude/` is authored source a scanner must scan; a generic `*.lock`
is broader than upstream's named list. The set is twelve entries: `.claude`,
`.git`, `.turbo`, `.venv`, `build`, `dist`, `graphify-out`, `node_modules`,
`target`, `*-lock.json`, `*-lock.yaml`, `*.lock`. The pre-commit exclude is a
`(?x)` block, one `(^|/)`-anchored alternative per line; the gitleaks allowlist
gained `(^|/)\.turbo/` and every entry is anchored (S1 — `\.turbo/*` matched
`foo.turbo.ts`); `.env`/`.env.*` are **not** in gitleaks — its header forbids a
mode-wide `.env` allowlist, `code:sec` adds it at scan time. Normalisation
strips anchors, `**/`, `\.` escapes, `[^/]*` and `.*`, and a trailing `/`, `/*`
or `/**`; a list absent from the tree is left out of the compare, a file present
but unparseable is its own finding. `trailing-whitespace` gained
`exclude: \.md$` (two spaces are a hard break; `.editorconfig` agrees). The
grype threshold and the branch literals stay as they are.

**`.claude/` stays formatter-excluded** — an F2 ruling to drop it was
**withdrawn**: in a shaped repo `.claude/` is machine-owned (materialized pack
skills, the stackgen lockfile, agent-rewritten settings) and formatting it
breaks the first hook run; the dprint pack's doctrine ("do not delete that
line") stands, and the scanner still walks it.

**Rule 11 also refuses** an absolute or `..` conditional path, and its globs are
resolved by the checker's own walk rather than `globSync`, which skips
dot-directories (N4); the `secrets` axis refuses `none` (N5); a trailing `**`
compiles to a whole-set matcher (N6); a pipe inside a bracket class is not a
split point and a second alternation group is refused as unreadable (N7).

Versions: vwf `19.41.0` → `19.42.0`, stackgen `1.24.0` → `1.25.0`, site `1.1.37`
→ `1.1.38`; hygiene `1.1.4` → `1.2.0`, dprint `1.0.1` → `1.1.0`, pre-commit
`1.1.3` → `1.1.4`, gitleaks `1.1.1` → `1.1.2`, and tsconfig, analysis-options,
astro, pnpm, eslint, ruff and mise each minor. No public release; the tags wait
for the next `/release`.

## The alternatives rejected

- **Folding the two questions into existing rounds** — the editor is a product
  fact and the bot a per-repo file; each is its own round.
- **Gating `setup:vscode`** — the task skips on its own without `code`,
  `REPO_NAME` or `extensions.json`; unchanged.
- **Keeping the baseline whole** — the hygiene pack's own rule says a
  tool-naming key belongs to that tool's pack; applied to its own fragment.
- **Rendering the exclusion lists from one list at init**, the grype threshold
  or the branch literals as values — a checker invariant is enough; rendering is
  a later plan if ever.
- **Strict four-way equality** — widening gitleaks to `.claude/` and `*.lock`,
  or formatting lockfiles; both wrong on their own terms (ruling 5a).
- **A valueless axis reads false** (U5 round 1) — superseded by every key
  present and `none` explicit, since an omitted key is a silent yes.
- **Removing a landed file whose condition turned false** — kept; removal is the
  user's, through sync or removal, never a side effect of an answer.
- **Doctor flagging a file at a skipped path as drift** — it is the repo's own;
  no reshape could clear it while the answer stands (N2).
- **Per-unit pack bumps** — the pins and the inventory land in one commit.

## Still out of scope

- **G-2 and G-7 — a follow-up plan.** `setup`'s materialize pass and
  `stackgen-sync` pass no `answers:`, so an architecture-pinned pack's fragments
  (tsconfig, astro, pnpm, analysis-options, eslint, ruff) land unconditionally
  after an editor **no**, gain `entries:` records and are kept for ever;
  `stackgen-sync` never reads `skipped:`, so a skipped file re-enters its
  derived landing set; a repo initialised before `git remote add` skips its
  forge files until a hand `/vwf:setup reshape`, no predicate comparing
  `skipped[].when` to the current answers; a removed pack's `skipped:` rows
  linger (L6). The fix is a home for the four answers in `.config/vwf.yaml` (a
  `config_format` bump) and the two passes forwarding them.
- **G-6 — a checker follow-up, contested at the cap**: `tomlStringList` reads
  the first line-start `paths =` (a rule-level allowlist above `[allowlist]`
  would shadow the global one); the `secrets` axis admits any slug rather than
  checking `stacks/capability-provider/*`; the `(?x)` comment strip runs before
  escapes and classes, so a `\#` or `[#]` truncates silently.
- **G-8 — a design choice for the user**: the pre-commit global exclude, now one
  of the three formatter lists, also removes lockfiles and `.claude/` from the
  checking hooks (merge-conflict, syntax, large files, detect-private-key);
  security rated it INFO since `code:sec --staged` always runs. The alternative
  is per-hook excludes on the format and lint hooks alone.
- **G-5** — every fragment header still reads `/vwf:init merges …`, an
  untypeable command; consistent across the siblings, for the next reshape.
- Per-stack `.editorconfig` / `.gitattributes` sections — parked; would need a
  section-contribution mechanism like the ignore sections.
- The graphify post-commit hook (the rest of L16) — not a finding.
- **G15 — member gate-config drift** is B55, its own plan.
- This repo's own copies of every pack file — the next `/vwf:setup reshape`,
  which is also what proves the conditionals (GitHub, VS Code, Renovate here; a
  GitLab or Dependabot repo where the skips show).
