# Harness, Health & Memory (§§6–7)

Read this before running §6. Neither section produces a **blocking** finding —
only drift, recorded gaps, and degradations.

## 6. Harness and health

Per `${CLAUDE_PLUGIN_ROOT}/assets/harness.md`, check every capability the
config's `harness:` block marks `true` still resolves — its canonical task name
exists (`mise tasks`), or the non-canonical override the config records does. A
capability marked `false` is a **recorded gap, not a finding**: `/vwf:plan`
injects its bootstrap when a cycle needs it.

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
carries, synced by bootstrap's git tool (remedy `/vwf:setup reshape`), and that
no handoff file is
**committed** — drift to report, since it puts one developer's session state in
everyone's diff. A folder or file the current format no longer has is §8's.
