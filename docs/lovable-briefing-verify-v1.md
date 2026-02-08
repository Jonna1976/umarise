# Lovable Briefing: /verify tekst aanscherpen

De /verify pagina werkt. De functionaliteit is correct. Vier tekstwijzigingen om de pagina consistent te maken met de infrastructuurtoon van umarise.com.

---

## Fix 1: Verwijder "we" overal

"We" impliceert dat Umarise betrokken is bij verificatie. Dat is niet zo. De browser doet het werk. Dit is het hele punt van de architectuur: verificatie is client-side en onafhankelijk.

**Header:**

| Huidig | Nieuw |
|--------|-------|
| Drop it here to check if it's real, when it was registered, and download the Bitcoin proof. | Drop it here to verify the registration, check when it was recorded, and download the Bitcoin proof. |

"Check if it's real" is ook vaag. Een origin is niet "real" of "fake"; de vraag is of de bytes overeenkomen met de geregistreerde hash.

**Stap 1 (Drop):**

| Huidig | Nieuw |
|--------|-------|
| Everything is read in your browser. Nothing is uploaded. | Geen wijziging. Dit is correct. |

**Stap 2 (Verify):**

| Huidig | Nieuw |
|--------|-------|
| We hash the file, compare it with the certificate, check the Umarise registry, and confirm when it was registered. If a passkey claim is present, we show who signed it. | The file is hashed in your browser and compared with the certificate. The hash is checked against the Umarise registry to confirm when it was recorded. If a passkey claim is present, the signature is displayed. |

Drie fixes in deze zin:
- "We hash" wordt "The file is hashed in your browser" (geen "we", expliciet client-side)
- "we show who signed it" wordt "the signature is displayed" (geen "we", geen "who")
- "confirm when it was registered" wordt "confirm when it was recorded" (consistent met rest van site)

**Stap 3 (Keep the proof):**

| Huidig | Nieuw |
|--------|-------|
| No Umarise needed. | Geen wijziging. Dit is correct. |

**One action property:**

| Huidig | Nieuw |
|--------|-------|
| Drop the ZIP. We read the certificate and verify everything. | Drop the ZIP. The certificate is read and the registration is verified. |

"Verify everything" is overclaiming. De tool verifieert drie dingen: hash match, registratie, en Bitcoin-anker.

---

## Fix 2: "who signed it" verwijderen

Een passkey bindt aan een device, niet aan een persoon. Er is geen "who." De passkey bewijst dat iemand met biometrische toegang tot een specifiek apparaat de origin heeft geclaimd. Niet wie die persoon is.

Al opgelost in Fix 1 hierboven: "we show who signed it" wordt "the signature is displayed."

---

## Fix 3: "check if it's real" verwijderen

Al opgelost in Fix 1 hierboven: "check if it's real" wordt "verify the registration."

---

## Fix 4: "verify everything" verwijderen

Al opgelost in Fix 1 hierboven: "verify everything" wordt "the registration is verified."

---

## Volledige tekst na wijzigingen

Hieronder de volledige /verify tekst zoals die moet zijn. Ongewijzigde tekst is meegenomen voor context.

---

**Header:**

Verify an Origin

You received a ZIP with an origin claim. Drop it here to verify the registration, check when it was recorded, and download the Bitcoin proof.

**Drie properties:**

Private: Your file stays in your browser. Only the hash is checked.

Independent: The Bitcoin proof is yours. Verifiable without Umarise.

One action: Drop the ZIP. The certificate is read and the registration is verified.

**Drop zone:**

Drop your Origin ZIP
or a photo, or a certificate.json
Nothing leaves your device. The file is read locally.

No ZIP? Enter Origin ID and hash manually

**How it works:**

1. Drop
Drop the Origin ZIP you received. It contains the original file, a certificate with the Origin ID and hash, and optionally a Bitcoin proof. You can also drop just the photo or the certificate.json separately. Everything is read in your browser. Nothing is uploaded.

2. Verify
The file is hashed in your browser and compared with the certificate. The hash is checked against the Umarise registry to confirm when it was recorded. If a passkey claim is present, the signature is displayed.

3. Keep the proof
After verification, if the origin is anchored in Bitcoin, a button appears in the result to download the OpenTimestamps proof file. This .ots file is yours to keep forever. You can verify it independently against the Bitcoin blockchain with the OTS verifier or any full node. No Umarise needed.

**What an origin proves:**

This file existed at the registered time. That fact is anchored in the Bitcoin blockchain and independently verifiable.

If a passkey was used, it also proves someone claimed this origin with their device's secure enclave. A cryptographic signature, not a name or identity.

An origin does not prove first creation or exclusivity. The same file could be registered elsewhere. The .ots proof survives without Umarise. The origin metadata does not.

---

## Samenvatting

| # | Locatie | Was | Wordt | Reden |
|---|---------|-----|-------|-------|
| 1 | Header | check if it's real | verify the registration | "real" is vaag, origin is niet "echt" of "nep" |
| 2 | Stap 2 | We hash the file | The file is hashed in your browser | geen "we", expliciet client-side |
| 3 | Stap 2 | we show who signed it | the signature is displayed | C6: passkey bindt aan device, niet aan persoon |
| 4 | One action | We read the certificate and verify everything | The certificate is read and the registration is verified | geen "we", geen "everything" |

Vier zinnen, vier fixes. De rest van de pagina is schoon.

---

*Briefing v1, 8 feb 2026*
