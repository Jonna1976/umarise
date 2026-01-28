/**
 * Briefing Export Page
 * 
 * Print-friendly page for exporting copywriter-briefing.md
 * User can use browser's "Print → Save as PDF" to generate PDF
 * 
 * Route: /briefing-export
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BriefingExport() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    const referrer = document.referrer;
    const isInternalReferrer = referrer && referrer.includes(window.location.host);
    
    if (isInternalReferrer) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-white text-black min-h-screen print:bg-white">
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
          .no-print { display: none !important; }
          h1, h2, h3 { page-break-after: avoid; }
          pre, table { page-break-inside: avoid; }
        }
        @page { margin: 2cm; }
      `}</style>

      {/* Instructions and buttons (hidden when printing) */}
      <div className="no-print fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-foreground font-medium text-sm">Save as PDF via print dialog</p>
              <p className="text-muted-foreground text-xs mt-1">
                In the print dialog, change <strong>"Destination"</strong> from your printer to <strong>"Save as PDF"</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={handleBack}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="no-print h-24" />

      {/* Briefing Document */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        <header className="mb-8 pb-6 border-b-2 border-black">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">Copywriter Briefing</p>
          <h1 className="text-3xl font-bold">Umarise Landing Page</h1>
          <p className="text-gray-600 mt-2">Januari 2026 • Pre-launch fase</p>
        </header>

        {/* Section 1: Project Overview */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">1. Wat is Umarise?</h2>
          <p className="text-gray-700 mb-4">
            Umarise is een <strong>infrastructuurlaag</strong> voor het vastleggen en verifiëren van oorsprongen. 
            Denk aan een notariële basis voor digitale content — het moment van creatie wordt cryptografisch 
            vastgelegd en blijft onveranderlijk verifieerbaar.
          </p>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="font-semibold">Kernfunctie:</p>
            <p className="text-gray-700">Bewijs van oorsprong op het moment van creatie.</p>
          </div>
          <p className="text-sm text-gray-600 italic">
            Niet: Een consumentenapp, een blockchain, een timestamp service, of een opslagdienst.
          </p>
        </section>

        {/* Section 2: Positioning */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">2. Positionering</h2>
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50 w-1/3">Model</td><td className="border border-gray-300 px-3 py-2">B2B2C — infrastructuur voor partners die dit inbouwen in hun producten</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">Laag</td><td className="border border-gray-300 px-3 py-2">Infrastructure layer, niet eindproduct</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">Analogie</td><td className="border border-gray-300 px-3 py-2">"Stripe voor authenticiteit" of "Twilio voor verificatie"</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">Fase</td><td className="border border-gray-300 px-3 py-2">Pre-launch pilot — strategische vaagheid gewenst</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 3: Target Audience */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">3. Doelgroep</h2>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Primair: Technische beslissers</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
            <li>CTOs, Lead Engineers, Technical Founders</li>
            <li>Zoeken naar: API-first, programmatic, infrastructure-grade</li>
            <li>Herkennen: design patterns, architectuurprincipes</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Secundair: Business beslissers</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-4">
            <li>Product Managers, Innovation Leads</li>
            <li>Zoeken naar: duidelijke waardepropositie, vertrouwenssignalen</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Tertiair: Potentiële partners</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Bedrijven die verificatie willen inbouwen</li>
            <li>IP-kantoren, creatieve platforms, juridische dienstverleners</li>
          </ul>
        </section>

        {/* Section 4: Core Message */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">4. Kernboodschap</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-semibold text-lg">Eén zin:</p>
            <p className="text-gray-800 italic">Umarise legt het moment van oorsprong vast — verifieerbaar, onveranderlijk, programmatisch.</p>
          </div>
          <p className="font-semibold mb-2">Drie kernwoorden:</p>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li><strong>Origin</strong> — het beginpunt, de bron</li>
            <li><strong>Verifiable</strong> — bewijs, niet bewering</li>
            <li><strong>Infrastructure</strong> — bouwsteen, niet eindproduct</li>
          </ol>
        </section>

        {/* Page Break */}
        <div className="page-break" />

        {/* Section 5: Tone of Voice */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">5. Tone of Voice</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-green-700">✓ Wel</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-red-700">✗ Niet</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2">Precies, technisch onderbouwd</td><td className="border border-gray-300 px-3 py-2">Vaag, marketing-fluff</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Zelfverzekerd, rustig</td><td className="border border-gray-300 px-3 py-2">Schreeuwerig, overselling</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Infrastructuur-taal</td><td className="border border-gray-300 px-3 py-2">Consumer-taal</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Minimalistisch</td><td className="border border-gray-300 px-3 py-2">Oververklaard</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2">Professioneel-warm</td><td className="border border-gray-300 px-3 py-2">Koud-corporate</td></tr>
            </tbody>
          </table>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm font-semibold">Referenties voor toon:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
              <li>Stripe's vroege messaging ("Payments infrastructure for the internet")</li>
              <li>Cloudflare's positionering</li>
              <li>Linear's minimalisme</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Constraints */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">6. Constraints & Restricties</h2>
          
          <h3 className="text-lg font-semibold mt-4 mb-2 text-red-700">⚠️ Strategische vaagheid (BELANGRIJK)</h3>
          <p className="text-sm text-gray-700 mb-3">We zijn pre-launch. De copy moet:</p>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li>✓ Interesse wekken zonder alles te onthullen</li>
            <li>✓ Technische geloofwaardigheid uitstralen</li>
            <li>✗ Geen specifieke technologie noemen (geen "blockchain", "IPFS", "SHA-256")</li>
            <li>✗ Geen specifieke sectoren noemen (nog geen "IP", "creatief", "juridisch")</li>
            <li>✗ Geen features opsommen</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">AI-beeldgeneratie compatibiliteit</h3>
          <p className="text-sm text-gray-700 mb-2">GoDaddy's website builder gebruikt AI voor beeldkeuze. Vermijd woorden die letterlijk worden geïnterpreteerd:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✗ "Infrastructure" → levert bouwvakkers, wegen op</li>
            <li>✗ "Foundation" → levert beton, funderingen op</li>
            <li>✓ "Origin", "beginning", "spark", "genesis" → abstract/kosmisch</li>
          </ul>
        </section>

        {/* Section 7: Current Direction */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">7. Huidige richting</h2>
          
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Primaire tekst (vastgesteld)</p>
            <p className="text-2xl font-bold">Umarise. Origins.</p>
          </div>

          <p className="font-semibold mb-2">Secundaire tekst (open voor invulling):</p>
          <p className="text-sm text-gray-700 mb-4">Maximaal 5-6 woorden. Moet aanvullen, niet herhalen.</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Verkende richtingen:</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Optie</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Analyse</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 px-3 py-2 font-mono text-xs">"Infrastructure for verifiable beginnings"</td><td className="border border-gray-300 px-3 py-2">Te letterlijk voor AI-beelden</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-mono text-xs">"Where origins take form"</td><td className="border border-gray-300 px-3 py-2">Abstract, maar mist technisch signaal</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-mono text-xs">"Origins, Verifiably recorded"</td><td className="border border-gray-300 px-3 py-2">Beschrijvend, mogelijk te letterlijk</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-mono text-xs">"Proof of origin. Programmatically."</td><td className="border border-gray-300 px-3 py-2">Sterk CTO-signaal, "programmatically" = API</td></tr>
              <tr><td className="border border-gray-300 px-3 py-2 font-mono text-xs">"Origin integrity. By design."</td><td className="border border-gray-300 px-3 py-2">Architectuurprincipe, professioneel</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 8: Deliverables */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">8. Gewenste output</h2>
          
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="font-semibold mb-2">Landing page structuur:</p>
            <pre className="text-sm font-mono bg-white p-3 rounded border">{`[HEADLINE]
Umarise. Origins.

[SUBLINE]
[Te schrijven: 4-6 woorden]

[CTA]
[Te schrijven: bijv. "Early access" / "Partner inquiry"]

[FOOTER]
[Te schrijven: contact uitnodiging]`}</pre>
          </div>

          <h3 className="text-lg font-semibold mt-4 mb-2">Deliverables:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li><strong>3 opties voor subline</strong> (4-6 woorden elk)</li>
            <li><strong>2 opties voor CTA tekst</strong></li>
            <li><strong>1 optie voor footer/contact tekst</strong></li>
            <li><strong>Korte rationale per optie</strong> (1-2 zinnen)</li>
          </ol>
        </section>

        {/* Section 9: What We Don't Want */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">9. Wat we NIET willen</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Geen buzzwords: "revolutionary", "game-changing", "next-gen"</li>
            <li>Geen blockchain-associaties: "decentralized", "Web3", "crypto"</li>
            <li>Geen consumentenfocus: "app", "download", "sign up free"</li>
            <li>Geen feature-lijstjes</li>
            <li>Geen vergelijkingen met concurrenten</li>
            <li>Geen beloftes die we niet kunnen waarmaken</li>
          </ul>
        </section>

        {/* Section 10: Background (for understanding, not for copy) */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">10. Achtergrondmateriaal</h2>
          <p className="text-sm text-gray-600 italic mb-3">Voor dieper begrip (niet voor publieke copy):</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li><strong>Technisch:</strong> Cryptografische hashing bij capture, immutable storage, API-first verificatie</li>
            <li><strong>Use case hint:</strong> Creatieve oorsprongen, IP-documentatie, notariële toepassingen</li>
            <li><strong>Architectuur:</strong> Privacy-by-design, EU-gehost, geen reconstructie mogelijk via metadata</li>
          </ul>
        </section>

        <footer className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Briefing versie 1.0 • Umarise • Januari 2026</p>
        </footer>
      </article>
    </div>
  );
}
