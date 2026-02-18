# Migratie Dag 1 — Uitvoeringsplan
**Datum:** [invullen zodra support antwoord ontvangen]  
**Nieuwe omgeving:** `ubcqdjaytlxjqtinlzhi` (Umarise Core 2026, Frankfurt)  
**Huidige omgeving:** `lppltmdtiypbfzlszhhb` (Lovable Cloud)  
**Uitvoerder:** CTO / Jonna  
**Geschatte duur:** 6-8 uur actief werk

---

## Voor je begint — checklist (5 min)

- [ ] Support antwoord gelezen en grace period bevestigd (of bewust gekozen voor "geen grace period" aanpak)
- [ ] Database wachtwoord `ubcqdjaytlxjqtinlzhi` bij de hand (offline password manager)
- [ ] Service role key geroteerd na gisteren's chat incident → nieuwe waarde in password manager
- [ ] Supabase CLI geïnstalleerd (`supabase --version`)
- [ ] Toegang tot huidige Lovable Cloud project (voor secret waarden)
- [ ] Terminal open in project root (waar `supabase/` map staat)

---

## BLOK 1 — Schema deployen (± 1 uur)

### 1A — CLI koppelen aan nieuw project

```bash
supabase login
# → opent browser, log in met Supabase account van Jonna1976's Organization

supabase link --project-ref ubcqdjaytlxjqtinlzhi
# → voer database wachtwoord in wanneer gevraagd

supabase status
# → verwacht: project ref = ubcqdjaytlxjqtinlzhi
```

### 1B — Schema deployen

```bash
supabase db push
# → deployt alle migrations naar het nieuwe project
# → verwacht: allemaal "Applied" of "Already applied"
```

### 1C — Verificeer tabellen in dashboard

Open: https://supabase.com/dashboard/project/ubcqdjaytlxjqtinlzhi/editor

Controleer dat deze tabellen aanwezig zijn:
- [ ] `origin_attestations` (+ immutability triggers)
- [ ] `partner_api_keys` (+ delete guard trigger)
- [ ] `core_ots_proofs` (+ anchored proof guard)
- [ ] `core_rate_limits`
- [ ] `core_request_log`
- [ ] `pages` (+ RLS policies)
- [ ] `page_origin_hashes`
- [ ] `witnesses`
- [ ] `health_checks`
- [ ] `core_ddl_audit`
- [ ] `audit_logs`
- [ ] `projects`
- [ ] `page_trash`
- [ ] `search_telemetry`
- [ ] `page_association_revocations`
- [ ] `hetzner_trash_index`
- [ ] `personality_snapshots`

**❌ Stop als tabellen ontbreken — los migrations probleem eerst op voor je verder gaat.**

---

## BLOK 2 — Secrets instellen (± 30 min)

Haal de huidige secret waarden op via Lovable Cloud project settings. Stel ze in op het nieuwe project:

```bash
# KERN: CORE_API_SECRET moet IDENTIEK zijn aan het huidige project
supabase secrets set CORE_API_SECRET="[HAAL OP UIT HUIDIG PROJECT]" \
  --project-ref ubcqdjaytlxjqtinlzhi

# NIEUW genereren — de oude is gecompromitteerd in chat
supabase secrets set INTERNAL_API_SECRET="$(openssl rand -hex 32)" \
  --project-ref ubcqdjaytlxjqtinlzhi
# ⚠️ Noteer deze nieuwe waarde direct in password manager!

# Kopiëren uit huidig project
supabase secrets set HETZNER_API_TOKEN="[HAAL OP UIT HUIDIG PROJECT]" \
  --project-ref ubcqdjaytlxjqtinlzhi

supabase secrets set RESEND_API_KEY="[HAAL OP UIT HUIDIG PROJECT]" \
  --project-ref ubcqdjaytlxjqtinlzhi

# Verifieer (toont namen, niet waarden)
supabase secrets list --project-ref ubcqdjaytlxjqtinlzhi
```

Verwachte output secrets list:
- `CORE_API_SECRET` ✅
- `INTERNAL_API_SECRET` ✅
- `HETZNER_API_TOKEN` ✅
- `RESEND_API_KEY` ✅

**❌ NOOIT `LOVABLE_API_KEY` meenemen** — is een interne Lovable connector key.

---

## BLOK 3 — Data migratie (± 2-3 uur)

### 3A — Baseline row counts vastleggen (huidig project)

Voer uit via Lovable Cloud → Run SQL (Live):

```sql
SELECT 
  'origin_attestations' as tabel, COUNT(*) as aantal FROM origin_attestations
UNION ALL SELECT 'partner_api_keys', COUNT(*) FROM partner_api_keys
UNION ALL SELECT 'core_ots_proofs', COUNT(*) FROM core_ots_proofs
UNION ALL SELECT 'pages', COUNT(*) FROM pages
UNION ALL SELECT 'page_origin_hashes', COUNT(*) FROM page_origin_hashes
UNION ALL SELECT 'witnesses', COUNT(*) FROM witnesses;
```

