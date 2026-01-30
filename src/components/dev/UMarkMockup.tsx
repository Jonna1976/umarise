import { motion } from 'framer-motion';
import { Check, Shield, FileText, Hash, Anchor } from 'lucide-react';

/**
 * Origin Mark Visual Mockup
 * Explores symbol candidates for technical verification indicator
 * NOT a logo or branding element - a verification indicator
 */

// Symbol candidates for origin indicator
const SYMBOL_CANDIDATES = [
  { 
    symbol: '⊙', 
    name: 'Circumpunct', 
    description: 'Universeel symbool voor oorsprong/bron. Punt = origin, cirkel = context.',
    unicode: 'U+2299'
  },
  { 
    symbol: '⦿', 
    name: 'Circle with dot', 
    description: 'Compactere variant. Duidelijk "center point" gevoel.',
    unicode: 'U+29BF'
  },
  { 
    symbol: '◉', 
    name: 'Fisheye', 
    description: 'Gevulde kern met open ring. Balans tussen zichtbaarheid en subtiliteit.',
    unicode: 'U+25C9'
  },
  { 
    symbol: '⚓', 
    name: 'Anchor', 
    description: 'Verankerd, vastgelegd, immutable. Sterke metafoor voor "fixed point".',
    unicode: 'U+2693'
  },
  { 
    symbol: '◎', 
    name: 'Bullseye', 
    description: 'Target/doel. "Dit is het startpunt waar alles naar verwijst."',
    unicode: 'U+25CE'
  },
];

