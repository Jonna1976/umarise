import { useEffect } from "react";

const PrivacyExport = () => {
  useEffect(() => {
    document.title = "Umarise Privacy-by-Design Assessment";
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 print:p-4 max-w-4xl mx-auto">
      {/* Print instruction bar - hidden when printing */}
      <div className="print:hidden mb-6 p-4 bg-background border border-border rounded-lg flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Use <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl/Cmd + P</kbd> to print or save as PDF
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
          Download PDF
        </button>
      </div>

      {/* Document Header */}
      <header className="mb-8 border-b-2 border-gray-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Privacy-by-Design Assessment</h1>
          <span className="text-sm text-gray-500">Confidential</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span><strong>Organization:</strong> Umarise</span>
          <span>|</span>
          <span><strong>Date:</strong> January 29, 2026</span>
          <span>|</span>
          <span><strong>Version:</strong> 1.0</span>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Executive Summary</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-semibold text-green-800">Overall Privacy Score: 4.8/5</p>
              <p className="text-sm text-green-700">GDPR Article 25 Ready • EU/Swiss Jurisdiction Only</p>
            </div>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">
          Umarise implements a privacy-first architecture using intentional separation of concerns across four layers. 
          The core invariant ensures that compromise of the control plane (Lovable/Supabase) cannot yield origin content, 
          as privacy enforcement sits at the data layer where it matters most.
        </p>
      </section>

      {/* Technology Stack */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Technology Stack Overview</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="font-semibold text-gray-900">LOVABLE</p>
            <p className="text-xs text-gray-600">Frontend</p>
            <p className="text-xs text-gray-500 mt-1">EU</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="font-semibold text-gray-900">SUPABASE</p>
            <p className="text-xs text-gray-600">Control Plane</p>
            <p className="text-xs text-gray-500 mt-1">EU</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center bg-green-50 border-green-200">
            <p className="font-semibold text-gray-900">HETZNER</p>
            <p className="text-xs text-gray-600">Data Plane</p>
            <p className="text-xs text-gray-500 mt-1">🇩🇪 Germany</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center bg-green-50 border-green-200">
            <p className="font-semibold text-gray-900">PROTON</p>
            <p className="text-xs text-gray-600">Communications</p>
            <p className="text-xs text-gray-500 mt-1">🇨🇭 Switzerland</p>
          </div>
        </div>
      </section>

      {/* Provider Assessment Matrix */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Provider Assessment Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Provider</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Role</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Location</th>
                <th className="border border-gray-200 px-3 py-2 text-center">GDPR</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Zero-Knowledge</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Data Stored</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2 font-medium">Lovable</td>
                <td className="border border-gray-200 px-3 py-2">Frontend hosting</td>
                <td className="border border-gray-200 px-3 py-2">EU</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">✓</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-gray-400">N/A (static)</td>
                <td className="border border-gray-200 px-3 py-2">None</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2 font-medium">Supabase</td>
                <td className="border border-gray-200 px-3 py-2">Control plane</td>
                <td className="border border-gray-200 px-3 py-2">EU</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">✓</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-gray-400">❌ Operational</td>
                <td className="border border-gray-200 px-3 py-2">Indices, metadata</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2 font-medium">Hetzner</td>
                <td className="border border-gray-200 px-3 py-2">Data plane</td>
                <td className="border border-gray-200 px-3 py-2">🇩🇪 Germany</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">✓</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-gray-400">❌ Encrypted-at-rest</td>
                <td className="border border-gray-200 px-3 py-2">Origin content</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2 font-medium">Proton</td>
                <td className="border border-gray-200 px-3 py-2">Communications</td>
                <td className="border border-gray-200 px-3 py-2">🇨🇭 Switzerland</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">✓</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">✓ E2E encrypted</td>
                <td className="border border-gray-200 px-3 py-2">Email, calendar</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Layer Analysis */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Layer Analysis</h2>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">1. Lovable (Frontend Layer)</h3>
            <p className="text-sm text-gray-700 mb-2"><strong>Privacy Impact:</strong> Zero — serves static assets only.</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Data storage: None (static SPA only)</li>
              <li>User tracking: None (no analytics, no cookies)</li>
              <li>CDN location: EU (IP: 185.158.133.1)</li>
              <li>SSL/TLS: Enforced via Let's Encrypt</li>
            </ul>
          </div>

          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">2. Supabase (Control Plane)</h3>
            <p className="text-sm text-gray-700 mb-2"><strong>Privacy Impact:</strong> Minimal — indices and metadata, no reconstruction capability.</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Origin content: Never stored (stateless proxy)</li>
              <li>User accounts: None (device-based isolation)</li>
              <li>Indices: Metadata only (search indices, no content)</li>
              <li>Egress: Allowlisted to Hetzner only</li>
            </ul>
            <p className="text-xs text-yellow-700 mt-2 font-medium">⚠️ STATELESS — Cannot reconstruct origin data</p>
          </div>

          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">3. Hetzner (Data Plane)</h3>
            <p className="text-sm text-gray-700 mb-2"><strong>Privacy Impact:</strong> Primary data custodian — privacy enforced at source.</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Location: Germany (strictest GDPR interpretation)</li>
              <li>Origin storage: Immutable (write-once semantics)</li>
              <li>Encryption: At-rest (AES-256)</li>
              <li>IPFS: Content-addressed (SHA-256 integrity)</li>
            </ul>
            <p className="text-xs text-green-700 mt-2 font-medium">✓ SOURCE OF TRUTH</p>
          </div>

          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">4. Proton (Communications)</h3>
            <p className="text-sm text-gray-700 mb-2"><strong>Privacy Impact:</strong> Zero provider visibility — aligns with privacy-first philosophy.</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Email encryption: E2E (zero-knowledge)</li>
              <li>Calendar encryption: E2E (zero-knowledge)</li>
              <li>Server location: Switzerland (privacy-friendly jurisdiction)</li>
              <li>Provider access: None (cannot decrypt content)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Invariant */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Core Invariant</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 font-medium text-center italic">
            "Compromise of Lovable/Supabase (control plane) must never yield origin content."
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Layer</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Privacy Role</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Compromise Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2 font-medium">Hetzner (Data)</td>
                <td className="border border-gray-200 px-3 py-2">Truth storage</td>
                <td className="border border-gray-200 px-3 py-2 text-red-600">Would expose origins</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2 font-medium">Supabase (Control)</td>
                <td className="border border-gray-200 px-3 py-2">Stateless proxy</td>
                <td className="border border-gray-200 px-3 py-2 text-yellow-600">Degrades convenience, not truth</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2 font-medium">Proton (Comms)</td>
                <td className="border border-gray-200 px-3 py-2">Zero-knowledge</td>
                <td className="border border-gray-200 px-3 py-2 text-green-600">Provider cannot read content</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2 font-medium">Lovable (Frontend)</td>
                <td className="border border-gray-200 px-3 py-2">Static hosting</td>
                <td className="border border-gray-200 px-3 py-2 text-green-600">No data to expose</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Privacy Score Breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Privacy Score Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Category</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Score</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Justification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Data Minimization</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
                <td className="border border-gray-200 px-3 py-2">No user accounts, device-based isolation</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">Purpose Limitation</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
                <td className="border border-gray-200 px-3 py-2">Origin verification only</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Storage Limitation</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
                <td className="border border-gray-200 px-3 py-2">Immutable, no retention beyond purpose</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">Integrity</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
                <td className="border border-gray-200 px-3 py-2">SHA-256, write-once, triggers</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Confidentiality</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐</td>
                <td className="border border-gray-200 px-3 py-2">Encrypted-at-rest, not E2E for origins</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">Jurisdiction</td>
                <td className="border border-gray-200 px-3 py-2 text-center">⭐⭐⭐⭐⭐</td>
                <td className="border border-gray-200 px-3 py-2">EU + Switzerland only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Gap Analysis */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Gap Analysis & Roadmap</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Gap</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Severity</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Mitigation</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Phase</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2">Origins not E2E encrypted</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-yellow-600">Medium</td>
                <td className="border border-gray-200 px-3 py-2">Client-side encryption</td>
                <td className="border border-gray-200 px-3 py-2 text-center">2B</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2">Supabase metadata visible</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">Low</td>
                <td className="border border-gray-200 px-3 py-2">Hash-based identifiers</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">2A ✓</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2">No TSA timestamps</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">Low</td>
                <td className="border border-gray-200 px-3 py-2">Blockchain anchoring</td>
                <td className="border border-gray-200 px-3 py-2 text-center">3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Certification Readiness */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Certification Readiness</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">Standard</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Status</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2 font-medium">GDPR Article 25</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-green-600">✓ Ready</td>
                <td className="border border-gray-200 px-3 py-2">Privacy-by-design documented</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-3 py-2 font-medium">ISO 27701</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-yellow-600">⚠️ Partial</td>
                <td className="border border-gray-200 px-3 py-2">Needs formal audit</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-3 py-2 font-medium">SOC 2 Type II</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-gray-400">❌ Not started</td>
                <td className="border border-gray-200 px-3 py-2">Phase 3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Design Principles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">Design Principles</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li><strong>Privacy sits where it MUST</strong> — at the data layer (Hetzner)</li>
          <li><strong>Operational flexibility where it CAN</strong> — at the control plane</li>
          <li><strong>Zero reconstruction capability</strong> — control plane cannot rebuild origin content</li>
          <li><strong>Egress allowlist</strong> — Edge Functions only communicate with Hetzner</li>
          <li><strong>Zero-knowledge communications</strong> — Proton for all external comms</li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 Umarise. This document is confidential and intended for investors and partners.</p>
        <p className="mt-1">Contact: partners@umarise.com</p>
      </footer>
    </div>
  );
};

export default PrivacyExport;
