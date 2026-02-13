import { motion, useAnimation } from 'framer-motion';
import { useEffect, useId } from 'react';

export type OriginMarkState = 'anchored' | 'pending' | 'ghost';
export type OriginMarkVariant = 'dark' | 'light';

interface OriginMarkProps {
  /** SVG size in px — scales proportionally */
  size?: number;
  /** Visual state: anchored (solid), pending (dashed), ghost (empty) */
  state?: OriginMarkState;
  /** Show glow filter — only for ceremonial use (sealed/detail nail) */
  glow?: boolean;
  /** Pulse animation for pending state */
  animated?: boolean;
  /** Color variant */
  variant?: OriginMarkVariant;
  /** S0 intro animation: V7 appears → pulses */
  introAnimation?: boolean;
  className?: string;
}

/**
 * The Origin Mark — V7 Hexagon (⬡ with □ hole)
 * 
 * V7 is de spijker. Het houdt het bewijs op zijn plek.
 * 
 * States:
 * - anchored: solid gold hexagon, dark square hole, optional glow
 * - pending: dashed outline hexagon, ghost square, pulsing
 * - ghost: faint outline hexagon only (placeholder)
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

  // V7 uses a fixed viewBox of 48x48 for consistent proportions
  // Hexagon points: 24,4 42,14 42,34 24,44 6,34 6,14
  // Square hole: x=17 y=17 w=14 h=14 rx=1.8

  const surfaceColor = variant === 'dark' ? 'hsl(var(--ritual-surface))' : '#0F1A0F';
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
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        className={className}
        style={{ overflow: 'visible' }}
      >
        <polygon
          points="10,1.5 18,5.5 18,14.5 10,18.5 2,14.5 2,5.5"
          fill="none"
          stroke="rgba(197,147,90,0.1)"
          strokeWidth="0.6"
        />
      </svg>
    );
  }

  if (state === 'pending') {
    const pendingContent = (
      <svg
        width={size}
        height={size}
        viewBox={size >= 32 ? '0 0 48 48' : '0 0 20 20'}
        className={className}
        style={{ overflow: 'visible' }}
      >
        {size >= 32 ? (
          <>
            <polygon
              points="24,4 42,14 42,34 24,44 6,34 6,14"
              fill="none"
              stroke="rgba(197,147,90,0.4)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <rect x="17" y="17" width="14" height="14" rx="1.8"
              fill="rgba(197,147,90,0.15)"
            />
          </>
        ) : (
          <>
            <polygon
              points="10,1.5 18,5.5 18,14.5 10,18.5 2,14.5 2,5.5"
              fill="none"
              stroke="rgba(197,147,90,0.3)"
              strokeWidth="0.8"
              strokeDasharray="2 2"
            />
            <rect x="6.5" y="6.5" width="7" height="7" rx="0.9"
              fill="rgba(197,147,90,0.25)"
            />
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

  // Anchored state — solid gold hexagon with dark square hole
  return (
    <svg
      width={size}
      height={size}
      viewBox={size >= 32 ? '0 0 48 48' : '0 0 20 20'}
      className={className}
      style={{
        overflow: 'visible',
        ...(glow ? { filter: `drop-shadow(0 0 ${size >= 32 ? '10' : '6'}px rgba(197,147,90,0.35))` } : {}),
      }}
    >
      {size >= 32 ? (
        <>
          <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill={goldColor} />
          <rect x="17" y="17" width="14" height="14" rx="1.8" fill={surfaceColor} />
        </>
      ) : (
        <>
          <polygon points="10,1.5 18,5.5 18,14.5 10,18.5 2,14.5 2,5.5" fill={goldColor} />
          <rect x="6.5" y="6.5" width="7" height="7" rx="0.9" fill={surfaceColor} />
        </>
      )}
    </svg>
  );
}
