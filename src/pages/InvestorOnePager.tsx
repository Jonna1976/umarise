import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Investor One-Pager — GTM Strategy v3.1 (final)
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

          {/* The Missing Primitive */}
          <section>
            <SectionTitle>The missing primitive</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
              The internet has primitives for identity, payments, and messaging, but it doesn't have a simple way to prove when something actually existed. Files can be copied, edited, or backdated, and metadata can't be trusted. Umarise introduces a primitive for verifiable history. A file is hashed, the hash is anchored to an immutable timestamp, and a portable proof travels with the artifact. Anyone can independently verify that these exact bytes existed at or before time <em>T</em>.
            </p>
            <p className="text-sm text-[hsl(25,35%,42%)] font-medium mt-3 print:text-stone-800">
              We're making "this existed at this moment" a first-class primitive of the internet.
            </p>
          </section>

          {/* Executive Summary — Open-Source & IP */}
          <section>
            <SectionTitle>Executive summary: open-source & IP</SectionTitle>
            <div className="border-l-2 border-[hsl(25,35%,42%,0.5)] pl-5 mb-4">
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] italic leading-relaxed print:text-stone-600">
                "The specification is public domain. The SDK is open-source. Verification is independent.
                But the operational infrastructure, the batching engine, the key management, the immutability triggers,
                the rate limiting, that is our protected IP. Just like Let's Encrypt: the protocol is open,
                the client is open, but the Certificate Authority behind the scenes is not something you replicate over a weekend."
              </p>
            </div>
            <div className="border-l-2 border-[hsl(25,35%,42%,0.5)] pl-5">
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] italic leading-relaxed print:text-stone-600">
                "Our real moat isn't the code. It's the combination of (1) a growing Bitcoin-anchored registry
                that cannot be reproduced, (2) an ecosystem of .proof files referencing our origin_id's,
                and (3) specification authority as the first formal standard for anchoring. You can copy code. You can't copy history."
              </p>
            </div>
          </section>

          {/* Opening statement */}
          <section>
            <HighlightBox>
              <p className="text-base text-[hsl(40,15%,88%,0.85)] leading-relaxed print:text-stone-800">
                Anchor it before it matters. Umarise is the SSL certificate for proof of existence,
                invisible infrastructure that makes trust automatic, verifiable by anyone, dependent on no one.
              </p>
            </HighlightBox>
          </section>

          {/* What infrastructure looks like */}
          <section>
            <SectionTitle>What infrastructure looks like when it works</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              Four primitives you use every day without thinking about them:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'SSL/TLS', desc: 'Every website connection is encrypted. Nobody buys SSL. Nobody installs it manually. It is simply there, underneath, making trust automatic. You see the lock. You move on.' },
                { label: 'DNS', desc: 'You type a name. You reach a server. The translation happens invisibly. Nobody knows how DNS works. Everyone depends on it.' },
                { label: "Let's Encrypt", desc: 'Free, automated HTTPS certificates for everyone. Before Let\'s Encrypt, SSL cost money and required manual renewal. Let\'s Encrypt made it so cheap and simple that the entire web adopted it. Not because it was marketed. Because it removed friction from something that should have been free all along.' },
                { label: 'QR code', desc: 'Invented in 1994 for factory logistics. Nobody planned its adoption. It spread because it solved a real problem simply, and anyone could read it with any device. No license, no vendor, no platform.' },
              ].map(({ label, desc }) => (
                <FeatureCard key={label} label={label} desc={desc} />
              ))}
            </div>
            <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-4 print:text-stone-500">
              These four became infrastructure by being useful, open, and simple. Not by being sold.
              Umarise is the same primitive for temporal proof.
            </p>
          </section>

          {/* Problem */}
          <section>
            <SectionTitle>The problem</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
              Every digital file can be modified after the fact. Existing solutions for temporal
              proof (DocuSign, Woleet, Originstamp) require accounts, dashboards, and vendor lock-in.
              The proof depends on the continued existence of the provider.
            </p>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mt-3 print:text-stone-600">
              But the problem is deeper than file integrity. Today, platforms manage three things
              in a single product: time, verification, and identity. The timestamp is a platform log.
              Verification runs through a platform interface. Identity is a platform account.
              That is not independent structure. That is dependency.
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
                { label: 'Zero branding', desc: 'Partners show nothing of Umarise to their end users. The primitive is invisible, like SSL, like DNS. No co-branding, no badge, no redirect.' },
              ].map(({ label, desc }) => (
                <FeatureCard key={label} label={label} desc={desc} />
              ))}
            </div>
          </section>

          {/* Three layers */}
          <section>
            <SectionTitle>Three structurally separated layers</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              Most systems combine time, verification, and identity in one product.
              This architecture separates them by design.
            </p>
            <div className="space-y-4 mb-5">
              <div className="border-l-2 border-[hsl(25,35%,42%,0.5)] pl-5">
                <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-1">Layer 1: Anchoring</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.8)] print:text-stone-700">Existence</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-1 print:text-stone-500">
                  A cryptographic commitment to exact bytes is recorded in a public ledger.
                  This proves: these exact bytes existed at or before time T. Not more. Not less.
                </p>
              </div>
              <div className="border-l-2 border-[hsl(25,35%,42%,0.5)] pl-5">
                <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-1">Layer 2 — Verification</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.8)] print:text-stone-700">Independence</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-1 print:text-stone-500">
                  Verification does not require our servers, an account, an API, or any database.
                  The proof is publicly verifiable against Bitcoin. This is not service verification.
                  This is publicly controllable verification.
                </p>
              </div>
              <div className="border-l-2 border-[hsl(40,15%,88%,0.15)] pl-5 opacity-50">
                <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.4)] mb-1">Layer 3 — Attestation</p>
                <p className="text-sm text-[hsl(40,15%,88%,0.5)] print:text-stone-500">Identity (optional, not yet active)</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.35)] mt-1 print:text-stone-400">
                  An identity declares something about the artifact. Not chronology, but a statement.
                  Bound to a passkey or cryptographic key. Attestation is supplementary.
                  It never contaminates Layer 1 or 2.
                </p>
              </div>
            </div>

            <DataTable
              headers={['Layer', 'Dependent on Umarise?']}
              rows={[
                ['Anchoring (existence)', 'No'],
                ['Verification (independence)', 'No'],
                ['Attestation (identity)', 'Only for the declaration, not for the time'],
              ]}
            />
            <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-3 print:text-stone-500">
              The core (existence + verification) remains independent. That is the structural separation.
            </p>
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
                <BorderItem key={title} title={title} desc={desc} />
              ))}
            </div>
          </section>

          {/* Market */}
          <section>
            <SectionTitle>Market</SectionTitle>
            <DataTable
              headers={['Sector', 'TAM (EU)']}
              rows={[
                ['Legal tech · IP, contracts, burden of proof', '€2.3B'],
                ['AI/GenAI output verification', '€500M+'],
                ['Creative industry · origin claims', '€1.2B'],
                ['Compliance & audit · eIDAS, QTSP', '€3.1B'],
                ['Supply chain · certificates of origin', '€800M'],
                ['Science · dataset integrity', '€400M'],
                ['Government · archiving, FOIA', '€600M'],
              ]}
              totalRow={['Total TAM', '€8.9B']}
              rightAlignLast
            />
          </section>

          {/* Valuation */}
          <section>
            <SectionTitle>Valuation</SectionTitle>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 text-center print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(40,15%,88%,0.4)] mb-2">Build value</p>
                <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.95)]">€250-390K</p>
              </div>
              <HighlightBox className="p-5 text-center">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(25,35%,42%,0.6)] mb-2">Strategic value</p>
                <p className="font-['Playfair_Display'] text-2xl font-light text-[hsl(40,15%,88%,0.95)]">€8-17M</p>
              </HighlightBox>
            </div>
            <DataTable
              rows={[
                ['Category claim "Creation Integrity"', '€1-3M'],
                ['Normative specification (anchoring-spec.org)', '€2-5M'],
                ['Independent verifier (verify-anchoring.org)', '€500K-1M'],
                ['Frozen v1 API contract (Stripe model)', '€1-2M'],
                ['Structural moat: uncopyable for SaaS', '€3-5M'],
                ['Terminology ownership (14 definitions)', '€500K-1M'],
              ]}
              rightAlignLast
            />
          </section>

          {/* Revenue */}
          <section>
            <SectionTitle>Revenue model</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              No subscriptions. No recurring fees.
            </p>
            <DataTable
              headers={['Stream', 'Model', 'Price']}
              rows={[
                ['API key', 'One-time', '€240'],
                ['Anchoring credits · Starter', 'Prepaid bundle', '€50 (500 anchors)'],
                ['Anchoring credits · Standard', 'Prepaid bundle', '€500 (5,000 anchors)'],
                ['Anchoring credits · Volume', 'Prepaid bundle', '€5,000 (50,000 anchors)'],
                ['L3 Attestation', 'Per transaction', '€1.95'],
                ['L4 QES (via QTSP)', 'On request', 'TBD'],
              ]}
              rightAlignLast
            />
            <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-3 print:text-stone-500">
              Uniform price: €0.10 per anchor. Credits do not expire. Top-up via Stripe Payment Link, automatically credited, no portal.
            </p>
          </section>

          {/* Where we are */}
          <section>
            <SectionTitle>Where we are</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              Two phases. One completed.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(40,15%,88%,0.4)] mb-2">Phase 1</p>
                <p className="text-sm font-medium text-[hsl(40,15%,88%,0.9)] mb-2">Infrastructure primitive — complete.</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] print:text-stone-500">
                  The API is frozen. The specification is published. The verifier is independent. The proof survives the maker. The primitive works.
                </p>
              </div>
              <HighlightBox className="p-5">
                <p className="font-mono text-[11px] tracking-[3px] uppercase text-[hsl(25,35%,42%,0.6)] mb-2">Phase 2</p>
                <p className="text-sm font-medium text-[hsl(40,15%,88%,0.9)] mb-2">Adoption seeding — not yet started.</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] print:text-stone-500">
                  This is not partner sales. This is infrastructure politics.
                  TCP/IP was not sold. It was adopted by the right people at the right moments.
                </p>
              </HighlightBox>
            </div>
            <div className="rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] p-5 print:bg-stone-50 print:border-stone-200 space-y-3">
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                The goal is not to find customers who pay. The goal is to find people who adopt anchoring-spec.org
                as a standard in their workflow, platform, or curriculum — and integrate it.
                Revenue follows adoption. Not the other way around.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed italic print:text-stone-700">
                The question is not: "Who wants to pay for anchoring?"
                The question is: "Who wants anchoring-spec.org as a standard in what they build?"
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                We are pre-seeding. The infrastructure is ready. The network is not yet activated.
                That is what we need.
              </p>
            </div>
          </section>

          {/* How to plant a seed */}
          <section>
            <SectionTitle>How to plant a seed</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              Seeding is not building. Seeding is showing.
            </p>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              One researcher. One file. One ZIP. One person who sees it work.
              That is a seed.
            </p>

            <div className="space-y-3 mb-5">
              <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)]">The sequence</p>
              {[
                'One PhD student anchors a dissertation draft — 20 minutes, no account',
                'They receive a ZIP: hash + .ots proof + Bitcoin anchor + certificate',
                'That ZIP goes to one rector or dean — not as a pitch deck, as a working proof',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="font-mono text-[hsl(25,35%,42%,0.7)] mt-0.5 shrink-0 w-5 text-right">{i + 1}.</span>
                  <span className="text-[hsl(40,15%,88%,0.7)] print:text-stone-600">{step}</span>
                </div>
              ))}
            </div>

            <div className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5 mb-5">
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] italic print:text-stone-600">
                "Here is the PDF. Here is the .ots proof. Here is verify-anchoring.org.
                Verify it yourself. No account needed."
              </p>
              <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-2 print:text-stone-500">
                That is the whole message. The primitive speaks for itself.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] p-4 print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-2">What not to build</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] print:text-stone-500">
                  No university portal. No researcher dashboard. No integration with Overleaf or Jupyter — that is partner work, not primitive work.
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] p-4 print:bg-stone-50 print:border-stone-200">
                <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-2">What the first seed proves</p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] print:text-stone-500">
                  Not that it scales. That it works. One real anchor by one real researcher is worth more than a hundred slide decks.
                </p>
              </div>
            </div>

            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              The forcing event will come from outside.
              The seeds need to be in the ground before it does.
            </p>

            <HighlightBox>
              <p className="text-sm font-medium text-[hsl(40,15%,88%,0.85)] mb-3 print:text-stone-800">
                No campaign. No social. No impressions.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed print:text-stone-600">
                The temptation is obvious: one student, one ZIP, one story —
                that is a perfect campaign. Every student recognizes it.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                Resist it.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                A campaign makes it a product. A silent seed makes it a primitive.
                One PhD student showing a colleague how it works is worth more
                than ten thousand impressions. Because the colleague sees it work.
                Not sees it sold.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                The reflex installs through experience, not exposure.
                That is the only distribution that holds.
              </p>
              <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-4 italic print:text-stone-500">
                See presence-guide for where and how to show it.
              </p>
            </HighlightBox>
          </section>

          {/* Reflex, not habit */}
          <section>
            <SectionTitle>How adoption works — reflex, not habit</SectionTitle>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                Anchoring is not a habit. It is a reflex.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                Habits are built through repetition — daily triggers, streaks, rewards.
                Reflexes are installed by one moment that counts.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                The lawyer who cannot prove when a document existed. The designer whose concept
                was claimed by someone else. The researcher whose dataset was disputed.
                One moment of need — and the reflex is installed permanently.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                This means the product does not need to be used daily.
                It needs to be there when it matters.
              </p>
            </div>
            <HighlightBox>
              <p className="text-sm text-[hsl(40,15%,88%,0.8)] leading-relaxed print:text-stone-700">
                <strong>QR proved you were somewhere. Anchoring proves something existed.</strong><br />
                Structurally the same mechanism. Different object.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mt-3 print:text-stone-600">
                QR needed 26 years and one forcing event — COVID — to become a reflex.
                Anchoring needs one forcing event: the first major case where an anchor wins
                and the absence of one loses. The AI Act. A plagiarism ruling. A contract dispute.
                The event will come from outside. The infrastructure needs to be in place before it does.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mt-3 print:text-stone-600">
                The standard sequence today: Generate. Edit. Share.<br />
                The missing action: <strong className="text-[hsl(40,15%,88%,0.9)]">Lock in time.</strong>
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mt-3 print:text-stone-600">
                When that action normalises, the primitive becomes infrastructure.
              </p>
              <p className="text-base text-[hsl(40,15%,88%,0.95)] mt-4 font-medium print:text-stone-900">
                Three minutes for permanent proof. That is the proposition.
              </p>
            </HighlightBox>
          </section>

          {/* Status */}
          <section>
            <SectionTitle>Status · March 2026</SectionTitle>
            <div className="grid grid-cols-3 gap-3 mb-4">
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
            <div className="space-y-1.5">
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
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-6 print:text-stone-600">
              Two connectors — one for each adoption path.
            </p>

            {/* Path 1 */}
            <div className="mb-6">
              <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-3">
                Adoption path 1 — Layers on top of the primitive
              </p>
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] p-5 print:bg-stone-50 print:border-stone-200">
                <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                  Notaries, digital signing, legal tech, attestation, compliance.
                  They understand the primitive. They build their layer on top.
                  We stay the foundation. They own their layer.
                </p>
                <p className="text-sm text-[hsl(40,15%,88%,0.9)] font-medium mt-3 print:text-stone-800">
                  Build your layer on top. We stay the primitive.
                </p>
              </div>
            </div>

            {/* Path 2 */}
            <div className="mb-6">
              <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-3">
                Adoption path 2 — Places Umarise under their existing system
              </p>
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] p-5 print:bg-stone-50 print:border-stone-200">
                <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed print:text-stone-600">
                  Large enterprises, mid-size companies, social media platforms, AI platforms,
                  universities, foundations, research institutions.
                  They change nothing in their workflow. Umarise is added silently underneath.
                </p>
                <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mt-3 print:text-stone-600">
                  This path needs a connector who opens doors at the decision-maker level —
                  an ecosystem thinker with a broad network who can place one question
                  in the right room at the right moment.
                </p>
                <p className="text-sm text-[hsl(40,15%,88%,0.9)] font-medium mt-3 italic print:text-stone-800">
                  "What are you already storing that a timestamp would make defensible?"
                </p>
                <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-3 print:text-stone-500">
                  Early adopters: universities anchoring research datasets, AI platforms anchoring
                  model outputs, content platforms anchoring publications, corporates anchoring
                  contracts and internal records.
                </p>
              </div>
            </div>

            {/* What connectors are */}
            <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-3">
              What both connectors are — and are not
            </p>
            <div className="space-y-3 mb-4">
              {[
                { title: 'Not an investor', desc: 'No equity, no board seat, no cap table.' },
                { title: 'Not a salesperson', desc: 'Adopters integrate themselves. The connector plants the question, Umarise handles everything after the door opens.' },
                { title: 'Not a co-founder', desc: 'A bridge builder who translates "cryptographic anchoring" into the language of the room they are in.' },
              ].map(({ title, desc }) => (
                <BorderItem key={title} title={title} desc={desc} />
              ))}
            </div>

            <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-3">
              How it works
            </p>
            <DataTable
              headers={['The connector', 'Umarise']}
              rows={[
                ['Plants the question', 'Provides the one-pager and demo'],
                ['Identifies the use case', 'Maps it to the API contract'],
                ['Introduces the decision maker', 'Handles technical onboarding'],
                ['Follows up on adoption', 'Delivers SDK, docs, and support'],
              ]}
            />
          </section>

          {/* The line */}
          <section>
            <SectionTitle>The line that does not move</SectionTitle>
            <HighlightBox>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed print:text-stone-600">
                Services on top of the primitive create value. That is good.
                Partners should build them. Notaries, signing providers, attestation services —
                they add layers. That is exactly how infrastructure works.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                But Umarise does not build those services. Umarise guards the primitive.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                The instinct to add — a dashboard, an account system, a workflow tool,
                a compliance feature — is always logical in the moment.
                It is always wrong for the primitive.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mt-3 print:text-stone-600">
                The moment the primitive becomes a platform, it stops being infrastructure.
                A primitive with a dashboard is a SaaS.
                A primitive without one is the SSL certificate for proof of existence.
              </p>
              <p className="text-base text-[hsl(40,15%,88%,0.95)] mt-4 font-medium print:text-stone-900">
                You build the services. We guard the primitive.
              </p>
              <p className="text-sm text-[hsl(40,15%,88%,0.5)] mt-3 print:text-stone-500">
                If it looks even one millimeter like a platform: no. That line does not move.
              </p>
            </HighlightBox>
          </section>

          {/* Strategic adoption targets */}
          <section>
            <SectionTitle>Strategic adoption targets</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.6)] leading-relaxed mb-4 print:text-stone-600">
              Three organisations that fit Adoption Path 2 — anchoring placed silently underneath their existing systems.
              Selected for visibility, technical fit, and narrative impact.
            </p>

            <div className="space-y-6 mb-6">
              {/* Mistral AI */}
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 print:bg-stone-50 print:border-stone-200">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)]">Mistral AI</p>
                  <span className="font-mono text-[10px] text-emerald-400/70">Highest feasibility</span>
                </div>
                <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mb-3 print:text-stone-600">
                  French AI company, open-source LLMs, EU-based, developer culture.
                </p>
                <div className="space-y-2">
                  <BorderItem title="Why now" desc="EU AI Act requires training data traceability. Mistral's open-source ethos demands verifiable transparency. Anchoring makes that transparency provable." />
                  <BorderItem title="Integration" desc="umarise proof dataset-v3.parquet in data pipeline. Each model release ships with a .proof file alongside the model weights." />
                  <BorderItem title="Narrative" desc="'Mistral anchors their training data' reaches every AI developer on Hacker News." />
                </div>
              </div>

              {/* GPT-NL */}
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 print:bg-stone-50 print:border-stone-200">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)]">GPT-NL</p>
                  <span className="font-mono text-[10px] text-[hsl(25,35%,42%,0.7)]">Highest impact</span>
                </div>
                <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mb-3 print:text-stone-600">
                  Dutch government AI initiative, funded by EZK, building a sovereign language model.
                </p>
                <div className="space-y-2">
                  <BorderItem title="Why now" desc="Public AI must account for what goes in. AI Act compliance is not optional for a government initiative. Anchoring proves which data existed before training." />
                  <BorderItem title="Integration" desc="Every dataset used as training input is hashed and anchored. At audit: proof that data was unmodified at time of ingestion." />
                  <BorderItem title="Narrative" desc="'The Dutch government AI anchors its inputs' is a reference nobody ignores." />
                </div>
              </div>

              {/* EUI */}
              <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)] p-5 print:bg-stone-50 print:border-stone-200">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)]">European University Institute</p>
                  <span className="font-mono text-[10px] text-[hsl(40,15%,88%,0.4)]">Academic validation</span>
                </div>
                <p className="text-sm text-[hsl(40,15%,88%,0.7)] leading-relaxed mb-3 print:text-stone-600">
                  Pan-European academic institute in Florence, policy research for the EU.
                </p>
                <div className="space-y-2">
                  <BorderItem title="Why now" desc="Research data must be reproducibly unmodified. Anchoring proves datasets existed at a specific moment. Peer reviewers can verify independently." />
                  <BorderItem title="Integration" desc="Research datasets anchored at publication. The .proof file becomes part of supplementary material." />
                  <BorderItem title="Narrative" desc="Academic adoption gives credibility that no startup reference can match." />
                </div>
              </div>
            </div>

            {/* Priority matrix */}
            <DataTable
              headers={['Criterion', 'Mistral AI', 'GPT-NL', 'EUI']}
              rows={[
                ['Speed of integration', '★★★★★', '★★', '★★'],
                ['Narrative impact', '★★★★', '★★★★★', '★★★'],
                ['Technical match', '★★★★★', '★★★★', '★★★'],
                ['Reachability', '★★★', '★★', '★★'],
              ]}
              totalRow={['Total', '17/20', '13/20', '10/20']}
            />
            <p className="text-xs text-[hsl(40,15%,88%,0.4)] mt-3 print:text-stone-500">
              Recommendation: start with Mistral AI (highest feasibility), use that result as reference for GPT-NL (highest impact).
            </p>
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

