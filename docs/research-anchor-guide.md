# Research Anchor Guide

**Bewijs dat jouw werk bestond op dit moment — in 3 stappen.**

> Geen account. Geen upload. Alleen de hash van jouw bestand verlaat je laptop.

---

## Stap 1 — Hash & Anchor

```bash
# Stel je API key in (eenmalig)
export CORE_API_KEY=um_JOUW_KEY

# Hash lokaal + registreer bij de origin registry
HASH=$(shasum -a 256 dissertatie-draft.pdf | awk '{print "sha256:"$1}')

curl -X POST https://core.umarise.com/v1-core-origins \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $CORE_API_KEY" \
  -d "{\"hash\": \"$HASH\"}"
```

**Resultaat:** je krijgt een `origin_id` en `captured_at` timestamp terug. Bewaar deze.

---

## Stap 2 — Wacht op Bitcoin-verankering (~24 uur)

```bash
curl "https://core.umarise.com/v1-core-resolve?origin_id=JOUW_ORIGIN_ID"
```

Wanneer `proof_status` verandert van `pending` naar `anchored`, is je bewijs verankerd in de Bitcoin-blockchain. Download het `.ots` bewijsbestand:

```bash
curl "https://core.umarise.com/v1-core-proof?origin_id=JOUW_ORIGIN_ID" \
  -H "X-API-Key: $CORE_API_KEY" \
  --output bewijs.ots
```

---

## Stap 3 — Verifieer (onafhankelijk, zonder account)

**Online:** ga naar [verify-anchoring.org](https://verify-anchoring.org), drop je PDF + `.ots` bestand. Verificatie draait 100% lokaal in je browser.

**CLI:** `ots verify bewijs.ots` — verifieert direct tegen de Bitcoin-blockchain.

Geen Umarise-account nodig. Geen server. Geen vertrouwen vereist.

---

## Wat je hebt

| Component | Beschrijving |
|-----------|-------------|
| **PDF** | Op jouw laptop (nooit geüpload) |
| **SHA-256 hash** | Unieke vingerafdruk van exact die bytes |
| **origin_id** | UUID in de registry |
| **captured_at** | Cryptografisch vastgelegd tijdstempel |
| **.ots proof** | Bitcoin-verankerd bewijs — overleeft elke dienst |

---

## Wat dit bewijst

> *"Deze exacte bytes bestonden op dit moment."*

Niet wie het schreef. Niet of het goed is. Alleen bestaan — deterministisch, niet probabilistisch.

---

*API key aanvragen: [partners@umarise.com](mailto:partners@umarise.com) · Specificatie: [anchoring-spec.org](https://anchoring-spec.org)*
