GAP 2026-09-26 ★3 | version floor and owner transfer | a repo-recorded minimum
plugin version and a move of a landed file between owners were designed, never
built — open, parked

**Source plan** `2026-09-26-universal-packs-into-init` (archived unrun, replaced
by the tool-config skill, itself replaced by bootstrap).

The plan's pack move is dead. Two rulings in it were never built elsewhere. A
grep for `min_versions` and `owner changed` over `plugins/`, `site/` and
`.claude/` finds nothing.

- **Version floor.** The user: "The config file must contain the minimum
  version of vwf & stackgen required to run the setup or init. If the version
  mismatches, ask user for upgrade and do it with user's consent". Design:
  `.config/vwf.yaml` holds `min_versions` for `vwf` and `stackgen`, raised by
  each setup or init run to the versions it ran with. Setup, init and doctor
  read it first. An older install stops the run and offers
  `claude plugin marketplace update virajp-plugins` then
  `claude plugin update <name>`, then asks for a session restart. Rejected: a
  floor hardcoded in each plugin.
- **Owner transfer (backlog B68).** A path whose recorded owner no longer ships
  it, while another owner now does: if the file still matches the old record's
  hash, the new owner's content lands and the record moves; if it was edited,
  show a replace-or-keep row labelled `owner changed: <old> → <new>`. Remove
  the old record always. Rejected: a consent row for every transfer.
- Today `setup:ai` upgrades every plugin on each run, which covers part of the
  floor. Nothing stops a run on an older plugin than the one that shaped the
  repo. Raise it again only if a format change breaks that way.
