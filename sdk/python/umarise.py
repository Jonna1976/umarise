"""
Umarise Core SDK - Python

Single-file SDK for Umarise Core v1 API.
Zero external dependencies. Uses urllib from the standard library.

Usage:
    from umarise import UmariseCore, hash_buffer

    core = UmariseCore()
    result = core.verify("sha256:abc123...")

    core = UmariseCore(api_key="um_...")
    origin = core.attest("sha256:abc123...")

Requirements: Python 3.8+
Version: 1.0.0
License: Unlicense
"""

from __future__ import annotations

import hashlib
import json
import urllib.request
import urllib.error
import urllib.parse
from dataclasses import dataclass
from typing import Optional


# --- Types ---

@dataclass
class OriginRecord:
    origin_id: str
    hash: str
    hash_algo: str
    captured_at: str
    proof_status: Optional[str] = None
    proof_url: Optional[str] = None


@dataclass
class VerifyResult:
    origin_id: str
    hash: str
    hash_algo: str
    captured_at: str
    proof_status: str
    proof_url: str


@dataclass
class ProofResult:
    origin_id: str
    status: str  # 'pending' | 'anchored' | 'not_found'
    proof: Optional[bytes] = None
    bitcoin_block_height: Optional[int] = None
    anchored_at: Optional[str] = None


@dataclass
class HealthResult:
    status: str
    version: str


class UmariseCoreError(Exception):
    """Error returned by the Umarise Core API."""

    def __init__(self, code: str, message: str, status_code: int, retry_after_seconds: Optional[int] = None):
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.retry_after_seconds = retry_after_seconds


# --- SDK ---

class UmariseCore:
    """Client for the Umarise Core v1 API."""

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://core.umarise.com", timeout: int = 30):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def health(self) -> HealthResult:
        """Check API health."""
        data = self._request("GET", "/v1-core-health")
        return HealthResult(status=data["status"], version=data["version"])

    def resolve(self, *, origin_id: Optional[str] = None, hash: Optional[str] = None) -> Optional[OriginRecord]:
        """Resolve an origin by ID or hash."""
        if origin_id:
            query = f"origin_id={urllib.parse.quote(origin_id)}"
        elif hash:
            query = f"hash={urllib.parse.quote(_normalize_hash(hash))}"
        else:
            raise ValueError("Either origin_id or hash must be provided")
        try:
            data = self._request("GET", f"/v1-core-resolve?{query}")
            return _parse_origin(data)
        except UmariseCoreError as e:
            if e.status_code == 404:
                return None
            raise

    def verify(self, hash: str) -> Optional[VerifyResult]:
        """Verify a hash against the registry. No API key needed."""
        try:
            data = self._request("POST", "/v1-core-verify", {"hash": _normalize_hash(hash)})
            return VerifyResult(
                origin_id=data["origin_id"],
                hash=data["hash"],
                hash_algo=data["hash_algo"],
                captured_at=data["captured_at"],
                proof_status=data.get("proof_status", "pending"),
                proof_url=data.get("proof_url", ""),
            )
        except UmariseCoreError as e:
            if e.status_code == 404:
                return None
            raise

    def proof(self, origin_id: str) -> ProofResult:
        """Download the OpenTimestamps proof for an origin. No API key needed."""
        url = f"{self.base_url}/v1-core-proof?origin_id={urllib.parse.quote(origin_id)}"
        req = urllib.request.Request(url, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                proof_bytes = resp.read()
                block_height = resp.headers.get("x-bitcoin-block-height")
                anchored_at = resp.headers.get("x-anchored-at")
                return ProofResult(
                    origin_id=origin_id,
                    status="anchored",
                    proof=proof_bytes,
                    bitcoin_block_height=int(block_height) if block_height else None,
                    anchored_at=anchored_at,
                )
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return ProofResult(origin_id=origin_id, status="not_found")
            if e.code == 202:
                return ProofResult(origin_id=origin_id, status="pending")
            self._handle_http_error(e)
        return ProofResult(origin_id=origin_id, status="not_found")

    def attest(self, hash: str) -> OriginRecord:
        """Create an origin attestation. Requires a Partner API key."""
        if not self.api_key:
            raise UmariseCoreError("UNAUTHORIZED", "API key required for attest(). Pass api_key to UmariseCore().", 401)
        data = self._request("POST", "/v1-core-origins", {"hash": _normalize_hash(hash)}, authenticated=True)
        return _parse_origin(data)

    def _request(self, method, path, body=None, authenticated=False):
        url = f"{self.base_url}{path}"
        headers = {"Content-Type": "application/json"}
        if authenticated and self.api_key:
            headers["X-API-Key"] = self.api_key
        data = json.dumps(body).encode() if body else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            self._handle_http_error(e)
        except urllib.error.URLError as e:
            if "timed out" in str(e.reason):
                raise UmariseCoreError("TIMEOUT", f"Request timed out after {self.timeout}s", 0)
            raise

    def _handle_http_error(self, e):
        try:
            error_body = json.loads(e.read().decode())
            err = error_body.get("error", {})
        except (json.JSONDecodeError, UnicodeDecodeError):
            err = {}
        raise UmariseCoreError(
            code=err.get("code", "UNKNOWN_ERROR"),
            message=err.get("message", f"HTTP {e.code}"),
            status_code=e.code,
            retry_after_seconds=err.get("retry_after_seconds"),
        )


# --- Utility ---

def _normalize_hash(hash_str: str) -> str:
    trimmed = hash_str.strip().lower()
    if trimmed.startswith("sha256:"):
        return trimmed
    if len(trimmed) == 64 and all(c in "0123456789abcdef" for c in trimmed):
        return f"sha256:{trimmed}"
    return trimmed

def _parse_origin(data: dict) -> OriginRecord:
    return OriginRecord(
        origin_id=data["origin_id"],
        hash=data["hash"],
        hash_algo=data["hash_algo"],
        captured_at=data["captured_at"],
        proof_status=data.get("proof_status"),
        proof_url=data.get("proof_url"),
    )

def hash_buffer(data: bytes) -> str:
    """Hash bytes using SHA-256. Returns 'sha256:<hex>' format."""
    digest = hashlib.sha256(data).hexdigest()
    return f"sha256:{digest}"
