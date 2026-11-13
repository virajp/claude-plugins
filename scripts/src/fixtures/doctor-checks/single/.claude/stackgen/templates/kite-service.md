---
slug: kite-service
axis: project
kind: language-bundle
components:
  - language/kite@1.0.0
platforms: [ service, worker ]
languages: [ kite ]
language_facts:
  kite:
    lsp: kite-ls, provisioned via the generated local plugin
    mise_tool: n/a
    manifest: kite.toml
    binaries:
      - kitec
      - name: kiteprobe
        probe: "kiteprobe --version"
optional_languages: [ quill ]
frameworks: []
dependencies: []
---

An invented template for the doctor checks tests.
