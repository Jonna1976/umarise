import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Partner Onboarding Workflow — Internal Printable Export
 * Updated to reflect current dual-track architecture and protocol tone.
 * Internal document, not for external distribution.
 */
export default function PartnerOnboardingExport() {
  const handlePrint = () => window.print();

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

      {/* Document */}
      <div className="max-w-3xl mx-auto px-8 py-16 print:px-0 print:py-8">
        {/* Header */}
        <header className="mb-14 pb-8 border-b border-[hsl(40,15%,88%,0.1)] print:border-stone-300">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[hsl(25,35%,42%,0.6)] mb-3">
            Intern Document
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-light text-[hsl(40,15%,88%,0.95)] mb-2 print:text-stone-900">
            Partner Onboarding Workflow
          </h1>
          <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
            Umarise Core - Operationeel Schema - v2.0
          </p>
        </header>

        <div className="space-y-12">

          {/* Dual-Track Model */}
          <section>
            <SectionTitle>Integratiemodel: Dual-Track</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg p-5 border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(25,35%,42%,0.7)] mb-2">Track A - Retroactive</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.6)] print:text-stone-600">
                  Bestaand archief verankeren via CLI scripts. Bestanden verlaten het apparaat niet. Alleen SHA-256 hashes worden verzonden.
                </p>
              </div>
              <div className="rounded-lg p-5 border border-emerald-500/15 bg-emerald-500/[0.03] print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-emerald-400/70 mb-2">Track B - Prospective</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.6)] print:text-stone-600">
                  Real-time verankering in applicatiecode via SDK (Node.js, Python) of directe API calls. Time to first attestation: &lt;20 min.
                </p>
              </div>
            </div>
            <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
              Beide tracks convergeren op <code className="text-[hsl(25,35%,42%,0.8)] bg-[hsl(25,35%,42%,0.08)] px-1.5 py-0.5 rounded text-xs">POST /v1-core-origins</code>.
              Bewijs is identiek ongeacht de ingangsroute.
            </p>
          </section>

          {/* Communication Model */}
          <section>
            <SectionTitle>Communicatiemodel</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 font-mono text-[13px] text-[hsl(40,15%,88%,0.6)] space-y-1 print:bg-stone-50 print:border-stone-200 print:text-stone-600">
              <div>Partner &lt;&gt; Umarise (Issuer) &lt;&gt; Lovable (Executor)</div>
              <div>Partner &lt;&gt; Core API (direct, technisch)</div>
            </div>
            <p className="mt-4 text-sm text-[hsl(40,15%,88%,0.5)]">
              Twee gescheiden stromen: <strong className="text-[hsl(40,15%,88%,0.8)]">Governance &amp; toegang</strong> (mensen, beslissingen, e-mail)
              en <strong className="text-[hsl(40,15%,88%,0.8)]">Protocolgebruik</strong> (machines, HTTP). Deze mogen nooit door elkaar lopen.
            </p>
          </section>

          {/* Onboarding Flow */}
          <section>
            <SectionTitle>Onboarding Flow</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-6 font-mono text-[13px] space-y-1 print:bg-stone-50 print:border-stone-200">
              {[
                { icon: '01', label: 'Partner mailt partners@umarise.com', tag: 'Trigger' },
                { icon: '02', label: 'Umarise stuurt Template A (ontvangstbevestiging)', tag: 'Ack, ALTIJD' },
                { icon: '03', label: 'Geschiktheidscheck (4x JA/NEE)', tag: 'Intern' },
                { icon: '—', label: 'NEE: Afwijzing (kort, geen uitleg)', tag: 'STOP', dim: true },
                { icon: '—', label: 'JA: Doorgaan', tag: '', dim: true },
                { icon: '04', label: 'Umarise stuurt Lovable: ISSUE KEY - [Partner]', tag: 'Handoff' },
                { icon: '05', label: 'Lovable antwoordt: KEY ISSUED / BLOCKED', tag: 'Response' },
                { icon: '06', label: 'Umarise stuurt Template B (key + docs)', tag: 'Key delivery' },
                { icon: '07', label: 'Partner integreert via Core API', tag: 'Direct' },
              ].map(({ icon, label, tag, dim }, i) => (
                <div key={i} className={`flex items-start gap-4 py-1.5 ${dim ? 'pl-8' : ''}`}>
                  <span className={`w-6 text-right shrink-0 ${dim ? 'text-[hsl(40,15%,88%,0.2)]' : 'text-[hsl(25,35%,42%,0.7)]'}`}>{icon}</span>
                  <span className={dim ? 'text-[hsl(40,15%,88%,0.35)]' : 'text-[hsl(40,15%,88%,0.7)]'}>{label}</span>
                  {tag && <span className="ml-auto text-[hsl(40,15%,88%,0.25)] text-[11px]">[{tag}]</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Checklist */}
          <section>
            <SectionTitle>Geschiktheidschecklist</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Vraag</th>
                    <th className="w-14 p-4 text-center text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">JA</th>
                    <th className="w-14 p-4 text-center text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">NEE</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    'Kan een cryptographic hash worden berekend op het moment van origin?',
                    'Hebben ze extern bewijs nodig (niet intern audit trail)?',
                    'Accepteren ze irreversibiliteit (write-once, no delete)?',
                    'Geen feature-/productvragen (geen dashboard, geen workflow)?',
                  ].map((q, i) => (
                    <tr key={i} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-4">{q}</td>
                      <td className="p-4 text-center font-mono text-[hsl(40,15%,88%,0.3)]">☐</td>
                      <td className="p-4 text-center font-mono text-[hsl(40,15%,88%,0.3)]">☐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[hsl(40,15%,88%,0.5)]">
              <strong className="text-[hsl(40,15%,88%,0.8)]">4x JA</strong> - Door naar key issuance.{' '}
              <strong className="text-[hsl(40,15%,88%,0.8)]">1x NEE</strong> - Afwijzing (geen uitleg, geen suggesties, geen roadmap).
            </p>
          </section>

          {/* Role Division */}
          <section>
            <SectionTitle>Rolverdeling</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider w-32 print:text-stone-600">Rol</th>
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Verantwoordelijkheid</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  <tr className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                    <td className="p-4 font-medium text-[hsl(40,15%,88%,0.9)]">Umarise</td>
                    <td className="p-4">Besluit (JA/NEE), templates versturen, governance</td>
                  </tr>
                  <tr className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                    <td className="p-4 font-medium text-[hsl(40,15%,88%,0.9)]">Lovable</td>
                    <td className="p-4">Key generatie, DB registratie, revocatie, edge functions</td>
                  </tr>
                  <tr className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                    <td className="p-4 font-medium text-[hsl(40,15%,88%,0.9)]">Partner</td>
                    <td className="p-4">Gebruikt Core API (Track A en/of Track B)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.05)] p-4 text-sm text-[hsl(40,15%,88%,0.7)] print:bg-amber-50 print:border-amber-200 print:text-stone-700">
              <strong className="text-[hsl(25,35%,42%,0.9)]">Regel:</strong> Partner en Executor komen NOOIT direct in contact.
            </div>
          </section>

          {/* Key Technical Details */}
          <section>
            <SectionTitle>Key Issuance - Technisch</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 font-mono text-[13px] text-[hsl(40,15%,88%,0.6)] space-y-2 print:bg-stone-50 print:border-stone-200 print:text-stone-600">
              <div><span className="text-[hsl(40,15%,88%,0.35)]">Format:</span> um_ + 64-char hex string</div>
              <div><span className="text-[hsl(40,15%,88%,0.35)]">Opslag:</span> HMAC-SHA256 hash (plaintext wordt niet bewaard)</div>
              <div><span className="text-[hsl(40,15%,88%,0.35)]">Prefix:</span> Eerste 8 chars voor logging/audit</div>
              <div><span className="text-[hsl(40,15%,88%,0.35)]">Tier:</span> standard (1.000 req/min) | founding | scale</div>
              <div><span className="text-[hsl(40,15%,88%,0.35)]">Secrets:</span> INTERNAL_API_SECRET + CORE_API_SECRET</div>
            </div>
            <p className="mt-3 text-sm text-[hsl(40,15%,88%,0.4)]">
              Verloren keys kunnen niet worden hersteld. Nieuwe key vereist revocatie + herinrichting.
            </p>
          </section>

          {/* Safety Valves */}
          <section>
            <SectionTitle>Safety Valves</SectionTitle>
            <div className="space-y-4">
              <div className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5">
                <p className="font-medium text-[hsl(40,15%,88%,0.9)] text-sm">Valve 1 - Template A is verplicht</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.5)] mt-1">
                  Elke inbound partner-mail krijgt altijd Template A (ontvangstbevestiging). Geen uitzonderingen.
                </p>
              </div>
              <div className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5">
                <p className="font-medium text-[hsl(40,15%,88%,0.9)] text-sm">Valve 2 - Handoff is expliciet taakvormig</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.5)] mt-1">
                  Format: <code className="bg-[hsl(40,15%,88%,0.06)] px-1.5 py-0.5 rounded text-xs">ISSUE KEY - Partner: [Naam]</code><br />
                  Response: <code className="bg-[hsl(40,15%,88%,0.06)] px-1.5 py-0.5 rounded text-xs">KEY ISSUED</code> of <code className="bg-[hsl(40,15%,88%,0.06)] px-1.5 py-0.5 rounded text-xs">BLOCKED (reason)</code>
                </p>
              </div>
              <div className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5">
                <p className="font-medium text-[hsl(40,15%,88%,0.9)] text-sm">Valve 3 - Documentatie wijst partner naar zelfbediening</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.5)] mt-1">
                  Template B bevat links naar /api-reference, /partner-integration, en /sdk-spec. Geen menselijke onboarding-calls.
                </p>
              </div>
            </div>
          </section>

          {/* Actiepunten */}
          <section>
            <SectionTitle>Actiepunten per onboarding</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs w-8 print:text-stone-600">#</th>
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Actie</th>
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider w-24 print:text-stone-600">Type</th>
                    <th className="text-left p-4 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Output</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['1', 'Template A', 'E-mail', 'Ontvangstbevestiging (VERPLICHT)'],
                    ['2', 'Geschiktheidscheck', 'Intern', '4x JA/NEE'],
                    ['3', 'Handoff-bericht', 'Chat', 'ISSUE KEY - [Partner]'],
                    ['4', 'Key issuance', 'Technisch', 'um_ prefix key + DB registratie'],
                    ['5', 'Template B', 'E-mail', 'Key + /api-reference + /partner-integration'],
                    ['6', 'First attestation check', 'Monitoring', 'Bevestig first_attestation_at in DB'],
                  ].map(([n, actie, type, output]) => (
                    <tr key={n} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-4 font-mono text-[hsl(25,35%,42%,0.6)]">{n}</td>
                      <td className="p-4 font-medium text-[hsl(40,15%,88%,0.9)]">{actie}</td>
                      <td className="p-4">{type}</td>
                      <td className="p-4">{output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Public Resources */}
          <section>
            <SectionTitle>Partner-facing documentatie (publiek)</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '/partner-integration', desc: 'One-pager met dual-track uitleg' },
                { label: '/api-reference', desc: 'Technische API documentatie' },
                { label: '/sdk-spec', desc: 'SDK specificatie (Node.js, Python)' },
                { label: '/technical', desc: 'Technische beschrijving anchor record' },
                { label: '/partnerships', desc: 'Contact pagina (pricing TBD)' },
                { label: 'verify-anchoring.org', desc: 'Onafhankelijke verifier' },
              ].map(({ label, desc }) => (
                <div key={label} className="p-4 rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] print:bg-stone-50 print:border-stone-200">
                  <code className="text-[hsl(25,35%,42%,0.8)] text-xs font-mono">{label}</code>
                  <p className="text-[hsl(40,15%,88%,0.45)] text-xs mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[hsl(40,15%,88%,0.08)] text-xs text-[hsl(40,15%,88%,0.3)] print:border-stone-300 print:text-stone-500">
          <p>Operationeel document - niet publiceren</p>
          <p className="mt-1">Umarise Core - {new Date().getFullYear()}</p>
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
