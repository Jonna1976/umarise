import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Investor One-Pager — Exportable Internal Document
 * Strategic valuation and market positioning.
 */
export default function InvestorOnePager() {
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
        {/* Header */}
        <header className="mb-14 pb-8 border-b border-[hsl(40,15%,88%,0.1)] print:border-stone-300">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[hsl(25,35%,42%,0.6)] mb-3">
            Vertrouwelijk
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-light text-[hsl(40,15%,88%,0.95)] mb-2 print:text-stone-900">
            Umarise — Investor One-Pager
          </h1>
          <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
            Het SSL-certificaat voor bewijs van bestaan — Maart 2026
          </p>
        </header>

        <div className="space-y-12">

          {/* One-liner */}
          <section>
            <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-6 print:bg-amber-50 print:border-amber-200">
              <p className="text-base text-[hsl(40,15%,88%,0.85)] leading-relaxed print:text-stone-800">
                Umarise is een open infrastructuurprimitief dat met één API call bewijst dat specifieke bytes bestonden op een specifiek moment — 
                zonder opslag, zonder accounts, zonder afhankelijkheid van de uitgever na creatie.
              </p>
            </div>
          </section>

          {/* Problem */}
          <section>
            <SectionTitle>Het probleem</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
              Elk digitaal bestand kan achteraf worden gewijzigd. Bestaande oplossingen voor temporeel bewijs 
              (DocuSign, Woleet, Originstamp) vereisen accounts, dashboards en vendor lock-in. 
              Het bewijs is afhankelijk van het voortbestaan van de leverancier.
            </p>
          </section>

          {/* Solution */}
          <section>
            <SectionTitle>De oplossing</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              Een verankerings-primitive dat functioneert als DNS voor temporeel bewijs:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Zero-storage', desc: 'Alleen de hash wordt verwerkt. Originele bestanden verlaten het apparaat niet.' },
                { label: 'Bitcoin-verankerd', desc: 'Elke hash wordt via OpenTimestamps onherroepelijk in de Bitcoin blockchain vastgelegd.' },
                { label: 'Overleeft de maker', desc: 'De ZIP met bewijs blijft verifieerbaar, zelfs als Umarise verdwijnt.' },
                { label: 'Eén API call', desc: 'Integratie kost een middag. Geen SDK vereist, geen onboarding-call.' },
              ].map(({ label, desc }) => (
                <div key={label} className="p-4 rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] print:bg-stone-50 print:border-stone-200">
                  <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-1">{label}</p>
                  <p className="text-xs text-[hsl(40,15%,88%,0.5)] print:text-stone-500">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Moat */}
          <section>
            <SectionTitle>Structurele moat</SectionTitle>
            <div className="space-y-3">
              {[
                { title: 'Bewijs dat ons niet nodig heeft', desc: 'SaaS-concurrenten kunnen dit niet kopiëren zonder hun eigen verdienmodel (custody, accounts) te ondermijnen.' },
                { title: 'Eigen specificatie', desc: 'anchoring-spec.org — normatieve standaard onder Unlicense. Wie het veld definieert, bezit het veld.' },
                { title: 'Categorie-claim', desc: '"Creation Integrity" — first-in-time gepubliceerd en cryptografisch verankerd op 2 maart 2026.' },
                { title: 'Onafhankelijke verifier', desc: 'verify-anchoring.org — publiek domein, zonder tracking, zonder backend. Concurrenten moeten hiernaar verwijzen.' },
              ].map(({ title, desc }) => (
                <div key={title} className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5">
                  <p className="font-medium text-sm text-[hsl(40,15%,88%,0.85)] print:text-stone-800">{title}</p>
                  <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-0.5 print:text-stone-500">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Market */}
          <section>
            <SectionTitle>Markt</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Sector</th>
                    <th className="text-right p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs w-28 print:text-stone-600">TAM (EU)</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['Legal tech — IP, contracten, bewijslast', '€2,3 mrd'],
                    ['AI/GenAI output verificatie', '€500M+'],
                    ['Creatieve industrie — oorsprong claimen', '€1,2 mrd'],
                    ['Compliance & audit — eIDAS, QTSP', '€3,1 mrd'],
                    ['Supply chain — certificaten van oorsprong', '€800M'],
                    ['Wetenschap — dataset-integriteit', '€400M'],
                    ['Overheid — archivering, WOB', '€600M'],
                  ].map(([sector, tam]) => (
                    <tr key={sector} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3">{sector}</td>
                      <td className="p-3 text-right font-mono text-[hsl(25,35%,42%,0.8)]">{tam}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[hsl(40,15%,88%,0.15)] print:border-stone-300">
                    <td className="p-3 font-medium text-[hsl(40,15%,88%,0.9)]">Totale TAM</td>
                    <td className="p-3 text-right font-mono font-medium text-[hsl(25,35%,42%,0.9)]">€8,9 mrd</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Valuation */}
          <section>
            <SectionTitle>Waardering</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 text-center print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(40,15%,88%,0.4)] mb-2">Bouwwaarde</p>
                <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.95)]">
                  €250-390K
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-5 text-center print:bg-amber-50 print:border-amber-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(25,35%,42%,0.6)] mb-2">Strategische waarde</p>
                <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.95)]">
                  €8-17M
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['Categorie-claim "Creation Integrity"', '€1-3M'],
                    ['Normatieve specificatie (anchoring-spec.org)', '€2-5M'],
                    ['Onafhankelijke verifier (verify-anchoring.org)', '€500K-1M'],
                    ['Bevroren v1 API-contract (Stripe-model)', '€1-2M'],
                    ['Structurele moat: onkopieërbaar voor SaaS', '€3-5M'],
                    ['Terminologie-eigendom (14 definities)', '€500K-1M'],
                  ].map(([asset, value]) => (
                    <tr key={asset} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3">{asset}</td>
                      <td className="p-3 text-right font-mono text-[hsl(25,35%,42%,0.7)]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Revenue */}
          <section>
            <SectionTitle>Revenue-model</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Stroom</th>
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Model</th>
                    <th className="text-right p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Prijs</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['API Access — Founding', 'Maandelijks', '€199/mo'],
                    ['API Access — Standard', 'Maandelijks', '€349/mo'],
                    ['API Access — Scale', 'Maandelijks', '€799/mo'],
                    ['L3 Attestatie', 'Per transactie', '€1,95'],
                    ['L4 QES (via QTSP)', 'Op aanvraag', 'TBD'],
                  ].map(([stroom, model, prijs]) => (
                    <tr key={stroom} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3">{stroom}</td>
                      <td className="p-3 text-[hsl(40,15%,88%,0.5)]">{model}</td>
                      <td className="p-3 text-right font-mono text-[hsl(25,35%,42%,0.7)]">{prijs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Traction */}
          <section>
            <SectionTitle>Status — Maart 2026</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              {[
                { metric: '30/31', label: 'Audit score' },
                { metric: 'v1.0', label: 'API bevroren' },
                { metric: '2', label: 'SDK\'s (Node, Python)' },
              ].map(({ metric, label }) => (
                <div key={label} className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-4 text-center print:bg-stone-50 print:border-stone-200">
                  <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.9)]">{metric}</p>
                  <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              {[
                'Normatieve specificatie live (anchoring-spec.org)',
                'Onafhankelijke verifier live (verify-anchoring.org)',
                'Categorie "Creation Integrity" geclaimd en verankerd',
                'Sandbox-modus live (um_test_ + dry_run)',
                'QTSP/eIDAS blueprint gereed',
                'Consumer reference app live (itexisted.app)',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-400/70 mt-0.5 shrink-0">✓</span>
                  <span className="text-[hsl(40,15%,88%,0.6)] print:text-stone-600">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Ask */}
          <section>
            <SectionTitle>De vraag</SectionTitle>
            <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-6 print:bg-amber-50 print:border-amber-200">
              <p className="text-sm text-[hsl(40,15%,88%,0.8)] leading-relaxed print:text-stone-700">
                De techniek is af. De spec is gepubliceerd. De verifier is onafhankelijk. 
                Het enige dat ontbreekt is adoptie — en dat is precies waarvoor funding wordt gezocht.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.5)] mt-3 print:text-stone-500">
                Funding wordt ingezet voor: eerste partner-onboardings, terminologie-adoptie (E5), 
                en het activeren van het revenue-model via founding-tier partners.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-6 text-center print:bg-stone-50 print:border-stone-200">
              <p className="font-mono text-sm text-[hsl(40,15%,88%,0.5)]">
                info@umarise.com
              </p>
            </div>
          </section>

        </div>

        <footer className="mt-16 pt-8 border-t border-[hsl(40,15%,88%,0.08)] text-xs text-[hsl(40,15%,88%,0.3)] print:border-stone-300 print:text-stone-500">
          <p>Vertrouwelijk document — niet publiceren</p>
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
