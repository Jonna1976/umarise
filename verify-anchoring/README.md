# verify-anchoring.org

**Independent Origin Verification Infrastructure**

A standalone, zero-backend verification tool for origin proof archives.
It verifies the cryptographic integrity of anchored origins without contacting the issuing platform.

---

## What it does

- Opens an origin ZIP archive locally in your browser
- Extracts `certificate.json` and the original artifact
- Recomputes the SHA-256 hash from the artifact bytes using the Web Crypto API
- Compares the computed hash against the certificate value
- Checks that an included `.ots` file is a valid OpenTimestamps container
- Provides the `.ots` file for independent Bitcoin verification

**No file is uploaded. All computation is performed client-side.**

## What it does NOT do

- It does not contact Umarise, anchoring.app, or itexisted.app
- It does not verify Bitcoin inclusion directly
- It does not verify authorship, ownership, or legal status
- It does not make normative claims

It verifies only **byte-level integrity** against the included certificate.

---

## Why it exists

Umarise Core creates cryptographic commitments of file hashes that are anchored into the Bitcoin blockchain.

**Verification must be independent of the entity that created the proof.**

This verifier:

- Makes zero API calls to any Umarise-controlled infrastructure
- Has no backend or database dependency
- Can be forked and self-hosted by anyone
- Remains functional without access to the issuing service

Verification depends only on:

- The ZIP file
- The Web Crypto API
- The OpenTimestamps ecosystem (for full ledger verification)

---

## Hosting

### GitHub Pages (recommended)

1. Fork the repository
2. Enable Pages on the `main` branch
3. Your verifier runs independently

### Any static host

This is a single static HTML file. It can be hosted on:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel
- Any nginx or Apache server
- Local file system

No build step. No framework. No backend.

---

## Dependencies

- **JSZip 3.10.1** (loaded with Subresource Integrity protection)
- **Web Crypto API** (native browser implementation)

No server runtime. No API keys. No account system.

---

## Origin ZIP structure

```
origin-proof.zip
├── artifact.ext
├── certificate.json
├── attestation.json      (optional)
├── VERIFY.txt
└── proof.ots             (optional)
```

### certificate.json

```json
{
  "origin_id": "uuid",
  "hash": "sha256:abc123...",
  "captured_at": "2025-01-15T10:30:00Z",
  "proof_status": "anchored"
}
```

---

## Bitcoin verification

This tool verifies:

- **Artifact → hash match**
- **Certificate → integrity**
- **.ots file → valid OpenTimestamps container**

For full Bitcoin-level timestamp verification:

1. Extract the `.ots` file
2. Verify at [https://opentimestamps.org](https://opentimestamps.org)
3. Or run:

```bash
pip install opentimestamps-client
ots verify proof.ots
```

Bitcoin verification occurs independently of this site.

---

## Design Principle

> Verification must survive the issuer.

This tool implements that principle.

---

## License

Public domain.
Fork, modify, mirror, redistribute.