Sla output op als `backup/row-counts-dag1.txt` — dit is je verificatiebasis.

### 3B — Origin attestations exporteren

In huidig project (Run SQL):

```sql
SELECT 
  'INSERT INTO origin_attestations (origin_id, hash, hash_algo, captured_at, created_at, api_key_prefix) VALUES (''' ||
  origin_id || ''', ''' || hash || ''', ''' || hash_algo || ''', ''' ||
  captured_at::text || ''', ''' || created_at::text || ''', ' ||
  COALESCE('''' || api_key_prefix || '''', 'NULL') || ');'
FROM origin_attestations
ORDER BY created_at;
```

Sla op als `backup/attestations-insert-dag1.sql`

Plak in nieuw project (Run SQL op `ubcqdjaytlxjqtinlzhi`).

**Verificeer:**
```sql
-- In NIEUW project — moet matchen met baseline
SELECT COUNT(*) FROM origin_attestations;
```

### 3C — Partner API keys exporteren

In huidig project (Run SQL):

```sql
SELECT 
  'INSERT INTO partner_api_keys (id, partner_name, key_prefix, key_hash, rate_limit_tier, issued_at, issued_by, revoked_at) VALUES (''' ||
  id || ''', ''' || partner_name || ''', ''' || key_prefix || ''', ''' || key_hash || ''', ''' ||
  rate_limit_tier || ''', ''' || issued_at::text || ''', ' ||
  COALESCE('''' || issued_by || '''', 'NULL') || ', ' ||
  COALESCE('''' || revoked_at::text || '''', 'NULL') || ');'
FROM partner_api_keys
ORDER BY issued_at;
```

Sla op als `backup/partner-keys-insert-dag1.sql`

Plak in nieuw project.

**Verificeer:**
```sql
-- In NIEUW project — moet 3 actieve keys tonen
SELECT key_prefix, partner_name, rate_limit_tier, revoked_at 
FROM partner_api_keys 
WHERE revoked_at IS NULL;
```

### 3D — OTS Proofs exporteren (via API — NIET via SQL voor bytea)

```bash
PARTNER_KEY="[EEN VAN DE 3 ACTIEVE KEYS]"

curl -H "X-API-Key: $PARTNER_KEY" \
  "https://core.umarise.com/functions/v1/v1-core-proofs-export?status=anchored&limit=1000" \
  > backup/ots-proofs-anchored-dag1.json

curl -H "X-API-Key: $PARTNER_KEY" \
  "https://core.umarise.com/functions/v1/v1-core-proofs-export?status=pending&limit=1000" \
  > backup/ots-proofs-pending-dag1.json
```

> ℹ️ OTS proof import in nieuw project via import script — zie hoofddocument Stap 2.3.

### 3E — Companion data (afhankelijk van support antwoord)

**Als grace period bevestigd:**  
→ Exporteer `pages`, `page_origin_hashes`, `witnesses` via Supabase dashboard CSV export na Disable Cloud.

**Als geen grace period of bewust schone start:**  
→ Sla dit blok over. Pages zijn device-gebonden; gebruikers hersealen. Images staan in Hetzner Storage en blijven bereikbaar.

---

## BLOK 4 — Edge Functions deployen (± 30 min)

```bash
# Deploy alle functions naar nieuw project
supabase functions deploy --project-ref ubcqdjaytlxjqtinlzhi

# Als bulk deploy problemen geeft, per functie:
for fn in v1-core-health v1-core-origins v1-core-resolve v1-core-verify \
           v1-core-proof v1-core-origins-proof v1-core-proofs-export \
           v1-core-origins-export v1-internal-metrics v1-internal-partner-create \
           companion-origins companion-resolve companion-verify companion-data \
           analyze-page analyze-patterns analyze-personality \
           generate-embeddings generate-memory-summary generate-personality-art \
           generate-recommendations generate-share-content generate-year-reflection \
           search-pages hetzner-ai-proxy hetzner-health hetzner-storage-proxy \
           origin-image-proxy resolve-origin notify-ots-complete \
           migrate-legacy-pages health-check-cron api-support-chat; do
  echo "Deploying $fn..."
  supabase functions deploy $fn --project-ref ubcqdjaytlxjqtinlzhi
done
```

**Verificeer:** Ga naar dashboard → Edge Functions — alle functions moeten zichtbaar zijn.

---

## BLOK 5 — Smoke tests (± 1 uur)

