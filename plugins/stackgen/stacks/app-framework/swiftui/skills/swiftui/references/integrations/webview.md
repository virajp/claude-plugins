# SwiftUI — web views (WebKit)

**Wiring, platform configuration and anti-patterns only.** The API surface —
the SwiftUI web view and its page model, the WebKit view and its
configuration, navigation decisions, script message handlers, the website
data store — is Context7's at use time, and is the half that ages. This
reference carries the hosting choice, the transport and data-store wiring and
the bridge rules a per-type lookup gives only piecemeal.

A web view shows content the app does not own — a help centre, a checkout, a
partner's form — inside the app's own chrome. It is a second runtime with its
own storage, its own networking and its own code; every rule below exists to
keep that runtime from reaching further into the app than the screen that
shows it.

## Setup order

1. **Pick the host by the deployment floor.** WebKit ships a native SwiftUI web
   view, driven by an observable page object, from iOS, iPadOS, macOS and
   visionOS 26. Below that floor, the WebKit view is hosted in SwiftUI through
   the platform's view representable — UIKit's on iOS, iPadOS and visionOS,
   AppKit's on macOS — see [platform interop](../platform-interop.md). One
   screen uses one host; do not mix the two for the same content.
2. **Put the web view behind one feature module** that owns its
   configuration — data store, content controller, navigation policy — and
   hands the view a finished configuration. Views never assemble a web view configuration
   themselves.
3. **Keep App Transport Security on.** Web content loads over HTTPS like the
   rest of the app. Where a web view must show content the app cannot vouch
   for, `NSAllowsArbitraryLoadsInWebContent` lifts ATS for web view requests
   alone and keeps it for the app's own networking; never lift it app-wide
   with `NSAllowsArbitraryLoads`, and prefer a named exception domain when the
   insecure host is known.
4. **Choose the data store on purpose.** The default store persists cookies,
   storage and caches to disk and is shared by every web view that uses it, so
   a signed-in session in one appears in the next. Use a non-persistent store
   for anything private or one-off — it keeps data in memory and writes
   nothing — and an identified persistent store when separate profiles must
   not see each other's data.
5. **Decide the navigation policy** — which hosts load in place and which open
   in the system browser — in the feature module, before content is loaded.
   An embedded web view that follows any link becomes a browser with none of
   a browser's protections.
6. **Wire the JavaScript bridge only if the page must talk to the app.** A
   named script message handler, installed on the content controller in a
   chosen content world, is exposed to the page as a function under
   `window.webkit.messageHandlers`. Scope it to the content world that needs
   it, keep the handler names in one list, and remove each handler when the
   screen goes away.
7. **Make the web view inspectable in debug builds only.** The inspectable
   flag defaults to off; turned on, the content shows in Safari's Develop menu
   for the Mac or an attached device. Gate it on the build configuration so a
   release build is never inspectable.

## The bridge

- **Every message is untrusted input.** Check the frame and the web view that
  sent it before acting, decode the body into a typed value, and drop
  anything that does not decode. A handler that runs whatever the page asks
  is an API with no authentication.
- **The handler calls feature modules**, never views, and returns results the
  same way a page would get any other response — see
  [standards & architecture](../standards-and-architecture.md).
- **Private content gets its own content controller** and a non-persistent
  store, so its handlers and its cookies are not shared with other web views.

## Testing

- **Load fixed HTML in tests** rather than a live site: the native page
  object can load a given HTML string as the response to a request, so a
  bridge or navigation-policy test runs offline.
- **Test the bridge's decoding and origin checks** as plain units, with the
  message body as data; the web view itself is not needed for them.

## Per platform

- **iOS, iPadOS and visionOS** — the WebKit view, its inspectable flag (from
  iOS and iPadOS 16.4), and from 26 the native SwiftUI web view.
- **macOS** — the same, with the inspectable flag from macOS 13.3 and the
  native SwiftUI web view from macOS 26.
- **watchOS and tvOS** — Context7 lists no WebKit web view for either; a
  feature built on web content has no screen there and is designed out of
  those products.
- **CarPlay** — not confirmed.

## Anti-patterns

| Anti-pattern                                       | Why                                                    | Instead                                              |
| -------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| `NSAllowsArbitraryLoads` to make one page load     | Drops ATS for the app's own networking too             | `NSAllowsArbitraryLoadsInWebContent`, or one domain  |
| Default data store for a private flow              | Cookies and storage persist and leak to other views    | A non-persistent store                               |
| Bridge handler that trusts the message             | Any page the view loads can drive the app              | Check the sending frame; decode to a typed value     |
| Handlers never removed                             | The screen and its handler outlive their use           | Remove each handler when the screen goes away        |
| Web view follows every link in place               | An embedded browser with no address bar or protections | A navigation policy; open the rest in the browser    |
| Inspectable flag on in release builds              | Shipped content opens in Safari's Web Inspector        | Gate the flag on the debug configuration             |
| Configuration assembled inside a view              | Data store and handlers differ per screen              | One feature module hands over the configuration      |
| Native SwiftUI web view below its OS floor         | Does not build or run on the older targets             | Host the WebKit view through a representable         |
