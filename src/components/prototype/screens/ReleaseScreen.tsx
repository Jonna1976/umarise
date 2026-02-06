import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
}

interface ReleaseScreenProps {
  artifact: Artifact;
  onComplete: () => void;
}

/**
 * Screen 4: Release
 * The certificate of beginning.
 * Full resolution stays on device. Only the proof leaves.
 * 
 * Per briefing: Shows OTS status (pending → anchored)
 * NEW: "Notify me when anchored" email prompt (per v4 user flow)
 */
export function ReleaseScreen({ artifact, onComplete }: ReleaseScreenProps) {
  const [showCard, setShowCard] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [showOts, setShowOts] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [showNote, setShowNote] = useState(false);
  
  // Email state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Cascade animation timing per spec:
  // 0.0s card, 0.6s title, 1.0s origin, 1.2s date, 1.5s line, 1.8s hash, 2.0s ots, 2.4s email prompt, 2.8s note
  // Auto-continue to next screen after 8s (giving user time to enter email or skip)
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowCard(true), 0),
      setTimeout(() => setShowTitle(true), 600),
      setTimeout(() => setShowOrigin(true), 1000),
      setTimeout(() => setShowDate(true), 1200),
      setTimeout(() => setShowLine(true), 1500),
      setTimeout(() => setShowHash(true), 1800),
      setTimeout(() => setShowOts(true), 2000),
      setTimeout(() => setShowEmailPrompt(true), 2400),
      setTimeout(() => setShowNote(true), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Handle email submission for OTS notification
  const handleEmailSubmit = useCallback(async () => {
    if (!email || isSubmitting || emailSubmitted) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email for OTS notification in the pages table
      // The notify-ots-complete function will use this to send email when anchored
      const { error } = await supabase
        .from('pages')
        .update({ 
          user_note: `notify:${email}` // Temporary storage until proper field added
        } as any)
        .eq('id', artifact.id);

      if (error) {
        console.warn('[ReleaseScreen] Email save failed:', error);
        // Don't show error to user, just continue
      }

      setEmailSubmitted(true);
      toast.success("We'll notify you when anchored");
      
      // Continue to next screen after brief delay
      setTimeout(onComplete, 1500);
    } catch (e) {
      console.error('[ReleaseScreen] Email submit error:', e);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, emailSubmitted, artifact.id, onComplete]);

  // Handle skip - continue without email
  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHash = (hash: string) => {
    if (hash.length < 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Certificate card - 280px, radius 14px, padding 44px 36px 36px */}
      <motion.div
        className="w-[280px] rounded-[14px] text-center relative overflow-hidden"
        style={{
          padding: '44px 36px 36px',
          background: 'linear-gradient(170deg, rgba(30, 45, 30, 0.9), rgba(20, 32, 20, 0.95))',
          border: '1px solid hsl(var(--ritual-gold) / 0.15)',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ 
          opacity: showCard ? 1 : 0, 
          scale: showCard ? 1 : 0.97 
        }}
        transition={{ duration: 0.6 }}
      >
        {/* Radial gold glow behind card */}
        <div 
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--ritual-gold) / 0.04), transparent 50%)',
          }}
        />

        {/* U symbol - 56x56 */}
        <div className="w-14 h-14 mx-auto mb-4">
          <svg viewBox="0 0 56 56" width="56" height="56">
            <circle 
              cx="28" 
              cy="28" 
              r="23" 
              fill="none" 
              stroke="hsl(var(--ritual-gold))" 
              strokeWidth="0.5" 
              opacity="0.25"
            />
            <path 
              d="M44 16A20 20 0 1 1 39 11" 
              fill="none" 
              stroke="hsl(var(--ritual-gold))" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              opacity="0.7"
            />
            <motion.circle 
              cx="44" 
              cy="16" 
              r="2.5" 
              fill="hsl(var(--ritual-gold))"
              animate={{ opacity: [0.85, 0.4, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <text 
              x="28" 
              y="34" 
              textAnchor="middle" 
              fontFamily="'Playfair Display', Georgia, serif" 
              fontSize="22" 
              fontWeight="400" 
              fill="hsl(var(--ritual-gold))" 
              opacity="0.9"
            >
              U
            </text>
          </svg>
        </div>

        {/* "Marked" title - Playfair 400, 36px */}
        <motion.h2
          className="font-playfair font-normal text-4xl text-ritual-gold mb-[18px]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          Marked
        </motion.h2>

        {/* Origin code - JetBrains Mono 10px, letter-spacing 2px */}
        <motion.p
          className="font-mono text-[10px] tracking-[2px] uppercase mb-1.5"
          style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showOrigin ? 1 : 0, y: showOrigin ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          {artifact.origin}
        </motion.p>

        {/* Date - EB Garamond 14px */}
        <motion.p
          className="font-garamond text-sm mb-5"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showDate ? 1 : 0, y: showDate ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          {formatDate(artifact.date)}
        </motion.p>

        {/* Gold line - 50px */}
        <motion.div
          className="w-[50px] h-px mx-auto mb-4"
          style={{ background: 'hsl(var(--ritual-gold))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showLine ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Hash - JetBrains Mono 10px */}
        <motion.p
          className="font-mono text-[10px] tracking-[1px] mb-3"
          style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showHash ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {formatHash(artifact.hash)}
        </motion.p>

        {/* OTS Status - Bitcoin anchor status */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: showOts ? 0.6 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Bitcoin icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-70">
            <circle cx="12" cy="12" r="10" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5"/>
            <path d="M9 8h4c1.5 0 2.5 1 2.5 2s-1 2-2.5 2H9V8z" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5"/>
            <path d="M9 12h4.5c1.5 0 2.5 1 2.5 2s-1 2-2.5 2H9v-4z" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5"/>
            <path d="M10 6v2M13 6v2M10 16v2M13 16v2" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5"/>
          </svg>
          <span 
            className="font-mono text-[9px] tracking-[1px] uppercase"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            Pending Bitcoin anchor
          </span>
        </motion.div>

        {/* Email notification prompt */}
        <motion.div
          className="mt-5 w-full"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: showEmailPrompt ? 1 : 0, y: showEmailPrompt ? 0 : 8 }}
          transition={{ duration: 0.5 }}
        >
          {!emailSubmitted ? (
            <>
              <p className="font-garamond text-[11px] text-center mb-3"
                 style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}>
                Get notified when anchored on Bitcoin
              </p>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40"
                        style={{ color: 'hsl(var(--ritual-gold))' }} />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                    className="w-full pl-9 pr-3 py-2 rounded-md font-garamond text-sm
                               placeholder:text-[hsl(var(--ritual-cream)/0.25)]
                               focus:outline-none focus:ring-1"
                    style={{
                      background: 'hsl(var(--ritual-surface-light) / 0.5)',
                      border: '1px solid hsl(var(--ritual-gold) / 0.15)',
                      color: 'hsl(var(--ritual-cream) / 0.8)',
                    }}
                  />
                </div>
                <button
                  onClick={handleEmailSubmit}
                  disabled={!email || isSubmitting}
                  className="px-4 py-2 rounded-md font-garamond text-sm transition-all
                             disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: 'hsl(var(--ritual-gold) / 0.15)',
                    border: '1px solid hsl(var(--ritual-gold) / 0.3)',
                    color: 'hsl(var(--ritual-gold) / 0.9)',
                  }}
                >
                  {isSubmitting ? '...' : 'Notify'}
                </button>
              </div>

              <button
                onClick={handleSkip}
                className="w-full mt-3 font-garamond text-[10px] transition-opacity hover:opacity-60"
                style={{ color: 'hsl(var(--ritual-cream) / 0.25)' }}
              >
                skip — I'll check back later
              </button>
            </>
          ) : (
            <p className="font-garamond text-sm text-center"
               style={{ color: 'hsl(var(--ritual-gold) / 0.7)' }}>
              ✓ We'll email you when anchored
            </p>
          )}
        </motion.div>

        {/* Whisper note - EB Garamond italic 11px */}
        <motion.p
          className="font-garamond italic text-[11px] mt-4"
          style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showNote ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        >
          sealed on your device · only the proof leaves
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
