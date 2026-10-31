# Android — form factors in the manifest

Phone and tablet share one app module; the other form factors are decided in
the manifest, where Play reads which devices may install the app. Each form
factor is a platform token in the registry — `watch` is Wear OS, `tv` is
Android TV and Google TV, `auto` is Android Auto and Android Automotive OS —
and each gets its own app module (`:wear`, `:tv`, `:car`) sharing library
modules with the phone app, never a flag inside it. The UI for each is the
**compose** skill's; this reference is what the build and the manifest must
declare. The general manifest rules are in [Manifest](manifest.md).

## Wear OS — `watch`

```xml
<uses-feature android:name="android.hardware.type.watch" />

<application>
    <meta-data
        android:name="com.google.android.wearable.standalone"
        android:value="true" />
</application>
```

- `android.hardware.type.watch` is what makes the module a Wear OS app; Play
  offers it to watches only.
- `standalone` is `true` when the watch app works without the phone app
  installed — the default to aim for — and `false` only when it truly cannot.
- The watch module has its own `applicationId` or shares the phone's; sharing
  it is what lets the two exchange data through the Wearable Data Layer.

## Android TV — `tv`

```xml
<uses-feature android:name="android.software.leanback" android:required="true" />
<uses-feature android:name="android.hardware.touchscreen" android:required="false" />

<application android:banner="@drawable/banner">
    <activity android:name=".MainActivity" android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

- `android.software.leanback` marks a TV app; `required="true"` in a TV-only
  module, `required="false"` when one module also ships to phones.
- `android.hardware.touchscreen` is **not required**: a TV has none, and an
  app that leaves it implied is hidden from every TV.
- The launcher entry is `LEANBACK_LAUNCHER`, and the app needs a banner — the
  home-screen tile — or it does not appear on the TV home screen.

## Android Auto — `auto`

An Android Auto app is a phone app the car's screen projects; it is built on
the Car App Library's templates, from a `CarAppService`:

```xml
<application>
    <meta-data
        android:name="com.google.android.gms.car.application"
        android:resource="@xml/automotive_app_desc" />
    <meta-data android:name="androidx.car.app.minCarApiLevel" android:value="1" />

    <service android:name=".CarService" android:exported="true">
        <intent-filter>
            <action android:name="androidx.car.app.CarAppService" />
            <category android:name="androidx.car.app.category.NAVIGATION" />
        </intent-filter>
    </service>
</application>
```

- `res/xml/automotive_app_desc.xml` declares `<uses name="template" />` for a
  Car App Library app.
- The category — `NAVIGATION`, `POI`, `IOT`, `MEDIA`, `MESSAGING` and the
  others the library defines — is the app's car category; Play reviews the app
  against it, and only one is declared unless the library allows the pair.
- `minCarApiLevel` is the lowest Car App API level whose features the app uses;
  raise it when a template needs a newer host.

## Android Automotive OS — `auto`

Automotive OS runs the app on the car itself, from its own module:

```xml
<uses-feature android:name="android.hardware.type.automotive" android:required="true" />
```

- The Car App Library service and category are the same as for Android Auto;
  the module adds `androidx.car.app:app-automotive` and the automotive
  `uses-feature`.
- Features a car lacks are declared not required — the touchscreen-less ones
  among them — exactly as for TV, or the store hides the app.
- Automotive OS has its own Play track; the `required` value for
  `android.hardware.type.automotive` follows the track's rules, so check them
  before a first release.

## A managed device per form factor

Each form-factor module declares its own Gradle Managed Device, so `test:e2e`
boots the right kind of emulator (see
[Emulator & managed devices](emulator-and-managed-devices.md)):

| Module | Device profile, e.g. | System image |
| --- | --- | --- |
| `:app` | `Pixel 8` | `google_apis` |
| `:wear` | a round Wear OS profile | the Wear OS image for the level |
| `:tv` | `Television (1080p)` | the Android TV or Google TV image |
| `:car` | an Automotive profile | the Automotive image |

Device profile names are those `avdmanager list device` prints; take them from
there, not from memory. Not every form-factor image is published for every API
level or as an ATD image — pick the level the image exists for, and pin it in
that module's `apiLevel`. An Android Auto app has no emulator of its own: its
car screen runs in the Desktop Head Unit, driven by hand, so its E2E run is the
phone module's, and its templates are tested with the Car App Library's
testing artifact.
