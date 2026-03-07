import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const posts = [
  {
    slug: 'ai-provenance',
    title: 'AI has a provenance problem',
    description: 'AI produces artifacts at scale. There is no standard way to prove when any of them existed. Anchoring fixes that.',
    date: 'March 2026',
    readTime: '6 min read',
    tags: ['ai', 'provenance', 'proof-infrastructure'],
  },
  {
    slug: 'proof-objects',
    title: 'How Umarise turns files into proof objects',
    description: 'A digital file has no intrinsic proof of its history. A .proof file changes that. Hash, anchor, verify. The proof travels with the artifact.',
    date: 'March 2026',
    readTime: '5 min read',
    tags: ['cryptography', 'portable-proof', 'architecture'],
  },
  {
    slug: 'anchor-build-artifacts',
    title: 'Anchor your build artifacts to Bitcoin in one YAML line',
    description: 'Every release deserves a proof. Add a single GitHub Action step and get a .proof file as a build artifact.',
    date: 'March 2026',
    readTime: '3 min read',
    tags: ['ci-cd', 'github-actions', 'supply-chain'],
  },
  {
    slug: 'proof-of-existence',
    title: 'How to prove a file existed at a specific time',
    description: 'Anchor any file to Bitcoin with one API call. CLI, SDK, GitHub Action. Open protocol, zero vendor lock-in.',
    date: 'March 2026',
    readTime: '4 min read',
    tags: ['bitcoin', 'proof-of-existence', 'developer-tools'],
  },
];

export default function Blog() {
  useEffect(() => {
    document.title = 'Blog — Umarise';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Technical articles on file anchoring, proof of existence, and Bitcoin timestamping for developers.');
    setMeta('og:title', 'Blog — Umarise', true);
    setMeta('og:description', 'Technical articles on file anchoring, proof of existence, and Bitcoin timestamping.', true);
    setMeta('og:url', 'https://umarise.com/blog', true);
    return () => { document.title = 'Umarise — Anchoring infrastructure for digital proof'; };
  }, []);

  return (
    <main className="min-h-screen bg-landing-deep text-landing-cream">
      <header className="border-b border-landing-muted/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg text-landing-cream hover:text-landing-cream/80 transition-colors">
            Umarise
          </Link>
          <span className="text-landing-muted text-sm font-mono">blog</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-3 tracking-tight text-landing-cream">
          Blog
        </h1>
        <p className="text-landing-muted text-[15px] mb-16">
          Technical articles on anchoring, proof of existence, and developer infrastructure.
        </p>

        <div className="space-y-12">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block group"
            >
              <article className="border border-landing-muted/10 rounded-lg p-6 hover:border-landing-muted/25 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-landing-muted text-xs font-mono">{post.date}</span>
                  <span className="text-landing-muted/30">·</span>
                  <span className="text-landing-muted text-xs font-mono">{post.readTime}</span>
                </div>
                <h2 className="font-serif text-xl text-landing-cream group-hover:text-landing-cream/80 transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-landing-muted text-sm leading-relaxed mb-4">
                  {post.description}
                </p>
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-landing-muted/60 border border-landing-muted/10 rounded px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </main>
  );
}
