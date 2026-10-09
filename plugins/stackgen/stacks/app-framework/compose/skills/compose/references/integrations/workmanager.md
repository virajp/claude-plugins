# Jetpack Compose — WorkManager

**Wiring, configuration and anti-patterns only.** Worker and request API is
Context7's at use time.

WorkManager runs deferrable work that must complete even if the app is killed
or the device restarts — syncing pending writes, uploading, periodic refresh.
It is not for work the user is watching right now; that is a coroutine in the
ViewModel's scope.

## Setup order

1. **Catalog entries** for `work-runtime-ktx`, `androidx.hilt:hilt-work` and
   the Hilt compiler's work support; `work-testing` for tests.
2. **Use on-demand initialisation with Hilt's worker factory**: the
   `Application` implements `Configuration.Provider`, returning a configuration
   with the injected `HiltWorkerFactory`, and the manifest removes WorkManager's
   default initializer from the App Startup provider. Without this, injected
   workers fail to construct.
3. **Workers are `CoroutineWorker`s** annotated `@HiltWorker` with
   `@AssistedInject` constructors, living in the data layer beside the
   repository whose work they do.
4. **Enqueue unique work** with a stable name and an explicit policy
   (`enqueueUniqueWork` / `enqueueUniquePeriodicWork`), so repeated triggers do
   not stack duplicate jobs.
5. **Constraints** state what the work needs — network, charging, storage not
   low — rather than the worker checking and failing.

## Structure

- **Workers are idempotent.** A worker can run twice; it reads pending state
  from Room and marks it done, never assuming it is the first run.
- **Return `Result.retry()` for transient failures**, with a backoff policy on
  the request; `Result.failure()` only for errors no retry will fix.
- **Progress and outcome reach the UI through data**, not through observing the
  worker: the worker writes to Room, the screen observes Room.
  `getWorkInfo…Flow` is for a screen that is genuinely about the job's status.
- **Long-running work** (more than a few minutes) runs as expedited or
  foreground work with a notification, as the platform requires.

## Testing

`WorkManagerTestInitHelper` with a synchronous executor runs workers in tests;
`TestListenableWorkerBuilder` constructs one worker directly with fakes.

## Anti-patterns

| Anti-pattern                              | Instead                                   |
| ----------------------------------------- | ----------------------------------------- |
| Non-unique enqueue on every app start     | unique work with a policy                 |
| A worker that fails when offline          | a network constraint                      |
| Default initializer left on with Hilt workers | on-demand init with `HiltWorkerFactory` |
| Immediate UI work through WorkManager     | `viewModelScope`                          |
