# Jetpack Compose — pick & trade

## When it is the answer

**When every surface the product ships to is Android.** Phones, foldables and
tablets share one language, one UI toolkit and one build. A product whose
screens all live on Android gets native controls, native accessibility and
day-one access to new platform API from one codebase, with no layer between the
app and the system.

**When the interface should feel like the platform's own.** Material 3 is the
system's design language: dynamic colour, the type scale, motion, predictive
back and edge-to-edge are the defaults rather than an imitation of them.

**When the app lives in platform integration.** Background work, the camera,
notifications, widgets, sensors, Bluetooth: each is a direct call from Kotlin,
never a channel or a plugin bridge. The deeper the product sits in Android, the
stronger this case.

**When the team already writes Kotlin.** A Kotlin backend or library team
shares the language, coroutines, the test framework and the build tool with
this app.

## When it stops being the answer

**When iOS is a surface at all.** Compose on Android does not run there. A
product that must reach iPhone either builds that app a second time on a native
Apple stack or pins a cross-platform stack for both. Two native apps cost two
teams' worth of features, specs and bugs, drifting a little each round. If iOS
is first-class from day one, a cross-platform SDK is usually cheaper; if it is a
later, smaller surface, native Android first is defensible.

**When there is a browser surface.** This pack does not target the browser. A
product with one pins a browser stack for that project, beside this one.

**When the screens are mostly an existing View-based app.** This stack teaches
Compose only. Migrating a large XML-layout app screen by screen means living
with two UI toolkits and their interop for a long time; that migration is out of
this stack's scope.

## Compose versus Views

**Compose is the default for every screen.** It is declarative, it is where new
Material and platform UI lands first, and Google's own guidance treats it as the
recommended toolkit. Views and XML layouts are not offered by this stack — not
as a fallback, not for one tricky screen. A control that exists only as a View
is a reason to look for its Compose equivalent first; where none exists, the
decision to embed one is a recorded exception, not a pattern.

## One app or one per form factor

**One app for phone and tablet.** Both are the same product at different window
sizes; layout adapts to the window size class, never to a device model — see
[phone & tablet](platforms/phone-and-tablet.md).

**A module per further form factor.** A watch, a TV and a car surface are each
their own entry point over the shared domain and data modules, built on their
own library: [Wear OS](platforms/wear-os.md),
[Android TV](platforms/android-tv.md) and
[Android Auto](platforms/android-auto.md).

## The trade nobody states up front

**The SDK and the Android Gradle Plugin move every year.** Each Android release
raises the target SDK the store accepts, and each AGP release raises the Gradle
and JDK versions it needs. The repo pins them, and the yearly move is planned
work — the `framework/android` pack owns the pins.

**Compose's speed comes from stability, and stability is easy to lose.** A
screen that recomposes on every frame is usually one unstable parameter away
from a fast one. Read [performance](performance.md) before optimising anything
else.
