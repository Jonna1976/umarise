import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';

const STORAGE_KEY = 'umarise-checklist-v2';

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
        label: 'API key received from partners@umarise.com',
        detail: 'Email partners@umarise.com with your company name and use case. Response within 24 hours. You will receive a key starting with um_...',
      },
      {
        label: 'Quick Start completed: health, attest, resolve, verify',
        detail: `Available at the top of this page. Four curl commands. 60 seconds.\n→ /api-reference → Quick Start`,
        quickStartDone: true,
      },
      {
        label: 'Health check returned "operational"',
        detail: `Done during Quick Start step 1.\ncurl ${BASE}/v1-core-health`,
        quickStartDone: true,
      },
      {
        label: 'First test attestation created, origin_id received',
        detail: `Done during Quick Start step 2.\ncurl -X POST ${BASE}/v1-core-origins -H 'Content-Type: application/json' -H 'X-API-Key: YOUR_KEY' -d '{"hash":"sha256:YOUR_HASH"}'`,
        quickStartDone: true,
      },
      {
        label: 'Waited 10–20 minutes, proof_status changed from "pending" to "anchored"',
        detail: `Repeat Quick Start step 3 after 10–20 minutes. Once proof_status is "anchored", the proof is independently verifiable via Bitcoin.\ncurl '${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID'`,
      },
    ],
  },
  {
    title: 'Verification',
    stepOffset: 6,
    items: [
      {
        label: 'Hash verified via POST /v1-core-verify — match confirmed',
        detail: `Done during Quick Start step 4.\ncurl -X POST ${BASE}/v1-core-verify -H 'Content-Type: application/json' -d '{"hash":"sha256:YOUR_HASH"}'`,
        quickStartDone: true,
      },
      {
        label: 'Origin resolved via GET /v1-core-resolve — record retrieved',
        detail: `Done during Quick Start step 3.\ncurl '${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID'`,
        quickStartDone: true,
      },
      {
        label: '.ots proof downloaded via GET /v1-core-proof',
        detail: `curl '${BASE}/v1-core-origins-proof?origin_id=YOUR_ORIGIN_ID' -o proof.ots\nThis downloads the binary OpenTimestamps proof file for independent Bitcoin verification.`,
      },
      {
        label: 'Verification tested via umarise.com/verify (online)',
        detail: 'Upload a file or paste a SHA-256 hash. The page shows whether an attestation exists and its current status.\n→ https://umarise.com/verify',
      },
      {
        label: 'Verification tested via CLI (verify-anchor.sh or .py)',
        detail: 'Download: verify-anchor.sh or verify-anchor.py from /reviewer.\nRun: bash verify-anchor.sh proof.ots\nor: python verify-anchor.py proof.ots\nThese scripts verify the Bitcoin anchor independently, without relying on Umarise infrastructure.',
      },
      {
        label: 'Own file verified (not the test hash)',
        detail: 'Hash your own file:\n  sha256sum your-file.pdf (Linux)\n  shasum -a 256 your-file.pdf (macOS)\nCreate an attestation with that hash via Quick Start step 2. Wait for "anchored", download .ots, verify via CLI or /verify.',
      },
    ],
  },
  {
    title: 'SDK Integration',
    stepOffset: 12,
    items: [
      {
        label: 'SDK downloaded and installed',
        detail: 'Node.js: download umarise-core.ts from /docs or GitHub.\n  import { attest, verify, resolve } from \'./umarise-core\'\nPython: download umarise_core.py from /docs or GitHub.\n  from umarise_core import attest, verify, resolve',
      },
      {
        label: 'SDK health() call successful',
        detail: 'Node: const status = await health()\nPython: status = health()\nExpected: { "status": "operational", "version": "v1" }',
      },
      {
        label: 'SDK attest() call successful with own file',
        detail: 'Hash your file first:\n  Node: crypto.createHash(\'sha256\').update(buffer).digest(\'hex\')\n  Python: hashlib.sha256(data).hexdigest()\nThen: const result = await attest(hash)\nor: result = attest(hash)',
      },
      {
        label: 'SDK verify() call successful — match confirmed',
        detail: 'const result = await verify(hash)\nExpected: origin record with proof_status.',
      },
      {
        label: 'SDK resolve() call successful — record retrieved',
        detail: 'const result = await resolve(origin_id)\nExpected: full origin record.',
      },
      {
        label: 'origin_id storage integrated in own system',
        detail: 'Store origin_id alongside your own record. Example:\n  db.submissions.update(id, { origin_id: result.origin_id })\nor add an origin_id column to your submissions/uploads table.\nThis is the link between your system and the independent proof.',
      },
    ],
  },
  {
    title: 'Production Readiness',
    stepOffset: 18,
    items: [
      {
        label: 'SHA-256 hash calculation integrated in submission workflow',
        detail: 'Calculate the hash of the complete file (including metadata, not just content). Do this at the moment of upload/submit/ingest.',
      },
      {
        label: 'API call connected to own trigger (upload, submit, ingest)',
        detail: 'One SDK call per event. After successful upload: attest(hash). Store origin_id with the record.',
      },
      {
        label: 'origin_id stored with own record (database field)',
        detail: 'Verify: can you look up the corresponding origin_id for every record in your system? If yes: done.',
      },
      {
        label: 'Error handling implemented',
        detail: 'Timeout: set 10 seconds. On timeout: retry after 60 seconds.\nRate limit (429): read retry_after_seconds from response, wait, retry.\nServer error (500): retry after 60 seconds, max 3 attempts.\nUnauthorized (401): check API key, contact partners@umarise.com.\nFull error codes and rate limits: /api-reference → Error Codes section.',
      },
      {
        label: 'Fallback strategy defined: what if API is temporarily unavailable?',
        detail: 'Option A: queue hash locally, retry automatically after 60 seconds (recommended — no attestation is lost).\nOption B: log the error, proceed without attestation, report missed attestations in a daily summary.\nChoose one and implement. Which fits depends on how critical attestation is in your workflow.',
      },
      {
        label: 'Verification path tested with real file from own system',
        detail: 'Take one real file from your production workflow. Complete the full path: hash → attest → wait for anchored → resolve → verify → download .ots → verify via CLI.\nIf this path works with a real file: your integration is correct.',
      },
      {
        label: 'Ready for production',
        detail: 'At least one real file from your production workflow has completed the full path (hash → attest → anchored → verify → .ots download → CLI verification). All green? Production.',
      },
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST.reduce((sum, g) => sum + g.items.length, 0);

function ItemDetail({ detail }: { detail: string }) {
  return (
    <pre className="mt-2 ml-7 text-[11px] font-mono text-[hsl(var(--landing-cream)/0.4)] whitespace-pre-wrap leading-relaxed bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-3">
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
          <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))]">Integration Checklist</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono">
            {completedCount}/{TOTAL_ITEMS}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[hsl(var(--landing-cream)/0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--landing-copper))] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono">{percentage}%</span>
        </div>
      </div>

      <div className="space-y-8">
        {CHECKLIST.map((group) => (
          <div key={group.title}>
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-3">
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
                          <Circle className="w-4 h-4 text-[hsl(var(--landing-cream)/0.15)] group-hover:text-[hsl(var(--landing-cream)/0.3)] shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${isChecked ? 'text-[hsl(var(--landing-cream)/0.3)] line-through' : 'text-[hsl(var(--landing-cream)/0.7)]'}`}>
                          <span className="text-[hsl(var(--landing-cream)/0.25)] font-mono text-xs mr-2">{stepNum}.</span>
                          {item.label}
                          {item.quickStartDone && !isChecked && (
                            <span className="ml-2 text-[10px] font-mono text-emerald-400/60">✓ Done during Quick Start</span>
                          )}
                        </span>
                      </button>
                      <button
                        onClick={(e) => toggleExpand(item.label, e)}
                        className="p-1.5 rounded hover:bg-[hsl(var(--landing-cream)/0.05)] text-[hsl(var(--landing-cream)/0.25)] hover:text-[hsl(var(--landing-cream)/0.5)] transition-colors shrink-0 mt-0.5"
                        title={isExpanded ? 'Collapse' : 'Show instructions'}
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

      <p className="text-[hsl(var(--landing-cream)/0.2)] text-xs font-mono mt-6">
        Progress is saved locally in your browser.
      </p>
    </section>
  );
}
