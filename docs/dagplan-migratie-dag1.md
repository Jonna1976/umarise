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
- [ ] `INTERNAL_API_SECRET` wordt geroteerd in Blok 2 (was gecompromitteerd in chat — NIET de service role key)
- [ ] Service role key: nieuw project heeft sowieso een eigen service role key — **geen rotatie nodig van het huidige project**
- [ ] Supabase CLI geïnstalleerd (`supabase --version`)
- [ ] Toegang tot huidige Lovable Cloud project (voor secret waarden)
- [ ] Terminal open in project root (waar `supabase/` map staat)

> ℹ️ **Service role key:** Het nieuwe project `ubcqdjaytlxjqtinlzhi` heeft sowieso een eigen service role key. Geen rotatie nodig van het huidige project — die gebruik je na migratie niet meer.

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

### 1D — DDL Event Trigger (besluit gedocumenteerd)

> ℹ️ **Bewuste keuze:** De `log_ddl_event` event trigger vereist superuser rechten en werkt niet via `supabase db push`. Opties:
> - **A (aanbevolen voor nu):** Bewust uitgesteld — Core schema is frozen, DDL audit is geen blocker voor migratie.
> - **B (indien gewenst):** Support ticket indienen bij Supabase met de SQL uit het hoofddocument (Stap 1.4).
> 
> Noteer hier welke keuze gemaakt is: `[ ] Uitgesteld` / `[ ] Support ticket #______`

---

## BLOK 2 — Secrets instellen (± 30 min)

Haal de huidige secret waarden op via Lovable Cloud project settings. Stel ze in op het nieuwe project:

```bash
# KERN: CORE_API_SECRET moet IDENTIEK zijn aan het huidige project
# Alle test-key hashes (Paul, Jonna, Cryptograaf) zijn hierop gebaseerd
supabase secrets set CORE_API_SECRET="[HAAL OP UIT HUIDIG PROJECT]" \
  --project-ref ubcqdjaytlxjqtinlzhi

# NIEUW genereren — de oude INTERNAL_API_SECRET is gecompromitteerd in chat
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
UNION ALL SELECT 'core_ots_proofs', COUNT(*) FROM core_ots_proofs
UNION ALL SELECT 'partner_api_keys', COUNT(*) FROM partner_api_keys
UNION ALL SELECT 'pages', COUNT(*) FROM pages
UNION ALL SELECT 'page_origin_hashes', COUNT(*) FROM page_origin_hashes
UNION ALL SELECT 'witnesses', COUNT(*) FROM witnesses;
```

Sla output op als `backup/row-counts-dag1.txt` — dit is je verificatiebasis.

### 3B — Origin attestations exporteren

In huidig project (Run SQL):

```sql
SELECT 
  'INSERT INTO origin_attestations (origin_id, hash, hash_algo, captured_at, created_at, api_key_prefix) VALUES (' ||
  quote_literal(origin_id) || ', ' ||
  quote_literal(hash) || ', ' ||
  quote_literal(hash_algo) || ', ' ||
  quote_literal(captured_at) || ', ' ||
  quote_literal(created_at) || ', ' ||
  quote_nullable(api_key_prefix) || ');'
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

### 3C — Partner API Keys exporteren (test-keys: Paul, Jonna, Cryptograaf)

> ℹ️ Er zijn geen externe partners, maar de drie test-keys (`Paul_API_Key`, `Jonna_API_Key`, `Cryptograaf_API_Key`) moeten mee. Zonder deze keys kun je na migratie niet verifiëren dat `CORE_API_SECRET` portabiliteit werkt.

In huidig project (Run SQL):

```sql
SELECT 
  'INSERT INTO partner_api_keys (id, partner_name, key_prefix, key_hash, rate_limit_tier, issued_at, issued_by, revoked_at) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(partner_name) || ', ' ||
  quote_literal(key_prefix) || ', ' ||
  quote_literal(key_hash) || ', ' ||
  quote_literal(rate_limit_tier) || ', ' ||
  quote_literal(issued_at) || ', ' ||
  quote_nullable(issued_by) || ', ' ||
  quote_nullable(revoked_at) || ');'
