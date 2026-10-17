# Jetpack Compose — Credential Manager

**Wiring, configuration and anti-patterns only.** The request, option,
credential and exception API is Context7's at use time.

Credential Manager is the Jetpack API for signing in: one bottom sheet for
Sign in with Google, passkeys and saved passwords. It replaces the legacy
Google Sign-In for Android, which is deprecated, and Smart Lock for
Passwords, which is removed. This file wires Google sign-in, and passkeys
where the product has them; handing the Google credential to Firebase is
`firebase-auth.md`'s.

## Setup order

1. **Catalog entries** for `androidx.credentials:credentials` and
   `androidx.credentials:credentials-play-services-auth`. The second is what
   serves devices on API 33 and lower, through Google Play services; it is not
   optional for an app that supports them.
2. **The web client id** — the OAuth client of type web in the project's
   Google Cloud console; a Firebase project creates one — is the **server
   client id** the Google ID option is built with. It goes in build config
   per variant, never a literal in code.
3. **Register the Android client's fingerprints**: the package name with the
   SHA-1 of every signing key — debug, upload and Play App Signing. The Gradle
   `signingReport` task prints the local ones. With Firebase, they are
   registered in the Firebase project, as in `firebase-auth.md`.
4. **Request the Google ID option from an activity.** The credential request
   needs an activity context, so the route composable starts it and hands the
   result to the auth repository. A returning user is offered only the
   accounts already authorised for the app; the option's filter controls
   this.
5. **Hand the ID token on.** With Firebase, the Google ID token becomes a
   Firebase Google credential and signs in there. Without Firebase, the
   backend verifies the token itself, checking its audience is the web client
   id, and keys the account by the token's subject, never the email, which can
   change.
6. **On sign-out, clear the credential state**, so the providers forget the
   session and the next launch does not sign the user straight back in.

## Passkeys

- **Creating a passkey** returns a registration response the app sends to the
  backend, which validates and registers it before the user is signed in. The
  relying-party logic is the backend's.
- **Passwords and passkeys come back through the same request** as the Google
  option, so one sign-in sheet offers every credential the user has.

## Structure

- **One auth repository** owns the result of every sign-in path; the
  activity-bound request lives at the UI edge, as for the Apple flow in
  `firebase-auth.md`.
- **Cancellation is a result, not an error.** The user dismissing the sheet
  returns to the sign-in screen quietly.

## Testing

- **Unit tests use a fake auth repository**; nothing calls Credential Manager.
- **The sign-in sheet is tested on a device or emulator** with Google Play
  services and a signed-in Google account, on a build whose signing SHA-1 is
  registered.

## Per platform

- **Phone and tablet:** supported.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                       | Instead                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| The legacy Google Sign-In library in new code      | Credential Manager                             |
| Only `credentials`, no Play services artifact      | both artifacts, for API 33 and lower           |
| The Android client id as the server client id      | the web client id                              |
| Only the debug SHA-1 registered                    | debug, upload and Play App Signing keys        |
| Accounts keyed by email                            | the ID token's subject                         |
| Sign-out without clearing credential state         | clear it, or the user is signed straight back in |
| A cancelled sheet shown as an error                | return to the sign-in screen quietly           |
