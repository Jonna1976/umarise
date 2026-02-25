import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';

interface BackupNudgeProps {
  onDismiss: () => void;
  onExport: () => void;
}

export function BackupNudge({ onDismiss, onExport }: BackupNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => { onExport(); onDismiss(); };
  const handleDismiss = () => { setIsVisible(false); setTimeout(onDismiss, 400); };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[320px] w-[90%]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative rounded-xl px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--ritual-surface-elevated) / 0.95), hsl(var(--ritual-surface) / 0.9))',
              border: '1px solid hsl(var(--ritual-gold) / 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 hsl(var(--ritual-gold) / 0.05)',
            }}
          >
            <div className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center top, hsl(var(--ritual-gold) / 0.04), transparent 60%)' }} />

            <p className="font-garamond italic text-[26px] text-ritual-cream-70 text-center leading-relaxed mb-3 relative">
              your memories live in your browser
              <br />
              <span className="text-ritual-gold-muted">back them up to keep them safe</span>
            </p>

            <div className="flex justify-center gap-3 relative">
              <button onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-ritual-gold font-garamond text-[24px] tracking-wide transition-all duration-300 hover:bg-ritual-gold/10"
                style={{ border: '1px solid hsl(var(--ritual-gold) / 0.3)' }}>
                <Download className="w-3.5 h-3.5" />
                export all
              </button>
              <button onClick={handleDismiss}
                className="px-4 py-2 rounded-lg text-ritual-cream-40 font-garamond italic text-[24px] transition-all duration-300 hover:text-ritual-cream-70">
                later
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