FROM partner_api_keys
ORDER BY issued_at;
```

Sla op als `backup/partner-keys-insert-dag1.sql`

Plak in nieuw project (Run SQL op `ubcqdjaytlxjqtinlzhi`).

**Verificeer:**
```sql
-- In NIEUW project — 3 actieve test-keys
SELECT key_prefix, partner_name, rate_limit_tier, revoked_at 
FROM partner_api_keys 
WHERE revoked_at IS NULL;
```

### 3D — OTS Proofs exporteren (via API — NIET via SQL voor bytea)

```bash
# ⚠️ API key vereist — gebruik een van de drie test-keys
PARTNER_KEY="[EEN VAN DE 3 TEST-KEYS: Paul/Jonna/Cryptograaf]"

curl -s \
  -H "X-API-Key: $PARTNER_KEY" \
  "https://core.umarise.com/functions/v1/v1-core-proofs-export?status=anchored&limit=1000" \
  > backup/ots-proofs-anchored-dag1.json

curl -s \
  -H "X-API-Key: $PARTNER_KEY" \
  "https://core.umarise.com/functions/v1/v1-core-proofs-export?status=pending&limit=1000" \
  > backup/ots-proofs-pending-dag1.json
```

**Verificeer output:**
```bash
cat backup/ots-proofs-anchored-dag1.json | jq '.proofs | length'
# Moet > 0 zijn als er anchored proofs zijn
```

### 3E — OTS Proofs importeren in nieuw project

Maak het import script aan (eenmalig):

```javascript
// scripts/import-ots-proofs.js
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('backup/ots-proofs-anchored-dag1.json'));
const inserts = data.proofs.map(p => 
  `INSERT INTO core_ots_proofs (origin_id, ots_proof, status, bitcoin_block_height, anchored_at) 
   VALUES ('${p.origin_id}', decode('${Buffer.from(p.ots_proof, 'base64').toString('hex')}', 'hex'), '${p.proof_status}', ${p.bitcoin_block_height || 'NULL'}, ${p.anchored_at ? `'${p.anchored_at}'` : 'NULL'});`
);
fs.writeFileSync('backup/ots-inserts-dag1.sql', inserts.join('\n'));
console.log(`Gegenereerd: ${inserts.length} inserts`);
```

Uitvoeren:
```bash
node scripts/import-ots-proofs.js
# → genereert backup/ots-inserts-dag1.sql
```

Plak `backup/ots-inserts-dag1.sql` in nieuw project (Run SQL op `ubcqdjaytlxjqtinlzhi`).

**Verificeer:**
```sql
SELECT COUNT(*), status FROM core_ots_proofs GROUP BY status;
-- Moet matchen met baseline
```

### 3F — Restore test → zie Dag -1 Pre-flight

> ℹ️ **Bewuste keuze:** De restore test vereist wachten op een daily backup (8–24 uur). Dit hoort thuis in de pre-flight voorbereiding, niet op migratiedag zelf.
>
> **Voer Blok 3F uit op Dag -1 (dag vóór de migratie):**
>
> **Stap 1:** Maak test-record aan in NIEUW project
> ```sql
> INSERT INTO origin_attestations (hash, hash_algo, captured_at) 
> VALUES ('restore-test-' || extract(epoch from now()), 'sha256', now())
> RETURNING origin_id;
> -- Noteer de origin_id
> ```
>
> **Stap 2:** Wacht op daily backup — check via dashboard → `ubcqdjaytlxjqtinlzhi` → Settings → Backups tot backup van ná aanmaken zichtbaar is.
>
> **Stap 3:** Verwijder test-record (triggers tijdelijk disablen i.v.m. immutability guard):
> ```sql
> ALTER TABLE origin_attestations DISABLE TRIGGER ALL;
> DELETE FROM origin_attestations WHERE origin_id = '[GENOTEERDE_ID]';
> ALTER TABLE origin_attestations ENABLE TRIGGER ALL;
> ```
>
> **Stap 4:** Restore via dashboard → Backups → selecteer backup van vóór de delete → Restore.
>
> **Stap 5:** Verify:
> ```sql
> SELECT * FROM origin_attestations WHERE origin_id = '[GENOTEERDE_ID]';
> -- Record moet terug zijn
> ```
>
> ✅ **Record terug** → restore werkt → Dag 1 migratie is go.  
> ❌ **Record niet terug** → restore werkt niet → **stop, los op voor DNS cutover.**
>
> > ℹ️ **PITR — bewuste keuze:** Point-in-Time Recovery wordt uitgesteld. Bij 323 records, geen betalende klanten, en dagelijkse onafhankelijke export naar Hetzner volstaat daily backup voor de testfase. PITR activeren zodra eerste echte partnervolume live gaat.

### 3G — Companion data (afhankelijk van support antwoord)

**Als grace period bevestigd:**  
→ Exporteer `pages`, `page_origin_hashes`, `witnesses` via dashboard CSV export **vóór** Disable Cloud — tijdens de grace period terwijl het dashboard nog toegankelijk is. **Nooit ná Disable Cloud**: dan is toegang onzeker.

**Als geen grace period of bewust schone start:**  
→ Sla dit blok over. Pages zijn device-gebonden; gebruikers hersealen. Images staan in Hetzner Storage en blijven bereikbaar.

---

## BLOK 4 — Edge Functions deployen (± 30 min)

> 📋 **Referentie:** Zie [`docs/edge-functions-overview.md`](edge-functions-overview.md) voor een volledig overzicht per categorie (Core, Attestation, Companion, Internal, Infrastructure, Stripe, AI Proxy) en de 10 deprecated functies.

```bash
# Deploy alle functions naar nieuw project
supabase functions deploy --project-ref ubcqdjaytlxjqtinlzhi

