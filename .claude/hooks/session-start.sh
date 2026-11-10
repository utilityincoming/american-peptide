#!/bin/bash
# SessionStart hook: install JS dependencies so lint, typecheck, tests, and the
# dev/prod build work inside Claude Code cloud sessions. Runs synchronously so
# deps are ready before the agent starts (no race). Idempotent.
set -euo pipefail

# Only needed in the ephemeral cloud container; a local checkout manages its own.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# `npm ci` (not `install`): it installs exactly what package-lock.json says and
# never rewrites it. `npm install` re-serializes the lockfile with whatever npm
# the container ships, which left every session with a spurious uncommitted
# package-lock.json diff (an older npm dropping the "libc" fields).
#
# `npm ci` always reinstalls from scratch, so skip it when node_modules was
# already installed from this exact lockfile — that keeps a resumed session,
# where the container cache still holds node_modules, fast.
stamp="node_modules/.package-lock.sha256"
lock_hash="$(sha256sum package-lock.json | cut -d' ' -f1)"

if [ -f "$stamp" ] && [ "$(cat "$stamp")" = "$lock_hash" ]; then
  echo "dependencies up to date (package-lock.json unchanged)"
  exit 0
fi

npm ci --no-audit --no-fund
echo "$lock_hash" > "$stamp"
