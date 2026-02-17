"""
Umarise Integration Template — Python

WHAT THIS FILE DOES:
Complete integration from file upload to verified proof.
Copy this file. Change the 3 config values. Done.

WHAT YOU CHANGE:
1. API_KEY — your Umarise API key
2. save_origin_id() — how you store the origin_id in YOUR database
3. on_anchor_complete() — what happens when proof is anchored (optional)

WHAT YOU DON'T CHANGE:
Everything else. Hash calculation, API calls, error handling,
retry logic, polling — it's all handled.

NO DEPENDENCIES. Uses only Python built-ins (hashlib, urllib, json).
Works with Python 3.8+.
"""

import hashlib
import json
import time
import threading
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from typing import Optional, Dict, Any

# ═══════════════════════════════════════════════════════════════
# CONFIG — Change these three things, nothing else
# ═══════════════════════════════════════════════════════════════

API_KEY = "um_your_api_key_here"


def save_origin_id(record_id: str, origin_id: str) -> None:
    """
    Store the origin_id in YOUR system.
    This links your record to the independent proof.

    Replace this with your actual database call, e.g.:
        db.submissions.update(record_id, {"origin_id": origin_id})
        Submission.objects.filter(id=record_id).update(origin_id=origin_id)
        cursor.execute("UPDATE submissions SET origin_id=? WHERE id=?", (origin_id, record_id))
    """
    # TODO: Replace with your database call
    print(f"Store origin_id {origin_id} for record {record_id}")


def on_anchor_complete(record_id: str, origin_id: str) -> None:
    """
    Called when proof is fully anchored to Bitcoin (10-20 min after attestation).
    Optional. Use this if you want to notify users or update status.

    If you don't need this, leave it empty.
    """
    # TODO: Optional — notify user, update status, download .ots proof
    print(f"Proof anchored for record {record_id} (origin: {origin_id})")


# ═══════════════════════════════════════════════════════════════
# BELOW THIS LINE: DON'T CHANGE ANYTHING
# ═══════════════════════════════════════════════════════════════

BASE = "https://core.umarise.com"
MAX_RETRIES = 3
RETRY_DELAY = 60  # seconds
POLL_INTERVAL = 60  # seconds
POLL_TIMEOUT = 30 * 60  # 30 minutes max


class UmariseError(Exception):
    """Raised when the Umarise API returns an error."""
    def __init__(self, code: str, message: str):
        self.code = code
        super().__init__(f"{code}: {message}")


# --- HTTP helper (zero dependencies) ---

def _request(method: str, path: str, body: dict = None, api_key: str = None) -> dict:
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if api_key:
        req.add_header("X-API-Key", api_key)

    try:
        with urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            if "error" in result:
                raise UmariseError(result["error"]["code"], result["error"]["message"])
            return result
    except HTTPError as e:
        try:
            err = json.loads(e.read())
            if "error" in err:
                raise UmariseError(err["error"]["code"], err["error"]["message"])
        except (json.JSONDecodeError, KeyError):
            pass
        raise


# --- Core functions ---

