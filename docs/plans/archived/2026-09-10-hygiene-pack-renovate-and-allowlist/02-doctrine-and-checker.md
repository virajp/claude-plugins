# U2 — doctrine and checker: one allowlist, two tiers; `renovate.json` landable

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/output-tree.md`, `scripts/src/check.ts`,
  `scripts/src/check.test.ts`
- **Model:** opus
- **Read first:** `output-tree.md:125-200` (the allowlist paragraph at
  `:150-162`, the `.config/renovate.json` mention at `:130`, the CLAUDE.md fence
  at `:193-195`); `check.ts:300-460` (the file set `:315-334`, the directory set
  `:347-350`, the workflows fence `:361`, the rule-11 walk `:434-449`); the
  rule-11 cases in `check.test.ts`.
- **Lazy-load:** `plugins/vwf/assets/memory.md:105-124` (why `mempalace.yaml` is
  root-only — cite, do not restate);
  `plugins/vwf/skills/setup/references/claude-md.md:3-5`.

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** **Root `renovate.json`.** […] the root allowlist and the checker's
> landable file set both gain `renovate.json`.

> **2.** **Two tiers in one list.** `output-tree.md`'s allowlist becomes what
> may **sit** at a shaped repo's root. It gains `renovate.json` (landable) and
> `CLAUDE.md` and `mempalace.yaml`, each marked "vwf's — no pack lands them".
> The fence at `:193` is unchanged; the checker's landable set gains
> `renovate.json` only, and a test proves a pack shipping `CLAUDE.md` is still
> refused. `conventions.md:31` is aligned to the same wording.

## Edits

1. **`output-tree.md:150-162`, the allowlist paragraph.** Rewrite so the list is
   "what may sit at a shaped repo's root", in two marked tiers inside the one
   list: the files a pack may **land** (today's thirteen plus `renovate.json`,
   plus the `.github/` directory minus workflows), and the files that sit there
   because **vwf** writes them and no pack may — `CLAUDE.md` (the fence at
   `:193-195` says why) and `mempalace.yaml` (the mine reads it at the root and
   nowhere else — cite `memory.md`). Say in one sentence why the second tier is
   in the list at all: `/vwf:init`'s pass 1 reports any root file not on it, and
   a rule beats a judgment. Keep the sentence that a `config/` tree landing an
   unlisted root path is a pack authoring error the materializer refuses.
2. **`output-tree.md:130`** — `.config/renovate.json` → `renovate.json`, with
   the reason in one clause (Renovate's discovery never reaches `.config/`).
3. **`output-tree.md:164+`**, "Why each of the five added on 2026-09-06 is at
   the root" — add `renovate.json` to that reasoning in the same shape: the tool
   that reads it discovers it there.
4. **`check.ts:315-334`** — add `renovate.json` to the landable root file set.
   Nothing else changes: `CLAUDE.md` and `mempalace.yaml` are **not** added —
   the checker enforces the landable tier only.
5. **`check.test.ts`** — two cases beside the existing rule-11 root-file cases:
   a pack whose `config/` root carries `renovate.json` passes; one whose
   `config/` root carries `CLAUDE.md` (and one with `mempalace.yaml`) is refused
   with the rule-11 message. Reuse the fixture helpers the file already has.

## Verification

- `pnpm vitest run scripts/src/check.test.ts` green, the new cases listed by
  name.
- `pnpm exec tsc --noEmit -p scripts` clean.
- `mise run plugins:check` green over the real tree (with U1's moved payload in
  the same wave).
- `grep -n 'mempalace.yaml' plugins/stackgen/assets/output-tree.md` → hits in
  the allowlist paragraph only.
- `grep -n "renovate.json" scripts/src/check.ts` → one hit, in the file set.
- `pnpm exec dprint check scripts/src/check.ts scripts/src/check.test.ts` green
  (these **are** dprint's); `output-tree.md` fold width by hand.

## Guardrails

- Do not touch the hygiene pack (U1), the dprint pack (U3), any doc (U4), or the
  pins and inventory (U5).
- Do not touch `plugins/stackgen/assets/pack-format.md` unless a sentence there
  restates the allowlist verbatim — if it does, return it as `DOCS FALSIFIED:`
  rather than editing it.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`fix(stackgen): the root allowlist names what may sit at a shaped root, in two
tiers; renovate.json is landable`
— written by the orchestrator after the wave gate, not by the unit.
