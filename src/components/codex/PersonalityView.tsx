import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  Target, 
  Zap,
  Compass,
  RefreshCw,
  AlertCircle,
  Star,
  Flame,
  Waves,
  Lock,
  Palette
} from 'lucide-react';
import { usePages } from '@/hooks/usePages';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PersonalityArtModal } from './PersonalityArtModal';
import { PersonalityEvolution } from './PersonalityEvolution';

interface PersonalityViewProps {
  onBack: () => void;
}

interface PersonalityTrait {
  name: string;
  description: string;
  strength: 'high' | 'medium' | 'emerging';
}

interface PersonalityProfile {
  core_identity: string;
  tagline: string;
  drivers: PersonalityTrait[];
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

export function PersonalityView({ onBack }: PersonalityViewProps) {
  const { pages, isLoading: pagesLoading } = usePages();
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArtModal, setShowArtModal] = useState(false);

  const minPagesRequired = 5;
  const hasEnoughPages = pages.length >= minPagesRequired;

  const runPersonalityAnalysis = async () => {
    if (!hasEnoughPages) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const deviceId = getDeviceId();
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-personality', {
        body: { device_user_id: deviceId }
      });

      if (fnError) {
        console.error('Personality analysis error:', fnError);
        setError(fnError.message || 'Analysis failed');
        toast.error('Personality analysis failed');
        return;
      }

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }

      setProfile(data);
      toast.success('Personality profile generated');
    } catch (err) {
      console.error('Personality analysis error:', err);
      setError('Something went wrong');
      toast.error('Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run on mount if enough pages
  useEffect(() => {
    if (!pagesLoading && hasEnoughPages && !profile && !isAnalyzing) {
      runPersonalityAnalysis();
    }
  }, [pagesLoading, pages.length]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-codex-sepia/20 border-codex-sepia text-codex-sepia';
      case 'medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400';
      case 'emerging': return 'bg-secondary border-border text-muted-foreground';
      default: return 'bg-secondary border-border text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-codex-sepia" />
            <h1 className="font-serif text-lg font-medium">Your Personality</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={runPersonalityAnalysis}
            disabled={isAnalyzing || !hasEnoughPages}
            className="w-10 h-10"
          >
            <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground text-center">
            Your unique traits revealed through your handwriting
          </p>
        </div>
      </div>

      {/* Not enough pages */}
      {!hasEnoughPages && (
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="font-serif text-xl font-medium mb-3">Unlock Your Personality</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
              Capture at least {minPagesRequired} pages to reveal your unique personality traits.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[...Array(minPagesRequired)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border-2 -ml-1 first:ml-0 ${
                      i < pages.length 
                        ? 'bg-codex-sepia border-codex-sepia' 
                        : 'bg-transparent border-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {pages.length} / {minPagesRequired} pages
              </span>
            </div>

            {/* Teaser */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-codex-cream/30 to-secondary/20 border border-codex-sepia/10 max-w-sm mx-auto"
            >
              <p className="text-xs text-muted-foreground mb-4">Coming soon for you...</p>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-foreground/60">
                  <Compass className="w-4 h-4 text-codex-sepia/50" />
                  <span>Your core identity</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/60">
                  <Flame className="w-4 h-4 text-codex-sepia/50" />
                  <span>What drives you</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/60">
                  <Zap className="w-4 h-4 text-codex-sepia/50" />
                  <span>Your superpower</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/60">
                  <Waves className="w-4 h-4 text-codex-sepia/50" />
                  <span>Your growth edge</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-codex-sepia/20 to-codex-cream flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-10 h-10 text-codex-sepia" />
            </motion.div>
            <h2 className="font-serif text-xl font-medium mb-2">Discovering who you are...</h2>
            <p className="text-muted-foreground text-sm">
              Analyzing {pages.length} pages of your thoughts
            </p>
          </motion.div>
        </div>
      )}

      {/* Error state */}
      {error && !isAnalyzing && hasEnoughPages && (
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Analysis unavailable</span>
            </div>
            <p className="text-xs text-muted-foreground">{error}</p>
          </motion.div>
        </div>
      )}

      {/* Profile content */}
      {profile && !isAnalyzing && (
        <div className="p-4 space-y-6">
          {/* Core Identity - Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--codex-sepia) / 0.15) 0%, hsl(var(--codex-cream)) 50%, hsl(var(--secondary)) 100%)',
              minHeight: '200px'
            }}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-codex-sepia/10"
              />
              <motion.div
                animate={{ 
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-codex-sepia/10"
              />
            </div>

            <div className="relative p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-codex-sepia/20 border-2 border-codex-sepia/30 flex items-center justify-center mx-auto mb-4"
              >
                <Star className="w-8 h-8 text-codex-sepia" />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[10px] uppercase tracking-widest text-codex-sepia/60 mb-2"
              >
                You are
              </motion.p>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-serif text-2xl font-bold text-foreground mb-3"
              >
                {profile.tagline}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-foreground/80 leading-relaxed max-w-sm mx-auto"
              >
                {profile.core_identity}
              </motion.p>
            </div>
          </motion.div>

          {/* Drivers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="codex-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-codex-sepia" />
              <h3 className="font-medium text-sm">What Drives You</h3>
            </div>
            <div className="space-y-3">
              {profile.drivers.map((driver, index) => (
                <motion.div
                  key={driver.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-3 rounded-lg border ${getStrengthColor(driver.strength)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{driver.name}</span>
                    <span className="text-[10px] uppercase tracking-wide opacity-70">
                      {driver.strength}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">{driver.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Superpower */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-codex-cream to-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-medium text-sm">Your Superpower</h3>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-serif italic">
              "{profile.superpower}"
            </p>
          </motion.div>

          {/* Tension Field */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="codex-card rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Waves className="w-4 h-4 text-codex-sepia" />
              <h3 className="font-medium text-sm">Your Tension Field</h3>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-sm font-medium">{profile.tension_field.side_a}</p>
              </div>
              <div className="text-muted-foreground">↔</div>
              <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-sm font-medium">{profile.tension_field.side_b}</p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {profile.tension_field.description}
            </p>
          </motion.div>

          {/* Personality Evolution - Track how you've changed */}
          <PersonalityEvolution currentTagline={profile.tagline} />

          {/* Growth Edge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-secondary/30 border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-sm text-muted-foreground">Growth Edge</h3>
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              "{profile.growth_edge}"
            </p>
          </motion.div>

          {/* Visualize as Art Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Button
              onClick={() => setShowArtModal(true)}
              className="w-full h-14 bg-gradient-to-r from-codex-sepia via-amber-600 to-codex-sepia text-white font-medium text-base shadow-lg"
            >
              <Palette className="w-5 h-5 mr-2" />
              Visualize as Artwork
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Transform your personality into art
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-4"
          >
            <p className="text-[10px] text-muted-foreground/60">
              Based on {profile.page_count} pages of your handwriting
            </p>
          </motion.div>
        </div>
      )}

      {/* Art Generation Modal */}
      {profile && (
        <PersonalityArtModal
          isOpen={showArtModal}
          onClose={() => setShowArtModal(false)}
          profile={profile}
        />
      )}
    </div>
  );
}