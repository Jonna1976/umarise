# Umarise: Migratie Stappenplan — Lovable Cloud → Zelfbeheerd Supabase

**Versie:** 1.0  
**Datum:** 18 februari 2026  
**Status:** Wacht op antwoord Lovable Support (grace period bevestiging)  
**Verantwoordelijke:** CTO / Infra-eigenaar

---

## Overzicht

We migreren van de **Lovable Cloud managed Supabase** instantie naar een **zelfbeheerd Supabase project** (Pro tier). Dit geeft ons volledige infrastructuursoevereiniteit: eigen connection strings, PITR, eigen backups, en geen vendor lock-in op database niveau.

### Kritieke randvoorwaarden (NOOIT over heen stappen)

| Randvoorwaarde | Reden |
|---|---|
| `CORE_API_SECRET` **identiek** houden | Alle `partner_api_keys` hashes zijn hierop gebaseerd. Wijziging = alle partner keys ongeldig. |
| `INTERNAL_API_SECRET` **roteren** VOOR migratie | Dit secret is in chat gedeeld (security risk). Nieuwe waarde meenemen naar nieuwe project. |
| Migratie uitvoeren met **parallel** nieuwe omgeving | DNS pas omzetten NADAT smoke tests slagen. Geen downtime. |
| `.ots` proof data exporteren via API, **niet** als raw SQL dump | Bytea-data kan corrupteren bij naïeve export. |

---

## Architectuuroverzicht (na migratie)

```
Cloudflare DNS
  core.umarise.com → CNAME → [NIEUW Supabase project Edge Functions URL]

Hetzner (onveranderd)
  OTS Worker → schrijft naar [NIEUW Supabase project]
  Hetzner Storage → pagina images (geen migratie nodig)

Lovable (frontend only, na migratie)
  React app → companion-* Edge Functions → [NIEUW Supabase project]
```

---

## FASE 0 — Voorbereiding & Backup (VOOR alles)

**Doel:** Volledige backup van productiedata veiligstellen. Geen enkele migratiestap mag starten zonder dit te voltooien.

### Stap 0.1 — Bevestig grace period (wacht op Support antwoord)

- [ ] Ontvang bevestiging van Lovable Support over grace period na "Disable Cloud"
- [ ] Leg het antwoord schriftelijk vast (screenshot Discord/email)
- [ ] Ga pas verder naar Fase 1 als dit bevestigd is

### Stap 0.2 — Exporteer alle kritieke data uit huidige omgeving

**Partner API keys (geen hashes, alleen metadata):**
```sql
-- Uitvoeren via Lovable Cloud → Run SQL (Test of Live)
SELECT 
  key_prefix,
  partner_name,
  rate_limit_tier,
  issued_at,
  revoked_at
FROM partner_api_keys
ORDER BY issued_at;
```
Sla output op als `backup/partner-keys-export-DATUM.csv`

**Origin attestations:**
```sql
SELECT origin_id, hash, hash_algo, captured_at, created_at, api_key_prefix
FROM origin_attestations
ORDER BY created_at;
```
Sla op als `backup/attestations-export-DATUM.csv`

**OTS Proofs — via de API endpoint (aanbevolen boven SQL):**
```bash
curl -H "X-API-Key: [PARTNER_KEY]" \
  "https://core.umarise.com/functions/v1/v1-core-proofs-export?status=anchored&limit=1000" \
  > backup/ots-proofs-anchored-DATUM.json

curl -H "X-API-Key: [PARTNER_KEY]" \
  "https://core.umarise.com/functions/v1/v1-core-proofs-export?status=pending&limit=1000" \
  > backup/ots-proofs-pending-DATUM.json
```

**Companion data (pages, page_origin_hashes):**
```sql
-- Sla row counts op als verificatie baseline
SELECT 
  'pages' as tabel, COUNT(*) FROM pages
UNION ALL
SELECT 'page_origin_hashes', COUNT(*) FROM page_origin_hashes
UNION ALL
SELECT 'origin_attestations', COUNT(*) FROM origin_attestations
UNION ALL
SELECT 'core_ots_proofs', COUNT(*) FROM core_ots_proofs
UNION ALL
SELECT 'partner_api_keys', COUNT(*) FROM partner_api_keys;
```
Sla op als `backup/row-counts-DATUM.txt` — dit is je verificatiebasis na migratie.

### Stap 0.3 — Bewaar alle secrets veilig

