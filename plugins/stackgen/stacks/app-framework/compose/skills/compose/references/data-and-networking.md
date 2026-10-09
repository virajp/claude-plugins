# Jetpack Compose — data & networking

The data layer is plain Kotlin behind repositories. Compose never sees it
directly; a ViewModel reads a repository's flows and calls its suspend
functions — see [standards & architecture](standards-and-architecture.md).

## Offline first

- **Room is the source of truth for anything the app shows twice.** The
  repository exposes a `Flow` from a DAO; the network refreshes the database and
  the UI updates because the flow emits. The UI never waits on the network to
  show what it already has. Wiring is [Room](integrations/room.md)'s.
- **Writes go to the database first**, marked pending, then sync. A failed sync
  is retried by [WorkManager](integrations/workmanager.md) with a network
  constraint, never by a loop in a ViewModel.
- **Settings and small flags** are [DataStore](integrations/datastore.md)'s,
  never `SharedPreferences` and never a Room table of one row.

## Networking

- **One HTTP client, built once, injected.** The client is provided by a Hilt
  module in the data layer; a repository receives an interface over it. Which
  client library is the repo's choice, made once; its API is Context7's at use
  time.
- **The wire model is not the UI model.** Network DTOs are `@Serializable`
  types mapped to the app's model types at the repository edge; nothing above
  the data layer imports a DTO.
- **Serialization is kotlinx.serialization**, with `ignoreUnknownKeys` so a
  server adding a field does not crash an old app.
- **Every network call is `suspend` and main-safe.** The repository moves work
  to an injected dispatcher; a ViewModel never switches dispatchers to call it.
- **Errors are values at the boundary.** The repository turns transport and
  HTTP failures into the app's result or error type; a ViewModel maps that into
  UI state. Exceptions do not cross into composables.
- **Cleartext traffic is off.** The network security config permits HTTPS
  only; a local development host is the debug build type's own exception.

## Large lists

A list too large to load at once is paged with [Paging](integrations/paging.md),
Room as the source of truth and a `RemoteMediator` filling it from the network.

## Anti-patterns

| Anti-pattern                                 | Instead                                       |
| -------------------------------------------- | --------------------------------------------- |
| ViewModel calls the HTTP client directly     | a repository between them                     |
| Network response held only in ViewModel memory | write it to Room and observe                |
| DTOs in UI state                             | map to model types in the repository          |
| `GlobalScope` or a ViewModel retry loop for sync | WorkManager with constraints               |
| `SharedPreferences` for new settings         | DataStore                                     |
