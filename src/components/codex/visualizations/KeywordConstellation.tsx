import { useEffect, useRef } from 'react';

interface KeywordData {
  keyword: string;
  count: number;
  tones: string[];
}

interface KeywordConstellationProps {
  keywords: KeywordData[];
  tagline: string;
  width?: number;
  height?: number;
}

const TONE_COLORS: Record<string, string> = {
  focused: '#4A7C59',      // deep green
  hopeful: '#C9A227',      // gold
  frustrated: '#B85C38',   // amber/rust
  playful: '#7B68EE',      // soft purple
  overwhelmed: '#6B7280',  // muted gray
  reflective: '#5B8FB9',   // soft blue
  determined: '#8B4513',   // saddle brown
  curious: '#DAA520',      // goldenrod
  anxious: '#9CA3AF',      // cool gray
  excited: '#E07B39',      // warm orange
  calm: '#6B8E7A',         // sage green
  default: '#8B7355'       // sepia fallback
};

export function KeywordConstellation({ 
  keywords, 
  tagline,
  width = 400, 
  height = 400 
}: KeywordConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear and set background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;

    // Sort by count for positioning
    const sortedKeywords = [...keywords].sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...sortedKeywords.map(k => k.count), 1);

    // Position keywords in a constellation pattern
    const positions: { x: number; y: number; keyword: KeywordData; radius: number }[] = [];

    sortedKeywords.forEach((kw, index) => {
      // Spiral placement with some randomness for organic feel
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = index * goldenAngle + (Math.random() - 0.5) * 0.3;
      
      // Distance from center based on rank (most frequent = closer to center)
      const normalizedRank = index / Math.max(sortedKeywords.length - 1, 1);
      const distance = 30 + normalizedRank * maxRadius * 0.8;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Size based on count
      const normalizedCount = kw.count / maxCount;
      const radius = 8 + normalizedCount * 20;

      positions.push({ x, y, keyword: kw, radius });
    });

    // Draw connection lines (subtle, hand-drawn feel)
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.15)';
    ctx.lineWidth = 1;

    positions.forEach((pos, i) => {
      // Connect to 2-3 nearby keywords
      const nearby = positions
        .filter((_, j) => j !== i)
        .sort((a, b) => {
          const distA = Math.hypot(a.x - pos.x, a.y - pos.y);
          const distB = Math.hypot(b.x - pos.x, b.y - pos.y);
          return distA - distB;
        })
        .slice(0, 2);

      nearby.forEach(other => {
        ctx.beginPath();
        // Slightly curved lines for hand-drawn effect
        const midX = (pos.x + other.x) / 2 + (Math.random() - 0.5) * 10;
        const midY = (pos.y + other.y) / 2 + (Math.random() - 0.5) * 10;
        ctx.moveTo(pos.x, pos.y);
        ctx.quadraticCurveTo(midX, midY, other.x, other.y);
        ctx.stroke();
      });
    });

    // Draw keyword nodes
    positions.forEach(({ x, y, keyword, radius }) => {
      // Get primary tone color
      const primaryTone = keyword.tones[0] || 'default';
      const color = TONE_COLORS[primaryTone] || TONE_COLORS.default;

      // Draw outer ring (tone indicator)
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw filled circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `${color}20`; // 20% opacity fill
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw small dots for count (like data-humanism marks)
      if (keyword.count > 1) {
        const dotRadius = 2;
        const dotCount = Math.min(keyword.count, 5);
        for (let i = 0; i < dotCount; i++) {
          const dotAngle = (i / dotCount) * Math.PI * 2 - Math.PI / 2;
          const dotDistance = radius - 4;
          const dotX = x + Math.cos(dotAngle) * dotDistance;
          const dotY = y + Math.sin(dotAngle) * dotDistance;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      // Draw keyword text
      ctx.fillStyle = '#4A4A4A';
      ctx.font = `${10 + (radius - 8) * 0.3}px "Crimson Pro", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position text below the circle
      ctx.fillText(keyword.keyword, x, y + radius + 12);
    });

    // Draw center focal point (the "red thread")
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#C9A227';
    ctx.fill();
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw tagline at bottom
    ctx.fillStyle = '#6B5B4F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, centerX, height - 20);

  }, [keywords, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
