import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Partner Onboarding Workflow — Printable Export
 * Internal document, not for external distribution
 */
export default function PartnerOnboardingExport() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 print:bg-white">
      {/* Print button - hidden when printing */}
      <div className="fixed top-6 right-6 print:hidden">
        <Button 
          onClick={handlePrint}
          variant="outline"
          className="bg-white border-stone-300 text-stone-700 hover:bg-stone-100"
        >
          <Printer className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto px-8 py-16 print:px-0 print:py-8">
        {/* Header */}
        <header className="mb-12 pb-8 border-b border-stone-300">
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
            Intern Document
          </p>
          <h1 className="font-serif text-3xl text-stone-900 mb-2">
            Partner Onboarding Workflow
          </h1>
          <p className="text-sm text-stone-500">
            Umarise Core — Operationeel Schema
          </p>
        </header>

        {/* Content */}
        <div className="space-y-10 text-stone-700 leading-relaxed">

          {/* Communication Model */}
          <section>
            <h2 className="font-serif text-lg text-stone-900 mb-4">
              Communicatiemodel
            </h2>
            <div className="bg-stone-100 border border-stone-200 rounded p-4 font-mono text-sm print:bg-white print:border-stone-300">
              <div className="mb-2">Partner ↔ Umarise (Issuer) ↔ Lovable (Executor)</div>
              <div>Partner ↔ Core API (direct, technisch)</div>
            </div>
            <p className="mt-4 text-sm text-stone-600">
              Twee gescheiden stromen: <strong>Governance & toegang</strong> (mensen, beslissingen, e-mail) 
              en <strong>Protocolgebruik</strong> (machines, HTTP). Deze mogen nooit door elkaar lopen.
            </p>
          </section>

          {/* Flow Diagram */}
          <section>
            <h2 className="font-serif text-lg text-stone-900 mb-4">
              Onboarding Flow
            </h2>
            <div className="bg-stone-100 border border-stone-200 rounded p-6 font-mono text-sm space-y-2 print:bg-white print:border-stone-300">
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">📧</span>
                <span>Partner → partners@umarise.com</span>
                <span className="text-stone-400 ml-auto">[Trigger]</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">📧</span>
                <span>Umarise → Partner: Template A</span>
                <span className="text-stone-400 ml-auto">[Ack, ALTIJD]</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">🧠</span>
                <span>Geschiktheidscheck (4× JA/NEE)</span>
                <span className="text-stone-400 ml-auto">[Intern]</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3 pl-6">
                <span className="text-stone-500">NEE →</span>
                <span>Afwijzing (kort, geen uitleg)</span>
                <span className="text-stone-400 ml-auto">[STOP]</span>
              </div>
              <div className="flex items-start gap-3 pl-6">
                <span className="text-stone-500">JA →</span>
                <span>Doorgaan</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">💬</span>
                <span>Umarise → Lovable: ISSUE KEY — [Partner]</span>
                <span className="text-stone-400 ml-auto">[Handoff]</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">💬</span>
                <span>Lovable → Umarise: KEY ISSUED / BLOCKED</span>
                <span className="text-stone-400 ml-auto">[Response]</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">📧</span>
                <span>Umarise → Partner: Template B</span>
                <span className="text-stone-400 ml-auto">[Key delivery]</span>
              </div>
              <div className="border-l-2 border-stone-300 ml-2 pl-5 py-1">↓</div>
              <div className="flex items-start gap-3">
                <span className="text-stone-400 w-4">🔌</span>
                <span>Partner ↔ Core API</span>
                <span className="text-stone-400 ml-auto">[Direct]</span>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section>
            <h2 className="font-serif text-lg text-stone-900 mb-4">
              Geschiktheidschecklist
            </h2>
            <table className="w-full text-sm border border-stone-200 print:border-stone-300">
              <thead>
                <tr className="bg-stone-100 print:bg-stone-50">
                  <th className="text-left p-3 border-b border-stone-200">Vraag</th>
                  <th className="w-16 p-3 border-b border-stone-200 text-center">JA</th>
                  <th className="w-16 p-3 border-b border-stone-200 text-center">NEE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b border-stone-200">Kan een cryptographic hash worden berekend op het moment van origin?</td>
                  <td className="p-3 border-b border-stone-200 text-center">☐</td>
                  <td className="p-3 border-b border-stone-200 text-center">☐</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-stone-200">Hebben ze extern bewijs nodig?</td>
                  <td className="p-3 border-b border-stone-200 text-center">☐</td>
                  <td className="p-3 border-b border-stone-200 text-center">☐</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-stone-200">Accepteren ze irreversibiliteit?</td>
                  <td className="p-3 border-b border-stone-200 text-center">☐</td>
                  <td className="p-3 border-b border-stone-200 text-center">☐</td>
                </tr>
                <tr>
                  <td className="p-3">Geen feature-/productvragen?</td>
                  <td className="p-3 text-center">☐</td>
                  <td className="p-3 text-center">☐</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-sm text-stone-600">
              <strong>4× JA</strong> → Door naar key issuance<br />
              <strong>1× NEE</strong> → Afwijzing (geen uitleg, geen suggesties, geen roadmap)
            </p>
          </section>

          {/* Role Division */}
          <section>
            <h2 className="font-serif text-lg text-stone-900 mb-4">
              Rolverdeling
            </h2>
            <table className="w-full text-sm border border-stone-200 print:border-stone-300">
              <thead>
                <tr className="bg-stone-100 print:bg-stone-50">
                  <th className="text-left p-3 border-b border-stone-200 w-32">Rol</th>
                  <th className="text-left p-3 border-b border-stone-200">Verantwoordelijkheid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b border-stone-200 font-medium">Umarise</td>
                  <td className="p-3 border-b border-stone-200">Besluit (JA/NEE), templates versturen</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-stone-200 font-medium">Lovable</td>
                  <td className="p-3 border-b border-stone-200">Key generatie, DB registratie, revocatie</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Partner</td>
                  <td className="p-3">Gebruikt Core API</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 bg-stone-200 border border-stone-300 rounded p-3 text-sm print:bg-stone-100">
              <strong>⚠️ Partner en Executor komen NOOIT direct in contact</strong>
            </div>
          </section>

          {/* Safety Valves */}
          <section>
            <h2 className="font-serif text-lg text-stone-900 mb-4">
              Safety Valves
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-stone-400 pl-4">
                <p className="font-medium text-stone-900">Valve 1 — Template A is verplicht</p>
                <p className="text-sm text-stone-600 mt-1">
                  Elke inbound partner-mail krijgt altijd Template A (ontvangstbevestiging).
                </p>
              </div>
              <div className="border-l-4 border-stone-400 pl-4">
                <p className="font-medium text-stone-900">Valve 2 — Handoff is expliciet taakvormig</p>
                <p className="text-sm text-stone-600 mt-1">
                  Format: <code className="bg-stone-200 px-1 rounded">ISSUE KEY — Partner: [Naam]</code><br />
                  Response: <code className="bg-stone-200 px-1 rounded">KEY ISSUED</code> of <code className="bg-stone-200 px-1 rounded">BLOCKED (reason)</code>
                </p>
              </div>
            </div>
          </section>

          {/* Action Items */}
          <section>
            <h2 className="font-serif text-lg text-stone-900 mb-4">
              Actiepunten
            </h2>
            <table className="w-full text-sm border border-stone-200 print:border-stone-300">
              <thead>
                <tr className="bg-stone-100 print:bg-stone-50">
                  <th className="text-left p-3 border-b border-stone-200 w-8">#</th>
                  <th className="text-left p-3 border-b border-stone-200">Actie</th>
                  <th className="text-left p-3 border-b border-stone-200 w-24">Type</th>
                  <th className="text-left p-3 border-b border-stone-200">Output</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b border-stone-200">1</td>
                  <td className="p-3 border-b border-stone-200 font-medium">Template A</td>
                  <td className="p-3 border-b border-stone-200">E-mail</td>
                  <td className="p-3 border-b border-stone-200">Ontvangstbevestiging (VERPLICHT)</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-stone-200">2</td>
                  <td className="p-3 border-b border-stone-200 font-medium">Template B</td>
                  <td className="p-3 border-b border-stone-200">E-mail</td>
                  <td className="p-3 border-b border-stone-200">Key delivery + constraints</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-stone-200">3</td>
                  <td className="p-3 border-b border-stone-200 font-medium">Template C</td>
                  <td className="p-3 border-b border-stone-200">E-mail</td>
                  <td className="p-3 border-b border-stone-200">Revocation notice</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-stone-200">4</td>
                  <td className="p-3 border-b border-stone-200 font-medium">Geschiktheidschecklist</td>
                  <td className="p-3 border-b border-stone-200">Intern</td>
                  <td className="p-3 border-b border-stone-200">4× JA/NEE</td>
                </tr>
                <tr>
                  <td className="p-3">5</td>
                  <td className="p-3 font-medium">Handoff-bericht</td>
                  <td className="p-3">Slack/chat</td>
                  <td className="p-3">ISSUE KEY — [Partner]</td>
                </tr>
              </tbody>
            </table>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-stone-300 text-xs text-stone-500">
          <p>Operationeel document — niet publiceren</p>
          <p className="mt-1">Umarise Core — {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
