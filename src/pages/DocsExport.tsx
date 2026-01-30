/**
 * Docs Export Page
 * 
 * Print-friendly page for exporting integration-contract.md and layer-boundaries.md
 * User can use browser's "Print → Save as PDF" to generate PDFs
 * 
 * Route: /docs-export
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DocsExport() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    // Use referrer to determine if we came from within the app
    // window.history.length is unreliable (browsers always have length >= 1)
    const referrer = document.referrer;
    const isInternalReferrer = referrer && referrer.includes(window.location.host);
    
    if (isInternalReferrer) {
      window.history.back();
    } else {
      navigate('/review');
    }
  };

  return (
    <div className="bg-white text-black min-h-screen print:bg-white">
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-print { display: none !important; }
          h1, h2, h3 { page-break-after: avoid; }
          pre, table { page-break-inside: avoid; }
        }
        @page { margin: 2cm; }
      `}</style>

      {/* Buttons (hidden when printing) */}
      <div className="no-print fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export
          </button>
          <button
            onClick={handleBack}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80"
          >
            ← Back
          </button>
        </div>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="no-print h-16" />

      {/* Document 1: Integration Contract */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        <header className="mb-8 pb-6 border-b-2 border-black">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Umarise Technical Documentation</p>
          <h1 className="text-3xl font-bold">Integration Contract</h1>
          <p className="text-gray-600 mt-2">Origin Record Layer API v1</p>
        </header>

        <section className="mb-8">
          <p className="text-gray-700 italic border-l-4 border-gray-300 pl-4">
            External systems: this is what you need to implement to use Umarise as an origin record layer.
            No app knowledge required. No runtime dependency.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">1. Core Principles (non-negotiable)</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Principle</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Create-only</td><td className="border border-gray-300 px-3 py-2">Origins cannot be modified after capture</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Content-addressed</td><td className="border border-gray-300 px-3 py-2">Origin = hash / CID</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Read-only after capture</td><td className="border border-gray-300 px-3 py-2">No UPDATE endpoint exists</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">System-agnostic</td><td className="border border-gray-300 px-3 py-2">No assumptions about upstream applications</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Explicit failure</td><td className="border border-gray-300 px-3 py-2">Absence of origin is always detectable</td></tr>
            </tbody>
          </table>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">2. Canonical Data Model</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs font-mono overflow-x-auto">{`interface OriginRecord {
  origin_id: string;          // UUID
  origin_cid: string;         // IPFS CID
  origin_hash: string;        // SHA-256
  hash_algo: "sha256";
  captured_at: string;        // ISO-8601
  source_system: string;      // "notion", "nextcloud", "scanner", etc.
  capture_type: "image" | "text" | "binary";
  integrity_status: "valid" | "legacy" | "unverified";
}`}</pre>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">3. API Primitives</h2>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">3.1 Create Origin (write-once)</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs font-mono mb-2">POST /origins</pre>
          <p className="text-sm text-gray-700 mb-2"><strong>Guarantees:</strong> Hash is computed before storage. Returns immutable origin reference. No UPDATE endpoint exists.</p>

          <h3 className="text-lg font-semibold mt-6 mb-3">3.2 Resolve Origin</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs font-mono mb-2">{`GET /origins/{origin_id}
GET /resolve?cid={cid}
GET /resolve?hash={sha256}`}</pre>

          <h3 className="text-lg font-semibold mt-6 mb-3">3.3 Verify Origin Integrity</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs font-mono mb-2">POST /verify</pre>
          <p className="text-sm text-gray-700">Request: origin_id + content binary → Response: {"{ match: true }"}</p>

          <h3 className="text-lg font-semibold mt-6 mb-3">3.4 Link External Systems</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs font-mono mb-2">POST /links</pre>
          <p className="text-sm text-gray-700">Declare derivation or citation without synchronization. Links are append-only.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">4. Explicit Failure Modes</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Scenario</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Result</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">No origin provided</td><td className="border border-gray-300 px-3 py-2 font-mono text-xs">origin: null</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Content mismatch</td><td className="border border-gray-300 px-3 py-2 font-mono text-xs">verify: false</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Modified artifact</td><td className="border border-gray-300 px-3 py-2">New CID, old origin remains</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">System ignores Umarise</td><td className="border border-gray-300 px-3 py-2">Detectable, not prevented</td></tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 italic mt-3">Governance begins where these failures have consequences.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">5. Integration Promise</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>No lock-in</strong> — Origins are portable</li>
            <li><strong>No runtime dependency</strong> — Umarise can be offline</li>
            <li><strong>Evidence and reference only</strong> — No workflow assumptions</li>
            <li><strong>Works alongside existing stacks</strong> — Not a replacement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">6. Implementation Status</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Primitive</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">Create Origin</td><td className="border border-gray-300 px-3 py-2">✅ Implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Resolve Origin</td><td className="border border-gray-300 px-3 py-2">✅ Implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Verify Origin</td><td className="border border-gray-300 px-3 py-2">✅ Implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Link External</td><td className="border border-gray-300 px-3 py-2">🔮 Conceptual</td></tr>
            </tbody>
          </table>
        </section>

        <footer className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Contract version: 1.0 • Umarise Origin Record Layer</p>
        </footer>
      </article>

      {/* Page Break */}
      <div className="page-break" />

      {/* Document 2: Layer Boundaries */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        <header className="mb-8 pb-6 border-b-2 border-black">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Umarise Technical Documentation</p>
          <h1 className="text-3xl font-bold">Layer Boundaries</h1>
          <p className="text-gray-600 mt-2">Origin Layer vs Governance Layer</p>
        </header>

        <section className="mb-8">
          <p className="text-gray-700 italic border-l-4 border-gray-300 pl-4">
            This document defines the explicit boundary between what Umarise implements and what belongs to upstream governance systems.
            Strategic protection against scope-creep and political claims.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">1. What Umarise IS</h2>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="font-semibold">Umarise is an origin record layer.</p>
            <p className="text-gray-700 text-sm">A system-of-record that captures and preserves original state before transformation.</p>
          </div>
          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Function</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Record</td><td className="border border-gray-300 px-3 py-2">Capture what existed</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Prove</td><td className="border border-gray-300 px-3 py-2">Demonstrate it is unchanged</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Expose</td><td className="border border-gray-300 px-3 py-2">Make it visible to downstream systems</td></tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold text-gray-800">Core statement: Umarise registers. It does not judge.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">2. What Umarise is NOT</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Not This</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">Governance engine</td><td className="border border-gray-300 px-3 py-2">Does not enforce rules</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Identity provider</td><td className="border border-gray-300 px-3 py-2">Does not authenticate users</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Compliance system</td><td className="border border-gray-300 px-3 py-2">Does not audit behavior</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Policy enforcer</td><td className="border border-gray-300 px-3 py-2">Does not block actions</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Truth authority</td><td className="border border-gray-300 px-3 py-2">Does not determine correctness</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Workflow controller</td><td className="border border-gray-300 px-3 py-2">Does not orchestrate processes</td></tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold text-gray-800 mt-4">Critical distinction: Umarise does not determine what is "true", "correct", or "permitted".</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">3. Where Governance Begins</h2>
          <p className="text-sm text-gray-700 mb-3">Governance emerges <strong>above</strong> Umarise when other systems:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
            <li>Make origin <strong>mandatory</strong></li>
            <li>Enforce <strong>provenance</strong></li>
            <li>Sanction <strong>absence</strong></li>
            <li>Attribute <strong>responsibility</strong></li>
          </ul>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Layer</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Umarise Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">Identity & signing</td><td className="border border-gray-300 px-3 py-2">❌ Not implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Policy enforcement</td><td className="border border-gray-300 px-3 py-2">❌ Not implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Audit & compliance</td><td className="border border-gray-300 px-3 py-2">❌ Not implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Dispute resolution</td><td className="border border-gray-300 px-3 py-2">❌ Not implemented</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Legal attestation</td><td className="border border-gray-300 px-3 py-2">❌ Not implemented</td></tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold text-gray-800 mt-4">Umarise is the precondition for governance, not its executor.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">4. What Umarise Enables (Without Enforcing)</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Capability</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">How</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">Show explicit origin for every transformation</td><td className="border border-gray-300 px-3 py-2">Origin links are available</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Detect any modification</td><td className="border border-gray-300 px-3 py-2">Hash comparison reveals changes</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Verify any claim</td><td className="border border-gray-300 px-3 py-2">Bit-identity proof is cryptographic</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Hold any system accountable</td><td className="border border-gray-300 px-3 py-2">Evidence exists independently</td></tr>
            </tbody>
          </table>
          <div className="bg-gray-50 p-4 rounded mt-4">
            <p className="text-sm"><strong>Without Umarise</strong>, governance is symbolic.</p>
            <p className="text-sm"><strong>With Umarise</strong>, governance becomes enforceable by others.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">5. Positioning Statements</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-gray-600 text-xs uppercase">For partners</p>
              <p className="italic">"Umarise doesn't govern. It makes governance unavoidable."</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-gray-600 text-xs uppercase">For technical audiences</p>
              <p className="italic">"The demo implements the origin record layer. Governance emerges when identity, policy, and enforcement are layered on top."</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-semibold text-gray-600 text-xs uppercase">For integration discussions</p>
              <p className="italic">"We provide the evidence layer. You provide the rules."</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">6. Summary</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Aspect</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Origin Layer (Umarise)</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Governance Layer (Others)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">Creates records</td><td className="border border-gray-300 px-3 py-2">✅</td><td className="border border-gray-300 px-3 py-2">❌</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Preserves state</td><td className="border border-gray-300 px-3 py-2">✅</td><td className="border border-gray-300 px-3 py-2">❌</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Proves integrity</td><td className="border border-gray-300 px-3 py-2">✅</td><td className="border border-gray-300 px-3 py-2">❌</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Enforces policy</td><td className="border border-gray-300 px-3 py-2">❌</td><td className="border border-gray-300 px-3 py-2">✅</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Authenticates users</td><td className="border border-gray-300 px-3 py-2">❌</td><td className="border border-gray-300 px-3 py-2">✅</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Resolves disputes</td><td className="border border-gray-300 px-3 py-2">❌</td><td className="border border-gray-300 px-3 py-2">✅</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Determines truth</td><td className="border border-gray-300 px-3 py-2">❌</td><td className="border border-gray-300 px-3 py-2">✅</td></tr>
            </tbody>
          </table>
        </section>

        {/* Page Break before Strategic Clarifications */}
        <div className="page-break" />

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">7. Architectural Decisions</h2>
          
          {/* 7.1 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.1 Scope: Bit-Identity, Not Legal Standing</h3>
            <p className="text-sm text-gray-700">Umarise proves byte-equivalence. Legal interpretation is governance layer. The hash shifts burden of proof — claimant must explain mismatch.</p>
          </div>

          {/* 7.2 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.2 Hash/Encryption Sequence</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs font-mono">bytes → SHA-256 → record → encrypt → store</pre>
            <p className="text-sm text-gray-700 mt-2">Hash computed on plaintext. Verification without decryption. E2E (Phase 2B) adds confidentiality, not integrity — integrity exists from day one.</p>
          </div>

          {/* 7.3 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.3 Dispute Economics</h3>
            <p className="text-sm text-gray-700">Discovery and litigation favor well-funded parties. Instant cryptographic verification changes negotiation dynamics before legal process begins.</p>
          </div>

          {/* 7.4 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.4 Vault Independence</h3>
            <p className="text-sm text-gray-700 mb-2">Umarise is a notary, not a vault. The hash is stored independently of the artifact.</p>
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr><td className="border border-gray-300 px-2 py-1 font-medium">External vault compromised</td><td className="border border-gray-300 px-2 py-1">Hash comparison → mismatch detected</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1 font-medium">Hetzner compromised</td><td className="border border-gray-300 px-2 py-1">Hash in Supabase → mismatch detected</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1 font-medium">Supabase compromised</td><td className="border border-gray-300 px-2 py-1">Artifact on Hetzner → mismatch detected</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1 font-medium">Both compromised</td><td className="border border-gray-300 px-2 py-1">Write-once triggers + audit logs → blocked/logged</td></tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-600 mt-2">Defense-in-depth: two independent systems, write-once constraints, audit trail. Not unhackable — detectable.</p>
          </div>

          {/* 7.5 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.5 Integration Position</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs font-mono">{`[Notion/CRM/AI Agents/Workflows] → reads from → [Umarise API: /origins, /resolve, /verify]`}</pre>
            <p className="text-sm text-gray-700 mt-2">Origin layer sits before processing systems, not inside. Exposable via MCP for agent workflows.</p>
          </div>

          {/* 7.6 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.6 Storage Model</h3>
            <table className="w-full border-collapse text-xs mb-2">
              <tbody>
                <tr><td className="border border-gray-300 px-2 py-1 font-medium">Hash</td><td className="border border-gray-300 px-2 py-1">Supabase (control plane)</td><td className="border border-gray-300 px-2 py-1">Verification</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1 font-medium">Artifact</td><td className="border border-gray-300 px-2 py-1">Hetzner DE (data plane)</td><td className="border border-gray-300 px-2 py-1">Retrieval</td></tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-700">Partner Vault Mode: external systems store artifacts, Umarise records hash only. Verification detects tampering regardless of storage location.</p>
          </div>

          {/* 7.7 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.7 Complementary to Existing Vaults</h3>
            <p className="text-sm text-gray-700">Proton/Nextcloud = storage with access control. Umarise = immutable verification layer. Additive, not competitive. Works with any vault that accepts pre-hashed content.</p>
          </div>

          {/* 7.8 */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-2">7.8 Infrastructure, Not Platform</h3>
            <p className="text-sm text-gray-700">No network effects. No user-facing product. Systems call the API. Works with centralized (Salesforce) and decentralized (Solid, IPFS) equally. The origin layer is agnostic about what runs above it.</p>
          </div>
        </section>

        <footer className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Document version: 1.1 • Umarise Origin Record Layer</p>
        </footer>
      </article>
    </div>
  );
}
