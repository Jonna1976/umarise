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

    // Background
    ctx.fillStyle = '#FAF8F5';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.35;

    // Create node positions
    const nodes: { x: number; y: number; label: string; type: 'keyword' | 'tension' | 'superpower' }[] = [];

    // Center: superpower
    nodes.push({ x: centerX, y: centerY, label: data.superpower, type: 'superpower' });

    // Tension poles on opposite sides
    nodes.push({ 
      x: centerX - maxRadius * 0.8, 
      y: centerY, 
      label: data.tensionA, 
      type: 'tension' 
    });
    nodes.push({ 
      x: centerX + maxRadius * 0.8, 
      y: centerY, 
      label: data.tensionB, 
      type: 'tension' 
    });

    // Keywords in a circle around center
    const keywordCount = Math.min(data.keywords.length, 8);
    data.keywords.slice(0, keywordCount).forEach((keyword, i) => {
      const angle = (i / keywordCount) * Math.PI * 2 - Math.PI / 2;
      const distance = maxRadius * 0.6;
      nodes.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        label: keyword,
        type: 'keyword'
      });
    });

    // Draw connections first (behind nodes)
    nodes.forEach((node, i) => {
      if (node.type === 'superpower') return;

      // Connect to center
      ctx.beginPath();
      const cp1x = (node.x + centerX) / 2 + (Math.random() - 0.5) * 20;
      const cp1y = (node.y + centerY) / 2 + (Math.random() - 0.5) * 20;
      ctx.moveTo(node.x, node.y);
      ctx.quadraticCurveTo(cp1x, cp1y, centerX, centerY);
      
      if (node.type === 'tension') {
        ctx.strokeStyle = 'rgba(184, 92, 56, 0.3)';
        ctx.lineWidth = 2;
        // Dashed line for tension
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = 'rgba(139, 115, 85, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Connect keywords to nearby keywords (web effect)
      if (node.type === 'keyword') {
        const nextIdx = (i + 1) % nodes.length;
        const nextNode = nodes[nextIdx];
        if (nextNode && nextNode.type === 'keyword') {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nextNode.x, nextNode.y);
          ctx.strokeStyle = 'rgba(139, 115, 85, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });

    // Draw tension line (the pull between two sides)
    ctx.beginPath();
    ctx.moveTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.strokeStyle = 'rgba(184, 92, 56, 0.15)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Draw nodes
    nodes.forEach(node => {
      let radius = 20;
      let fillColor = 'rgba(139, 115, 85, 0.1)';
      let strokeColor = '#8B7355';
      let textColor = '#5C4A32';
      let fontSize = 9;

      if (node.type === 'superpower') {
        radius = 35;
        fillColor = 'rgba(201, 162, 39, 0.2)';
        strokeColor = '#C9A227';
        fontSize = 10;
      } else if (node.type === 'tension') {
        radius = 25;
        fillColor = 'rgba(184, 92, 56, 0.1)';
        strokeColor = '#B85C38';
        fontSize = 9;
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = node.type === 'superpower' ? 3 : 2;
      ctx.stroke();

      // Draw small decorative dots (data-humanism style)
      if (node.type === 'keyword') {
        const dotCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < dotCount; i++) {
          const angle = (i / dotCount) * Math.PI * 2;
          const dotX = node.x + Math.cos(angle) * (radius - 5);
          const dotY = node.y + Math.sin(angle) * (radius - 5);
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${strokeColor}60`;
          ctx.fill();
        }
      }

      // Draw label
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px "Crimson Pro", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Word wrap for longer labels
      const maxWidth = radius * 1.6;
      const words = node.label.split(' ');
      if (words.length > 2 && node.type !== 'keyword') {
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        ctx.fillText(line1, node.x, node.y - 5);
        ctx.fillText(line2, node.x, node.y + 7);
      } else {
        ctx.fillText(node.label.slice(0, 12), node.x, node.y);
      }
    });

    // Draw tension arrows
    const arrowSize = 6;
    [nodes[1], nodes[2]].forEach((tensionNode, i) => {
      const toCenter = i === 0 ? 1 : -1;
      const arrowX = tensionNode.x + toCenter * 35;
      const arrowY = tensionNode.y;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - toCenter * arrowSize, arrowY - arrowSize);
      ctx.lineTo(arrowX - toCenter * arrowSize, arrowY + arrowSize);
      ctx.closePath();
      ctx.fillStyle = 'rgba(184, 92, 56, 0.4)';
      ctx.fill();
    });

    // Legend
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('← tension field →', centerX, height - 40);

    // Tagline
    ctx.fillStyle = '#6B5B4F';
    ctx.font = 'italic 11px "Crimson Pro", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${tagline}"`, centerX, 25);

  }, [data, tagline, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width, height }}
      className="rounded-xl"
    />
  );
}