export default function UMarkMockup() {
  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="font-serif text-3xl text-stone-800">Origin Mark: Symbol Exploration</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Een <strong>technische verificatie-indicator</strong> — geen letter (zoals ©™®), 
            maar een symbool dat "origin vastgelegd" communiceert.
          </p>
        </header>

        {/* Why not letters */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="font-serif text-xl text-stone-800 mb-6">Waarom geen letter?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Legal claims */}
            <div className="space-y-4">
              <h3 className="font-medium text-stone-700">Juridische Claims (letters)</h3>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-stone-300 rounded-full flex items-center justify-center text-stone-500 text-xl">©</div>
                  <span className="text-xs text-stone-500 mt-1 block">Copyright</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-stone-300 rounded-full flex items-center justify-center text-stone-500 text-xl">™</div>
                  <span className="text-xs text-stone-500 mt-1 block">Trademark</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-stone-300 rounded-full flex items-center justify-center text-stone-500 text-xl">®</div>
                  <span className="text-xs text-stone-500 mt-1 block">Registered</span>
                </div>
              </div>
              <p className="text-sm text-stone-500">
                Beweren iets, maar bewijzen het niet zelf. "Ik claim..."
              </p>
            </div>

            {/* Technical indicators */}
            <div className="space-y-4">
              <h3 className="font-medium text-stone-700">Technische Indicatoren (symbolen)</h3>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs text-stone-500 mt-1 block">SSL</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-stone-500 mt-1 block">Verified</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-2xl">
                    ⊙
                  </div>
                  <span className="text-xs text-stone-500 mt-1 block">Origin?</span>
                </div>
              </div>
              <p className="text-sm text-stone-500">
                Tonen verifieerbare staat. "Dit ís..."
              </p>
            </div>
          </div>
        </section>

        {/* Symbol Candidates */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl text-stone-800">Symbool Kandidaten</h2>
          
          <div className="grid md:grid-cols-5 gap-4">
            {SYMBOL_CANDIDATES.map((candidate, index) => (
              <motion.div
                key={candidate.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm text-center"
              >
                <div className="text-5xl mb-3 text-stone-800">{candidate.symbol}</div>
                <h3 className="font-medium text-stone-700 text-sm">{candidate.name}</h3>
                <p className="text-xs text-stone-400 font-mono mt-1">{candidate.unicode}</p>
                <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                  {candidate.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Visual Applications */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl text-stone-800">Visuele Toepassingen</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Application 1: Document Stamp - Circumpunct */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Document Stempel — ⊙ Circumpunct</h3>
              
              <div className="bg-stone-50 rounded-lg p-4 relative">
                <div className="space-y-2 mb-8">
                  <div className="h-2 bg-stone-200 rounded w-3/4" />
                  <div className="h-2 bg-stone-200 rounded w-full" />
                  <div className="h-2 bg-stone-200 rounded w-5/6" />
                  <div className="h-2 bg-stone-200 rounded w-2/3" />
                </div>
                
                <div className="absolute bottom-3 right-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-600/40 flex items-center justify-center bg-amber-50/80">
                      <span className="text-3xl text-amber-700">⊙</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-100 px-1.5 py-0.5 rounded text-[8px] text-amber-700 font-mono whitespace-nowrap">
                      ORIGIN
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Circumpunct als origin seal — universeel herkenbaar
              </p>
            </motion.div>

            {/* Application 2: UI Badge - Circle with dot */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">UI Badge — ⦿ Circle with dot</h3>
              
              <div className="space-y-3">
                <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">contract_v2.pdf</p>
                    <p className="text-xs text-stone-500">14:32</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-800 text-stone-200 px-2 py-1 rounded text-sm">
                    <span>⦿</span>
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                
                <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3 opacity-50">
                  <FileText className="w-7 h-7 text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">notes.docx</p>
                    <p className="text-xs text-stone-500">Geen origin</p>
                  </div>
                  <div className="bg-stone-200 text-stone-500 px-2 py-1 rounded text-sm">
                    —
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Compact, leesbaar op kleine schaal
              </p>
            </motion.div>

            {/* Application 3: Anchor variant */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Inline — ⚓ Anchor</h3>
              
              <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-amber-700 mt-0.5">⚓</span>
                  <div>
                    <p className="text-sm text-stone-700">
                      Origin vastgelegd <span className="font-mono text-xs text-stone-500">2026-01-30</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-stone-500 pl-5">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">a3f2...8b4c</span>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Sterke metafoor: verankerd, immutable
              </p>
            </motion.div>

            {/* Application 4: Formal seal - Fisheye */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Formeel Seal — ◉ Fisheye</h3>
              
              <div className="flex justify-center py-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-stone-800 flex items-center justify-center relative">
                    <span className="text-4xl text-stone-800">◉</span>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path
                          id="curve2"
                          d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                          fill="none"
                        />
                        <text className="text-[7px] fill-stone-600 uppercase tracking-[0.2em]">
                          <textPath href="#curve2" startOffset="5%">
                            ORIGIN VERIFIED •
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4 text-center">
                Formele exports en certificaten
              </p>
            </motion.div>

            {/* Application 5: Minimal inline comparison */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Minimale Varianten</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 text-sm">document.pdf</span>
                  <div className="flex gap-3 text-lg">
                    <span className="text-amber-700" title="Circumpunct">⊙</span>
                    <span className="text-amber-700" title="Circle with dot">⦿</span>
                    <span className="text-amber-700" title="Fisheye">◉</span>
                    <span className="text-amber-700" title="Anchor">⚓</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 text-sm">image.png</span>
                  <div className="flex gap-3 text-lg">
                    <span className="text-amber-700">⊙</span>
                    <span className="text-amber-700">⦿</span>
                    <span className="text-amber-700">◉</span>
                    <span className="text-amber-700">⚓</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between opacity-40">
                  <span className="text-stone-700 text-sm">draft.txt</span>
                  <span className="text-stone-400 text-sm">—</span>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Vergelijk: welke is het meest leesbaar?
              </p>
            </motion.div>

            {/* Application 6: Icon version with Lucide Anchor */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">SVG Icon Variant — Anchor</h3>
              
              <div className="space-y-3">
                <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">contract.pdf</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded">
                    <Anchor className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">invoice.pdf</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-800 text-amber-400 px-2 py-1 rounded">
                    <Anchor className="w-4 h-4" />
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Lucide icon: schaalt perfect, past in design systems
              </p>
            </motion.div>
          </div>
        </section>

        {/* Recommendation */}
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-8">
          <h2 className="font-serif text-xl text-amber-900 mb-4">Aanbeveling</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-amber-800 mb-3">Primair: ⊙ Circumpunct</h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li>✓ Universeel symbool voor "oorsprong"</li>
                <li>✓ Geen trademark-associatie</li>
                <li>✓ Simpel, technisch, tijdloos</li>
                <li>✓ Werkt op alle schalen</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-amber-800 mb-3">Alternatief: ⚓ Anchor</h3>
              <ul className="text-sm text-amber-700 space-y-2">
                <li>✓ Sterke "verankerd" metafoor</li>
                <li>✓ Beschikbaar als SVG icon (Lucide)</li>
                <li>✓ Herkenbaarder voor algemeen publiek</li>
                <li>○ Iets minder abstract/technisch</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section className="bg-stone-800 text-stone-200 rounded-xl p-8">
          <h2 className="font-serif text-xl mb-6">Design Principles</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-amber-400 mb-2">Technisch, niet juridisch</h3>
              <p className="text-stone-400">
                Symbool communiceert verifieerbare staat, geen claim of eigendom.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-amber-400 mb-2">Context-onafhankelijk</h3>
              <p className="text-stone-400">
                Werkt in elke UI, elk platform — zonder aanpassing nodig.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-amber-400 mb-2">Binair statement</h3>
              <p className="text-stone-400">
                Origin is vastgelegd of niet. Geen gradaties, geen interpretatie.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
