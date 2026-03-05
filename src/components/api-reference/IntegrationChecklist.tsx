import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ListChecks, ChevronDown, ChevronRight, Bot, Wrench } from 'lucide-react';

const STORAGE_KEY = 'umarise-checklist-v4';

const BASE = 'https://core.umarise.com';

interface ChecklistItem {
  label: string;
  detail: string;
}

/* ── AI-Assisted Checklist (6 items) ── */
const AI_CHECKLIST: ChecklistItem[] = [
  {
    label: 'AI prompt copied with your existing code, integration written',
    detail: 'Copy the prompt from the "Integrate with AI" section above. Paste it into Claude, ChatGPT, or your preferred AI assistant along with your existing code. The AI will write the integration.',
  },
  {
    label: 'API key generated and configured',
    detail: 'Generate your key at umarise.com/developers (one click, no account needed). Configure the key in your integration code. Key starts with um_.',
  },
  {
    label: 'origin_id stored in your database',
    detail: 'After each attestation, store the returned origin_id alongside your own record. This is the link between your system and the independent proof.',
  },
  {
    label: 'Error handling confirmed (non-blocking)',
    detail: 'Verify that your integration handles failures gracefully. safe_attest() should never block your workflow - if Core is temporarily unreachable, it logs the error and your app continues.',
  },
  {
    label: 'Proof status confirmed anchored after 10-20 minutes',
    detail: `Poll GET ${BASE}/v1-core-resolve?origin_id=... every 60 seconds. After 10-20 minutes, proof_status changes from "pending" to "anchored". Once anchored, the proof is final and independently verifiable.`,
  },
  {
    label: 'Ready for production',
    detail: 'All checks above are green. Your integration is production-ready.',
  },
];

/* ── Full Checklist (21 items in 5 groups) ── */
interface ChecklistGroup {
  title: string;
  stepOffset: number;
  items: ChecklistItem[];
}

const FULL_CHECKLIST: ChecklistGroup[] = [
  {
    title: 'No key needed - start here',
    stepOffset: 1,
    items: [
      {
        label: 'Health check returned "operational"',
        detail: `curl ${BASE}/v1-core-health\nExpected: {"status":"operational","version":"v1","timestamp":"..."}`,
      },
      {
        label: 'Test hash verified via POST /v1-core-verify',
        detail: `curl -X POST ${BASE}/v1-core-verify -H 'Content-Type: application/json' -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`,
      },
      {
        label: 'Origin retrieved via GET /v1-core-resolve',
        detail: `curl '${BASE}/v1-core-resolve?origin_id=YOUR_ORIGIN_ID'`,
      },
      {
        label: '.ots proof downloaded via GET /v1-core-proof',
        detail: `curl '${BASE}/v1-core-proof?origin_id=YOUR_ORIGIN_ID' -o proof.ots\nThis downloads the binary OpenTimestamps proof file.`,
      },
      {
        label: 'Try it Live demo completed',
        detail: 'Use the interactive demo above to walk through the full verification flow.',
      },
    ],
  },
  {
    title: 'Sandbox testing',
    stepOffset: 6,
    items: [
      {
        label: 'Sandbox key generated (um_test_ + 64 hex chars)',
        detail: 'Generate a test key locally: um_test_ followed by 64 hex characters.\nExample: um_test_0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\n\nSandbox keys are always valid, require no registration, and have unlimited credits.',
      },
      {
        label: 'First sandbox attestation created successfully',
        detail: `curl -X POST ${BASE}/v1-core-origins -H 'Content-Type: application/json' -H 'X-API-Key: um_test_YOUR_64_HEX_CHARS' -d '{"hash":"sha256:YOUR_HASH"}'\n\nSandbox attestations work identically to production but are labeled as test data.`,
      },
    ],
  },
  {
    title: 'Production API key',
    stepOffset: 8,
    items: [
      {
        label: 'Production API key generated and configured',
        detail: 'Generate your key at umarise.com/developers (one click, no account needed). Key starts with um_. For higher rate limits or custom terms, contact partners@umarise.com.',
      },
      {
        label: 'Credit balance confirmed via response headers',
        detail: 'Every API response includes:\n  X-Credits-Remaining: 4950\n  X-Credits-Low: true (when < 50 remaining)\n\nAt 0 credits: 402 INSUFFICIENT_CREDITS error.',
      },
      {
        label: 'First production attestation created, origin_id received',
        detail: `curl -X POST ${BASE}/v1-core-origins -H 'Content-Type: application/json' -H 'X-API-Key: YOUR_KEY' -d '{"hash":"sha256:YOUR_HASH"}'`,
      },
      {
        label: 'Waited 10-20 minutes, proof_status changed to "anchored"',
        detail: `Repeat resolve after 10-20 minutes. Once proof_status is "anchored", the proof is independently verifiable via Bitcoin.`,
      },
      {
        label: 'Own file attested (not the test hash)',
        detail: 'Hash your own file:\n  sha256sum your-file.pdf (Linux)\n  shasum -a 256 your-file.pdf (macOS)\nCreate an attestation with that hash.',
      },
    ],
  },
  {
    title: 'SDK Integration',
    stepOffset: 13,
    items: [
      {
        label: 'SDK downloaded and installed',
        detail: 'Download from Templates section above. Python: umarise_integration.py. Node.js: umarise-integration.js.',
      },
      {
        label: 'health(), attest(), verify(), resolve() calls successful',
        detail: 'Run the test suite: python3 test_integration.py um_YOUR_KEY or node test_integration_node.js um_YOUR_KEY. All 15 tests should pass.',
      },
      {
        label: 'origin_id linked to own system',
        detail: 'Store origin_id alongside your own record. Example:\n  db.submissions.update(id, { origin_id: result.origin_id })',
      },
    ],
  },
  {
    title: 'Production Readiness',
    stepOffset: 16,
    items: [
      {
        label: 'SHA-256 hash integrated into submission workflow',
        detail: 'Calculate hash of the complete file at the moment of upload/submit/ingest.',
      },
      {
        label: 'API call linked to own trigger (upload, submit, ingest)',
        detail: 'One SDK call per event. After successful upload: attest(hash). Store origin_id with the record.',
      },
      {
        label: 'origin_id stored with own record',
        detail: 'Check: can you look up the corresponding origin_id for every record in your system? If yes: done.',
      },
      {
        label: 'Error handling implemented',
        detail: 'Timeout: 10 seconds. Rate limit (429): read retry_after_seconds, wait, retry. Server error (500): retry after 60s, max 3 attempts.',
      },
      {
        label: 'Fallback strategy defined',
        detail: 'Option A: queue hash locally, automatic retry after 60 seconds (recommended).\nOption B: log the error, continue without attestation.',
      },
      {
        label: 'Verification path tested with real file',
        detail: 'Full path: hash → attest → wait for anchored → resolve → verify → download .ots → verify via CLI.',
      },
      {
        label: 'Ready for production',
        detail: 'At least one real file from your production workflow has completed the full path. All green? Production.',
      },
    ],
  },
];

