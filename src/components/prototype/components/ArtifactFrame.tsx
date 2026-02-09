import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactDisplay } from './ArtifactDisplay';

interface ArtifactFrameProps {
  artifact: {
    id: string;
    type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
    date: string;
    hash: string;
    origin: string;
    size: string;
    offset: string;
    imageUrl?: string;
    otsStatus?: 'pending' | 'submitted' | 'anchored';
    mimeType?: string;
    fileName?: string;
  };
  isFocused: boolean;
  onClick?: () => void;
}

// Size mappings
const SIZE_CLASSES: Record<string, { width: number; height: number }> = {
  'large-landscape': { width: 195, height: 145 },
  'small-square': { width: 95, height: 95 },
  'portrait': { width: 105, height: 155 },
  'landscape-small': { width: 135, height: 88 },
  'medium-square': { width: 125, height: 125 },
  'tiny': { width: 78, height: 52 },
  'panoramic': { width: 210, height: 85 },
};

// Vertical offset mappings
const OFFSET_CLASSES: Record<string, string> = {
  'highest': 'mt-[-70px]',
  'high': 'mt-[-55px]',
  'middle': 'mt-0',
  'low': 'mt-[45px]',
  'lower': 'mt-[70px]',
};

/**
 * ArtifactFrame - Frame resonance based on artifact type
 * Each frame style matches its content type
 */