```bash
NEW_BASE="https://ubcqdjaytlxjqtinlzhi.supabase.co/functions/v1"
PARTNER_KEY="[EEN VAN DE 3 ACTIEVE PARTNER KEYS]"

echo "=== Test 1: Health check ==="
curl -s "$NEW_BASE/v1-core-health" | jq .
# Verwacht: {"status":"ok","database":"ok"}

echo "=== Test 2: Resolve bestaande attestation ==="
KNOWN_ORIGIN_ID="[PLAK EEN BEKENDE ORIGIN_ID UIT BASELINE]"
curl -s "$NEW_BASE/v1-core-resolve?origin_id=$KNOWN_ORIGIN_ID" | jq .
# Verwacht: origin_id, hash, captured_at

echo "=== Test 3: Verify bestaande hash ==="
KNOWN_HASH="[PLAK EEN BEKENDE HASH UIT BASELINE]"
curl -s -X POST "$NEW_BASE/v1-core-verify" \
  -H "Content-Type: application/json" \
  -d "{\"hash\":\"$KNOWN_HASH\"}" | jq .
# Verwacht: {"verified":true,"origin_id":"..."}

echo "=== Test 4: Nieuwe attestatie aanmaken ==="
TEST_HASH=$(echo -n "smoke-test-dag1-$(date)" | sha256sum | awk '{print $1}')
curl -s -X POST "$NEW_BASE/v1-core-origins" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PARTNER_KEY" \
  -d "{\"hash\":\"$TEST_HASH\",\"captured_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" | jq .
# Verwacht: {"origin_id":"...","hash":"..."}

echo "=== Test 5: OTS proof opvragen ==="
curl -s "$NEW_BASE/v1-core-proof?origin_id=$KNOWN_ORIGIN_ID" | jq .

echo "=== Test 6: Metrics endpoint ==="
NEW_INTERNAL_SECRET="[NIEUWE INTERNAL_API_SECRET UIT STAP 2]"
curl -s -H "X-Internal-Secret: $NEW_INTERNAL_SECRET" \
  "$NEW_BASE/v1-internal-metrics" | jq .
# Verwacht: stats object

echo "=== Test 7: Rate limit check ==="
for i in {1..5}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" "$NEW_BASE/v1-core-health"
done
# Verwacht: allemaal 200
```

**✅ Alleen doorgaan naar Blok 6 als ALLE 7 tests slagen.**  
**❌ Als een test faalt — stop en debug voor je verder gaat.**

---

## BLOK 6 — OTS Worker herconfigureren (± 30 min)

```bash
# Verbind via SSH
ssh hetzner  # alias voor ssh jonna@[hetzner-ip]

# Navigeer naar worker
cd /opt/umarise/ots-worker/

# Backup huidige config
sudo cp .env .env.backup.$(date +%Y%m%d)

# Bekijk huidige config
sudo cat .env

# Update config
sudo nano .env
# Wijzig:
#   SUPABASE_URL=https://ubcqdjaytlxjqtinlzhi.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=[NIEUWE SERVICE ROLE KEY]
```

**Monitor bij eerstvolgende cron-run:**
```bash
tail -f /var/log/umarise-ots.log
# Cron runs: elke 30 min (upgrade) en elk uur (stamp)
# Verwacht: verbindingsbevestiging naar ubcqdjaytlxjqtinlzhi
```

---

## BLOK 7 — DNS Cutover (pas als ALLES hierboven ✅ is)

> ⚠️ Dit is het point of no return. Doe dit alleen als alle vorige blokken volledig geslaagd zijn.

### 24 uur van tevoren (dus vandaag doen als je morgen cutover wilt):
→ Cloudflare Dashboard → umarise.com → DNS → `core` CNAME → verlaag TTL naar **60 seconden**

### Op het moment van cutover:
1. Ga naar Cloudflare Dashboard → umarise.com → DNS
2. Zoek CNAME record voor `core`
3. Wijzig target naar: `ubcqdjaytlxjqtinlzhi.supabase.co`
4. Noteer exact tijdstip

### Verificeer na cutover (wacht ± 60 sec op propagatie):
```bash
curl -s "https://core.umarise.com/functions/v1/v1-core-health" | jq .
# Moet {"status":"ok",...} teruggeven van nieuw project
```

### Rollback (als iets fout gaat):
```bash
# Cloudflare: CNAME terug naar lppltmdtiypbfzlszhhb.supabase.co
# Propagatie: 60 seconden
```

---

## BLOK 8 — Afronding

- [ ] Disable Cloud uitvoeren (na bevestiging grace period aanpak)
- [ ] Partners informeren: Acme Corp, Summer Corp — geen actie vereist, keys blijven geldig
- [ ] Interne communicatie: nieuwe `INTERNAL_API_SECRET` doorgeven aan teamleden
- [ ] UptimeRobot instellen op `https://core.umarise.com/functions/v1/v1-core-health` (elke 5 min)
- [ ] Row counts verifiëren in nieuw project vs `backup/row-counts-dag1.txt`

---

## Rollback overzicht

| Moment | Actie | Tijd |
|---|---|---|
| Na Blok 6 (Worker) | `sudo cp .env.backup.DATUM .env` | 2 min |
| Na Blok 7 (DNS) | Cloudflare CNAME terug naar `lppltmdtiypbfzlszhhb` | 60 sec |
| Blokken 1-5 | Geen rollback nodig — huidig project onveranderd | — |

---

## Noodcontact

Bij blokkering of twijfel: stop direct, rollback DNS, en evalueer voor je verder gaat.  
**Nooit data migratie overslaan en direct naar DNS cutover.**

---

*Bijgewerkt: 18 februari 2026*