Voordat je iets aanraakt, sla de volgende secrets op in een **offline, versleuteld** password manager (bijv. 1Password, Bitwarden):

| Secret | Actie |
|---|---|
| `CORE_API_SECRET` | Kopiëren — **identiek** meenemen naar nieuw project |
| `INTERNAL_API_SECRET` | Nieuwe waarde genereren (roteren!): `openssl rand -hex 32` |
| `HETZNER_API_TOKEN` | Kopiëren |
| `RESEND_API_KEY` | Kopiëren (indien aanwezig) |
| `LOVABLE_API_KEY` | ❌ **Niet meenemen** — dit is een Lovable Cloud interne connector key, niet van jullie eigendom. Werkt niet buiten Lovable Cloud. |

> ⚠️ **NOOIT** de `CORE_API_SECRET` wijzigen. Dit breekt alle bestaande partner API keys.

---

## FASE 1 — Nieuw Supabase Project Opzetten

**Doel:** Leeg nieuw Supabase Pro project met identiek schema en alle secrets.

### Stap 1.1 — Nieuw project aanmaken

> ✅ **Bevestigd (18 feb 2026):** Project is aangemaakt met de volgende instellingen:
> - **Organisatie:** Jonna1976's Organization (PRO)
> - **Projectnaam:** Umarise Core 2026
> - **Compute:** MICRO (1 GB RAM / 2-core ARM CPU) — opschalen mogelijk via dashboard
> - **Regio:** Central EU (Frankfurt) ✅
> - **Data API:** Enabled ✅
> - **Extra kosten:** $10/m bovenop Pro plan

> ⚠️ **Sla het database wachtwoord nu op** in je versleuteld password manager (1Password/Bitwarden). Dit wachtwoord is nodig voor `supabase db push` en directe psql-verbindingen. Supabase toont het daarna niet meer volledig.

Na aanmaken, noteer de nieuwe project credentials:
- **Project URL:** `https://[NIEUW-PROJECT-ID].supabase.co`
- **Project ref ID:** (zichtbaar in dashboard URL en Settings → General)
- **Anon key** (Settings → API)
- **Service role key** (Settings → API — bewaar offline, niet in git)
- **Database URL** `postgresql://postgres:[PASS]@db.[ID].supabase.co:5432/postgres` (Settings → Database)

### Stap 1.2 — Supabase CLI koppelen

```bash
# Installeer CLI indien nodig
npm install -g supabase

# Login
supabase login

# Koppel aan nieuw project
supabase link --project-ref [NIEUW-PROJECT-ID]

# Verifieer
supabase status
```

### Stap 1.3 — Schema deployen

```bash
# Voer alle 61 migrations uit op het nieuwe project
supabase db push

# Verwachte output: alle migrations succesvol toegepast
# Controleer in Supabase dashboard → Table Editor of tabellen aanwezig zijn:
# - origin_attestations (+ triggers)
# - partner_api_keys (+ triggers)
# - core_ots_proofs (+ triggers)
# - core_rate_limits
# - core_request_log
# - pages, page_origin_hashes, page_trash
# - witnesses, personality_snapshots, projects
# - health_checks, core_ddl_audit, audit_logs
```

### Stap 1.4 — DDL Event Trigger (superuser vereist)

De `log_ddl_event` trigger vereist superuser rechten. Dit is de **enige** stap die niet via `supabase db push` werkt.

**Aanpak:**
1. Open een Supabase Support ticket: *"Graag de volgende SQL uitvoeren als superuser op project [NIEUW-PROJECT-ID]"*
2. Bijvoeg de SQL:

```sql
-- DDL audit trigger (vereist superuser)
CREATE OR REPLACE FUNCTION log_ddl_event()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
    INSERT INTO public.core_ddl_audit (
      event_type, command_tag, object_type, object_identity, object_name, executed_by
    ) VALUES (
      TG_EVENT, r.command_tag, r.object_type, r.object_identity,
      r.object_identity, current_user
    );
  END LOOP;
END;
$$;

CREATE EVENT TRIGGER audit_ddl_changes
ON ddl_command_end
EXECUTE FUNCTION log_ddl_event();
```

> **Alternatief (indien Support traag):** Sla deze trigger over voor nu en implementeer hem zodra het project live is. De core functionaliteit werkt zonder deze trigger.

### Stap 1.5 — Secrets instellen in nieuw project

Ga naar nieuw Supabase project → Settings → Edge Functions → Secrets:

