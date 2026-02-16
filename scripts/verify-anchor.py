#!/usr/bin/env python3
"""
verify-anchor.py — Independent Anchor ZIP verification (Python)
Usage: python verify-anchor.py <anchor.zip>

Zero-dependency script. Uses only Python standard library.
No Umarise infrastructure needed.

Part of the Umarise External Review Program
https://umarise.com/reviewer
"""

import sys
import os
import json
import hashlib
import zipfile
import tempfile
import shutil


def main():
    if len(sys.argv) < 2:
        print("Usage: python verify-anchor.py <anchor.zip>")
        sys.exit(1)

    zip_path = sys.argv[1]
    if not os.path.isfile(zip_path):
        print(f"✗ File not found: {zip_path}")
        sys.exit(1)

    tmpdir = tempfile.mkdtemp()
    try:
        print("→ Extracting ZIP...")
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(tmpdir)

        # Find artifact
        artifact = None
        for f in os.listdir(tmpdir):
            if f.startswith("artifact."):
                artifact = os.path.join(tmpdir, f)
                break

        if not artifact:
            print("✗ No artifact found")
            sys.exit(1)

        # Read certificate.json
        cert_path = os.path.join(tmpdir, "certificate.json")
        if not os.path.isfile(cert_path):
            print("✗ No certificate.json")
            sys.exit(1)

        with open(cert_path, "r") as f:
            cert = json.load(f)

        expected = cert["hash"].removeprefix("sha256:")
        origin_id = cert["origin_id"]
        captured = cert["captured_at"]

        # Compute actual hash
        sha = hashlib.sha256()
        with open(artifact, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha.update(chunk)
        actual = sha.hexdigest()

        print()
        print(f"  Origin ID:   {origin_id}")
        print(f"  Captured at: {captured}")
        print(f"  Expected:    {expected}")
        print(f"  Computed:    {actual}")
        print()

        if expected == actual:
            print("✓ Hash matches — artifact is intact")
        else:
            print("✗ HASH MISMATCH — artifact has been modified")
            sys.exit(1)

        # Check for .ots proof
        ots = None
        for f in os.listdir(tmpdir):
            if f.endswith(".ots"):
                ots = f
                break

        if ots:
            print(f"✓ OTS proof found: {ots}")
            print(f"  Verify against Bitcoin: ots verify {ots}")
        else:
            print("⚠ No .ots proof included (anchoring may be pending)")
            print(f"  Retrieve later: curl https://core.umarise.com/v1-core-proof?origin_id={origin_id} -o proof.ots")

    finally:
        shutil.rmtree(tmpdir)


if __name__ == "__main__":
    main()
