# W3 — This repo's env.toml comment drops the editor profile

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/conf.d/env.toml`
- **Model:** opus
- **Kind:** edit
- **Read first:** `.config/mise/conf.d/env.toml:10-25`.

## Ruling

> G4 — Remove "a per-repo editor profile" as a `REPO_NAME` reader wherever it is
> named.

## Edits

1. `env.toml:19` — remove "an editor profile" from the comment's list of
   `REPO_NAME` readers, keeping the comment true. Change nothing but that
   comment: no value, no key, nothing inside a `# >>>` / `# <<<` block's lines
   other than the comment itself.

## Verification

- `grep -n -i 'editor profile' .config/mise/conf.d/env.toml` prints nothing.
- `MISE_ENV=dev mise env -s bash | grep REPO_NAME` unchanged from before the
  edit.
- The full wave gate.

## Guardrails

- Touch no other `.config/` file.
- Delete with `rm`, never `git rm`.

## Commit

`ops: env.toml comment no longer names an editor profile`
