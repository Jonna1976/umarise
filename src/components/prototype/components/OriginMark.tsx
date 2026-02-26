import { motion, useAnimation } from 'framer-motion';
import { useEffect, useId } from 'react';

export type OriginMarkState = 'anchored' | 'pending' | 'ghost';
export type OriginMarkVariant = 'dark' | 'light';

interface OriginMarkProps {
  size?: number;
  state?: OriginMarkState;
  glow?: boolean;
  animated?: boolean;
  variant?: OriginMarkVariant;
  introAnimation?: boolean;
  className?: string;
}

/**
 * The Origin Mark — Square with inner square hole
 * Replaces V7 hexagon with clean geometric square mark.
 */
export function OriginMark({
  size = 20,
  state = 'anchored',
  glow = false,
  animated = false,
  variant = 'dark',
  introAnimation = false,
  className = '',
}: OriginMarkProps) {
  const filterId = useId();
  const glowId = `glow-${filterId.replace(/:/g, '')}`;

  const surfaceColor = '#0F1A0F';
  const goldColor = '#C5935A';

  const dotControls = useAnimation();

  useEffect(() => {
    if (!introAnimation) return;
    const runIntro = async () => {
      await dotControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeOut', delay: 1.0 },
      });
    };
    runIntro();
  }, [introAnimation, dotControls]);

  if (state === 'ghost') {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" className={className} style={{ overflow: 'visible' }}>
        <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="rgba(197,147,90,0.1)" strokeWidth="0.6" />
      </svg>
    );
  }

  if (state === 'pending') {
    const large = size >= 32;
    const pendingContent = (
      <svg width={size} height={size} viewBox={large ? '0 0 48 48' : '0 0 20 20'} className={className} style={{ overflow: 'visible' }}>
        {large ? (
          <>
            <rect x="4" y="4" width="40" height="40" rx="4" fill="none" stroke="rgba(197,147,90,0.4)" strokeWidth="1.2" strokeDasharray="3 3" />
            <rect x="17" y="17" width="14" height="14" rx="1.8" fill="rgba(197,147,90,0.15)" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="rgba(197,147,90,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
            <rect x="6.5" y="6.5" width="7" height="7" rx="0.9" fill="rgba(197,147,90,0.25)" />
          </>
        )}
      </svg>
    );

    if (animated) {
      return (
        <motion.div
          className={className}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {pendingContent}
        </motion.div>
      );
    }
    return pendingContent;
  }

  // Anchored state — solid gold square with dark square hole
  const large = size >= 32;
  return (
    <svg
      width={size}
      height={size}
      viewBox={large ? '0 0 48 48' : '0 0 20 20'}
      className={className}
      style={{
        overflow: 'visible',
        ...(glow ? { filter: `drop-shadow(0 0 ${large ? '10' : '6'}px rgba(197,147,90,0.35))` } : {}),
      }}
    >
      {large ? (
        <>
          <rect x="4" y="4" width="40" height="40" rx="4" fill={goldColor} />
          <rect x="17" y="17" width="14" height="14" rx="1.8" fill={surfaceColor} />
        </>
      ) : (
        <>
          <rect x="2" y="2" width="16" height="16" rx="2" fill={goldColor} />
          <rect x="6.5" y="6.5" width="7" height="7" rx="0.9" fill={surfaceColor} />
        </>
      )}
    </svg>
  );
}
