# SwiftUI — Sign in with Apple (AuthenticationServices)

**Wiring, platform configuration and anti-patterns only.** The API surface —
the sign-in button, authorization requests and scopes, credential types, the
credential-state check — is Context7's at use time, and is the half that ages.
This reference carries the setup order, the entitlement and the lifecycle a
per-type lookup gives only piecemeal.

Sign in with Apple gives the app a stable, opaque **user identifier** for this
person, an **identity token** the backend verifies,
and — when the user agrees — a name and an email, which may be a private relay
address. The app half is here; the backend's verification and account
bookkeeping are the backend stack's, named only where the app depends on them.

## Setup order

1. **Add the Sign in with Apple capability** to the app target, which writes
   its entitlement, and enable it on the App ID in the developer account.
   Every platform product that signs in carries the capability.
2. **Put the flow in the auth module**, not a view: the button is a view, but
   the request, the result handling and the stored identity belong to one
   module every feature reaches through the composition root.
3. **Send the identity token to the backend**, which verifies its signature
   against Apple's published public keys and its audience against the app's
   identifier before creating or finding the account. The app never treats a
   credential as signed-in on its own word.
4. **Store the user identifier in the keychain**, not in user defaults — it is
   what the next launch checks. Where an extension or an App Clip must see it,
   share it through a keychain access group or App Group on both targets.
5. **Treat name and email as optional** on every authorization: when they are
   present, send them to the backend with the token so the account records
   them; never block sign-in on their absence.
6. **Check the credential state at launch** for the stored user identifier,
   and **observe credential revocation** while the app runs. A revoked or
   missing credential signs the user out locally.
7. **Wire account deletion.** When the user deletes their account in the app,
   the backend revokes the user's Apple tokens through Apple's revoke endpoint
   as part of the deletion. The backend also receives Apple's server-to-server
   notifications — an email preference change, a revoked consent, a deleted
   Apple Account — at an endpoint registered in the developer account.
8. **Handle the relay address**: a user who signed in with a private relay
   address can turn forwarding off, and the backend is told through the same
   notifications; it stops mailing that address rather than treating the
   bounce as an error.

## Per platform

The credential-state check is available on iOS, iPadOS, macOS, tvOS, watchOS
and visionOS; the flow is one module across every platform the app ships. A
client that is not one of these apps is outside this module and signs in
through the backend's own configuration.

## Anti-patterns

| Anti-pattern                                   | Why                                                | Instead                                |
| ---------------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| Trusting the credential on the device alone    | Anyone can claim an identity to your API           | Backend verifies the identity token    |
| Keying accounts by email                       | The email is optional and may be a relay address   | Key by the stable user identifier      |
| Requiring name or email to finish sign-in      | They may be absent; the user is stuck              | Optional fields, stored when present   |
| User identifier in user defaults               | Not a secure store                                 | The keychain                           |
| No credential-state check at launch            | A revoked user stays signed in                     | Check at launch, observe revocation    |
| Account deletion that leaves Apple tokens live | The app stays linked to the person's Apple Account | Backend revokes the tokens on deletion |
| Sign-in logic inside a view                    | Untestable; duplicated per platform                | One auth module                        |
