GAP 2026-11-15 ★4 | phase:R5, plugin:stackgen, skill:architecture,
skill:setup, skill:doctor | "stack without packs" mixes up packs and bundles;
the design needs a brainstorm before a plan | parked: R5 interview stopped by
the user

**Source** The R5 interview of `/vwf:change-plan`, 2026-11-15, after R4b
(`docs/plans/2026-11-15-config-format-28`) landed. No R5 folder was written.

## Why it stopped

The split record (`docs/memory/decisions/2026-11-14-bootstrap-plugins-split.md`)
says "packs go" and removes every `*_template` key. The interview treated that
as "bundles go too". The user stopped it: a **bundle** is the curated group of
tools, frameworks, libraries and dependencies that makes a stack easy to pick,
and to remove it and let a consumer pick each item is complex and risky.

- **Bundle:** 66 files in `plugins/stackgen/stacks/bundles/`; the unit that
  `stackgen-stack-menu` lists and `stack.template` names.
- **Pack:** 73 components in 14 kinds; each holds `pack.yaml`,
  `conventions.md`, skills (68 packs) and `config/` task files (8 packs).

The first brainstorm question: does a bundle stay as the unit a consumer picks,
and what does each pack in it still ship, now that bootstrap owns tools, LSP
data, task dispatchers and project links?

## Answers given before the stop

These are input, not rulings. Items 1, 3 and 7 assume bundles go.

1. Pack prose: delete the packs; the generator writes conventions and skills
   per repo.
2. Two plans: R5a (stackgen and the repo tooling), R5b (vwf and its readers).
3. Keep `stackgen-stack-menu`, without bundles. bootstrap gives tools only;
   architecture still finds the frameworks, dependencies and services.
4. Design adapters (the `design-tool` packs claude-code, lovable, stitch) ship
   in stackgen outside the packs, and go into the machine plugin `vwf-tools`:
   one skill per role at the fixed names, with `references/<tool>.md` added
   only for the tools that repos pick.
5. An addon (taste-skill) is a Claude plugin installed with
   `bootstrap add plugin`; `addons:` stays in `vwf.yaml`.
6. stackgen writes every test, e2e, golden, deploy and icons part into the repo
   as `NN-<name>` files the repo owns. No bootstrap test parts.
7. Existing materialized repos: keep the files, relabel pack rows in
   `lock.yaml` as generated, and move pack task files to `NN-` parts.
8. Checker: retire rules 11, 13 and 14; narrow rule 4 to stackgen's own
   skills; point rule 8 at the design-tools folder; keep rule 9. Delete the
   inventory generator, its task, its CI step and its hook (the task and the
   hook are in this repo's `.config/`, a hand step).

## Effect on the pending plans

None needs R5. Each defers to it and keeps the packs as they are:

- R3a D12: keeps every pack passage.
- R4a D1 and R4b D13, D32: keep `stack.template`, `repo.stack.template` and
  the pack payload keys.
- R4b D6, D18: the known/unknown language check against a pack's
  `language_facts` is removed and not replaced until R5; the "no linked
  language tool" doctor row covers the gap.
- bootstrap R1c (task-ports) parked gaps: packs still copy `test/e2e` and
  `test/golden` as files, which `bootstrap init` moves to `50-local`.
- bootstrap R2b (lsp) parked gap: stackgen keeps the pack `lsp_servers` until
  it reads `bootstrap lsp --json`.

Related: bootstrap `docs/memory/gaps/2026-11-14-r5-test-parts-owner-parked.md`,
`2026-11-14-pack-test-parts-parked.md`,
`2026-11-14-plugins-use-bootstrap-lsp-parked.md`.
