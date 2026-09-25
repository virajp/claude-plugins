# SwiftUI — macOS (`desktop`)

The platform file a flow's `desktop.md` take is realised on. A Mac user expects
windows, a menu bar and a keyboard, and judges an app by whether those three
behave like every other Mac app. An iPad layout stretched onto a Mac window
fails on all three.

The `desktop` doctrine here and the gates assume a **native macOS target**.
Mac Catalyst is not the desktop path, and the gates do not build it.

## Windows

- **Declare every window as a scene.** A document or content window that can
  exist many times is a window group; a single utility window the app brings
  forward rather than duplicating is a singleton window; a status-item app is a
  menu bar extra. Pick per window, in the app's scene body — never by opening
  AppKit windows by hand.
- **Opening a window is a scene action, not navigation.** A command or a
  double-click that shows something in its own window calls the open-window
  action with an id or a value; the navigation inside a window is still
  [navigation](../navigation.md)'s stack or split.
- **Each window owns its own state.** Selection, scroll position and the
  navigation path are per-window; data shared between windows lives in the
  model layer, per [state management](../state-management.md). Two windows on
  the same record stay consistent because they read the same model, not
  because one writes into the other.
- **Windows are resizable and restorable.** Give each scene a sensible default
  and minimum size, lay out for any width above the minimum, and let the system
  restore open windows at relaunch.

## The menu bar

- **Every command lives in the menu bar**, even when a toolbar button or a
  context menu also offers it: the menu bar is how a Mac user discovers what
  the app can do, and where its keyboard shortcut is shown.
- **Commands are declared on the scene** — added into the standard menus at
  their standard places (after New, beside Copy and Paste) or as a menu of the
  app's own — and act on the focused window's content, read through focused
  values, never on a global "current" object.
- **Keep the standard menus standard.** Replace a system command group only
  when the app genuinely does it differently, and never drop Undo, the edit
  commands or Close.

## Keyboard

- **Every command a user repeats has a shortcut**, chosen to match what other
  Mac apps use for the same action; a new window, the settings window and each
  singleton window take one from the scene.
- **Full keyboard navigation works**: every control is reachable with Tab when
  the user has enabled it, focus is visible, Return performs the default action
  and Escape cancels — the exit command a sheet or popover honours.
- **Lists and tables support the keyboard selection model** — arrow keys,
  Shift and Command to extend, Delete to remove where removal is offered.

## Settings

Preferences live in the **settings scene**, which the system turns into the
application menu's Settings item with its standard shortcut. It is a window of
its own with tabs for groups of settings, applying changes immediately rather
than behind an OK button. Declare it for macOS only; on iPad the same menu item
opens the system Settings app.

## The contract

A `desktop` screen follows the flow's platform file: sidebars and multi-column
layouts where the width allows, pointer hover and right-click context menus as
first-class inputs, and density appropriate to a pointer rather than a finger.
A flow that opens a detail in a new window records it as a platform deviation;
the realisation is the open-window action above.

Which platforms share a target with the Mac is
[pick & trade](../pick-and-trade.md)'s.
