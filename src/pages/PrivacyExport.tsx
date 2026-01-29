import { useEffect } from "react";

const PrivacyExport = () => {
  useEffect(() => {
    document.title = "Umarise – Privacy-by-Design Assessment";
  }, []);

  return (
    <div className="min-h-screen bg-white text-stone-900 p-8 print:p-4 max-w-4xl mx-auto font-serif">
      {/* Print instruction bar */}
      <div className="print:hidden mb-6 p-4 bg-background border border-border rounded-lg flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl/Cmd + P</kbd> to save as PDF
        </p>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      {/* Document Header */}
      <header className="mb-10 border-b border-stone-300 pb-6">
        <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-1">Privacy-by-Design Assessment</h1>
        <p className="text-sm text-stone-500 font-sans">Umarise · January 2026 · v1.0</p>
        <p className="text-xs text-stone-400 font-sans mt-2 italic">
          Internal architecture assessment against GDPR and ISO/IEC 27701 criteria. Not an external audit or certification.
        </p>
      </header>

      {/* Score Summary */}
      <section className="mb-10">
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-4xl font-light text-stone-800">4.8</span>
          <span className="text-stone-500">/5</span>
          <span className="text-sm text-stone-600 ml-4">GDPR Article 25 compliant</span>
        </div>
        <p className="text-stone-600 leading-relaxed text-sm">
          Four-layer architecture with intentional separation. Control plane compromise cannot yield origin content. 
          Privacy enforcement at data layer. EU/Swiss jurisdiction only.
        </p>
      </section>

      {/* Provider Matrix */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">Provider Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-300">
                <th className="py-2 text-left font-normal text-stone-500">Provider</th>
                <th className="py-2 text-left font-normal text-stone-500">Role</th>
                <th className="py-2 text-left font-normal text-stone-500">Location</th>
                <th className="py-2 text-center font-normal text-stone-500">GDPR</th>
                <th className="py-2 text-center font-normal text-stone-500">Zero-Knowledge</th>
                <th className="py-2 text-left font-normal text-stone-500">Data</th>
              </tr>
            </thead>
            <tbody className="font-sans">
              <tr className="border-b border-stone-200">
                <td className="py-3 font-medium">Lovable</td>
                <td className="py-3 text-stone-600">Frontend</td>
                <td className="py-3 text-stone-600">EU</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-center text-stone-400">n/a</td>
                <td className="py-3 text-stone-600">None (static)</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-3 font-medium">Supabase</td>
                <td className="py-3 text-stone-600">Control plane</td>
                <td className="py-3 text-stone-600">EU</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-center text-stone-400">—</td>
                <td className="py-3 text-stone-600">Indices only</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-3 font-medium">Hetzner</td>
                <td className="py-3 text-stone-600">Data plane</td>
                <td className="py-3 text-stone-600">DE</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-center text-stone-400">AES-256</td>
                <td className="py-3 text-stone-600">Origin content</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-3 font-medium">Proton</td>
                <td className="py-3 text-stone-600">Communications</td>
                <td className="py-3 text-stone-600">CH</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-center">✓</td>
                <td className="py-3 text-stone-600">E2E encrypted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Layer Analysis */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">Layer Analysis</h2>
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-medium text-stone-800 mb-1">Frontend (Lovable)</h3>
            <p className="text-stone-600">Static SPA. No data storage, no analytics, no cookies. CDN-served from EU.</p>
          </div>
          <div>
            <h3 className="font-medium text-stone-800 mb-1">Control Plane (Supabase)</h3>
            <p className="text-stone-600">Stateless proxy. Stores search indices and metadata. Cannot reconstruct origin content. Egress allowlisted to Hetzner.</p>
          </div>
          <div>
            <h3 className="font-medium text-stone-800 mb-1">Data Plane (Hetzner DE)</h3>
            <p className="text-stone-600">Primary custodian. Immutable storage with write-once semantics. IPFS content-addressed. SHA-256 integrity.</p>
          </div>
          <div>
            <h3 className="font-medium text-stone-800 mb-1">Communications (Proton CH)</h3>
            <p className="text-stone-600">Zero-knowledge encryption for email and calendar. Provider cannot decrypt content.</p>
          </div>
        </div>
      </section>

      {/* ISO/IEC 27701 Alignment */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">ISO/IEC 27701 Alignment — Summary</h2>
        <p className="text-stone-600 text-sm mb-4 leading-relaxed">
          This section demonstrates how Umarise aligns with ISO/IEC 27701 privacy principles by architectural design.
          It is informative and non-certifying.
        </p>

        {/* Context */}
        <div className="mb-6 text-sm space-y-1">
          <p className="text-stone-600"><span className="text-stone-800 font-medium">System:</span> Umarise Origin Record Layer (infrastructure-first, B2B2C)</p>
          <p className="text-stone-600"><span className="text-stone-800 font-medium">Role:</span> Umarise acts as a system-of-record and PIMS processor</p>
          <p className="text-stone-600"><span className="text-stone-800 font-medium">Architecture:</span> Strict separation of control plane (Supabase/Lovable Cloud) and data plane (Hetzner, EU)</p>
        </div>

        {/* ISO Principle Alignment Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse font-sans">
            <thead>
              <tr className="border-b border-stone-300">
                <th className="py-2 text-left font-normal text-stone-500">ISO Principle</th>
                <th className="py-2 text-center font-normal text-stone-500">Status</th>
                <th className="py-2 text-left font-normal text-stone-500">Umarise Implementation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Privacy by Design</td>
                <td className="py-2 text-center text-green-700">✓</td>
                <td className="py-2 text-stone-600">Enforced by architecture (no update path, immutable origins)</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Data Minimisation</td>
                <td className="py-2 text-center text-green-700">✓</td>
                <td className="py-2 text-stone-600">Control plane stores no origin payloads</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Purpose Limitation</td>
                <td className="py-2 text-center text-green-700">✓</td>
                <td className="py-2 text-stone-600">Recording ≠ interpretation ≠ processing</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Transparency</td>
                <td className="py-2 text-center text-green-700">✓</td>
                <td className="py-2 text-stone-600">Origin View + Proof Bundle</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Accountability</td>
                <td className="py-2 text-center text-green-700">✓</td>
                <td className="py-2 text-stone-600">Verifiable origin + explicit absence detection</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Third-party Risk</td>
                <td className="py-2 text-center text-green-700">✓</td>
                <td className="py-2 text-stone-600">Clear provider separation (control vs data plane)</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Security of Processing</td>
                <td className="py-2 text-center text-amber-600">⚠</td>
                <td className="py-2 text-stone-600">Strong baseline; E2E encryption planned</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-2 text-stone-800">Cryptographic Controls</td>
                <td className="py-2 text-center text-amber-600">⚠</td>
                <td className="py-2 text-stone-600">Hash-based integrity; no TSA by design</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Audit Conclusion */}
        <div className="mb-4">
          <h3 className="text-xs font-sans uppercase tracking-widest text-stone-500 mb-2">Audit Conclusion</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            Umarise demonstrably aligns with ISO/IEC 27701 principles for privacy-by-design, data minimisation and accountability.
            Remaining cryptographic extensions are explicitly positioned as roadmap items and do not constitute non-conformity.
          </p>
        </div>

        {/* Clarifying Scope */}
        <div className="bg-stone-50 p-3 rounded text-sm text-stone-600 border-l-2 border-stone-300">
          <span className="font-medium text-stone-700">Clarifying Scope:</span> Umarise does not implement governance, compliance enforcement or access policy.
          It provides the precondition: verifiable origin. Governance operates above this layer.
        </div>
      </section>

      {/* Core Invariant */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">Invariant</h2>
        <p className="text-stone-800 italic border-l-2 border-stone-300 pl-4">
          Control plane compromise degrades convenience, not truth.
        </p>
      </section>

      {/* Score Breakdown */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">Score Breakdown</h2>
        <div className="grid grid-cols-2 gap-4 text-sm font-sans">
          <div className="flex justify-between border-b border-stone-200 py-2">
            <span className="text-stone-600">Data Minimization</span>
            <span className="text-stone-800">5/5</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 py-2">
            <span className="text-stone-600">Purpose Limitation</span>
            <span className="text-stone-800">5/5</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 py-2">
            <span className="text-stone-600">Storage Limitation</span>
            <span className="text-stone-800">5/5</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 py-2">
            <span className="text-stone-600">Integrity</span>
            <span className="text-stone-800">5/5</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 py-2">
            <span className="text-stone-600">Confidentiality</span>
            <span className="text-stone-800">4/5</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 py-2">
            <span className="text-stone-600">Jurisdiction</span>
            <span className="text-stone-800">5/5</span>
          </div>
        </div>
      </section>

      {/* Gaps */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">Known Gaps</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse font-sans">
            <thead>
              <tr className="border-b border-stone-300">
                <th className="py-2 text-left font-normal text-stone-500">Gap</th>
                <th className="py-2 text-left font-normal text-stone-500">Severity</th>
                <th className="py-2 text-left font-normal text-stone-500">Mitigation</th>
                <th className="py-2 text-left font-normal text-stone-500">Phase</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-200">
                <td className="py-3">
                  Origins not E2E encrypted
                  <a 
                    href="https://github.com/user/umarise/blob/main/docs/phase-2b-e2e-encryption-spec.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-stone-400 hover:text-stone-600 print:hidden"
                    title="View specification"
                  >
                    →
                  </a>
                </td>
                <td className="py-3 text-stone-600">Medium</td>
                <td className="py-3 text-stone-600">
                  Client-side encryption
                  <span className="block text-xs text-stone-400 mt-0.5">See: phase-2b-e2e-encryption-spec.md</span>
                </td>
                <td className="py-3 text-stone-600">2B</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-3">Metadata visible in control plane</td>
                <td className="py-3 text-stone-600">Low</td>
                <td className="py-3 text-stone-600">Hash-based identifiers</td>
                <td className="py-3 text-stone-600">2A ✓</td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-3">No external TSA</td>
                <td className="py-3 text-stone-600">Low</td>
                <td className="py-3 text-stone-600">Blockchain anchoring</td>
                <td className="py-3 text-stone-600">3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Certification */}
      <section className="mb-10">
        <h2 className="text-sm font-sans uppercase tracking-widest text-stone-500 mb-4">Certification Status</h2>
        <div className="space-y-2 text-sm font-sans">
          <div className="flex justify-between py-2 border-b border-stone-200">
            <span>GDPR Article 25</span>
            <span className="text-stone-800">Ready</span>
          </div>
          <div className="flex justify-between py-2 border-b border-stone-200">
            <span>ISO 27701</span>
            <span className="text-stone-500">Pending audit</span>
          </div>
          <div className="flex justify-between py-2 border-b border-stone-200">
            <span>SOC 2 Type II</span>
            <span className="text-stone-400">Phase 3</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-stone-300 text-center text-xs text-stone-500 font-sans">
        <p>partners@umarise.com</p>
      </footer>
    </div>
  );
};

export default PrivacyExport;
