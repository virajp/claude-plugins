# Adapter

Examples: `design-import-screens`, `ux-gate`. Several skills share one name, one
per provider.

A user-only adapter gives its host nothing, so keep the model invocation on. The
name equals the contract's fixed name, with no prefix.

```yaml
metadata:
  archetype: adapter
  implements: stackgen/design-import-screens@1
  provider: stitch
```

| Section       | Holds                                     |
| ------------- | ----------------------------------------- |
| Contract      | A link to the host's contract and version |
| Preconditions | Credentials and packages                  |
| Steps         | Numbered, and specific to the provider    |
| Output        | A link to the payload schema              |
| Rules         | `rule — reason` bullets                   |

`contractPath` in `assets/config.json` sets where a contract file lives. All
providers of one contract use the same sections.

The `design-import-*` and `ux-gate` contracts have no contract file yet. The
plan that rewrites those packs must write the files, and AD602 stays open until
then.