```bash
# Via CLI (aanbevolen voor bulk)
supabase secrets set CORE_API_SECRET="[IDENTIEK AAN HUIDIG]"
supabase secrets set INTERNAL_API_SECRET="[NIEUWE GEGENEREERDE WAARDE]"
supabase secrets set HETZNER_API_TOKEN="[KOPIEER UIT HUIDIG]"
supabase secrets set LOVABLE_API_KEY="[KOPIEER UIT HUIDIG]"
supabase secrets set RESEND_API_KEY="[KOPIEER UIT HUIDIG]"

# Verifieer
supabase secrets list
```

---

## FASE 2 — Data Migratie

**Doel:** Productiedata overzetten van oud naar nieuw project. Oud project blijft LIVE tijdens deze fase.

### Stap 2.1 — Origin Attestations migreren

Attestations zijn immutable — geen conflict risico.

```sql
-- Exporteer als INSERT statements uit oud project (via SQL editor)
SELECT 
  'INSERT INTO origin_attestations (origin_id, hash, hash_algo, captured_at, created_at, api_key_prefix) VALUES (''' ||
  origin_id || ''', ''' || hash || ''', ''' || hash_algo || ''', ''' ||
  captured_at || ''', ''' || created_at || ''', ' ||
  COALESCE('''' || api_key_prefix || '''', 'NULL') || ');'
FROM origin_attestations
ORDER BY created_at;
```

Plak de gegenereerde INSERT statements in het nieuwe project's SQL editor.

**Verificatie:**
```sql
-- In nieuw project: moet matchen met backup/row-counts-DATUM.txt
SELECT COUNT(*) FROM origin_attestations;
```

### Stap 2.2 — Partner API Keys migreren

```sql
-- Exporteer uit oud project
SELECT 
  'INSERT INTO partner_api_keys (id, partner_name, key_prefix, key_hash, rate_limit_tier, issued_at, issued_by, revoked_at) VALUES (''' ||
  id || ''', ''' || partner_name || ''', ''' || key_prefix || ''', ''' || key_hash || ''', ''' ||
  rate_limit_tier || ''', ''' || issued_at || ''', ' ||
  COALESCE('''' || issued_by || '''', 'NULL') || ', ' ||
  COALESCE('''' || revoked_at || '''', 'NULL') || ');'
FROM partner_api_keys
ORDER BY issued_at;
```

> **Kritiek:** De `key_hash` waarden moeten exact overeenkomen. Controleer na import:
```sql
-- Nieuw project: moet 3 actieve keys tonen
SELECT key_prefix, partner_name, rate_limit_tier, revoked_at 
FROM partner_api_keys 
WHERE revoked_at IS NULL;
```

### Stap 2.3 — OTS Proofs migreren

OTS proof data (bytea) is gevoelig voor encoding problemen. Gebruik de export JSON uit Fase 0.

```bash
# Script om JSON export te converteren naar SQL inserts
# (uit backup/ots-proofs-anchored-DATUM.json)
node scripts/import-ots-proofs.js
```

Maak het import script aan:

```javascript
// scripts/import-ots-proofs.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('backup/ots-proofs-anchored-DATUM.json'));
const inserts = data.proofs.map(p => 
  `INSERT INTO core_ots_proofs (origin_id, ots_proof, status, bitcoin_block_height, anchored_at) 
   VALUES ('${p.origin_id}', decode('${Buffer.from(p.ots_proof, 'base64').toString('hex')}', 'hex'), '${p.proof_status}', ${p.bitcoin_block_height || 'NULL'}, ${p.anchored_at ? `'${p.anchored_at}'` : 'NULL'});`
);
fs.writeFileSync('backup/ots-inserts.sql', inserts.join('\n'));
console.log(`Gegenereerd: ${inserts.length} inserts`);
```

### Stap 2.4 — Companion data migreren (pages, etc.)

> ⚠️ **Gecorrigeerd:** `pg_dump` werkt **niet** voor het huidige Lovable Cloud project — er is geen directe database connection string beschikbaar voor de bestaande beheerde omgeving. De onderstaande pg_dump commando's zijn **uitsluitend** bedoeld voor gebruik op het nieuwe zelfbeheerde project.

**Optie A — Via Supabase dashboard export (aanbevolen als er een grace period is):**

