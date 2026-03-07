import PageHeader from '@/components/PageHeader';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveMetrics {
  totalOrigins: number;
  todayOrigins: number;
  totalProofs: number;
  anchoredProofs: number;
  pendingProofs: number;
  activePartners7d: number;
  last30dOrigins: number;
}

function useLiveMetrics() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      const [originsRes, todayRes, proofsRes, partnersRes, thirtyDayRes] = await Promise.all([
        supabase.from('origin_attestations').select('*', { count: 'exact', head: true }),
        supabase.from('origin_attestations').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('core_ots_proofs').select('origin_id, status'),
        supabase.from('origin_attestations').select('api_key_prefix').not('api_key_prefix', 'is', null).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from('origin_attestations').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);

      const proofs = proofsRes.data || [];
      const partnerPrefixes = new Set((partnersRes.data || []).map(r => r.api_key_prefix));

      setMetrics({
        totalOrigins: originsRes.count || 0,
        todayOrigins: todayRes.count || 0,
        totalProofs: proofs.length,
        anchoredProofs: proofs.filter(p => p.status === 'anchored').length,
        pendingProofs: proofs.filter(p => p.status === 'pending').length,
        activePartners7d: partnerPrefixes.size,
        last30dOrigins: thirtyDayRes.count || 0,
      });
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch metrics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, lastUpdated, refresh: fetchMetrics };
}

