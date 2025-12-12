import { useEffect, useRef } from 'react';

interface ConnectionData {
  keywords: string[];
  tensionA: string;
  tensionB: string;
  superpower: string;
}

interface ConnectionMapProps {
  data: ConnectionData;
  tagline: string;
  width?: number;
  height?: number;
}

export function ConnectionMap({ 
  data, 
  tagline,
  width = 400, 
  height = 400 
}: ConnectionMapProps) {
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
    const maxRadius = Math.min(width, height) * 0.32;

    // Create node positions
    const nodes: { x: number; y: number; label: string; type: 'keyword' | 'tension' | 'superpower' }[] = [];

    // Center: superpower
    nodes.push({ x: centerX, y: centerY, label: data.superpower, type: 'superpower' });

    // Tension poles on opposite sides
    nodes.push({ 
      x: centerX - maxRadius * 0.85, 
      y: centerY, 
      label: data.tensionA, 
      type: 'tension' 
    });
    nodes.push({ 
      x: centerX + maxRadius * 0.85, 
      y: centerY, 
      label: data.tensionB, 
      type: 'tension' 
    });

    // Keywords in a circle around center
    const keywordCount = Math.min(data.keywords.length, 6);
    data.keywords.slice(0, keywordCount).forEach((keyword, i) => {
      const angle = (i / keywordCount) * Math.PI * 2 - Math.PI / 2;
      const distance = maxRadius * 0.55;
      nodes.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        label: keyword,
        type: 'keyword'
      });
    });

    // Draw connections first (behind nodes) - more refined curves
    nodes.forEach((node, i) => {
      if (node.type === 'superpower') return;

      // Connect to center with organic curves
      ctx.beginPath();
      const variation = Math.sin(i * 1.5) * 15;
      const cp1x = (node.x + centerX) / 2 + variation;
      const cp1y = (node.y + centerY) / 2 + variation * 0.5;
      ctx.moveTo(node.x, node.y);
      ctx.quadraticCurveTo(cp1x, cp1y, centerX, centerY);
      
      if (node.type === 'tension') {
        ctx.strokeStyle = 'rgba(155, 107, 90, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
      } else {
        ctx.strokeStyle = 'rgba(139, 123, 107, 0.12)';
        ctx.lineWidth = 0.75;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Connect keywords to nearby keywords (subtle web effect)
      if (node.type === 'keyword') {
        const nextIdx = (i + 1) % nodes.length;
        const nextNode = nodes[nextIdx];
        if (nextNode && nextNode.type === 'keyword') {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nextNode.x, nextNode.y);
          ctx.strokeStyle = 'rgba(139, 123, 107, 0.06)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    // Draw tension gradient line (subtle)
    const tensionGradient = ctx.createLinearGradient(nodes[1].x, nodes[1].y, nodes[2].x, nodes[2].y);
    tensionGradient.addColorStop(0, 'rgba(155, 107, 90, 0.12)');
    tensionGradient.addColorStop(0.5, 'rgba(155, 107, 90, 0.06)');
    tensionGradient.addColorStop(1, 'rgba(155, 107, 90, 0.12)');
    
    ctx.beginPath();
    ctx.moveTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.strokeStyle = tensionGradient;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw nodes
    nodes.forEach(node => {
      let radius = 16;
      let fillColor = 'rgba(139, 123, 107, 0.08)';
      let strokeColor = '#8B7B6B';
      let textColor = '#5C5147';
      let fontSize = 8;

      if (node.type === 'superpower') {
        radius = 28;
        fillColor = 'rgba(179, 155, 122, 0.12)';
        strokeColor = '#9B8A6A';
        fontSize = 9;
      } else if (node.type === 'tension') {
        radius = 20;
        fillColor = 'rgba(155, 107, 90, 0.08)';
        strokeColor = '#9B6B5A';
        fontSize = 8;
      }

      // Subtle glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 1.5);
      gradient.addColorStop(0, `${strokeColor}10`);
      gradient.addColorStop(1, `${strokeColor}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = `${strokeColor}70`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Small decorative marks for keywords
      if (node.type === 'keyword') {
        const markCount = 3;
        for (let i = 0; i < markCount; i++) {
          const angle = (i / markCount) * Math.PI * 2 + 0.2;
          const dotX = node.x + Math.cos(angle) * (radius - 4);
          const dotY = node.y + Math.sin(angle) * (radius - 4);
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
          ctx.fillStyle = `${strokeColor}40`;
          ctx.fill();
        }
      }

      // Draw label
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px "Crimson Pro", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Word wrap for longer labels
      const maxWidth = radius * 1.4;
      const words = node.label.split(' ');
      if (words.length > 2 && node.type !== 'keyword') {
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        ctx.fillText(line1, node.x, node.y - 4);
        ctx.fillText(line2, node.x, node.y + 6);
      } else {
        ctx.fillText(node.label.slice(0, 10), node.x, node.y);
      }
    });

    // Draw subtle tension arrows
    const arrowSize = 4;
    [nodes[1], nodes[2]].forEach((tensionNode, i) => {
      const toCenter = i === 0 ? 1 : -1;
      const arrowX = tensionNode.x + toCenter * 28;
      const arrowY = tensionNode.y;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - toCenter * arrowSize, arrowY - arrowSize);
      ctx.lineTo(arrowX - toCenter * arrowSize, arrowY + arrowSize);
      ctx.closePath();
      ctx.fillStyle = 'rgba(155, 107, 90, 0.25)';
      ctx.fill();
    });

    // Legend - minimal
    ctx.fillStyle = '#9A9A9A';
    ctx.font = '8px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('← tension field →', centerX, height - 30);

    // Tagline
    ctx.fillStyle = '#7A6B5F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, centerX, 28);

  }, [data, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
