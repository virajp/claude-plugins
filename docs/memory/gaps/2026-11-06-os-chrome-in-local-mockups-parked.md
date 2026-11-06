GAP 2026-10-10 ★2 | local mockups ignore OS device chrome | `/vwf:mockups` shows
no `device` tweak and no OS frame — parked with no backlog item | open

**Source plan** `2026-10-10-os-device-frames`.

The canvas frames follow the pinned OS: a `device` tweak on the one coded
frame, a frame table for each platform and OS. The local mockups
(`/vwf:mockups` and the mockup-generator agent) have no viewport logic and draw
none of it.

The plan parked this and gave it no backlog item. Grep on the current tree
finds no OS or device handling in `plugins/vwf/skills/mockups/`, so the point
is still open.

Related points the plan closed, so a reader does not search for them:

- The Compose ux-gate uses explicit qualifier strings at the frame-table sizes
  (`w412dp-h915dp-port`, `w800dp-h1280dp-port`). The table stayed, and the
  tablet stays portrait.
- The Android, Wear OS, Android TV and watchOS sizes had no vendor source at
  plan time. The user ruled that each value gets a source and a wrong value is
  corrected. A "Sources:" list is now in `canvas-claude.md`.
- Vendor worked cases (Samsung, OnePlus) do not ship. Research found no stable
  public API: Galaxy Edge SDK support ended 2023-12-05, the S Pen Remote SDK
  needs a Note-series device, DeX detection uses hidden APIs, and OnePlus has
  no public SDK.
