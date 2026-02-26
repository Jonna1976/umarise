# verify-anchoring.org

**Independent Origin Verification Infrastructure**

This is a standalone, zero-dependency verification tool for origin proof archives. It verifies the cryptographic integrity of anchored origins without connecting to any external platform.

## What it does

1. Opens an origin ZIP archive in your browser
2. Extracts `certificate.json` and the original artifact
3. Recomputes the SHA-256 hash from the artifact bytes using the Web Crypto API
4. Compares the computed hash against the certificate
5. Validates the OpenTimestamps (.ots) proof header
6. Provides the .ots file for independent Bitcoin verification

**Your file never leaves your browser.** All computation is performed client-side.

## Why it exists

The origin registry ([Umarise Core](https://umarise.com)) creates cryptographic proofs of existence anchored in the Bitcoin blockchain. But trust requires that verification is **independent** of the entity that created the proof.

This verifier:
- Makes **zero API calls** to any Umarise, anchoring.app, or itexisted.app server
- Depends on **no backend infrastructure**
- Can be **forked and self-hosted** by anyone
- Will continue to work **even if Umarise ceases to exist**

## How to host

### Option 1: GitHub Pages (recommended)
1. Fork this repository
2. Go to Settings → Pages → Source: main branch, root folder
3. Your verifier is live at `https://your-org.github.io/verify-anchoring`

### Option 2: Any static hosting
Copy `index.html` to any web server, CDN, or static hosting provider:
- Netlify (drag & drop)
- Cloudflare Pages
- Vercel
- Any nginx/Apache server
- Even `file:///` on your local machine (except .ots download)

### Option 3: Local
```bash
# Just open the file
open index.html

# Or serve it
python3 -m http.server 8080
# → http://localhost:8080
```

## DNS Configuration

**verify-anchoring.org** (primary):
- If using GitHub Pages: CNAME → `your-org.github.io`
- If using a static IP host: A record → your server IP

**verify-anchoring.com** (redirect):
- GoDaddy Forwarding → `https://verify-anchoring.org` (301 Permanent)

## Dependencies

- **JSZip 3.10.1** — loaded from cdnjs with [SRI integrity hash](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) for supply-chain security
- **Web Crypto API** — built into all modern browsers, no library needed

No npm, no build step, no framework.

## Origin ZIP format

The verifier expects ZIPs with this structure:

```
origin-proof.zip
├── artifact.jpg          # Original file (any extension)
├── certificate.json      # Hash, origin_id, captured_at
├── attestation.json      # (optional) Third-party attestation
├── VERIFY.txt            # Human-readable instructions
└── proof.ots             # (optional) OpenTimestamps binary proof
```

### certificate.json fields
```json
{
  "origin_id": "uuid",
  "hash": "sha256:abc123...",
  "captured_at": "2025-01-15T10:30:00Z",
  "proof_status": "anchored"
}
```

## Full Bitcoin verification

This tool validates the hash match and .ots header. For complete Bitcoin-level timestamp verification:

1. Extract the `.ots` file from the ZIP (the tool offers a download button)
2. Go to [opentimestamps.org](https://opentimestamps.org) and upload both the artifact and the .ots file
3. Or use the command-line tool:
   ```bash
   pip install opentimestamps-client
   ots verify proof.ots
   ```

## License

Public domain. No restrictions. Fork it, host it, modify it.
