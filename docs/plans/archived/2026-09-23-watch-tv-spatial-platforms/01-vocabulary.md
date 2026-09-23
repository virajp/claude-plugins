# U1 — The platform vocabulary gains watch, tv and spatial

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/templates/registry.yaml`,
  `plugins/vwf/skills/architecture/references/platforms.md`,
  `plugins/vwf/skills/architecture/references/derive-from-product.md`,
  `plugins/vwf/agents/architecture-writer.md`,
  `plugins/vwf/assets/standard-flows.md`,
  `plugins/vwf/skills/setup/references/topology-detection.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/blueprint/references/platforms.md` (read
  only, U2 owns it) to see how `auto` is framed across the tree.

## Ruling

Quoted from index.md:

- **D2** — "`watch`, `tv`, `spatial` — form-factor nouns. `watch` covers watchOS
  and Wear OS, `tv` covers tvOS and Android TV, `spatial` covers visionOS,
  Android XR and Quest."
- **D3** — "None: `watch`, `tv` and `spatial` may each be declared alone, since
  all three can ship as standalone apps. The `auto`-needs-`mobile` rule stays
  specific to `auto`."
- **D4** — "None. The change is additive — precedent `1a07016d`."
- **D5** — "All three are **device** screen platforms: store-shipped, the device
  column of the standard flows (splash mandatory), goldens required,
  `deploy_template: []`, the app changelog applies, outside the web-head
  contract."

## Edits

1. **`registry.yaml`** — `:35` the frontend role's list gains `watch`, `tv`,
   `spatial`, placed after `auto` so the device tokens sit together. `:59` the
   screen-platform list gains the same three. Leave the Flutter example at `:46`
   as it is (D9).
2. **architecture `platforms.md`** — `:19` the role table gains the three.
   Beside the `auto` elicitation rule (`:33-43`) add one short paragraph per new
   token saying what it covers (D2) and that it may be declared alone (D3),
   contrasting it with `auto`. `:42-43` the form-factors-not-vendors sentence
   gains the three analogies. `:51` the screen-platform obligations row gains
   the three as device platforms (D5).
3. **`derive-from-product.md`** — `:44,79` add an elicitation hint: a product
   doc naming a watch, a TV or a headset surface proposes `watch`, `tv` or
   `spatial` respectively.
4. **`architecture-writer.md`** — `:104` the list gains the three; `:115-116`
   leave the example unless it states the list as closed.
5. **`standard-flows.md`** — `:63` the three join the **device** column (D5).
   `:154-165` "exactly six screen platforms" becomes the new count — count the
   list after the edit, do not assume — and the Kind table gains one row per
   token, `device`. `:186-190` the form-factor prose gains the three analogies.
6. **`topology-detection.md`** — `:73` the list gains the three; `:105-106` the
   screen platforms gain them. `:141-148` add one detection-signature row per
   token, in the table's existing shape:
   - `watch` — an Xcode target whose SDK is `watchos` (a `WKApplication` or
     `WKWatchKitApp` key in its Info.plist), or an Android module with
     `com.google.android.wearable` / `uses-feature android.hardware.type.watch`;
   - `tv` — an Xcode target whose SDK is `appletvos`, or an Android manifest
     with `android.software.leanback`;
   - `spatial` — an Xcode target whose SDK is `xros`, or an Android manifest
     declaring the XR feature (`android.software.xr.api.spatial`).

## Verification

- `mise run p:plugins:check` green.
- Every owned file names `watch`, `tv` and `spatial` (a grep count ≥ 1 each).
- `grep -nE '(six|seven|Six|Seven)[* ]+(screen )?platforms'` over the owned
  files returns nothing.

## Guardrails

- Touch nothing outside Owns. Do not edit the Flutter pack or bundle (D9).
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- `registry.yaml` is a template: keep its comment-block style, change no key.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: vwf platform vocabulary gains watch, tv and spatial`
