 import { Link } from 'react-router-dom';
 import { ArrowLeft } from 'lucide-react';
 import { OriginMark } from '@/components/prototype/components/OriginMark';
 
 /**
  * Umarise: Why Origin Attestation
  * Market context and strategic positioning
  */
 export default function Why() {
   return (
     <div className="min-h-screen bg-landing-deep text-landing-cream">
       {/* Header */}
       <header className="border-b border-landing-muted/10">
         <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
           <Link 
             to="/" 
             className="flex items-center gap-2 text-landing-muted/50 hover:text-landing-cream transition-colors"
           >
             <ArrowLeft className="w-4 h-4" />
             <span className="text-sm">Back</span>
           </Link>
            <span className="font-serif text-lg text-landing-cream/80 flex items-center gap-2">
              <OriginMark size={16} state="anchored" variant="dark" />
              Umarise
            </span>
         </div>
       </header>
 
       {/* Content */}
       <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
         {/* Title */}
         <div className="mb-16">
           <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">
              Why Anchor Attestation
           </h1>
           <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
             Context
           </p>
         </div>
 
        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* The Problem */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">The Problem</h2>
            <p className="mb-4 text-landing-cream/90">
              Systems that process data cannot prove they received it unaltered.
            </p>
            <p className="mb-4">
              Internal logs, timestamps, and signatures are self-attested. They prove what the system claims, not what actually existed before the system touched it.
            </p>
            <p className="mb-4">
              This applies to any processing system. It becomes critical when the processing is automated. When an AI model reviews a contract, analyzes an image, or summarizes a document, no human witnesses what went in. The output is visible. The input is not independently verifiable.
            </p>
            <p className="text-landing-muted/60">
              When disputes arise, when audits occur, when provenance matters, internal evidence is insufficient.
            </p>
          </section>

          {/* The Shift */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">The Shift</h2>
            <p className="mb-4">
              Regulatory frameworks increasingly require demonstrable data provenance.
            </p>
            <p className="mb-4">
              The AI Act requires traceability and transparency for high-risk AI systems, including training data governance. C2PA defines content authenticity standards for media provenance. GDPR Article 5 mandates data accuracy and integrity. eIDAS 2.0 establishes qualified timestamps for legal validity.
            </p>
            <p className="text-landing-muted/50 text-sm">
              These frameworks share a common requirement: proof of what existed, when, from an independent source.
            </p>
          </section>

          {/* The Gap */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">The Gap</h2>
            <p className="mb-4 text-landing-cream/90">
              Content authenticity standards like C2PA address the lifecycle of media.
            </p>
            <p className="mb-4">
              But what about the moment before? The original input? The first capture?
            </p>
            <p className="text-landing-muted/60">
              Anchor attestation fills this gap. It establishes the starting point: verifiable, immutable, independent of downstream processing.
            </p>
          </section>

          {/* The Provenance Gap in Automated Workflows */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">The Provenance Gap in Automated Workflows</h2>
            <p className="mb-4 text-landing-cream/90">
              Automated systems transform data at scale. AI models, document processors, data pipelines. The provenance question they create is specific:
            </p>
            <p className="mb-4 text-landing-cream italic">
              What was the exact input before the system processed it?
            </p>
            <p className="mb-4">
              A contract reviewed by AI. A dataset ingested by a model. An image processed by an automated pipeline. In each case, the system produces output, but the original input has no independent record.
            </p>
            <p className="mb-4">
              Anchor attestation provides that record. A SHA-256 hash computed at the moment of intake establishes what existed before any processing occurred. The proof is anchored externally and verifiable without trusting the processing system.
            </p>
            <p className="text-landing-muted/60">
              This is not a feature of the processing system. It is independent infrastructure, the same way a timestamp from a Time-Stamping Authority is independent of the system that requests it.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">How It Works</h2>
            <p className="text-landing-muted/70">
              Data enters a system. A SHA-256 hash is computed at the moment of entry. The hash is submitted to Umarise Core. Umarise anchors the hash via OpenTimestamps to Bitcoin. The resulting proof is independently verifiable, forever.
            </p>
          </section>

          {/* Interoperability */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Interoperability</h2>
            <p className="mb-4">
              Umarise uses SHA-256, the same hash algorithm used by C2PA, Git, Bitcoin, and most content-addressable systems.
            </p>
            <p className="text-landing-muted/60">
              This means an anchor attestation can serve as the root of a C2PA provenance chain, or as an independent anchor for any system that computes SHA-256 hashes.
            </p>
          </section>

          {/* What Umarise Is Not */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">What Umarise Is Not</h2>
            <p className="text-landing-muted/70">
              Umarise does not manage content, authenticate media, enforce governance, or replace internal logging. It is an anchor layer. It establishes what existed when, and nothing more.
            </p>
          </section>
 
           {/* Reference */}
           <section className="border-t border-landing-muted/10 pt-12">
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Learn More</h2>
             <ul className="space-y-3">
                <li>
                  <Link to="/anchor" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                    Anchor One-Pager
                  </Link>
                  <span className="text-landing-muted/50 ml-2">: the normative mechanism</span>
                </li>
                <li>
                  <Link to="/legal" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                    Technical Specification
                  </Link>
                  <span className="text-landing-muted/50 ml-2">: technical details</span>
                </li>
                <li>
                  <Link to="/core" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                    Core API
                  </Link>
                  <span className="text-landing-muted/50 ml-2">: integration reference</span>
                </li>
             </ul>
           </section>
 
           {/* Contact */}
           <section className="border-t border-landing-muted/10 pt-12">
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Contact</h2>
             <a
               href="mailto:partners@umarise.com"
               className="text-landing-copper/70 hover:text-landing-copper transition-colors"
             >
               partners@umarise.com
             </a>
           </section>
 
         </div>
       </main>
 
       {/* Footer */}
       <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
         <p>© {new Date().getFullYear()} Umarise</p>
       </footer>
     </div>
   );
 }