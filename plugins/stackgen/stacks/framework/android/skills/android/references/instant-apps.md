# Android — instant apps (retired)

Google Play Instant is retired. Starting December 2025, instant apps cannot be
published through Google Play, every Google Play services Instant API stops
working, and Play no longer serves an instant app to a user by any mechanism.

This pack therefore teaches no instant-app build: no `dist:instant` module, no
instant-enabled feature, no "Try Now" flow. A repo that still carries one
removes it — the instant manifest attributes, the instant-enabled delivery and
the Instant API calls — rather than maintain code that can no longer ship.

For the growth an instant app was for, Google's guidance is to send users to
the installed app and its deep links (App Links into the journey they wanted);
see [Manifest](manifest.md) for intent filters, and
[Dynamic features](dynamic-features.md) for keeping the first download small.
