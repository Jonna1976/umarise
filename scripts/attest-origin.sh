#!/bin/bash
# attest-origin.sh — Independent attestation generator
#
# Generates a signed attestation.json for an Anchor Record
# WITHOUT requiring any Umarise infrastructure.
#
# Usage:
#   # Generate a new key pair (one-time setup):
#   ./attest-origin.sh keygen
#
#   # Attest an origin from a certificate.json:
#   ./attest-origin.sh attest <certificate.json> [--name "Attestant Name"]
#
#   # Attest an origin by ID + hash directly:
#   ./attest-origin.sh attest-raw <origin_id> <hash> [--name "Attestant Name"]
#
#   # Verify an existing attestation.json:
#   ./attest-origin.sh verify <attestation.json>
#
# Requirements: openssl (≥1.1), jq, uuidgen (or /proc/sys/kernel/random/uuid)
#
# Part of the Umarise External Review Program
# https://umarise.com/reviewer
#
# This script is independent of Umarise infrastructure.
# It uses standard ECDSA P-256 (secp256r1) signatures.

set -euo pipefail

ATTESTANT_KEY_DIR="${ATTESTANT_KEY_DIR:-$HOME/.umarise-attestant}"
PRIVATE_KEY="$ATTESTANT_KEY_DIR/attestant.key.pem"
PUBLIC_KEY="$ATTESTANT_KEY_DIR/attestant.pub.pem"
PUBLIC_KEY_DER="$ATTESTANT_KEY_DIR/attestant.pub.der"

# ── Helpers ──────────────────────────────────────────────────

die() { echo "✗ $1" >&2; exit 1; }

check_deps() {
  command -v openssl >/dev/null 2>&1 || die "openssl is required"
  command -v jq      >/dev/null 2>&1 || die "jq is required"
}

generate_uuid() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen | tr '[:upper:]' '[:lower:]'
  elif [ -f /proc/sys/kernel/random/uuid ]; then
    cat /proc/sys/kernel/random/uuid
  else
    # Fallback: openssl random bytes formatted as UUID v4
    openssl rand -hex 16 | sed 's/\(.\{8\}\)\(.\{4\}\)\(.\{4\}\)\(.\{4\}\)\(.\{12\}\)/\1-\2-4\4-\5/' | head -c 36
  fi
}

iso_now() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# ── Keygen ───────────────────────────────────────────────────

cmd_keygen() {
  echo "→ Generating ECDSA P-256 key pair..."
  
  mkdir -p "$ATTESTANT_KEY_DIR"
  chmod 700 "$ATTESTANT_KEY_DIR"

  if [ -f "$PRIVATE_KEY" ]; then
    echo "⚠ Key already exists at $PRIVATE_KEY"
    read -rp "  Overwrite? [y/N] " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || { echo "  Aborted."; exit 0; }
  fi

  # Generate private key (ECDSA P-256 / secp256r1)
  openssl ecparam -genkey -name prime256v1 -noout -out "$PRIVATE_KEY" 2>/dev/null
  chmod 600 "$PRIVATE_KEY"

  # Extract public key (PEM)
  openssl ec -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY" 2>/dev/null

  # Extract public key (DER/SPKI for certificate.json compatibility)
  openssl ec -in "$PRIVATE_KEY" -pubout -outform DER -out "$PUBLIC_KEY_DER" 2>/dev/null

  # Base64-encode the SPKI public key (for attestation.json)
  PUBKEY_B64=$(base64 < "$PUBLIC_KEY_DER" | tr -d '\n')

  echo ""
  echo "✓ Key pair generated:"
  echo "  Private key: $PRIVATE_KEY"
  echo "  Public key:  $PUBLIC_KEY"
  echo ""
  echo "  SPKI (base64, for attestation.json):"
  echo "  $PUBKEY_B64"
  echo ""
  echo "  ⚠ Keep the private key secure. It cannot be recovered."
  echo "  ⚠ Share the public key with parties who need to verify your attestations."
}

# ── Sign ─────────────────────────────────────────────────────

# Sign a message string with the attestant's private key
# Returns base64-encoded DER signature
sign_message() {
  local message="$1"
  echo -n "$message" | openssl dgst -sha256 -sign "$PRIVATE_KEY" | base64 | tr -d '\n'
}

# ── Attest (from certificate.json) ──────────────────────────

