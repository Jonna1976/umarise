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

        {/* Three Finalists */}
        <section className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
          
          {/* Circumpunct */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" className="text-stone-700" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-base text-stone-700">Circumpunct</h2>
                <p className="text-xs text-stone-400 mt-1">Punt in het midden</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-stone-400 mb-3 uppercase tracking-wider">Inline</p>
                <div className="flex items-center gap-2">
                  <span className="text-stone-600 text-sm">contract.pdf</span>
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-500">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-stone-400 mb-3 uppercase tracking-wider">Badge</p>
                <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-stone-600">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                  <span className="text-xs text-stone-600 font-medium">Origin</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* External Point Bottom - dot at bottom-right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  {/* Circle with dot at bottom-right corner */}
                  <circle cx="20" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-700" />
                  <circle cx="34" cy="32" r="3" fill="currentColor" className="text-stone-700" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-base text-stone-700">External Bottom</h2>
                <p className="text-xs text-stone-400 mt-1">Punt rechtsonder</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-stone-400 mb-3 uppercase tracking-wider">Inline</p>
                <div className="flex items-center gap-2">
                  <span className="text-stone-600 text-sm">contract.pdf</span>
                  <svg viewBox="0 0 16 16" className="w-4 h-4 text-stone-500">
                    <circle cx="7" cy="6.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="14" cy="13" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-stone-400 mb-3 uppercase tracking-wider">Badge</p>
                <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full">
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-stone-600">
                    <circle cx="7" cy="6.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="14" cy="13" r="1.5" fill="currentColor" />
                  </svg>
                  <span className="text-xs text-stone-600 font-medium">Origin</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Scale comparison */}
        <section className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-6 text-center">Schaalvergelijking</h3>
          
          <div className="flex flex-wrap justify-center items-end gap-8">
            {/* Circumpunct at different sizes */}
            <div className="text-center space-y-3">
              <div className="flex items-end justify-center gap-3">
                {[12, 16, 24, 32, 48].map((size) => (
                  <svg key={size} viewBox="0 0 16 16" style={{ width: size, height: size }} className="text-stone-600">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-stone-400">Circumpunct</p>
            </div>

            <div className="w-px h-12 bg-stone-200" />

            {/* External Bottom at different sizes */}
            <div className="text-center space-y-3">
              <div className="flex items-end justify-center gap-3">
                {[12, 16, 24, 32, 48].map((size) => (
                  <svg key={size} viewBox="0 0 16 16" style={{ width: size, height: size }} className="text-stone-600">
                    <circle cx="7" cy="6.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="14" cy="13" r="1.5" fill="currentColor" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-stone-400">External Bottom</p>
            </div>

            <div className="w-px h-12 bg-stone-200" />

            {/* External Bottom at different sizes */}
            <div className="text-center space-y-3">
              <div className="flex items-end justify-center gap-3">
                {[12, 16, 24, 32, 48].map((size) => (
                  <svg key={size} viewBox="0 0 16 16" style={{ width: size, height: size }} className="text-stone-600">
                    <circle cx="7" cy="6.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="14" cy="13" r="1.5" fill="currentColor" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-stone-400">External Bottom</p>
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
