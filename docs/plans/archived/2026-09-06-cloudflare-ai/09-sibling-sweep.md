# U9 — Sibling sweep: the older Cloudflare cards stop calling shipped services planned

- **Wave:** 3 (concurrent with U7 — disjoint Owns)
- **Depends on:** U2–U6 (so the run-time grep in Edit 5 can see plan C's five
  packs on disk)
- **Owns:** exactly the passages listed under Edits 1–4, by `path:line`, in
  these eighteen files — nothing else in any of them:
  `plugins/stackgen/stacks/cloud-service/pipelines/conventions.md`,
  `…/pipelines/skills/cloudflare-pipelines/references/pick-and-trade.md`,
  `…/pipelines/skills/cloudflare-pipelines/references/local-dev.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-pipelines.md`,
  `plugins/stackgen/stacks/cloud-service/kv/conventions.md`,
  `plugins/stackgen/stacks/cloud-service/d1/conventions.md`,
  `…/d1/skills/cloudflare-d1/references/pick-and-trade.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-zero-trust.md`,
  `plugins/stackgen/stacks/cloud-service/zero-trust-access/conventions.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-ssr.md`,
  `plugins/stackgen/stacks/bundles/cloudflare-workers-static.md`,
  `plugins/stackgen/stacks/cloud-service/workers-ssr/conventions.md`,
  `…/workers-ssr/skills/workers-ssr/references/pick-and-trade.md`,
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/conventions.md`,
  `…/workers-static-assets/skills/workers-static-assets/references/pick-and-trade.md`,
  `plugins/stackgen/stacks/cloud-service/containers/pack.yaml`,
  `plugins/stackgen/assets/output-tree.md` (line 196 only — D21),
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  (line 85 only — D21); **plus** any passage Edit 5's grep finds, under
  `plugins/stackgen/stacks/**` and outside U1–U8's Owns, `inventory.md`,
  `stacks/readme.md` and every `config/` tier. Touch nothing outside this list.
- **Model:** opus
- **Read first:** `index.md` §Assumed decisions D20–D22; then, for the fact each
  fix states, the shipped pack it now points at — `cloud-service/queues/`,
  `durable-objects/`, `containers/`, `hyperdrive/`, `kv/`, `r2/`, `d1/`
  (`conventions.md` and the bundle, read-only); then each owned file's passage
  with ten lines of context either side, so the fix reads in the file's own
  register.
- **Lazy-load:**
  `docs/plans/archived/2026-09-06-cloudflare-compute-and-orchestration/index.md`
  §Run log, rows R1/1, R2/1, U2/1, U5/1, U6/1 — where each passage was first
  reported and why it was left;
  `cloud-service/containers/skills/cloudflare-containers/references/local-dev.md:30-46`
  (the hedged form of the `EXPOSE` rule that Edit 4 makes `pack.yaml` agree
  with).

## Ruling

D20, quoted from `index.md`: "Sweep scope: all 24 passages the survey listed
(the stale claims, the seven true-but-destinationless passages, the
`containers/pack.yaml:45` `EXPOSE` hedge), each fixed in **one clause** in the
file's own register, plus a run-time grep for plan C's five slugs against
'planned / not offered / not yet / no doctrine / own effort'. Rejected: stale
claims only; deferring to a fourth plan."

D21, quoted: "The rulebook carve-out — a **reversal**, limited to one fact, of
the standing 'assets are nobody's' rule plans A, B and C all recorded: U9 owns
`assets/output-tree.md:196` and
`skills/stackgen-stack-template/references/materializer.md:85` and may change
nothing else in either file. Rejected: leaving them stale; opening `assets/**`
generally."

D22, quoted: "Placement: wave 3, concurrent with U7 — disjoint Owns, so safe. U8
depends on U7 **and** U9. Rejected: wave 1."

The fixes state facts the shipped packs already state; they add no doctrine. A
fix names the shipped pack by its directory slug or bundle name in the form the
surrounding file already uses (bare backticked path, never a cross-pack markdown
link — a link out of a pack breaks for an installed user).

## Edits

Line numbers are as of `develop` at `a7a63265`; re-locate each by its quoted
sentence, not its number. One clause per passage; keep the sentence's subject
and the paragraph's argument.

1. **Stale claims — a plan-B service called unshipped.** Replace the claim with
   the pin that now exists:
   - `pipelines/skills/cloudflare-pipelines/references/pick-and-trade.md:50` —
     "Queues is planned under its own effort and is not offered by this stack
     today — see the provider component's scope fence." → Queues is offered as
     `cloud-service/queues` (bundle `cloudflare-queues`); keep the scope-fence
     pointer only if the sentence still needs it.
   - `pipelines/conventions.md:78` — "…is Queues, which this stack plans and
     does not yet offer." → "…is Queues — `cloud-service/queues`."
   - `bundles/cloudflare-pipelines.md:50` — "Queues is planned under its own
     effort rather than offered today." → offered as `cloudflare-queues`.
   - `kv/conventions.md:78` — "That is Durable Objects, which this stack has not
     written doctrine for yet." → "That is Durable Objects —
     `cloud-service/durable-objects`."
   - `d1/conventions.md:84` — "…Durable Objects' SQLite, which is planned under
     its own effort and is not offered yet." → offered as
     `cloud-service/durable-objects`.
   - `d1/skills/cloudflare-d1/references/pick-and-trade.md:38` — "That component
     is **planned and not offered yet** — a product that needs it has a gap to
     name." → the component is `cloud-service/durable-objects`; a product that
     needs it pins `cloudflare-durable-objects` beside D1. Drop the gap clause.
   - `pipelines/skills/cloudflare-pipelines/references/local-dev.md:13` — the
     both-modes list "D1, KV, R2, Queues and Service Bindings" is three names
     short of Cloudflare's `workers/local-development/bindings-per-env` table
     (Browser Rendering, Email, Images). Complete the list from that page
     (Context7 `/websites/developers_cloudflare`, per D13) and cite it; the
     Pipelines conclusion the paragraph draws is unchanged.
2. **Hosting-shape miscounts — two deploy packs where there are three.**
   - `bundles/cloudflare-zero-trust.md:27` — "such as
     `cloudflare-workers-static` or `cloudflare-workers-ssr`" → add
     `cloudflare-containers`.
   - `bundles/cloudflare-zero-trust.md:36` — "**Both hosting shapes are
     offered** — …" → three shapes: the directory, the directory with a script
     in front, and a Worker fronting a container image (`cloudflare-containers`,
     pinned instead of the SSR one).
   - `zero-trust-access/conventions.md:50` — "this provider's own two,
     `cloudflare-workers-static` and `cloudflare-workers-ssr`" → three, naming
     `cloudflare-containers`.
   - `bundles/cloudflare-workers-ssr.md:86` — heading "The seam with the other
     two Cloudflare bundles" and `:89` "A deployment either has a `main` or it
     does not, and the two bundles are the two answers." → the seam is with the
     other **deploy** bundles: `cloudflare-workers-static` (no `main`) and
     `cloudflare-containers` (a `main` that fronts a container image — pinned
     **instead of** this bundle, never beside it, because both ship the root
     `wrangler.jsonc`; cite `bundles/cloudflare-containers.md`). Keep the
     heading's anchor text stable if any file links to it (grep first).
   - `bundles/cloudflare-workers-static.md:52` — "the two are alternatives
     rather than layers: a deployment either has a `main` or it does not." →
     three alternatives; a `main` that fronts a container is
     `cloudflare-containers`.
   - `workers-static-assets/conventions.md:25`, `assets/output-tree.md:196`,
     `skills/stackgen-stack-template/references/materializer.md:85` — "only a
     `static-hosting` service pack ships one" (root `wrangler.jsonc`) → the
     three Cloudflare deploy packs ship one (`workers-static-assets`,
     `workers-ssr`, `containers`); being on the allowlist still makes it
     landable, not standard. **In the two rulebook files change this sentence
     and nothing else** (D21).
3. **True but destinationless — name the same-provider answer.**
   - `workers-ssr/conventions.md:16` — "**It is not a container.** There is no
     image…" → keep, add: a workload that needs one is
     `cloud-service/containers`, pinned instead of this pack.
   - `workers-ssr/skills/workers-ssr/references/pick-and-trade.md:38` — "wants a
     container — `cloud-run` —" → "wants a container — `containers` on this
     provider, or `cloud-run` elsewhere —".
   - `…/pick-and-trade.md:43` — "A container runs the actual runtime and has no
     such cliff." → name `cloud-service/containers` as that container.
   - `…/pick-and-trade.md:45` — "The process must hold state between requests,
     or hold a connection." → add the destinations:
     `cloud-service/durable-objects` (state and connections per object) or
     `cloud-service/containers` (a process).
   - `…/pick-and-trade.md:50` — "either a proxy the platform does support or a
     different deploy target" → the proxy is `cloud-service/hyperdrive`.
   - `workers-static-assets/skills/workers-static-assets/references/pick-and-trade.md:10`
     — "Unlike the account's other stack here" → "the account's other deploy
     stacks here" (`workers-ssr`, `containers`).
   - `…/pick-and-trade.md:43` — "**Anything needing storage or state.** … There
     is no writable surface here at all." → add where it goes: `kv`, `r2`, `d1`,
     `durable-objects` as backing pins beside a deploy pin that has a `main`.
4. **Internal inconsistency — `containers/pack.yaml:45`.** The
   `harness.local_stack` mechanism prose states the `EXPOSE` rule as flat fact.
   Make it agree with the pack's own references: the rule is documented for
   Sandbox (a Containers-built product) and applied here as a recommendation;
   point at `references/local-dev.md`. This file **is** dprint-formatted
   (`**/*.yaml`, `printWidth: 80`, `proseWrap: always`, `quotes: forceDouble`) —
   run
   `pnpm exec dprint fmt plugins/stackgen/stacks/cloud-service/containers/pack.yaml`
   after editing and confirm the diff is your clause alone.
5. **Run-time grep for plan C's five.** After the above:
   `grep -rn -E 'Workers AI|AI Gateway|AI Search|Browser Rendering|Agents SDK|cloudflare-agents' plugins/stackgen/stacks --include='*.md' --include='*.yaml' | grep -E -i 'planned|not offered|not yet|no doctrine|own effort'`,
   excluding hits under `cloud-provider/cloudflare/` (U1's), the five new packs
   and bundles (U2–U6's), `stacks/readme.md` (U7's) and `inventory.md`. Fix each
   remaining hit in the style of Edit 1 and list it as `CHANGED:` with its line.
   Zero hits is a fine result — report it as `DECIDED:`.

## Verification

- `mise run plugins:check` exits 0.
- `pnpm exec dprint check plugins/stackgen/stacks/cloud-service/containers/pack.yaml`
  exits 0 (the only dprint-formatted file you touch — `plugins/**/*.md` and the
  rulebook markdown are excluded; hand-fold those to their neighbours' width).
- None of the old sentences survives — each of these is empty:
  `grep -rn 'not offered' plugins/stackgen/stacks/cloud-service/{pipelines,kv,d1} plugins/stackgen/stacks/bundles/cloudflare-pipelines.md`;
  `grep -rn 'has not written doctrine' plugins/stackgen/stacks/cloud-service/kv`;
  `grep -rn 'Both hosting shapes' plugins/stackgen/stacks/bundles`;
  `grep -rn "provider's own two" plugins/stackgen/stacks/cloud-service/zero-trust-access`;
  `grep -rn 'other two Cloudflare bundles' plugins/stackgen/stacks/bundles`;
  `grep -rn 'only a .static-hosting. \(service \)\?pack ships one' plugins/stackgen`;
  `grep -rn "account's other stack here" plugins/stackgen/stacks/cloud-service/workers-static-assets`.
- The Edit 5 grep, re-run, returns nothing.
- `git diff --stat` lists only files in the Owns list; for
  `assets/output-tree.md` and `references/materializer.md`,
  `git diff <file> | grep -c '^[-+][^-+]'` is 2 each (one line out, one in) — or
  the minimal reflow of that one sentence.
- `git diff --name-only | grep -c '/config/'` is 0.

## Guardrails

- The Owns list is **passages**, not files: a second stale sentence you notice
  in an owned file that is not listed and not an Edit-5 hit goes in your return
  block as `DOCS FALSIFIED:`, not into the diff.
- Do not touch `cloud-provider/cloudflare/**` (U1), the five new packs and
  bundles (U2–U6), `stacks/readme.md` and every doc (U7), `plugin.json`,
  `marketplace.json`, `inventory.md` (U8), or anything under a `config/` tier.
- In `assets/output-tree.md` and `materializer.md` the one sentence is the whole
  permission — D21 is a carve-out, not an opening.
- Never restate a count (pack, bundle, kind) — say "the three Cloudflare deploy
  packs" by name, never "N packs".
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width by
  hand. Write/Edit, never `cat >` heredocs (`cat` is `bat` here).
- No Cloudflare fact from memory: Edit 1's binding list is the only new fact and
  it is cited (D13); every other fix names a pack that exists on disk.

## Commit

`fix(stackgen): the older Cloudflare packs stop calling shipped services planned`
— written by the orchestrator after the wave gate, not by the unit.
