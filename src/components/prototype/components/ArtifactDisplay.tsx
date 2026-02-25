import { motion } from 'framer-motion';

interface ArtifactDisplayProps {
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  imageUrl?: string;
  mimeType?: string;
  fileName?: string;
}

function isImageMime(mimeType?: string): boolean {
  if (!mimeType) return true;
  return mimeType.startsWith('image/');
}

function isAudioMime(mimeType?: string): boolean {
  return mimeType?.startsWith('audio/') ?? false;
}

export function ArtifactDisplay({ type, imageUrl, mimeType, fileName }: ArtifactDisplayProps) {
  if (imageUrl && !isImageMime(mimeType)) {
    if (isAudioMime(mimeType)) return <AudioArtifactIcon fileName={fileName} />;
    return <DocumentArtifactIcon fileName={fileName} />;
  }

  if (imageUrl) {
    return (
      <motion.div className="w-full h-full relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <img src={imageUrl} alt="Artifact" className="w-full h-full object-contain" draggable={false} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.3)' }} />
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2D1B0E, #1A2E1A, #1B1B2E)' }}>
      {type === 'warm' && <WarmArtifact />}
      {type === 'text' && <TextArtifact />}
      {type === 'sound' && <SoundArtifact />}
      {type === 'digital' && <DigitalArtifact />}
      {type === 'organic' && <OrganicArtifact />}
      {type === 'sketch' && <SketchArtifact />}
    </div>
  );
}

function DocumentArtifactIcon({ fileName }: { fileName?: string }) {
  return (
    <motion.div className="w-full h-full flex flex-col items-center justify-center gap-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
      <div className="relative">
        <svg width="64" height="80" viewBox="0 0 64 80" fill="none">
          <path d="M4 4 L44 4 L60 20 L60 76 L4 76 Z" stroke="hsl(var(--ritual-gold))" strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M44 4 L44 20 L60 20" stroke="hsl(var(--ritual-gold))" strokeWidth="1.2" fill="none" opacity="0.35" />
          <line x1="14" y1="34" x2="46" y2="34" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.2" />
          <line x1="14" y1="42" x2="40" y2="42" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.15" />
          <line x1="14" y1="50" x2="44" y2="50" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.2" />
          <line x1="14" y1="58" x2="32" y2="58" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.12" />
        </svg>
      </div>
      {fileName && (
        <p className="font-mono text-[22px] tracking-[1px] max-w-[180px] truncate text-center" style={{ color: 'hsl(var(--ritual-gold))', opacity: 0.35 }}>
          {fileName}
        </p>
      )}
    </motion.div>
  );
}

function AudioArtifactIcon({ fileName }: { fileName?: string }) {
  const bars = [8, 16, 28, 20, 36, 24, 32, 18, 26, 14, 22, 30, 16, 10];
  return (
    <motion.div className="w-full h-full flex flex-col items-center justify-center gap-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
      <div className="flex items-center gap-[3px] h-[48px]">
        {bars.map((height, i) => (
          <motion.div key={i} className="rounded-full" style={{ width: 3, height, background: 'hsl(var(--ritual-gold))', opacity: 0.3 + (height / 80) }}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.4, delay: i * 0.04 }} />
        ))}
      </div>
      {fileName && (
        <p className="font-mono text-[22px] tracking-[1px] max-w-[180px] truncate text-center" style={{ color: 'hsl(var(--ritual-gold))', opacity: 0.35 }}>
          {fileName}
        </p>
      )}
    </motion.div>
  );
}

