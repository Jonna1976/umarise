import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BlogProofOfExistence() {
  useEffect(() => {
    document.title = 'How to prove a file existed at a specific time — Umarise';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Anchor any file to Bitcoin with one API call. CLI, Node.js SDK, Python SDK, and GitHub Action. Open protocol, zero vendor lock-in.');
    setMeta('og:title', 'How to prove a file existed at a specific time — Umarise', true);
    setMeta('og:description', 'Anchor any file to Bitcoin with one API call. Open protocol, zero vendor lock-in.', true);
    setMeta('og:url', 'https://umarise.com/blog/proof-of-existence', true);
    return () => { document.title = 'Umarise — Anchoring infrastructure for digital proof'; };
  }, []);

  return (
    <main className="min-h-screen bg-landing-deep text-landing-cream">
      <header className="border-b border-landing-muted/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/" className="font-serif text-lg text-landing-cream hover:text-landing-cream/80 transition-colors">
            Umarise
          </Link>
          <span className="text-landing-muted/30">/</span>
          <Link to="/blog" className="text-landing-muted text-sm font-mono hover:text-landing-cream/60 transition-colors">
            blog
          </Link>
        </div>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-3 tracking-tight text-landing-cream">
          How to prove a file existed at a specific time
        </h1>
        <p className="text-landing-muted text-sm mb-12">March 2026 · 4 min read</p>

        <div className="space-y-8 text-[15px] text-landing-cream leading-relaxed">

          <p className="text-lg font-light">
            File metadata lies. Timestamps can be edited. Cloud storage providers can change records. If someone asks "prove this existed before Tuesday" -- you can't.
          </p>
          <p>
            Unless you anchored it.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The problem</h2>

          <p>
            Every file on your computer has a "created at" timestamp. It means nothing. You can change it with one terminal command. Cloud providers can overwrite it. Courts know this. Auditors know this. Your competitors know this.
          </p>
          <p>
            What you need is a timestamp that sits outside your own system. One that nobody controls. One that is verifiable by anyone, forever.
          </p>
          <p>
            Bitcoin's blockchain is a public, append-only ledger with a timestamp on every block. If you embed a hash of your file into a Bitcoin transaction, you have mathematical proof that the file existed before that block was mined.
          </p>
          <p>
            This is called proof of existence. The cryptography is simple. A clean developer primitive for it has been missing. Here is one.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Install</h2>

          <div className="space-y-3">
            <div>
              <span className="text-landing-muted text-xs font-mono block mb-1">CLI (fastest)</span>
              <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto">
                npx @umarise/cli anchor your-file.pdf
              </pre>
            </div>
            <div>
              <span className="text-landing-muted text-xs font-mono block mb-1">Node.js</span>
              <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto">
                npm install @umarise/anchor
              </pre>
            </div>
            <div>
              <span className="text-landing-muted text-xs font-mono block mb-1">Python</span>
              <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto">
                pip install umarise-core-sdk
              </pre>
            </div>
          </div>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Anchor a file</h2>

          <p>The file never leaves your machine. You compute a SHA-256 hash locally and anchor it into Bitcoin via OpenTimestamps.</p>

          <div className="space-y-3">
            <div>
              <span className="text-landing-muted text-xs font-mono block mb-1">Node.js</span>
              <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`import { UmariseCore } from '@umarise/anchor';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

const hash = createHash('sha256')
  .update(readFileSync('contract.pdf'))
  .digest('hex');

const core = new UmariseCore({ apiKey: 'um_...' });
const origin = await core.attest(\`sha256:\${hash}\`);
console.log(origin.origin_id);  // → "abc4f2..."`}</pre>
            </div>
            <div>
              <span className="text-landing-muted text-xs font-mono block mb-1">Python</span>
              <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`from umarise import UmariseCore, hash_buffer

with open("contract.pdf", "rb") as f:
    file_hash = hash_buffer(f.read())

core = UmariseCore(api_key="um_...")
origin = core.attest(file_hash)
print(origin.origin_id)  # → "abc4f2..."`}</pre>
            </div>
          </div>

          <h2 className="font-serif text-xl text-landing-cream pt-4">What comes back</h2>

          <p>
            The CLI generates a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> file. It's a ZIP containing:
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`your-file.pdf.proof/
  certificate.json    ← origin_id, hash, timestamp
  proof.ots           ← OpenTimestamps binary proof`}</pre>

          <p>
            The proof is verifiable by anyone, without an account, without trusting Umarise, using a block explorer or the open verifier at{' '}
            <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">
              verify-anchoring.org
            </a>.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">CLI quickstart</h2>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`# Anchor
npx @umarise/cli anchor contract-draft-v3.pdf
# ✓ hash: sha256:9f3a...
# ✓ anchored: origin_id abc4f2...
# ✓ saved: contract-draft-v3.pdf.proof

# Verify (after ~2 hours, when Bitcoin confirms)
npx @umarise/cli verify contract-draft-v3.pdf.proof
# ✓ Hash Match | Bitcoin Block #939611 | 2026-03-06 | VALID`}</pre>

          <h2 className="font-serif text-xl text-landing-cream pt-4">CI/CD: one YAML line</h2>

          <p>Anchor every build artifact automatically:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`# .github/workflows/release.yml
- uses: AnchoringTrust/anchor-action@v1
  with:
    file: dist/release.tar.gz
  env:
    UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}`}</pre>

          <p>
            The <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> file appears as a build artifact. No code changes. No vendor lock-in.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Why this matters now</h2>

          <p>
            AI generates convincing content locally, without network traces, without cost. Documents, images, contracts. The question has shifted from "is this fake?" to "can you prove when this existed?"
          </p>
          <p>
            Anchoring gives you a fact that sits outside your own system. The hash is in Bitcoin. The block is public. The proof is portable. It works offline. It works in court.
          </p>
          <p>
            The proof travels with the artifact. Store them together. Commit to git, attach to a release, or ship to a client.
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`release/
  app-v2.1.0.tar.gz
  app-v2.1.0.tar.gz.proof   ← verifiable forever`}</pre>

          <div className="mt-12 pt-8 border-t border-landing-muted/10">
            <h2 className="font-serif text-xl text-landing-cream mb-4">Open by design</h2>
            <div className="space-y-1 font-mono text-sm">
              <p><a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Specification — anchoring-spec.org</a></p>
              <p><a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Verifier — verify-anchoring.org</a></p>
              <p><a href="https://npmjs.com/package/@umarise/anchor" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">npm — @umarise/anchor</a></p>
              <p><a href="https://pypi.org/project/umarise-core-sdk/" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">PyPI — umarise-core-sdk</a></p>
              <p><a href="https://github.com/marketplace/actions/umarise-anchor" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">GitHub Action — anchor-action</a></p>
              <p><Link to="/developers" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Get your API key — umarise.com/developers</Link></p>
            </div>
          </div>

        </div>
      </article>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </main>
  );
}
