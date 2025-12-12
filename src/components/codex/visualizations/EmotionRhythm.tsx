import { useEffect, useRef } from 'react';

interface ToneEntry {
  date: string;
  tone: string;
}

interface EmotionRhythmProps {
  tones: ToneEntry[];
  tagline: string;
  width?: number;
  height?: number;
}

// Refined Lupi-style palette - earthy, warm tones
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

export function EmotionRhythm({ 
  tones, 
  tagline,
  width = 400, 
  height = 400 
}: EmotionRhythmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background - warm paper tone
    ctx.fillStyle = '#FDFBF8';
    ctx.fillRect(0, 0, width, height);

    const padding = 50; // More whitespace
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2 - 50;
    const centerY = padding + graphHeight / 2 + 20;

    // Sort by date
    const sortedTones = [...tones].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sortedTones.length === 0) return;

    // Draw subtle horizontal baseline
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.strokeStyle = 'rgba(139, 123, 107, 0.12)';
    ctx.lineWidth = 0.75;
    ctx.stroke();

    // Calculate positions
    const stepX = graphWidth / Math.max(sortedTones.length - 1, 1);

    // Tone intensity mapping
    const toneIntensity: Record<string, number> = {
      excited: 0.85,
      frustrated: 0.75,
      overwhelmed: 0.7,
      determined: 0.65,
      hopeful: 0.55,
      playful: 0.5,
      curious: 0.45,
      focused: 0.4,
      reflective: 0.3,
      calm: 0.2,
      anxious: 0.55,
      default: 0.35
    };

    // Calculate all positions first (deterministic based on index for consistency)
    const positions = sortedTones.map((entry, i) => {
      const x = padding + i * stepX;
      const intensity = toneIntensity[entry.tone] || toneIntensity.default;
      // Use index-based variation instead of random for reproducibility
      const variation = Math.sin(i * 0.7) * 8;
      const y = centerY - intensity * (graphHeight / 2 - 25) + variation;
      return { x, y, entry };
    });

    // Draw flowing wave line connecting all points
    ctx.beginPath();
    positions.forEach((pos, i) => {
      if (i === 0) {
        ctx.moveTo(pos.x, pos.y);
      } else {
        const prevPos = positions[i - 1];
        const cpX = (prevPos.x + pos.x) / 2;
        ctx.quadraticCurveTo(cpX, prevPos.y, pos.x, pos.y);
      }
    });
    ctx.strokeStyle = 'rgba(139, 123, 107, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw individual tone markers
    positions.forEach((pos, i) => {
      const { x, y, entry } = pos;
      const intensity = toneIntensity[entry.tone] || toneIntensity.default;
      const color = TONE_COLORS[entry.tone] || TONE_COLORS.default;

      // Draw vertical stem - thin, elegant
      ctx.beginPath();
      ctx.moveTo(x, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `${color}35`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw tone circle - refined size
      const radius = 5 + intensity * 5;
      
      // Subtle glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, `${color}12`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);

      // Main circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `${color}20`;
      ctx.fill();
      ctx.strokeStyle = `${color}70`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `${color}90`;
      ctx.fill();

      // Date label (every 4th or first/last)
      if (i === 0 || i === positions.length - 1 || i % 4 === 0) {
        const date = new Date(entry.date);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
        ctx.fillStyle = '#9A9A9A';
        ctx.font = '8px "Crimson Pro", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, centerY + 18);
      }
    });

    // Draw legend - minimal, refined
    const uniqueTones = [...new Set(sortedTones.map(t => t.tone))];
    const legendY = height - 28;
    const maxLegendItems = Math.min(uniqueTones.length, 4);
    const legendStartX = (width - maxLegendItems * 65) / 2;

    uniqueTones.slice(0, maxLegendItems).forEach((tone, i) => {
      const x = legendStartX + i * 65;
      const color = TONE_COLORS[tone] || TONE_COLORS.default;

      // Small circle
      ctx.beginPath();
      ctx.arc(x, legendY, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = '#7A6B5F';
      ctx.font = '8px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(tone, x + 7, legendY + 2);
    });

    // Tagline at top
    ctx.fillStyle = '#7A6B5F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, width / 2, 28);

  }, [tones, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
