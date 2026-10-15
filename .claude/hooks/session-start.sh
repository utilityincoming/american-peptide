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

# `npm install` (not `ci`) so the post-hook container cache is reused on resume
# and a warm node_modules short-circuits quickly.
npm install --no-audit --no-fund
