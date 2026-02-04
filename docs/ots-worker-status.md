# OTS Worker — Status Update

**Datum:** 4 februari 2026  
**Component:** OpenTimestamps (OTS) Worker  
**Locatie:** Hetzner server (94.130.180.233) — `/opt/umarise/ots-worker/`  
**Status:** ✅ Live en geautomatiseerd

---

## Wat is er gebouwd

Een Node.js worker op Hetzner die attestatie-hashes uit `origin_attestations` automatisch verankert in de Bitcoin-blockchain via het OpenTimestamps-protocol.

### Workflow

1. Worker leest ongestampte attestaties uit Supabase (`origin_attestations` zonder record in `core_ots_proofs`)
2. Stuurt de SHA-256 hashes naar OpenTimestamps calendar servers (gratis, open source infrastructuur)
3. Calendar servers bundelen duizenden hashes in één Bitcoin-transactie
4. Na Bitcoin-bevestiging (1-12 uur) wordt het .ots proof-bestand bijgewerkt naar `anchored`

### Automatisering via cron

| Job | Interval | Functie |
|-----|----------|---------|
| Stamp | Elk uur | Nieuwe attestaties oppakken |
| Upgrade | Elke 30 min | Check Bitcoin-bevestiging |

### Huidige stand

| Metric | Waarde |
|--------|--------|
| Totaal attestaties | 8 |
| Anchored | 1 |
| Pending | 7 |

---

## Wat dit betekent voor Umarise Core

### Eerlijk positief

- **Verificatie zonder vertrouwen.** Iedereen kan een .ots proof downloaden en met de open source `ots verify` tool checken dat de data bestond op het geclaimde tijdstip. Zonder Umarise te hoeven vertrouwen.
- **Verkoopargument richting technische beslissers.** "Verify without trusting us" is een sterke propositie in data-integriteit gesprekken.
- **Completeert het immutability-verhaal.** In combinatie met immutable attestations, de partner API, en proof downloads is het verhaal naar klanten nu rond.
- **Kost niets.** OpenTimestamps is gratis. De worker draait op de bestaande Hetzner server.

### Eerlijk nuchter

- **Geen technische moat.** OpenTimestamps is open source. Een goede developer bouwt dit in een middag.
- **Niet wat Umarise maakt of breekt.** De waarde zit in klanten, partnerships, en een product waar mensen voor betalen.
- **Bitcoin-afhankelijkheid is minimaal risico.** Als calendar servers offline gaan, worden proofs na 48 uur als `failed` gemarkeerd en automatisch opnieuw gestampt.

---

## Database Schema

De worker gebruikt `core_ots_proofs`:

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | uuid | Primary key |
| origin_id | uuid | FK naar origin_attestations |
| ots_proof | bytea | .ots proof bestand (binair) |
| status | text | 'pending' / 'anchored' / 'failed' |
| bitcoin_block_height | integer | Bloknummer (null tot anchored) |
| created_at | timestamptz | Wanneer gestampt |
| anchored_at | timestamptz | Wanneer Bitcoin-bevestigd |
| upgraded_at | timestamptz | Laatste upgrade-poging |

---

## API Endpoint

`GET /v1-core-proof/:origin_id` — Retourneert het .ots bestand als download.

- **Anchored:** Returns binary `.ots` file met `X-Bitcoin-Block-Height` header
- **Pending:** Returns `202 Accepted` met status info
- **Not found:** Returns `404`

---

## Bestanden op Hetzner

```
/opt/umarise/ots-worker/
├── worker.js          # Hoofdscript (300 regels)
├── package.json       # Dependencies
├── node_modules/      # opentimestamps, @supabase/supabase-js, dotenv
└── .env               # SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
```

---

## CLI Referentie

```bash
node worker.js status     # Toon statistieken
node worker.js stamp      # Stamp nu (ook via cron elk uur)
node worker.js upgrade    # Upgrade nu (ook via cron elke 30 min)
node worker.js retry      # Herstart gefaalde proofs
```

---

## Frontend Implicaties

- **Proof status is real-time.** Na een attestatie duurt het 1-12 uur voor `anchored`. UI kan `pending` / `anchored` tonen.
- **Download werkt.** `GET /v1-core-proof/:origin_id` retourneert het .ots bestand.
- **Verificatie is extern.** Gebruikers verifiëren met de `ots` CLI tool of via opentimestamps.org.

---

*Document versie: 1.0*  
*Status: Operationeel*
