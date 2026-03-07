import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BlogProofObjects() {
  useEffect(() => {
    document.title = 'How Umarise turns files into proof objects — Umarise';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'A digital file has no intrinsic proof of its history. A .proof file changes that. Hash, anchor, verify. The proof travels with the artifact.');
    setMeta('og:title', 'How Umarise turns files into proof objects — Umarise', true);
    setMeta('og:description', 'A digital file has no intrinsic proof of its history. A .proof file changes that.', true);
    setMeta('og:url', 'https://umarise.com/blog/proof-objects', true);
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
          How Umarise turns files into proof objects
        </h1>
        <p className="text-landing-muted text-sm mb-12">March 2026 · 5 min read</p>

        <div className="space-y-8 text-[15px] text-landing-cream leading-relaxed">

          <p className="text-lg font-light">
            A digital file has no intrinsic proof of its history. You cannot prove when it existed, whether it was modified, or if someone changed it after the fact.
          </p>

          <p>
            Umarise adds one element:
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`artifact
+ proof`}</pre>

          <p>Together, they form a proof object.</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`report.pdf
report.pdf.proof`}</pre>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Step 1: hash the artifact</h2>

          <p>
            The original file stays where it is. Umarise reads only the bytes and computes:
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`SHA256(file) → sha256:a3dc...`}</pre>

          <p>
            This is a cryptographic fingerprint. Any change to the file changes the hash.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Step 2: anchor the hash</h2>

          <p>The hash is anchored via:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`OpenTimestamps → Bitcoin`}</pre>

          <p>
            The blockchain acts as a global clock. The proof states: this hash existed no later than time T.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Step 3: the proof file</h2>

          <p>The result is a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> file containing:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`report.pdf.proof/
  certificate.json    ← hash, origin_id, timestamp
  proof.ots           ← OpenTimestamps binary proof`}</pre>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Step 4: artifact becomes proof object</h2>

          <p>The original file and the proof belong together:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`report.pdf
report.pdf.proof`}</pre>

          <p>Anyone can verify later:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`npx @umarise/cli verify report.pdf.proof
# ✓ hash matches
# ✓ anchored in Bitcoin block 935037
# ✓ no later than 2026-03-04
# ✓ proof valid — independent of Umarise`}</pre>

          <p>Or with standard tools:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`sha256sum report.pdf
ots verify proof.ots`}</pre>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The portable element</h2>

          <p>
            The proof does not live in a server or database. It sits next to the artifact.
          </p>

          <p>Copy both files to:</p>

          <ul className="list-disc list-inside space-y-1 text-landing-cream/90">
            <li>another machine</li>
            <li>a USB drive</li>
            <li>an archive</li>
            <li>a legal proceeding</li>
          </ul>

          <p>The proof remains fully intact. It travels with the file.</p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Why portable proof matters</h2>

          <p>Most systems store proof in their own database:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`file → platform → proof`}</pre>

          <p>You always have to trust the platform.</p>

          <p>Umarise inverts this:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`file + proof`}</pre>

          <p>The proof is:</p>

          <ul className="list-disc list-inside space-y-1 text-landing-cream/90">
            <li>independent</li>
            <li>verifiable</li>
            <li>transferable</li>
          </ul>

          <p>
            If Umarise ceases to exist, verification remains possible via hash + OpenTimestamps + Bitcoin.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The result</h2>

          <p>A normal digital file:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`report.pdf`}</pre>

          <p>becomes a proof object:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`report.pdf
report.pdf.proof`}</pre>

          <p>That object contains:</p>

          <ul className="list-disc list-inside space-y-1 text-landing-cream/90">
            <li>the original file</li>
            <li>a cryptographic proof of existence</li>
            <li>a publicly verifiable timestamp</li>
          </ul>

          <p className="text-lg font-light pt-4">
            Every digital artifact can carry its own proof.
          </p>

          <div className="mt-12 pt-8 border-t border-landing-muted/10">
            <h2 className="font-serif text-xl text-landing-cream mb-4">References</h2>
            <div className="space-y-1 font-mono text-sm">
              <p><a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Specification — anchoring-spec.org</a></p>
              <p><a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Verifier — verify-anchoring.org</a></p>
              <p><Link to="/blog/proof-of-existence" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Related — How to prove a file existed at a specific time</Link></p>
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
