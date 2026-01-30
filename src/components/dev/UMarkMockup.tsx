import { motion } from 'framer-motion';
import { Check, Shield, Clock, FileText, Hash } from 'lucide-react';

/**
 * U-Mark Visual Mockup
 * Demonstrates the U-mark as a technical infrastructure signal
 * NOT a logo or branding element - a verification indicator
 */
export default function UMarkMockup() {
  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="font-serif text-3xl text-stone-800">U-Mark: Infrastructure Signal</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            De U-mark is een <strong>technische verificatie-indicator</strong>, geen logo. 
            Vergelijkbaar met een SSL-slotje of notarisstempel.
          </p>
        </header>

        {/* Comparison: Pinterest vs Umarise */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="font-serif text-xl text-stone-800 mb-6">Positionering: Brand vs Infrastructure</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pinterest example */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  P
                </div>
                <span className="text-stone-600">Pinterest "P"</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-lg text-sm text-stone-600">
                <p className="font-medium text-stone-800 mb-2">Brand Identity</p>
                <ul className="space-y-1">
                  <li>• "Dit is van Pinterest"</li>
                  <li>• Marketing & herkenning</li>
                  <li>• Platform-gebonden</li>
                </ul>
              </div>
            </div>

            {/* Umarise example */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-800 rounded flex items-center justify-center">
                  <span className="font-serif text-stone-200 text-xl">U</span>
                </div>
                <span className="text-stone-600">Umarise "U"</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-stone-600">
                <p className="font-medium text-amber-800 mb-2">Infrastructure Signal</p>
                <ul className="space-y-1">
                  <li>• "Dit origin is verifieerbaar"</li>
                  <li>• Technische garantie</li>
                  <li>• Platform-onafhankelijk</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Examples */}
        <section className="space-y-6">
          <h2 className="font-serif text-xl text-stone-800">Visuele Toepassingen</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Example 1: Document Stamp */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Op een Document</h3>
              
              {/* Mini document */}
              <div className="bg-stone-50 rounded-lg p-4 relative">
                <div className="space-y-2 mb-8">
                  <div className="h-2 bg-stone-200 rounded w-3/4" />
                  <div className="h-2 bg-stone-200 rounded w-full" />
                  <div className="h-2 bg-stone-200 rounded w-5/6" />
                  <div className="h-2 bg-stone-200 rounded w-2/3" />
                </div>
                
                {/* U-mark stamp */}
                <div className="absolute bottom-3 right-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-600/30 flex items-center justify-center bg-amber-50/50">
                      <div className="w-10 h-10 rounded-full border border-amber-600/50 flex items-center justify-center">
                        <span className="font-serif text-amber-700 text-lg font-medium">U</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-100 px-1.5 py-0.5 rounded text-[8px] text-amber-700 font-mono whitespace-nowrap">
                      ORIGIN VERIFIED
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Als notarisstempel — certificeert oorsprong, niet inhoud
              </p>
            </motion.div>

            {/* Example 2: UI Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">In een UI (Badge)</h3>
              
              <div className="space-y-4">
                {/* File item with U-mark */}
                <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">contract_v2.pdf</p>
                    <p className="text-xs text-stone-500">Geüpload 14:32</p>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-800 text-stone-200 px-2 py-1 rounded text-xs font-medium">
                    <span className="font-serif">U</span>
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                
                {/* Another file without U-mark */}
                <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3 opacity-60">
                  <FileText className="w-8 h-8 text-stone-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">notes_draft.docx</p>
                    <p className="text-xs text-stone-500">Geen origin</p>
                  </div>
                  <div className="flex items-center gap-1 bg-stone-200 text-stone-500 px-2 py-1 rounded text-xs">
                    —
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Instant visuele indicatie: origin vastgelegd of niet
              </p>
            </motion.div>

            {/* Example 3: Inline indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Inline Indicator</h3>
              
              <div className="bg-stone-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-serif text-xs bg-stone-800 text-stone-200 px-1.5 py-0.5 rounded font-medium mt-0.5">U</span>
                  <div>
                    <p className="text-sm text-stone-700">
                      Origin vastgelegd op <span className="font-mono text-xs">2026-01-30 16:02</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">a3f2...8b4c</span>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Discrete marker met metadata on-demand
              </p>
            </motion.div>

            {/* Example 4: Verification seal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Verificatie Seal</h3>
              
              <div className="flex justify-center py-4">
                <div className="relative">
                  {/* Outer ring */}
                  <div className="w-24 h-24 rounded-full border-4 border-stone-800 flex items-center justify-center relative">
                    {/* Inner content */}
                    <div className="text-center">
                      <span className="font-serif text-3xl text-stone-800">U</span>
                    </div>
                    
                    {/* Circular text simulation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path
                          id="curve"
                          d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                          fill="none"
                        />
                        <text className="text-[7px] fill-stone-600 uppercase tracking-[0.15em]">
                          <textPath href="#curve" startOffset="0%">
                            ORIGIN VERIFIED • UMARISE •
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Checkmark */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4 text-center">
                Formele verificatie-status voor exports
              </p>
            </motion.div>

            {/* Example 5: Minimal inline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Minimale Variant</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-stone-700">document.pdf</span>
                  <span className="font-serif text-sm text-amber-700 font-semibold">ᵁ</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-stone-700">image.png</span>
                  <span className="font-serif text-sm text-amber-700 font-semibold">ᵁ</span>
                </div>
                
                <div className="flex items-center gap-2 opacity-50">
                  <span className="text-stone-700">draft.txt</span>
                  <span className="text-xs text-stone-400">—</span>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Superscript ᵁ als discrete status-indicator
              </p>
            </motion.div>

            {/* Example 6: Trust hierarchy */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-sm font-medium text-stone-500 mb-4">Vergelijking: Trust Signals</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">SSL Slotje</p>
                    <p className="text-xs text-stone-500">Connectie is versleuteld</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Verified Badge</p>
                    <p className="text-xs text-stone-500">Account is geverifieerd</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center">
                    <span className="font-serif text-amber-700 font-semibold">U</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">U-Mark</p>
                    <p className="text-xs text-stone-500">Origin is vastgelegd</p>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 mt-4">
                Zelfde categorie: technische garantie, geen branding
              </p>
            </motion.div>
          </div>
        </section>

        {/* Design Principles */}
        <section className="bg-stone-800 text-stone-200 rounded-xl p-8">
          <h2 className="font-serif text-xl mb-6">Design Principles</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-amber-400 mb-2">Technisch, niet decoratief</h3>
              <p className="text-stone-400">
                De U-mark communiceert status, niet stijl. Functioneel als een checksum-indicator.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-amber-400 mb-2">Context-onafhankelijk</h3>
              <p className="text-stone-400">
                Werkt in elke UI, elk platform, elke applicatie — zonder aanpassing.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-amber-400 mb-2">Binair statement</h3>
              <p className="text-stone-400">
                Origin is vastgelegd (U) of niet (—). Geen gradaties, geen interpretatie.
              </p>
            </div>
          </div>
        </section>

        {/* Font note */}
        <section className="text-center text-sm text-stone-500">
          <p>
            Font: <strong>Playfair Display</strong> (serif) — 
            klassiek, tijdloos, infrastructuur-waardig
          </p>
        </section>
      </div>
    </div>
  );
}
