# Jetpack Compose — Cloud Storage for Firebase

**Wiring, configuration and anti-patterns only.** The reference, upload and
download API is Context7's at use time.

Cloud Storage for Firebase holds user files in a Google Cloud Storage bucket,
guarded by Security Rules and, optionally, App Check. The SDK resumes an
interrupted transfer where it stopped.

## Setup order

1. **The shared Firebase base first** — the Google services plugin,
   `google-services.json` and the BoM, as in
   [Firebase Analytics](firebase-analytics.md).
2. **Provision the default bucket in the Firebase console**; the app's config
   file then names it and the SDK uses it with no bucket argument. A second
   bucket is addressed explicitly by name.
3. **Catalog entry** for `firebase-storage` through the BoM.
4. **Write Security Rules before the first upload** — access by
   authenticated user and path, with size and content-type limits. Rules are
   the authorisation; the client is not.
5. **Wire the Storage emulator for debug builds**, connected before the first
   Storage call; an Android emulator reaches the host at `10.0.2.2`. Host and
   port come from the debug build's config.
6. **App Check enforcement**, if Storage is protected: install the provider
   first (see [Firebase App Check](firebase-app-check.md)), read the Storage
   request metrics, then enforce — unverified requests are rejected from then
   on.

## Structure

- **One storage repository in the data layer** owns paths and metadata;
  screens get URIs and progress as state.
- **Long uploads run through [WorkManager](workmanager.md)**, so a transfer the
  user started survives the screen and the process; the worker reports progress
  through data the screen observes.
- **Paths are built in one place** from the user's id and a file id, matching
  the rule paths exactly.

## Testing

- **Unit tests use a fake storage repository.**
- **Rule and integration tests run against the emulator**, never the
  production bucket.

## Per platform

- **Phone and tablet:** supported.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                 | Instead                                        |
| -------------------------------------------- | ---------------------------------------------- |
| Open rules while "we add auth later"         | rules by user and path from the first upload   |
| A large upload tied to the screen's scope    | a WorkManager worker                           |
| Paths assembled ad hoc in ViewModels         | one path builder matching the rules            |
| Tests against the production bucket          | the Storage emulator                           |
| Enforcing App Check before reading metrics   | metrics first, then enforce                    |
