#!/bin/bash
# verify-anchor.sh — Independent Anchor ZIP verification
# Usage: ./verify-anchor.sh <anchor.zip>
#
# Zero-dependency script. Requires only: sha256sum, unzip, jq
# No Umarise infrastructure needed.
#
# Part of the Umarise External Review Program
# https://umarise.com/reviewer

set -euo pipefail

ZIP="${1:?Usage: ./verify-anchor.sh <anchor.zip>}"
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "→ Extracting ZIP..."
unzip -q "$ZIP" -d "$TMPDIR"

# Find artifact
ARTIFACT=$(find "$TMPDIR" -name 'artifact.*' | head -1)
[ -z "$ARTIFACT" ] && { echo "✗ No artifact found"; exit 1; }

# Read expected hash from certificate.json
CERT="$TMPDIR/certificate.json"
[ -f "$CERT" ] || { echo "✗ No certificate.json"; exit 1; }

EXPECTED=$(jq -r '.hash' "$CERT" | sed 's/^sha256://')
ORIGIN_ID=$(jq -r '.origin_id' "$CERT")
CAPTURED=$(jq -r '.captured_at' "$CERT")

# Compute actual hash
ACTUAL=$(sha256sum "$ARTIFACT" | cut -d' ' -f1)

echo ""
echo "  Origin ID:   $ORIGIN_ID"
echo "  Captured at: $CAPTURED"
echo "  Expected:    $EXPECTED"
echo "  Computed:    $ACTUAL"
echo ""

if [ "$EXPECTED" = "$ACTUAL" ]; then
  echo "✓ Hash matches — artifact is intact"
else
  echo "✗ HASH MISMATCH — artifact has been modified"
  exit 1
fi

# Check for .ots proof
OTS=$(find "$TMPDIR" -name '*.ots' | head -1)
if [ -n "$OTS" ]; then
  echo "✓ OTS proof found: $(basename "$OTS")"
  echo "  Verify against Bitcoin: ots verify $(basename "$OTS")"
else
  echo "⚠ No .ots proof included (anchoring may be pending)"
  echo "  Retrieve later: curl https://core.umarise.com/v1-core-proof?origin_id=$ORIGIN_ID -o proof.ots"
fi
