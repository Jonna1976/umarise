import PageHeader from '@/components/PageHeader';

export default function GrowthPlan() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">Growth Plan</h1>
        <p className="text-landing-muted/50 text-sm mb-16">Developer Adoption & SEO — maart 2026</p>

        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Status */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Status</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom domein umarise.com gekoppeld</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Google Search Console geverifieerd (DNS)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Sitemap ingediend (sitemap.xml)</li>
              <li className="flex items-center gap-2"><span className="text-landing-muted/40">○</span> Eerste indexering afwachten (2-7 dagen)</li>
            </ul>
          </section>

          {/* Fase 1 */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Fase 1 — npm/PyPI vindbaarheid</h2>
            <p className="text-landing-muted/50 text-xs mb-4">Direct uitvoerbaar</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> <code className="text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">package.json</code> keywords: proof of existence, bitcoin timestamp, opentimestamps, file integrity, anchoring, digital proof, sha256, immutable record</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> <code className="text-xs bg-landing-muted/10 px-1.5 py-0.5 rounded">pyproject.toml</code> keywords &amp; classifiers (ultra-compatible metadata)</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> SDK READMEs: install → anchor → verify in 30 seconden</li>
            </ul>
          </section>

          {/* Fase 2 */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Fase 2 — Content &amp; backlinks</h2>
            <p className="text-landing-muted/50 text-xs mb-4">Week 1-2</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> dev.to blogpost: "How to anchor files to Bitcoin with one API call"</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Structuur: probleem → oplossing → code snippet → live demo link</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Cross-post naar Hashnode en Medium (canonical naar dev.to)</li>
            </ul>
          </section>

          {/* Fase 3 */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Fase 3 — GitHub visibility</h2>
            <p className="text-landing-muted/50 text-xs mb-4">Week 2-4</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Repo topics: anchoring, bitcoin, opentimestamps, proof-of-existence, digital-proof, file-integrity</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> GitHub Organization opzetten (umarise)</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Professionele org README met links naar SDKs, spec, verifier</li>
            </ul>
          </section>

          {/* Fase 4 */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Fase 4 — Community seeding</h2>
            <p className="text-landing-muted/50 text-xs mb-4">Maand 1-3</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Stack Overflow: beantwoord vragen over proof of existence, file timestamp, document integrity</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Reddit: r/crypto, r/bitcoin, r/selfhosted — relevante threads</li>
              <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Dependency chain: zoek projecten die timestamps/integrity nodig hebben</li>
            </ul>
          </section>

          {/* Metrics */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Metrics</h2>
            <ul className="space-y-2">
              <li>• npm weekly downloads</li>
              <li>• PyPI downloads</li>
              <li>• Google Search Console: impressions, clicks, indexed pages</li>
              <li>• GitHub stars + forks</li>
            </ul>
          </section>

        </div>
      </main>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