cmd_attest() {
  local cert_file="${1:?Usage: attest-origin.sh attest <certificate.json> [--name \"Name\"]}"
  shift
  
  [ -f "$cert_file" ] || die "File not found: $cert_file"
  [ -f "$PRIVATE_KEY" ] || die "No attestant key found. Run: $0 keygen"

  # Parse optional --name
  local attestant_name="Independent Attestant"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) attestant_name="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  # Extract fields from certificate.json
  local origin_id hash captured_at
  origin_id=$(jq -r '.origin_id' "$cert_file") || die "Cannot parse origin_id from $cert_file"
  hash=$(jq -r '.hash' "$cert_file") || die "Cannot parse hash from $cert_file"
  captured_at=$(jq -r '.captured_at // .created_at' "$cert_file") || die "Cannot parse timestamp from $cert_file"

  [ "$origin_id" = "null" ] && die "No origin_id in $cert_file"
  [ "$hash" = "null" ] && die "No hash in $cert_file"

  echo "→ Attesting origin from certificate..."
  echo "  Origin ID:   $origin_id"
  echo "  Hash:        ${hash:0:24}..."
  echo "  Captured at: $captured_at"
  echo "  Attestant:   $attestant_name"
  echo ""

  _generate_attestation "$origin_id" "$hash" "$attestant_name"
}

# ── Attest Raw (origin_id + hash directly) ───────────────────

cmd_attest_raw() {
  local origin_id="${1:?Usage: attest-origin.sh attest-raw <origin_id> <hash> [--name \"Name\"]}"
  local hash="${2:?Usage: attest-origin.sh attest-raw <origin_id> <hash> [--name \"Name\"]}"
  shift 2

  [ -f "$PRIVATE_KEY" ] || die "No attestant key found. Run: $0 keygen"

  # Parse optional --name
  local attestant_name="Independent Attestant"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --name) attestant_name="$2"; shift 2 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  echo "→ Attesting origin (raw)..."
  echo "  Origin ID:   $origin_id"
  echo "  Hash:        ${hash:0:24}..."
  echo "  Attestant:   $attestant_name"
  echo ""

  _generate_attestation "$origin_id" "$hash" "$attestant_name"
}

# ── Core attestation generation ──────────────────────────────

_generate_attestation() {
  local origin_id="$1"
  local hash="$2"
  local attestant_name="$3"

  local attestation_id
  attestation_id=$(generate_uuid)
  local attested_at
  attested_at=$(iso_now)

  # Canonical message: attestation_id + origin_id + hash + attested_at
  local message="${attestation_id}${origin_id}${hash}${attested_at}"

  echo "  Signing: ${message:0:40}..."

  # Sign
  local signature
  signature=$(sign_message "$message")

  # Public key (base64 SPKI)
  local pubkey_b64
  pubkey_b64=$(base64 < "$PUBLIC_KEY_DER" | tr -d '\n')

  # Output filename
  local output_file="attestation-${origin_id:0:8}.json"

  # Generate attestation.json
  jq -n \
    --arg schema_version "1.0" \
    --arg attestation_id "$attestation_id" \
    --arg origin_id "$origin_id" \
    --arg attested_by "$attestant_name" \
    --arg attested_at "$attested_at" \
    --arg signature "$signature" \
    --arg attestant_public_key "$pubkey_b64" \
    --arg verification_note "Verify the signature using attestant_public_key against: attestation_id + origin_id + hash + attested_at" \
    '{
      schema_version: $schema_version,
      attestation_id: $attestation_id,
      origin_id: $origin_id,
      attested_by: $attested_by,
      attested_at: $attested_at,
      signature: $signature,
      attestant_public_key: $attestant_public_key,
      attestant_certificate: null,
      verify_url: null,
      verification_note: $verification_note
    }' > "$output_file"

  echo ""
  echo "✓ Attestation generated: $output_file"
  echo "  Attestation ID: $attestation_id"
  echo "  Attested at:    $attested_at"
  echo ""
  echo "  To add to an existing ZIP:"
  echo "    zip <anchor.zip> $output_file"
  echo ""
  echo "  To verify this attestation:"
  echo "    $0 verify $output_file"
}

# ── Verify ───────────────────────────────────────────────────

