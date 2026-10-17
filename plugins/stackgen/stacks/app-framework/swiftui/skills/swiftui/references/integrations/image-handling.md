# SwiftUI — remote images and cropping (Nuke, TOCropViewController)

**Wiring, configuration and anti-patterns only.** The API surface — pipeline
configuration options, image requests and processors, the lazy image view's
modifiers, the prefetcher, the crop controller's styles and delegate — is
Context7's at use time, and is the half that ages. This reference carries the
setup order, the cache and memory wiring and the rules a per-type lookup gives
only piecemeal.

Remote images go through **Nuke**: one image pipeline that loads, decodes,
processes and caches, and its SwiftUI view, `LazyImage`, which reads that
pipeline. Picking a photo from the library is the system photos picker's job —
see [platform interop](../platform-interop.md); cropping the picked image is
the **Cropping** section below.

## Setup order

1. **Add Nuke through Swift Package Manager**, the recommended path, and take
   only the modules the app uses: `Nuke` (the pipeline) in the shared module
   that owns images, and `NukeUI` (the `LazyImage` view) in the UI modules.
   `NukeVideo` is for short videos only and is not added by default.
2. **Configure the shared pipeline once at launch**, before the first view
   renders an image. A plain pipeline relies on the HTTP cache; for a product
   that reloads the same images often, configure the pipeline with Nuke's own
   **data cache** — the aggressive disk cache — with its automatic policy,
   which stores original data for unprocessed requests and processed images
   for requests with processors. One pipeline for the app; `LazyImage` uses
   the shared one by default and inherits its caching.
3. **Leave the memory cache to its defaults** unless measurement says
   otherwise. It is an LRU cache of decoded images whose default cost limit is
   derived from the device's physical memory; it empties itself on a memory
   warning and, on iOS, tvOS and visionOS, drops most entries when the app
   enters the background. Set explicit cost or count limits only for a
   measured problem.
4. **Downsample at the request.** Give every list or grid image a resize
   processor to the size it is shown at, so the decoded bitmap matches the
   frame rather than the source. For a large JPEG shown as a thumbnail,
   request the embedded thumbnail instead; Nuke generates one when the file
   has none, and it is faster than resizing a high-resolution image.
5. **Prefetch for long lists.** One image prefetcher per screen: start
   prefetching the URLs about to scroll in and stop for those that scrolled
   away. When the view later asks for the same image, the pipeline coalesces
   the request with the prefetch rather than downloading twice. Pause the
   prefetcher when the screen goes away; it cancels its outstanding work when
   released.

## Lazy loading in lists

`LazyImage` starts loading when it appears and cancels the request when it
disappears; when it reappears the download resumes where it left off. So a
`LazyImage` inside a lazy stack or a list loads nothing off-screen. Its default
content shows the image at its natural size, like `AsyncImage`; use its
content closure to make it resizable and to draw the placeholder and the
failure state the design system defines.

## Cropping

The app crops with **TOCropViewController**, used through its Swift wrapper,
`CropViewController`: of the candidates, it is the one Context7 documents —
installation through Swift Package Manager, rectangular and circular crop
styles — while Mantis has no Context7 entry to confirm its wiring.

1. **Add the package through Swift Package Manager** to the module that owns
   image editing.
2. **Wrap the controller for SwiftUI.** It is a UIKit view controller: host
   it through a view-controller representable, with a coordinator as its
   delegate that hands the cropped image back to the feature — see
   [platform interop](../platform-interop.md). Present it modally from the
   picker's result.
3. **Pick the style for the purpose**: the circular style for an avatar, the
   default rectangular style with a fixed aspect ratio for a cover or a post.
4. **Re-encode before upload**: resize the cropped image to the size the
   backend stores and compress it once, in the image module, not in the view.

## Per platform

- **iOS and iPadOS, macOS, tvOS, watchOS, visionOS:** Nuke and `NukeUI`
  support all five (Nuke 13: iOS 15, tvOS 15, macOS 12, watchOS 8,
  visionOS 1).
- **Cropping:** TOCropViewController is a UIKit controller for iOS; other
  platforms are not confirmed and offer no crop step.
- **CarPlay:** not confirmed.

## Anti-patterns

| Anti-pattern                                   | Why                                                    | Instead                                       |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Unbounded `AsyncImage` in a list               | No shared disk cache, no downsampling; memory spikes   | `LazyImage` over the shared pipeline          |
| A pipeline per view                            | Caches split; requests are not coalesced               | One pipeline configured at launch             |
| Full-resolution decode for a thumbnail         | The bitmap is sized to the source, not the frame       | A resize processor or the embedded thumbnail  |
| Hand-tuned memory cache limits with no reason  | The default already scales with device memory          | Defaults until measured                       |
| No prefetching on a long scrolling feed        | Images pop in as cells appear                          | One prefetcher per screen, start and stop     |
| Crop controller presented without a wrapper    | A UIKit controller; SwiftUI cannot host it as is       | A representable with a coordinator delegate   |
| Uploading the cropped image as it came back    | Oversized uploads; inconsistent encoding               | Resize and compress once in the image module  |
