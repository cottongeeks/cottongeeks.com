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

# Capture a readable before → after summary for the eventual PR body.
REPORT=$(npx npm-check-updates 2>/dev/null || true)

# Use jsonUpgraded to reliably detect whether anything can be updated.
UPGRADES=$(npx npm-check-updates --jsonUpgraded 2>/dev/null || echo '{}')
if [ "$UPGRADES" = '{}' ] || [ -z "$UPGRADES" ]; then
  echo "No dependency updates available for $PROJECT_DIR."
  exit 0
fi

# Apply package.json updates and refresh the lockfile.
npx npm-check-updates -u
npm install

# Persist the readable report for the PR body.
printf '%s\n' "$REPORT" > "$REPORT_FILE"
