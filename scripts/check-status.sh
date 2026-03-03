#!/bin/bash
# check-status.sh — Check anchoring status for all origins in CSV
# Usage: ./scripts/check-status.sh /pad/naar/anchored-results.csv

set -euo pipefail

CSV="${1:?Usage: ./scripts/check-status.sh /path/to/anchored-results.csv}"
[ -f "$CSV" ] || { echo "✗ File not found: $CSV"; exit 1; }

PENDING=0
ANCHORED=0
ERRORS=0
TOTAL=0

echo "→ Checking status for all origins in: $CSV"
echo ""

# Skip header line
tail -n +2 "$CSV" | while IFS=',' read -r FILENAME HASH ORIGIN_ID CAPTURED STATUS; do
  [ "$ORIGIN_ID" = "DUPLICATE" ] && continue
  [ -z "$ORIGIN_ID" ] && continue
  TOTAL=$((TOTAL + 1))

  RESPONSE=$(curl -s "https://core.umarise.com/v1-core-resolve?origin_id=$ORIGIN_ID" 2>/dev/null)
  PROOF_STATUS=$(echo "$RESPONSE" | grep -o '"proof_status":"[^"]*"' | cut -d'"' -f4)
  BLOCK=$(echo "$RESPONSE" | grep -o '"bitcoin_block_height":[0-9]*' | cut -d':' -f2)

  if [ "$PROOF_STATUS" = "anchored" ]; then
    echo "  ✓ $FILENAME → anchored (block $BLOCK)"
  elif [ "$PROOF_STATUS" = "pending" ]; then
    echo "  ⏳ $FILENAME → pending"
  else
    echo "  ✗ $FILENAME → $PROOF_STATUS"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Done. Check complete."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
