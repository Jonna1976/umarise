import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Palette,
  TreeDeciduous,
  Mountain,
  Waves as WavesIcon,
  Sparkles,
  Flower2,
  CircleDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const artStyles = [
  { id: 'tree', name: 'Tree of Life', icon: TreeDeciduous, description: 'Roots, trunk & branches' },
  { id: 'landscape', name: 'Inner Landscape', icon: Mountain, description: 'Mountains & rivers' },
  { id: 'abstract', name: 'Abstract Soul', icon: CircleDot, description: 'Lupi-inspired patterns' },
  { id: 'ocean', name: 'Ocean Depths', icon: WavesIcon, description: 'Waves & light' },
  { id: 'cosmos', name: 'Inner Cosmos', icon: Sparkles, description: 'Stars & nebulae' },
  { id: 'garden', name: 'Secret Garden', icon: Flower2, description: 'Flowers & paths' },
];

export function PersonalityArtModal({ isOpen, onClose, profile }: PersonalityArtModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedStyle) {
      toast.error('Select an art style first');
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-personality-art', {
        body: { profile, style: selectedStyle }
      });

      if (error) {
        console.error('Art generation error:', error);
        toast.error('Failed to generate artwork');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setGeneratedImage(data.image_url);
      toast.success('Your artwork is ready!');
    } catch (err) {
      console.error('Art generation error:', err);
      toast.error('Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `my-personality-${selectedStyle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Artwork downloaded!');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      // Convert base64 to blob for sharing
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], `my-personality-${selectedStyle}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: profile.tagline,
          text: `My personality visualized: ${profile.tagline}`,
          files: [file]
        });
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard or download
        handleDownload();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Sharing failed');
      }
    }
  };

  const handleClose = () => {
    setSelectedStyle(null);
    setGeneratedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
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
              <Palette className="w-5 h-5 text-codex-sepia" />
              <h1 className="font-serif text-lg font-medium">Visualize Your Soul</h1>
            </div>
            
            <div className="w-10" />
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto">
          {/* Generated Image View */}
          {generatedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={generatedImage} 
                  alt="Your personality as art"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white font-serif text-lg text-center">
                    {profile.tagline}
                  </p>
                </div>
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
                  Share
                </Button>
              </div>

              <Button
                onClick={() => setGeneratedImage(null)}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                Try another style
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Style Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <p className="text-center text-muted-foreground text-sm mb-6">
                  Choose how to visualize your personality
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {artStyles.map((style, index) => {
                    const Icon = style.icon;
                    const isSelected = selectedStyle === style.id;
                    
                    return (
                      <motion.button
                        key={style.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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

              {/* Generate Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedStyle || isGenerating}
                  className="w-full h-14 bg-codex-sepia hover:bg-codex-sepia/90 text-white font-medium text-base"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Creating your artwork...
                    </motion.div>
                  ) : (
                    <>
                      <Palette className="w-5 h-5 mr-2" />
                      Generate Artwork
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-muted-foreground mt-3"
                  >
                    This may take 10-20 seconds...
                  </motion.p>
                )}
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
