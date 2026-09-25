# SwiftUI — tvOS (`tv`)

The platform file a flow's `tv.md` take is realised on. The user is ten feet
away holding a remote with a touch surface and a few buttons. There is no touch
on the screen, no pointer and no hover: **focus is the only way in**, and a
screen is only as usable as its focus behaviour.

## The focus engine

- **Every interactive element is focusable**, and only interactive elements
  are. Standard buttons, links and list rows are focusable already; a custom
  control opts in, stating whether focus activates it or edits it.
- **Focus is always visible.** The focused item lifts, scales or gains a
  platter — the system's button styles do this; a custom style that removes
  the effect has removed the user's cursor.
- **Focus order is predictable.** Moving in a direction lands on the nearest
  element that way. Group related controls into focus sections so a swipe
  moves between groups rather than skipping one, and set the preferred default
  focus of each screen and each scope explicitly rather than letting it fall
  on whatever is first.
- **Focus is state a test can drive.** Where focus matters to behaviour — a
  field that must be focused on appear, a return to the item the user left —
  it is bound to a focus state in the model, and restored on return.
- **A focus trap is a navigation bug**: every screen can be left by focus and
  by the back button.

## Remote input

- **Select activates, the back button goes back.** The Menu or back press is
  the exit command — it dismisses a modal, pops a stack, and at the root
  returns to the Home screen; an app that intercepts it at the root to show
  its own prompt is rejected by the platform's rules.
- **Play/Pause means play/pause** wherever media is on screen.
- **Swipes move focus, not content.** Scrolling follows focus; a view that
  scrolls without moving focus leaves the user lost.
- **Text entry is a last resort.** The on-screen keyboard is slow; prefer a
  pick from a list, sign-in on another device, or dictation.

## The 10-foot distance

- **Large type, high contrast, few items.** Text sizes are the platform's text
  styles, never a phone's; a screen shows a few large items, not a dense grid.
- **Safe-area margins at the screen edge** — televisions overscan, so content
  and focusable items sit inside the safe area. Full-bleed artwork may extend
  past it; nothing the user reads or focuses does.
- **Content lockups** — artwork with a title beneath — use the system's
  card and borderless button styles so focus, parallax and the title's
  movement behave as every other tvOS app.

## Top shelf

When the app sits in the top row of the Home screen, the area above it is the
app's **top shelf**, supplied by a top shelf extension that returns sectioned
or inset content — recent items, continue-watching with playback progress,
featured content. Each item carries the action and deep link it opens,
routed through the one router in [navigation](../navigation.md). The extension
is a separate target sharing the model modules, per
[project layout](../project-layout.md), and a flow's tv take names what its
top shelf shows.

## The contract

A `tv` screen follows the flow's platform file: every interactive element
focusable with a visible focus state and a predictable order, large type
inside the safe area, and no touch or hover as inputs. The `tv` take is
selective, so a flow with no TV screen has no tvOS code.