def hash_file(file_path: str) -> str:
    """Hash a file. Returns sha256:... string ready for the API."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return f"sha256:{h.hexdigest()}"


def hash_bytes(data: bytes) -> str:
    """Hash raw bytes. Returns sha256:... string ready for the API."""
    return f"sha256:{hashlib.sha256(data).hexdigest()}"


def attest(hash_str: str) -> dict:
    """
    Submit a hash to Umarise. Returns the attestation record.
    Retries automatically on timeout or server error (max 3 attempts).
    """
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return _request("POST", "/v1-core-origins", {"hash": hash_str}, API_KEY)
        except UmariseError as e:
            last_error = e
            # Don't retry client errors
            if e.code in ("UNAUTHORIZED", "API_KEY_REVOKED", "INVALID_HASH_FORMAT"):
                raise
            # Rate limited: wait the specified time
            if e.code == "RATE_LIMIT_EXCEEDED":
                print(f"Rate limited. Waiting before retry...")
                time.sleep(RETRY_DELAY)
                continue
            # Server error: retry after delay
            if attempt < MAX_RETRIES:
                print(f"Attempt {attempt} failed. Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)
        except (URLError, TimeoutError, OSError) as e:
            last_error = e
            if attempt < MAX_RETRIES:
                print(f"Attempt {attempt} failed ({e}). Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)

    raise RuntimeError(f"Umarise API failed after {MAX_RETRIES} attempts: {last_error}")


def verify(hash_str: str) -> Optional[dict]:
    """
    Verify if a hash exists in the registry.
    Returns the origin record if found, None if not.
    """
    try:
        return _request("POST", "/v1-core-verify", {"hash": hash_str})
    except UmariseError as e:
        if e.code == "NOT_FOUND":
            return None
        raise


def resolve(origin_id: str) -> dict:
    """Resolve an origin record by origin_id."""
    return _request("GET", f"/v1-core-resolve?origin_id={origin_id}")


def wait_for_anchor(origin_id: str) -> dict:
    """
    Poll until proof_status changes to "anchored".
    Returns the final record. Raises after timeout (30 min default).
    """
    start = time.time()

    while time.time() - start < POLL_TIMEOUT:
        record = resolve(origin_id)
        if record["proof_status"] == "anchored":
            return record
        time.sleep(POLL_INTERVAL)

    raise TimeoutError(f"Proof not anchored after {POLL_TIMEOUT // 60} minutes")


# ═══════════════════════════════════════════════════════════════
# PUBLIC API — These are the functions you call
# ═══════════════════════════════════════════════════════════════

def attest_file(file_path: str, record_id: str) -> dict:
    """
    MAIN FUNCTION: Attest a file and store the origin_id.

    Call this when a file is uploaded/submitted in your system.

    Example:
        attest_file("/uploads/thesis.pdf", "submission-123")
        attest_file("/data/dataset.csv", "dataset-456")
    """
    h = hash_file(file_path)
    result = attest(h)
    save_origin_id(record_id, result["origin_id"])
    return result


def attest_bytes(data: bytes, record_id: str) -> dict:
    """
    MAIN FUNCTION: Attest raw bytes and store the origin_id.

    Call this when you have the file as bytes (e.g. from a web upload).

    Example:
        data = request.files["thesis"].read()
        attest_bytes(data, "submission-123")
    """
    h = hash_bytes(data)
    result = attest(h)
    save_origin_id(record_id, result["origin_id"])
    return result


def track_anchor(origin_id: str, record_id: str) -> None:
    """
    OPTIONAL: Wait for anchor and run callback.

    Call this after attest_file/attest_bytes if you want to know when
    the proof is fully anchored. Runs in background thread.

    Example:
        result = attest_file("/uploads/thesis.pdf", "sub-123")
        track_anchor(result["origin_id"], "sub-123")  # fire and forget
    """
    def _track():
        try:
            wait_for_anchor(origin_id)
            on_anchor_complete(record_id, origin_id)
        except Exception as e:
            print(f"Anchor tracking failed for {origin_id}: {e}")

    thread = threading.Thread(target=_track, daemon=True)
    thread.start()


def verify_file(file_path: str) -> Optional[dict]:
    """
    VERIFY: Check if a file has been attested.

    Example:
        result = verify_file("/uploads/thesis.pdf")
        if result:
            print(f"Attested at {result['captured_at']}")
    """
    h = hash_file(file_path)
    return verify(h)


# ═══════════════════════════════════════════════════════════════
# FALLBACK — What happens when the API is temporarily down
# ═══════════════════════════════════════════════════════════════

def safe_attest(file_path: str, record_id: str) -> Optional[dict]:
    """
    Safe wrapper: attests a file, but never blocks your workflow.
    If the API is down, logs the failure and continues.

    Use this if attestation is important but not critical.
    Your system keeps working even if Umarise is temporarily unavailable.

    Example:
        # In your upload handler:
        safe_attest("/uploads/thesis.pdf", "sub-123")
        # continues regardless of Umarise API status
    """
    try:
        return attest_file(file_path, record_id)
    except Exception as e:
        print(f"[Umarise] Attestation failed for {record_id}: {e}")
        # TODO: Optional — add to retry queue
        # retry_queue.add(file_path=file_path, record_id=record_id, failed_at=datetime.now())
        return None
