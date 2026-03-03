import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

/**
 * /developers — Landing page for developer integration.
 * Links to existing /api-reference and /sdk-source routes.
 */
export default function Developers() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-4">
            Anchor anything. One API call. No account.
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            Developer Integration
          </p>
        </div>

        <div className="space-y-16 text-landing-muted/80 leading-relaxed">
          {/* Core API */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Core API</h2>
            <p className="text-landing-cream/80 mb-4">
              One endpoint. SHA-256 hash in, origin_id out. Independently verifiable via Bitcoin.
            </p>
            <pre className="bg-landing-muted/5 border border-landing-copper/15 rounded p-4 overflow-x-auto mb-4">
              <code className="font-mono text-sm text-landing-cream/70">{`curl -X POST https://api.umarise.com/v1/origins \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "sha256:...", "hash_algo": "sha256"}'`}</code>
            </pre>
            <Link
              to="/api-reference"
              className="text-landing-copper hover:text-landing-copper/80 transition-colors text-sm"
            >
              Full API Reference →
            </Link>
          </section>

          {/* Node SDK */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Node.js SDK</h2>
            <pre className="bg-landing-muted/5 border border-landing-copper/15 rounded p-4 overflow-x-auto mb-2">
              <code className="font-mono text-sm text-landing-cream/70">npm install @umarise/anchor</code>
            </pre>
            <pre className="bg-landing-muted/5 border border-landing-copper/15 rounded p-4 overflow-x-auto mb-4">
              <code className="font-mono text-sm text-landing-cream/70">{`import { anchor } from '@umarise/anchor'

const origin = await anchor(file) // returns origin_id`}</code>
            </pre>
            <p className="text-landing-muted/45 text-sm mb-2">
              Four functions: <span className="font-mono text-landing-copper/60">anchor</span>, <span className="font-mono text-landing-copper/60">verify</span>, <span className="font-mono text-landing-copper/60">resolve</span>, <span className="font-mono text-landing-copper/60">hashBuffer</span>
            </p>
            <Link
              to="/sdk-source"
              className="text-landing-copper hover:text-landing-copper/80 transition-colors text-sm"
            >
              View source →
            </Link>
          </section>

          {/* Python SDK */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Python SDK</h2>
            <pre className="bg-landing-muted/5 border border-landing-copper/15 rounded p-4 overflow-x-auto mb-2">
              <code className="font-mono text-sm text-landing-cream/70">pip install umarise</code>
            </pre>
            <pre className="bg-landing-muted/5 border border-landing-copper/15 rounded p-4 overflow-x-auto mb-4">
              <code className="font-mono text-sm text-landing-cream/70">{`from umarise import anchor

origin_id = anchor(file_path)`}</code>
            </pre>
            <p className="text-landing-muted/45 text-sm mb-2">
              Four functions: <span className="font-mono text-landing-copper/60">anchor</span>, <span className="font-mono text-landing-copper/60">verify</span>, <span className="font-mono text-landing-copper/60">resolve</span>, <span className="font-mono text-landing-copper/60">hash_buffer</span>
            </p>
            <Link
              to="/sdk-source"
              className="text-landing-copper hover:text-landing-copper/80 transition-colors text-sm"
            >
              View source →
            </Link>
          </section>

          {/* GitHub Action */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">GitHub Action</h2>
            <pre className="bg-landing-muted/5 border border-landing-copper/15 rounded p-4 overflow-x-auto mb-4">
              <code className="font-mono text-sm text-landing-cream/70">{`# .github/workflows/anchor.yml
- name: Anchor release
  uses: umarise/anchor-action@v1
  with:
    file: \${{ github.event.release.assets[0].browser_download_url }}`}</code>
            </pre>
            <p className="text-landing-muted/45 text-sm italic">
              Coming soon — separate repository outside Lovable.
            </p>
          </section>

          {/* Links */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Documentation</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/api-reference" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  API Reference
                </Link>
                <span className="text-landing-muted/50 ml-2">— endpoints, fields, error codes, live Try-it</span>
              </li>
              <li>
                <Link to="/sdk-source" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  SDK Source
                </Link>
                <span className="text-landing-muted/50 ml-2">— full Node.js and Python source code</span>
              </li>
              <li>
                <Link to="/sdk-spec" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  SDK Specification
                </Link>
                <span className="text-landing-muted/50 ml-2">— interface contract and design principles</span>
              </li>
              <li>
                <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper hover:text-landing-copper/80 transition-colors">
                  Anchoring Specification (IEC) ↗
                </a>
                <span className="text-landing-muted/50 ml-2">— independent specification</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="border-t border-landing-muted/10 pt-12">
            <p>
              <a href="mailto:partners@umarise.com" className="text-landing-copper/70 hover:text-landing-copper transition-colors">
                partners@umarise.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>&copy; {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
