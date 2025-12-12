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

const STRENGTH_COLORS: Record<string, { fill: string; stroke: string }> = {
  high: { fill: 'rgba(201, 162, 39, 0.2)', stroke: '#C9A227' },
  medium: { fill: 'rgba(184, 92, 56, 0.15)', stroke: '#B85C38' },
  emerging: { fill: 'rgba(107, 126, 122, 0.1)', stroke: '#6B7E7A' }
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

    // Background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw concentric rings for each driver
    const maxRadius = Math.min(width, height) * 0.4;
    const ringCount = drivers.length;
    const ringSpacing = maxRadius / (ringCount + 1);

    // Draw rings from outside in
    drivers.forEach((driver, index) => {
      const radius = maxRadius - index * ringSpacing;
      const colors = STRENGTH_COLORS[driver.strength] || STRENGTH_COLORS.emerging;

      // Draw main ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Add small decorative marks around the ring (data-humanism style)
      const markCount = 8 + index * 4;
      for (let i = 0; i < markCount; i++) {
        const angle = (i / markCount) * Math.PI * 2;
        const innerR = radius - 4;
        const outerR = radius + 4;
        
        // Only draw some marks (creates variation)
        if (Math.random() > 0.4) {
          ctx.beginPath();
          ctx.moveTo(
            centerX + Math.cos(angle) * innerR,
            centerY + Math.sin(angle) * innerR
          );
          ctx.lineTo(
            centerX + Math.cos(angle) * outerR,
            centerY + Math.sin(angle) * outerR
          );
          ctx.strokeStyle = `${colors.stroke}40`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw driver name along a path (simplified: just at the edge)
      const labelAngle = -Math.PI / 2 + (index * Math.PI) / 6;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 15);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 15);

      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(labelAngle + Math.PI / 2);
      ctx.fillStyle = colors.stroke;
      ctx.font = '10px "Crimson Pro", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(driver.name.toUpperCase(), 0, 0);
      ctx.restore();
    });

    // Draw center circle (superpower)
    const centerRadius = ringSpacing * 0.8;
    
    // Glow effect
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, centerRadius * 1.5
    );
    gradient.addColorStop(0, 'rgba(201, 162, 39, 0.3)');
    gradient.addColorStop(1, 'rgba(201, 162, 39, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(201, 162, 39, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#C9A227';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Star pattern in center
    const starPoints = 6;
    ctx.beginPath();
    for (let i = 0; i < starPoints * 2; i++) {
      const angle = (i / (starPoints * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? centerRadius * 0.6 : centerRadius * 0.3;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(201, 162, 39, 0.4)';
    ctx.fill();

    // Superpower text in center (wrapped)
    ctx.fillStyle = '#5C4A32';
    ctx.font = 'bold 10px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Simple word wrap
    const words = superpower.split(' ').slice(0, 4);
    const lineHeight = 12;
    const startY = centerY - ((words.length - 1) * lineHeight) / 2;
    words.forEach((word, i) => {
      ctx.fillText(word, centerX, startY + i * lineHeight);
    });

    // Draw strength legend
    const legendY = height - 30;
    const strengths = ['high', 'medium', 'emerging'];
    const legendX = (width - strengths.length * 70) / 2;

    strengths.forEach((strength, i) => {
      const x = legendX + i * 70;
      const colors = STRENGTH_COLORS[strength];

      ctx.beginPath();
      ctx.arc(x, legendY, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#6B5B4F';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(strength, x + 10, legendY + 3);
    });

    // Tagline at top
    ctx.fillStyle = '#6B5B4F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, centerX, 25);

  }, [drivers, superpower, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
