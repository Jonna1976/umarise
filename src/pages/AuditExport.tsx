import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Primitive or Product Audit — Exportable Summary
 * Score: 30/31 — March 2026
 */
export default function AuditExport() {
  const handlePrint = () => window.print();

  const sections = [
    {
      id: 'A', title: 'Core API', max: 6, score: 6, status: 'Compleet',
      items: [
        'Proof bundle conform IEC Section 6',
        'Werkt zonder user login',
        'Deterministische output',
        'Certificate.json publiek gedocumenteerd',
        'Versienummer + backward compatible',
        'Fout bij ongeldige input, geen state',
      ],
    },
    {
      id: 'B', title: 'Verificatie', max: 5, score: 5, status: 'Compleet',
      items: [
        'Verifieerbaar via OTS CLI zonder Umarise',
        'Webverifier zonder account',
        'Verificatie-instructie publiek',
        'Bitcoin-anchor zichtbaar in block explorer',
        'ZIP bevat alles voor verificatie (trade-off gedocumenteerd)',
      ],
    },
    {
      id: 'C', title: 'Onboarding', max: 5, score: 5, status: 'Sandbox live',
      items: [
        'Eerste anchor in < 30 min',
        'Sandbox: um_test_ key + dry_run=true',
        'Voorbeeldcode in 2+ talen',
        'Foutmeldingen begrijpelijk',
        'Referentieverifier als testcase',
      ],
    },
    {
      id: 'D', title: 'Grens bewaking', max: 6, score: 6, status: 'Zuiver primitief',
      items: [
        'Geen lijsten, dashboards of workflows',
        'Geen notificaties of meldingen',
        'Geen gebruikersprofielen',
        'Geen multi-tenant routing',
        'Geen pricing/billing logica',
        'Geen feature flags of A/B tests',
      ],
    },
    {
      id: 'E', title: 'Spec en taal', max: 5, score: 4, status: '1 open item',
      items: [
        'anchoring-spec.org live met versie',
        'L1-L4 publiek gedocumenteerd',
        'Certificate.json v1.3 gedocumenteerd',
        'npm/Python package beschikbaar',
      ],
      openItems: ['Terminologie-adoptie door externen (gepubliceerd, bewijs volgt)'],
    },
    {
      id: 'F', title: 'Laag 3 en 4', max: 4, score: 4, status: 'Compleet',
      items: [
        'attestation.json format publiek',
        'Notaris-attestatie onafhankelijk (scripts/attest-origin.sh)',
        'QTSP blueprint gedocumenteerd',
        'QES als open spec (L4 sectie)',
      ],
    },
  ];

  const totalAE = sections.filter(s => ['A','B','C','D','E'].includes(s.id)).reduce((a, s) => a + s.score, 0);
  const maxAE = sections.filter(s => ['A','B','C','D','E'].includes(s.id)).reduce((a, s) => a + s.max, 0);
  const totalAF = sections.reduce((a, s) => a + s.score, 0);
  const maxAF = sections.reduce((a, s) => a + s.max, 0);

  return (
    <div className="min-h-screen bg-[hsl(220,10%,7%)] text-[hsl(40,15%,88%)] print:bg-white print:text-stone-800">
      {/* Print button */}
      <div className="fixed top-6 right-6 print:hidden z-50">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="bg-[hsl(220,10%,12%)] border-[hsl(40,15%,88%,0.15)] text-[hsl(40,15%,88%,0.7)] hover:bg-[hsl(220,10%,16%)]"
        >
          <Printer className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16 print:px-0 print:py-8">
        {/* Header */}
        <header className="mb-14 pb-8 border-b border-[hsl(40,15%,88%,0.1)] print:border-stone-300">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[hsl(25,35%,42%,0.6)] mb-3">
            Intern Document
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-light text-[hsl(40,15%,88%,0.95)] mb-2 print:text-stone-900">
            Audit: Primitief of Product?
          </h1>
          <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
            Umarise Core — Maart 2026 — Definitieve versie (v2)
          </p>
        </header>

        {/* Score Summary */}
        <section className="mb-12">
          <SectionTitle>Scorekaart</SectionTitle>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <ScoreCard label="Score A–E" score={totalAE} max={maxAE} />
            <ScoreCard label="Score A–F (incl. L3/L4)" score={totalAF} max={maxAF} />
          </div>
          <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                  <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Sectie</th>
                  <th className="text-center p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs w-20 print:text-stone-600">Score</th>
                  <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Status</th>
                </tr>
              </thead>
              <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                {sections.map(s => (
                  <tr key={s.id} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                    <td className="p-3">
                      <span className="font-mono text-[hsl(25,35%,42%,0.7)] mr-2">{s.id}.</span>
                      {s.title}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className={s.score === s.max ? 'text-emerald-400/80' : 'text-amber-400/80'}>
                        {s.score}
                      </span>
                      <span className="text-[hsl(40,15%,88%,0.3)]">/{s.max}</span>
                    </td>
                    <td className="p-3 text-[hsl(40,15%,88%,0.5)]">
                      {s.score === s.max ? '✅' : '⏳'} {s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detail per section */}
        {sections.map(s => (
          <section key={s.id} className="mb-10">
            <SectionTitle>
              <span className="font-mono text-[hsl(25,35%,42%,0.7)] mr-2">{s.id}.</span>
              {s.title} — {s.score}/{s.max}
            </SectionTitle>
            <div className="space-y-2">
              {s.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-400/70 mt-0.5 shrink-0">✓</span>
                  <span className="text-[hsl(40,15%,88%,0.65)] print:text-stone-600">{item}</span>
                </div>
              ))}
              {s.openItems?.map((item, i) => (
                <div key={`open-${i}`} className="flex items-start gap-3 text-sm">
                  <span className="text-amber-400/70 mt-0.5 shrink-0">○</span>
                  <span className="text-[hsl(40,15%,88%,0.5)] print:text-stone-500">{item}</span>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Open Item */}
        <section className="mb-12">
          <SectionTitle>Open item</SectionTitle>
          <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.03] p-5 print:bg-amber-50 print:border-amber-200">
            <p className="font-mono text-[11px] tracking-[3px] uppercase text-amber-400/70 mb-2">E5 — Terminologie-adoptie</p>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] print:text-stone-600">
              14 canonical definities zijn gepubliceerd op <code className="text-[hsl(25,35%,42%,0.8)] bg-[hsl(25,35%,42%,0.08)] px-1.5 py-0.5 rounded text-xs">/technical</code>.
              Bewijs van adoptie door externe partijen volgt na eerste partner-onboardings.
            </p>
            <p className="text-sm text-[hsl(40,15%,88%,0.4)] mt-2">
              Dit punt vereist externe observatie en kan niet intern worden opgelost.
            </p>
          </div>
        </section>

        {/* Conclusie */}
        <section className="mb-12">
          <SectionTitle>Conclusie</SectionTitle>
          <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.03] p-6 print:bg-emerald-50 print:border-emerald-200">
            <p className="text-sm text-[hsl(40,15%,88%,0.8)] print:text-stone-700 leading-relaxed">
              Umarise Core voldoet aan <strong className="text-[hsl(40,15%,88%,0.95)]">30 van 31</strong> criteria
              voor de status <strong className="text-[hsl(40,15%,88%,0.95)]">infrastructuurprimitief</strong>.
              Het enige openstaande punt (E5) betreft terminologie-adoptie door externen —
              een metric die pas meetbaar is na eerste partner-integraties.
            </p>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] mt-3 print:text-stone-500">
              Alle technische, architecturale en documentatie-vereisten zijn afgerond.
              Het systeem is gereed voor partner-onboarding.
            </p>
          </div>
        </section>

        {/* Key deliverables */}
        <section className="mb-12">
          <SectionTitle>Kernleveringen — Maart 2026</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'anchoring-spec.org', desc: 'Normative specification (IEC)' },
              { label: 'verify-anchoring.org', desc: 'Onafhankelijke verifier' },
              { label: '/technical', desc: 'Certificate v1.3 + L1-L4 levels' },
              { label: '/api-reference', desc: 'API docs + sandbox mode' },
              { label: '/sdk-spec', desc: 'Node.js + Python SDK' },
              { label: 'QTSP Blueprint', desc: 'XAdES/PAdES embedding protocol' },
            ].map(({ label, desc }) => (
              <div key={label} className="p-4 rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] print:bg-stone-50 print:border-stone-200">
                <code className="text-[hsl(25,35%,42%,0.8)] text-xs font-mono">{label}</code>
                <p className="text-[hsl(40,15%,88%,0.45)] text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[hsl(40,15%,88%,0.08)] text-xs text-[hsl(40,15%,88%,0.3)] print:border-stone-300 print:text-stone-500">
          <p>Intern document — niet publiceren</p>
          <p className="mt-1">Umarise Core — {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-['Playfair_Display'] text-lg font-light text-[hsl(40,15%,88%,0.9)] mb-5 print:text-stone-900">
      {children}
    </h2>
  );
}

function ScoreCard({ label, score, max }: { label: string; score: number; max: number }) {
  return (
    <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 text-center print:bg-stone-50 print:border-stone-200">
      <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(40,15%,88%,0.4)] mb-2">{label}</p>
      <p className="font-['Playfair_Display'] text-4xl font-light text-[hsl(40,15%,88%,0.95)]">
        {score}<span className="text-[hsl(40,15%,88%,0.3)] text-2xl">/{max}</span>
      </p>
    </div>
  );
}
