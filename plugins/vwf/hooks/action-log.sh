#!/bin/sh
# The action-log hook of /vwf:execute — PreToolUse, PostToolUse, SubagentStart,
# SubagentStop and SessionEnd.
#
# It fires on every tool call of every session, so it must cost almost nothing
# when no run is logging: it exits at once unless some session holds a marker
# under <root>/active/, which skills/execute/scripts/log.mjs writes at a run's
# start and removes at its end. Only then does node start, and action-log.mjs
# decides whether this session is the one logging.
#
# Contract:
#   stdin  — the hook payload, passed to action-log.mjs untouched
#   stdout — nothing, ever: this hook never gives a verdict
#   exit   — 0, ever: a logging fault never blocks a tool call
#
# POSIX sh: this runs on macOS's /bin/sh.

root=${VWF_LOG_ROOT:-$HOME/Library/Caches/vwf}
set -- "$root"/active/*
[ -e "$1" ] || exit 0

node "$(dirname "$0")/action-log.mjs" >/dev/null 2>&1
exit 0