Als Lovable Support bevestigt dat er een grace period bestaat na "Disable Cloud":
1. Ga naar het Supabase dashboard van het oude project (beschikbaar tijdens grace period)
2. Table Editor → `pages` → Export to CSV
3. Table Editor → `page_origin_hashes` → Export to CSV
4. Table Editor → `witnesses` → Export to CSV
5. Importeer CSVs via het nieuwe project's dashboard of via psql

**Optie B — Schone start (aanbevolen als geen grace period of weinig gebruikers):**

Pages data is device-gebonden. Gebruikers hersealen hun content na de migratie. Images staan al in Hetzner Storage en blijven bereikbaar. Dit is de veiligste aanpak als de data-volume beperkt is.

**Optie C — pg_dump naar nieuw project (alleen voor toekomstig gebruik):**
```bash
# Dit werkt ALLEEN op het nieuwe zelfbeheerde project (na Fase 1)
pg_dump "postgresql://postgres:[PASS]@db.[NIEUW-ID].supabase.co:5432/postgres" \
  --table=pages --table=page_origin_hashes --table=witnesses \
  --data-only --no-owner -f backup/companion-data-nieuw.sql
```

---

## FASE 3 — Edge Functions Deployen

**Doel:** Alle 30+ Edge Functions deployen naar nieuw Supabase project.

### Stap 3.1 — Deploy alle functions

```bash
# Vanuit project root (waar supabase/ map staat)
supabase functions deploy --project-ref [NIEUW-PROJECT-ID]

# Of per functie:
supabase functions deploy v1-core-health --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-core-origins --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-core-resolve --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-core-verify --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-core-proof --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-core-proofs-export --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-core-origins-export --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-internal-metrics --project-ref [NIEUW-PROJECT-ID]
supabase functions deploy v1-internal-partner-create --project-ref [NIEUW-PROJECT-ID]
# ... alle overige companion-*, analyze-*, generate-* functions
```

### Stap 3.2 — Noteer nieuwe Edge Function URLs

Nieuwe base URL wordt:
```
https://[NIEUW-PROJECT-ID].supabase.co/functions/v1/
```

---

## FASE 4 — Smoke Tests op Nieuwe Omgeving

**Doel:** Valideer ALLE endpoints op het nieuwe project **voordat** DNS wordt omgezet.  
**Belangrijk:** Test direct op de Supabase URL, niet via `core.umarise.com` (dat wijst nog naar oud project).

```bash
NEW_BASE="https://[NIEUW-PROJECT-ID].supabase.co/functions/v1"
PARTNER_KEY="[EEN VAN DE 3 ACTIEVE PARTNER KEYS]"

# Test 1: Health check
curl -s "$NEW_BASE/v1-core-health" | jq .
# Verwacht: {"status":"ok","database":"ok"}

# Test 2: Resolve bestaande attestation (gebruik een bekende origin_id)
curl -s "$NEW_BASE/v1-core-resolve?origin_id=[BEKENDE-UUID]" | jq .
# Verwacht: origin_id, hash, captured_at terugkrijgen

# Test 3: Verify bestaande hash
curl -s -X POST "$NEW_BASE/v1-core-verify" \
  -H "Content-Type: application/json" \
  -d '{"hash":"[BEKENDE-HASH]"}' | jq .
# Verwacht: {"verified":true,"origin_id":"..."}

# Test 4: Nieuwe attestatie aanmaken (test API key auth)
TEST_HASH=$(echo -n "migratie-smoke-test-$(date)" | sha256sum | awk '{print $1}')
curl -s -X POST "$NEW_BASE/v1-core-origins" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PARTNER_KEY" \
  -d "{\"hash\":\"$TEST_HASH\",\"captured_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" | jq .
# Verwacht: {"origin_id":"...","hash":"...","captured_at":"..."}

# Test 5: OTS proof opvragen
curl -s "$NEW_BASE/v1-core-proof?origin_id=[BEKENDE-UUID]" | jq .
# Verwacht: proof data of {"error":{"code":"NOT_FOUND",...}} als pending

# Test 6: Metrics endpoint
curl -s -H "X-Internal-Secret: [NIEUWE INTERNAL_API_SECRET]" \
  "$NEW_BASE/v1-internal-metrics" | jq .
# Verwacht: stats object met request counts

# Test 7: Rate limiting check
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" "$NEW_BASE/v1-core-health"
done
# Verwacht: allemaal 200 (health endpoint heeft ruime limits)
```

**Alleen doorgaan naar Fase 5 als ALLE 7 tests slagen.**

---

## FASE 5 — OTS Worker Herconfigureren

