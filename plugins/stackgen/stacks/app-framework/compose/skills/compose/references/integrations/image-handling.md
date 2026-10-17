# Jetpack Compose — image loading and cropping

**Wiring, configuration and anti-patterns only.** Coil's request, cache and
composable API, and the cropper's options, are Context7's at use time.

Coil loads remote and local images into Compose with coroutines, a memory and
a disk cache, and decodes at the size the layout asks for. Picking an image
from the gallery or camera is not this file's — that is the photo picker in
[platform interop](../platform-interop.md) or [CameraX](camerax.md); this file
covers showing images and cropping one the user picked.

## Setup order

1. **Catalog entries** for Coil 3's `io.coil-kt.coil3:coil-compose` and its
   network fetcher, `coil-network-okhttp`. Coil 3 ships network loading as a
   separate artifact.
2. **One shared `ImageLoader`, built once**: the `Application` implements
   Coil's singleton image-loader factory, so every `AsyncImage` in the app
   uses the same loader, caches and connection pool.
3. **Size the caches in that builder** — the memory cache as a share of the
   app's memory, the disk cache as a directory under the app's `cacheDir` with
   a size bound.
4. **Share the app's HTTP client.** When the app already builds an
   `OkHttpClient` (through Hilt, per [Hilt](hilt.md)), the image loader's
   network fetcher takes a client derived from it with `newBuilder()`, so
   interceptors and the connection pool are shared rather than duplicated.

## Sizing

- **`AsyncImage` resolves the size from its layout constraints**, so a
  thumbnail decodes as a thumbnail. Give it a bounded modifier; an unbounded
  one decodes the original.
- **`rememberAsyncImagePainter` does not detect its size** and loads the
  original dimensions unless it is given a constraints size resolver. Prefer
  `AsyncImage`; reach for the painter only when a `Painter` is the API needed.
- **Lists show thumbnails**: the server supplies sized variants where it can,
  and the client never downloads a full-size photo for a list cell.

## Cropping

**Android-Image-Cropper** (the CanHub project, published as
`com.vanniktech:android-image-cropper`) — chosen because it is the cropping
library Context7 documents, and its activity-result contract plugs into a
Compose launcher at the UI edge.

1. **Catalog entry** for the cropper. Its AAR merges its own crop activity, a
   file provider under the app's id and the package-visibility queries for
   gallery and camera intents; the app declares none of them.
2. **An app theme without an action bar** gives the crop activity none
   either; the library's README recommends declaring the activity again with
   an AppCompat theme in that case.
3. **Launch from the route composable** with the library's crop contract,
   passing the URI the photo picker returned; the result's URI goes into the
   screen's state and on to the repository for upload.
4. **Cancellation is its own result**, not a failure: the user backing out
   shows no error.

## Testing

- **Screenshot tests and previews never hit the network.** Tests install a
  fake image-loader engine as the singleton loader, mapping URLs to fixed
  colour images; previews provide Coil's async-image preview handler.
- **The crop activity is exercised on a device or emulator**; unit tests
  cover the repository with a fixed URI.

## Per platform

- **Phone and tablet:** supported, for Coil and the cropper.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                      | Instead                                   |
| ------------------------------------------------- | ----------------------------------------- |
| An `ImageLoader` built per screen                 | the one singleton from the `Application`  |
| A second `OkHttpClient` built from scratch        | `newBuilder()` on the app's client        |
| `rememberAsyncImagePainter` without a size        | `AsyncImage`, or a constraints resolver   |
| Full-size photos in list cells                    | sized variants and bounded modifiers      |
| Declaring the cropper's activity and provider by hand | the AAR's merged manifest             |
| Treating a cancelled crop as an error             | handle the cancelled result quietly       |
| Network images in screenshot tests                | a fake image-loader engine                |
