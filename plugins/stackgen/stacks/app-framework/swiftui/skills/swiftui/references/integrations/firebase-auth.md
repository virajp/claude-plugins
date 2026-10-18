# SwiftUI — sign-in (Firebase Authentication)

**Wiring, configuration and anti-patterns only.** The API surface — the auth
instance, credentials and providers, the user object, the state listener,
multi-factor resolution — is Context7's at use time, and is the half that ages.
This reference carries the setup order, the URL schemes, the emulator and
keychain wiring, and how Sign in with Apple and Google Sign-In hand their
credentials to Firebase.

Firebase Authentication turns a provider's credential — Apple, Google, email,
phone — into one Firebase user the rest of the product keys on, and keeps that
user signed in on the device. The app half is here; the backend verifies
Firebase's ID token on its own side.

## Setup order

1. **Add the `FirebaseAuth` product** beside the shared bootstrap (see
   [Firebase Analytics](firebase-analytics.md) for the package, the
   `GoogleService-Info.plist` and `FirebaseApp.configure()`).
2. **Enable each provider in the Firebase console**, under Authentication,
   Sign-in method, and download a fresh `GoogleService-Info.plist` after
   enabling Google — it carries the client ids that provider needs.
3. **Add the URL schemes the providers redirect to**, in the app target's URL
   Types: the `REVERSED_CLIENT_ID` value from `GoogleService-Info.plist` for
   Google Sign-In, and the Encoded App ID from the console's app settings for
   phone sign-in's reCAPTCHA fallback.
4. **Forward opened URLs when swizzling is off.** With
   `FirebaseAppDelegateProxyEnabled` set to `NO`, the app hands each opened URL
   to Firebase Auth first and handles it only if Auth declines it; the decision
   is app-wide (see [Firebase Analytics](firebase-analytics.md)).
5. **Share the session where extensions need it.** Enable Keychain Sharing on
   every target that must see the signed-in user, with one keychain group
   identifier, and point Firebase Auth at that access group in each. One
   sign-in then signs every target in, and one sign-out signs every target
   out.
6. **Put the flow in the auth module**, not a view; features read the current
   user through the composition root.

## The emulator

- **Connect before the first auth call.** In a debug configuration, point the
  auth instance at the Local Emulator Suite's Authentication emulator — its
  default port is `9099` — at start-up, before anything signs in; the
  connection must be made before the instance is used for anything.
- **Start the suite from the repo**, with the Firebase CLI's emulator command,
  so local runs and UI tests sign in against throwaway accounts.
- **Never in a release build.** The emulator switch is a build-configuration
  decision in the composition root.

## Sign in with Apple, through Firebase

The app-side wiring — the capability, the button, the credential-state check —
is [Sign in with Apple](sign-in-with-apple.md). Through Firebase it adds:

- **Console configuration.** Enable Apple under Sign-in method with the
  Services ID, and fill the OAuth code flow configuration — the Apple team id,
  a Sign in with Apple private key and its key id. The private key is a
  **secret**, held in the console and the secrets provider, never the repo.
- **A nonce on every request.** The app generates a random nonce, sends its
  SHA-256 hash with the Apple request, and hands the raw nonce with Apple's
  identity token to Firebase, which checks the two match.
- **The full name with the credential.** When Apple returns the user's name,
  pass it with the credential so Firebase records it.
- **Account deletion revokes the Apple token.** Firebase does not store Apple's
  tokens, so the app asks the user to sign in again, revokes the tokens with
  the fresh authorization code, then deletes the Firebase user and its data.
- **Relay mail.** If Firebase sends the user email — verification, sign-in
  links — register Firebase's sender with Apple's private email relay service
  so mail reaches relay addresses.

## Google Sign-In

GoogleSignIn-iOS presents Google's sign-in and returns a Google user whose
tokens Firebase turns into a Firebase credential.

1. **Add the GoogleSignIn-iOS package** through SwiftPM; it ships the
   `GoogleSignIn` library and a SwiftUI button library, `GoogleSignInSwift`.
2. **Enable Google** in the Firebase console and refresh
   `GoogleService-Info.plist`, as in the setup order above.
3. **Register the reversed client id as a URL scheme.** Interactive sign-in
   checks for it and fails outright when it is missing.
4. **Take the client id from Firebase's options**, the one
   `GoogleService-Info.plist` carries, and configure Google Sign-In with it at
   start-up — one source for the id, never a second literal.
5. **Hand the redirect back.** The URL the sign-in flow returns through is
   passed to Google Sign-In's URL handler from the app's URL-open callback.
6. **Exchange for a Firebase credential.** Google's ID token and access token
   become a Google credential that signs the user in to Firebase; the Google
   session itself is not the app's session.
7. **Restore at launch.** Restore the previous Google sign-in where the app
   needs Google's tokens again; a failed restore means "signed out of Google",
   not an error.
8. **App Check.** On iOS 14 and later, Google Sign-In can attest with App
   Attest; configure it early at start-up, or with its debug provider in debug
   builds — see [Firebase App Check](firebase-app-check.md).

## Per platform

- **iOS and iPadOS** — supported, every provider above.
- **macOS** — Firebase Auth partial; Google Sign-In supported (macOS 12 and
  later, Mac Catalyst as well).
- **tvOS** — Firebase Auth partial; Google Sign-In not confirmed.
- **watchOS** — Firebase Auth partial, community support only; Google Sign-In
  not confirmed.
- **visionOS** — Firebase Auth partial, community support only; Google Sign-In
  not confirmed.
- **CarPlay** — not confirmed.

Google Sign-In's packages declare iOS 15 and macOS 12 as their deployment
targets.

## Anti-patterns

| Anti-pattern                                      | Why                                                       | Instead                                          |
| ------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| Missing reversed client id URL scheme             | Interactive Google sign-in fails outright                 | Add it from `GoogleService-Info.plist`           |
| Client id typed as a second literal               | Drifts from the plist and the Firebase project            | Read it from Firebase's options                  |
| Emulator connected after the first auth call      | The instance is already bound to production               | Connect at start-up, debug builds only           |
| Emulator switch reachable in a release build      | Real users sign in against nothing                        | Build-configuration decision, composition root   |
| Apple request sent without a hashed nonce         | Firebase rejects the credential; replay is possible       | Hash a fresh nonce per request                   |
| Deleting the user without revoking Apple's tokens | The app stays linked to the person's Apple Account        | Re-authenticate, revoke, then delete             |
| Apple private key in the repo                     | A credential leak                                         | Console and secrets provider only                |
| No shared keychain group for extensions           | Extensions see a signed-out user                          | Keychain Sharing on every target, one group      |
| Sign-in logic inside a view                       | Untestable; duplicated per platform                       | One auth module                                  |