export default function GrowthPlan() {
  const { metrics, loading, lastUpdated, refresh } = useLiveMetrics();

  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">Growth Plan</h1>
        <p className="text-landing-muted/50 text-sm mb-16">Developer Adoption & SEO — maart 2026</p>

        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Status */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Status — 6 maart 2026</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Custom domein umarise.com gekoppeld</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Google Search Console geverifieerd (DNS)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Sitemap ingediend (sitemap.xml)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> CLI full lifecycle bewezen: install → anchor → pending → re-run → .proof → verify → unzip</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Bitcoin block 939611 bevestigd (6 maart 2026)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> .proof bundel bevat certificate.json + proof.ots + VERIFY.txt</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Offline verify werkt: hash match + OTS Bitcoin verificatie</li>
              <li className="flex items-center gap-2"><span className="text-landing-muted/40">○</span> Eerste indexering afwachten (2-7 dagen)</li>
            </ul>
          </section>

          {/* Protocol Maturity Scorecard */}
          <section className="border border-landing-copper/30 rounded-lg p-6 bg-landing-copper/5">
            <h2 className="text-sm font-medium tracking-wide text-landing-copper uppercase mb-2">Protocol Maturity — 8.5 / 10</h2>
            <p className="text-xs text-landing-muted/50 mb-6">De resterende 1,5 punt zit in vier gebieden. Adoptie alleen is niet genoeg — een protocol wint wanneer spec, ecosystem, defaults én use case tegelijk kloppen.</p>
            
            <div className="space-y-5">
              {/* Factor 1: Open spec — 70% */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-landing-copper font-mono text-sm font-medium">0.5</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-landing-cream/90 font-medium text-sm">Open, stabiele spec</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-mono">70%</span>
                  </div>
                  <div className="text-xs space-y-1 text-landing-muted/50 mb-2">
                    <p><span className="text-green-400">✓</span> anchoring-spec.org v1.0 — 18-sectie normatieve spec, frozen, public domain</p>
                    <p><span className="text-green-400">✓</span> certificate.json v1.3 — schema gedocumenteerd met backward compatibility</p>
                    <p><span className="text-green-400">✓</span> V(B, P, L) → &#123;valid | invalid | unverifiable&#125; gedefinieerd</p>
                    <p><span className="text-green-400">✓</span> Semantic exclusions, independence requirement, ledger qualification</p>
                    <p><span className="text-landing-muted/30">○</span> .proof container spec als apart document ("anyone can implement it")</p>
                    <p><span className="text-landing-muted/30">○</span> Backward compatibility rules voor .proof formaat</p>
                  </div>
                  <p className="text-xs text-landing-muted/40 mb-2">Spec is er, maar .proof container is nog implementatie, geen spec.</p>
                  <div className="w-full bg-landing-muted/10 rounded-full h-1.5">
                    <div className="bg-amber-400/60 h-1.5 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>

              {/* Factor 2: Onafhankelijke verifiers — 40% */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-landing-copper font-mono text-sm font-medium">0.3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-landing-cream/90 font-medium text-sm">Onafhankelijke verifiers</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 font-mono">40%</span>
                  </div>
                  <div className="text-xs space-y-1 text-landing-muted/50 mb-2">
                    <p><span className="text-green-400">✓</span> verify-anchoring.org — 100% client-side, Unlicense, forkbaar</p>
                    <p><span className="text-green-400">✓</span> CLI <code className="bg-landing-muted/10 px-1 rounded">umarise verify</code> — offline OTS verificatie</p>
                    <p><span className="text-green-400">✓</span> bash/python scripts (verify-anchor.sh, verify-anchor.py)</p>
                    <p><span className="text-green-400">✓</span> VERIFY.txt in elke bundel met handmatige stappen</p>
                    <p><span className="text-landing-muted/30">○</span> Geen third-party verifier (alles door ons gebouwd)</p>
                    <p><span className="text-landing-muted/30">○</span> Geen Go/Rust/Python library van een derde partij</p>
                  </div>
                  <p className="text-xs text-landing-muted/40 mb-2">Technisch onafhankelijk verifieerbaar, maar geen ecosystem buiten ons.</p>
                  <div className="w-full bg-landing-muted/10 rounded-full h-1.5">
                    <div className="bg-amber-400/60 h-1.5 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>

              {/* Factor 3: Default in tools — 20% */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-landing-copper font-mono text-sm font-medium">0.4</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-landing-cream/90 font-medium text-sm">Default in tools</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-landing-muted/20 text-landing-muted/50 font-mono">20%</span>
                  </div>
                  <div className="text-xs space-y-1 text-landing-muted/50 mb-2">
                    <p><span className="text-green-400">✓</span> GitHub Action op Marketplace (anchor-action@v1)</p>
                    <p><span className="text-green-400">✓</span> npx @umarise/cli — zero-install</p>
                    <p><span className="text-green-400">✓</span> anchoring-examples repo met workflow</p>
                    <p><span className="text-landing-muted/30">○</span> Geen externe tool heeft .proof als default</p>
                    <p><span className="text-landing-muted/30">○</span> Geen integratie in bestaande CI/dataset/ML tools</p>
                  </div>
                  <p className="text-xs text-landing-muted/40 mb-2">Wij bieden de tools, maar niemand anders genereert .proof automatisch.</p>
                  <div className="w-full bg-landing-muted/10 rounded-full h-1.5">
                    <div className="bg-landing-muted/30 h-1.5 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>

              {/* Factor 4: Dominante use case — 15% */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 text-right">
                  <span className="text-landing-copper font-mono text-sm font-medium">0.3</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-landing-cream/90 font-medium text-sm">Eén dominante use case</h3>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-landing-muted/20 text-landing-muted/50 font-mono">15%</span>
                  </div>
                  <div className="text-xs space-y-1 text-landing-muted/50 mb-2">
                    <p><span className="text-green-400">✓</span> CI/build artifacts technisch bewezen (GitHub Action werkt)</p>
                    <p><span className="text-green-400">✓</span> Vier dev.to posts dekken CI, AI, research, legal</p>
                    <p><span className="text-landing-muted/30">○</span> Geen meetbare concentratie van anchors in één categorie</p>
                    <p><span className="text-landing-muted/30">○</span> Nog geen "dit is waar 80% van de anchors vandaan komt"</p>
                  </div>
                  <p className="text-xs text-landing-muted/40 mb-2">Breed gepositioneerd, niet gefocust. Meest logisch: <strong className="text-landing-cream/70">software artifacts</strong> of <strong className="text-landing-cream/70">AI provenance</strong>.</p>
                  <div className="w-full bg-landing-muted/10 rounded-full h-1.5">
                    <div className="bg-landing-muted/30 h-1.5 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-landing-copper/15 mt-6 pt-4">
              <p className="text-xs text-landing-muted/50 italic">
                De echte eindtest: developers gebruiken het zonder te weten wie het gebouwd heeft. Zoals bij DNS, TLS, Git.
              </p>
              <p className="text-xs text-landing-muted/40 mt-2">
                Snelste winst: .proof container spec schrijven (+0.5). De rest vereist externe adoptie.
              </p>
            </div>
          </section>

          {/* Network Effects */}
          <section className="border border-landing-copper/20 rounded-lg p-6 bg-landing-copper/5">
            <h2 className="text-sm font-medium tracking-wide text-landing-copper uppercase mb-4">3 Network Effects</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">1. Artifact standaard</h3>
                <p className="text-sm text-landing-muted/70 mb-2">Tools gaan automatisch .proof toevoegen.</p>
                <pre className="text-xs bg-landing-muted/10 px-3 py-2 rounded font-mono leading-relaxed">dataset.parquet + dataset.parquet.proof{'\n'}model.pt + model.pt.proof{'\n'}report.pdf + report.pdf.proof</pre>
                <p className="text-xs text-landing-muted/50 mt-2">Als developers dit verwachten, wordt .proof normaal.</p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">2. Verification ecosystem</h3>
                <p className="text-sm text-landing-muted/70 mb-2">Meer software gaat .proof begrijpen: document systemen, AI pipelines, research tools, audit software, archieven.</p>
                <p className="text-xs font-mono text-landing-muted/50">artifact + .proof → automatisch geverifieerd</p>
                <p className="text-xs text-landing-muted/50 mt-1">Zoals: website + TLS · software + SBOM</p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">3. Institutionele acceptatie</h3>
                <p className="text-sm text-landing-muted/70">Als auditors, rechtbanken, universiteiten, archieven en compliance systemen .proof accepteren:</p>
                <p className="text-xs font-mono text-landing-copper mt-2">artifact + .proof = geldig bewijs</p>
              </div>
            </div>
          </section>

          {/* Protocol Strategy */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Protocol, geen patent</h2>
            <p className="text-sm text-landing-muted/70 mb-4">Succesvolle protocollen zijn open. Een standaard groeit alleen als iedereen het kan implementeren.</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs font-mono mb-6">
              <span className="text-landing-muted/50">DNS</span><span className="text-landing-muted/40">geen patent</span>
              <span className="text-landing-muted/50">HTTP</span><span className="text-landing-muted/40">geen patent</span>
              <span className="text-landing-muted/50">TLS</span><span className="text-landing-muted/40">geen patent</span>
              <span className="text-landing-muted/50">Git</span><span className="text-landing-muted/40">geen patent</span>
              <span className="text-landing-muted/50">OpenTimestamps</span><span className="text-landing-muted/40">geen patent</span>
            </div>
            <h3 className="text-landing-cream/90 text-sm font-medium mb-2">Wat wél verdedigd wordt</h3>
            <div className="space-y-2 text-sm text-landing-muted/70">
              <div className="flex items-start gap-2"><span className="text-landing-copper font-mono text-xs">01</span> <span><strong className="text-landing-cream/80">Trademark</strong> — Umarise, Umarise Proof, Anchoring Trust</span></div>
              <div className="flex items-start gap-2"><span className="text-landing-copper font-mono text-xs">02</span> <span><strong className="text-landing-cream/80">Reference implementatie</strong> — @umarise/cli, @umarise/anchor, GitHub Action</span></div>
              <div className="flex items-start gap-2"><span className="text-landing-copper font-mono text-xs">03</span> <span><strong className="text-landing-cream/80">Distributie</strong> — npm, npx, GitHub Actions, SDK's</span></div>
            </div>
          </section>

          {/* Strategie in 3 stappen */}
          <section className="border border-landing-muted/10 rounded-lg p-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Strategie in 3 stappen</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-landing-copper font-mono text-xs mt-0.5">1</span>
                <p className="text-landing-cream/90">Laat developers .proof genereren.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-copper font-mono text-xs mt-0.5">2</span>
                <p className="text-landing-cream/90">Laat tools .proof automatisch verifiëren.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-copper font-mono text-xs mt-0.5">3</span>
                <p className="text-landing-cream/90">Laat instituten .proof accepteren.</p>
              </div>
            </div>
            <p className="text-xs text-landing-muted/50 mt-6 font-mono">artifact + .proof — net zoals website + TLS, software + SBOM</p>
          </section>

          {/* Adoptie-these */}
          <section className="border border-landing-copper/20 rounded-lg p-6 bg-landing-copper/5">
            <h2 className="text-sm font-medium tracking-wide text-landing-copper uppercase mb-4">Adoptie-these</h2>
            <p className="text-landing-cream/90 mb-4">
              Infrastructure groeit via <strong>frequentie &gt; importantie</strong>.
            </p>
            <p className="mb-4">
              De eerste 10k anchors komen van routine artifacts, niet van zeldzame juridische momenten.
            </p>
            <p className="text-landing-cream/70 text-sm italic mb-6">
              artifact → artifact + proof — net zoals artifact → artifact + signature.
            </p>
            <div className="border-t border-landing-copper/15 pt-4 mt-4">
              <p className="text-landing-cream/90 mb-2">
                <strong>Distributie-regel:</strong> partnerships zijn 6-18 maanden. Developer adoptie is 6 minuten.
              </p>
              <p className="text-sm text-landing-muted/60 mb-2">
                Focus op <strong>anchors per day</strong>, niet partners per quarter.
              </p>
              <p className="text-sm text-landing-muted/60">
                Test: als een developer kan beginnen zonder met ons te praten → we zitten goed. ✓
              </p>
            </div>
          </section>

          {/* Parallelpad visualisatie */}
          <section className="border border-landing-copper/20 rounded-lg p-6 bg-landing-copper/5">
            <h2 className="text-sm font-medium tracking-wide text-landing-copper uppercase mb-2">Het Parallelpad</h2>
            <p className="text-xs text-landing-muted/50 mb-8">Stripe deed het ook niet ofwel/ofwel. De early developer community was het bewijs dat het werkte, de grote namen kwamen daarna.</p>

            <div className="relative">
              {/* Central timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-landing-copper/20 -translate-x-1/2 hidden md:block" />

              {/* Phase labels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 relative">
                {/* Left track: Developer-first */}
                <div className="md:pr-8 md:text-right space-y-6">
                  <div>
                    <p className="text-xs text-landing-copper uppercase tracking-wide font-medium mb-1">Track A — Developer-first</p>
                    <p className="text-xs text-landing-muted/40">Parallelle adoptie. 6 minuten, niet 6 maanden.</p>
                  </div>

                  <div className="md:border-r md:border-landing-copper/15 md:pr-6 py-2">
                    <div className="flex items-center gap-2 md:justify-end mb-1">
                      <span className="text-green-400 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">CLI + SDK + GitHub Action</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">Developer integreert. Baas heeft geen keuze meer.</p>
                  </div>

                  <div className="md:border-r md:border-landing-copper/15 md:pr-6 py-2">
                    <div className="flex items-center gap-2 md:justify-end mb-1">
                      <span className="text-green-400 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">Copy-paste adoptie</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">uses: anchor-action@v1 in een workflow → "oh handig" → klaar.</p>
                  </div>

                  <div className="md:border-r md:border-landing-copper/15 md:pr-6 py-2">
                    <div className="flex items-center gap-2 md:justify-end mb-1">
                      <span className="text-amber-400 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">.proof wordt verwacht</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">artifact + artifact.proof is normaal, zoals artifact + .sig</p>
                  </div>

                  <div className="md:border-r md:border-landing-copper/15 md:pr-6 py-2">
                    <div className="flex items-center gap-2 md:justify-end mb-1">
                      <span className="text-landing-muted/30 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">Default in externe tools</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">CI tools, ML pipelines genereren .proof automatisch.</p>
                  </div>
                </div>

                {/* Right track: Geloofwaardige partner */}
                <div className="md:pl-8 space-y-6">
                  <div>
                    <p className="text-xs text-landing-copper uppercase tracking-wide font-medium mb-1">Track B — Zichtbare partner</p>
                    <p className="text-xs text-landing-muted/40">Geloofwaardigheid voor het verhaal. 6-18 maanden.</p>
                  </div>

                  <div className="md:border-l md:border-landing-copper/15 md:pl-6 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-400 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">Één geloofwaardige naam</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">Credo AI, juridisch SaaS-platform, onderzoeksdatabank.</p>
                  </div>

                  <div className="md:border-l md:border-landing-copper/15 md:pl-6 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-landing-muted/30 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">Platform waar bewijs al relevant is</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">Niet overtuigen, maar integreren waar de behoefte al bestaat.</p>
                  </div>

                  <div className="md:border-l md:border-landing-copper/15 md:pl-6 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-landing-muted/30 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">Case study als bewijs</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">"X gebruikt Umarise" → developer vertrouwt de primitive.</p>
                  </div>

                  <div className="md:border-l md:border-landing-copper/15 md:pl-6 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-landing-muted/30 text-xs">●</span>
                      <p className="text-sm text-landing-cream/90 font-medium">Institutionele acceptatie</p>
                    </div>
                    <p className="text-xs text-landing-muted/50">Auditors, rechtbanken accepteren .proof als geldig bewijs.</p>
                  </div>
                </div>
              </div>

              {/* Convergence point */}
              <div className="mt-8 pt-6 border-t border-landing-copper/15 text-center">
                <p className="text-xs text-landing-copper font-mono mb-1">↓ convergentie</p>
                <p className="text-sm text-landing-cream/90 font-medium">Developers gebruiken het zonder te weten wie het gebouwd heeft.</p>
                <p className="text-xs text-landing-muted/40 mt-1">Track A levert volume. Track B levert legitimiteit. Samen wordt het protocol.</p>
              </div>
            </div>

            {/* Cooper insight */}
            <div className="mt-8 pt-6 border-t border-landing-copper/10">
              <p className="text-xs text-landing-muted/40 italic leading-relaxed">
                De doorbraak komt nooit van alle partijen tegelijk. Zoek niet naar brede adoptie — zoek naar drie of vier partijen die zo zichtbaar zijn dat anderen vanzelf volgen. Eén grote juridische firma die het gebruikt in een zaak. Eén universiteit die het verplicht stelt voor datasets. Dat is genoeg om het evenwicht te kantelen.
              </p>
              <p className="text-xs text-landing-muted/25 mt-2">— coördinatieprobleem (Cooper)</p>
            </div>
          </section>

          {/* Stripe 2014 parallel */}
          <section className="border border-landing-muted/10 rounded-lg p-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Stripe 2014 — het precedent</h2>
            <div className="space-y-3 text-sm text-landing-muted/70">
              <p>Stripe begon met developers only — maar dat was een bewuste keuze omdat developers de beslissers waren.</p>
              <p>Een developer integreerde Stripe, en zijn baas had geen keuze meer. De adoptie liep via de technische laag omhoog naar de business.</p>
              <p className="text-landing-cream/80">Voor Umarise is de vraag: wie is de equivalent van die developer? Dat is niet een juridische firma of een universiteit — dat is de developer die de API integreert in een platform waar bewijs al relevant is.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-landing-muted/10 grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-landing-muted/40 mb-1">Stripe 2014</p>
                <p className="text-landing-cream/60">developer → integratie → baas volgt</p>
              </div>
              <div>
                <p className="text-landing-muted/40 mb-1">Umarise 2026</p>
                <p className="text-landing-cream/60">developer → .proof in CI → organisatie volgt</p>
              </div>
            </div>
          </section>

          {/* Prijslijn */}
          <section className="border border-landing-copper/20 rounded-lg p-6 bg-landing-copper/5">
            <h2 className="text-sm font-medium tracking-wide text-landing-copper uppercase mb-2">Prijslijn</h2>
            <p className="text-xs text-landing-muted/50 mb-6">Particulier én ZZP gratis. API-integratie betaald. Eén lijn, geen twijfel.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-landing-muted/10 rounded-lg p-4">
                <p className="text-xs text-landing-muted/40 uppercase tracking-wide mb-2">Particulier / ZZP</p>
                <p className="text-2xl font-mono text-landing-cream font-medium mb-1">Gratis</p>
                <p className="text-xs text-landing-muted/50 leading-relaxed">Via itexisted.app of CLI. Geen account, geen limiet op verificatie. Bewijs is een publiek goed.</p>
              </div>
              <div className="border border-landing-copper/30 rounded-lg p-4 bg-landing-copper/5">
                <p className="text-xs text-landing-copper uppercase tracking-wide mb-2">API-integratie</p>
                <p className="text-2xl font-mono text-landing-copper font-medium mb-1">€0,10<span className="text-sm text-landing-muted/40">/anchor</span></p>
                <p className="text-xs text-landing-muted/50 leading-relaxed">Prepaid credits. 100 gratis bij key-generatie. Bundels van 500 tot 50.000.</p>
              </div>
              <div className="border border-landing-muted/10 rounded-lg p-4">
                <p className="text-xs text-landing-muted/40 uppercase tracking-wide mb-2">Certified</p>
                <p className="text-2xl font-mono text-landing-cream font-medium mb-1">Op maat</p>
                <p className="text-xs text-landing-muted/50 leading-relaxed">SLA, compliance-garanties, dedicated support. Zelfde primitive, hogere assurance.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-landing-copper/10 space-y-2">
              <div className="flex items-start gap-2 text-xs text-landing-muted/50">
                <span className="text-landing-copper mt-0.5">→</span>
                <p>Verificatie is altijd gratis, voor iedereen, zonder account.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-landing-muted/50">
                <span className="text-landing-copper mt-0.5">→</span>
                <p>De primitive is identiek over alle tiers. Prijs = assurance, niet functionaliteit.</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-landing-muted/50">
                <span className="text-landing-copper mt-0.5">→</span>
                <p>Let's Encrypt model: gratis gebruik bouwt adoptie, betaald gebruik bouwt het bedrijf.</p>
              </div>
            </div>
          </section>


          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Hoe infrastructuur verspreidt</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-landing-copper font-mono text-xs mt-0.5">01</span>
                <div>
                  <p className="text-landing-cream/90 font-medium">Default in tools</p>
                  <p className="text-landing-muted/60">CI tools, AI pipelines, dataset tools. Als het standaard draait, groeit het automatisch.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-copper font-mono text-xs mt-0.5">02</span>
                <div>
                  <p className="text-landing-cream/90 font-medium">Automation</p>
                  <p className="text-landing-muted/60">build → anchor, dataset export → anchor, model checkpoint → anchor. Systemen, niet mensen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-copper font-mono text-xs mt-0.5">03</span>
                <div>
                  <p className="text-landing-cream/90 font-medium">Developer copy-paste</p>
                  <p className="text-landing-muted/60">Iemand ziet <code className="text-xs bg-landing-muted/10 px-1 rounded">uses: AnchoringTrust/anchor-action@v1</code> → "oh handig" → adoptie. Geen meetings.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Primaire kanalen */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Primaire adoptie-kanalen</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-landing-copper mb-2">1. CI / build artifacts</h3>
                <p className="text-sm mb-2">Elke build produceert binaries, models, datasets, releases. GitHub Action is het sterkste kanaal.</p>
                <code className="text-xs bg-landing-muted/10 px-2 py-1 rounded block">release.tar.gz → release.tar.gz.proof</code>
              </div>
              <div>
                <h3 className="text-landing-copper mb-2">2. AI pipelines</h3>
                <p className="text-sm">Dataset snapshots, training outputs, model checkpoints. Provenance is een groot probleem in AI.</p>
              </div>
              <div>
                <h3 className="text-landing-copper mb-2">3. Open-source releases</h3>
                <p className="text-sm">.proof naast SHA256 en GPG signature. Bewijs dat dit de originele release was.</p>
              </div>
              <div>
                <h3 className="text-landing-copper mb-2">4. Research / data</h3>
                <p className="text-sm">Datasets, analysis code, paper drafts. Prioriteit en provenance.</p>
              </div>
            </div>
          </section>

          {/* Executie-plan: 5 stappen */}
          <section className="border border-landing-copper/20 rounded-lg p-6 bg-landing-copper/5">
            <h2 className="text-sm font-medium tracking-wide text-landing-copper uppercase mb-6">Executieplan — 5 stappen</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">1. Proof showcase repo <span className="text-green-400 text-xs ml-1">✓</span></h3>
                <p className="text-sm text-landing-muted/60 mb-2">GitHub repo <code className="text-xs bg-landing-muted/10 px-1 rounded">anchoring-examples</code> met tastbare voorbeelden:</p>
                <pre className="text-xs bg-landing-muted/10 px-3 py-2 rounded font-mono leading-relaxed">dataset.parquet + dataset.parquet.proof{'\n'}model.pt + model.pt.proof{'\n'}release.tar.gz + release.tar.gz.proof</pre>
                <p className="text-xs text-landing-muted/40 mt-2">README: "Every artifact is anchored in Bitcoin. Verify at verify-anchoring.org"</p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">2. .proof zichtbaar in GitHub releases <span className="text-green-400 text-xs ml-1">✓</span></h3>
                <p className="text-sm text-landing-muted/60">Release v0.1.0 live met example.txt + example.txt.proof als assets.</p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">2b. CLI end-to-end bewezen <span className="text-green-400 text-xs ml-1">✓</span></h3>
                <p className="text-sm text-landing-muted/60 mb-2">Volledige lifecycle via terminal bevestigd op 6 maart 2026:</p>
                <pre className="text-xs bg-landing-muted/10 px-3 py-2 rounded font-mono leading-relaxed whitespace-pre-wrap">$ umarise proof screenshot.png{'\n'}✓ hash: sha256:4dedc331...{'\n'}✓ anchored: origin_id 98d40a69-...{'\n'}⏳ proof pending — run again later{'\n\n'}$ umarise proof screenshot.png  # ~2h later{'\n'}✓ anchored in Bitcoin block 939611{'\n'}✓ no later than: 2026-03-06{'\n'}✓ saved: screenshot.png.proof{'\n'}✓ proof valid — independent of Umarise</pre>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">3. GitHub Action standaard <span className="text-green-400 text-xs ml-1">✓</span></h3>
                <pre className="text-xs bg-landing-muted/10 px-3 py-2 rounded font-mono">uses: AnchoringTrust/anchor-action@v1</pre>
                <p className="text-xs text-landing-muted/40 mt-1">artifact → artifact.proof, automatisch</p>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">4. Plaats het waar developers zoeken <span className="text-green-400 text-xs ml-1">✓</span></h3>
                <ul className="text-sm text-landing-muted/60 space-y-1 mt-1">
                  <li>• GitHub — voorbeeldrepos, releases met .proof</li>
                  <li>• npm — CLI package (@umarise/cli)</li>
                  <li>• PyPI — Python SDK (umarise-core-sdk)</li>
                  <li>• GitHub Marketplace — Action</li>
                </ul>
              </div>
              <div>
                <h3 className="text-landing-cream/90 font-medium mb-1">5. Eén simpele pagina: /proof <span className="text-green-400 text-xs ml-1">✓</span></h3>
                <p className="text-sm text-landing-muted/60">Laat alleen zien: artifact + artifact.proof + verify knop. Live op <code className="text-xs bg-landing-muted/10 px-1 rounded">/proof</code></p>
              </div>
            </div>
          </section>

          {/* Tactische taken */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Tactische taken</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-landing-muted/50 text-xs uppercase tracking-wide mb-3">Direct — ✅ Afgerond 5 maart</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><span className="text-green-400">✓</span> <span className="line-through text-landing-muted/40">npm/PyPI keywords optimaliseren</span> <span className="text-xs text-landing-muted/30">@umarise/anchor@1.1.0 · @umarise/cli@1.2.0 · umarise-core-sdk v1.0.5</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-400">✓</span> <span className="line-through text-landing-muted/40">SDK READMEs: install → anchor → verify in 30 seconden</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-400">✓</span> <span className="line-through text-landing-muted/40">GitHub Action README: CI/CD build artifact primitive</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-landing-muted/50 text-xs uppercase tracking-wide mb-3">Week 1-2</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><span className="text-green-400">✓</span> <span className="line-through text-landing-muted/40">anchoring-examples repo opzetten met README</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-400">✓</span> <span className="line-through text-landing-muted/40">/proof pagina live</span></li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Eerste GitHub release met .proof assets op anchoring-examples</li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> dev.to blogpost: "How to anchor build artifacts to Bitcoin in CI"</li>
                </ul>
              </div>
              <div>
                <h3 className="text-landing-muted/50 text-xs uppercase tracking-wide mb-3">Week 2-4</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> GitHub repo topics toevoegen</li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> GitHub Organization opzetten</li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Community seeding: Stack Overflow, r/devops, r/mlops</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Enterprise Readiness */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Enterprise Readiness — SOC Traject</h2>

            <div className="space-y-6">
              <div className="border border-landing-copper/20 rounded-lg p-6 bg-landing-copper/5">
                <h3 className="text-landing-copper text-sm uppercase tracking-wide mb-4">SOC 2 Readiness — Technische Controls</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-landing-cream font-medium mb-3">Security (CC6)</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> API key authenticatie</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Write-once database triggers</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> RLS policies</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Toegangscontroles documenteren</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> MFA voor productietoegang instellen</li>
                  </ul>

                  <p className="text-landing-cream font-medium mt-4 mb-3">Availability (A1)</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Health endpoint /v1-core-health</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Uptime monitoring instellen</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> SLA documenteren</li>
                  </ul>

                  <p className="text-landing-cream font-medium mt-4 mb-3">Processing Integrity (PI1)</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Write-once anchors (by design)</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Bitcoin anchor als extern bewijs</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Error handling en retry logic OTS worker</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Audit log van alle anchor requests</li>
                  </ul>

                  <p className="text-landing-cream font-medium mt-4 mb-3">Confidentiality & Privacy</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Geen klantdata opgeslagen (by design)</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Hash-only verwerking</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Geen PII verwerkt</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Data classification policy documenteren</li>
                    <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Privacy policy formaliseren</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-landing-copper text-sm uppercase tracking-wide mb-4">SOC Traject — Fasering</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-landing-copper font-mono text-xs mt-0.5">Nu</span>
                    <div>
                      <p className="text-landing-cream font-medium">SOC 2 readiness assessment</p>
                      <p className="text-landing-muted">Weten wat ontbreekt. Auditor selectie via Paul's netwerk.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-landing-copper font-mono text-xs mt-0.5">F1</span>
                    <div>
                      <p className="text-landing-cream font-medium">SOC 1 Type I (3-4 maanden)</p>
                      <p className="text-landing-muted">Eerste auditeerbaar bewijs. Smallere scope, sneller.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-landing-copper font-mono text-xs mt-0.5">F2</span>
                    <div>
                      <p className="text-landing-cream font-medium">SOC 2 Type I (6-9 maanden)</p>
                      <p className="text-landing-muted">Enterprise drempel gepasseerd.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-landing-copper font-mono text-xs mt-0.5">F3</span>
                    <div>
                      <p className="text-landing-cream font-medium">SOC 2 Type II (12-18 maanden)</p>
                      <p className="text-landing-muted">Volwassen enterprise leverancier. Bewijs over 6-12 maanden.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-landing-copper text-sm uppercase tracking-wide mb-4">Organisatorische Controls — Nog te doen</h3>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Incident response plan documenteren</li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Change management proces formeel vastleggen</li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Vulnerability management proces</li>
                  <li className="flex items-start gap-2"><span className="text-landing-muted/40">○</span> Monitoring en alerting aantoonbaar over tijd</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Paul's Acties */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Paul — Openstaande Acties</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-landing-muted/40">○</span>
                <div>
                  <p className="text-landing-cream font-medium">SOC 2 auditor introductie</p>
                  <p className="text-landing-muted">Warme intro via Philips netwerk naar gecertificeerde auditor.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-muted/40">○</span>
                <div>
                  <p className="text-landing-cream font-medium">Enterprise security review template</p>
                  <p className="text-landing-muted">CAIQ/SIG of Philips-format als voorbereiding op enterprise gesprekken.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-muted/40">○</span>
                <div>
                  <p className="text-landing-cream font-medium">Eerste enterprise referentie</p>
                  <p className="text-landing-muted">Early adopter uit netwerk als referentie voor SOC 2 audit en sales.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-landing-muted/40">○</span>
                <div>
                  <p className="text-landing-cream font-medium">Organisatie advies</p>
                  <p className="text-landing-muted">Welke functies (CISO, compliance officer) zijn nodig voor enterprise vertrouwen?</p>
                </div>
              </div>
            </div>
          </section>

          {/* Live Metrics Dashboard */}
          <section className="border-t border-landing-muted/10 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase">Live Metrics</h2>
              <div className="flex items-center gap-3">
                {lastUpdated && (
                  <span className="text-xs text-landing-muted/30">
                    {lastUpdated.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <button onClick={refresh} className="text-xs text-landing-copper hover:text-landing-cream transition-colors">
                  ↻ Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-landing-muted/5 border border-landing-muted/10 rounded-lg p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Total Origins" value={metrics.totalOrigins.toLocaleString()} />
                <MetricCard label="Vandaag" value={metrics.todayOrigins.toString()} accent />
                <MetricCard label="30 dagen" value={metrics.last30dOrigins.toLocaleString()} />
                <MetricCard label="Partners (7d)" value={metrics.activePartners7d.toString()} accent />
                <MetricCard label="Proofs Anchored" value={metrics.anchoredProofs.toLocaleString()} />
                <MetricCard label="Pending" value={metrics.pendingProofs.toString()} status={metrics.pendingProofs === 0 ? 'green' : 'amber'} />
                <MetricCard label="Anchor Rate" value={metrics.totalProofs > 0 ? `${Math.round((metrics.anchoredProofs / metrics.totalProofs) * 100)}%` : '—'} />
                <MetricCard label="Avg/dag (30d)" value={metrics.last30dOrigins > 0 ? Math.round(metrics.last30dOrigins / 30).toString() : '—'} />
              </div>
            ) : (
              <p className="text-landing-muted/40 text-sm">Kon metrics niet laden.</p>
            )}

            <div className="mt-6 text-xs text-landing-muted/30 space-y-1">
              <p>Overige bronnen: npm weekly downloads · PyPI downloads · Google Search Console · GitHub stars + forks</p>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}

function MetricCard({ label, value, accent, status }: { label: string; value: string; accent?: boolean; status?: 'green' | 'amber' }) {
  return (
    <div className={`rounded-lg p-4 border ${accent ? 'border-landing-copper/30 bg-landing-copper/5' : 'border-landing-muted/10 bg-landing-muted/5'}`}>
      <p className="text-xs text-landing-muted/50 mb-1">{label}</p>
      <p className={`text-xl font-mono font-medium ${
        status === 'green' ? 'text-green-400' : 
        status === 'amber' ? 'text-amber-400' : 
        accent ? 'text-landing-copper' : 'text-landing-cream'
      }`}>
        {value}
      </p>
    </div>
  );
}
