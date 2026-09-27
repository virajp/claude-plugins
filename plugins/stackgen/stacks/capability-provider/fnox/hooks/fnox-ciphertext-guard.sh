#!/usr/bin/env sh
# fnox-ciphertext-guard — the encrypt-into-git gate: the secrets contract's
# four conditions. POSIX sh and BSD tools only: no `\s`, no `\b`, no GNU flags.

set -eu

FNOX_FILE="${FNOX_FILE:-fnox.toml}"
GITLEAKS_CONFIG="${GITLEAKS_CONFIG:-.config/gitleaks.toml}"
MEMPALACE_CONFIG="${MEMPALACE_CONFIG:-mempalace.yaml}"
GITIGNORE="${GITIGNORE:-.gitignore}"

fail=0

say() {
  printf '%s\n' "$*" >&2
}

flag() {
  fail=1
  say "fnox-ciphertext-guard: $*"
}

# Both spellings: a gitleaks `paths` entry writes the dot as `\.`.
names_fnox_file() {
  grep -Fq "$FNOX_FILE" "$1" ||
    grep -Fq "$(printf '%s' "$FNOX_FILE" | sed 's/\./\\./g')" "$1"
}

# No fnox config, nothing to guard.
if [ ! -f "$FNOX_FILE" ]; then
  exit 0
fi

# --- Condition 3: every secret entry is ciphertext or a reference -----------
# TOML inline tables are single-line, so a line is a whole entry.
plaintext=$(
  awk '
    /^[[:space:]]*#/ { next }
    /^[[:space:]]*\[/ {
      header = $0
      sub(/^[[:space:]]+/, "", header)
      in_secrets = (header ~ /^\[secrets\]/ || header ~ /^\[profiles\.[^]]+\.secrets\]/)
      next
    }
    in_secrets && /=/ {
      if ($0 !~ /provider[[:space:]]*=[[:space:]]*"/) {
        name = $0
        sub(/[[:space:]]*=.*$/, "", name)
        sub(/^[[:space:]]+/, "", name)
        sub(/[[:space:]]+$/, "", name)
        if (name != "") print name
      }
    }
  ' "$FNOX_FILE"
)

if [ -n "$plaintext" ]; then
  flag "plaintext in $FNOX_FILE — these entries carry no provider:"
  printf '%s\n' "$plaintext" | while IFS= read -r name; do
    say "    $name"
  done
  say "  Encrypt them (fnox set ... --provider age), or move non-secret"
  say "  configuration to the mise env, where it belongs."
fi

# --- Condition 1: the scanner allowlists this file, by path ----------------
if [ ! -f "$GITLEAKS_CONFIG" ]; then
  flag "$GITLEAKS_CONFIG is missing — $FNOX_FILE holds committed ciphertext"
  say "  and needs a path allowlist. See the fnox skill, condition 1."
elif ! names_fnox_file "$GITLEAKS_CONFIG"; then
  flag "$GITLEAKS_CONFIG does not allowlist $FNOX_FILE by path — every commit"
  say "  will fail the secret scanner. See the fnox skill, condition 1."
fi

# --- Condition 2: no allowlist entry covers a decryption identity ----------
if [ -f "$GITLEAKS_CONFIG" ] &&
  grep -Eq 'age\\?\.txt|AGE-SECRET-KEY|\\?\.fnox/|key_file' "$GITLEAKS_CONFIG"; then
  flag "$GITLEAKS_CONFIG appears to allowlist a decryption identity."
  say "  The allowlist covers $FNOX_FILE and nothing else. A hit on an age"
  say "  identity is always real. See the fnox skill, condition 2."
fi

if [ -f "$GITIGNORE" ] && ! grep -q 'age\.txt' "$GITIGNORE"; then
  flag "$GITIGNORE does not ignore age.txt — the decryption identity must be"
  say "  fully gitignored. See the fnox skill, condition 2."
fi

# --- Condition 4: the committed file is excluded from mining ---------------
# The seeded *secret* / *credentials* denylist does not match fnox.toml.
if [ -f "$MEMPALACE_CONFIG" ] && ! names_fnox_file "$MEMPALACE_CONFIG"; then
  flag "$MEMPALACE_CONFIG does not exclude $FNOX_FILE from mining. The seeded"
  say "  *secret* / *credentials* patterns do not match it. Add it to"
  say "  exclude_patterns. See the fnox skill, condition 4."
fi

if [ "$fail" -ne 0 ]; then
  say ""
  say "fnox-ciphertext-guard: refusing the commit."
  exit 1
fi

exit 0
