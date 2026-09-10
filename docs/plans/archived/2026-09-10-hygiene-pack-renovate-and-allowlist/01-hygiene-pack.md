# U1 — hygiene pack: Renovate to the root, the allowlist wording, 1.0.1

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**` — the payload
  `config/**`, `conventions.md`, `skills/repo-hygiene/SKILL.md`, `pack.yaml`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing;
  `conventions.md:23,31,172` and `SKILL.md:24-25` are the lines.
- **Lazy-load:** `plugins/stackgen/assets/output-tree.md:150-162` (the allowlist
  paragraph U2 is rewriting — match decision 2's wording, not the file's current
  text).

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** **Root `renovate.json`.** The pack payload moves from
> `config/.config/renovate.json` to `config/renovate.json`; the root allowlist
> and the checker's landable file set both gain `renovate.json`.

> **2.** **Two tiers in one list.** `output-tree.md`'s allowlist becomes what
> may **sit** at a shaped repo's root. It gains `renovate.json` (landable) and
> `CLAUDE.md` and `mempalace.yaml`, each marked "vwf's — no pack lands them".
> […] `conventions.md:31` is aligned to the same wording.

The user: *"Root `renovate.json`"*; *"Two tiers in one list"*.

## Edits

1. **`config/.config/renovate.json` → `config/renovate.json`.** Move the file
   (`mv`, then the orchestrator stages the rename); content byte-identical.
   Delete nothing else; if `config/.config/` is then empty of everything but
   `vscode.d/`, leave it — `vscode.d/repo-hygiene.jsonc` still lives there.
2. **`conventions.md:23`** — the table row: `.config/renovate.json` →
   `renovate.json`, with the reason in the row's own style: Renovate's discovery
   is root-first (`renovate.json`, `.github/`, `.gitlab/`, `.renovaterc`) and
   never `.config/`, so the file sits at the root — the one allowlisted
   exception the dependency-update policy needs.
3. **`conventions.md:172`** — the "policy, not an installation" paragraph: the
   path, same replacement; keep the paragraph's point.
4. **`conventions.md:31`** — the allowlist line. Align it to decision 2: the
   list names what may **sit** at a shaped root; `renovate.json` joins the
   landable files; `CLAUDE.md` stays in the list but is marked as vwf's, which
   no pack lands, and `mempalace.yaml` joins it with the same mark. Point at
   `assets/output-tree.md` as the authority so the two never drift again.
5. **`skills/repo-hygiene/SKILL.md:24-25`** — the `paths:` globs: drop
   `.config/renovate.json`; keep `**/renovate.json` (it now matches the root).
6. **`pack.yaml`** — `version: 1.0.0` → `1.0.1`.

## Verification

- `mise run plugins:check` green — rule 11 must accept `renovate.json` at the
  pack's `config/` root, which needs U2's `check.ts` change in the same wave; if
  the gate is red on exactly that line before U2 lands, say so as a `DECIDED:`
  and let the wave gate (run after both) settle it.
- `test -f plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/renovate.json`;
  `! test -e plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.config/renovate.json`.
- `grep -rn '\.config/renovate' plugins/stackgen/stacks/repo-hygiene/` →
  nothing.
- `grep -n 'mempalace.yaml' plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`
  → one hit, on the allowlist line.
- `grep -n '^version: 1.0.1' plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`
  → one hit.
- Fold width by hand (`plugins/**/*.md` is not dprint's); the payload under
  `config/` is excluded from every formatter — never run one over it.

## Guardrails

- Do not touch `assets/output-tree.md` (U2), `scripts/` (U2), the dprint pack
  (U3), any doc (U4), the bundle pins or inventory (U5).
- The `config/` tree is payload — byte-copy, never retype; never format it.
- Delete with `rm`, never `git rm`; move with `mv`, never `git mv`.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`fix(stackgen): the hygiene pack lands renovate.json at the root, where
Renovate reads it`
— written by the orchestrator after the wave gate, not by the unit.
