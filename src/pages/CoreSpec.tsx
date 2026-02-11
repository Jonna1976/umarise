import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OriginMark } from '@/components/prototype/components/OriginMark';

/**
 * Umarise Core: Public Specification
 * 
 * Minimal, normative, infrastructure-grade.
 * No SDK, no onboarding, no marketing.
 */
export default function CoreSpec() {
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
            Umarise Core
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            v1. Stable Interface
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Purpose */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Purpose</h2>
            <p className="text-landing-cream/90">
              Umarise Core provides immutable attestation that a cryptographic hash existed at a specific moment in time.
            </p>
            <p className="mt-4 text-landing-muted/60">
              Core accepts hashes only.<br />
              No bytes. No labels. No metadata. No artifacts.
            </p>
          </section>

          {/* Normative Documents */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Normative Documents</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/anchor" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Anchor One-Pager
                </Link>
                <span className="text-landing-muted/50 ml-2">: when and why anchor attestation is correct</span>
              </li>
              <li>
                <Link to="/legal" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Anchor Record Specification
                </Link>
                <span className="text-landing-muted/50 ml-2">: the normative definition of an Anchor Record</span>
              </li>
            </ul>
            <p className="mt-4 text-landing-muted/50 text-sm">
              These documents define correct use and constraints.
            </p>
          </section>

          {/* API Contract */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              API Contract <span className="normal-case">(Non-Normative Summary)</span>
            </h2>
            
            <div className="space-y-6 font-mono text-sm">
              {/* POST /v1-core-origins */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3 flex items-center gap-2">
                  <OriginMark size={12} state="pending" variant="light" />
                  <span>POST /v1-core-origins</span>
                </div>
                <div className="space-y-2 text-landing-muted/70">
                  <div><span className="text-landing-muted/50">Input:</span> <span className="text-landing-cream/80">{"{ hash }"}</span></div>
                  <div><span className="text-landing-muted/50">Output:</span> <span className="text-landing-cream/80">{"{ origin_id, hash, hash_algo, captured_at, proof_status, proof_url }"}</span></div>
                  <div><span className="text-landing-muted/50">Access:</span> <span className="text-landing-cream/80">Permissioned (X-API-Key header)</span></div>
                </div>
              </div>

              {/* GET /v1-core-resolve */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3 flex items-center gap-2">
                  <OriginMark size={12} state="anchored" variant="light" />
                  <span>GET /v1-core-resolve</span>
                </div>
                <div className="space-y-2 text-landing-muted/70">
                  <div><span className="text-landing-muted/50">Input:</span> <span className="text-landing-cream/80">origin_id or hash</span></div>
                  <div><span className="text-landing-muted/50">Output:</span> <span className="text-landing-cream/80">{"{ origin_id, hash, hash_algo, captured_at }"}</span> <span className="text-landing-muted/50">or 404</span></div>
                  <div><span className="text-landing-muted/50">Access:</span> <span className="text-landing-cream/80">Public</span></div>
                </div>
              </div>

              {/* POST /v1-core-verify */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3 flex items-center gap-2">
                  <OriginMark size={12} state="anchored" variant="light" />
                  <span>POST /v1-core-verify</span>
                </div>
                <div className="space-y-2 text-landing-muted/70">
                  <div><span className="text-landing-muted/50">Input:</span> <span className="text-landing-cream/80">{"{ hash }"}</span></div>
                  <div><span className="text-landing-muted/50">Output:</span> <span className="text-landing-cream/80">{"{ origin_id, hash, hash_algo, captured_at, proof_status, proof_url }"}</span> <span className="text-landing-muted/50">or 404</span></div>
                  <div><span className="text-landing-muted/50">Access:</span> <span className="text-landing-cream/80">Public</span></div>
                </div>
              </div>

              {/* GET /v1-core-proof */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3 flex items-center gap-2">
                  <OriginMark size={12} state="anchored" variant="light" />
                  <span>GET /v1-core-proof?origin_id=&#123;uuid&#125;</span>
                </div>
                <div className="space-y-2 text-landing-muted/70">
                  <div><span className="text-landing-muted/50">Input:</span> <span className="text-landing-cream/80">origin_id (query parameter)</span></div>
                  <div><span className="text-landing-muted/50">Output:</span> <span className="text-landing-cream/80">Binary .ots file</span> <span className="text-landing-muted/50">(200), pending status (202), or 404</span></div>
                  <div><span className="text-landing-muted/50">Access:</span> <span className="text-landing-cream/80">Public</span></div>
                  <div><span className="text-landing-muted/50">Note:</span> <span className="text-landing-muted/60">Returns the OpenTimestamps proof file for trustless, independent verification against the Bitcoin blockchain.</span></div>
                </div>
              </div>

              {/* GET /v1-core-health */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <div className="text-landing-copper mb-3">GET /v1-core-health</div>
                <div className="space-y-2 text-landing-muted/70">
                  <div><span className="text-landing-muted/50">Output:</span> <span className="text-landing-cream/80">{"{ status, version, timestamp }"}</span></div>
                  <div><span className="text-landing-muted/50">Access:</span> <span className="text-landing-cream/80">Public</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Access Model */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Access Model</h2>
            <p className="text-landing-cream text-lg mb-4">
              Verification is public. Attestation is permissioned.
            </p>
            <ul className="space-y-2 text-landing-muted/70 mb-6">
              <li><span className="text-landing-cream/80">GET /v1-core-resolve</span>: public</li>
              <li><span className="text-landing-cream/80">POST /v1-core-verify</span>: public</li>
              <li><span className="text-landing-cream/80">GET /v1-core-proof</span>: public</li>
              <li><span className="text-landing-cream/80">GET /v1-core-health</span>: public</li>
              <li><span className="text-landing-cream/80">POST /v1-core-origins</span>: requires API key</li>
            </ul>
            <p className="text-landing-muted/60 mb-2">
              API key issuance is an infrastructural action, not a product flow.
            </p>
            <p className="text-landing-muted/50 text-sm">
              Write access is permissioned. Read access is public.
            </p>
          </section>

          {/* Invariants */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Invariants</h2>
            <ul className="space-y-2 text-landing-muted/70 mb-6">
              <li>Anchor Records are write-once</li>
              <li>Anchor Records are immutably recorded</li>
              <li>Verification is binary (match / no-match)</li>
            </ul>
            <p className="text-landing-muted/60 mb-6">
              Anchor Records are externally anchored via OpenTimestamps, an open-source protocol that creates verifiable proofs anchored in the Bitcoin blockchain.
            </p>
            <div className="bg-landing-muted/5 border border-landing-copper/20 rounded p-4">
              <p className="text-landing-copper/80 font-medium mb-2">Law of Anchoring:</p>
              <p className="text-landing-cream/90">
                If the bytes change, the anchor no longer matches.<br />
                There are no exceptions.
              </p>
            </div>
          </section>

          {/* Resolution Semantics */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Resolution Semantics</h2>
            <ul className="space-y-2 text-landing-muted/70">
              <li>Multiple attestations of the same hash are permitted</li>
              <li>Resolution returns the earliest attestation by <span className="text-landing-copper">captured_at</span></li>
            </ul>
            <p className="mt-4 text-landing-muted/50 text-sm">
              This behavior is canonical.
            </p>
          </section>

          {/* Stability */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Stability</h2>
            <p className="text-landing-cream/90 mb-4">
              Core v1 is <span className="text-landing-copper">STABLE. IMMUTABLE INTERFACE</span>.
            </p>
            <ul className="space-y-1 text-landing-muted/60 text-sm mb-4">
              <li>No new fields</li>
              <li>No semantic drift</li>
              <li>No convenience additions</li>
              <li>No breaking changes</li>
            </ul>
            <p className="text-landing-muted/50 text-sm">
              Additions require a new version (/core/v2/*).
            </p>
          </section>

          {/* Non-Responsibilities */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Non-Responsibilities</h2>
            <p className="text-landing-muted/60 mb-4">Umarise Core does not:</p>
            <ul className="space-y-1 text-landing-muted/60 text-sm mb-6">
              <li>store content</li>
              <li>interpret meaning</li>
              <li>apply policy</li>
              <li>enforce governance</li>
              <li>resolve disputes</li>
              <li>determine outcomes</li>
            </ul>
            <p className="text-landing-muted/50 text-sm">
              All interpretation and decision-making remain external.
            </p>
          </section>

          {/* Data Boundary */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Data Boundary</h2>
            <p className="text-landing-cream/90 mb-4">
              An Anchor Record contains:
            </p>
            <ul className="space-y-1 text-landing-muted/70 mb-6">
              <li><span className="text-landing-copper">hash</span>: what existed</li>
              <li><span className="text-landing-copper">hash_algo</span>: how it was computed</li>
              <li><span className="text-landing-copper">timestamp</span>: when it existed</li>
              <li><span className="text-landing-copper">origin_id</span>: a stable external reference</li>
            </ul>
            <p className="text-landing-muted/60">
              Artifacts, bytes, files, and content remain entirely with the originating party.
            </p>
          </section>

          {/* Note */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Note</h2>
            <p className="text-landing-muted/60">
              Umarise Core may be used independently of any Umarise application.
            </p>
            <p className="mt-4">
              <a
                href="mailto:partners@umarise.com"
                className="text-landing-copper/70 hover:text-landing-copper transition-colors"
              >
                Contact: partners@umarise.com
              </a>
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
