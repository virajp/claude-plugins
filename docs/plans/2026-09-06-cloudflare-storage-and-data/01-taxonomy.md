# U1 — The taxonomy: every category token plans A–D need

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/taxonomy.md` only. Touch nothing outside
  this list.
- **Model:** opus
- **Read first:** `plugins/stackgen/assets/taxonomy.md` top to bottom — the
  closed-vocabulary rule (`:9-13`), the per-type category lines (`:86-100`), the
  capability seam and the "no capability token today" paragraph (`:116-124`),
  the Cloud-Bundle shape (`:135-141`), the contracts paragraph (`:198-201`).
- **Lazy-load:** `plugins/vwf/assets/capability-vocabulary.md:27-41` (the token
  list, to state which new categories map to a vwf token and which do not);
  `plugins/stackgen/stacks/readme.md:186-192` (the `access`/`static-hosting`
  precedent for minting a category — the register to match).

## Ruling

D2: "Thirteen new `cloud-service` tokens: `key-value`, `stateful-compute`,
`orchestration`, `database-proxy`, `vector`, `ingestion`, `analytics`,
`inference`, `ai-gateway`, `retrieval`, `browser`, `media`, `realtime`; plus
`secrets-manager` added to the `cloud-service` list; plus `agent-sdk` added to
the `framework` list."

D3: "Durable Objects — Category `stateful-compute`." Rejected: `object-storage`
(would make pick-and-trade compare it with R2 and require a blob-storage
contract it cannot satisfy), `actor`.

D1: this plan "alone owns the taxonomy edit for all twenty, so B, C and D never
touch `plugins/stackgen/assets/`" — mint the tokens for services this plan does
not ship (Durable Objects, Workflows, Workers AI, AI Gateway, AI Search, Browser
Rendering, Images, Realtime, Secrets Store, Agents SDK) **now**.

D8, the capability side: `key-value` realizes `cache-layer`, `vector` realizes
`search-index`, `orchestration` realizes `durable-workflows`, `messaging` (for
Email Service, plan D) realizes `email`; `stateful-compute`, `database-proxy`,
`ingestion`, `analytics`, `inference`, `ai-gateway`, `retrieval`, `browser`,
`media`, `realtime` and `secrets-manager` (as a cloud-service category) have
**no vwf token today**.

## Edits

1. **`plugins/stackgen/assets/taxonomy.md`, the `cloud-service` line
   (`:94-96`)** — extend the slash-separated list, keeping the existing ten
   tokens in their current order and appending the fourteen additions in this
   order: `key-value` / `stateful-compute` / `orchestration` / `database-proxy`
   / `vector` / `ingestion` / `analytics` / `inference` / `ai-gateway` /
   `retrieval` / `browser` / `media` / `realtime` / `secrets-manager`. Fold the
   line by hand to the surrounding width; the file is not dprint-formatted.
2. **The `framework` line (`:92-93`)** — append `agent-sdk` after
   `workflow-sdk`.
3. **The "no capability token today" paragraph (`:120-124`)** — it currently
   names four categories (`cdn`, `secrets-manager`, `access`, `static-hosting`).
   Rewrite the sentence so it stays true: the four become the list above plus
   `stateful-compute`, `database-proxy`, `ingestion`, `analytics`, `inference`,
   `ai-gateway`, `retrieval`, `browser`, `media`, `realtime`. Keep the
   sentence's claim intact — "a known vwf-side gap, not a taxonomy error …
   minting capabilities is vwf's move". Do not turn it into a table unless the
   paragraph already is one.
4. **The capability seam paragraph (`:116-119`)** — where it gives examples of
   which category realizes which token ("a `datastore`/`sql` component realizes
   `relational-datastore`; a `queue` component `message-queue` or `pub-sub`"),
   add, in the same voice and no more than two sentences: a `cloud-service` /
   `key-value` component realizes `cache-layer`, `vector` realizes
   `search-index`, `orchestration` realizes `durable-workflows`, and `messaging`
   realizes `email` (or `push-notifications` / `sms`, whichever the service is).
   Only if the paragraph is the natural home; if the file keeps such mappings
   elsewhere, put them there and say so in `DECIDED:`.
5. **A one-paragraph note, placed where the file explains why a category can
   exist without a token (the paragraph that begins at or near `:124`)** — two
   or three sentences recording that fourteen cloud-service tokens and one
   framework token were minted on 2026-09-06 for the Cloudflare developer
   platform, that `stateful-compute` is deliberately distinct from
   `object-storage` (a per-key durable object is compute with state, not blob
   storage), and that `secrets-manager` under `cloud-service` names the runtime
   secrets binding a hosted service reads, while the same word under
   `capability-provider` names the developer-machine and CI secrets provider —
   two different things that share a noun on purpose, so a reader comparing them
   is not misled into thinking one replaces the other.

Nothing else in the file changes. No type is added to the component-type list
(`:19-86`): every new pack in plans A–D is `cloud-service` or `framework`.

## Verification

- `grep -c 'stateful-compute' plugins/stackgen/assets/taxonomy.md` ≥ 2 (the list
  and the note).
- Each of the fourteen `cloud-service` tokens and `agent-sdk` appears on its
  type's line: a `grep -n` per token lands within the line ranges of the two
  edited lists.
- `mise run plugins:check` exits 0 (rule 12's retired-vocabulary scan covers
  this file; no retired term is introduced).
- The file is still valid Markdown: no table broken, no heading changed.
- `git diff --stat` shows exactly one file.

## Guardrails

- Do not touch `kinds.md`, `pack-format.md`, `artifact-doctrine.md` or
  `contracts/**` — nothing in this plan changes them. If you believe one must
  change for a token to be legal, return `UNRESOLVED:` naming the sentence,
  rather than editing.
- Do not add a component type. Do not rename an existing token. Do not reorder
  the existing ten.
- `plugins/**/*.md` is not dprint-formatted — hand-fold to the surrounding
  width.
- `cat` is aliased to `bat` on this machine: use Edit, never a heredoc.

## Commit

`feat(stackgen): mint the cloud-service categories for twenty Cloudflare services`
— written by the orchestrator after the wave gate, not by the unit.
