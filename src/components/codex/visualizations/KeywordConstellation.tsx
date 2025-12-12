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

// Refined Lupi-style palette - earthy, warm, no INSIGHTS primary colors
const TONE_COLORS: Record<string, string> = {
  focused: '#5B7553',      // sage green
  hopeful: '#C4956A',      // warm terracotta
  frustrated: '#9B6B5A',   // dusty rose brown
  playful: '#8B7B9B',      // muted lavender
  overwhelmed: '#7A7A7A',  // warm gray
  reflective: '#6B8A8A',   // teal gray
  determined: '#6B5B4F',   // warm brown
  curious: '#B39B7A',      // sand
  anxious: '#8A8A8A',      // neutral gray
  excited: '#C4856A',      // soft coral
  calm: '#7A9B8A',         // eucalyptus
  default: '#8B7B6B'       // warm taupe
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

    // Clear and set background - slightly warmer
    ctx.fillStyle = '#FDFBF8';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 + 10; // Slightly lower to balance tagline
    const maxRadius = Math.min(width, height) * 0.35; // More whitespace

    // Sort by count for positioning
    const sortedKeywords = [...keywords].sort((a, b) => b.count - a.count);
    const maxCount = Math.max(...sortedKeywords.map(k => k.count), 1);

    // Position keywords in a constellation pattern
    const positions: { x: number; y: number; keyword: KeywordData; radius: number }[] = [];

    sortedKeywords.forEach((kw, index) => {
      // Spiral placement with organic randomness
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angle = index * goldenAngle + (Math.random() - 0.5) * 0.4;
      
      // Distance from center based on rank (most frequent = closer to center)
      const normalizedRank = index / Math.max(sortedKeywords.length - 1, 1);
      const distance = 35 + normalizedRank * maxRadius * 0.85;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Size based on count - smaller, more refined
      const normalizedCount = kw.count / maxCount;
      const radius = 6 + normalizedCount * 14;

      positions.push({ x, y, keyword: kw, radius });
    });

    // Draw subtle connection lines (very light, organic curves)
    ctx.strokeStyle = 'rgba(139, 123, 107, 0.08)';
    ctx.lineWidth = 0.75;

    positions.forEach((pos, i) => {
      // Connect to 1-2 nearby keywords only
      const nearby = positions
        .filter((_, j) => j !== i)
        .sort((a, b) => {
          const distA = Math.hypot(a.x - pos.x, a.y - pos.y);
          const distB = Math.hypot(b.x - pos.x, b.y - pos.y);
          return distA - distB;
        })
        .slice(0, 1);

      nearby.forEach(other => {
        ctx.beginPath();
        // Organic curved lines
        const midX = (pos.x + other.x) / 2 + (Math.random() - 0.5) * 15;
        const midY = (pos.y + other.y) / 2 + (Math.random() - 0.5) * 15;
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

      // Draw subtle outer glow
      const gradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2);
      gradient.addColorStop(0, `${color}10`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);

      // Draw filled circle with soft edges
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `${color}15`;
      ctx.fill();
      ctx.strokeStyle = `${color}60`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Small center dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `${color}90`;
      ctx.fill();

      // Draw small marks for count (like data-humanism style)
      if (keyword.count > 1) {
        const dotCount = Math.min(keyword.count, 4);
        for (let i = 0; i < dotCount; i++) {
          const dotAngle = (i / dotCount) * Math.PI * 2 - Math.PI / 2;
          const dotDistance = radius * 0.6;
          const dotX = x + Math.cos(dotAngle) * dotDistance;
          const dotY = y + Math.sin(dotAngle) * dotDistance;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${color}50`;
          ctx.fill();
        }
      }

      // Draw keyword text - refined typography
      ctx.fillStyle = '#5C5147';
      ctx.font = `${9 + (radius - 6) * 0.2}px "Crimson Pro", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position text below the circle
      ctx.fillText(keyword.keyword, x, y + radius + 14);
    });

    // Draw center focal point - subtle anchor
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#B39B7A';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(179, 155, 122, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw tagline at top - more breathing room
    ctx.fillStyle = '#7A6B5F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, centerX, 28);

  }, [keywords, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
