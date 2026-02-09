import { motion, useAnimation } from 'framer-motion';
import { useEffect, useId } from 'react';

export type OriginMarkState = 'anchored' | 'pending' | 'ghost';
export type OriginMarkVariant = 'dark' | 'light';

interface OriginMarkProps {
  /** SVG size in px — scales proportionally */
  size?: number;
  /** Visual state: anchored (solid), pending (dashed), ghost (empty) */
  state?: OriginMarkState;
  /** Show glow filter — only for ceremonial use (S0, S4) */
  glow?: boolean;
  /** Pulse/breathe animation on the dot */
  animated?: boolean;
  /** Color variant */
  variant?: OriginMarkVariant;
  /** S0 intro animation: dot appears → ring draws → dot pulses */
  introAnimation?: boolean;
  className?: string;
}

/**
 * The Origin Mark — circumpunct (⊙)
 * 
 * De stip is de bron. De cirkel is de verankering.
 * Samen: een origin. Het symbool claimt niets. Het markeert.
 * 
 * Proportions: dot:circle ratio ≈ 1:3 (always)
 * 
 * States:
 * - anchored: solid circle, full dot, optional glow
 * - pending: dashed circle, dimmed dot
 * - ghost: empty circle, no dot (opacity 0.15)
 */
export function OriginMark({
  size = 14,
  state = 'anchored',
  glow = false,
  animated = false,
  variant = 'dark',
  introAnimation = false,
  className = '',
}: OriginMarkProps) {
  const filterId = useId();
  const glowId = `glow-${filterId.replace(/:/g, '')}`;

  // Proportional scaling: viewBox is always 0 0 {size} {size}
  const center = size / 2;
  // Circle radius: ~83% of half-size for breathing room
  const circleR = Math.round((size * 0.417) * 10) / 10;
  // Dot radius: ~1/3 of circle radius
  const dotR = Math.round((circleR / 3) * 10) / 10;
  // Stroke width scales with size
  const strokeWidth = size <= 14 ? 0.8 : size <= 28 ? 1.0 : 1.2;
  // Circumference for stroke-dashoffset animation
  const circumference = Math.round(2 * Math.PI * circleR);

  // Colors per variant
  const colors = variant === 'dark'
    ? {
        circleStroke: state === 'pending'
          ? 'rgba(197,147,90,0.2)'
          : 'rgba(197,147,90,0.3)',
        dotFill: state === 'pending'
          ? 'rgba(197,147,90,0.4)'
          : '#C5935A',
      }
    : {
        circleStroke: state === 'pending'
          ? 'rgba(139,115,85,0.2)'
          : 'rgba(139,115,85,0.3)',
        dotFill: state === 'pending'
          ? 'rgba(139,115,85,0.4)'
          : '#8B7355',
      };

  // Dash pattern for pending state
  const dashArray = state === 'pending'
    ? `${Math.max(3, size * 0.08)} ${Math.max(3, size * 0.08)}`
    : undefined;

  // Animation controls for intro sequence
  const dotControls = useAnimation();
  const ringControls = useAnimation();

  useEffect(() => {
    if (!introAnimation) return;

    const runIntro = async () => {
      // Step 2: Dot appears (scale 0→1, 0.8s, delay 1.5s after text)
      await dotControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeOut', delay: 1.0 },
      });

      // Step 3: Ring draws (stroke-dashoffset, 2s)
      ringControls.start({
        strokeDashoffset: 0,
        transition: {
          duration: 2,
          ease: [0.4, 0, 0.2, 1],
        },
      });

      // Step 4: Wait for ring to finish, then start pulse (delay ≈ 2s)
      await new Promise(resolve => setTimeout(resolve, 2000));
      dotControls.start({
        opacity: [1, 0.6, 1],
        scale: [1, 1.15, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      });
    };

    runIntro();
  }, [introAnimation, dotControls, ringControls]);

  if (state === 'ghost') {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        style={{ overflow: 'visible' }}
      >
        <circle
          cx={center}
          cy={center}
          r={circleR}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.15}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* Glow filter — warm golden glow around the dot */}
      {glow && (
        <defs>
          <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={Math.max(2, size * 0.12)} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Circle — ring */}
      {introAnimation ? (
        <motion.circle
          cx={center}
          cy={center}
          r={circleR}
          fill="none"
          stroke={colors.circleStroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={ringControls}
        />
      ) : (
        <circle
          cx={center}
          cy={center}
          r={circleR}
          fill="none"
          stroke={colors.circleStroke}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
        />
      )}

      {/* Dot — the source */}
      {introAnimation ? (
        <motion.circle
          cx={center}
          cy={center}
          r={dotR}
          fill={colors.dotFill}
          filter={glow ? `url(#${glowId})` : undefined}
          initial={{ opacity: 0, scale: 0 }}
          animate={dotControls}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
      ) : animated ? (
        <motion.circle
          cx={center}
          cy={center}
          r={dotR}
          fill={colors.dotFill}
          filter={glow ? `url(#${glowId})` : undefined}
          animate={{
            opacity: state === 'pending' ? [0.3, 0.5, 0.3] : [0.8, 0.5, 0.8],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
      ) : (
        <circle
          cx={center}
          cy={center}
          r={dotR}
          fill={colors.dotFill}
          filter={glow ? `url(#${glowId})` : undefined}
        />
      )}
    </svg>
  );
}
