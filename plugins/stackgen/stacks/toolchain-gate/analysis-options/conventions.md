# analysis_options — conventions

The analyzer is the app's correctness gate, and it is language-specific — so it
belongs to the app bundle rather than to the repo gates, the same seam that puts
ESLint in the TypeScript bundle.

**Lint rules are enabled from a shared ruleset and narrowed deliberately.** A
rule disabled repo-wide because one file could not satisfy it is a rule the app
no longer has.

**Analyzer errors fail the build**, wired as one task the pipeline runs too.

## What this pack writes

No file. This pack's conventions and skill guide the agent when it writes
`analysis_options.yaml`, which is the app's, written where the app is.

**Dart is formatted by the SDK's own formatter, not dprint** — Dart is the
language dprint does not format, and the analyzer assumes that formatter's
output.

Full judgment: the `analysis-options` skill.
