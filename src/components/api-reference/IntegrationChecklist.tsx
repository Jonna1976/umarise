import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'umarise-checklist-v3';

const BASE = 'https://core.umarise.com';

interface ChecklistItem {
  label: string;
  detail: string;
  quickStartDone?: boolean;
}

interface ChecklistGroup {
  title: string;
  stepOffset: number;
  items: ChecklistItem[];
}

const CHECKLIST: ChecklistGroup[] = [
  {
    title: 'Setup',
    stepOffset: 1,
    items: [
      {
        label: 'API key ontvangen van partners@umarise.com',
        detail: 'Mail partners@umarise.com met je bedrijfsnaam en use case. Reactie binnen 24 uur. Je ontvangt een key die begint met um_...',
      },
      {
        label: 'Quick Start doorlopen: health, attest, resolve, verify',
        detail: `Beschikbaar bovenaan deze pagina. Vier curl-commando\'s. 60 seconden.\n→ /api-reference → Quick Start`,
        quickStartDone: true,
      },
      {
        label: 'Health check gaf "operational"',
        detail: `Gedaan tijdens Quick Start stap 1.\ncurl ${BASE}/v1-core-health`,
        quickStartDone: true,
      },
      {
        label: 'Eerste test-attestatie aangemaakt, origin_id ontvangen',
        detail: `Gedaan tijdens Quick Start stap 2.\ncurl -X POST ${BASE}/v1-core-origins -H 'Content-Type: application/json' -H 'X-API-Key: YOUR_KEY' -d '{"hash":"sha256:YOUR_HASH"}'`,
        quickStartDone: true,
      },
      {
        label: '10–20 minuten gewacht, proof_status veranderd van "pending" naar "anchored"',
        detail: `Herhaal Quick Start stap 3 na 10–20 minuten. Zodra proof_status "anchored" is, is het bewijs onafhankelijk verifieerbaar via Bitcoin.\ncurl '${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID'`,
      },
    ],
  },
  {
    title: 'Verificatie',
    stepOffset: 6,
    items: [
      {
        label: 'Hash geverifieerd via POST /v1-core-verify — match bevestigd',
        detail: `Gedaan tijdens Quick Start stap 4.\ncurl -X POST ${BASE}/v1-core-verify -H 'Content-Type: application/json' -d '{"hash":"sha256:YOUR_HASH"}'`,
        quickStartDone: true,
      },
      {
        label: 'Origin opgehaald via GET /v1-core-resolve — record ontvangen',
        detail: `Gedaan tijdens Quick Start stap 3.\ncurl '${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID'`,
        quickStartDone: true,
      },
      {
        label: '.ots proof gedownload via GET /v1-core-proof',
        detail: `curl '${BASE}/v1-core-origins-proof?origin_id=YOUR_ORIGIN_ID' -o proof.ots\nDit downloadt het binaire OpenTimestamps proof-bestand voor onafhankelijke Bitcoin-verificatie.`,
      },
      {
        label: 'Verificatie getest via umarise.com/verify (online)',
        detail: 'Upload een bestand of plak een SHA-256 hash. De pagina toont of er een attestatie bestaat en de huidige status.\n→ https://umarise.com/verify',
      },
      {
        label: 'Verificatie getest via CLI (verify-anchor.sh of .py)',
        detail: 'Download: verify-anchor.sh of verify-anchor.py vanuit /reviewer.\nRun: bash verify-anchor.sh proof.ots\nof: python verify-anchor.py proof.ots\nDeze scripts verifiëren het Bitcoin-anker onafhankelijk, zonder Umarise-infrastructuur.',
      },
      {
        label: 'Eigen bestand geverifieerd (niet de test-hash)',
        detail: 'Hash je eigen bestand:\n  sha256sum your-file.pdf (Linux)\n  shasum -a 256 your-file.pdf (macOS)\nMaak een attestatie aan met die hash via Quick Start stap 2. Wacht op "anchored", download .ots, verifieer via CLI of /verify.',
      },
    ],
  },
  {
    title: 'SDK Integratie',
    stepOffset: 12,
    items: [
      {
        label: 'SDK gedownload en geïnstalleerd',
        detail: 'Node.js: download umarise-integration.js vanuit /api-reference → Templates.\n  const um = require(\'./umarise-integration.js\')\nPython: download umarise_integration.py vanuit /api-reference → Templates.\n  import umarise_integration as umarise',
      },
      {
        label: 'SDK health() call succesvol',
        detail: 'Node: const status = await health()\nPython: status = health()\nVerwacht: { "status": "operational", "version": "v1" }',
      },
      {
        label: 'SDK attest() call succesvol met eigen bestand',
        detail: 'Hash eerst je bestand:\n  Node: crypto.createHash(\'sha256\').update(buffer).digest(\'hex\')\n  Python: hashlib.sha256(data).hexdigest()\nDan: const result = await attest(hash)\nof: result = attest(hash)',
      },
      {
        label: 'SDK verify() call succesvol — match bevestigd',
        detail: 'const result = await verify(hash)\nVerwacht: origin record met proof_status.',
      },
      {
        label: 'SDK resolve() call succesvol — record opgehaald',
        detail: 'const result = await resolve(origin_id)\nVerwacht: volledig origin record.',
      },
      {
        label: 'origin_id opslag gekoppeld aan eigen systeem',
        detail: 'Sla origin_id op naast je eigen record. Voorbeeld:\n  db.submissions.update(id, { origin_id: result.origin_id })\nof voeg een origin_id kolom toe aan je submissions/uploads tabel.\nDit is de link tussen jouw systeem en het onafhankelijke bewijs.',
      },
    ],
  },
  {
    title: 'Productie-gereedheid',
    stepOffset: 18,
    items: [
      {
        label: 'SHA-256 hash-berekening geïntegreerd in submission workflow',
        detail: 'Bereken de hash van het volledige bestand (inclusief metadata, niet alleen content). Doe dit op het moment van upload/submit/ingest.',
      },
      {
        label: 'API call gekoppeld aan eigen trigger (upload, submit, ingest)',
        detail: 'Eén SDK call per event. Na succesvolle upload: attest(hash). Sla origin_id op bij het record.',
      },
      {
        label: 'origin_id opgeslagen bij eigen record (database veld)',
        detail: 'Controleer: kun je voor elk record in je systeem het bijbehorende origin_id opzoeken? Zo ja: klaar.',
      },
      {
        label: 'Foutafhandeling geïmplementeerd',
        detail: 'Timeout: stel 10 seconden in. Bij timeout: retry na 60 seconden.\nRate limit (429): lees retry_after_seconds uit response, wacht, retry.\nServer error (500): retry na 60 seconden, max 3 pogingen.\nUnauthorized (401): controleer API key, neem contact op met partners@umarise.com.\nVolledige error codes en rate limits: /api-reference → Error Codes sectie.',
      },
      {
        label: 'Fallback-strategie bepaald: wat als API tijdelijk onbereikbaar is?',
        detail: 'Optie A: hash lokaal in queue plaatsen, automatisch retry na 60 seconden (aanbevolen — geen attestatie gaat verloren).\nOptie B: log de fout, ga door zonder attestatie, rapporteer gemiste attestaties in een dagelijks overzicht.\nKies er één en implementeer. Welke past hangt af van hoe kritisch attestatie is in je workflow.',
      },
      {
        label: 'Verificatiepad getest met echt bestand uit eigen systeem',
        detail: 'Neem één echt bestand uit je productie-workflow. Doorloop het volledige pad: hash → attest → wacht op anchored → resolve → verify → download .ots → verifieer via CLI.\nAls dit pad werkt met een echt bestand: je integratie is correct.',
      },
      {
        label: 'Klaar voor productie',
        detail: 'Minimaal één echt bestand uit je productie-workflow heeft het volledige pad doorlopen (hash → attest → anchored → verify → .ots download → CLI verificatie). Alles groen? Productie.',
      },
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST.reduce((sum, g) => sum + g.items.length, 0);

function ItemDetail({ detail }: { detail: string }) {
  return (
    <pre className="mt-2 ml-7 text-[11px] font-mono text-[hsl(var(--landing-cream)/0.6)] whitespace-pre-wrap leading-relaxed bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-3">
      {detail}
    </pre>
  );
}

export default function IntegrationChecklist() {
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
  }, [checked]);

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const toggleExpand = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const completedCount = checked.size;
  const percentage = Math.round((completedCount / TOTAL_ITEMS) * 100);

  return (
    <section id="checklist">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))]">Integratie Checklist</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono">
            {completedCount}/{TOTAL_ITEMS}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--landing-cream)/0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--landing-copper))] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[hsl(var(--landing-cream)/0.45)] text-xs font-mono">{percentage}%</span>
        </div>
      </div>

      <div className="space-y-8">
        {CHECKLIST.map((group) => (
          <div key={group.title}>
            <h4 className="text-[hsl(var(--landing-cream)/0.7)] text-xs font-mono uppercase tracking-wider mb-3">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item, idx) => {
                const isChecked = checked.has(item.label);
                const isExpanded = expanded.has(item.label);
                const stepNum = group.stepOffset + idx;

                return (
                  <div key={item.label}>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggle(item.label)}
                        className="flex items-start gap-3 flex-1 text-left py-1.5 px-2 -mx-2 rounded hover:bg-[hsl(var(--landing-cream)/0.03)] transition-colors group"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-[hsl(var(--landing-cream)/0.25)] group-hover:text-[hsl(var(--landing-cream)/0.45)] shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${isChecked ? 'text-[hsl(var(--landing-cream)/0.45)] line-through' : 'text-[hsl(var(--landing-cream)/0.85)]'}`}>
                          <span className="text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs mr-2">{stepNum}.</span>
                          {item.label}
                          {item.quickStartDone && !isChecked && (
                            <span className="ml-2 text-[10px] font-mono text-emerald-400/60">✓ Gedaan tijdens Quick Start</span>
                          )}
                        </span>
                      </button>
                      <button
                        onClick={(e) => toggleExpand(item.label, e)}
                        className="p-1.5 rounded hover:bg-[hsl(var(--landing-cream)/0.05)] text-[hsl(var(--landing-cream)/0.4)] hover:text-[hsl(var(--landing-cream)/0.7)] transition-colors shrink-0 mt-0.5"
                        title={isExpanded ? 'Inklappen' : 'Toon instructies'}
                      >
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {isExpanded && <ItemDetail detail={item.detail} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[hsl(var(--landing-cream)/0.35)] text-xs font-mono mt-6">
        Voortgang wordt lokaal opgeslagen in je browser.
      </p>
    </section>
  );
}
