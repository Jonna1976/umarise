import { motion } from 'framer-motion';
import { Check, FileText, Hash } from 'lucide-react';

/**
 * Origin Mark Visual Mockup
 * Refined, minimalist exploration of ⊙ Circumpunct and ⚓ Anchor
 */

export default function UMarkMockup() {
  return (
    <div className="min-h-screen bg-stone-50 p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header - Ultra minimal */}
        <header className="text-center space-y-3">
          <h1 className="font-serif text-2xl text-stone-700 tracking-wide">Origin Mark</h1>
          <p className="text-stone-400 text-sm max-w-md mx-auto">
            Technische verificatie-indicator. Geen letter, geen claim — een symbool.
          </p>
        </header>

        {/* Two Finalists */}
        <section className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
          
          {/* Circumpunct */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" className="text-stone-700" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-lg text-stone-700">Circumpunct</h2>
                <p className="text-xs text-stone-400 mt-1">Het punt waar alles begint</p>
              </div>
            </div>

            {/* Circumpunct variations */}
            <div className="space-y-6">
              
              {/* Inline minimal */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Inline</p>
                <div className="flex items-center gap-3">
                  <span className="text-stone-600 text-sm">contract.pdf</span>
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-500">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Badge */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Badge</p>
                <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-stone-600">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                  <span className="text-xs text-stone-600 font-medium">Origin</span>
                </div>
              </div>

              {/* Seal */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Seal</p>
                <div className="flex justify-center">
                  <div className="relative">
                    <svg viewBox="0 0 80 80" className="w-16 h-16">
                      <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-300" />
                      <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-600" />
                      <circle cx="40" cy="40" r="5" fill="currentColor" className="text-stone-600" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Document corner */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Document</p>
                <div className="bg-stone-50 rounded p-4 relative h-24">
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-stone-200 rounded w-3/4" />
                    <div className="h-1.5 bg-stone-200 rounded w-full" />
                    <div className="h-1.5 bg-stone-200 rounded w-2/3" />
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-stone-400">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* External Point - NEW concept */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  {/* Circle with external dot - represents Umarise alongside systems */}
                  <circle cx="18" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <circle cx="34" cy="20" r="3" fill="currentColor" className="text-stone-700" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-lg text-stone-700">External Point</h2>
                <p className="text-xs text-stone-400 mt-1">Naast systemen, vóór verwerking</p>
              </div>
            </div>

            {/* External Point variations */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Inline</p>
                <div className="flex items-center gap-3">
                  <span className="text-stone-600 text-sm">contract.pdf</span>
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-500">
                    <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Badge</p>
                <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-stone-600">
                    <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                  <span className="text-xs text-stone-600 font-medium">Origin</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Seal</p>
                <div className="flex justify-center">
                  <svg viewBox="0 0 80 80" className="w-16 h-16">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="1" className="text-stone-300" />
                    <g className="text-stone-600">
                      <circle cx="34" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="56" cy="40" r="4" fill="currentColor" />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Concept</p>
                <div className="text-xs text-stone-500 space-y-1">
                  <p>○ = Bestaande systemen (vault, storage)</p>
                  <p>● = Umarise origin point (extern, onafhankelijk)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Scale comparison */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-6 text-center">Schaalvergelijking</h3>
          
          <div className="flex justify-center items-end gap-8">
            {/* Circumpunct at different sizes */}
            <div className="text-center space-y-3">
              <div className="flex items-end justify-center gap-4">
                <svg viewBox="0 0 16 16" className="w-3 h-3 text-stone-600">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-600">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-6 h-6 text-stone-600">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-8 h-8 text-stone-600">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-12 h-12 text-stone-600">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <p className="text-xs text-stone-400">Circumpunct</p>
            </div>

            <div className="w-px h-16 bg-stone-200" />

            {/* External Point at different sizes */}
            <div className="text-center space-y-3">
              <div className="flex items-end justify-center gap-4">
                <svg viewBox="0 0 16 16" className="w-3 h-3 text-stone-600">
                  <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-600">
                  <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-6 h-6 text-stone-600">
                  <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-8 h-8 text-stone-600">
                  <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-12 h-12 text-stone-600">
                  <circle cx="6" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="0.6" />
                  <circle cx="14" cy="8" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <p className="text-xs text-stone-400">External Point</p>
            </div>
          </div>
        </section>

        {/* Real-world context */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-6">In Context: File List</h3>
          
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors">
              <FileText className="w-5 h-5 text-stone-400" />
              <span className="flex-1 text-sm text-stone-600">contract_final.pdf</span>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-400">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors">
              <FileText className="w-5 h-5 text-stone-400" />
              <span className="flex-1 text-sm text-stone-600">invoice_2026_001.pdf</span>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-400">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors opacity-50">
              <FileText className="w-5 h-5 text-stone-400" />
              <span className="flex-1 text-sm text-stone-600">notes_draft.docx</span>
              <span className="text-xs text-stone-300">—</span>
            </div>
            
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors">
              <FileText className="w-5 h-5 text-stone-400" />
              <span className="flex-1 text-sm text-stone-600">proposal_v3.pdf</span>
              <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-400">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-stone-200 rounded-full">
            <svg viewBox="0 0 16 16" className="w-8 h-8 text-stone-700">
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-lg text-stone-700">Circumpunct</h2>
            <p className="text-sm text-stone-400 mt-2 max-w-xs mx-auto">
              Simpeler. Abstracter. Schaalt beter op kleine formaten.
              <br />
              <span className="text-stone-500">Het punt waar alles begint.</span>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
