# Android — the manifest

`AndroidManifest.xml` in `src/main/` declares what the module is to the system:
its components, the permissions it needs, the features it requires. AGP merges
every module's and every dependency's manifest into the app's; the merged one
is what ships, and `build/intermediates/merged_manifest/` is where to read it
when a permission or component appears from nowhere.

## What goes in it

- **No package attribute.** The namespace is the build script's `namespace`;
  the application ID is `applicationId`. A `package=` here is an error on
  current AGP.
- **No SDK levels.** `minSdk` and `targetSdk` are the build script's; a
  `<uses-sdk>` here is overridden and misleads the reader.
- **Components the system starts**: one `<activity>` for a Compose app — the
  single activity hosting the navigation graph — plus any `<service>`,
  `<receiver>` or `<provider>` the system must reach. Every component that
  declares an `<intent-filter>` states `android:exported` explicitly.
- **Permissions by need.** Each `<uses-permission>` is one the code uses today;
  a dangerous permission is requested at runtime at the moment it is needed,
  with the rationale shown first, and the feature degrades when it is denied.
- **Features honestly required.** A `<uses-feature>` the app cannot run without
  is `required="true"`; one it uses when present is `required="false"`, so the
  store does not hide the app from devices without it.

## The merge

A library manifest declares only what the library itself needs — its own
components and permissions — and nothing about the app. When a dependency
contributes a permission the app must not ship, remove it in the app manifest
with `tools:node="remove"`, and write why beside it. Merge conflicts are
resolved with the `tools:` markers, never by editing a dependency.

## Backup and data

`android:allowBackup` and the data-extraction rules are decided, not left at
the default: an app holding tokens or personal data excludes them from backup
and device transfer.
