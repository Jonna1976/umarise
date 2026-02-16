import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';

const STORAGE_KEY = 'umarise-checklist-v1';

interface ChecklistGroup {
  title: string;
  items: string[];
}

const CHECKLIST: ChecklistGroup[] = [
  {
    title: 'Setup',
    items: [
      'API key received from partners@umarise.com',
      'First-run script executed (bash or Python)',
      'Health check returned "operational"',
      'First test attestation created',
      'origin_id received and stored',
    ],
  },
  {
    title: 'Verification',
    items: [
      'Hash verified via POST /v1-core-verify — match confirmed',
      'Origin resolved via GET /v1-core-resolve — record retrieved',
      '~15 min waited, proof_status changed to "anchored"',
      '.ots proof downloaded via GET /v1-core-proof',
      'Verification tested via umarise.com/verify (online)',
      'Verification tested via verify-anchor.sh or .py (CLI)',
    ],
  },
  {
    title: 'SDK Integration',
    items: [
      'SDK installed (Node: umarise-core.ts / Python: umarise_core.py)',
      'SDK health() call successful',
      'SDK attest() call successful with own test hash',
      'SDK verify() call successful — match confirmed',
      'SDK resolve() call successful — record retrieved',
      'origin_id storage integrated in own system',
    ],
  },
  {
    title: 'Production Readiness',
    items: [
      'Hash calculation integrated in submission workflow',
      'API call connected to own trigger (upload, submit, ingest)',
      'origin_id stored with own record (database field)',
      'Error handling implemented (timeout, retry, rate limit)',
      'Fallback strategy defined (API temporarily unavailable)',
      'Verification path tested with real file from own system',
      'Ready for production',
    ],
  },
];

const TOTAL_ITEMS = CHECKLIST.reduce((sum, g) => sum + g.items.length, 0);

export default function IntegrationChecklist() {
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

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

      <div className="space-y-6">
        {CHECKLIST.map((group) => (
          <div key={group.title}>
            <h4 className="text-[hsl(var(--landing-cream)/0.5)] text-xs font-mono uppercase tracking-wider mb-3">{group.title}</h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isChecked = checked.has(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    className="flex items-start gap-3 w-full text-left py-1.5 px-2 -mx-2 rounded hover:bg-[hsl(var(--landing-cream)/0.03)] transition-colors group"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-[hsl(var(--landing-cream)/0.15)] group-hover:text-[hsl(var(--landing-cream)/0.3)] shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${isChecked ? 'text-[hsl(var(--landing-cream)/0.3)] line-through' : 'text-[hsl(var(--landing-cream)/0.7)]'}`}>
                      {item}
                    </span>
                  </button>
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
