#!/usr/bin/env bash
# PreToolUse hook: rewrite npm/npx commands to the repo's package manager, pnpm or bun.
# Nearest lockfile first, else pnpm; the walk stops at the repo's .config/vwf.yaml.
# BSD sed compatible: no \s, no \b.

set -euo pipefail

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // ""')

# --- resolve the package manager -------------------------------------------
resolve_pm() {
  local dir="${PWD}"
  while [[ "$dir" != "/" && -n "$dir" ]]; do
    if [[ -f "$dir/bun.lock" || -f "$dir/bun.lockb" ]]; then
      echo bun
      return
    fi
    if [[ -f "$dir/pnpm-lock.yaml" ]]; then
      echo pnpm
      return
    fi
    if [[ -f "$dir/.config/vwf.yaml" ]]; then
      echo pnpm
      return
    fi
    dir="$(dirname "$dir")"
  done
  echo pnpm
}

pm=$(resolve_pm)

if [[ "$pm" == "bun" ]]; then
  dlx="bunx"
else
  dlx="pnpm dlx"
fi

# --- npx → <dlx> ------------------------------------------------------------
rewritten=$(echo "$command" | sed -E \
  "s/(^|[;&|][[:space:]]*|\\\$\\([[:space:]]*)npx[[:space:]]+/\\1${dlx} /g")

# --- npm ci → <pm> install --frozen-lockfile --------------------------------
rewritten=$(echo "$rewritten" | sed -E \
  "s/(^|[;&|][[:space:]]*|\\\$\\([[:space:]]*)npm ci([[:space:]]|$)/\\1${pm} install --frozen-lockfile\\2/g")

# --- npm → <pm> (all remaining npm invocations) -----------------------------
rewritten=$(echo "$rewritten" | sed -E \
  "s/(^|[;&|][[:space:]]*|\\\$\\([[:space:]]*)npm[[:space:]]+/\\1${pm} /g")

if [[ "$rewritten" == "$command" ]]; then
  echo '{}'
  exit 0
fi

jq -n \
  --arg cmd "$rewritten" \
  --arg pm "$pm" \
  '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: ("npm/npx → " + $pm + " (resolved from this directory)"),
      updatedInput: { command: $cmd }
    }
  }'
