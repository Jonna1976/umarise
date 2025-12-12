import { useEffect, useRef } from 'react';

interface Driver {
  name: string;
  description: string;
  strength: string;
}

interface ThemeCirclesProps {
  drivers: Driver[];
  superpower: string;
  tagline: string;
  width?: number;
  height?: number;
}

// Refined earthy palette - no INSIGHTS primary colors
const STRENGTH_COLORS: Record<string, { fill: string; stroke: string }> = {
  high: { fill: 'rgba(179, 155, 122, 0.15)', stroke: '#9B8A6A' },
  medium: { fill: 'rgba(155, 107, 90, 0.12)', stroke: '#9B6B5A' },
  emerging: { fill: 'rgba(122, 138, 138, 0.08)', stroke: '#7A8A8A' }
};

export function ThemeCircles({ 
  drivers, 
  superpower,
  tagline,
  width = 400, 
  height = 400 
}: ThemeCirclesProps) {
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

    // Background - warm paper
    ctx.fillStyle = '#FDFBF8';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 + 10;

    // Draw concentric rings - more refined spacing
    const maxRadius = Math.min(width, height) * 0.35;
    const ringCount = drivers.length;
    const ringSpacing = maxRadius / (ringCount + 1.5);

    // Draw rings from outside in
    drivers.forEach((driver, index) => {
      const radius = maxRadius - index * ringSpacing;
      const colors = STRENGTH_COLORS[driver.strength] || STRENGTH_COLORS.emerging;

      // Draw main ring - thinner stroke
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = `${colors.stroke}60`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Subtle decorative marks (Lupi-style) - fewer, more refined
      const markCount = 6 + index * 2;
      for (let i = 0; i < markCount; i++) {
        const angle = (i / markCount) * Math.PI * 2;
        const innerR = radius - 2;
        const outerR = radius + 2;
        
        // Deterministic mark placement based on index
        if ((i + index) % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(
            centerX + Math.cos(angle) * innerR,
            centerY + Math.sin(angle) * innerR
          );
          ctx.lineTo(
            centerX + Math.cos(angle) * outerR,
            centerY + Math.sin(angle) * outerR
          );
          ctx.strokeStyle = `${colors.stroke}25`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }

      // Draw driver name - refined positioning with larger text
      const labelAngle = -Math.PI / 2 + (index * Math.PI) / 5;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 18);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 18);

      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(labelAngle + Math.PI / 2);
      ctx.fillStyle = colors.stroke;
      ctx.font = 'bold 13px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(driver.name.toLowerCase(), 0, 0);
      ctx.restore();
    });

    // Draw center circle (superpower) - more refined
    const centerRadius = ringSpacing * 0.7;
    
    // Subtle glow effect
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerRadius * 1.8
    );
    gradient.addColorStop(0, 'rgba(179, 155, 122, 0.15)');
    gradient.addColorStop(1, 'rgba(179, 155, 122, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(179, 155, 122, 0.12)';
    ctx.fill();
    ctx.strokeStyle = '#9B8A6A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Simple star/flower pattern in center - more organic
    const petalCount = 5;
    ctx.beginPath();
    for (let i = 0; i < petalCount * 2; i++) {
      const angle = (i / (petalCount * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? centerRadius * 0.55 : centerRadius * 0.25;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(179, 155, 122, 0.25)';
    ctx.fill();

    // Superpower text in center - larger and bolder
    ctx.fillStyle = '#4A4039';
    ctx.font = 'bold 14px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Simple word wrap
    const words = superpower.split(' ').slice(0, 3);
    const lineHeight = 16;
    const startY = centerY - ((words.length - 1) * lineHeight) / 2;
    words.forEach((word, i) => {
      ctx.fillText(word, centerX, startY + i * lineHeight);
    });

    // Draw strength legend - larger and clearer
    const legendY = height - 32;
    const strengths = ['high', 'medium', 'emerging'];
    const legendX = (width - strengths.length * 85) / 2;

    strengths.forEach((strength, i) => {
      const x = legendX + i * 85;
      const colors = STRENGTH_COLORS[strength];

      ctx.beginPath();
      ctx.arc(x, legendY, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#5C5147';
      ctx.font = '12px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(strength, x + 12, legendY + 4);
    });

    // Tagline at top - larger and more prominent
    ctx.fillStyle = '#5C5147';
    ctx.font = 'italic 16px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, centerX, 32);
    
    // Secondary label below tagline
    ctx.fillStyle = '#9B8A6A';
    ctx.font = '11px "Crimson Pro", Georgia, serif';
    ctx.fillText(drivers[0]?.name?.toLowerCase() || '', centerX, 50);

  }, [drivers, superpower, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
