import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2,
  Sparkles,
  CircleDot,
  Activity,
  Target,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePages } from '@/hooks/usePages';
import { KeywordConstellation } from './visualizations/KeywordConstellation';
import { EmotionRhythm } from './visualizations/EmotionRhythm';
import { ThemeCircles } from './visualizations/ThemeCircles';
import { ConnectionMap } from './visualizations/ConnectionMap';

interface PersonalityProfile {
  core_identity: string;
  tagline: string;
  drivers: { name: string; description: string; strength: string }[];
  tension_field: {
    side_a: string;
    side_b: string;
    description: string;
  };
  superpower: string;
  growth_edge: string;
  page_count: number;
  analyzed_at: string;
}

interface PersonalityArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonalityProfile;
}

const visualizationStyles = [
  { 
    id: 'constellation', 
    name: 'Keyword Constellatie', 
    icon: Sparkles, 
    description: 'Sterrenbeeld van jouw thema\'s' 
  },
  { 
    id: 'rhythm', 
    name: 'Emotie Ritme', 
    icon: Activity, 
    description: 'Tijdlijn van jouw tones' 
  },
  { 
    id: 'circles', 
    name: 'Thema Cirkels', 
    icon: Target, 
    description: 'Concentrische drivers' 
  },
  { 
    id: 'connection', 
    name: 'Verbindingskaart', 
    icon: Network, 
    description: 'Netwerk van ideeën' 
  },
];

