DECISION 2026-09-28 ★3 | tool pin clash | when a base tool pin meets a pin the
repo already holds, ask which version to keep (the repo's or `latest`) and pin
the winner once, for every tool — the user withdrew the accepted overlap | alt
check only on `add tool`, pin in top-level env files, negation lines in
`.gitignore` rejected

**Source plan** `2026-09-28-one-pin-and-tracked-lock`.

Superseded in mechanism: the lockfile went
(`2026-10-01-mise-lockfile-dropped-exact-pins`)
and the skill went to bootstrap. The rule below is the user's and still
applies to any tool that writes pins.

- The user withdrew an earlier plan's acceptance of a double pin (graphify's
  python beside a runtime pack's python): "ask user to select which version
  must be retained/used and pin that only. Give option to select latest", and
  "The same is true for all tools".
- The check runs for every tool the base pins, on `all` and on a reshape, not
  only on `add tool`. A clash is a conflict row with two answers: the repo's
  version or the base's `latest`.
- A tool one environment needs is pinned in `conf.d/tools.<env>.toml`. A tool
  several environments need is pinned in `conf.d/tools.toml`. Never in the
  top-level `mise.<env>.toml`, which stays settings-only.
- The same run showed the negation approach fails: with `*.lock` ignored, two
  negation lines left `.config/mise/locks/x/uv.lock` ignored; it needed a
  third. The user ruled to remove lock-ignoring lines instead (see
  `2026-09-28-lock-files-tracked`).
- A comment limit of "one line" was read as one physical line. The user ruled:
  one sentence, wrapped at the fold.
