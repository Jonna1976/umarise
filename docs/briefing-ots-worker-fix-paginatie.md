# Briefing: OTS Worker fix — paginatie in getUnstampedAttestations

## Probleem

De OTS worker op Hetzner (`/opt/umarise/ots-worker/worker.js`) gebruikt
een Supabase query die maximaal 1000 rijen retourneert. Attestaties boven
de 1000 worden nooit gezien door de worker.

Dit heeft ertoe geleid dat 2304 attestaties sinds 15 februari geen proof
hadden. De worker meldde "No unstamped attestations" terwijl er duizenden
waren. Acute fix is handmatig gedraaid (patch-worker.js). Structurele
fix moet in worker.js zelf.

## Oorzaak

In `worker.js`, functie `getUnstampedAttestations()` (rond regel 305):

```javascript
// PROBLEEM: Supabase retourneert max 1000 rijen
var r1 = await supabase.from('core_ots_proofs').select('origin_id');
// → retourneert max 1000, ook al zijn er meer

var r2 = await supabase
  .from('origin_attestations')
  .select('origin_id, hash')
  .order('captured_at', { ascending: true })
  .limit(5000);  // was config.batchSize * 3, nu 5000
// → retourneert max 1000, ongeacht .limit()
```

Beide queries raken de Supabase 1000-rij limiet. De worker vergelijkt
twee onvolledige lijsten en concludeert ten onrechte dat alles gestampt is.

## Fix

Vervang `getUnstampedAttestations()` door een versie die pagineert:

```javascript
async function getAllPages(table, select, orderCol) {
  var all = [];
  var offset = 0;
  while (true) {
    var q = supabase.from(table).select(select).range(offset, offset + 999);
    if (orderCol) q = q.order(orderCol, { ascending: true });
    var r = await q;
    if (!r.data || r.data.length === 0) break;
    all = all.concat(r.data);
    offset += 1000;
  }
  return all;
}

async function getUnstampedAttestations() {
  var proofs = await getAllPages('core_ots_proofs', 'origin_id');
  if (!proofs) { log.error('Proof fetch error'); return []; }
  var proofIds = new Set(proofs.map(function(p) { return p.origin_id; }));

  var atts = await getAllPages('origin_attestations', 'origin_id, hash', 'captured_at');
  if (!atts) { log.error('Attestation fetch error'); return []; }

  return atts
    .filter(function(a) { return !proofIds.has(a.origin_id); })
    .slice(0, config.batchSize);
}
```

## Tweede fix: resolve endpoint `proof_status`

Al doorgevoerd door Lovable (17 feb):
- `/v1-core-resolve` retourneert nu `proof_status`, `proof_url`,
  `bitcoin_block_height`, `anchored_at`
- Default `proof_status` bij geen proof-rij: `"pending"` (consistent met verify)
- `proof_url` gebruikt `https://core.umarise.com/v1-core-proof?...`
  (geen interne Supabase URLs)

## Wat NIET verandert

- API endpoints (C10: frozen)
- Stamp/upgrade logica (alleen de query die attestaties vindt)
- Batch size (100 per run)
- Cron schedule (elk uur stamp, elke 30 min upgrade)

## Verificatie na fix

```bash
# Op Hetzner:
node worker.js status
# → "Without proof: 0"

# Na nieuwe attestatie via API:
node worker.js stamp
# → "Found 1 unstamped attestation(s)"
# → "Stored 1 pending proof(s)"
```

## Toekomstige verbetering (niet nu)

Monitoring alert: als "attestaties zonder proof > 0" langer dan 2 uur
duurt, stuur notificatie. Voorkomt dat dit probleem ongemerkt terugkeert.
