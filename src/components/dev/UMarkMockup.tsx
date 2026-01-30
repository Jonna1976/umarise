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

        {/* The Two Finalists - Side by side, elegant */}
        <section className="grid md:grid-cols-2 gap-12">
          
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

          {/* Anchor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  {/* Minimal anchor - just the essential form */}
                  <circle cx="20" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <line x1="20" y1="14" x2="20" y2="32" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <path d="M12 28 Q20 36 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-lg text-stone-700">Anchor</h2>
                <p className="text-xs text-stone-400 mt-1">Verankerd, onveranderlijk</p>
              </div>
            </div>

            {/* Anchor variations */}
            <div className="space-y-6">
              
              {/* Inline minimal */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Inline</p>
                <div className="flex items-center gap-3">
                  <span className="text-stone-600 text-sm">contract.pdf</span>
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-500">
                    <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="1" />
                    <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              {/* Badge */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <p className="text-xs text-stone-400 mb-4 uppercase tracking-wider">Badge</p>
                <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-stone-600">
                    <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="1" />
                    <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1" />
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
                      <g className="text-stone-600">
                        <circle cx="40" cy="28" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="40" y1="34" x2="40" y2="56" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M28 50 Q40 62 52 50" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="30" y1="40" x2="50" y2="40" stroke="currentColor" strokeWidth="1.5" />
                      </g>
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
                      <circle cx="12" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="12" y1="10" x2="12" y2="20" stroke="currentColor" strokeWidth="1" />
                      <path d="M7 17 Q12 23 17 17" fill="none" stroke="currentColor" strokeWidth="1" />
                      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </div>
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

            {/* Anchor at different sizes */}
            <div className="text-center space-y-3">
              <div className="flex items-end justify-center gap-4">
                <svg viewBox="0 0 16 16" className="w-3 h-3 text-stone-600">
                  <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-600">
                  <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-6 h-6 text-stone-600">
                  <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="1" />
                  <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="1" />
                  <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-8 h-8 text-stone-600">
                  <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="0.8" />
                  <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="0.8" />
                </svg>
                <svg viewBox="0 0 16 16" className="w-12 h-12 text-stone-600">
                  <circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="0.6" />
                  <line x1="8" y1="6" x2="8" y2="13" stroke="currentColor" strokeWidth="0.6" />
                  <path d="M5 11 Q8 15 11 11" fill="none" stroke="currentColor" strokeWidth="0.6" />
                  <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              </div>
              <p className="text-xs text-stone-400">Anchor</p>
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
