import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BlogAnchorBuildArtifacts() {
  useEffect(() => {
    document.title = 'Anchor your build artifacts to Bitcoin in one YAML line — Umarise';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Add a single GitHub Action step to your workflow and get a Bitcoin-timestamped .proof file as a build artifact. No code changes, no vendor lock-in.');
    setMeta('og:title', 'Anchor your build artifacts to Bitcoin in one YAML line — Umarise', true);
    setMeta('og:description', 'One YAML line. Bitcoin-timestamped .proof files as build artifacts.', true);
    setMeta('og:url', 'https://umarise.com/blog/anchor-build-artifacts', true);
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
          Anchor your build artifacts to Bitcoin in one YAML line
        </h1>
        <p className="text-landing-muted text-sm mb-12">March 2026 · 3 min read</p>

        <div className="space-y-8 text-[15px] text-landing-cream leading-relaxed">

          <p className="text-lg font-light">
            Your release pipeline produces binaries, containers, and packages. But can you prove when they were built? And by whom? A <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> file next to every artifact changes that.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The setup</h2>

          <p>Add one step to any GitHub Actions workflow:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`name: Release

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: make build

      - name: Anchor artifact
        uses: AnchoringTrust/anchor-action@v1
        with:
          file: dist/app-\${{ github.ref_name }}.tar.gz
        env:
          UMARISE_API_KEY: \${{ secrets.UMARISE_API_KEY }}`}</pre>

          <p>That's it. Push a tag, the action runs, and <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">app-v2.1.0.tar.gz.proof</code> appears as a build artifact.</p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">What happens under the hood</h2>

          <ol className="list-decimal list-inside space-y-2 text-landing-cream/90">
            <li>The action computes a SHA-256 hash of your file</li>
            <li>The hash is sent to the Umarise Core API (the file stays on the runner)</li>
            <li>The API anchors the hash into Bitcoin via OpenTimestamps</li>
            <li>A <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">.proof</code> ZIP is uploaded as a GitHub Actions artifact</li>
          </ol>

          <p>The proof contains a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">certificate.json</code> (origin_id, hash, timestamp) and a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">proof.ots</code> (OpenTimestamps binary).</p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Verify</h2>

          <p>Anyone can verify. No account needed:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`# CLI
npx @umarise/cli verify app-v2.1.0.tar.gz.proof
# ✓ Hash Match | Bitcoin Block #939611 | 2026-03-06 | VALID

# Or drag-and-drop at verify-anchoring.org`}</pre>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The artifact pattern</h2>

          <p>The proof travels with the artifact. Store them together:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`releases/
  app-v2.1.0.tar.gz
  app-v2.1.0.tar.gz.proof    ← Bitcoin-timestamped

  app-v2.0.0.tar.gz
  app-v2.0.0.tar.gz.proof    ← verifiable forever`}</pre>

          <p>
            Commit to git, attach to a GitHub release, or ship to a client. The proof works offline. No API, no account, no platform dependency.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Why this matters for supply chain security</h2>

          <p>
            Software supply chain attacks are increasing. SBOMs document what's in a build. Code signing proves who built it. Anchoring proves <em>when</em> it existed.
          </p>
          <p>
            These are complementary. A <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">.proof</code> file next to a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">.sbom</code> and a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">.sig</code> creates a complete audit trail: what, who, and when.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Get started</h2>

          <ol className="list-decimal list-inside space-y-2 text-landing-cream/90">
            <li>
              Get an API key at{' '}
              <Link to="/developers" className="underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">umarise.com/developers</Link>
            </li>
            <li>Add <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">UMARISE_API_KEY</code> to your repo secrets</li>
            <li>Add the action step to your workflow</li>
            <li>Push. Done.</li>
          </ol>

          <div className="mt-12 pt-8 border-t border-landing-muted/10">
            <h2 className="font-serif text-xl text-landing-cream mb-4">Links</h2>
            <div className="space-y-1 font-mono text-sm">
              <p><a href="https://github.com/marketplace/actions/umarise-anchor" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">GitHub Marketplace — Umarise Anchor Action</a></p>
              <p><a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Verifier — verify-anchoring.org</a></p>
              <p><a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Specification — anchoring-spec.org</a></p>
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
