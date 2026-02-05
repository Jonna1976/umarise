import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Privacy Policy for Umarise
 * Aligned with canonical briefing - technical, minimal, infrastructure-grade
 */
export default function Privacy() {
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
        <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">Privacy Policy</h1>
        <p className="text-landing-muted/50 text-sm mb-16">Last updated: January 2026</p>

        <div className="space-y-12 text-landing-muted/80 leading-relaxed">
          
          {/* Scope note */}
          <section>
            <p className="text-landing-muted/50 text-sm italic mb-8">
              This Privacy Policy covers all Umarise services, including the Core API and the Umarise companion application.
            </p>
          </section>

          {/* Scope */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Scope</h2>
            <p className="mb-4">This Privacy Policy describes:</p>
            <ul className="space-y-1 mb-4">
              <li>• what data is processed by Umarise</li>
              <li>• where that data is processed</li>
              <li>• what is explicitly not processed</li>
            </ul>
            <p className="text-landing-cream/70">
              Umarise is designed to function without collecting or relying on personal data.
            </p>
          </section>

          {/* Data Processed */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Data Processed by Umarise</h2>
            <p className="mb-6">
              Umarise processes only the minimum data required to establish and verify origin records.
            </p>
            
            <h3 className="text-landing-cream/90 font-medium mb-4">Origin Record Data</h3>
            <div className="border border-landing-muted/20 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20 bg-landing-muted/5">
                    <th className="text-left py-3 px-4 font-medium text-landing-cream/70">Data element</th>
                    <th className="text-left py-3 px-4 font-medium text-landing-cream/70">Purpose</th>
                    <th className="text-left py-3 px-4 font-medium text-landing-cream/70">Storage location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-3 px-4">Cryptographic hash (SHA-256)</td>
                    <td className="py-3 px-4">Bit-identity verification</td>
                    <td className="py-3 px-4">Germany (Hetzner)</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-3 px-4">Timestamp</td>
                    <td className="py-3 px-4">Temporal proof</td>
                    <td className="py-3 px-4">Germany (Hetzner)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Origin ID</td>
                    <td className="py-3 px-4">Stable external reference</td>
                    <td className="py-3 px-4">Germany (Hetzner)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-landing-muted/50 text-sm">Origin records are write-once and immutable.</p>
          </section>

          {/* Local Device Data */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Local Device Data</h2>
            <p className="mb-4">Umarise does not use user accounts.</p>
            <p className="mb-4">
              A locally stored, random identifier may be used within the browser solely to isolate data on that device.
            </p>
            <p className="mb-2">This identifier:</p>
            <ul className="space-y-1 mb-4">
              <li>• is not a personal identifier</li>
              <li>• is not linked to an individual</li>
              <li>• is not used for tracking</li>
              <li>• is not recoverable by Umarise</li>
            </ul>
            <p className="text-landing-muted/50 text-sm">
              If local browser data is cleared, this association is permanently lost.
            </p>
          </section>

          {/* Data Not Processed */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Data Not Processed</h2>
            <p className="mb-4">Umarise does not process or store:</p>
            <ul className="space-y-1 mb-4">
              <li>• personal names or individual identifiers</li>
              <li>• email addresses</li>
              <li>• user accounts or passwords</li>
              <li>• tracking cookies or analytics</li>
              <li>• behavioral or profiling data</li>
            </ul>
            <p className="text-landing-cream/70">
              Umarise cannot identify end users and does not attempt to do so. Partner organizations are identified solely by API key prefix for operational purposes.
            </p>
          </section>

          {/* Operational Data */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Operational Data</h2>
            <p className="mb-4">
              Umarise processes operational data to maintain service integrity and prevent abuse.
            </p>
            <div className="border border-landing-muted/20 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20 bg-landing-muted/5">
                    <th className="text-left py-3 px-4 font-medium text-landing-cream/70">Data element</th>
                    <th className="text-left py-3 px-4 font-medium text-landing-cream/70">Purpose</th>
                    <th className="text-left py-3 px-4 font-medium text-landing-cream/70">Storage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-3 px-4">IP address (hashed)</td>
                    <td className="py-3 px-4">Rate limiting, abuse prevention</td>
                    <td className="py-3 px-4">Hashed with SHA-256. Original IP is not retained.</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-3 px-4">API key prefix</td>
                    <td className="py-3 px-4">Request attribution</td>
                    <td className="py-3 px-4">First 11 characters only. Full key is hashed.</td>
                  </tr>
                  <tr className="border-b border-landing-muted/10">
                    <td className="py-3 px-4">Request metadata</td>
                    <td className="py-3 px-4">Operational monitoring</td>
                    <td className="py-3 px-4">Endpoint, method, status code, response time.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Partner name</td>
                    <td className="py-3 px-4">Partner identification</td>
                    <td className="py-3 px-4">Organization name (not personal names).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Data Processing Structure */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Data Processing Structure</h2>
            <p className="mb-4">
              Umarise processes data using a segmented infrastructure to minimize exposure.
            </p>
            <p>
              Origin records are stored separately from any interaction layer and are never processed together with personal data.
            </p>
          </section>

          {/* Jurisdiction */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Jurisdiction</h2>
            <p className="mb-4">
              Origin records are stored in the European Union and processed by infrastructure located in Germany (Hetzner).
            </p>
            <p className="mb-4">
              Cryptographic hashes (non-personal data, 64-character strings) are submitted to independent OpenTimestamps calendar servers for Bitcoin anchoring. These servers are globally distributed and not operated by Umarise.
            </p>
            <p className="text-landing-muted/50 text-sm">
              EU data processing is subject to GDPR and applicable data protection law.
            </p>
          </section>

          {/* Data Subject Rights */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Data Subject Rights</h2>
            <p className="mb-4">
              Because Umarise does not collect personal data, certain GDPR rights apply differently.
            </p>
            <ul className="space-y-6">
              <li>
                <span className="block text-landing-copper mb-2">Access</span>
                <p>Where applicable, origin records can be accessed or exported from the local device context.</p>
              </li>
              <li>
                <span className="block text-landing-copper mb-2">Erasure</span>
                <p>Associations between a local device and origin records can be removed by clearing local browser data. The cryptographic origin record itself remains immutable by design.</p>
              </li>
              <li>
                <span className="block text-landing-copper mb-2">Portability</span>
                <p>Where applicable, origin records can be exported in machine-readable formats.</p>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Contact</h2>
            <p className="mb-2">For privacy-related inquiries:</p>
            <a
              href="mailto:partners@umarise.com"
              className="text-landing-copper/70 hover:text-landing-copper transition-colors"
            >
              partners@umarise.com
            </a>
          </section>

          {/* Final Note */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Final Note</h2>
            <p className="text-landing-cream/90 mb-2">
              Umarise does not optimize systems, interpret meaning, or govern outcomes.
            </p>
            <p className="text-landing-cream/90 mb-4">
              It establishes origin and constrains history.
            </p>
            <p className="text-landing-muted/50 text-sm italic">
              Privacy follows from this constraint.
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
