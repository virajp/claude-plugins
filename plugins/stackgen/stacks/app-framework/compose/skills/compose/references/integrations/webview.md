# Jetpack Compose — WebView

**Wiring, configuration and anti-patterns only.** The `WebView`,
`WebViewClient`, `WebChromeClient` and `WebSettings` API, and the
`androidx.webkit` additions, are Context7's at use time.

Compose has no web view of its own: the platform `WebView` is a legacy `View`
bound to its host activity, wrapped in `AndroidView`. It runs a Chromium engine
across processes, so its lifecycle, not its rendering, is where the bugs are.

## Setup order

1. **Ask whether a web view is the answer.** A page the user reads and leaves
   opens in the browser; a web view is for content the app owns or controls.
2. **Declare `android.permission.INTERNET`** in the manifest.
3. **Cleartext is off by default** for an app targeting API 28 or higher, and
   `WebView` honours the policy. Allow a cleartext host, when one is truly
   needed, through a Network Security Configuration scoped to that host — the
   `android:usesCleartextTraffic` attribute is ignored once a configuration is
   present and is being deprecated.
4. **Catalog entry for `androidx.webkit`** when the app needs a `WebView` API
   newer than its minimum SDK.
5. **Wrap the view in `AndroidView`**: create and configure it in `factory`,
   push changed inputs in `update`, and clean it up in `onRelease`.
6. **Enable JavaScript only when the content needs it** — it is off by default,
   and off means no script injection.

## Lifecycle and state

- **The `WebView` dies with its activity.** It is not kept alive across
  configuration changes; navigation history and scroll position are saved
  into a `Bundle` held by `rememberSaveable`, written in `onRelease` and
  restored in `factory`. DOM state is lost on recreation.
- **Release it on leaving the composition.** A `WebView` not cleaned up when
  it leaves leaks the activity and native memory, cumulatively.
- **Back goes through the page first**: a `BackHandler` calls the view's back
  navigation while it has history, and leaves the screen otherwise.
- **Keep navigation in the app's own pages.** A `WebViewClient` keeps the app's
  links inside the view; foreign links open in the user's browser.

## The JavaScript bridge

- **Expose a bridge only to content the app ships or serves itself.** An
  object added with `addJavascriptInterface` lets page script call into the
  app; on untrusted content that is arbitrary code calling app methods.
- **Only public methods annotated `@JavascriptInterface`** are reachable from
  the page; the bridge object lives at the UI edge and forwards intents to the
  ViewModel, never holding repositories itself.
- **Camera and microphone requests from the page** arrive through the
  `WebChromeClient`; the handler checks the request's origin before mapping
  it to a runtime permission request, and denies an untrusted origin outright.

## Testing

- **Goldens render the screen's chrome** with a placeholder in place of the
  web content, which a golden cannot pin.
- **Bridge methods are tested as plain classes** with a fake ViewModel; the
  page's own script is tested on the web side.

## Per platform

- **Phone and tablet**: `WebView` in `AndroidView`, as above.
- **Wear OS**: not confirmed.
- **Android TV**: not confirmed.
- **Android Auto**: no web view — the car draws templates, not composables or
  views; see [Android Auto](../platforms/android-auto.md).

## Anti-patterns

| Anti-pattern                                     | Instead                                     |
| ------------------------------------------------ | ------------------------------------------- |
| A `WebView` kept alive across activity recreation | save history to a `Bundle`, recreate it    |
| No cleanup in `onRelease`                        | release the view when it leaves            |
| `addJavascriptInterface` on third-party pages    | a bridge only for the app's own content     |
| JavaScript enabled by habit                      | enable it only when the content needs it    |
| `usesCleartextTraffic="true"` app-wide           | a Network Security Configuration per host   |
| Page permission requests granted blindly         | check the origin, then the runtime request  |