**Doel:** Hetzner OTS Worker laten schrijven naar het nieuwe Supabase project.

> **Infrastructuurfeiten (gecorrigeerd):**
> - SSH user is `jonna`, geen `root`. Bereikbaar via `ssh hetzner` (SSH config alias).
> - `jonna` heeft geen sudo — voor `.env` (eigendom root) is sudo vereist. Vraag rootgebruiker of stel tijdelijk sudo in voor dit bestand.
> - Worker draait via **root cron** (elke 30 min upgrade, elk uur stamp). Geen pm2 geïnstalleerd.
> - Logs staan in `/var/log/umarise-ots.log`.

### Stap 5.1 — Worker configuratie updaten

```bash
# Verbind via SSH alias
ssh hetzner

# Navigeer naar worker
cd /opt/umarise/ots-worker/

# Backup huidige config (vereist sudo, eigendom root)
sudo cp .env .env.backup.$(date +%Y%m%d)

# Update configuratie
sudo nano .env
# Wijzig de volgende regels:
# SUPABASE_URL=https://[NIEUW-PROJECT-ID].supabase.co
# SUPABASE_SERVICE_ROLE_KEY=[NIEUWE SERVICE ROLE KEY]
```

### Stap 5.2 — Worker testen (optionele dry-run)

```bash
# Test handmatige run als root (zonder cron-scheduling)
sudo -u root bash -c 'cd /opt/umarise/ots-worker && node worker.js --dry-run'

# Bekijk logs
tail -f /var/log/umarise-ots.log
# Verwacht: verbindingsbevestiging naar [NIEUW-PROJECT-ID]
```

### Stap 5.3 — Wacht op eerstvolgende cron-run

```bash
# Geen pm2. De cron pikt de nieuwe .env automatisch op bij de volgende run.
# Cron schema (root):
#   - Elke 30 min: upgrade check
#   - Elk uur: stamp run

# Monitor de logs tijdens de eerstvolgende verwachte run:
tail -f /var/log/umarise-ots.log
```

---

## FASE 6 — DNS Cutover (Zero-Downtime)

**Doel:** `core.umarise.com` omzetten naar nieuw Supabase project. Dit is het moment van "go-live".

### Stap 6.1 — Bereken downtime window

DNS TTL check:
```bash
dig core.umarise.com +short
# Noteer huidige TTL — dit is de max propgatie tijd na de wijziging
```

**Aanbeveling:** Verlaag TTL 24 uur van tevoren naar 60 seconden.

### Stap 6.2 — Cloudflare DNS updaten

1. Ga naar Cloudflare Dashboard → `umarise.com` → DNS
2. Zoek CNAME record voor `core`
3. Wijzig target van `[OUD-PROJECT-ID].supabase.co` naar `[NIEUW-PROJECT-ID].supabase.co`
4. Noteer exacte tijdstip van wijziging

### Stap 6.3 — Verificatie na cutover

```bash
# Test via core.umarise.com (niet meer via directe Supabase URL)
curl -s "https://core.umarise.com/functions/v1/v1-core-health" | jq .
# Moet {"status":"ok",...} teruggeven van nieuw project

# Verifieer dat nieuwe attestaties aankomen in nieuw project dashboard
# (niet in het oude)
```

---

## FASE 7 — Frontend App Updaten

**Doel:** React app laten praten met nieuwe Supabase instantie.

### Stap 7.1 — Environment variabelen updaten

In Lovable project settings, update de volgende variabelen:
```
VITE_SUPABASE_URL=https://[NIEUW-PROJECT-ID].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[NIEUWE ANON KEY]
VITE_SUPABASE_PROJECT_ID=[NIEUW-PROJECT-ID]
```

> **Opmerking:** Als je Lovable Cloud blijft gebruiken voor de frontend (alleen database migratie), dan worden deze automatisch bijgewerkt zodra je de Cloud connector updatet. Als je volledig disconnectet, moet dit handmatig in de codebase.

### Stap 7.2 — `src/integrations/supabase/client.ts` check

Dit bestand is auto-gegenereerd. Na het updaten van de environment variabelen wordt het automatisch bijgewerkt.

---

## FASE 8 — Cleanup & Monitoring

### Stap 8.1 — Disable Cloud (pas na voltooide DNS cutover)

> ⚠️ **Gecorrigeerd:** Het vorige plan beschreef het oude project als "read-only fallback" — dit is **niet mogelijk**. Na "Disable Cloud" verlies je beheer over de old managed omgeving. Je kunt geen rate limits instellen op iets wat je niet meer beheert.