# Als bulk deploy problemen geeft, per functie:
# ⚠️ 10 AI/Companion functies zijn DEPRECATED (maart 2026) en worden NIET gedeployed:
#    analyze-page, analyze-patterns, analyze-personality,
#    generate-embeddings, generate-memory-summary, generate-personality-art,
#    generate-recommendations, generate-share-content, generate-year-reflection,
#    api-support-chat
# Zie: docs/core-vs-companion.md

for fn in v1-core-health v1-core-origins v1-core-resolve v1-core-verify \
           v1-core-proof v1-core-origins-proof v1-core-proofs-export \
           v1-core-origins-export v1-internal-metrics v1-internal-partner-create \
           v1-internal-webhook-dispatch v1-stripe-credit-webhook \
           v1-attestation-checkout v1-attestation-confirm v1-attestation-request \
           v1-attestation-verify v1-attestation-webhook \
           companion-origins companion-resolve companion-verify companion-data \
           search-pages hetzner-ai-proxy hetzner-health hetzner-storage-proxy \
           origin-image-proxy resolve-origin notify-ots-complete \
           migrate-legacy-pages health-check-cron internal-e2e-test \
           internal-generate-partner-key; do
  echo "Deploying $fn..."
  supabase functions deploy $fn --project-ref ubcqdjaytlxjqtinlzhi
done
```

**Verificeer:** Ga naar dashboard → Edge Functions — alle functions moeten zichtbaar zijn.

---

## BLOK 5 — Smoke tests (± 1 uur)

```bash
NEW_BASE="https://ubcqdjaytlxjqtinlzhi.supabase.co/functions/v1"
PARTNER_KEY="[EEN VAN DE 3 TEST-KEYS — Paul/Jonna/Cryptograaf]"
NEW_INTERNAL_SECRET="[NIEUWE INTERNAL_API_SECRET UIT BLOK 2]"

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

