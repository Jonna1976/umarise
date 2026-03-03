import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Investor One-Pager
 * Exportable internal document. English. No em dashes. Infrastructure tone.
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
            Confidential
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-light text-[hsl(40,15%,88%,0.95)] mb-2 print:text-stone-900">
            Umarise · GTM Strategy
          </h1>
          <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
            The SSL certificate for proof of existence · March 2026
          </p>
        </header>

        <div className="space-y-12">

          {/* One-liner */}
          <section>
            <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-6 print:bg-amber-50 print:border-amber-200">
              <p className="text-base text-[hsl(40,15%,88%,0.85)] leading-relaxed print:text-stone-800">
                Umarise is an open infrastructure primitive that proves specific bytes existed at a specific moment
                with a single API call. No storage, no accounts, no dependency on the issuer after creation.
              </p>
            </div>
          </section>

          {/* Problem */}
          <section>
            <SectionTitle>The problem</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
              Every digital file can be modified after the fact. Existing solutions for temporal proof
              (DocuSign, Woleet, Originstamp) require accounts, dashboards, and vendor lock-in.
              The proof depends on the continued existence of the provider.
            </p>
          </section>

          {/* Solution */}
          <section>
            <SectionTitle>The solution</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              An anchoring primitive that functions as DNS for temporal proof:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Zero-storage', desc: 'Only the hash is processed. Original files never leave the device.' },
                { label: 'Bitcoin-anchored', desc: 'Every hash is irrevocably anchored to the Bitcoin blockchain via OpenTimestamps.' },
                { label: 'Survives the maker', desc: 'The proof ZIP remains verifiable even if Umarise ceases to exist.' },
                { label: 'One API call', desc: 'Integration takes one afternoon. No SDK required, no onboarding call.' },
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
            <SectionTitle>Structural moat</SectionTitle>
            <div className="space-y-3">
              {[
                { title: 'Proof that does not need us', desc: 'SaaS competitors cannot copy this without undermining their own revenue model (custody, accounts).' },
                { title: 'Own specification', desc: 'anchoring-spec.org · normative standard under Unlicense. Whoever defines the field, owns the field.' },
                { title: 'Category claim', desc: '"Creation Integrity" · first-in-time published and cryptographically anchored on 2 March 2026.' },
                { title: 'Independent verifier', desc: 'verify-anchoring.org · public domain, no tracking, no backend. Competitors must reference it.' },
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
            <SectionTitle>Market</SectionTitle>
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
                    ['Legal tech · IP, contracts, burden of proof', '€2.3B'],
                    ['AI/GenAI output verification', '€500M+'],
                    ['Creative industry · origin claims', '€1.2B'],
                    ['Compliance & audit · eIDAS, QTSP', '€3.1B'],
                    ['Supply chain · certificates of origin', '€800M'],
                    ['Science · dataset integrity', '€400M'],
                    ['Government · archiving, FOIA', '€600M'],
                  ].map(([sector, tam]) => (
                    <tr key={sector} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3">{sector}</td>
                      <td className="p-3 text-right font-mono text-[hsl(25,35%,42%,0.8)]">{tam}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[hsl(40,15%,88%,0.15)] print:border-stone-300">
                    <td className="p-3 font-medium text-[hsl(40,15%,88%,0.9)]">Total TAM</td>
                    <td className="p-3 text-right font-mono font-medium text-[hsl(25,35%,42%,0.9)]">€8.9B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Valuation */}
          <section>
            <SectionTitle>Valuation</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 text-center print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(40,15%,88%,0.4)] mb-2">Build value</p>
                <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.95)]">
                  €250-390K
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-5 text-center print:bg-amber-50 print:border-amber-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(25,35%,42%,0.6)] mb-2">Strategic value</p>
                <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.95)]">
                  €8-17M
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['Category claim "Creation Integrity"', '€1-3M'],
                    ['Normative specification (anchoring-spec.org)', '€2-5M'],
                    ['Independent verifier (verify-anchoring.org)', '€500K-1M'],
                    ['Frozen v1 API contract (Stripe model)', '€1-2M'],
                    ['Structural moat: uncopyable for SaaS', '€3-5M'],
                    ['Terminology ownership (14 definitions)', '€500K-1M'],
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
            <SectionTitle>Revenue model</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              No subscriptions. No recurring fees. Two revenue streams:
            </p>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Stream</th>
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Model</th>
                    <th className="text-right p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs print:text-stone-600">Price</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['API key', 'One-time', '€240'],
                    ['Anchoring credits · Starter', 'Prepaid bundle', '€50 (500)'],
                    ['Anchoring credits · Standard', 'Prepaid bundle', '€500 (5,000)'],
                    ['Anchoring credits · Volume', 'Prepaid bundle', '€5,000 (50,000)'],
                    ['L3 Attestation', 'Per transaction', '€1.95'],
                    ['L4 QES (via QTSP)', 'On request', 'TBD'],
                  ].map(([stream, model, price]) => (
                    <tr key={stream} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3">{stream}</td>
                      <td className="p-3 text-[hsl(40,15%,88%,0.5)]">{model}</td>
                      <td className="p-3 text-right font-mono text-[hsl(25,35%,42%,0.7)]">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-3 print:text-stone-500">
              Uniform price: €0.10 per anchor. Credits do not expire. Top-up via Stripe Payment Link, automatically credited, no portal.
            </p>
          </section>

          {/* Traction */}
          <section>
            <SectionTitle>Status · March 2026</SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              {[
                { metric: '30/31', label: 'Audit score' },
                { metric: 'v1.0', label: 'API frozen' },
                { metric: '2', label: 'SDKs (Node, Python)' },
              ].map(({ metric, label }) => (
                <div key={label} className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-4 text-center print:bg-stone-50 print:border-stone-200">
                  <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.9)]">{metric}</p>
                  <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              {[
                'Normative specification live (anchoring-spec.org)',
                'Independent verifier live (verify-anchoring.org)',
                'Category "Creation Integrity" claimed and anchored',
                'Sandbox mode live (um_test_ + dry_run)',
                'QTSP/eIDAS blueprint ready',
                'Consumer reference app live (itexisted.app)',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-400/70 mt-0.5 shrink-0">✓</span>
                  <span className="text-[hsl(40,15%,88%,0.6)] print:text-stone-600">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What we need */}
          <section>
            <SectionTitle>What we need</SectionTitle>
            <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-6 mb-4 print:bg-amber-50 print:border-amber-200">
              <p className="text-sm text-[hsl(40,15%,88%,0.8)] leading-relaxed print:text-stone-700">
                The technology is complete. The specification is published. The verifier is independent.
                What is missing is not capital. It is a connector: someone with a network across legal,
                compliance, or creative industries who can ask one question in the right rooms:
              </p>
              <p className="text-base text-[hsl(40,15%,88%,0.95)] mt-4 font-['Playfair_Display'] italic text-center print:text-stone-900">
                "Who in your pipeline needs proof of existence?"
              </p>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { title: 'Not an investor', desc: 'No equity, no board seat, no cap table. Revenue share or referral fee per activated partner.' },
                { title: 'Not a salesperson', desc: 'Partners integrate themselves. The connector opens doors, Umarise handles onboarding through docs and SDK.' },
                { title: 'Not a co-founder', desc: 'A bridge builder who translates "cryptographic anchoring" into the language of the room they are in.' },
              ].map(({ title, desc }) => (
                <div key={title} className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5">
                  <p className="font-medium text-sm text-[hsl(40,15%,88%,0.85)] print:text-stone-800">{title}</p>
                  <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-0.5 print:text-stone-500">{desc}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">The connector</th>
                    <th className="text-left p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600">Umarise</th>
                  </tr>
                </thead>
                <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
                  {[
                    ['Opens the conversation', 'Provides the one-pager and demo'],
                    ['Identifies the use case', 'Maps it to the API contract'],
                    ['Introduces the decision maker', 'Handles technical onboarding'],
                    ['Follows up on adoption', 'Delivers SDK, docs, and support'],
                  ].map(([connector, umarise]) => (
                    <tr key={connector} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
                      <td className="p-3">{connector}</td>
                      <td className="p-3">{umarise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-3 print:text-stone-500">
              Target: 5 activated partners within 12 months. Self-sustaining revenue at that point. No funding required.
            </p>
          </section>

          {/* Seeds */}
          <section>
            <SectionTitle>The seeds need to be in the ground before it does</SectionTitle>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(40,15%,88%,0.02)] p-6 print:bg-stone-50 print:border-stone-200">
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed print:text-stone-600">
                No campaign. No social. No impressions.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                The temptation is obvious: one student, one ZIP, one story — that is a perfect campaign.
                Every student recognizes it. Resist it. A campaign makes it a product. A silent seed makes
                it a primitive. One PhD student showing a colleague how it works is worth more than ten
                thousand impressions. Because the colleague sees it work. Not sees it sold.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                The reflex installs through experience, not exposure. That is the only distribution that holds.
              </p>
            </div>
          </section>

          {/* The line */}
          <section>
            <SectionTitle>The line that does not move</SectionTitle>
            <div className="rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-6 print:bg-amber-50 print:border-amber-200">
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed print:text-stone-600">
                Services on top of the primitive create value. That is good. Partners should build them.
                But Umarise does not build those services. Umarise guards the primitive.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                The instinct to add — a dashboard, an account system, a workflow tool — is always logical
                in the moment. It is always wrong for the primitive. The moment the primitive becomes a
                platform, it stops being infrastructure. A primitive with a dashboard is a SaaS. A primitive
                without one is the SSL certificate for proof of existence.
              </p>
              <p className="text-base text-[hsl(40,15%,88%,0.95)] mt-4 font-medium print:text-stone-900">
                You build the services. We guard the primitive.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.5)] mt-3 print:text-stone-500">
                If it looks even one millimeter like a platform: no. That line does not move.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-6 text-center print:bg-stone-50 print:border-stone-200">
              <p className="font-mono text-sm text-[hsl(40,15%,88%,0.5)]">
                partners@umarise.com
              </p>
            </div>
          </section>

        </div>

        <footer className="mt-16 pt-8 border-t border-[hsl(40,15%,88%,0.08)] text-xs text-[hsl(40,15%,88%,0.3)] print:border-stone-300 print:text-stone-500">
          <p>Confidential document · do not distribute</p>
          <p className="mt-1">Umarise · {new Date().getFullYear()}</p>
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