**De juiste volgorde:**
1. ✅ Nieuwe omgeving volledig operationeel (Fase 1–4 voltooid)
2. ✅ OTS Worker wijst naar nieuw project (Fase 5)
3. ✅ DNS cutover geslaagd + post-cutover health check OK (Fase 6)
4. ✅ Frontend werkt op nieuwe omgeving (Fase 7)
5. **Dan pas:** Disable Cloud uitvoeren (na bevestiging Support over grace period)

**Fallback na cutover = Cloudflare DNS rollback** (60 sec), niet het oude project.

> Als Lovable Support een grace period bevestigt: gebruik die periode voor eventuele CSV-exports (zie Stap 2.4) **vóór** je Disable Cloud uitvoert.

### Stap 8.2 — Monitoring instellen

```bash
# Stel UptimeRobot of BetterUptime in voor:
# - https://core.umarise.com/functions/v1/v1-core-health (elke 5 min)
# - Hetzner OTS Worker health endpoint
```

### Stap 8.3 — Communiceer naar partners

Na succesvolle migratie, informeer partners (Acme Corp, Summer Corp):
- Geen actie vereist van hun kant
- API keys blijven geldig
- Zelfde `core.umarise.com` endpoint

### Stap 8.4 — `INTERNAL_API_SECRET` communiceren

Informeer intern team over de nieuwe `INTERNAL_API_SECRET` waarde (de oude was gecompromitteerd in chat).

---

## Rollback Plan

Als iets fout gaat in Fase 5 of 6, rollback is eenvoudig:

| Fase | Rollback actie | Tijd |
|---|---|---|
| Fase 5 (Worker) | `cp .env.backup .env && pm2 restart ots-worker` | 2 min |
| Fase 6 (DNS) | Cloudflare CNAME terug naar oud project | 60 sec + TTL propagatie |
| Fase 7 (Frontend) | Revert environment variabelen | 5 min |

**Fase 2 (Data migratie) heeft geen rollback nodig** — oud project is onveranderd.

---

## Tijdlijn (Indicatief)

| Fase | Geschatte duur | Blocker |
|---|---|---|
| Fase 0 — Backup | 2-4 uur | Wacht op Support antwoord |
| Fase 1 — Setup nieuw project | 1-2 uur | DDL trigger Support ticket |
| Fase 2 — Data migratie | 2-4 uur | Afhankelijk van datavolume |
| Fase 3 — Edge Functions | 30 min | — |
| Fase 4 — Smoke tests | 1 uur | Alle tests moeten slagen |
| Fase 5 — OTS Worker | 30 min | SSH toegang Hetzner |
| Fase 6 — DNS Cutover | 15 min + TTL | — |
| Fase 7 — Frontend | 30 min | — |
| Fase 8 — Cleanup | Doorlopend | — |

**Totaal geschatte doorlooptijd:** 8-12 uur actief werk, verspreid over 2-3 dagen  
**Aanbevolen uitvoering:** Weekenddag met lage traffic

---

## Checklist (Afvinken voor Go-Live)

- [ ] Lovable Support antwoord ontvangen over grace period
- [ ] Alle secrets opgeslagen in versleuteld password manager
- [ ] `INTERNAL_API_SECRET` geroteerd (nieuwe waarde gegenereerd)
- [ ] Backup bestanden aanwezig in `backup/` map
- [ ] Row counts vastgelegd als verificatiebasis
- [ ] Nieuw Supabase project aangemaakt (Frankfurt)
- [ ] `supabase db push` succesvol uitgevoerd
- [ ] DDL trigger geregeld via Support ticket (of bewust uitgesteld)
- [ ] Alle secrets ingesteld in nieuw project
- [ ] Data migratie uitgevoerd (attestations, partner keys, OTS proofs)
- [ ] Edge Functions gedeployed naar nieuw project
- [ ] Alle 7 smoke tests geslaagd op nieuwe omgeving
- [ ] OTS Worker geconfigureerd naar nieuw project
- [ ] DNS TTL verlaagd naar 60 seconden (24 uur van tevoren)
- [ ] DNS cutover uitgevoerd
- [ ] Post-cutover health check geslaagd
- [ ] Frontend environment variabelen bijgewerkt
- [ ] Partners geïnformeerd (geen actie vereist)

---

*Dit document bijwerken na elke voltooide fase. Bewaar versies.*
