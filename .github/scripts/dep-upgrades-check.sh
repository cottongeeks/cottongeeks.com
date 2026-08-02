#!/usr/bin/env bash
# Check for and apply npm dependency upgrades in one npm project.
#
# Usage: dep-upgrades-check.sh <project-dir> <report-file>
#
# On success:
#   - If upgrades were applied: writes a human-readable report to <report-file>
#   - If no upgrades were available: leaves <report-file> empty

set -euo pipefail

PROJECT_DIR="$1"
REPORT_FILE="$2"

# Start with an empty report so callers can detect "no updates" by file size.
: > "$REPORT_FILE"

cd "$PROJECT_DIR"

# Flags shared by every ncu invocation, so the report matches what gets applied.
#   --peer: skip upgrades that would violate an installed package's peer range
#           (e.g. typescript 7 while @typescript-eslint v8 pins <6.1.0). Without
#           it ncu bumps each package in isolation and writes a package.json that
#           npm install then rejects with ERESOLVE, losing the whole upgrade PR.
NCU_ARGS=(--peer)

# Capture a readable before → after summary for the eventual PR body.
REPORT=$(npx npm-check-updates "${NCU_ARGS[@]}" 2>/dev/null || true)

# Use jsonUpgraded to reliably detect whether anything can be updated.
UPGRADES=$(npx npm-check-updates "${NCU_ARGS[@]}" --jsonUpgraded 2>/dev/null || echo '{}')
if [ "$UPGRADES" = '{}' ] || [ -z "$UPGRADES" ]; then
  echo "No dependency updates available for $PROJECT_DIR."
  exit 0
fi

# Apply package.json updates and refresh the lockfile.
npx npm-check-updates "${NCU_ARGS[@]}" -u
npm install

# Persist the readable report for the PR body.
printf '%s\n' "$REPORT" > "$REPORT_FILE"
