# U6 — stackgen prose

- **Wave:** 5
- **Depends on:** R
- **Owns:** `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/**`,
  `plugins/stackgen/assets/**`,
  `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/stacks/**/*.md`
  except `inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md whole (decisions E1–E23, Template names); the
  script's `--help`-equivalent in `lib/cli.mjs`; the trees under `assets/`,
  `templates/` and one converted pack (swiftui).

## Ruling

> E1–E21, quoted from index.md's Assumed decisions. The skill now describes a
> renderer: what it lands, the four calls, the values file, rows, the six marked
> files, and what the LLM judges (drift, `keep-existing`).

> B80 items 6 and 7 (backlog):
> `stacks/package-manager/swiftpm/conventions.md:35, 81` are 123 columns — fold
> to the surrounding width; the stale passages `assets/pack-format.md:41`
> (`config/.gitignore` as the mirror example), `assets/output-tree.md:408` and
> `skills/stackgen-stack-template/references/materializer.md:140` ("the
> .gitignore section appends"), `stacks/bundles/fnox.md:54` ("the hygiene"
> pack).

## Edits

1. **tool-config `SKILL.md`** — rewritten: frontmatter `description` and
   `argument-hint` name the four calls and no retired verb; sections: what it
   lands (assets, templates, `_base`, `ai`), `.config/stackgen.yaml`, the
   template syntax (one paragraph, pointing at plan 1's engine rules), the four
   calls, running the script (unchanged prerequisites: trust, `mise x`,
   `MISE_ENV=dev`), rows and answers (E11), the six marked files (E8), pins
   (E3), packs (`templates/`, subtasks), drift (the LLM compares a file with a
   `preview` render), what it never does. Drop Blocks-per-requester, Drift via
   `check`, Removal, The lock record.
2. **`references/`** — one file per area that still has rules: `mise.md`
   (layout, `_base`/`ai`, pins, the task library and subtasks), `pre-commit.md`
   (hooks, `code:check:all`), `dprint.md`, `gitleaks.md`, `grype.md`, `git.md`
   (the curated `.gitignore`, `.gitattributes`, the git-config task),
   `graphify.md`; `rm references/renovate.md`. Every verb section, migration
   section and lock passage goes.
3. **stackgen assets** — `pack-format.md` (`templates/`, subtask paths, no
   `tool-config:`/`machine_env:`), `output-tree.md`, `taxonomy.md`, `kinds.md`
   per the survey pointers; B80 item 7.
4. **Materializer and sync prose** — `stackgen-stack-template/SKILL.md` and
   `references/materializer.md`: the pack call is `pack --slug --dir --set`,
   removal `pack-remove`; describe the lock as the materializer's alone (plan 3
   wires the callers — say what the materializer does, not how vwf calls it).
   `stackgen-sync/SKILL.md`: no `source: tool-config/` records to skip.
5. **Packs' prose** — `stacks/readme.md` and every `conventions.md` and bundle
   doc the survey listed (index.md facts): the subtask a pack owns, its
   `templates/`, no `tool-config:`; B80 item 6. `bundles/swift-swiftui.md` and
   `swift-package.md` name the swift-format and swiftlint subtasks.
6. Apply every `DOCS FALSIFIED:` line U1–U5 returned that falls inside Owns.

## Verification

- `rg -n "apply-entries|add-exclude|add-plugin|add-hook|add-linter-ignore|set-env|machine_env|MARKED POSITION|renovate|update_bot|tools\.dev\.toml|shell_alias\.dev\.toml|env\.toml" plugins/stackgen`
  prints nothing outside `stacks/inventory.md` and test fixtures.
- `mise run p:plugins:check` green (rule 13: no plugin-relative citation in a
  landed file).

## Guardrails

- Touch nothing outside Owns — vwf prose is plan 3's (`GAP:` it).
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width by
  hand; keep code spans on one line; never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: stackgen's skills and packs describe the template renderer`
