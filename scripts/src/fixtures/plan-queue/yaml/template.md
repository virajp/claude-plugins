---
name: example-service
axis: project
platforms: [ service, worker ]
languages: [ typescript ]
components:
  - app-framework/example-framework@1.2.0
  - language/typescript@generated
description: >-
  An invented service template, shaped on the payload
  frontmatter for the subset reader's tests.
conventions: |
  Keep handlers thin.
  Validate at the boundary.
---

# example-service

The conventions body is not frontmatter and is never parsed.

---

A horizontal rule further down is not a second fence.
