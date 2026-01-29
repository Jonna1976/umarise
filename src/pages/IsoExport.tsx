import { Button } from "@/components/ui/button";
import { Printer, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const IsoExport = () => {
  const navigate = useNavigate();
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 print:bg-white">
      {/* Print instruction bar - hidden when printing */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b border-border p-3 flex items-center justify-between z-50 print:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-sm text-stone-600">
          Use <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-xs font-mono">Cmd/Ctrl + P</kbd> to save as PDF
        </div>
        <Button 
          onClick={handlePrint} 
          size="sm" 
          className="bg-stone-800 hover:bg-stone-900 text-stone-50 inline-flex items-center gap-2 shadow-sm"
        >
          <Printer className="h-4 w-4" />
          <Download className="h-3 w-3" />
          Print / Save PDF
        </Button>
      </div>

      {/* Main content - optimized for print */}
      <div className="max-w-4xl mx-auto px-8 py-20 print:py-8 print:px-12 print:max-w-none">
        
        {/* Header */}
        <header className="mb-12 print:mb-8">
          <h1 className="text-3xl font-serif text-stone-900 mb-2">
            ISO/IEC 27701 Spiegel — Umarise
          </h1>
          <p className="text-stone-500 text-sm">
            January 2026
          </p>
        </header>

        {/* Context Section */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-200 pb-2">
            Context
          </h2>
          
          <div className="space-y-4 text-stone-700 leading-relaxed">
            <div>
              <h3 className="font-medium text-stone-800 mb-1">Scope</h3>
              <p>Umarise Origin Record Layer (infrastructure-first, B2B2C)</p>
            </div>
            
            <div>
              <h3 className="font-medium text-stone-800 mb-1">Rol van Umarise</h3>
              <p>
                Umarise fungeert als een system-of-record voor oorsprong en als PIMS processor 
                binnen een bredere stack. Het systeem registreert en verifieert oorsprong, maar 
                voert geen governance, policy-handhaving of compliance-beslissingen uit.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-stone-800 mb-1">Architectuur</h3>
              <p className="mb-2">Umarise hanteert een strikt gescheiden architectuur:</p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                <li><strong>Control plane:</strong> Supabase / Lovable Cloud</li>
                <li><strong>Data plane:</strong> Hetzner (EU)</li>
              </ul>
              <p className="mt-2 text-sm text-stone-600 italic">
                Deze scheiding is fundamenteel voor privacy-by-design en accountability.
              </p>
            </div>
          </div>
        </section>

        {/* Section 1: Status Overview */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-200 pb-2">
            1. ISO/IEC 27701 — Hoofdlijnen (Statusoverzicht)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-300">
                  <th className="text-left py-3 pr-4 font-medium text-stone-800">ISO/IEC 27701 Domein</th>
                  <th className="text-left py-3 pr-4 font-medium text-stone-800">Status</th>
                  <th className="text-left py-3 font-medium text-stone-800">Toelichting</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Privacy by Design</td>
                  <td className="py-3 pr-4 text-green-700">✅ Volledig</td>
                  <td className="py-3 text-stone-600">Afgedwongen via architectuur, niet beleid</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Data Minimization</td>
                  <td className="py-3 pr-4 text-green-700">✅ Volledig</td>
                  <td className="py-3 text-stone-600">Control plane bevat geen origin payloads</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Purpose Limitation</td>
                  <td className="py-3 pr-4 text-green-700">✅ Volledig</td>
                  <td className="py-3 text-stone-600">Vastleggen ≠ interpreteren ≠ verwerken</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Security of Processing</td>
                  <td className="py-3 pr-4 text-amber-700">⚠️ Grotendeels</td>
                  <td className="py-3 text-stone-600">Sterk, E2E encryptie gepland (Phase 2B)</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Transparency</td>
                  <td className="py-3 pr-4 text-green-700">✅ Volledig</td>
                  <td className="py-3 text-stone-600">Origin View + Proof Bundle</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Accountability</td>
                  <td className="py-3 pr-4 text-green-700">✅ Volledig</td>
                  <td className="py-3 text-stone-600">Verifieerbare origin records</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Third-party Risk</td>
                  <td className="py-3 pr-4 text-green-700">✅ Volledig</td>
                  <td className="py-3 text-stone-600">Duidelijke provider-scheiding</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">Cryptographic Controls</td>
                  <td className="py-3 pr-4 text-amber-700">⚠️ Grotendeels</td>
                  <td className="py-3 text-stone-600">Hash-based, geen TSA (bewuste keuze)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Detailed Mapping */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-200 pb-2">
            2. Gedetailleerde ISO-Mapping (Kernartikelen)
          </h2>
          
          {/* §5.2 Privacy by Design */}
          <div className="mb-8 print:mb-5">
            <h3 className="font-medium text-stone-800 mb-2">
              ISO/IEC 27701 §5.2 — Privacy by Design & Default
            </h3>
            <p className="text-sm text-green-700 mb-3">Status: ✅ VOLLEDIG</p>
            
            <div className="bg-stone-100 p-4 rounded mb-3 print:bg-stone-50 print:border print:border-stone-200">
              <p className="text-sm text-stone-600 italic">
                <strong>ISO-eis:</strong> Privacy moet technisch ingebouwd zijn en niet afhankelijk zijn van organisatorisch beleid alleen.
              </p>
            </div>
            
            <p className="text-sm font-medium text-stone-700 mb-2">Umarise-implementatie:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-stone-600">
              <li>Geen update-pad voor origin records (create-only)</li>
              <li>Control plane kan geen waarheid muteren</li>
              <li>Data plane (Hetzner) is de enige bron van waarheid</li>
              <li>Control-plane compromise leidt niet tot datalek van origin content</li>
            </ul>
            
            <p className="text-xs text-stone-500 mt-3">
              📌 Bewijs: Architectuurdiagrammen Phase 1 & Phase 2 + Privacy-by-Design Assessment
            </p>
            <p className="text-xs font-medium text-stone-700 mt-1">➡️ Audit-proof by construction</p>
          </div>

          {/* §5.3 Data Minimization */}
          <div className="mb-8 print:mb-5">
            <h3 className="font-medium text-stone-800 mb-2">
              ISO/IEC 27701 §5.3 — Data Minimization
            </h3>
            <p className="text-sm text-green-700 mb-3">Status: ✅ VOLLEDIG</p>
            
            <div className="bg-stone-100 p-4 rounded mb-3 print:bg-stone-50 print:border print:border-stone-200">
              <p className="text-sm text-stone-600 italic">
                <strong>ISO-eis:</strong> Alleen strikt noodzakelijke persoonsgegevens mogen worden verwerkt.
              </p>
            </div>
            
            <p className="text-sm font-medium text-stone-700 mb-2">Umarise-implementatie:</p>
            <p className="text-sm text-stone-600 mb-2">Control plane (Supabase) bevat uitsluitend:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-stone-600">
              <li>hashes</li>
              <li>routing hints</li>
              <li>indices</li>
            </ul>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-sm text-stone-600">
              <li>Geen origin content, scans, OCR-output of payloads</li>
              <li>Geen cryptografische sleutels buiten de Vault</li>
            </ul>
            
            <p className="text-xs text-stone-500 mt-3">
              📌 Opmerking: Dit niveau van dataminimalisatie is strenger dan bij veel ISO-gecertificeerde SaaS-oplossingen.
            </p>
          </div>

          {/* §6.7 Security of Processing */}
          <div className="mb-8 print:mb-5">
            <h3 className="font-medium text-stone-800 mb-2">
              ISO/IEC 27701 §6.7 — Security of Processing
            </h3>
            <p className="text-sm text-amber-700 mb-3">Status: ⚠️ STERK, MAAR UITBREIDBAAR</p>
            
            <p className="text-sm font-medium text-stone-700 mb-2">Wat reeds geïmplementeerd is:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-stone-600">
              <li>SHA-256 integriteitsverificatie</li>
              <li>Immutable opslag</li>
              <li>EU-only data plane (Hetzner)</li>
              <li>Zero-trust houding t.o.v. control plane</li>
            </ul>
            
            <p className="text-sm font-medium text-stone-700 mt-3 mb-2">Bewust als roadmap geclassificeerd:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-stone-600">
              <li>End-to-end encryptie van origin payloads</li>
              <li>Client-side key ownership</li>
            </ul>
            
            <p className="text-xs text-stone-500 mt-3">
              📌 Deze elementen zijn correct gepositioneerd als Phase 2B roadmap, niet als bestaande claim.
            </p>
            <p className="text-xs font-medium text-stone-700 mt-1">➡️ Geen non-conformity risico</p>
          </div>

          {/* §6.8 Cryptographic Controls */}
          <div className="mb-8 print:mb-5">
            <h3 className="font-medium text-stone-800 mb-2">
              ISO/IEC 27701 §6.8 — Cryptographic Controls
            </h3>
            <p className="text-sm text-amber-700 mb-3">Status: ⚠️ PARTIEEL (BEWUST)</p>
            
            <div className="bg-stone-100 p-4 rounded mb-3 print:bg-stone-50 print:border print:border-stone-200">
              <p className="text-sm text-stone-600 italic">
                <strong>ISO-eis:</strong> Cryptografie toepassen waar passend om integriteit en vertrouwelijkheid te waarborgen.
              </p>
            </div>
            
            <p className="text-sm font-medium text-stone-700 mb-2">Umarise-keuzes:</p>
            <ul className="list-none ml-2 space-y-1 text-sm text-stone-600">
              <li>✔ Hash-based integriteit (core invariant)</li>
              <li>❌ Geen Time Stamp Authority (TSA)</li>
              <li>❌ Geen blockchain anchoring</li>
            </ul>
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded mt-3 print:bg-stone-50 print:border-stone-300">
              <p className="text-xs text-stone-600">
                <strong>📌 Belangrijk:</strong> Umarise bewijst integriteit zonder externe trust-afhankelijkheden. 
                TSA is optioneel en gepland als future anchoring (Phase 3). 
                ISO/IEC 27701 staat dit toe zolang het correct is gedocumenteerd.
              </p>
            </div>
          </div>

          {/* §7.2 Transparency */}
          <div className="mb-8 print:mb-5">
            <h3 className="font-medium text-stone-800 mb-2">
              ISO/IEC 27701 §7.2 — Transparency & User Rights
            </h3>
            <p className="text-sm text-green-700 mb-3">Status: ✅ VOLLEDIG</p>
            
            <p className="text-sm font-medium text-stone-700 mb-2">Umarise-implementatie:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-stone-600">
              <li>Origin View biedt directe transparantie</li>
              <li>Proof Bundle is exporteerbaar en onafhankelijk verifieerbaar</li>
              <li>Geen "trust us"-claims of black-box verificatie</li>
            </ul>
            
            <p className="text-xs font-medium text-stone-700 mt-3">➡️ Zeldzaam op infrastructuurniveau</p>
          </div>

          {/* §7.4 Accountability */}
          <div className="mb-8 print:mb-5">
            <h3 className="font-medium text-stone-800 mb-2">
              ISO/IEC 27701 §7.4 — Accountability
            </h3>
            <p className="text-sm text-green-700 mb-3">Status: ✅ VOLLEDIG</p>
            
            <div className="bg-stone-100 p-4 rounded mb-3 print:bg-stone-50 print:border print:border-stone-200">
              <p className="text-sm text-stone-600 italic">
                <strong>ISO-eis:</strong> Organisaties moeten aantoonbaar kunnen maken wat er is gebeurd.
              </p>
            </div>
            
            <p className="text-sm font-medium text-stone-700 mb-2">Umarise-implementatie:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-stone-600">
              <li>Verifieerbare oorsprong</li>
              <li>Detecteerbare afwezigheid van oorsprong (negative dependency)</li>
              <li>Geen mogelijkheid tot stille herschrijving</li>
            </ul>
            
            <p className="text-xs font-medium text-stone-700 mt-3">➡️ Exact conform de intentie van de norm</p>
          </div>
        </section>

        {/* Section 3: Conclusion */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-200 pb-2">
            3. ISO-Conclusie (Audit-taal)
          </h2>
          
          <div className="bg-stone-100 p-5 rounded print:bg-stone-50 print:border print:border-stone-200">
            <p className="text-stone-700 leading-relaxed">
              Umarise voldoet aantoonbaar aan de kernprincipes van ISO/IEC 27701 met betrekking tot 
              privacy-by-design, dataminimalisatie en accountability.
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Resterende cryptografische uitbreidingen zijn expliciet en correct geclassificeerd als 
              roadmap-items en vormen geen non-conformity.
            </p>
          </div>
        </section>

        {/* Section 4: Strategic Significance */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-200 pb-2">
            4. Strategische Betekenis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 print:gap-4">
            <div className="bg-stone-50 p-4 rounded border border-stone-200">
              <h3 className="font-medium text-stone-800 mb-2">Phase 2A — Positionering & Validatie (nu)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-stone-600">
                <li>Geschikt voor pilots bij ISO-gevoelige partners</li>
                <li>Geen compliance-blokkades</li>
                <li>Positioneerbaar als ISO-aligned infrastructure</li>
              </ul>
            </div>
            
            <div className="bg-stone-50 p-4 rounded border border-stone-200">
              <h3 className="font-medium text-stone-800 mb-2">Phase 2B — Security Verdieping (later)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-stone-600">
                <li>End-to-end encryptie → ISO best practice</li>
                <li>Optionele TSA → audit comfort, geen vereiste</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: One-liner */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-xl font-serif text-stone-800 mb-4 border-b border-stone-200 pb-2">
            5. Eén zin voor CTO / Auditor
          </h2>
          
          <blockquote className="border-l-4 border-stone-400 pl-4 py-2 bg-stone-50 print:bg-white">
            <p className="text-lg font-serif text-stone-800 italic">
              "Umarise enforces ISO/IEC 27701 principles by architecture — not by policy."
            </p>
          </blockquote>
        </section>

        {/* Appendix */}
        <section className="mb-10 print:mb-6 print:break-before-page">
          <h2 className="text-xl font-serif text-stone-800 mb-2 border-b border-stone-200 pb-2">
            Appendix — ISO Alignment
          </h2>
          <p className="text-sm text-stone-500 italic mb-4">
            (Informative, Not Certifying)
          </p>
          <p className="text-sm text-stone-600 mb-4">
            This appendix maps Umarise's architectural invariants to relevant ISO/IEC controls.
            It demonstrates alignment by design, not certification.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-300">
                  <th className="text-left py-2 pr-3 font-medium text-stone-800">Umarise invariant</th>
                  <th className="text-left py-2 pr-3 font-medium text-stone-800">ISO/IEC control</th>
                  <th className="text-left py-2 font-medium text-stone-800">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Create-only origin records</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.8.12</td>
                  <td className="py-2 text-stone-600">Onveranderbaarheid voorkomt ongeautoriseerde wijziging</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Content-addressed storage (hash/CID)</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.8.13</td>
                  <td className="py-2 text-stone-600">Integriteit verifieerbaar zonder vertrouwen</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Control/data plane separation</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.5.15</td>
                  <td className="py-2 text-stone-600">Segregation of duties</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">No payloads in control plane</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27701 §6.7.2</td>
                  <td className="py-2 text-stone-600">Dataminimalisatie</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Explicit absence detection</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.8.16</td>
                  <td className="py-2 text-stone-600">Monitoring & detecteerbaarheid</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Independent verification</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.5.23</td>
                  <td className="py-2 text-stone-600">Cloud-agnostische zekerheid</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">EU-only data plane</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27701 §6.13</td>
                  <td className="py-2 text-stone-600">Datalokalisatie</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Auditability without inspection</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.8.15</td>
                  <td className="py-2 text-stone-600">Bewijs zonder inhoudsinzage</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-2 pr-3">Control-plane compromise ≠ truth compromise</td>
                  <td className="py-2 pr-3 font-mono text-stone-600">ISO 27001 A.5.30</td>
                  <td className="py-2 text-stone-600">Continuïteit & resilience</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Clarifying Note */}
        <section className="mb-10 print:mb-6">
          <h2 className="text-lg font-serif text-stone-800 mb-3 border-b border-stone-200 pb-2">
            Clarifying Note
          </h2>
          
          <div className="bg-stone-50 p-4 rounded border border-stone-200">
            <p className="text-sm text-stone-600 leading-relaxed">
              Umarise does not implement governance, compliance enforcement, or access policy.
              It provides the precondition: <strong>verifiable origin</strong>.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed mt-2">
              Governance systems operate above this layer.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-stone-200 print:mt-8 print:pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-stone-500">
            <div>
              <p className="font-medium text-stone-700">Umarise</p>
              <p>Origin Record Layer</p>
            </div>
            <div className="text-right">
              <p>ISO/IEC 27701 Alignment Assessment</p>
              <p className="text-xs">Generated: January 2026</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default IsoExport;
