# The checks

What `p:plugins:check` asserts, why each rule cannot be replaced by a type or a
format, and the one generated file that needs a freshness gate of its own.

## The gates

| Task                            | Does                                                                                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p:plugins:check`               | validates the authored tree; non-zero on any finding                                                                                                                                   |
| `p:plugins:marketplace`         | regenerates both marketplace manifests from the 2 plugin manifests, plus the `.dev-marketplace/plugins/` staging dir                                                                   |
| `p:plugins:marketplace --check` | asserts the committed manifest matches a fresh generation                                                                                                                              |
| `p:plugins:inventory`           | regenerates `plugins/stackgen/stacks/inventory.md` from the stacks tree, and asserts every bundle pin resolves to a pack at that version; `--check` asserts the committed file matches |
| `p:plugins:shellcheck`          | `shellcheck -x` + `shfmt -d` over every shell file a pack ships — task libraries and `_scripts/*`, then `hooks/*.sh`                                                                   |
| `p:plugins:npm-normalize-test`  | table-tests the pnpm pack's `npm-normalize.sh` through the system sed                                                                                                                  |
| `pnpm vitest run`               | the `scripts/` and `installer/` suites                                                                                                                                                 |

`p:plugins:marketplace --check`, `p:plugins:inventory --check` and then
`p:plugins:check` run in that order — **freshness before validity**, in
pre-commit and in `plugins.yml` alike — so a stale generated file fails as
staleness rather than as a confusing downstream assertion.

The `p:plugins:check` task is two readers, not one: the rules below, and then
`claude plugin validate --strict` over the marketplace and each plugin when
`claude` is on PATH — Claude's own view of the manifest, which the rules
deliberately do not restate.

`--check` exists because `marketplace.json` is generated **and** committed. That
combination has no other guard — a `plugin.json` edited without a regenerate is
invisible to every other check, and the committed file keeps advertising the old
version. It is the surviving fragment of the retired `plugins:render-clean`,
narrowed to the one file that still has the problem.

## The fifteen rules

Each is something no format and no type can state. The checker is deliberately
much smaller than the one it replaced: whole families of assertion became
*unrepresentable* rather than merely unchecked.

1. **Manifest name ↔ directory, and the version.** A plugin whose `name`
   disagrees with its directory installs under one and is referenced by the
   other. The same rule asserts the two things the `version` must be: **plain
   semver** — a tracked manifest carrying the `+N` the dev marketplace stages is
   a manifest nobody regenerated — and **free of a 13 or 17 component**, since
   those two integers are never issued on any version line this repo maintains.
   The component is what counts, not the digits: `1.13.0`, `17.0.0` and `2.1.17`
   fail, `1.130.0` and `113.0.0` pass, and a prerelease suffix comes off before
   the split so `1.0.17-rc.1` fails too.
2. **Dependency resolution.** Every `dependencies[].name` resolves to a plugin
   in this marketplace, with `"marketplace": "virajp-plugins"`. The marketplace
   entry is generated from the manifest, so the two can no longer disagree —
   what is left to check is that the name points at something.
3. **Hook scripts exist and are executable.** A `hooks.json` naming a script
   that is missing or non-executable fails at hook time, in a context with
   nowhere good to report it.
4. **Strict-YAML frontmatter.** Claude's parser is lenient and accepts what a
   strict parser rejects — and **a rejected skill is dropped silently**. This is
   the highest-value rule in the file. It reads every skill and agent a plugin
   ships **and** every `stacks/*/*/skills/*/SKILL.md` and
   `stacks/*/*/agents/*.md` a pack does — the pack half is the larger one, and
   it is what actually lands in a user's repo, where the host reading it is not
   this one. A pack's `rules/*.md` is left out: frontmatter is optional there.
5. **Example-bundle links.** Relative links under
   `plugins/vwf/assets/examples/**` resolve. That bundle is the worked "what
   good looks like" for a blueprint, so a broken link there teaches the wrong
   shape.
6. **Root-relative reference resolution.** Every root-relative reference in a
   plugin's prose resolves inside **that** plugin. See the trap below. A file a
   pack **lands** is skipped, because rule 13 owns it on stricter terms — so a
   bad reference there is one finding rather than two.
7. **Agent cross-references, both directions.** Every role-shaped `` `token` ``
   in a plugin's prose names a real agent of that plugin, and every declared
   agent is referenced at least once. Either direction alone misses a rename.
8. **The vwf design-adapter contract.** Every `design-tool` pack ships all three
   `design-import-*` skills, model-invocable. The checker discovers packs from
   `stacks/design-tool/<tool>/pack.yaml`, so adding a tool extends the rule
   without touching it — see stackgen's
   [artifact doctrine](../../../../plugins/stackgen/assets/artifact-doctrine.md)
   §2 for why a user-only adapter skill is worse than a missing one.
9. **The vwf stack-adapter contract, in both directions.** Every plugin
   keyworded `vwf-stack-adapter` ships `<plugin>-stack-menu` and
   `<plugin>-stack-template`, both model-invocable — **and** every plugin
   shipping either of those skills declares the keyword. Same failure as rule 8
   on the other constructed name: vwf never reads an adapter name from config,
   so a skill the model cannot see yields an **empty menu** rather than an error
   — and because the stack menu is closed, that silently removes every option
   the plugin was the only source of.

   Both skills carry **two** invocation keys: `disable-model-invocation: false`
   so vwf can reach them, and `user-invocable: false` so no user is offered a
   skill that answers only a program — an adapter replies in a payload shape
   only vwf reads. The explicit `false` on the first is asserted rather than the
   mere absence of `true`, because absence states nothing about the one thing
   vwf depends on.

   The converse direction is what keeps the rule alive. With `stackgen` the only
   adapter left, deleting that one keyword would have switched the whole rule
   off while `check()` still passed green. Now: drop the keyword and the skills
   still fire it; drop a skill and the keyword still fires it. Only removing the
   keyword *and* both skills clears it, which is a deliberate, visible
   retirement rather than an accident. It is the same
   two-directions-cover-each-other-on-a-rename idiom rule 7 uses for agent
   cross-references.
10. **The technology-free vwf guard.** Below.
11. **A pack's `config/` payload tier is materializable as-is.** Ten assertions,
    every one of them about a file whose failure mode in the *target* repo is
    silence rather than an error. The landed-tree assertions run over each
    `stackgen:tool-config` asset tree (`skills/tool-config/assets/<tool>/`)
    exactly as over a pack's `config/`, since the skill lands it whole at the
    repo root:
    - a **task file lands executable**. `config/.config/mise/tasks/**` is a
      *file-based* task library — mise runs each file directly — so one landing
      644 fails as an **unknown task** rather than as a permission error, which
      reads as a pack that never shipped it;
    - and **starts with a known shebang** (`bash`, `node`, `python3`). mise
      execs the file, so a missing or exotic one is an exec-format error at the
      first `mise run`, and the shell gate picks its dialect from the same line;
    - a **hook script** lands executable and shebanged too (`bash` or `sh`, a
      narrower set because a hook is wired into `settings.json` as a bare path).
      Same reasoning from the other end: a hook fault is the quietest fault
      there is, since nothing downstream ever reports that it did not run;
    - the tier's **root stays allowlisted**, and inside the one forge directory
      the list admits, a **workflow file is refused**. Read the list itself off
      `PACK_CONFIG_ROOT_FILES` and `PACK_CONFIG_ROOT_DIRS` in
      `scripts/src/check.ts` rather than from prose here — every prose copy of
      it has drifted at least once, and this one deliberately enumerates
      nothing. What the list is *for*: everything a pack configures belongs
      under `.config/`, so the root admits only what a tool or a host cannot be
      pointed elsewhere for, plus the files humans read first. A pack landing
      one more dotfile beside them is widening the root of every repo it
      materializes into, and each entry joins on the same argument — a tool with
      root-only discovery leaves a pack a choice between the root file and a
      flag on every invocation any caller might type, and the flag is the worse
      of the two. The forge directory is on the list for that same reason and
      the workflow is carved back out of it: a pack states which task CI runs,
      and the workflow is the repo's release model's;
    - a **pre-commit fragment parses** and declares a top-level `repos:` list,
      because `/vwf:init` concatenates the fragments into one config and a
      malformed one breaks a file no pack owns;
    - the gate pack's **whole pre-commit config parses** and declares `repos:`
      too. It is neither a fragment nor at the `config/` root, so the fragment
      walk never reached it — and until it was named, nothing parsed the base
      the fragments merge into at all;
    - an **editor fragment parses as JSONC** and carries only `settings`,
      `nesting` and `extensions`. `/vwf:init` composes the fragments into editor
      files no pack owns, and a fourth key is dropped without a word;
    - every **`conditional:` entry** in the pack's `pack.yaml` names a **path or
      glob that matches at least one file** under its own `config/` tier, and a
      `when:` map of **exactly one known axis** — `forge` (`github`, `gitlab`),
      `editor` (`vscode`), `secrets` (any provider slug — never `none`, the
      no-provider answer init reads as "no match"), `update_bot` (`renovate`,
      `dependabot`, `none`) — with a value that axis takes, and a path that is
      relative and carries no `..` segment. The materializer evaluates the key
      against the caller's answers, and an axis the caller did not answer reads
      as true — the omitted key lands the file. So an axis outside the
      vocabulary is one no caller ever answers: its condition can never skip
      anything, and the file lands everywhere, silently. A value the axis never
      takes is the mirror case — no answer ever satisfies it, so the file lands
      nowhere; a path matching nothing is a condition guarding no file, which is
      a rename that forgot the key — the glob is matched by the checker's own
      walk, so `**` enters dot-directories like `.config/`, which `globSync`
      would not; and an absolute path or a climb is rule 13's fault stated on a
      glob — it reaches out of what the pack lands. The finding names the pack,
      the entry's index and its path;
    - the pack's **three doctor- and setup-read facts** take the shapes their
      readers trust: every `languages[].facts.binaries` entry is a bare name
      (the `PATH` lookup) or a map of exactly `name` and an optional non-empty
      `probe` (the command `/vwf:doctor` runs instead); `lockfile` is a
      non-empty list of repo-relative paths or globs with no `..`; and every
      `machine_env` entry is a map whose `name` is an env-var name and whose
      `detect` and `question` are non-empty strings — and whose name is set by a
      `mise add env` entry of the pack's `tool-config:` list, since that line is
      what `/vwf:setup` fills. Each caller trusts the shape: a probe that is not
      a string is never run, a glob that climbs out matches something the repo
      does not own, and a name no call sets is a question whose answer lands
      nowhere — all silently. The finding names the pack and the entry;
    - every **`tool-config:` entry** parses as one of the three verbs a pack may
      ask for — `mise add tool <name> <version> to <scope>`,
      `mise add env <KEY>=<value> to <scope>` or
      `mise add alias <name>=<command> [to dev]` — the scope all environments or
      `dev`, `ci` or `test`; an env key an env-var name, an alias name a TOML
      bare key; a value quoted as a TOML basic string or bare and carrying no
      quote anywhere; and a template delimiter (`{{`, `{%`, `{#`) only inside an
      `add env` value, since mise renders it. The materializer runs each line
      through `/stackgen:tool-config`, so a line that does not parse is one the
      skill refuses at landing, in someone else's repo. And a pack's `config/`
      tier holding any mise `conf.d/` fragment is a finding: a pack asks for its
      mise lines through `tool-config:` and never lands the file.

    The walk is its own rather than the plugin file reader's, because every one
    of these paths runs through a dot segment the reader's glob does not descend
    into. `p:plugins:check` is the only reader that sees any of it before it
    lands in someone's repo.
12. **Retired vocabulary stated as live.** The recurrence class of every drift
    sweep: a token is renamed at its source of truth, the lineage records the
    rename, and a dozen other files keep using the old word as if nothing
    happened — nothing fails, because the old word is prose, not a reference. So
    the checker holds a **closed, case-sensitive list** of the retired spellings
    and scans every `.md`, `.yml` and `.yaml` file a plugin ships, line by line.
    It and rule 13 are the two rules that report a **line number**, because they
    are the two that fire on a sentence rather than on a file. Below.
13. **A landed pack file cites nothing by plugin path.** A pack's landed tiers —
    `skills/`, `agents/`, `rules/`, `hooks/`, `config/`, its `conventions.md`
    and a bundle's body — are copied into a target repo **verbatim**, and that
    repo has no plugin installed. So is every file under
    `skills/tool-config/assets/<tool>/`, which `stackgen:tool-config` lands
    whole at the repo root; the rule reads it as one landed tree. Inside the
    plugin every citation in them resolves, which is exactly why rule 6 was
    silent about all of them; after landing not one does, and nothing reports it
    — the reader is sent to a path that is not there. Four forms, matched
    separately because they fail and are fixed differently:
    - the **literal `${CLAUDE_PLUGIN_ROOT}`**, anywhere and even with no path
      after it, since outside a plugin the host expands it to nothing. This form
      is checked in every landed file, not only prose: a task script or a config
      fragment can spell it as readily as a skill;
    - a **bare `assets/…` path** ending `.md`, `.yml` or `.yaml`, which reads as
      repo-relative in the target and finds nothing there;
    - a **`../` chain that leaves the tree the file lands in**. Only a file
      under `skills/` has a tree to climb within: a pack's skills land as
      sibling directories under `.claude/skills/`, so a climb inside a skill's
      own `references/`, and one across to another skill of the *same* pack,
      both still resolve. Every other landed `.md` — an agent, a rule, a
      `conventions.md`, a bundle body — lands as a single file with nothing
      above it, so **any** climb at all is a break;
    - a **path into another pack**, `<type>/<slug>/` plus a segment: a sibling
      pack is materialized only when the composition picked it too, and even
      then it lands under its own template name rather than at that path.

    A **bare `<type>/<slug>`** — or `<type>/<slug>@<version>` — is the
    lockfile's and a bundle's identifier vocabulary and is never refused; only a
    trailing segment makes it a path. The last three forms hold for `.md` files
    alone and are matched after **fenced blocks are blanked to their own line
    count**: a shell script under `config/` legitimately points at files that
    land beside it, and a fence is a worked example — the `extends` samples in
    the `tsconfig` pack show a real relative path the *target* repo will hold.
    The blanking keeps the line numbers true, which is the finding's whole
    value. The fix is never another path: name the asset by role ("stackgen's
    secrets contract"), or state inline the rule it carries.
14. **At most one default bundle per axis per platform.** A bundle's frontmatter
    may carry `default: true`; the stack menu passes it through on every entry
    whose bundle carries it, and vwf's architecture menu preselects the one
    flagged entry among those it offers on a round — a list it has already
    filtered by the project's platforms — as a generic rule that names no tool.
    So across `stacks/bundles/*.md`, grouped by `axis`, two flagged bundles
    conflict when either declares no `platforms:` list (an absent or empty list
    means it is offered on every round of the axis) or their platform lists
    intersect — a conflict is not an error anywhere downstream, it is whichever
    sorts first, a nondeterminism a rename flips silently. An axis whose flagged
    bundles all declare disjoint platforms carries one default per platform. The
    value must also be boolean: the preselect asks for `true` and nothing else,
    so a string `"true"` or a YAML `yes` never preselects and reports nothing.
    The finding for a conflict names the pair and the platform(s) they share, or
    the file that declares no list; the finding for a non-boolean names the one
    file. It does not check that any bundle carries the flag — zero flagged is
    green, since an axis with no default is what every axis was before the flag
    existed — and it does not check that the flagged bundle's components
    resolve, which `p:plugins:inventory` owns.
15. **The formatters' exclusion lists state one set, and the scanner's allowlist
    is a subset of it.** The gate packs ship four lists of the trees a gate
    skips — `dprint.json`'s `excludes` and `taplo.toml`'s `exclude` (both in the
    dprint pack, both globs) and pre-commit's global `exclude` (one regex, whose
    top-level alternatives are the entries; a `(?x)` verbose pattern has its
    whitespace and comments removed first) are the **formatters'** three and
    must agree; the gitleaks `[allowlist] paths` (regexes) is the **scanner's**
    and is held to a subset of them instead. The formatters' convention is
    stated once in the pre-commit pack's conventions and copied three times in
    three syntaxes, so the drift is an entry added to some of the lists and not
    the rest — and no tool reports it, since each reads only its own list: the
    formatter simply formats the tree. The scanner is held the other way round
    because the pack extends upstream's default config, whose built-in allowlist
    already skips `.git`, `node_modules` and the named lockfiles, and `.claude/`
    is authored source a scanner must scan — so the formatters' set is wider
    than the scanner's by design, a formatter-excluded tree the scanner still
    reads is no finding, and a tree the scanner skips that no formatter excludes
    is one, naming `gitleaks.toml` and the entry: an allowlist entry with no
    generated tree behind it is a scanner quietly not scanning. Each entry is
    **normalised** before the compare — a regex loses its anchors (`^`, `$`, and
    the `(^|/)` or `(?:^|/)` that means "at the root or under any directory", a
    glob's `**/`), its `\.` escapes and its `[^/]*` or `.*` (a glob's `*`);
    every entry then loses a leading `/` or `**/` and a trailing `/`, `/*` or
    `/**`, the spellings of "this directory, wherever it sits" that the four
    tools take — so `**/dist/`, `**/dist/**`, `dist/*`, `^dist/` and
    `(^|/)dist/` are one entry, `dist`. The formatters' finding names the entry,
    the files that carry it and the files that do not. A list absent from the
    tree is left out of the comparison rather than read as empty, so a fixture
    holding one of the four files is not held to the other three; a file present
    but carrying no list at all, or one that cannot be parsed, is its own
    finding naming the file — nothing else parses `dprint.json`, `taplo.toml` or
    `gitleaks.toml`. Rule 15 reads those four paths and no others — a fifth list
    is a fifth entry in `EXCLUSION_LISTS`, not a wider walk — and its two TOML
    readers are deliberately narrow: `scripts/` carries no TOML parser, and a
    bracketed list of string literals is all either file holds.

### The plugin-root trap (rules 6 and 13)

`${CLAUDE_PLUGIN_ROOT}` resolves to **the plugin the file lives in**, and
nothing spells another plugin's root. So a reference to an asset a different
plugin owns resolves to nothing at runtime, silently.

This is not hypothetical. `plugins/typescript/stacks/deploy/npm-package.md`
pointed at `assets/delivery-pipeline.md`, which only vwf has. The template
spelled it with the own-plugin token, so it shipped broken in **all four**
render trees and no per-target check caught it, for months. The fix is to name
the contract and rely on the caller having it — vwf is what fetches those
conventions, and vwf owns the file.

The trap has a **landing-side half**, and it is worse: a file a pack lands is
copied into a repo where there is no plugin at all, so the token expands to
nothing and every plugin-relative path beside it resolves to nothing — including
the ones that were correct inside the plugin. That half is rule 13's, and the
fix above is its doctrine too: name what the path pointed at by role, or state
the rule it carries inline. Never replace one path with another.

### The technology-free guard (rule 10)

`TOOL_TOKENS` bans vwf prose from naming a concrete technology, **but only where
the mention prescribes**. An occurrence is exempt when another token of the same
vocabulary sits within 100 characters — listing the alternatives describes the
domain of a config key vwf owns, rather than recommending one. Fenced blocks are
stripped first, since a config example must show real values. The window is
character-based because every real enumeration in the corpus wraps mid-list.

The anchors are **asymmetric on purpose**: a banned token heading a hyphenated
compound is a hit (`grafana-side`, `npm-package`, `docker-compose`), one sitting
at the tail is not (`pnpm-workspace` is not an `npm` mention). The symmetric
form this started as let every compound head through — two escapes shipped in
vwf before it was tightened.

The MCP-server rule was **generalized at Wave D**. It used to match only
`mcp__plugin_design-tools_<token>`, the plugin-scoped prefix — but a design tool
now lands in the project's own `.mcp.json`, which scopes its server
`mcp__<token>__` instead, so matching the old prefix alone would have quietly
stopped catching anything. Both spellings are banned in vwf prose, which covers
a fourth design tool the day one is added.

**The manifest half is a different bar, on purpose.** The guard also reads vwf's
`mcpServers` `command`/`args` as one string per stdio server (an `http` server
has no runner in it to hardcode). A manifest has to name something executable —
`sh` is a tool name too — so the bar is not "names no tool" but **"the name is
overridable"**: `${VAR}` and `${VAR:-default}` expansions are elided before the
token scan, so a runner behind one passes and a fixed one is a finding. It was
added after `"command": "pnpm"` sat unnoticed in the context7 entry, which a bun
user cannot satisfy and which fails as a dead MCP server rather than as a
missing prerequisite; `${CONTEXT7_RUNNER:-pnpm dlx}` keeps pnpm as the
recommendation while letting another runner answer.

**Two design tokens are deliberately unbannable** and live in
`ENUMERATION_PEERS` instead — `stitch` (an ordinary English word the screens
doctrine leans on) and `lovable` (an ordinary adjective). They prove an
enumeration without being policed. The evidence set is wider than the
prohibition set on purpose.

### The retired-vocabulary rule (rule 12)

`RETIRED_TERMS` in `scripts/src/check.ts` is what it matches — each entry a
class of finding the 2026-09-04 sweep found recurring across files, never a
one-off:

| Term                  | Fires on                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| the `web` platform    | backticked `web` on a line that also carries a backticked `mobile`/`tablet`/`desktop`/`auto` or the word "token"     |
| `-ux-gate`            | any `-ux-gate` suffix except the literal `<plugin>-ux-gate`, which only ever appears where the retired form is named |
| `stacks/project/`     | the flat template path vwf no longer ships or describes                                                              |
| `assets/stacks/`      | the template tree vwf no longer ships                                                                                |
| four axes             | "four axes", "four stack axes", "four independent axes", "four menus", "four stack rounds"                           |
| `private_plane`       | the key dropped from both plugins' template shape                                                                    |
| the `devtools` plugin | backticked `devtools` on a line containing "plugin" but not "uninstall" — the one live sentence that must name it    |

The two bare-word terms carry a second test on the whole line on purpose:
backticked `web` is also a perfectly good registry *project* name, which the
worked example uses, and `devtools` has to survive in the uninstall instruction.
Matching is case-sensitive, since `Web` in a sentence is the ordinary word.

**A line is exempt when it marks itself as history.** `RETIRED_LINE_EXEMPT`
matches `retire`, `migrat`, `dissolved`, `moved`, `→`, `pre-22` or `format 2N`
(any digit, either case of F) — stems rather than words, because the migration
notes conjugate freely. It is tested against the **flagged line alone**: a
migration note wrapped over a dozen lines with its marker on the first has to
repeat a marker on whichever line carries the token, a small tax paid so that a
"retired at format 22" sentence never shields a live claim beneath it.

**Two files are exempt whole**, per `RETIRED_FILE_EXEMPT`, because their entire
job is history: vwf's `skills/setup/references/format-lineage.md`, and any
`changelog.md` (case-insensitive) in any plugin. A second plugin growing a
lineage file is a second entry there, not a wider match.

**A hit on genuine history is fixed by the narrowest exemption, never by
deleting the pattern**: say what replaced the term, or add the one marker word
that makes the line read as history. A pattern that goes is a class of drift
that comes back.

## What retired, and why it is not a regression

Deleting these was the point of the cutover. They described mechanisms that no
longer exist:

| Rule                               | Went with                                         |
| ---------------------------------- | ------------------------------------------------- |
| cross-plugin skill-name uniqueness | the flat namespaces (Claude scopes per plugin)    |
| `prefixSkillNames`                 | the same                                          |
| invocation projection              | the neutral three-valued key                      |
| `it.cmd()` target resolution       | Eta                                               |
| no-surviving-template-tags         | Eta                                               |
| the Oh-My-Pi `package.json` sort   | the Oh-My-Pi render                               |
| the per-target coverage report     | having targets to compare                         |
| vwf declares no `languages`        | the neutral manifest key (folded into `keywords`) |

## Formatting

dprint excludes `plugins/**/*.md`. Match the existing fold width by hand.

The exclusion has **outlived its original reason** — it existed because Eta
expressions are wider than what they render to, so formatting either side broke
the other. Nothing renders now. It stays because reformatting roughly 2000
authored prose files is a decision to take deliberately, not a side effect of
this migration.

`CLAUDE.md` and `readme.md` **are** formatted, so widening one table cell
re-pads every row of that table.
