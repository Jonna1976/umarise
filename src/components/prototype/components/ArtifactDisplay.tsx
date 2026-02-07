import { motion } from 'framer-motion';

/**
 * ArtifactDisplay - renders the actual artifact image or a placeholder
 * 
 * When imageUrl is provided, displays the real captured content.
 * Otherwise, shows a stylized placeholder based on artifact type.
 */

interface ArtifactDisplayProps {
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  imageUrl?: string;
}

export function ArtifactDisplay({ type, imageUrl }: ArtifactDisplayProps) {
  // Show actual image when available
  if (imageUrl) {
    return (
      <motion.div
        className="w-full h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={imageUrl}
          alt="Artifact"
          className="w-full h-full object-contain"
          draggable={false}
        />
        {/* Subtle vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.3)',
          }}
        />
      </motion.div>
    );
  }

  // Fallback to placeholder based on type
  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #2D1B0E, #1A2E1A, #1B1B2E)',
      }}
    >
      {/* Placeholder content based on type */}
      {type === 'warm' && <WarmArtifact />}
      {type === 'text' && <TextArtifact />}
      {type === 'sound' && <SoundArtifact />}
      {type === 'digital' && <DigitalArtifact />}
      {type === 'organic' && <OrganicArtifact />}
      {type === 'sketch' && <SketchArtifact />}
    </div>
  );
}

function WarmArtifact() {
  return (
    <svg width="180" height="130" viewBox="0 0 180 140">
      {/* Sun */}
      <circle cx="145" cy="30" r="14" fill="none" stroke="hsl(var(--ritual-yellow-accent))" strokeWidth="2.5" opacity="0.8"/>
      <line x1="145" y1="10" x2="147" y2="3" stroke="hsl(var(--ritual-yellow-accent))" strokeWidth="2" opacity="0.6"/>
      <line x1="160" y1="22" x2="167" y2="18" stroke="hsl(var(--ritual-yellow-accent))" strokeWidth="2" opacity="0.6"/>
      <line x1="163" y1="35" x2="170" y2="38" stroke="hsl(var(--ritual-yellow-accent))" strokeWidth="2" opacity="0.6"/>
      {/* House */}
      <path d="M30 70L30 115 90 115 90 70" fill="none" stroke="hsl(var(--ritual-gold))" strokeWidth="2.5"/>
      <path d="M25 72L60 42 95 72" fill="none" stroke="hsl(var(--ritual-red-accent))" strokeWidth="3"/>
      <rect x="50" y="88" width="18" height="27" rx="2" fill="none" stroke="hsl(var(--ritual-gold))" strokeWidth="2"/>
      {/* Figure */}
      <circle cx="120" cy="82" r="8" fill="none" stroke="hsl(var(--ritual-red-soft))" strokeWidth="2"/>
      <path d="M120 90L120 112" stroke="hsl(var(--ritual-red-soft))" strokeWidth="2"/>
      <path d="M120 97L110 105" stroke="hsl(var(--ritual-red-soft))" strokeWidth="2"/>
      <path d="M120 97L130 104" stroke="hsl(var(--ritual-red-soft))" strokeWidth="2"/>
      <path d="M120 112L112 125" stroke="hsl(var(--ritual-red-soft))" strokeWidth="2"/>
      <path d="M120 112L128 124" stroke="hsl(var(--ritual-red-soft))" strokeWidth="2"/>
      {/* Ground */}
      <path d="M10 120Q45 118 90 120Q130 122 170 119" fill="none" stroke="hsl(var(--ritual-green-accent))" strokeWidth="2" opacity="0.5"/>
    </svg>
  );
}

function TextArtifact() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <line x1="14" y1="18" x2="66" y2="18" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25"/>
      <line x1="14" y1="27" x2="58" y2="27" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.2"/>
      <line x1="14" y1="36" x2="63" y2="36" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25"/>
      <line x1="14" y1="45" x2="42" y2="45" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18"/>
      <line x1="14" y1="56" x2="60" y2="56" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.22"/>
      <line x1="14" y1="65" x2="48" y2="65" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18"/>
    </svg>
  );
}

function SoundArtifact() {
  return (
    <svg width="62" height="34" viewBox="0 0 80 55">
      <line x1="8" y1="28" x2="8" y2="27" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/>
      <line x1="13" y1="24" x2="13" y2="31" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
      <line x1="18" y1="18" x2="18" y2="37" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.35" strokeLinecap="round"/>
      <line x1="23" y1="22" x2="23" y2="33" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
      <line x1="28" y1="12" x2="28" y2="43" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
      <line x1="33" y1="20" x2="33" y2="35" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
      <line x1="38" y1="15" x2="38" y2="40" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.35" strokeLinecap="round"/>
      <line x1="43" y1="22" x2="43" y2="33" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/>
      <line x1="53" y1="20" x2="53" y2="35" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"/>
      <line x1="58" y1="16" x2="58" y2="39" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.35" strokeLinecap="round"/>
    </svg>
  );
}

function DigitalArtifact() {
  return (
    <svg width="110" height="110" viewBox="0 0 130 130">
      <text x="12" y="25" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="hsl(var(--ritual-blue-accent))" opacity="0.3">&lt;html&gt;</text>
      <text x="20" y="38" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="hsl(var(--ritual-blue-accent))" opacity="0.25">&lt;head&gt;</text>
      <text x="28" y="51" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="hsl(var(--ritual-red-soft))" opacity="0.25">&lt;title&gt;</text>
      <text x="28" y="64" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="hsl(var(--ritual-gold))" opacity="0.2">hello world</text>
      <text x="28" y="77" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="hsl(var(--ritual-red-soft))" opacity="0.25">&lt;/title&gt;</text>
      <text x="12" y="103" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="hsl(var(--ritual-blue-accent))" opacity="0.3">&lt;body&gt;</text>
    </svg>
  );
}

function OrganicArtifact() {
  return (
    <svg width="195" height="68" viewBox="0 0 220 90">
      <circle cx="40" cy="45" r="16" fill="none" stroke="hsl(var(--ritual-yellow-accent))" strokeWidth="1" opacity="0.22"/>
      <circle cx="110" cy="35" r="12" fill="none" stroke="hsl(var(--ritual-blue-accent))" strokeWidth="1" opacity="0.22"/>
      <circle cx="175" cy="50" r="18" fill="none" stroke="hsl(var(--ritual-red-soft))" strokeWidth="1" opacity="0.22"/>
      <line x1="56" y1="42" x2="98" y2="37" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.18"/>
      <line x1="122" y1="38" x2="157" y2="47" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.18"/>
      <text x="33" y="48" fontFamily="'EB Garamond', serif" fontSize="5" fill="hsl(var(--ritual-yellow-accent))" opacity="0.12">start</text>
    </svg>
  );
}

function SketchArtifact() {
  return (
    <svg width="120" height="72" viewBox="0 0 140 95">
      <rect x="20" y="30" width="40" height="50" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1.5" opacity="0.35"/>
      <rect x="65" y="15" width="55" height="65" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1.5" opacity="0.3"/>
      <line x1="65" y1="15" x2="92" y2="5" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1" opacity="0.25"/>
      <line x1="120" y1="15" x2="92" y2="5" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1" opacity="0.25"/>
      <rect x="75" y="40" width="12" height="12" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.2"/>
      <rect x="95" y="40" width="12" height="12" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.2"/>
    </svg>
  );
}
