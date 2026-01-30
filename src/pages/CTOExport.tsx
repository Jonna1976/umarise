/**
 * CTO Export Page
 * 
 * Print-friendly page for exporting CTO Overview document
 * User can use browser's "Print → Save as PDF" to generate PDFs
 * 
 * Route: /cto
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CTOExport() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
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

      {/* CTO Overview Document */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        <header className="mb-8 pb-6 border-b-2 border-black">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Umarise Technical Documentation</p>
          <h1 className="text-3xl font-bold">Origin Record Layer</h1>
          <p className="text-gray-600 mt-2">CTO Overview</p>
        </header>

        <section className="mb-8">
          <p className="text-gray-700 italic border-l-4 border-gray-300 pl-4">
            A system-of-record that captures and preserves original state before transformation.
          </p>
        </section>

        {/* What Umarise Is */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">What Umarise Is</h2>
          <p className="text-sm text-gray-700 mb-4">
            Umarise is an origin record layer. It records a deterministic fingerprint of any artifact—document, image, message, dataset—before processing, transformation, or AI touches it.
          </p>
          <p className="text-sm text-gray-700 mb-4">The record consists of three elements:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
            <li><strong>SHA-256 hash</strong> — cryptographic fingerprint of the original bytes</li>
            <li><strong>captured_at</strong> — timestamp of when the origin was recorded</li>
            <li><strong>origin_id</strong> — unique reference for resolution and verification</li>
          </ul>
          <p className="text-sm text-gray-700">
            This creates an immutable anchor point. Any modification to the original bytes produces a different hash. Verification is binary: match or no match.
          </p>
        </section>

        {/* What Umarise Does */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">What Umarise Does</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Function</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Record</td><td className="border border-gray-300 px-3 py-2">Capture what existed at a specific moment</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Resolve</td><td className="border border-gray-300 px-3 py-2">Return metadata and artifact reference by origin_id or hash</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Verify</td><td className="border border-gray-300 px-3 py-2">Confirm bit-identity between stored origin and provided content</td></tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 italic mt-3">Umarise is resolved and verified—never searched. Search happens in partner systems. Umarise provides identity and verification.</p>
        </section>

        {/* What Umarise Does Not Do */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">What Umarise Does Not Do</h2>
          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Excluded</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Search / semantics</td><td className="border border-gray-300 px-3 py-2">Interpretation creates bias; Umarise is a neutral anchor</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Governance / policy</td><td className="border border-gray-300 px-3 py-2">Enforcement is a layer above; Umarise provides evidence</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">Data enrichment</td><td className="border border-gray-300 px-3 py-2">Processing transforms; Umarise preserves</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium">User authentication</td><td className="border border-gray-300 px-3 py-2">Identity is separate infrastructure</td></tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 italic">These are not missing features. They are architectural boundaries that preserve neutrality.</p>
        </section>

        {/* Why This Matters */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Why This Matters</h2>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="font-semibold text-sm">Without origin, systems can operate. With origin, they can withstand scrutiny.</p>
          </div>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Scenario</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Without Origin</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">With Origin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">AI output disputed</td>
                <td className="border border-gray-300 px-3 py-2">"Prove the input was correct"</td>
                <td className="border border-gray-300 px-3 py-2">Input hash + timestamp = verifiable</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">Contract version contested</td>
                <td className="border border-gray-300 px-3 py-2">Legal discovery required</td>
                <td className="border border-gray-300 px-3 py-2">Bit-identity proof resolves in seconds</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">Authorship claimed</td>
                <td className="border border-gray-300 px-3 py-2">Assertion vs. assertion</td>
                <td className="border border-gray-300 px-3 py-2">First-recorded hash = defensible claim</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 italic mt-3">Origin shifts disputes from interpretive (legal) to deterministic (technical).</p>
        </section>

        {/* Partner Vault Mode */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Partner Vault Mode</h2>
          <p className="text-sm text-gray-700 mb-4">Umarise does not require custody of sensitive data.</p>
          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Component</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Location</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Reconstructable?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">SHA-256 hash</td>
                <td className="border border-gray-300 px-3 py-2">Umarise</td>
                <td className="border border-gray-300 px-3 py-2">No (one-way)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">Timestamp + origin_id</td>
                <td className="border border-gray-300 px-3 py-2">Umarise</td>
                <td className="border border-gray-300 px-3 py-2">N/A</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium">Original bytes</td>
                <td className="border border-gray-300 px-3 py-2">Partner vault</td>
                <td className="border border-gray-300 px-3 py-2">Yes</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 italic">Partners keep their data. Umarise keeps the fingerprint. Verification works without Umarise accessing the original content.</p>
        </section>

        {/* Integration Model */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Integration Model</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs font-mono mb-4">{`Partner System (Search/AI/Workflow)
         │
         │ resolve by origin_id or hash
         ▼
┌─────────────────────────┐
│   Umarise Origin Layer  │
│   GET /resolve          │
│   POST /verify          │
└─────────────────────────┘`}</pre>
          <p className="text-sm text-gray-600 italic">You search in your systems. You verify at Umarise.</p>
        </section>

        {/* The Discipline */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">The Discipline</h2>
          <p className="text-sm text-gray-700 mb-4">The value of origin proof depends on what Umarise refuses to do:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li><strong>No updates</strong> — Origins are write-once. Errors remain visible.</li>
            <li><strong>No interpretation</strong> — Umarise records; it does not judge.</li>
            <li><strong>No lock-in</strong> — SHA-256 is a standard. Verification works without Umarise.</li>
          </ul>
          <p className="text-sm text-gray-600 italic mt-4">This self-restraint is the product. Convenience features would undermine the core invariant.</p>
        </section>

        {/* Core Statement */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Core Statement</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold">Umarise makes systems defensible by making origin verifiable—before transformation occurs.</p>
          </div>
        </section>

        {/* Negative Dependency Test */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Negative Dependency Test</h2>
          <p className="text-sm text-gray-700 mb-4">If your system:</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 mb-4">
            <li><strong>Needs to edit its past</strong> → Umarise is not for you</li>
            <li><strong>Needs to stand by its past</strong> → Umarise provides the proof</li>
          </ul>
          <p className="text-sm text-gray-600 italic">Recording origin is a transparency signal. Refusing to record is also a signal.</p>
        </section>

        <footer className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Document version: 1.0 • Infrastructure, not product.</p>
        </footer>
      </article>
    </div>
  );
}
