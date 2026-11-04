# taste-skill — conventions

An optional tool: one Claude plugin, no server and no file of its own.

**Who needs it.** The claude-code design tool's `design-session` authors through
this plugin's design skills and halts when it is absent. That tool's three
import skills do not need it and keep working.

**How it lands.** Through the bootstrap handoff: the materializer hands the
section below to bootstrap, which installs the plugin. `vwf-tools` holds servers
only, so nothing about this pack lands there.

## Claude plugins

- `taste-skill@taste-skill` — marketplace `Leonxlnx/taste-skill`, user scope.