echo "=== Test 4: Nieuwe attestatie aanmaken (test API key auth + CORE_API_SECRET portabiliteit) ==="
TEST_HASH=$(echo -n "smoke-test-dag1-$(date)" | sha256sum | awk '{print $1}')
curl -s -X POST "$NEW_BASE/v1-core-origins" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $PARTNER_KEY" \
  -d "{\"hash\":\"$TEST_HASH\",\"captured_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" | jq .
# Verwacht: {"origin_id":"...","hash":"..."}

echo "=== Test 5: OTS proof opvragen ==="
curl -s "$NEW_BASE/v1-core-proof?origin_id=$KNOWN_ORIGIN_ID" | jq .
# Verwacht: proof data of {"error":{"code":"NOT_FOUND",...}} als pending

echo "=== Test 6: Metrics endpoint ==="
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
#   SUPABASE_SERVICE_ROLE_KEY=[SERVICE ROLE KEY VAN NIEUW PROJECT]
```

**Monitor bij eerstvolgende cron-run:**
```bash
tail -f /var/log/umarise-ots.log
# Cron runs: elke 30 min (upgrade) en elk uur (stamp)
# Verwacht: verbindingsbevestiging naar ubcqdjaytlxjqtinlzhi
```

---

## BLOK 7 — DNS Cutover (pas als ALLES hierboven ✅ is)

> ✅ **Dit is terugdraaibaar.** Cloudflare CNAME rollback = 60 seconden. DNS cutover is GEEN point of no return.  
> ⚠️ **Point of no return = Blok 8 (Disable Cloud).** Dat doe je pas na 24 uur stabiele monitoring.

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
# Geen data verlies — beide projecten draaiden parallel
```

---

## BLOK 8 — Monitoring & Afronding (24 uur na Blok 7)

> ⚠️ **Dit is het echte point of no return.** Disable Cloud is onomkeerbaar.  
> **Vereiste:** 24 uur stabiele monitoring na DNS cutover. Geen errors, OTS worker schrijft naar nieuw project, health checks groen.

### Go/No-Go criteria (na 24 uur):
- [ ] `https://core.umarise.com/functions/v1/v1-core-health` groen (elke check in UptimeRobot)
- [ ] OTS worker logs tonen schrijfacties naar `ubcqdjaytlxjqtinlzhi`
- [ ] Geen 5xx errors in Supabase dashboard logs nieuw project
- [ ] Row counts nieuw project matchen met `backup/row-counts-dag1.txt`
- [ ] Test-keys (Paul, Jonna, Cryptograaf) succesvol gebruikt voor attestaties

### Na go-beslissing:
- [ ] Disable Cloud uitvoeren via Settings → Connectors → Lovable Cloud → Disable
- [ ] Interne communicatie: nieuwe `INTERNAL_API_SECRET` doorgeven aan teamleden
- [ ] UptimeRobot instellen op `https://core.umarise.com/functions/v1/v1-core-health` (elke 5 min)
- [ ] Hetzner dagelijkse export instellen als onafhankelijke backup

> ℹ️ **Geen externe partners.** Drie test-keys (Paul, Jonna, Cryptograaf) zijn gemigreerd en gevalideerd in Blok 5. Nieuwe externe partner keys worden aangemaakt via `v1-internal-partner-create` zodra eerste partner live gaat.

---

## Rollback overzicht

| Moment | Actie | Tijd | Onomkeerbaar? |
|---|---|---|---|
| Blokken 1-5 | Geen rollback nodig — huidig project onveranderd | — | Nee |
| Na Blok 6 (Worker) | `sudo cp .env.backup.DATUM .env` | 2 min | Nee |
| Na Blok 7 (DNS) | Cloudflare CNAME terug naar `lppltmdtiypbfzlszhhb` | 60 sec | Nee |
| Blok 8 (Disable Cloud) | **Geen rollback mogelijk** | — | ✅ JA |

---

## Open vraag — data export huidig project

> ⚠️ **Blokkeert Blok 3G (Companion data).** Wacht op Support antwoord.

**A)** Geen directe Postgres connection string beschikbaar → enige opties zijn CSV via dashboard (grace period) of API-exports.  
**B)** Directe connection string wél beschikbaar → `pg_dump` mogelijk.

**Antwoord Support:** [invullen]  
**Grace period duur:** [invullen]  
**Dashboard beschikbaar tijdens grace period?** [invullen]

---

## Noodcontact

Bij blokkering of twijfel: **stop direct, rollback DNS (60 sec), en evalueer voor je verder gaat.**  
**Nooit Disable Cloud uitvoeren als er twijfel is — dit is onomkeerbaar.**

---

*Bijgewerkt: 19 februari 2026 — verwerkt feedbackpunten 1-10*
