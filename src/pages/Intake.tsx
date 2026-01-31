import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise — Origin Layer Intake
 * Qualification filter for design partnerships
 * RFC-style, infra-first tone
 */
export default function Intake() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      {/* Header */}
      <header className="border-b border-landing-muted/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Title block */}
        <div className="mb-12 md:mb-16">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-landing-cream mb-6">
            Origin Layer Intake
          </h1>
          <p className="text-landing-muted/70 text-lg max-w-2xl mb-4">
            Umarise is a neutral origin record layer.
          </p>
          <p className="text-landing-muted/70 max-w-2xl mb-4">
            It establishes a verifiable beginning of a digital artifact (hash + timestamp + origin ID) before transformation, and enables later independent verification.
          </p>
          <p className="text-landing-muted/60 text-sm italic max-w-2xl">
            This page exists to clarify whether Umarise belongs in your system — not to persuade you.
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">
          
          {/* What Umarise Is */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">What Umarise Is</h2>
            <p className="mb-4">Umarise provides a fixed infrastructure primitive:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li><span className="text-landing-copper">Establish origin</span> — write-once</li>
              <li><span className="text-landing-copper">Resolve origin metadata</span></li>
              <li><span className="text-landing-copper">Verify bit-identity</span> — match / no match</li>
            </ul>
            <p className="mb-4">It does not:</p>
            <ul className="space-y-1 ml-4 mb-4 text-landing-muted/60">
              <li>• store content</li>
              <li>• interpret meaning</li>
              <li>• apply policy</li>
              <li>• enforce governance</li>
            </ul>
            <p className="mb-4">
              Those responsibilities remain intentionally outside the origin layer.
            </p>
            <p className="text-landing-cream/90 italic">
              Umarise derives its value from being external, neutral, and limited. These constraints are not configuration choices — they are requirements.
            </p>
          </section>

          {/* When Umarise Belongs */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">When Umarise Belongs in a System</h2>
            <p className="mb-4">Umarise is appropriate when all of the following are true:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li>• Your system produces or receives artifacts that must be formally fixed</li>
              <li>• Those artifacts may later be reviewed, audited, or disputed</li>
              <li>• Internal logs, signatures, or storage are insufficient as proof</li>
              <li>• You need origin to be independently verifiable</li>
              <li>• You accept that proof may hold even when inconvenient</li>
              <li>• You can integrate a small API without redesigning your system</li>
            </ul>
            <p className="text-sm text-landing-muted/60">
              Typical environments include: AI platforms, contract automation, secure submissions, regulated or multi-party systems.
            </p>
          </section>

          {/* When Umarise Does Not Belong */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">When Umarise Does Not Belong</h2>
            <p className="mb-4">Umarise is likely not a fit if you primarily need:</p>
            <ul className="space-y-2 ml-4 mb-4 text-landing-muted/60">
              <li>• Exploratory pilots or experiments</li>
              <li>• Feature development or customization</li>
              <li>• Co-design or roadmap influence</li>
              <li>• Content storage or management</li>
              <li>• Policy enforcement or adjudication</li>
              <li>• Regional, political, or ownership narratives</li>
            </ul>
            <p className="text-sm text-landing-muted/60 italic">
              This is not a limitation of ambition — it is a boundary of function.
            </p>
          </section>

          {/* How Integration Works */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">How Integration Works</h2>
            <p className="mb-4">Integration is intentionally minimal and deterministic:</p>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg p-4 font-mono text-sm mb-4">
              <div className="space-y-2">
                <p><span className="text-landing-copper">POST /origins</span> — establish origin (write-once)</p>
                <p><span className="text-landing-copper">GET /resolve</span> — retrieve origin metadata</p>
                <p><span className="text-landing-copper">POST /verify</span> — verify against a provided artifact</p>
              </div>
            </div>
            <p className="mb-2">You decide when to anchor.</p>
            <p className="mb-2">You retain full custody of all content.</p>
            <p className="mb-4">Verification remains binary: match or no match.</p>
            <p className="text-sm text-landing-muted/60 italic">
              If broader behavior is required, it belongs above the origin layer.
            </p>
          </section>

          {/* How Umarise Is Maintained */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">How Umarise Is Maintained</h2>
            <ul className="space-y-4 ml-4">
              <li>
                <span className="text-landing-copper font-medium">Invariant-first</span>
                <p className="text-landing-muted/60 mt-1">The core behavior of the origin layer is fixed.</p>
              </li>
              <li>
                <span className="text-landing-copper font-medium">Async by default</span>
                <p className="text-landing-muted/60 mt-1">Precision and scalability require written interaction.</p>
              </li>
              <li>
                <span className="text-landing-copper font-medium">Limited concurrency</span>
                <p className="text-landing-muted/60 mt-1">The origin layer is introduced carefully, one system at a time.</p>
              </li>
            </ul>
            <p className="mt-4 text-sm text-landing-muted/60">
              Occasionally, synchronous discussion is useful — but only when an invariant-level question emerges.
            </p>
          </section>

          {/* Before Contacting */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Before Contacting Umarise</h2>
            <p className="mb-4">You should be able to answer:</p>
            <ol className="space-y-2 ml-4 mb-4 list-decimal list-inside">
              <li>What exact moment in your system requires a verifiable beginning?</li>
              <li>What happens today if that moment is questioned?</li>
              <li>Why internal evidence is insufficient?</li>
              <li>What changes if origin becomes externally verifiable?</li>
            </ol>
            <p className="text-sm text-landing-muted/60 italic">
              If these answers are unclear, the origin layer is likely premature.
            </p>
          </section>

          {/* What Engagement Looks Like */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">What Engagement Looks Like</h2>
            <p className="mb-4">Early integrations typically involve:</p>
            <ul className="space-y-1 ml-4 mb-4">
              <li>• Access to the Umarise API</li>
              <li>• Direct, asynchronous communication with the maintainer</li>
              <li>• No cost during the design phase</li>
              <li>• No obligation to continue</li>
            </ul>
            <p className="mb-4">In return, Umarise expects:</p>
            <ul className="space-y-1 ml-4 mb-4 text-landing-copper/80">
              <li>• a real integration</li>
              <li>• real usage</li>
              <li>• real constraints</li>
            </ul>
            <p className="text-sm text-landing-muted/60 italic">
              Not hypothetical exploration.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-landing-muted/10 pt-8">
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Contact</h2>
            <p className="mb-4">If this description matches your system, send a short note including:</p>
            <ul className="space-y-1 ml-4 mb-4">
              <li>• System type</li>
              <li>• The moment you intend to anchor</li>
              <li>• Why existing proof mechanisms fall short</li>
              <li>• A technical contact</li>
            </ul>
            <p className="text-sm text-landing-muted/60 mb-6">No pitch materials are required.</p>
            <a
              href="mailto:partners@umarise.com?subject=Integration%20Intake"
              className="text-landing-copper/70 hover:text-landing-copper transition-colors"
            >
              partners@umarise.com
            </a>
          </section>

          {/* Why This Exists */}
          <section className="border-t border-landing-muted/10 pt-8">
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Why This Exists</h2>
            <p className="mb-4">
              Modern systems can transform data endlessly, but cannot independently prove what existed at the beginning.
            </p>
            <p className="mb-4">
              As systems become more automated, distributed, and contested, origin must become a first-class primitive.
            </p>
            <p className="text-landing-cream/90 italic">
              Umarise exists to make beginnings verifiable — before interpretation starts.
            </p>
          </section>

          {/* Historical Context */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Historical Context</h2>
            <p className="mb-4">Every mature digital system eventually externalizes its fundamentals:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li><span className="text-landing-copper">DNS</span> externalized naming</li>
              <li><span className="text-landing-copper">Certificate Authorities</span> externalized identity</li>
              <li><span className="text-landing-copper">Time services</span> externalized ordering</li>
            </ul>
            <p className="mb-4">Origin follows the same pattern — later, and under more pressure.</p>
            <p className="text-landing-cream/90 italic">
              Umarise is not an innovation layer. It is the externalization of origin itself.
            </p>
          </section>

          {/* Kill Criteria */}
          <section>
            <h2 className="text-xl font-semibold text-landing-cream mb-4">Kill Criteria — When Not to Use Umarise</h2>
            <p className="mb-4">Do not use Umarise if:</p>
            <ul className="space-y-2 ml-4 mb-4">
              <li>• Your system must be able to revise or erase its past</li>
              <li>• Interpretation is more important than fixity</li>
              <li>• You require governance, exceptions, or discretionary overrides</li>
              <li>• Proof must align with internal policy rather than external verification</li>
              <li>• You are unwilling to accept evidence that may contradict your position</li>
            </ul>
            <p className="mb-4 text-sm text-landing-muted/60">
              In these cases, internal logging or platform control is more appropriate.
            </p>
            <p className="text-landing-cream/90 italic">
              Umarise is only correct where immutability outweighs flexibility.
            </p>
          </section>

          {/* One-line summary */}
          <section className="border-t border-landing-muted/10 pt-8">
            <p className="text-lg text-landing-cream mb-2">
              Umarise establishes origin.
            </p>
            <p className="text-landing-copper/80">
              Everything else remains external.
            </p>
          </section>

          {/* Closing */}
          <section className="text-sm text-landing-muted/50 italic">
            <p>
              Umarise does not optimize systems. It constrains them — so their history can hold.
            </p>
          </section>

        </div>
      </main>

      {/* Page footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