function WarmArtifact() {
  return (
    <svg width="180" height="140" viewBox="0 0 180 140">
      <rect x="3" y="3" width="174" height="134" rx="2" fill="#F5F0E6" opacity="0.04" />
      <circle cx="145" cy="30" r="16" fill="none" stroke="#E8C547" strokeWidth="2.2" opacity="0.35" strokeLinecap="round" />
      <line x1="145" y1="10" x2="145" y2="14" stroke="#E8C547" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <line x1="145" y1="46" x2="145" y2="50" stroke="#E8C547" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <line x1="125" y1="30" x2="129" y2="30" stroke="#E8C547" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <line x1="161" y1="30" x2="165" y2="30" stroke="#E8C547" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <line x1="131" y1="16" x2="134" y2="19" stroke="#E8C547" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="156" y1="41" x2="159" y2="44" stroke="#E8C547" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="131" y1="44" x2="134" y2="41" stroke="#E8C547" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="156" y1="19" x2="159" y2="16" stroke="#E8C547" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <path d="M30 105 L50 65 L70 105Z" fill="none" stroke="#E87070" strokeWidth="2" opacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="44" y="85" width="12" height="20" fill="none" stroke="#6BA3D6" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <rect x="34" y="75" width="8" height="8" fill="none" stroke="#6BA3D6" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <rect x="58" y="75" width="8" height="8" fill="none" stroke="#6BA3D6" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <path d="M15 105 C15 105, 25 108, 40 105 C55 102, 70 108, 85 105 C100 102, 115 108, 130 105 C145 102, 160 107, 170 105" fill="none" stroke="#8BAA8B" strokeWidth="1.8" opacity="0.2" strokeLinecap="round" />
      <line x1="100" y1="105" x2="100" y2="70" stroke="#8BAA8B" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <circle cx="100" cy="60" r="10" fill="none" stroke="#E87070" strokeWidth="1.8" opacity="0.25" strokeLinecap="round" />
      <circle cx="96" cy="57" r="1.5" fill="#E87070" opacity="0.15" />
      <circle cx="104" cy="57" r="1.5" fill="#E87070" opacity="0.15" />
      <path d="M95 63 C97 66, 103 66, 105 63" fill="none" stroke="#E87070" strokeWidth="1" opacity="0.18" strokeLinecap="round" />
      <line x1="90" y1="80" x2="80" y2="72" stroke="#8BAA8B" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="110" y1="80" x2="120" y2="72" stroke="#8BAA8B" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="95" y1="105" x2="88" y2="120" stroke="#8BAA8B" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <line x1="105" y1="105" x2="112" y2="120" stroke="#8BAA8B" strokeWidth="1.2" opacity="0.2" strokeLinecap="round" />
      <path d="M22 45 C24 40, 28 38, 32 40 C36 42, 35 46, 30 48 C28 44, 24 42, 22 45Z" fill="none" stroke="#6BA3D6" strokeWidth="1.2" opacity="0.18" strokeLinecap="round" />
      <path d="M35 42 C37 37, 41 35, 45 37 C49 39, 48 43, 43 45 C41 41, 37 39, 35 42Z" fill="none" stroke="#6BA3D6" strokeWidth="1.2" opacity="0.15" strokeLinecap="round" />
    </svg>
  );
}

function TextArtifact() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <line x1="14" y1="18" x2="66" y2="18" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25" />
      <line x1="14" y1="27" x2="58" y2="27" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.2" />
      <line x1="14" y1="36" x2="63" y2="36" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.25" />
      <line x1="14" y1="45" x2="42" y2="45" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18" />
      <line x1="14" y1="56" x2="60" y2="56" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.22" />
      <line x1="14" y1="65" x2="48" y2="65" stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.18" />
    </svg>
  );
}

function SoundArtifact() {
  return (
    <svg width="62" height="34" viewBox="0 0 80 55">
      <line x1="8" y1="28" x2="8" y2="27" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <line x1="13" y1="24" x2="13" y2="31" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="18" y1="18" x2="18" y2="37" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
      <line x1="23" y1="22" x2="23" y2="33" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="28" y1="12" x2="28" y2="43" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1="33" y1="20" x2="33" y2="35" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="38" y1="15" x2="38" y2="40" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
      <line x1="43" y1="22" x2="43" y2="33" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
      <line x1="53" y1="20" x2="53" y2="35" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <line x1="58" y1="16" x2="58" y2="39" stroke="hsl(var(--ritual-gold))" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
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
      <circle cx="40" cy="45" r="16" fill="none" stroke="hsl(var(--ritual-yellow-accent))" strokeWidth="1" opacity="0.22" />
      <circle cx="110" cy="35" r="12" fill="none" stroke="hsl(var(--ritual-blue-accent))" strokeWidth="1" opacity="0.22" />
      <circle cx="175" cy="50" r="18" fill="none" stroke="hsl(var(--ritual-red-soft))" strokeWidth="1" opacity="0.22" />
      <line x1="56" y1="42" x2="98" y2="37" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.18" />
      <line x1="122" y1="38" x2="157" y2="47" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.18" />
      <text x="33" y="48" fontFamily="'EB Garamond', serif" fontSize="5" fill="hsl(var(--ritual-yellow-accent))" opacity="0.12">start</text>
    </svg>
  );
}

function SketchArtifact() {
  return (
    <svg width="120" height="72" viewBox="0 0 140 95">
      <rect x="20" y="30" width="40" height="50" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1.5" opacity="0.35" />
      <rect x="65" y="15" width="55" height="65" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1.5" opacity="0.3" />
      <line x1="65" y1="15" x2="92" y2="5" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1" opacity="0.25" />
      <line x1="120" y1="15" x2="92" y2="5" stroke="hsl(var(--ritual-green-muted))" strokeWidth="1" opacity="0.25" />
      <rect x="75" y="40" width="12" height="12" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.2" />
      <rect x="95" y="40" width="12" height="12" fill="none" stroke="hsl(var(--ritual-green-muted))" strokeWidth="0.8" opacity="0.2" />
    </svg>
  );
}
