import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise: Partner Intake
 * Internal operational document — behind PinGate
 * 
 * Based on partner-intake-v2.html reference.
 * Not a public page. Not marketing. A qualification document.
 */
export default function Intake() {
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
            Partner Intake
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            Origin Layer Intake
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Opening */}
          <section>
            <p className="text-landing-cream/90">
              This page exists to clarify whether Umarise belongs in your system, not to persuade you.
            </p>
            <p className="mt-4">
              Umarise is a neutral origin record layer. It establishes proof that a digital artifact existed at a specific moment in time: hash + timestamp + origin ID, before transformation, and enables later independent verification.
            </p>
            <p className="mt-4 text-landing-cream/70">
              It proves existence at time T. Not first creation worldwide. Not ownership. Not meaning.
            </p>
          </section>

          {/* What Umarise Is */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">What Umarise Is</h2>
            <p className="mb-4">Umarise provides a fixed infrastructure primitive:</p>
            <ul className="space-y-2 pl-4">
              <li><span className="text-landing-copper">Establish origin</span>: write-once, Bitcoin-anchored</li>
              <li><span className="text-landing-copper">Resolve metadata</span>: origin_id → hash, timestamp, proof status</li>
              <li><span className="text-landing-copper">Verify bit-identity</span>: match / no match</li>
              <li><span className="text-landing-copper">Download proof</span>: .ots file, independently verifiable</li>
            </ul>
            <p className="mt-4 text-landing-muted/60">
              It does not store content, interpret meaning, apply policy, or enforce governance. Those responsibilities remain intentionally outside the origin layer.
            </p>
            <p className="mt-4 text-landing-cream/70">
              Umarise derives its value from being external, neutral, and limited. These constraints are not configuration choices; they are requirements.
            </p>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">How It Works</h2>
            <p className="mb-6">
              Your system sends a SHA-256 hash to the Core API. Not a file: a hash. Umarise never sees, stores, or touches your content.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Step</th>
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">What Happens</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Where</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4 text-landing-copper">1. Hash</td>
                    <td className="py-2 pr-4">Your system calculates SHA-256 of the artifact</td>
                    <td className="py-2">Your infrastructure</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4 text-landing-copper">2. Establish</td>
                    <td className="py-2 pr-4">POST /v1-core-origins: hash → origin_id + timestamp</td>
                    <td className="py-2">Umarise Core</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4 text-landing-copper">3. Anchor</td>
                    <td className="py-2 pr-4">Hash is batched via OpenTimestamps and anchored in Bitcoin (~10–20 min)</td>
                    <td className="py-2">Bitcoin blockchain</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4 text-landing-copper">4. Verify</td>
                    <td className="py-2 pr-4">POST /v1-core-verify: hash → match / no match + timestamp + proof</td>
                    <td className="py-2">Umarise Core</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-landing-copper">5. Proof</td>
                    <td className="py-2 pr-4">GET /v1-core-proof: download .ots file</td>
                    <td className="py-2">Umarise Core → Bitcoin</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-landing-muted/50 text-sm">
              The .ots file is a standard OpenTimestamps proof. It can be verified against the Bitcoin blockchain by anyone, forever, without Umarise.
            </p>
            <p className="mt-2 text-landing-muted/50 text-sm">
              Verification is binary: match or no match. No gradations, no confidence scores, no interpretation.
            </p>
          </section>

          {/* What the Proof Contains */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">What the Proof Contains</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Layer</th>
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">What It Proves</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Survives Without Umarise?</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">SHA-256 hash</td>
                    <td className="py-2 pr-4">This exact artifact, byte for byte</td>
                    <td className="py-2 text-landing-copper">Yes (mathematics)</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Bitcoin timestamp (.ots)</td>
                    <td className="py-2 pr-4">This hash existed before this block</td>
                    <td className="py-2 text-landing-copper">Yes (Bitcoin + OTS verifier)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Origin metadata</td>
                    <td className="py-2 pr-4">origin_id, timestamp, proof status</td>
                    <td className="py-2 text-landing-muted/50">No (requires API)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-landing-muted/50 text-sm">
              For a technical description of Origin Records, see <Link to="/legal" className="text-landing-copper/70 hover:text-landing-copper transition-colors">umarise.com/legal</Link>.
            </p>
          </section>

          {/* When Umarise Belongs */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">When Umarise Belongs in a System</h2>
            <p className="mb-4">Umarise is appropriate when all of the following are true:</p>
            <ol className="space-y-2 pl-4 list-decimal">
              <li>Your system produces or receives artifacts that must be formally fixed</li>
              <li>Those artifacts may later be reviewed, audited, or disputed</li>
              <li>Internal logs, signatures, or storage are insufficient as proof</li>
              <li>You need origin to be independently verifiable, not "trust us" but "verify it yourself"</li>
              <li>You accept that proof may hold even when inconvenient</li>
              <li>You can integrate a small API without redesigning your system</li>
            </ol>
            <p className="mt-4 text-landing-muted/50 text-sm">
              Typical environments: insurance claims, medical documentation, construction progress, creative IP, contract automation, regulated or multi-party systems.
            </p>
          </section>

          {/* When Umarise Does Not Belong */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">When Umarise Does Not Belong</h2>
            <p className="mb-4">Do not use Umarise if:</p>
            <ul className="space-y-2 pl-4 text-landing-muted/60">
              <li>Your system must be able to revise or erase its past</li>
              <li>Interpretation is more important than fixity</li>
              <li>You require governance, exceptions, or discretionary overrides</li>
              <li>Proof must align with internal policy rather than external verification</li>
              <li>You are unwilling to accept evidence that may contradict your position</li>
              <li>You need full provenance tracking (who edited what, when). That is C2PA, not Origin</li>
              <li>You need to identify users by name. Origin records no PII</li>
            </ul>
            <p className="mt-4 text-landing-muted/50 text-sm italic">
              This is not a limitation of ambition; it is a boundary of function.
            </p>
          </section>

          {/* Historical Context */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Historical Context</h2>
            <p className="mb-4">Every mature digital system eventually externalizes its fundamentals:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">What Was Externalized</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">By</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Naming</td>
                    <td className="py-2">DNS</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Identity</td>
                    <td className="py-2">Certificate Authorities</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-2 pr-4">Ordering</td>
                    <td className="py-2">Time services (NTP, TSA)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Origin</td>
                    <td className="py-2 text-landing-cream/70">Later, and under more pressure</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-landing-cream/70">
              A TSA anchors the finished result: the document, the contract, the signed artifact. Umarise anchors the unfinished beginning: the sketch, the first photo, the raw data before any system touches it.
            </p>
            <p className="mt-4 text-landing-muted/50 text-sm">
              Umarise is not an innovation layer. It is the externalization of origin itself.
            </p>
          </section>

          {/* How Integration Is Maintained */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">How Integration Is Maintained</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-landing-cream/90 mb-2">Invariant-first</h3>
                <p className="text-landing-muted/60">
                  The core behavior of the origin layer is fixed. Core v1 is frozen. No breaking changes, no feature additions, no version churn. What you integrate today works identically in five years.
                </p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 mb-2">Hash-only boundary</h3>
                <p className="text-landing-muted/60">
                  Your content never touches Umarise infrastructure. Architecturally impossible; there is no column for content in the data model. This is not a policy; it is a constraint enforced by schema.
                </p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 mb-2">Limited concurrency</h3>
                <p className="text-landing-muted/60">
                  The origin layer is introduced carefully, one system at a time. Asynchronous communication by default. Synchronous discussion only when an invariant-level question emerges.
                </p>
              </div>
            </div>
          </section>

          {/* Before Contacting Umarise */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Before Contacting Umarise</h2>
            <p className="mb-4">You should be able to answer:</p>
            <ol className="space-y-2 pl-4 list-decimal">
              <li>What exact moment in your system requires a verifiable beginning?</li>
              <li>What happens today if that moment is questioned?</li>
              <li>Why is internal evidence insufficient?</li>
              <li>What changes if origin becomes externally verifiable?</li>
            </ol>
            <p className="mt-4 text-landing-muted/50 text-sm italic">
              If these answers are unclear, the origin layer is likely premature.
            </p>
          </section>

          {/* What Engagement Looks Like */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">What Engagement Looks Like</h2>
            <p className="mb-4">Early integrations typically involve:</p>
            <ul className="space-y-2 pl-4 text-landing-muted/70">
              <li>Access to the Umarise Core API</li>
              <li>Direct, asynchronous communication with the maintainer</li>
              <li>No cost during the design phase</li>
              <li>No obligation to continue</li>
            </ul>
            <p className="mt-4">In return, Umarise expects:</p>
            <ul className="space-y-2 pl-4 text-landing-muted/70">
              <li>A real integration</li>
              <li>Real usage</li>
              <li>Real constraints</li>
              <li>Not hypothetical exploration</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Contact</h2>
            <p className="mb-4">If this description matches your system, send a short note including:</p>
            <ul className="space-y-2 pl-4 text-landing-muted/70 mb-6">
              <li>System type</li>
              <li>The moment you intend to anchor</li>
              <li>Why existing proof mechanisms fall short</li>
              <li>A technical contact</li>
            </ul>
            <p className="text-landing-muted/50 text-sm mb-6">No pitch materials are required.</p>
            <a
              href="mailto:partners@umarise.com"
              className="text-landing-copper/70 hover:text-landing-copper transition-colors"
            >
              partners@umarise.com
            </a>
          </section>

          {/* Closing */}
          <section className="border-t border-landing-muted/10 pt-12">
            <p className="text-landing-cream/90 mb-4">
              Modern systems can transform data endlessly, but cannot independently prove what existed at the beginning. As systems become more automated, distributed, and contested, origin must become a first-class primitive.
            </p>
            <p className="text-landing-cream/70 mb-6">
              Umarise exists to make beginnings verifiable, before interpretation starts.
            </p>
            <p className="text-landing-copper italic">
              Umarise establishes origin. Everything else remains external.
            </p>
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