/* ── Shared sub-components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-['Playfair_Display'] text-lg font-light text-[hsl(40,15%,88%,0.9)] mb-5 print:text-stone-900">
      {children}
    </h2>
  );
}

function HighlightBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[hsl(25,35%,42%,0.2)] bg-[hsl(25,35%,42%,0.04)] p-6 print:bg-amber-50 print:border-amber-200 ${className}`}>
      {children}
    </div>
  );
}

function FeatureCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg border border-[hsl(40,15%,88%,0.06)] bg-[hsl(40,15%,88%,0.02)] print:bg-stone-50 print:border-stone-200">
      <p className="font-mono text-[11px] tracking-[2px] uppercase text-[hsl(25,35%,42%,0.7)] mb-1">{label}</p>
      <p className="text-xs text-[hsl(40,15%,88%,0.5)] print:text-stone-500">{desc}</p>
    </div>
  );
}

function BorderItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-5">
      <p className="font-medium text-sm text-[hsl(40,15%,88%,0.85)] print:text-stone-800">{title}</p>
      <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-0.5 print:text-stone-500">{desc}</p>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  totalRow,
  rightAlignLast,
}: {
  headers?: string[];
  rows: string[][];
  totalRow?: string[];
  rightAlignLast?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[hsl(40,15%,88%,0.08)] overflow-hidden print:border-stone-200">
      <table className="w-full text-sm">
        {headers && (
          <thead>
            <tr className="bg-[hsl(220,10%,10%)] print:bg-stone-100">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`p-3 text-[hsl(40,15%,88%,0.5)] font-mono text-xs uppercase tracking-wider print:text-stone-600 ${
                    rightAlignLast && i === headers.length - 1 ? 'text-right' : 'text-left'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="text-[hsl(40,15%,88%,0.7)] print:text-stone-700">
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`p-3 ${
                    rightAlignLast && ci === row.length - 1
                      ? 'text-right font-mono text-[hsl(25,35%,42%,0.7)]'
                      : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {totalRow && (
            <tr className="border-t-2 border-[hsl(40,15%,88%,0.15)] print:border-stone-300">
              {totalRow.map((cell, ci) => (
                <td
                  key={ci}
                  className={`p-3 font-medium ${
                    ci === 0
                      ? 'text-[hsl(40,15%,88%,0.9)]'
                      : 'text-right font-mono text-[hsl(25,35%,42%,0.9)]'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
