# Jetpack Compose — DataStore

**Wiring, configuration and anti-patterns only.** The read and update API is
Context7's at use time.

DataStore holds small, settings-shaped data — preferences, flags, the last
selected tab — as a `Flow`, written transactionally off the main thread. It
replaces `SharedPreferences` in new code.

## Setup order

1. **Pick the flavour once per store.** Preferences DataStore for a handful of
   untyped keys; typed DataStore with a serializer (kotlinx.serialization or
   protobuf) for a structured settings object with a schema.
2. **Create exactly one instance per file**, as a Hilt `@Provides @Singleton`
   in the data layer. Two instances on one file corrupt it, and DataStore
   throws when it detects them.
3. **Wrap it in a repository** exposing a `Flow` of the app's settings model and
   `suspend` setters. ViewModels never see the DataStore or its keys.
4. **Migrating from `SharedPreferences`**: pass the
   `SharedPreferencesMigration` to the builder so the first read moves the old
   values, then stop reading the old file.

## Structure

- **Defaults live in the model**, applied when a key is absent, so a fresh
  install and an upgraded one read the same shape.
- **Handle `IOException` on read** by emitting defaults; any other exception is
  a bug and propagates.
- **Not a database.** Lists that grow, anything queried or partially updated,
  belongs in [Room](room.md).
- **Not a secret store.** Tokens and keys go to the Android Keystore-backed
  storage the repo chooses, never plain DataStore.

## Testing

Create the store on a temporary file in a test scope (`TemporaryFolder`,
`TestScope.backgroundScope`) and assert through the repository's flow.

## Anti-patterns

| Anti-pattern                          | Instead                                   |
| ------------------------------------- | ----------------------------------------- |
| A DataStore created per call site     | one injected instance per file            |
| `runBlocking` to read a setting at startup | collect the flow; show a loading state |
| Secrets in DataStore                  | Keystore-backed storage                   |
| New `SharedPreferences` code          | DataStore                                 |
