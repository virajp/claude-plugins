---
type: vwf-flow-platform
title: Home — webapp
description: The browser home surface — cart summary, recent orders, and
  routes onward.
status: reviewed
platform: webapp
implementation: complete
---

# Home — webapp

Flow contract: [Home](./index.md)

## Screens → web

| Code | Screen | Route | Reads (operationId) | States (loading/error/empty)                             | Actions                     | Form validation |
| ---- | ------ | ----- | ------------------- | -------------------------------------------------------- | --------------------------- | --------------- |
| 100a | home   | /     | `getOrder`          | loading · error (history region) · empty (no orders yet) | Go to checkout · Open order | —               |

<!-- The standard `home` flow's primary screen takes the flow's slug: it is
     named `home`, never "Dashboard" or "Landing". Home flow for this screen;
     Checkout and Order history are homed by the place-order flow. Visual
     language comes from ../../../design-system.md. -->

### 100a — home components

| Component               | Rules                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Cart summary (info)     | Shown only when the customer has an open cart; states item count and total                  |
| Go to checkout (button) | Visible only with an open cart; click → Checkout (110a, place-order)                        |
| Recent orders (list)    | Up to five most recent orders, newest first; row click → Order detail (120a, cancel-refund) |
| Empty state (info)      | Shown when the customer has no orders yet; invites them to start shopping                   |
| History error (banner)  | Shown when `getOrder` fails; offers retry and never blocks the checkout route               |

### 100a — home metadata

| Field       | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| title       | Example Shop — order from independent retailers                          |
| description | Browse your cart and recent orders, and check out in one sitting.        |
| index       | yes                                                                      |
| image       | default                                                                  |

<!-- One Metadata block per Screens row, on a site/webapp platform file only
     (format 25). `web` declares the `seo` capability, so all four fields are
     pinned; a webapp without it would pin `title` alone. Product-wide values —
     site name, default description, handle, locale, organisation — are
     ../../../conventions.md#web-metadata, and `default` is the social preview
     named in the design system's Brand assets. The home screen is the one page
     here offered to search. -->
