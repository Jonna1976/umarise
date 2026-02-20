import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Anchoring.app: Why Anchoring Exists (B2C)
 * Consumer-focused, architectural focus on independence and resilience.
 */
export default function AnchoringWhy() {
  return (
    <div className="min-h-screen bg-ritual-surface text-ritual-cream selection:bg-ritual-copper/30">
      {/* Header */}
      <header className="border-b border-ritual-cream/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-ritual-cream/50 hover:text-ritual-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-light">Back</span>
          </Link>
           <span className="font-playfair text-lg text-ritual-cream/80 font-light">
             anchoring.app
           </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-24">
        {/* Title */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="font-playfair text-4xl md:text-5xl font-light text-ritual-cream mb-4 tracking-tight">
             Why anchoring exists
          </h1>
          <p className="text-ritual-cream/40 text-sm uppercase tracking-widest font-light">
            Independence by Architecture
          </p>
        </motion.div>

       {/* Document content */}
       <div className="space-y-16 text-ritual-cream/80 leading-relaxed font-light text-lg">

         {/* Section: We make the proof. Then we step away. */}
         <section className="space-y-6">
           <h2 className="text-xl md:text-2xl font-playfair text-ritual-cream font-light italic">
             We make the proof. Then we step away.
           </h2>
           <p>
             Most digital proof systems work the same way: someone else holds the confirmation for you.
           </p>
           <p>
             Your creation date lives in a platform log. Your version history lives in a database. Your timestamp certificate lives in a service endpoint. All of these depend on the platform staying online, the terms not changing, the company continuing to exist.
           </p>
           <p>
             When the platform disappears, your proof disappears with it.
           </p>
           <p className="text-ritual-cream">
             We built anchoring differently.
           </p>
         </section>

         <div className="h-px bg-ritual-cream/5 w-12" />

         {/* Section: What happens when you anchor */}
         <section className="space-y-6">
           <h3 className="text-ritual-cream/50 text-sm uppercase tracking-widest font-normal">What happens when you anchor</h3>
           <p>
             The hash of your file is computed on your device. Your content never leaves. There is no content column in our data model. This is architecture, not policy.
           </p>
           <p>
             The hash is registered once. It cannot be modified or deleted. Database constraints enforce this, not promises.
           </p>
           <p>
             The hash is anchored in Bitcoin via OpenTimestamps. Every hour, batched via Merkle tree. The proof uses an open format. Anyone can verify it against Bitcoin, without us.
           </p>
           <p>
             The ZIP is yours. It contains everything: your original file, the certificate, the proof. No account needed to open it. No server needed to verify it.
           </p>
           <p className="text-ritual-cream/60">
             There is nothing to revoke. Nothing to put behind a paywall. Nothing to make you dependent on.
           </p>
         </section>

         {/* Section: What you get */}
         <section className="space-y-6">
           <h3 className="text-ritual-cream/50 text-sm uppercase tracking-widest font-normal">What you get</h3>
           <p>
             A verifiable record that your file existed at a specific moment in time.
           </p>
           <p>
             Not authorship. Not ownership. Not a legal guarantee. One provable fact: these exact bytes existed here, at this time. What you do with that fact is yours.
           </p>
           <p>
             If the moment ever matters, the proof is there. If it never matters, the proof costs you nothing to keep.
           </p>
         </section>

         {/* Section: Why it is free */}
         <section className="space-y-6">
           <h3 className="text-ritual-cream/50 text-sm uppercase tracking-widest font-normal">Why it is free</h3>
           <p>
             After your anchor is issued, there is nothing for us to store, manage, or host.
           </p>
           <p>
             The hash is batched and anchored. Marginal cost approaches zero. There is no per-user data being managed, so there is no per-user cost to pass on.
           </p>
           <p className="italic text-ritual-cream/70">
             Free here is a consequence of how this is built. Not a marketing choice.
           </p>
         </section>

         {/* Section: One thing we ask you to trust */}
         <section className="space-y-6 border-l border-ritual-copper/30 pl-8 py-2">
           <h3 className="text-ritual-cream/50 text-sm uppercase tracking-widest font-normal">One thing we ask you to trust</h3>
           <p>
             We record the correct hash at the correct moment. That is the one action that requires trusting us.
           </p>
           <p>
             After that, the trust transfers to Bitcoin. We cannot alter a recorded hash without the verification failing immediately and visibly. The proof is cryptographically bound to what was submitted.
           </p>
           <p className="text-ritual-cream/60">
             This is the difference between asking for permanent trust and asking for trust once.
           </p>
         </section>

         {/* Section: The test we apply to every decision */}
         <section className="space-y-6">
           <h3 className="text-ritual-cream/50 text-sm uppercase tracking-widest font-normal">The test we apply to every decision</h3>
           <p>
             Does this choice make you dependent on us for the validity of your proof?
           </p>
           <p>
             If yes, we do not build it.
           </p>
           <p className="text-ritual-cream/40">
             That is not a value statement. It is a constraint we place on ourselves.
           </p>
         </section>

         {/* Footer signature */}
         <section className="pt-20 text-center">
            <p className="text-ritual-cream italic font-playfair mb-2">Drop. Save. Verify. Optional.</p>
            <p className="text-ritual-cream/30 text-xs tracking-[0.3em] uppercase">anchoring.app</p>
         </section>

       </div>
      </main>

      {/* Footer with Continuity Badge */}
      <footer className="py-12 text-center space-y-6">
        {/* Continuity Badge */}
        <div className="flex justify-center">
          <a
            href="/architecture#continuity-guarantee"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-ritual-copper/25 bg-ritual-copper/5 hover:bg-ritual-copper/10 hover:border-ritual-copper/40 transition-all duration-300 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-ritual-copper/60 group-hover:bg-ritual-copper transition-colors" />
            <span className="text-[10px] tracking-[0.25em] uppercase font-light text-ritual-cream/40 group-hover:text-ritual-cream/60 transition-colors">
              Continuity Guarantee
            </span>
            <span className="text-ritual-cream/20 group-hover:text-ritual-cream/40 text-[10px] transition-colors">→</span>
          </a>
        </div>

        <p className="text-[10px] text-ritual-cream/20 tracking-widest uppercase font-light">
          © 2026 anchoring.app
        </p>
      </footer>
    </div>
  );
}
