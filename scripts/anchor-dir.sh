#!/bin/bash
# anchor-dir.sh — Anchor all files in a directory to Umarise Core API
# Usage: ./anchor-dir.sh /pad/naar/map
#
# Output: creates anchored-results.csv in the target directory
# Requirements: curl, shasum (standard on macOS)
#
# Rate limit: 100/min (standard tier). 10.000 files ≈ 100 min.

set -euo pipefail

DIR="${1:?Usage: ./anchor-dir.sh /path/to/directory}"
API_KEY="${CORE_API_KEY:?Set CORE_API_KEY first: export CORE_API_KEY=um_your_key}"

# Validate directory
[ -d "$DIR" ] || { echo "✗ Directory not found: $DIR"; exit 1; }

# Count files
TOTAL=$(find "$DIR" -maxdepth 1 -type f | wc -l | tr -d ' ')
[ "$TOTAL" -gt 0 ] || { echo "✗ No files found in $DIR"; exit 1; }

# Output CSV
CSV="$DIR/anchored-results.csv"
echo "filename,sha256,origin_id,captured_at,proof_status" > "$CSV"

echo "→ Anchoring $TOTAL files from: $DIR"
echo "→ Results will be saved to: $CSV"
echo ""

COUNT=0
ERRORS=0

for file in "$DIR"/*; do
  [ -f "$file" ] || continue
  FILENAME=$(basename "$file")

  # Skip our own output file
  [ "$FILENAME" = "anchored-results.csv" ] && continue

  # Hash locally
  HASH=$(shasum -a 256 "$file" | cut -d' ' -f1)

  # POST to Core API
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://core.umarise.com/v1-core-origins \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d "{\"hash\":\"sha256:$HASH\"}" 2>/dev/null)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "201" ]; then
    ORIGIN_ID=$(echo "$BODY" | grep -o '"origin_id":"[^"]*"' | cut -d'"' -f4)
    CAPTURED=$(echo "$BODY" | grep -o '"captured_at":"[^"]*"' | cut -d'"' -f4)
    STATUS=$(echo "$BODY" | grep -o '"proof_status":"[^"]*"' | cut -d'"' -f4)
    echo "$FILENAME,$HASH,$ORIGIN_ID,$CAPTURED,$STATUS" >> "$CSV"
    COUNT=$((COUNT + 1))
    echo "  ✓ [$COUNT/$TOTAL] $FILENAME → $ORIGIN_ID"
  elif [ "$HTTP_CODE" = "409" ]; then
    echo "  ⚠ [$COUNT/$TOTAL] $FILENAME → already anchored (duplicate hash)"
    echo "$FILENAME,$HASH,DUPLICATE,,duplicate" >> "$CSV"
    COUNT=$((COUNT + 1))
  elif [ "$HTTP_CODE" = "429" ]; then
    echo "  ⏳ Rate limit hit. Waiting 60 seconds..."
    sleep 60
    # Retry
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://core.umarise.com/v1-core-origins \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "{\"hash\":\"sha256:$HASH\"}" 2>/dev/null)
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    if [ "$HTTP_CODE" = "201" ]; then
      ORIGIN_ID=$(echo "$BODY" | grep -o '"origin_id":"[^"]*"' | cut -d'"' -f4)
      CAPTURED=$(echo "$BODY" | grep -o '"captured_at":"[^"]*"' | cut -d'"' -f4)
      STATUS=$(echo "$BODY" | grep -o '"proof_status":"[^"]*"' | cut -d'"' -f4)
      echo "$FILENAME,$HASH,$ORIGIN_ID,$CAPTURED,$STATUS" >> "$CSV"
      COUNT=$((COUNT + 1))
      echo "  ✓ [$COUNT/$TOTAL] $FILENAME → $ORIGIN_ID (after retry)"
    else
      ERRORS=$((ERRORS + 1))
      echo "  ✗ [$COUNT/$TOTAL] $FILENAME → HTTP $HTTP_CODE (retry failed)"
    fi
  else
    ERRORS=$((ERRORS + 1))
    echo "  ✗ $FILENAME → HTTP $HTTP_CODE"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Done: $COUNT anchored, $ERRORS errors"
echo "  CSV:  $CSV"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
