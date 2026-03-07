import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function BlogAIProvenance() {
  useEffect(() => {
    document.title = 'AI has a provenance problem — Umarise';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'AI produces artifacts at scale. Datasets, models, outputs. But there is no standard way to prove when any of them existed. Anchoring fixes that.');
    setMeta('og:title', 'AI has a provenance problem — Umarise', true);
    setMeta('og:description', 'AI produces artifacts at scale. There is no standard way to prove when they existed.', true);
    setMeta('og:url', 'https://umarise.com/blog/ai-provenance', true);
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
          AI has a provenance problem
        </h1>
        <p className="text-landing-muted text-sm mb-12">March 2026 · 6 min read</p>

        <div className="space-y-8 text-[15px] text-landing-cream leading-relaxed">

          <p className="text-lg font-light">
            The AI world produces enormous volumes of digital artifacts: datasets, model weights, training configs, prompts, outputs, evaluation reports, generated media. There is currently no standard way to prove when any of them existed.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The current state</h2>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`dataset_v4_final_really_final.csv
model_v12_fixed_new.pt`}</pre>

          <p>
            That is not proof. That is a filename.
          </p>

          <p>There is no standard way to verify:</p>

          <ul className="list-disc list-inside space-y-1 text-landing-cream/90">
            <li>when something existed</li>
            <li>whether it was changed</li>
            <li>which version it was</li>
            <li>which dataset belonged to which model</li>
          </ul>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Why this becomes a problem</h2>

          <p>AI governance and regulation increasingly require answers to:</p>

          <ul className="list-disc list-inside space-y-1 text-landing-cream/90">
            <li>Where does this model come from?</li>
            <li>When was it trained?</li>
            <li>Which dataset was used?</li>
            <li>Was this document modified after the fact?</li>
          </ul>

          <p>Concrete domains where this matters:</p>

          <div className="space-y-3">
            <div className="border border-landing-muted/10 rounded-lg px-4 py-3">
              <span className="font-mono text-xs text-landing-muted block mb-1">AI Act</span>
              <p className="text-sm text-landing-cream/90">Audit trails for AI systems</p>
            </div>
            <div className="border border-landing-muted/10 rounded-lg px-4 py-3">
              <span className="font-mono text-xs text-landing-muted block mb-1">Research reproducibility</span>
              <p className="text-sm text-landing-cream/90">Proving results were not modified after publication</p>
            </div>
            <div className="border border-landing-muted/10 rounded-lg px-4 py-3">
              <span className="font-mono text-xs text-landing-muted block mb-1">Copyright / IP</span>
              <p className="text-sm text-landing-cream/90">Proving when content existed</p>
            </div>
            <div className="border border-landing-muted/10 rounded-lg px-4 py-3">
              <span className="font-mono text-xs text-landing-muted block mb-1">Deepfake detection</span>
              <p className="text-sm text-landing-cream/90">Establishing creation time of original media</p>
            </div>
          </div>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Anchoring at the artifact level</h2>

          <p>Anchoring turns each artifact into a verifiable proof object:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`dataset.csv
dataset.csv.proof

model.bin
model.bin.proof

report.pdf
report.pdf.proof`}</pre>

          <p>
            The <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> contains: hash, timestamp, Bitcoin anchor.
          </p>

          <p>
            Statement: these exact bytes existed no later than time T.
          </p>

          <p>This resolves provenance at the lowest level: the artifact itself.</p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Toward proof-driven AI systems</h2>

          <p>
            Current AI systems operate on trust. "This model was trained on dataset X." That statement is not verifiable.
          </p>

          <p>
            Software supply chains already moved past this. A release ships with:
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`software release
+ signature (.sig)
+ bill of materials (.sbom)`}</pre>

          <p>For AI, the equivalent pattern is:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`model.pt
model.pt.proof

dataset_v3.parquet
dataset_v3.parquet.proof

training_config.json
training_config.json.proof

evaluation_report.md
evaluation_report.md.proof`}</pre>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The chain of proof</h2>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`dataset
   ↓
training
   ↓
model
   ↓
evaluation
   ↓
deployment`}</pre>

          <p>
            If each artifact carries a <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code>, the result is verifiable AI provenance. Each step has a cryptographic anchor to a point in time.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">Primitive, not product</h2>

          <p>
            The common approach is building AI audit dashboards, compliance portals, or notarization services. The actual value sits in the primitive underneath.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-landing-muted/20">
                  <th className="text-left py-2 pr-4 font-mono text-xs text-landing-muted">Primitive</th>
                  <th className="text-left py-2 font-mono text-xs text-landing-muted">Ecosystem built on top</th>
                </tr>
              </thead>
              <tbody className="text-landing-cream/90">
                <tr className="border-b border-landing-muted/10">
                  <td className="py-2 pr-4">TLS certificates</td>
                  <td className="py-2">HTTPS</td>
                </tr>
                <tr className="border-b border-landing-muted/10">
                  <td className="py-2 pr-4">Git commits</td>
                  <td className="py-2">Software development</td>
                </tr>
                <tr className="border-b border-landing-muted/10">
                  <td className="py-2 pr-4">OpenTimestamps</td>
                  <td className="py-2">Timestamping</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">.proof files</td>
                  <td className="py-2">Digital artifact verification</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            If <code className="font-mono text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded text-landing-cream">.proof</code> becomes a standard, others build audit tools, compliance tools, AI governance tools, and document management systems on top of it.
          </p>

          <h2 className="font-serif text-xl text-landing-cream pt-4">The positioning</h2>

          <p>Not AI infrastructure. Not blockchain startup.</p>

          <p className="text-lg font-light">Proof infrastructure.</p>

          <p>
            The digital world consists of artifacts: code, datasets, models, documents, media, contracts, research. Anchoring adds one thing:
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`artifact + proof`}</pre>

          <p>The artifact becomes verifiable, provably timestamped, and independent of any vendor.</p>

          <p>
            The same way HTTPS became the default for websites:
          </p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`website + TLS`}</pre>

          <p>the equivalent for artifacts is:</p>

          <pre className="bg-landing-muted/[0.08] border border-landing-muted/10 rounded-lg px-4 py-3 font-mono text-sm text-landing-cream overflow-x-auto whitespace-pre">{`artifact + proof`}</pre>

          <div className="mt-12 pt-8 border-t border-landing-muted/10">
            <h2 className="font-serif text-xl text-landing-cream mb-4">References</h2>
            <div className="space-y-1 font-mono text-sm">
              <p><Link to="/blog/proof-objects" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Related — How Umarise turns files into proof objects</Link></p>
              <p><Link to="/blog/anchor-build-artifacts" className="text-landing-cream underline underline-offset-4 decoration-landing-muted/30 hover:decoration-landing-cream/50 transition-colors">Related — Anchor build artifacts in one YAML line</Link></p>
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
