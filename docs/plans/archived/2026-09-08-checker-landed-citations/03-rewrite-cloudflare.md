# U3 — Rewrite the Cloudflare cloud-service packs' citations

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/cloud-service/{ai-gateway,ai-search,analytics-engine,browser-rendering,containers,d1,durable-objects,email-service,hyperdrive,images,kv,pipelines,queues,r2,realtime,secrets-store,vectorize,workers-ai,workers-ssr,workers-static-assets,workflows,zero-trust-access}/**`
- **Model:** opus
- **Read first:** every owned file that a grep below reports, top to bottom,
  before editing it.
- **Lazy-load:** the cited asset, read-only, when a rewrite must state its rule
  inline — `plugins/stackgen/assets/output-tree.md` (the root allowlist and the
  CI-workflow fence), `assets/contracts/*.md`, `assets/taxonomy.md`. Never edit
  anything under `assets/`.

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
> `output-tree.md` → "stackgen's output charter" (the root allowlist and the
> CI-workflow fence are stated inline where cited); `taxonomy.md` → "stackgen's
> taxonomy"; `kinds.md` → "stackgen's kind vocabulary"; `pack-format.md` →
> "stackgen's pack format"; `artifact-doctrine.md` → **never named**, its rule
> stated inline; `delivery-pipeline.md` → "vwf's delivery-pipeline contract".
>
> **10. Cross-pack and own-pack conventions.** A path into a sibling pack
> becomes "the `<type>/<slug>` component's conventions, in this composition's
> template" (bare ref allowed); a skill citing its own pack's conventions
> becomes "this component's conventions, in the composition's template". A path
> into a sibling pack's `skills/…/references/*` names the sibling's skill by its
> skill name, which lands beside it.

Why: these files are copied verbatim into a target repo where no stackgen asset
exists. A `conventions.md` lands as the body of
`.claude/stackgen/templates/<slug>.md`, merged with every other component's
conventions in the same composition — so the Cloudflare provider's conventions
(`cloud-provider/cloudflare/conventions.md`, cited 24 times across this slice)
**are present** in the same template body; only the path is wrong. A skill lands
in `.claude/skills/<name>/`, so its `../../../conventions.md` breaks even though
it points at its own pack.

## Edits

Find every hit in your Owns first — the survey counted 18 form-(a), 51 form-(b),
25 form-(d) and 2 form-(c) hits across these 22 packs (69 affected files
including the GCP ones U4 owns; yours are the Cloudflare subset):

```sh
cd plugins/stackgen/stacks/cloud-service
grep -rn 'CLAUDE_PLUGIN_ROOT' <your 22 pack dirs>
grep -rnE '(^|[^A-Za-z0-9_./])assets/[A-Za-z0-9_./-]+\.(md|ya?ml)' <your 22 pack dirs>
grep -rnE '(^|[^A-Za-z0-9_])(\.\./)+[A-Za-z0-9_./-]+' <your 22 pack dirs> --include='*.md'
grep -rnE '(^|[^A-Za-z0-9_./-])(app-framework|capability-provider|ci-system|cloud-provider|cloud-service|datastore|deploy-target|design-tool|framework|language|package-manager|repo-hygiene|toolchain-gate|toolchain-manager)/[a-z0-9-]+/[A-Za-z0-9_]' <your 22 pack dirs>
```

Skip a hit inside a fenced code block (the rule strips fences). Skip a `../`
that stays inside the same `skills/<name>/` directory. Then, per hit, one of
these rewrites, in this order of preference:

1. **The sentence already carries its reason** (the survey found this is the
   common case: "wrangler discovers config by walking up, so it sits at the
   root, which the allowlist admits for exactly that reason") — drop the path
   and name the asset by its canonical role, or drop the citation entirely if
   the role adds nothing.
2. **The sentence depends on the cited content** (a `GLB_` prefix rule, the
   release-trigger's tag/dispatch/approval split, the charter's CI-workflow
   fence) — state the one fact the passage needs, inline, in a clause, and name
   the asset by role as its source.
3. **A path into `cloud-provider/cloudflare/conventions.md`** — "the
   `cloud-provider/cloudflare` component's conventions, in this composition's
   template". A path into
   `cloud-provider/cloudflare/skills/cloudflare/references/<x>.md` — "the
   `cloudflare` skill's <x> reference", which lands beside this skill.
4. **`cloud-service/r2/conventions.md`** (one hit, from a sibling service) —
   "the `cloud-service/r2` component's conventions, in this composition's
   template". Note the bundle pairing must actually hold for that sentence to be
   true; if the citing pack is not composed with r2 in any bundle, say so as a
   `GAP:` and name r2's rule inline instead.
5. **`workflows/skills/cloudflare-workflows/references/service-doctrine.md:220`**,
   `../../../conventions.md` — "this component's conventions, in the
   composition's template".
6. **`email-service/conventions.md:133`**, `../../../assets/taxonomy.md` —
   "stackgen's taxonomy".
7. **`durable-objects/skills/cloudflare-durable-objects/references/service-doctrine.md:11`**,
   taxonomy cited to prove `stateful-compute` realizes no vwf capability — state
   the fact inline ("stackgen's taxonomy records this category among the
   vwf-side gaps, so `capability` is unset").

Keep every sentence's meaning. Match the surrounding fold width by hand —
`plugins/**/*.md` is **not** dprint-formatted. Do not reflow a paragraph you did
not change.

## Verification

- The four greps above return nothing outside fenced blocks and intra-skill
  links across your Owns.
- `node scripts/src/check.ts 2>&1 | grep -E 'cloud-service/(ai-gateway|ai-search|analytics-engine|browser-rendering|containers|d1|durable-objects|email-service|hyperdrive|images|kv|pipelines|queues|r2|realtime|secrets-store|vectorize|workers-ai|workers-ssr|workers-static-assets|workflows|zero-trust-access)/'`
  prints nothing **once U1 has landed** (concurrent — if U1 is not in yet, the
  greps are the check).
- `node scripts/src/check.ts` reports no rule-12 (retired vocabulary) finding in
  your Owns: a rewrite must not introduce a retired term.
- `git diff --stat` touches only files under your Owns.

## Guardrails

- Do not edit `cloud-provider/cloudflare/**` (U4's), `bundles/*.md` (U6's),
  anything under `assets/`, or any doc. Report a doc passage in
  `DOCS FALSIFIED:`.
- Do not touch frontmatter on any SKILL.md beyond a line a grep reported;
  strict-YAML frontmatter drops a skill silently.
- Do not "improve" adjacent prose. Every changed line traces to a grep hit.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns; never run
  this repo's dprint over a pack `config/` tree (payload, excluded on purpose).
- A hit you cannot rewrite without inventing doctrine is an `UNRESOLVED:`, not a
  guess.

## Commit

`refactor(stackgen): Cloudflare service packs cite assets by role, never by plugin path`
— written by the orchestrator after the wave gate, not by the unit.
