import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Partner Outreach Email Templates — Internal Document
 * Templates for initial partner contact.
 */
export default function PartnerOutreachExport() {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[hsl(220,10%,7%)] text-[hsl(40,15%,88%)] print:bg-white print:text-stone-800">
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
        <header className="mb-14 pb-8 border-b border-[hsl(40,15%,88%,0.1)] print:border-stone-300">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[hsl(25,35%,42%,0.6)] mb-3">
            Intern Document
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-light text-[hsl(40,15%,88%,0.95)] mb-2 print:text-stone-900">
            Partner Outreach Templates
          </h1>
          <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
            Umarise Core — E-mail templates voor partner-benadering
          </p>
        </header>

        <div className="space-y-14">

          {/* Template 1: Cold outreach */}
          <section>
            <SectionTitle>Template 1 — Eerste contact (koud)</SectionTitle>
            <EmailTemplate
              subject="Cryptografisch bewijs van bestaan — integratie in één middag"
              body={`Beste [naam],

Ik schrijf u namens Umarise. Wij leveren een open infrastructuurprimitief waarmee uw gebruikers onafhankelijk kunnen verifiëren dat specifieke bytes bestonden op of voor een ledger-afgeleid tijdstip.

Wat dat in de praktijk betekent:
· Eén API call legt een SHA-256 hash vast in de Bitcoin blockchain via OpenTimestamps
· Het bewijs (ZIP) is verifieerbaar zonder Umarise — zelfs als wij niet meer bestaan
· Geen opslag van originele bestanden. Geen accounts. Geen vendor lock-in

Integratie kost één middag. De sandbox is live:
· API documentatie: umarise.com/api-reference
· Technische beschrijving: umarise.com/technical
· Onafhankelijke verifier: verify-anchoring.org

Wij denken dat [bedrijf/product] baat heeft bij verifieerbaar temporeel bewijs voor [use case]. Ik licht dit graag toe in een kort gesprek.

Met vriendelijke groet,
[naam]
Umarise
partners@umarise.com`}
            />
            <UsageNote>
              Gebruik voor: legal tech, compliance platforms, archiefsystemen, AI-output verificatie.
              Pas [use case] aan per sector.
            </UsageNote>
          </section>

          {/* Template 2: Warm intro */}
          <section>
            <SectionTitle>Template 2 — Warm contact (via introductie)</SectionTitle>
            <EmailTemplate
              subject="Introductie: Umarise — verankerings-infrastructuur"
              body={`Beste [naam],

[Introductie-persoon] suggereerde dat ik u zou schrijven.

Umarise levert cryptografisch bewijs van bestaan als infrastructuurlaag. Eén API call, geen opslag, geen accounts. Het bewijs overleeft de uitgever.

Voor [bedrijf]: [specifieke use case — bijv. "elke gegenereerde rapportage kan bij creatie worden verankerd, waardoor klanten onafhankelijk kunnen verifiëren dat het rapport niet achteraf is gewijzigd."]

De technische sandbox is direct toegankelijk:
· umarise.com/api-reference (incl. sandbox modus)
· umarise.com/partner-integration (integratie-overzicht)

Zullen we 15 minuten inplannen?

Met vriendelijke groet,
[naam]
partners@umarise.com`}
            />
            <UsageNote>
              Gebruik voor: warme introducties via netwerk. Altijd de specifieke use case benoemen.
            </UsageNote>
          </section>

          {/* Template 3: Technical decision maker */}
          <section>
            <SectionTitle>Template 3 — Technisch (CTO/Lead Developer)</SectionTitle>
            <EmailTemplate
              subject="Open anchoring primitive — SHA-256 + Bitcoin + 1 endpoint"
              body={`Hi [naam],

Umarise is een verankerings-primitive: POST een SHA-256 hash, ontvang een origin_id + .ots proof. Bitcoin-verankerd via OpenTimestamps. Geen state, geen storage, deterministische output.

curl -X POST https://core.umarise.com/v1-core-origins \\
  -H "X-API-Key: um_..." \\
  -d '{"hash": "sha256:...", "short_token": "DOC"}'

Sandbox: um_test_ prefix keys + dry_run=true parameter.
Spec: anchoring-spec.org
Verifier: verify-anchoring.org (publiek domein, geen backend)
SDK: npm @umarise/anchor | pip install umarise-core-sdk

De API is bevroren (v1 contract). Backward compatibility is permanent.

Interesse? partners@umarise.com

Groet,
[naam]`}
            />
            <UsageNote>
              Gebruik voor: technische beslissers. Geen marketing-taal. Laat de curl spreken.
            </UsageNote>
          </section>

          {/* Guidelines */}
          <section>
            <SectionTitle>Richtlijnen</SectionTitle>
            <div className="space-y-4">
              <div className="border-l-2 border-emerald-500/30 pl-5">
                <p className="font-medium text-sm text-[hsl(40,15%,88%,0.85)]">Wel</p>
                <ul className="text-sm text-[hsl(40,15%,88%,0.5)] mt-1 space-y-1">
                  <li>· Verwijs altijd naar /api-reference en verify-anchoring.org</li>
                  <li>· Benoem de specifieke use case voor het bedrijf</li>
                  <li>· Benadruk onafhankelijkheid: "zelfs als wij niet meer bestaan"</li>
                  <li>· Noem de sandbox-modus voor directe validatie</li>
                </ul>
              </div>
              <div className="border-l-2 border-red-500/30 pl-5">
                <p className="font-medium text-sm text-[hsl(40,15%,88%,0.85)]">Niet</p>
                <ul className="text-sm text-[hsl(40,15%,88%,0.5)] mt-1 space-y-1">
                  <li>· Geen woorden: platform, product, solution, scalable, powerful</li>
                  <li>· Geen pricing noemen in eerste contact</li>
                  <li>· Geen vergelijkingen met concurrenten</li>
                  <li>· Geen beloftes over features of roadmap</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sector-specific hooks */}
          <section>
            <SectionTitle>Use case hooks per sector</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider w-32 print:text-stone-600">Sector</th>
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Hook</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['Legal tech', 'Elk contract kan bij ondertekening worden verankerd. Uw klanten verifiëren zelf, zonder uw systeem.'],
                    ['AI/GenAI', 'Elk model-output kan bij generatie worden verankerd. Bewijs dat dit specifieke resultaat op dit moment is geproduceerd.'],
                    ['Creatief', 'Fotografen en designers kunnen oorsprong claimen vóór publicatie. Het bewijs is onafhankelijk van elk platform.'],
                    ['Compliance', 'Audit trails worden verankerd in een onafhankelijke ledger. Geen self-attestation, geen vendor-afhankelijkheid.'],
                    ['Research', 'Datasets en preregistraties worden verankerd bij creatie. Peer reviewers verifiëren onafhankelijk.'],
                    ['Supply chain', 'Certificaten van oorsprong worden verankerd bij uitgifte. Verificatie zonder toegang tot uw systeem.'],
                  ].map(([sector, hook]) => (
                    <tr key={sector} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3 font-medium text-[hsl(40,15%,88%,0.85)]">{sector}</td>
                      <td className="p-3 text-[hsl(40,15%,88%,0.6)]">{hook}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        <footer className="mt-16 pt-8 border-t border-[hsl(40,15%,88%,0.08)] text-xs text-[hsl(40,15%,88%,0.3)] print:border-stone-300 print:text-stone-500">
          <p>Intern document — niet publiceren</p>
          <p className="mt-1">Umarise — {new Date().getFullYear()}</p>
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

function EmailTemplate({ subject, body }: { subject: string; body: string }) {
  return (
    <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
      <div className="bg-[hsl(220,10%,10%)] px-5 py-3 border-b border-[hsl(40,15%,88%,0.06)] print:bg-stone-100 print:border-stone-200">
        <p className="text-xs text-[hsl(40,15%,88%,0.4)] print:text-stone-500">
          <span className="font-mono text-[hsl(40,15%,88%,0.3)]">Subject:</span>{' '}
          <span className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">{subject}</span>
        </p>
      </div>
      <div className="p-5 bg-[hsl(220,10%,9%)] print:bg-white">
        <pre className="font-sans text-sm text-[hsl(40,15%,88%,0.6)] whitespace-pre-wrap leading-relaxed print:text-stone-600">
          {body}
        </pre>
      </div>
    </div>
  );
}

function UsageNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs text-[hsl(40,15%,88%,0.35)] italic print:text-stone-400">
      {children}
    </p>
  );
}
