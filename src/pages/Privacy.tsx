import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Privacy Policy for Umarise
 * Technical, honest, aligned with privacy-by-design architecture
 */
export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg">Umarise</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-12">Last updated: January 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Our Approach to Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umarise is privacy infrastructure. We don't collect personal data because our architecture 
              is designed to function without it. This document explains what we store, where, and why.
            </p>
          </section>

          {/* What we store */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What We Store</h2>
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Data Type</th>
                    <th className="text-left py-2 font-medium">Purpose</th>
                    <th className="text-left py-2 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">SHA-256 hash</td>
                    <td className="py-2">Bit-identity verification</td>
                    <td className="py-2">Hetzner (Germany)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Timestamp</td>
                    <td className="py-2">Temporal proof</td>
                    <td className="py-2">Hetzner (Germany)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Origin ID</td>
                    <td className="py-2">Reference identifier</td>
                    <td className="py-2">Hetzner (Germany)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Device ID</td>
                    <td className="py-2">Data isolation (not identification)</td>
                    <td className="py-2">Your browser only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* What we don't store */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What We Don't Store</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>No user accounts or passwords</li>
              <li>No email addresses</li>
              <li>No names or personal identifiers</li>
              <li>No tracking cookies or analytics</li>
              <li>No IP address logging</li>
              <li>No behavioral data</li>
            </ul>
          </section>

          {/* Device-based isolation */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Device-Based Isolation</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Instead of user accounts, Umarise uses a 128-bit UUID stored in your browser's localStorage. 
              This device identifier isolates your data without linking it to your identity. 
              We cannot connect your origins to you as a person.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you clear your browser data, your device ID is gone. We have no recovery mechanism 
              because we have no way to verify who you are — by design.
            </p>
          </section>

          {/* Architecture */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Three-Layer Architecture</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our infrastructure separates concerns to minimize data exposure:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Frontend Layer (EU):</strong> Static assets only. No data stored.</li>
              <li><strong>Control Plane (EU):</strong> Stateless functions. No origin content stored.</li>
              <li><strong>Data Plane (Germany):</strong> Origin records. Immutable. Write-once.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              A compromise of the control plane cannot expose origin content because 
              the control plane never holds origin content.
            </p>
          </section>

          {/* Jurisdiction */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Jurisdiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              All data processing occurs within the European Union. Origin records are stored 
              exclusively in Germany (Hetzner), subject to GDPR and German data protection law — 
              among the strictest privacy regimes globally.
            </p>
          </section>

          {/* Your rights */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Because we don't collect personal data, traditional GDPR rights (access, rectification, erasure) 
              apply differently:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> You can export your origins anytime from your device.</li>
              <li><strong>Erasure:</strong> You can revoke the association between your device and any origin. 
                The cryptographic record remains (immutability by design), but the link to your device is severed.</li>
              <li><strong>Portability:</strong> Origins are exported as standard formats (JSON, images).</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy inquiries:{' '}
              <a 
                href="mailto:partners@umarise.com?subject=Privacy%20Inquiry" 
                className="text-foreground underline hover:no-underline"
              >
                partners@umarise.com
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
