#!/usr/bin/env bash
# Orchestrate npm dependency upgrades for the repo root and emit workflow outputs.
#
# Expects $GITHUB_OUTPUT to be set by GitHub Actions.
# Runs from anywhere inside the repo checkout.
#
# Outputs written to $GITHUB_OUTPUT:
#   has_updates: "true" if the root project was updated
#   root_updated: "true" if the root project was updated
#   body: multi-line PR body when updates are available

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/dep-upgrades-check.sh"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Store the upgrade report in a temp dir so it is easy to clean up.
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

ROOT_REPORT="$WORK_DIR/root.txt"

# Run the root-project check; it applies updates in place when available.
bash "$CHECK_SCRIPT" "$REPO_DIR" "$ROOT_REPORT"

ROOT_UPDATED=false
[ -s "$ROOT_REPORT" ] && ROOT_UPDATED=true

echo "root_updated=$ROOT_UPDATED" >> "$GITHUB_OUTPUT"

if [ "$ROOT_UPDATED" = "false" ]; then
  echo "has_updates=false" >> "$GITHUB_OUTPUT"
  echo "No dependency updates available in the repo root."
  exit 0
fi

echo "has_updates=true" >> "$GITHUB_OUTPUT"

# Build the PR body from the root upgrade report.
EOF_MARKER=$(dd if=/dev/urandom bs=15 count=1 status=none | base64)
{
  echo "body<<$EOF_MARKER"
  echo "## Dependency Upgrades"
  echo ""
  echo "Weekly npm dependency upgrades for the repo root."
  echo ""
  echo "### /"
  echo ""
  echo "The following packages were upgraded in the repository root:"
  echo ""
  echo '```'
  cat "$ROOT_REPORT"
  echo '```'
  echo ""
  echo "$EOF_MARKER"
} >> "$GITHUB_OUTPUT"