export function PersonalityArtModal({ isOpen, onClose, profile }: PersonalityArtModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visualizationReady, setVisualizationReady] = useState(false);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const { pages } = usePages();

  // Process page data for visualizations
  const processedData = {
    keywords: (() => {
      const keywordMap = new Map<string, { count: number; tones: Set<string> }>();
      pages.forEach(page => {
        const pageKeywords = page.keywords || [];
        const pageTone = typeof page.tone === 'string' ? page.tone : 'default';
        pageKeywords.forEach((kw: string) => {
          const existing = keywordMap.get(kw) || { count: 0, tones: new Set<string>() };
          existing.count++;
          existing.tones.add(pageTone);
          keywordMap.set(kw, existing);
        });
      });
      return Array.from(keywordMap.entries())
        .map(([keyword, data]) => ({
          keyword,
          count: data.count,
          tones: Array.from(data.tones)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    })(),
    tones: pages.map(page => ({
      date: page.createdAt instanceof Date ? page.createdAt.toISOString() : String(page.createdAt),
      tone: typeof page.tone === 'string' ? page.tone : 'default'
    })),
    connectionData: {
      keywords: pages.flatMap(p => p.keywords || []).slice(0, 8),
      tensionA: profile.tension_field.side_a,
      tensionB: profile.tension_field.side_b,
      superpower: profile.superpower.split(' ').slice(0, 3).join(' ')
    }
  };

  const handleGenerate = () => {
    if (!selectedStyle) {
      toast.error('Kies eerst een visualisatie stijl');
      return;
    }
    setIsGenerating(true);
    
    // Simulate brief generation time for animation
    setTimeout(() => {
      setVisualizationReady(true);
      setIsGenerating(false);
      toast.success('Visualisatie gereed!');
    }, 800);
  };

  const handleDownload = async () => {
    if (!visualizationRef.current) return;

    try {
      const canvas = visualizationRef.current.querySelector('canvas');
      if (!canvas) {
        toast.error('Geen visualisatie gevonden');
        return;
      }

      const link = document.createElement('a');
      link.download = `my-personality-${selectedStyle}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Visualisatie gedownload!');
    } catch (err) {
      toast.error('Download mislukt');
    }
  };

  const handleShare = async () => {
    if (!visualizationRef.current) return;

    try {
      const canvas = visualizationRef.current.querySelector('canvas');
      if (!canvas) return;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      
      const file = new File([blob], `my-personality-${selectedStyle}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: profile.tagline,
          text: `Mijn persoonlijkheid gevisualiseerd: ${profile.tagline}`,
          files: [file]
        });
        toast.success('Gedeeld!');
      } else {
        handleDownload();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Delen mislukt');
      }
    }
  };

  const handleClose = () => {
    setSelectedStyle(null);
    setVisualizationReady(false);
    onClose();
  };

  const handleTryAnother = () => {
    setVisualizationReady(false);
    setSelectedStyle(null);
  };

  if (!isOpen) return null;

  const renderVisualization = () => {
    // Dynamic sizing based on screen width
    const screenWidth = window.innerWidth;
    const isLargeScreen = screenWidth >= 768;
    const isExtraLargeScreen = screenWidth >= 1024;
    
    let size: number;
    if (isExtraLargeScreen) {
      size = Math.min(screenWidth - 200, 600); // Max 600px on large screens
    } else if (isLargeScreen) {
      size = Math.min(screenWidth - 100, 500); // Max 500px on tablets
    } else {
      size = Math.min(screenWidth - 32, 400); // Max 400px on mobile
    }
    
    switch (selectedStyle) {
      case 'constellation':
        return (
          <KeywordConstellation 
            keywords={processedData.keywords}
            tagline={profile.tagline}
            width={size}
            height={size}
          />
        );
      case 'rhythm':
        return (
          <EmotionRhythm 
            tones={processedData.tones}
            tagline={profile.tagline}
            width={size}
            height={size}
          />
        );
      case 'circles':
        return (
          <ThemeCircles 
            drivers={profile.drivers}
            superpower={profile.superpower}
            tagline={profile.tagline}
            width={size}
            height={size}
          />
        );
      case 'connection':
        return (
          <ConnectionMap 
            data={processedData.connectionData}
            tagline={profile.tagline}
            width={size}
            height={size}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            
            <div className="flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-codex-sepia" />
              <h1 className="font-serif text-lg font-medium">Data Visualisatie</h1>
            </div>
            
            <div className="w-10" />
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto pb-8">
          {/* Visualization View */}
          {visualizationReady ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div 
                ref={visualizationRef}
                className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#FAF8F5] flex items-center justify-center"
              >
                {renderVisualization()}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-codex-sepia hover:bg-codex-sepia/90"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Delen
                </Button>
              </div>

              <Button
                onClick={handleTryAnother}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Probeer andere stijl
              </Button>

              {/* Data transparency */}
              <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
                <p className="text-[10px] text-muted-foreground text-center">
                  Gebaseerd op {processedData.keywords.length} keywords, {processedData.tones.length} pagina's en {profile.drivers.length} drivers uit jouw handschrift
                </p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Intro text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <p className="text-center text-muted-foreground text-sm mb-2">
                  Giorgia Lupi-geïnspireerde visualisaties
                </p>
                <p className="text-center text-xs text-muted-foreground/70">
                  Jouw echte woorden en emoties worden data
                </p>
              </motion.div>

              {/* Style Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <div className="grid grid-cols-2 gap-3">
                  {visualizationStyles.map((style, index) => {
                    const Icon = style.icon;
                    const isSelected = selectedStyle === style.id;
                    
                    return (
                      <motion.button
                        key={style.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-codex-sepia bg-codex-sepia/10' 
                            : 'border-border hover:border-codex-sepia/50 bg-secondary/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-codex-sepia' : 'text-muted-foreground'}`} />
                        <p className={`font-medium text-sm ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                          {style.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {style.description}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Data Preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-6 p-4 rounded-xl bg-secondary/20 border border-border"
              >
                <p className="text-xs text-muted-foreground mb-3">Jouw data die wordt gevisualiseerd:</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {processedData.keywords.slice(0, 6).map((kw, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-codex-sepia/10 text-codex-sepia text-[10px]"
                    >
                      {kw.keyword} ({kw.count}×)
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  + {profile.drivers.length} drivers, {new Set(processedData.tones.map(t => t.tone)).size} emoties, spanning van {profile.tension_field.side_a} tot {profile.tension_field.side_b}
                </p>
              </motion.div>

              {/* Generate Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedStyle || isGenerating}
                  className="w-full h-14 bg-codex-sepia hover:bg-codex-sepia/90 text-white font-medium text-base"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="flex items-center gap-2"
                    >
                      <CircleDot className="w-5 h-5" />
                      Visualisatie maken...
                    </motion.div>
                  ) : (
                    <>
                      <CircleDot className="w-5 h-5 mr-2" />
                      Genereer Visualisatie
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
