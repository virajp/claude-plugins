# U3 — stackgen: the ids asset, the mise pack, the three overlays, the pins

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/ids.md`; under
  `plugins/stackgen/stacks/toolchain-manager/mise/`: `conventions.md`,
  `pack.yaml`, `config/.config/mise.toml`,
  `config/.config/mise/tasks/setup/vscode`, `skills/mise/SKILL.md`,
  `skills/mise/references/config-files.md`,
  `skills/mise/references/task-library.md`; under
  `plugins/stackgen/stacks/cloud-service/`: `containers/pack.yaml`,
  `workers-ssr/pack.yaml`, `workers-static-assets/pack.yaml` and each one's
  `config/.config/mise/tasks/p/_project/deploy`;
  `plugins/stackgen/stacks/bundles/mise.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-containers.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-static.md`;
  `plugins/stackgen/stacks/inventory.md` (generated)
- **Model:** opus
- **Read first:** `ids.md` whole; the seven mise-pack files at the cited lines;
  the three `deploy` overlays lines 1–20; the four bundle files.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` 98–120
  (rule 11) and the rule 13 section; `.claude/skills/stackgen-plugin/SKILL.md`
  (pack versioning and the inventory rule).

## Ruling

Decision 1: "The slugified basename of the repo's **main checkout** folder, by
`ids.md`'s slug rule, proposed by question 1 and written literally — never
derived at load time, since a linked worktree's folder is named for the branch.
A member repo names its own folder, never the base's."

Decision 6: "The three cloud-service deploy comments are rewritten; each pack
bumps `0.1.1` → `0.1.2`, its bundle pin follows, the inventory regenerates — all
in U3's one commit."

Decision 7: "Comment and doctrine edits only; `REPO_NAME = "unfilled"` stays the
marked position; pack `1.2.1` → `1.2.2` with its pin, in U3's commit."

Decision 8: "Retitled to cover both tokens — one slug rule, two applications.
The 'Where the id lands' table becomes two rows with two sources: the project id
→ `p/<id>/` and the commit scope; the repo name → `REPO_NAME`. The 'whole point
of deriving the id once' sentence goes. The `_default`/extension reasoning
stays."

Decision 11: "The phrase for the key is 'the repo's folder name, slugified';
'the repo's own id' and 'the repo's own slug' are retired wordings wherever they
describe `REPO_NAME`."

Unit-contract exception from index.md: "U3 bumps four pack versions and runs the
inventory generator, because a pack pin and the inventory must land in one
commit."

## Edits

1. **`assets/ids.md`** — title and lead (1–8): one slug rule with two
   applications — a project id and a repo's folder name. Rule (10–29) and why
   (31–58) unchanged. "Where the id lands" (60–72): two rows — the project id
   lands in `p/<id>/` and the commit-scope list; the folder name, slugified,
   lands in `REPO_NAME`; flags and aliases stay per member repo. Delete 74–77
   (the "same token … whole point of deriving the id once" paragraph) and
   replace with one sentence: the two tokens are independent, and a
   single-project repo whose folder happens to match its project id is a
   coincidence, not a rule. "Who applies it" (79–91): the orchestrator writes
   the project id into the task group and the scope list, and the folder slug
   into `REPO_NAME`; the materializer's rename is unchanged.
2. **`P/conventions.md`** 50–60 — `REPO_NAME` is the repo's folder name,
   slugified, and a literal; not the project id; the `p:<id>:*` group carries
   the project id. Keep the literal-never-derived paragraph and the launcher
   sentence. Line 90 unchanged.
3. **`P/config/.config/mise.toml`** 96–116 — the comment: the position is filled
   with the repo's folder name, slugified (cite "stackgen's `assets/ids.md`" in
   prose exactly as line 102 does today — rule 13); remove "the same token the
   `p:<id>:*` task group carries"; keep literal-never-derived and the launcher
   lines; the value line 116 stays `REPO_NAME = "unfilled"`. Comment-only;
   byte-identical elsewhere.