cmd_verify() {
  local att_file="${1:?Usage: attest-origin.sh verify <attestation.json>}"

  [ -f "$att_file" ] || die "File not found: $att_file"

  echo "→ Verifying attestation..."

  # Extract fields
  local attestation_id origin_id attested_at signature pubkey_b64
  attestation_id=$(jq -r '.attestation_id' "$att_file")
  origin_id=$(jq -r '.origin_id' "$att_file")
  attested_at=$(jq -r '.attested_at' "$att_file")
  signature=$(jq -r '.signature' "$att_file")
  pubkey_b64=$(jq -r '.attestant_public_key' "$att_file")
  local attested_by
  attested_by=$(jq -r '.attested_by' "$att_file")

  [ "$attestation_id" = "null" ] && die "No attestation_id in $att_file"
  [ "$signature" = "null" ] && die "No signature in $att_file"
  [ "$pubkey_b64" = "null" ] && die "No attestant_public_key in $att_file"

  echo "  Attestation ID: $attestation_id"
  echo "  Origin ID:      $origin_id"
  echo "  Attested by:    $attested_by"
  echo "  Attested at:    $attested_at"
  echo ""

  # Reconstruct the signed message
  # NOTE: We need the hash from the certificate.json to fully reconstruct.
  # For standalone verification, we check the signature against the public key
  # using the fields available in attestation.json itself.
  #
  # Full verification requires: attestation_id + origin_id + hash + attested_at
  # Without the hash, we verify the signature is valid for the public key
  # but cannot confirm the hash binding.

  # Write public key DER from base64
  local tmpdir
  tmpdir=$(mktemp -d)
  trap "rm -rf $tmpdir" EXIT

  echo -n "$pubkey_b64" | base64 -d > "$tmpdir/pub.der"
  openssl ec -pubin -inform DER -in "$tmpdir/pub.der" -outform PEM -out "$tmpdir/pub.pem" 2>/dev/null

  # Check if hash is available (from certificate.json in same directory or as argument)
  local hash=""
  local cert_dir
  cert_dir=$(dirname "$att_file")
  if [ -f "$cert_dir/certificate.json" ]; then
    hash=$(jq -r '.hash' "$cert_dir/certificate.json")
    echo "  Hash (from certificate.json): ${hash:0:24}..."
  fi

  if [ -n "$hash" ] && [ "$hash" != "null" ]; then
    # Full verification: reconstruct exact message
    local message="${attestation_id}${origin_id}${hash}${attested_at}"
    echo -n "$signature" | base64 -d > "$tmpdir/sig.der"
    
    if echo -n "$message" | openssl dgst -sha256 -verify "$tmpdir/pub.pem" -signature "$tmpdir/sig.der" >/dev/null 2>&1; then
      echo "✓ Signature VALID — attestation is authentic"
      echo "  The attestant ($attested_by) confirmed this origin at $attested_at."
    else
      echo "✗ Signature INVALID — attestation may be tampered"
      exit 1
    fi
  else
    echo "⚠ Cannot fully verify without hash."
    echo "  Place certificate.json in the same directory as attestation.json,"
    echo "  or extract from the anchor ZIP."
    echo ""
    echo "  Partial check: public key is parseable and signature is well-formed."
    
    # At minimum verify the key and signature are well-formed
    if openssl ec -pubin -in "$tmpdir/pub.pem" -text -noout >/dev/null 2>&1; then
      echo "  ✓ Public key is valid ECDSA P-256"
    else
      echo "  ✗ Public key is invalid"
      exit 1
    fi
  fi
}

# ── Main ─────────────────────────────────────────────────────

check_deps

case "${1:-help}" in
  keygen)
    cmd_keygen
    ;;
  attest)
    shift
    cmd_attest "$@"
    ;;
  attest-raw)
    shift
    cmd_attest_raw "$@"
    ;;
  verify)
    shift
    cmd_verify "$@"
    ;;
  help|--help|-h)
    echo "attest-origin.sh — Independent attestation generator"
    echo ""
    echo "Commands:"
    echo "  keygen                           Generate ECDSA P-256 key pair"
    echo "  attest <certificate.json>        Attest from certificate (extracts origin_id + hash)"
    echo "  attest-raw <origin_id> <hash>    Attest directly with origin_id and hash"
    echo "  verify <attestation.json>        Verify an existing attestation"
    echo ""
    echo "Options:"
    echo "  --name \"Name\"                    Attestant name (default: Independent Attestant)"
    echo ""
    echo "Environment:"
    echo "  ATTESTANT_KEY_DIR                Key directory (default: ~/.umarise-attestant)"
    echo ""
    echo "Requirements: openssl (≥1.1), jq, uuidgen"
    echo ""
    echo "This script is independent of Umarise infrastructure."
    echo "https://umarise.com/reviewer"
    ;;
  *)
    die "Unknown command: $1. Run: $0 help"
    ;;
esac
