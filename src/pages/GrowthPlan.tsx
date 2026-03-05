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

          {/* Distributiekanalen */}
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

          {/* Metrics */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-4">Metrics</h2>
            <ul className="space-y-2">
              <li>• npm weekly downloads</li>
              <li>• PyPI downloads</li>
              <li>• Google Search Console: impressions, clicks, indexed pages</li>
              <li>• GitHub stars + forks</li>
              <li>• Anchors per day (Core API)</li>
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