4. **`P/config/.config/mise/tasks/setup/vscode`** 26–29 and 43 — the two
   comments: the profile is named for the repo's folder slug from
   `.config/mise.toml`'s `[env]`; drop "the same token the `p:<id>:*` task group
   carries". No code change; `shfmt -d` must stay silent.
5. **`P/skills/mise/SKILL.md`** 146–156 — the marked-position bullet: filled
   with the repo's folder name, slugified, by init's first question; not the
   project id. 233 and 269–271 unchanged.
6. **`P/skills/mise/references/config-files.md`** 84–87 and 113–121 — same
   wording; "the repo's own id" goes.
7. **`P/skills/mise/references/task-library.md`** — 399 unchanged; the `<id>`
   order at 558–571: the third source ("a single-project repo → the repo's own
   name") becomes the project's primary platform token as vwf's init proposes it
   (cite init by role, not path); 572–576: delete the "identical token … a
   mismatch is a defect" passage and state the two surfaces carry two tokens:
   `REPO_NAME` the folder slug, `p:<id>:*` the project id. 578–590 unchanged.
8. **The three `p/_project/deploy` overlays** lines 8–15 — rewrite the sentence
   "the same id the repo's own `REPO_NAME` carries where that project is the
   repo itself" to: runs as `p:<id>:deploy`, where `<id>` is the project's id —
   the group the materializer names when it lands this file; `REPO_NAME` is a
   different token, the repo's folder name. Keep the three files byte-identical
   to each other apart from nothing (they are identical today — keep them so).
9. **Versions and pins** — `P/pack.yaml` `version: 1.2.1` → `1.2.2`;
   `bundles/mise.md:7` → `toolchain-manager/mise@1.2.2`; the three cloud-service
   `pack.yaml` `0.1.1` → `0.1.2`; `bundles/cloudflare-containers.md:7`,
   `cloudflare-workers-ssr.md:7`, `cloudflare-workers-static.md:7` → `@0.1.2`.
   Then `mise run p:plugins:inventory` so `stacks/inventory.md` matches.

## Verification

- `mise run p:plugins:check` green (rule 11 over the payload tier; rule 13 over
  the landed files — no `${CLAUDE_PLUGIN_ROOT}`, no bare `assets/…` path in
  `mise.toml`, `setup/vscode` or the overlays).
- `mise run p:plugins:shellcheck` green (`shfmt -d` silent on `setup/vscode` and
  the three overlays).
- `mise run p:plugins:inventory -- --check` green after the regeneration.
- `command grep -rn "same token\|deriving the id once\|identical project-id" plugins/stackgen/assets/ids.md plugins/stackgen/stacks/toolchain-manager/mise plugins/stackgen/stacks/cloud-service/{containers,workers-ssr,workers-static-assets}/config`
  is empty.
- `command grep -rn "repo's own id\|repo's own slug" plugins/stackgen/assets/ids.md plugins/stackgen/stacks/toolchain-manager/mise`
  is empty.
- `command diff` between any two of the three overlays is empty.
- `command grep -n "^version:" plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml plugins/stackgen/stacks/cloud-service/{containers,workers-ssr,workers-static-assets}/pack.yaml`
  shows `1.2.2` and three `0.1.2`; the four bundle pins match.

## Guardrails

- The `config/` payload tier is **not** dprint-formatted and is copied
  byte-for-byte into target repos: hand-fold comments at the file's existing
  width, change no code line, never run this repo's formatter over it.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Do not touch `materializer.md`, `pack-format.md`, `output-tree.md` or
  `stacks/readme.md` — their `p/_project/` rename sentences survive.
- Do not touch the mise pack's `mise.dev.toml`, `setup/all`, `_scripts/*` —
  members, flags and aliases are unchanged.
- Do not touch vwf (U1, U2), this repo's `.config/` (U4), any doc (U5).
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen — REPO_NAME is the folder slug, the group is the project id;
mise pack 1.2.2, cloud-service overlays 0.1.2`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