export function ArtifactFrame({ artifact, isFocused, onClick }: ArtifactFrameProps) {
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDotTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2500);
  }, []);
  const size = SIZE_CLASSES[artifact.size] || SIZE_CLASSES['medium-square'];
  const offsetClass = OFFSET_CLASSES[artifact.offset] || OFFSET_CLASSES['middle'];

  const getFrameStyles = () => {
    const baseStyles = "relative transition-all duration-400";
    
    switch (artifact.type) {
      case 'warm':
        return {
          frame: `${baseStyles} p-2 rounded-[4px]`,
          frameStyle: {
            background: 'linear-gradient(135deg, rgba(197, 147, 90, 0.22), rgba(180, 130, 70, 0.12) 30%, rgba(197, 147, 90, 0.18) 70%, rgba(210, 160, 80, 0.15))',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(197, 147, 90, 0.08), inset 0 0 0 2px rgba(197, 147, 90, 0.25), inset 0 0 0 3px rgba(15, 26, 15, 0.5), inset 0 0 0 4px rgba(197, 147, 90, 0.1)',
          },
          mat: 'p-1 border border-[rgba(197,147,90,0.15)] bg-[rgba(12,20,12,0.95)]',
        };
      
      case 'text':
        return {
          frame: `${baseStyles} p-[3px] rounded-none`,
          frameStyle: {
            background: 'rgba(197, 147, 90, 0.04)',
            boxShadow: '0 1px 10px rgba(0, 0, 0, 0.25), inset 0 0 0 0.5px rgba(197, 147, 90, 0.2)',
          },
          mat: 'p-[2px] border-[0.5px] border-[rgba(197,147,90,0.08)] bg-[rgba(15,26,15,0.95)]',
        };
      
      case 'sound':
        return {
          frame: `${baseStyles} p-1.5 rounded-[50px]`,
          frameStyle: {
            background: 'linear-gradient(135deg, rgba(197, 147, 90, 0.1), rgba(197, 147, 90, 0.05))',
            animation: 'soundPulse 3s ease-in-out infinite',
          },
          mat: 'rounded-[40px] border-[0.5px] border-[rgba(197,147,90,0.1)]',
          content: 'rounded-[36px]',
        };
      
      case 'digital':
        return {
          frame: `${baseStyles} p-1 rounded-none`,
          frameStyle: {
            background: 'linear-gradient(180deg, rgba(107, 163, 214, 0.06), rgba(107, 163, 214, 0.02))',
            boxShadow: '0 1px 8px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(107, 163, 214, 0.12)',
          },
          mat: 'border border-dashed border-[rgba(107,163,214,0.15)] p-[3px] rounded-none bg-[rgba(10,15,20,0.95)]',
        };
      
      case 'organic':
        return {
          frame: `${baseStyles} rounded-[3px_5px_4px_6px]`,
          frameStyle: {
            padding: '9px 8px 7px 10px',
            background: 'linear-gradient(140deg, rgba(197, 147, 90, 0.14), rgba(197, 147, 90, 0.06), rgba(197, 147, 90, 0.11))',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.4), inset 0 0 0 2px rgba(197, 147, 90, 0.15)',
          },
          mat: 'border border-[rgba(197,147,90,0.1)] rounded-[1px_3px_2px_4px]',
          matStyle: { padding: '5px 4px 3px 5px' },
        };
      
      case 'sketch':
        return {
          frame: `${baseStyles} rounded-[1px_4px_2px_3px]`,
          frameStyle: {
            padding: '5px 7px 6px 5px',
            background: 'linear-gradient(155deg, rgba(197, 147, 90, 0.08), rgba(197, 147, 90, 0.03), rgba(197, 147, 90, 0.06))',
            boxShadow: '0 3px 15px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(197, 147, 90, 0.12)',
            transform: 'rotate(-0.5deg)',
          },
          mat: 'p-[3px] border-[0.5px] border-[rgba(197,147,90,0.08)] rounded-[0_2px_1px_0]',
        };
      
      default:
        return {
          frame: baseStyles,
          frameStyle: {},
          mat: '',
        };
    }
  };

  const styles = getFrameStyles();

  return (
    <motion.div
      data-artifact-id={artifact.id}
      className={`flex-shrink-0 flex flex-col items-center ${offsetClass} cursor-pointer`}
      animate={{
        opacity: isFocused ? 1 : 0.35,
        scale: isFocused ? 1 : 0.96,
      }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className={styles.frame} style={styles.frameStyle}>
        {/* Glass highlight overlay */}
        <div 
          className="absolute top-1.5 left-1.5 right-1.5 bottom-1.5 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent 40%, transparent 60%, rgba(255, 255, 255, 0.015))',
          }}
        />
        
        {/* Mat */}
        <div 
          className={`${styles.mat} bg-[rgba(15,26,15,0.9)]`}
          style={styles.matStyle}
        >
          {/* Content - show image if available, else abstract display */}
          <div 
            className={`flex items-center justify-center overflow-hidden ${styles.content || ''}`}
            style={{ width: size.width, height: size.height }}
          >
            {artifact.imageUrl && !imageError && (!artifact.mimeType || artifact.mimeType.startsWith('image/')) ? (
              <img 
                src={artifact.imageUrl} 
                alt="" 
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <ArtifactDisplay type={artifact.type} mimeType={artifact.mimeType} fileName={artifact.fileName} />
            )}
          </div>
        </div>
      </div>

      {/* Date label */}
      <motion.p
        className="font-mono text-[10px] tracking-[2px] whitespace-nowrap mt-2"
        animate={{
          color: isFocused ? 'hsl(var(--ritual-gold-muted))' : 'hsl(var(--ritual-gold-muted))',
          opacity: isFocused ? 0.6 : 0.35,
        }}
        transition={{ duration: 0.4 }}
      >
        {artifact.date}
      </motion.p>

      {/* Anchored indicator — solid dot (anchored) vs pulsing dot (pending) */}
      <div className="relative flex flex-col items-center">
        {artifact.otsStatus === 'anchored' ? (
          <motion.div
            className="w-[5px] h-[5px] rounded-full mt-1.5"
            style={{ background: 'hsl(var(--ritual-gold))' }}
            animate={{ opacity: isFocused ? 0.7 : 0.25 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <motion.div
            className="w-[5px] h-[5px] rounded-full mt-1.5 cursor-pointer"
            style={{ background: 'hsl(var(--ritual-gold))' }}
            animate={{
              opacity: isFocused ? [0.2, 0.6, 0.2] : [0.1, 0.3, 0.1],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            onClick={handleDotTap}
            onTouchStart={handleDotTap}
          />
        )}

        {/* Tooltip — appears on tap/hover for pending dots */}
        <AnimatePresence>
          {showTooltip && artifact.otsStatus !== 'anchored' && (
            <motion.p
              className="absolute top-6 whitespace-nowrap font-garamond italic text-[13px]"
              style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
            >
              anchoring in Bitcoin
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
