# U6 — vwf: the reshape offers a sync; templates state the split

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/assets/templates/environment.md`,
  `plugins/vwf/assets/templates/conventions.md`,
  `plugins/vwf/assets/examples/blueprint/environment.md`,
  `plugins/vwf/assets/memory.md`, `plugins/vwf/skills/readme/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file's passages named below, and the whole of
  `init/references/existing-repo.md`'s plan-and-apply flow.
- **Lazy-load:** `plugins/stackgen/skills/stackgen-sync/SKILL.md` (what the sync
  offers — U5 edits it concurrently; describe it, do not restate it).

## Ruling

> D9 — `/vwf:setup reshape` (init's existing-repo pass) offers to run
> `/stackgen:stackgen-sync` once stackgen components are materialized, on the
> same consent as the rest of the plan; it never runs it silently.

> D11 — vwf's `environment.md` template and example stop saying "store it in the
> secrets manager for each environment (dev/staging/prod)": development values
> live in the development secrets manager, CI's in the forge, staging and
> production in the cloud provider's store.

> D10 — Delete the `capability-provider/doppler` pack and `bundles/doppler.md`,
> and every passage naming it as a live option.

## Edits

1. **`init/references/existing-repo.md`** — in the reshape's plan, after the
   materialize pass and only when the repo's `.claude/stackgen/lock.yaml`
   exists, add one row offering `/stackgen:stackgen-sync` (it shows its own
   delta and asks its own consent). vwf names no technology: describe it as "the
   stack adapter's sync", naming the skill only the way init already names
   `/stackgen:stackgen-sync` (`init/SKILL.md:914`).
2. **`init/SKILL.md`** — where the reshape's passes are summarised, one line for
   the offer. No new question.
3. **`assets/templates/environment.md:14,96-97`**,
   **`assets/examples/blueprint/environment.md:83`**,
   **`assets/templates/conventions.md:45`** — D11's split, tool-neutral ("the
   secrets manager" for development, "the forge's secrets" for CI, "the cloud
   provider's secret store" for staging and production).
4. **`assets/memory.md:161`** — drop `.doppler/` from the `exclude_patterns`
   template.
5. **`skills/readme/SKILL.md:75`** — the example "(`.env.example`, doppler, mise
   `[env]`)": drop doppler.

## Verification

- `grep -rn -i doppler plugins/vwf` prints nothing.
- `grep -rn 'dev/staging/prod' plugins/vwf/assets` prints nothing.
- `grep -n 'stackgen-sync' plugins/vwf/skills/init/references/existing-repo.md`
  prints the offer.
- `mise run p:plugins:check` green (vwf names no technology — rule enforced by
  `TOOL_TOKENS`); the full wave gate.

## Guardrails

- Touch nothing outside Owns; init is also edited by the required chain —
  re-read the files as they now stand and locate passages by content.
- vwf names no technology outside the places it already does; never write
  "fnox", "keychain", "GitHub" or "GitLab" in vwf prose.
- `plugins/**/*.md` is not dprint-formatted — match fold width by hand.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`feat: vwf reshape offers the stack sync; templates state the secrets split`
