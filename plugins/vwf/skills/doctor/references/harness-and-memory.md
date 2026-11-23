# Harness, Health & Memory (§§6–7)

Read this before running §6. Neither section produces a **blocking** finding —
only drift and degradations — though a failed `mise` or `bootstrap` read in §6
stops doctor.

## 6. Harness and health

Per `${CLAUDE_PLUGIN_ROOT}/assets/harness.md`, report each capability a
project's platforms require as present or absent. Since `config_format` 28 no
capability is recorded in `.config/vwf.yaml`: a capability is present when its
one fixed task exists, in the repo that holds the project that needs it. A port
capability (`e2e_local` → `test:e2e`, `goldens` → `test:golden`) is read from
`bootstrap describe --json`, its `data.ports` entry's `present`; any other is
its task name in `mise tasks ls --json --no-global --hidden`. A task under a
non-canonical name is not supported, so it reads as absent. `checks.mjs`
reports `dev`, `screenshots` and `goldens` — the capabilities `harness.md`
says a project's platforms imply — as its `harness` row: an absent one is a
**degraded** row, one per project and capability, never blocking, since
`/vwf:plan` injects its bootstrap when a cycle needs it. A failed `bootstrap`
call stops doctor with bootstrap's `errors`, a failed `mise` call with its
error output — and so does a `mise` absent from `PATH` once a project's
platforms imply a task capability (`dev`, `screenshots`): that is a refusal,
not a row.

Then check each project's health path (`projects.<name>.harness.health`,
defaulting to `/health`) is actually registered in that project's routing. Do
this by reading the routing surface, not by making a request — doctor never
starts a server or calls a deployed environment; that is `/vwf:verify`'s job.

## 7. Memory

Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, `docs/memory/` holds four
folders — `decisions/`, `gaps/`, `problems/` and `handoff/` — where the memory
asset's location rule puts them (the base repo, in a multi-repo product). A
missing folder is fine (nothing written there yet). Check one thing: that
`.gitignore` covers `docs/memory/handoff/`, a line the repo's `.gitignore`
carries, given by bootstrap's `virajp-plugins` tool (remedy
`/vwf:setup reshape`), and that no handoff file is
**committed** — drift to report, since it puts one developer's session state in
everyone's diff. When §5 reports the base's missing `virajp-plugins` tool, this
check does not report the missing ignore line: one row per cause, and the tool
row covers it. A folder or file the current format no longer has is §8's.
