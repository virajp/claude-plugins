# U4 — Rewrite the GCP/Firebase service packs and the single-pack types

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/cloud-service/{cloud-run,cloud-sql,firebase-auth,firebase-messaging,firebase-storage,firestore,gke}/**`,
  `plugins/stackgen/stacks/{cloud-provider,datastore,deploy-target,ci-system,app-framework,framework,language,package-manager,design-tool}/**`
- **Model:** opus
- **Read first:** every owned file that a grep below reports, top to bottom,
  before editing it.
- **Lazy-load:** the cited asset, read-only, when a rewrite must state its rule
  inline — `plugins/stackgen/assets/contracts/*.md`, `assets/taxonomy.md`,
  `assets/output-tree.md`. Never edit anything under `assets/`.

## Ruling

Quoted from index.md:

> **1. Rule 13 scope.** Refuse all four citation forms in landed tiers: (a) the
> literal `${CLAUDE_PLUGIN_ROOT}` anywhere; (b) bare `assets/<path>.md`; (c) a
> `../` chain whose resolved target leaves the file's own `skills/<name>/`
> directory (or, for a `conventions.md`, any `../` at all); (d)
> `<type>/<slug>/<segment…>`, a path into another pack.
>
> **3. Bare component refs.** `<type>/<slug>` with no trailing `/` is an
> identifier and is never refused.
>
> **8. Rewrite doctrine.** Name the cited asset **by role** when the sentence
> already carries its own reason; **state the rule inline** when the passage
> depends on the cited content. Never delete a sentence to satisfy the rule.
>
> **9. Canonical role names.** `contracts/<x>.md` → "stackgen's <x> contract";
> `output-tree.md` → "stackgen's output charter"; `taxonomy.md` → "stackgen's
> taxonomy"; `kinds.md` → "stackgen's kind vocabulary"; `pack-format.md` →
> "stackgen's pack format"; `artifact-doctrine.md` → **never named**, its rule
> stated inline; `delivery-pipeline.md` → "vwf's delivery-pipeline contract".
>
> **10. Cross-pack and own-pack conventions.** A path into a sibling pack
> becomes "the `<type>/<slug>` component's conventions, in this composition's
> template" (bare ref allowed); a skill citing its own pack's conventions
> becomes "this component's conventions, in the composition's template".

Why: these files are copied verbatim into a target repo where no stackgen asset
exists; a `conventions.md` lands as the body of
`.claude/stackgen/templates/<slug>.md` and a skill lands in
`.claude/skills/<name>/`.

## Edits

The survey found only form-(b) hits in this slice: the seven GCP/Firebase
service packs (`firebase-storage` 5, `gke`/`firestore`/`firebase-auth`/
`cloud-sql`/`cloud-run` about 3 each), `cloud-provider` 3 (all in `gcp`),
`datastore/postgres` 1, `deploy-target/container-image` 2,
`ci-system/github-actions` 2, `app-framework/flutter` 1 file, and nothing in
`framework`, `language`, `package-manager` or `design-tool` — those are in your
Owns so that the slice is a closed set of directories; confirm with the greps
and leave them alone if empty. Three intra-skill `../` links in
`app-framework/flutter/skills/flutter-ios/references/standards.md:127,206,207`
are **valid** and must not be changed.

```sh
cd plugins/stackgen/stacks
D="cloud-service/cloud-run cloud-service/cloud-sql cloud-service/firebase-auth cloud-service/firebase-messaging cloud-service/firebase-storage cloud-service/firestore cloud-service/gke cloud-provider datastore deploy-target ci-system app-framework framework language package-manager design-tool"
grep -rn 'CLAUDE_PLUGIN_ROOT' $D
grep -rnE '(^|[^A-Za-z0-9_./])assets/[A-Za-z0-9_./-]+\.(md|ya?ml)' $D
grep -rnE '(^|[^A-Za-z0-9_])(\.\./)+[A-Za-z0-9_./-]+' $D --include='*.md'
grep -rnE '(^|[^A-Za-z0-9_./-])(app-framework|capability-provider|ci-system|cloud-provider|cloud-service|datastore|deploy-target|design-tool|framework|language|package-manager|repo-hygiene|toolchain-gate|toolchain-manager)/[a-z0-9-]+/[A-Za-z0-9_]' $D
```

Skip a hit inside a fenced code block and a `../` that stays inside the same
`skills/<name>/` directory. Per hit, in order of preference:

1. **The sentence already carries its reason** — drop the path and name the
   asset by its canonical role, or drop the citation if the role adds nothing.
2. **The sentence depends on the cited content** (a contract's one rule the
   passage instantiates) — state that fact inline in a clause and name the asset
   by role as its source.
3. **A path into a sibling pack** — the decision-10 phrasing.

Keep every sentence's meaning. Match the surrounding fold width by hand —
`plugins/**/*.md` is **not** dprint-formatted. Do not reflow a paragraph you did
not change.

## Verification

- The four greps above return nothing outside fenced blocks and the three
  flutter-ios intra-skill links.
- `node scripts/src/check.ts 2>&1 | grep -E 'stacks/(cloud-service/(cloud-run|cloud-sql|firebase-auth|firebase-messaging|firebase-storage|firestore|gke)|cloud-provider|datastore|deploy-target|ci-system|app-framework|framework|language|package-manager|design-tool)/'`
  prints nothing once U1 has landed (concurrent — the greps are the check until
  then).
- No new rule-12 (retired vocabulary) finding in your Owns.
- `git diff --stat` touches only files under your Owns.

## Guardrails

- Do not edit the 22 Cloudflare `cloud-service` packs (U3's), `bundles/*.md`
  (U6's), anything under `assets/`, or any doc.
- Do not touch the three `design-tool` packs' `design-import-*` skill
  frontmatter at all — rule 8 asserts their invocation keys.
- Do not touch frontmatter on any SKILL.md beyond a line a grep reported.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns; never run
  this repo's dprint over a pack `config/` tree.
- A hit you cannot rewrite without inventing doctrine is an `UNRESOLVED:`.

## Commit

`refactor(stackgen): GCP, provider and single-pack types cite assets by role, never by plugin path`
— written by the orchestrator after the wave gate, not by the unit.
