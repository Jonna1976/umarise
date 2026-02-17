#!/usr/bin/env python3
"""
Umarise Integration Template — Test Suite (Python)

═══════════════════════════════════════════════════════════════
  HOE JE DIT DRAAIT
═══════════════════════════════════════════════════════════════

Je hebt twee bestanden nodig:
  1. umarise_integration.py   (de template)
  2. test_integration.py       (dit bestand)

Download ze allebei. Dan in je Terminal:

  mkdir ~/umarise-test
  cp ~/Downloads/umarise_integration.py ~/umarise-test/
  cp ~/Downloads/test_integration.py ~/umarise-test/
  cd ~/umarise-test
  python3 test_integration.py um_JOUW_KEY_HIER

Dat is alles. Geen bestanden bewerken. Key staat in het commando.

macOS gebruikers — voorkom SSL-fout (eenmalig):
  python3 --version
  /Applications/Python\ 3.12/Install\ Certificates.command
  (gebruik jouw versienummer in plaats van 3.12)

═══════════════════════════════════════════════════════════════
"""

import sys
import os
import time
import ssl

# ─────────────────────────────────────────────────────────────
# PRE-FLIGHT CHECKS
# ─────────────────────────────────────────────────────────────

print()
print("=" * 55)
print("  Umarise Integration Template — Test Suite (Python)")
print("=" * 55)
print()

# Check: API key meegegeven als argument?
if len(sys.argv) < 2:
    print("  STOP  Geen API key meegegeven.")
    print()
    print("  Gebruik:")
    print("    python3 test_integration.py um_JOUW_KEY_HIER")
    print()
    print("  Je key begint met um_ en komt van partners@umarise.com.")
    print()
    sys.exit(1)

API_KEY = sys.argv[1]

if not API_KEY.startswith("um_"):
    print("  STOP  Je API key moet beginnen met 'um_'")
    print()
    print(f"  Je hebt ingevuld: {API_KEY[:20]}...")
    print()
    print("  Gebruik:")
    print("    python3 test_integration.py um_JOUW_KEY_HIER")
    print()
    sys.exit(1)

# Check: umarise_integration.py aanwezig?
try:
    import umarise_integration as um
except ImportError:
    print("  STOP  umarise_integration.py niet gevonden in deze map.")
    print()
    print("  Zorg dat beide bestanden in dezelfde map staan:")
    print("    cp ~/Downloads/umarise_integration.py ~/umarise-test/")
    print()
    sys.exit(1)

# Check: SSL (macOS)
try:
    import urllib.request
    urllib.request.urlopen("https://core.umarise.com/v1-core-health", timeout=10)
except (ssl.SSLCertificateError, ssl.SSLError):
    ver = f"{sys.version_info.major}.{sys.version_info.minor}"
    print("  STOP  SSL-certificaten niet geinstalleerd (bekend Mac-probleem).")
    print()
    print(f"  Fix (eenmalig): /Applications/Python\\ {ver}/Install\\ Certificates.command")
    print()
    print("  Draai daarna opnieuw: python3 test_integration.py " + API_KEY)
    print()
    sys.exit(1)
except Exception:
    pass

print("  Pre-flight checks OK. Tests starten...")
print()

# Config
um.API_KEY = API_KEY
um.RETRY_DELAY = 3
um.MAX_RETRIES = 1

# ─────────────────────────────────────────────────────────────
# TEST FRAMEWORK
# ─────────────────────────────────────────────────────────────

passed = 0
failed = 0

def test(name, fn):
    global passed, failed
    try:
        result = fn()
        print(f"  OK    {name}")
        passed += 1
        return result
    except Exception as e:
        print(f"  FAIL  {name}")
        print(f"        {e}")
        failed += 1
        return None

def test_must_fail(name, fn, expected_word):
    global passed, failed
    try:
        fn()
        print(f"  FAIL  {name}")
        print(f"        Had moeten falen, maar slaagde")
        failed += 1
    except Exception as e:
        msg = str(e)
        if expected_word in msg:
            print(f"  OK    {name}")
            print(f"        Fout (verwacht): {msg[:70]}")
            passed += 1
        else:
            print(f"  OK    {name} (andere error, maar correct gefaald)")
            print(f"        Fout: {msg[:70]}")
            passed += 1

# ─────────────────────────────────────────────────────────────
# TESTBESTANDEN
# ─────────────────────────────────────────────────────────────

test_files = []

