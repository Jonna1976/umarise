#!/bin/bash
# download-proofs.sh — Download all .ots proofs for anchored origins
# Usage: ./scripts/download-proofs.sh /path/to/anchored-results.csv

set -euo pipefail

CSV="${1:?Usage: ./scripts/download-proofs.sh /path/to/anchored-results.csv}"
API_KEY="${CORE_API_KEY:?Set CORE_API_KEY first: export CORE_API_KEY=um_your_key}"

[ -f "$CSV" ] || { echo "✗ File not found: $CSV"; exit 1; }

# Create proofs directory next to CSV
PROOF_DIR="$(dirname "$CSV")/proofs"
mkdir -p "$PROOF_DIR"

DOWNLOADED=0
PENDING=0
ERRORS=0

echo "→ Downloading proofs from: $CSV"
echo "→ Saving to: $PROOF_DIR"
echo ""

tail -n +2 "$CSV" | while IFS=',' read -r FILENAME HASH ORIGIN_ID CAPTURED STATUS; do
  [ "$ORIGIN_ID" = "DUPLICATE" ] && continue
  [ -z "${ORIGIN_ID:-}" ] && continue

  # Check status first
  RESPONSE=$(curl -s "https://core.umarise.com/v1-core-resolve?origin_id=$ORIGIN_ID")
  PROOF_STATUS=$(echo "$RESPONSE" | grep -o '"proof_status":"[^"]*"' | cut -d'"' -f4)

  if [ "$PROOF_STATUS" = "anchored" ]; then
    OTS_FILE="$PROOF_DIR/${FILENAME}.ots"
    HTTP_CODE=$(curl -s -w "%{http_code}" \
      "https://core.umarise.com/v1-core-proof?origin_id=$ORIGIN_ID" \
      -H "X-API-Key: $API_KEY" \
      --output "$OTS_FILE" 2>/dev/null)

    if [ "$HTTP_CODE" = "200" ]; then
      echo "  ✓ $FILENAME → downloaded"
      DOWNLOADED=$((DOWNLOADED + 1))
    else
      echo "  ✗ $FILENAME → HTTP $HTTP_CODE"
      rm -f "$OTS_FILE"
      ERRORS=$((ERRORS + 1))
    fi
  elif [ "$PROOF_STATUS" = "pending" ]; then
    echo "  ⏳ $FILENAME → still pending"
    PENDING=$((PENDING + 1))
  else
    echo "  ✗ $FILENAME → $PROOF_STATUS"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Proofs saved to: $PROOF_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