const FULL_TOTAL = FULL_CHECKLIST.reduce((sum, g) => sum + g.items.length, 0);

function ItemDetail({ detail }: { detail: string }) {
  return (
    <pre className="mt-2 ml-7 text-[11px] font-mono text-[hsl(var(--landing-cream)/0.6)] whitespace-pre-wrap leading-relaxed bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-3">
      {detail}
    </pre>
  );
}

type Track = 'ai' | 'full';

export default function IntegrationChecklist() {
  const [track, setTrack] = useState<Track>('ai');

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

  // Calculate progress
  const currentItems = track === 'ai' ? AI_CHECKLIST : FULL_CHECKLIST.flatMap(g => g.items);
  const totalItems = currentItems.length;
  const completedCount = currentItems.filter(i => checked.has(i.label)).length;
  const percentage = Math.round((completedCount / totalItems) * 100);

  return (
    <section id="checklist">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))]">Integration Checklist</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono">
            {completedCount}/{totalItems}
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

      {/* Track selector */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTrack('ai')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-colors ${
            track === 'ai'
              ? 'bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] border border-[hsl(var(--landing-copper)/0.3)]'
              : 'bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.7)] border border-[hsl(var(--landing-cream)/0.08)] hover:text-[hsl(var(--landing-cream)/0.9)]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          With AI assistance
        </button>
        <button
          onClick={() => setTrack('full')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-colors ${
            track === 'full'
              ? 'bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] border border-[hsl(var(--landing-copper)/0.3)]'
              : 'bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.7)] border border-[hsl(var(--landing-cream)/0.08)] hover:text-[hsl(var(--landing-cream)/0.9)]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Full checklist
        </button>
      </div>

      {/* AI track */}
      {track === 'ai' && (
        <div className="space-y-1">
          {AI_CHECKLIST.map((item, idx) => {
            const isChecked = checked.has(item.label);
            const isExpanded = expanded.has(item.label);
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
                      <span className="text-[hsl(var(--landing-cream)/0.4)] font-mono text-xs mr-2">{idx + 1}.</span>
                      {item.label}
                    </span>
                  </button>
                  <button
                    onClick={(e) => toggleExpand(item.label, e)}
                    className="p-1.5 rounded hover:bg-[hsl(var(--landing-cream)/0.05)] text-[hsl(var(--landing-cream)/0.4)] hover:text-[hsl(var(--landing-cream)/0.7)] transition-colors shrink-0 mt-0.5"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {isExpanded && <ItemDetail detail={item.detail} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Full track */}
      {track === 'full' && (
        <div className="space-y-8">
          {FULL_CHECKLIST.map((group) => (
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
                          </span>
                        </button>
                        <button
                          onClick={(e) => toggleExpand(item.label, e)}
                          className="p-1.5 rounded hover:bg-[hsl(var(--landing-cream)/0.05)] text-[hsl(var(--landing-cream)/0.4)] hover:text-[hsl(var(--landing-cream)/0.7)] transition-colors shrink-0 mt-0.5"
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
      )}

      <p className="text-[hsl(var(--landing-cream)/0.35)] text-xs font-mono mt-6">
        Progress is saved locally in your browser.
      </p>
    </section>
  );
}
