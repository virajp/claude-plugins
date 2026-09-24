# SwiftUI — data & networking

Data enters the app through **clients** — the seams
[standards & architecture](standards-and-architecture.md) defines — and is
held either by a model for the length of a screen or by SwiftData for longer.
No view talks to the network or the store directly.

## The API client

- **One client per backend**, registered as a dependency, built on
  `URLSession`'s `async` API. It exposes operations — `fetchOrders()`,
  `submit(_:)` — returning decoded `Sendable` value types, never `Data`, never
  a `URLResponse`.
- **Decoding happens in the client**, with `Codable` types that mirror the
  blueprint's API contract. A contract field the app does not read is not
  declared; a field that may be absent is optional, and the decoder is not
  lenient about the rest.
- **Errors are typed at the seam.** The client maps transport failures, HTTP
  status classes and decoding failures into one error type the model can
  branch on — offline, unauthorised, a server fault, a contract mismatch.
  Nothing above the client inspects a status code.
- **Authentication is the client's.** Tokens come from the keychain through
  their own client, refresh happens inside the API client, and a model never
  sees a header.
- **Cancellation is free when the call is structured.** Work started from a
  view's `task` modifier is cancelled when the view goes away; the client
  checks cancellation and throws, and the model treats a cancellation as
  nothing to show.

## Loading state

A model exposes what the screen shows — idle, loading, loaded with data,
failed with a reason — as one value, so a view cannot render data and a spinner
at once. Retries are an intent on the model, not a view re-running a request.

## Persistence: SwiftData

SwiftData is the default store for data the app keeps between launches.

- **The container is created once**, in the composition root, and installed on
  the root scene; every view under it shares its main context.
- **Views read with a query.** A screen listing stored data declares its fetch
  — filter and sort — as a query property and re-renders as the store changes.
  Do not mirror query results into a model's array.
- **Models write through the context**, via a persistence client, so tests can
  run against an in-memory container.
- **Background work gets its own context**, isolated to its own actor — an
  import, a sync pass — never the main context from a background task.
- **Schema changes are versioned.** A shipped model type changes only through a
  versioned schema and a migration plan; an unversioned change to a shipped
  model breaks the store on upgrade.

Small preferences stay in user defaults behind a client; secrets stay in the
keychain behind a client. Neither goes in SwiftData.

## Offline behaviour

Decide it per feature, and write it into the flow, not into the code alone:

- **Read-through cache** — show the stored copy at once, refresh from the
  network, update in place. The default for content the user browses.
- **Queued writes** — record the intent locally, mark it pending in the UI,
  send when connectivity returns, reconcile the server's answer. For actions
  the user expects to "just work" offline.
- **Online only** — say so on screen when offline, rather than spinning. For
  actions whose result the server must decide immediately.

Connectivity is observed through a client, so a test can drive a model through
going offline and back.
