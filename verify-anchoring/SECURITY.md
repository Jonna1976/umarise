# Security Policy

## Architecture

verify-anchoring.org is a static, single-page HTML file with no backend, no database, no user accounts, and no server-side processing.

All verification is performed client-side using the Web Crypto API. Files uploaded for verification never leave the browser.

## Dependencies

| Dependency | Source | Protection |
|-----------|--------|-----------|
| JSZip 3.10.1 | CDN (cdnjs) | Subresource Integrity (SRI) hash |
| OpenTimestamps | CDN | SRI hash |

## Threat surface

- **Minimal**: No user input is stored, transmitted, or logged
- **No backend**: No server to compromise
- **No authentication**: No credentials to steal
- **Client-side only**: All cryptographic operations use native Web Crypto API

## Reporting vulnerabilities

If you discover a security issue, please report it via:

- **GitHub Issues**: [github.com/AnchoringTrust/verify-anchoring/issues](https://github.com/AnchoringTrust/verify-anchoring/issues)
- **Email**: security@umarise.com

We aim to acknowledge reports within 48 hours.

## Scope

This security policy covers the verify-anchoring.org website only. For the Anchoring Specification itself, see [anchoring-spec.org](https://anchoring-spec.org).
