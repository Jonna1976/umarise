 import { Link } from 'react-router-dom';
 import { ArrowLeft } from 'lucide-react';
 
 /**
  * Umarise — Why Origin Attestation
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
           <span className="font-serif text-lg text-landing-cream/80">Umarise</span>
         </div>
       </header>
 
       {/* Content */}
       <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
         {/* Title */}
         <div className="mb-16">
           <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">
             Why Origin Attestation
           </h1>
           <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
             Context
           </p>
         </div>
 
         {/* Document content */}
         <div className="space-y-12 text-landing-muted/80 leading-relaxed">
 
           {/* The Problem */}
           <section>
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">The Problem</h2>
             <p className="mb-4 text-landing-cream/90">
               Systems that process data cannot prove they received it unaltered.
             </p>
             <p className="mb-4">
               Internal logs, timestamps, and signatures are self-attested. They prove what the system claims — not what actually existed before the system touched it.
             </p>
             <p className="text-landing-muted/60">
               When disputes arise, when audits occur, when provenance matters — internal evidence is insufficient.
             </p>
           </section>
 
           {/* The Shift */}
           <section>
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">The Shift</h2>
             <p className="mb-4">
               Regulatory frameworks increasingly require demonstrable data provenance:
             </p>
             <ul className="space-y-2 text-landing-muted/70 mb-4">
               <li><span className="text-landing-copper">AI Act</span> — transparency requirements for training data and model inputs</li>
               <li><span className="text-landing-copper">C2PA</span> — content authenticity standards for media provenance</li>
               <li><span className="text-landing-copper">GDPR Article 5</span> — data accuracy and integrity requirements</li>
               <li><span className="text-landing-copper">eIDAS 2.0</span> — qualified timestamps for legal validity</li>
             </ul>
             <p className="text-landing-muted/50 text-sm">
               These frameworks share a common requirement: proof of what existed, when, from an independent source.
             </p>
           </section>
 
           {/* The Gap */}
           <section>
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">The Gap</h2>
             <p className="mb-4 text-landing-cream/90">
               Content authenticity standards like C2PA address the lifecycle of media.
             </p>
             <p className="mb-4">
               But what about the moment before? The original input? The first capture?
             </p>
             <p className="text-landing-muted/60">
               Origin attestation fills this gap. It establishes the starting point — verifiable, immutable, independent of downstream processing.
             </p>
           </section>
 
           {/* How It Works */}
           <section className="border-l-2 border-landing-copper/30 pl-6">
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">How It Works</h2>
             <ol className="space-y-3 text-landing-muted/70">
               <li><span className="text-landing-copper">1.</span> Data enters a system</li>
               <li><span className="text-landing-copper">2.</span> A SHA-256 hash is computed at the moment of entry</li>
               <li><span className="text-landing-copper">3.</span> The hash is submitted to Umarise Core</li>
               <li><span className="text-landing-copper">4.</span> Umarise anchors the hash via OpenTimestamps to Bitcoin</li>
               <li><span className="text-landing-copper">5.</span> The resulting proof is independently verifiable — forever</li>
             </ol>
           </section>
 
           {/* Interoperability */}
           <section>
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Interoperability</h2>
             <p className="mb-4">
               Umarise uses SHA-256 — the same hash algorithm used by C2PA, Git, Bitcoin, and most content-addressable systems.
             </p>
             <p className="text-landing-muted/60">
               This means an origin attestation can serve as the root of a C2PA provenance chain, or as an independent anchor for any system that computes SHA-256 hashes.
             </p>
           </section>
 
           {/* What Umarise Is Not */}
           <section>
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">What Umarise Is Not</h2>
             <ul className="space-y-2 text-landing-muted/70">
               <li>Not a content management system</li>
               <li>Not a media authenticity platform</li>
               <li>Not a governance or policy layer</li>
               <li>Not a replacement for internal logging</li>
             </ul>
             <p className="mt-4 text-landing-cream/70">
               Umarise is an origin layer — it establishes what existed when, and nothing more.
             </p>
           </section>
 
           {/* Reference */}
           <section className="border-t border-landing-muted/10 pt-12">
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Learn More</h2>
             <ul className="space-y-3">
               <li>
                 <Link to="/origin" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                   Origin One-Pager
                 </Link>
                 <span className="text-landing-muted/50 ml-2">— the normative mechanism</span>
               </li>
               <li>
                 <Link to="/spec" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                   Specification
                 </Link>
                 <span className="text-landing-muted/50 ml-2">— technical details</span>
               </li>
               <li>
                 <Link to="/core" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                   Core API
                 </Link>
                 <span className="text-landing-muted/50 ml-2">— integration reference</span>
               </li>
             </ul>
           </section>
 
           {/* Contact */}
           <section className="border-t border-landing-muted/10 pt-12">
             <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Contact</h2>
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