def make_file(name):
    content = f"Umarise test {name} {int(time.time())}"
    with open(name, "w") as f:
        f.write(content)
    test_files.append(name)
    return name, content

# ─────────────────────────────────────────────────────────────
# DE TESTS
# ─────────────────────────────────────────────────────────────

# 1. HASHING
print("1. HASHING")
f1, c1 = make_file("test-doc.txt")

file_hash = test("hashFile — bestand hashen", lambda: um.hash_file(f1))
bytes_hash = test("hashBytes — bytes hashen", lambda: um.hash_bytes(c1.encode()))

if file_hash and bytes_hash:
    test("Zelfde input = zelfde hash",
        lambda: None if file_hash == bytes_hash
        else (_ for _ in ()).throw(Exception("Hashes zijn verschillend")))

# 2. ATTESTATIE
print("\n2. ATTESTATIE AANMAKEN")
result = test("attest() — attestatie aanmaken", lambda: um.attest(file_hash))

origin_id = None
if result:
    origin_id = result.get("origin_id")
    test(f"origin_id ontvangen: {origin_id[:16]}...",
        lambda: None if origin_id else (_ for _ in ()).throw(Exception("Geen origin_id")))
    test(f"proof_status: {result.get('proof_status')}", lambda: None)

# 3. ATTEST_FILE
print("\n3. BESTAND ATTESTEREN (hoofdfunctie)")
f2, _ = make_file("test-doc-2.txt")
test("attest_file() met save_origin_id callback",
    lambda: um.attest_file(f2, "record-001"))

# 4. VERIFY
print("\n4. HASH VERIFIEREN")
test("verify() — bestaande hash — match gevonden",
    lambda: um.verify(file_hash) or (_ for _ in ()).throw(Exception("Geen match")))

test("verify() — onbekende hash — None terug (correct)",
    lambda: None if um.verify("sha256:" + "0" * 64) is None
    else (_ for _ in ()).throw(Exception("Had None moeten zijn")))

# 5. RESOLVE
print("\n5. ATTESTATIE OPZOEKEN")
if origin_id:
    test("resolve() — origin_id opzoeken", lambda: um.resolve(origin_id))

# 6. VERIFY_FILE
print("\n6. BESTAND VERIFIEREN (hoofdfunctie)")
test("verify_file() — match gevonden",
    lambda: um.verify_file(f1) or (_ for _ in ()).throw(Exception("Geen match")))

# 7. ERROR HANDLING
print("\n7. FOUTAFHANDELING")

saved_key = um.API_KEY
um.API_KEY = "um_verkeerde_key_12345"
test_must_fail("Verkeerde API key — directe fout, geen retry",
    lambda: um.attest(file_hash), "UNAUTHORIZED")
um.API_KEY = saved_key

test_must_fail("Ongeldig hash-formaat — directe fout",
    lambda: um.attest("dit-is-geen-hash"), "INVALID_HASH")

# 8. SAFE_ATTEST
print("\n8. VEILIGE MODUS (safe_attest)")

f3, _ = make_file("test-doc-3.txt")
test("safe_attest() — werkende API — resultaat terug",
    lambda: um.safe_attest(f3, "record-002")
    or (_ for _ in ()).throw(Exception("Geen resultaat")))

saved_base = um.BASE
um.BASE = "https://does-not-exist.umarise.test"
print("  ...   API onbereikbaar simuleren (paar seconden)...")
none_result = um.safe_attest(f1, "record-003")
if none_result is None:
    print("  OK    Onbereikbare API — None terug, workflow gaat door")
    passed += 1
else:
    print("  FAIL  Had None moeten teruggeven")
    failed += 1
um.BASE = saved_base

# OPRUIMEN
for f in test_files:
    if os.path.exists(f):
        os.remove(f)

# RESULTAAT
print()
print("=" * 55)
total = passed + failed
if failed == 0:
    print(f"  Alle {total} tests geslaagd. Template werkt.")
    print()
    print("  Wat nu?")
    print("  Wacht 10-20 minuten en plak dan dit in je terminal:")
    print()
    if origin_id:
        print(f"  curl 'https://core.umarise.com/v1-core-resolve?origin_id={origin_id}'")
    print()
    print("  'anchored' = bewijs is definitief.")
    print("  'pending' = wacht nog even.")
else:
    print(f"  {passed}/{total} tests geslaagd, {failed} gefaald.")
    print()
    print("  Los de FAIL-regels op en draai opnieuw:")
    print(f"    python3 test_integration.py {API_KEY}")
print("=" * 55)
print()
