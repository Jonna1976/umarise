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

const TONE_COLORS: Record<string, string> = {
  focused: '#4A7C59',
  hopeful: '#C9A227',
  frustrated: '#B85C38',
  playful: '#7B68EE',
  overwhelmed: '#6B7280',
  reflective: '#5B8FB9',
  determined: '#8B4513',
  curious: '#DAA520',
  anxious: '#9CA3AF',
  excited: '#E07B39',
  calm: '#6B8E7A',
  default: '#8B7355'
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

    // Background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2 - 40; // Extra space for legend
    const centerY = padding + graphHeight / 2;

    // Sort by date
    const sortedTones = [...tones].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (sortedTones.length === 0) return;

    // Draw horizontal baseline
    ctx.beginPath();
    ctx.moveTo(padding, centerY);
    ctx.lineTo(width - padding, centerY);
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Calculate positions
    const stepX = graphWidth / Math.max(sortedTones.length - 1, 1);

    // Draw rhythm wave with varying heights based on tone "intensity"
    const toneIntensity: Record<string, number> = {
      excited: 0.9,
      frustrated: 0.8,
      overwhelmed: 0.75,
      determined: 0.7,
      hopeful: 0.6,
      playful: 0.55,
      curious: 0.5,
      focused: 0.45,
      reflective: 0.35,
      calm: 0.25,
      anxious: 0.6,
      default: 0.4
    };

    // Calculate all positions first
    const positions = sortedTones.map((entry, i) => {
      const x = padding + i * stepX;
      const intensity = toneIntensity[entry.tone] || toneIntensity.default;
      const yOffset = (Math.random() - 0.5) * 10;
      const y = centerY - intensity * (graphHeight / 2 - 20) + yOffset;
      return { x, y, entry };
    });

    // Draw smooth wave line connecting all points
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
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw individual tone markers
    positions.forEach((pos, i) => {
      const { x, y, entry } = pos;
      const intensity = toneIntensity[entry.tone] || toneIntensity.default;
      const color = TONE_COLORS[entry.tone] || TONE_COLORS.default;

      // Draw vertical stem (like data-humanism)
      ctx.beginPath();
      ctx.moveTo(x, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `${color}60`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw tone circle
      const radius = 8 + intensity * 6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `${color}30`;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Date label (every 3rd or first/last)
      if (i === 0 || i === positions.length - 1 || i % 3 === 0) {
        const date = new Date(entry.date);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dateStr, x, centerY + 20);
      }
    });

    // Draw legend
    const uniqueTones = [...new Set(sortedTones.map(t => t.tone))];
    const legendY = height - 25;
    const legendStartX = (width - uniqueTones.length * 60) / 2;

    uniqueTones.slice(0, 5).forEach((tone, i) => {
      const x = legendStartX + i * 60;
      const color = TONE_COLORS[tone] || TONE_COLORS.default;

      // Small circle
      ctx.beginPath();
      ctx.arc(x, legendY, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = '#6B5B4F';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(tone, x + 8, legendY + 3);
    });

    // Tagline
    ctx.fillStyle = '#6B5B4F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, width / 2, padding - 15);

  }, [tones, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
