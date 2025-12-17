import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Zap,
  RefreshCw,
  AlertCircle,
  Star,
  Flame,
  Waves,
  Lock,
  Palette,
  User,
  BookOpen,
  GitCompare,
  Lightbulb,
  X
} from 'lucide-react';
import { usePages } from '@/hooks/usePages';
import { supabase } from '@/integrations/supabase/client';
import { getActiveDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PersonalityArtModal } from './PersonalityArtModal';
import { CompareProfilesView } from './CompareProfilesView';
import { RecommendationsSection } from './RecommendationsSection';

interface PersonalityViewProps {
  onBack: () => void;
  forceEmpty?: boolean;
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
  profile_type: 'voice' | 'influences';
}

type ProfileType = 'voice' | 'influences' | 'compare';

interface OrbitItem {
  id: string;
  label: string;
  icon: typeof Flame;
  angle: number;
  color: string;
}

const orbitItems: OrbitItem[] = [
  { id: 'drivers', label: 'Drivers', icon: Flame, angle: 0, color: 'text-amber-500' },
  { id: 'superpower', label: 'Super Power', icon: Zap, angle: 60, color: 'text-yellow-500' },
  { id: 'tension', label: 'Tension Field', icon: Waves, angle: 120, color: 'text-blue-500' },
  { id: 'growth', label: 'Growth Edge', icon: Target, angle: 180, color: 'text-emerald-500' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, angle: 240, color: 'text-purple-500' },
  { id: 'artwork', label: 'Artwork', icon: Palette, angle: 300, color: 'text-rose-500' },
];

export function PersonalityView({ onBack, forceEmpty = false }: PersonalityViewProps) {
  const { pages: realPages, isLoading: pagesLoading } = usePages();
  const pages = forceEmpty ? [] : realPages;
  const [activeTab, setActiveTab] = useState<ProfileType>('voice');
  const [voiceProfile, setVoiceProfile] = useState<PersonalityProfile | null>(null);
  const [influencesProfile, setInfluencesProfile] = useState<PersonalityProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showArtModal, setShowArtModal] = useState(false);
  const [expandedOrbit, setExpandedOrbit] = useState<string | null>(null);

  const minPagesRequired = 5;

  const { voicePages, influencePages } = useMemo(() => {
    const voice = pages.filter(p => !p.sources || p.sources.length === 0);
    const influences = pages.filter(p => p.sources && p.sources.length > 0);
    return { voicePages: voice, influencePages: influences };
  }, [pages]);

  const hasEnoughVoicePages = voicePages.length >= minPagesRequired;
  const hasEnoughInfluencePages = influencePages.length >= minPagesRequired;
  const canCompare = hasEnoughVoicePages && hasEnoughInfluencePages && voiceProfile && influencesProfile;
  const hasEnoughPages = activeTab === 'voice' ? hasEnoughVoicePages : activeTab === 'influences' ? hasEnoughInfluencePages : canCompare;
  
  const currentProfile = activeTab === 'voice' ? voiceProfile : activeTab === 'influences' ? influencesProfile : null;
  const currentPageCount = activeTab === 'voice' ? voicePages.length : influencePages.length;

  const runPersonalityAnalysis = async (profileType: ProfileType) => {
    const requiredPages = profileType === 'voice' ? hasEnoughVoicePages : hasEnoughInfluencePages;
    if (!requiredPages) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const deviceId = getActiveDeviceId();
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-personality', {
        body: { device_user_id: deviceId, profile_type: profileType }
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

      if (profileType === 'voice') {
        setVoiceProfile(data);
      } else {
        setInfluencesProfile(data);
      }
      
      toast.success('Profile generated');
    } catch (err) {
      console.error('Personality analysis error:', err);
      setError('Something went wrong');
      toast.error('Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!pagesLoading && hasEnoughVoicePages && !voiceProfile && !isAnalyzing) {
      runPersonalityAnalysis('voice');
    }
  }, [pagesLoading, voicePages.length]);

  useEffect(() => {
    if (activeTab === 'influences' && hasEnoughInfluencePages && !influencesProfile && !isAnalyzing) {
      runPersonalityAnalysis('influences');
    }
  }, [activeTab, influencePages.length]);

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'high': return 'Strong';
      case 'medium': return 'Moderate';
      case 'emerging': return 'Emerging';
      default: return strength;
    }
  };

  const renderOrbitContent = (itemId: string) => {
    if (!currentProfile) return null;

    switch (itemId) {
      case 'drivers':
        return (
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-medium text-foreground mb-4">What Drives You</h4>
            {currentProfile.drivers.map((driver, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground">{driver.name}</span>
                  <span className="text-xs text-muted-foreground">{getStrengthLabel(driver.strength)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{driver.description}</p>
              </div>
            ))}
          </div>
        );
      case 'superpower':
        return (
          <div>
            <h4 className="font-serif text-lg font-medium text-foreground mb-4">Your Super Power</h4>
            <p className="text-base text-foreground/90 leading-relaxed font-serif italic">
              "{currentProfile.superpower}"
            </p>
          </div>
        );
      case 'tension':
        return (
          <div>
            <h4 className="font-serif text-lg font-medium text-foreground mb-4">Your Tension Field</h4>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-sm font-medium text-foreground">{currentProfile.tension_field.side_a}</p>
              </div>
              <div className="text-muted-foreground text-lg">↔</div>
              <div className="flex-1 p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-sm font-medium text-foreground">{currentProfile.tension_field.side_b}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentProfile.tension_field.description}
            </p>
          </div>
        );
      case 'growth':
        return (
          <div>
            <h4 className="font-serif text-lg font-medium text-foreground mb-4">Your Growth Edge</h4>
            <p className="text-base text-foreground/80 italic leading-relaxed">
              "{currentProfile.growth_edge}"
            </p>
          </div>
        );
      case 'recommendations':
        return (
          <div>
            <h4 className="font-serif text-lg font-medium text-foreground mb-4">Recommendations</h4>
            <RecommendationsSection 
              profile={{
                tagline: currentProfile.tagline,
                core_identity: currentProfile.core_identity,
                drivers: currentProfile.drivers.map(d => ({ 
                  name: d.name, 
                  strength: d.strength === 'high' ? 90 : d.strength === 'medium' ? 60 : 30 
                })),
                superpower: currentProfile.superpower,
                tension_field: { 
                  pole_a: currentProfile.tension_field.side_a, 
                  pole_b: currentProfile.tension_field.side_b 
                },
                growth_edge: currentProfile.growth_edge
              }}
            />
          </div>
        );
      case 'artwork':
        return (
          <div className="text-center">
            <h4 className="font-serif text-lg font-medium text-foreground mb-4">Visualize Your Personality</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Transform your personality into art through different visualization styles.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-6">
              <div className="p-2 rounded bg-secondary/30">Keyword Constellation</div>
              <div className="p-2 rounded bg-secondary/30">Emotion Rhythm</div>
              <div className="p-2 rounded bg-secondary/30">Theme Circles</div>
              <div className="p-2 rounded bg-secondary/30">Connection Map</div>
            </div>
            <Button
              onClick={() => {
                setExpandedOrbit(null);
                setShowArtModal(true);
              }}
              className="bg-gradient-to-r from-codex-sepia via-amber-600 to-codex-sepia text-white"
            >
              <Palette className="w-4 h-4 mr-2" />
              Create Artwork
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const ProfileTab = ({ type, icon: Icon, label, count, isActive }: { 
    type: ProfileType; 
    icon: typeof User; 
    label: string; 
    count: number;
    isActive: boolean;
  }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
        isActive 
          ? 'bg-codex-sepia/20 border border-codex-sepia text-codex-sepia' 
          : 'bg-secondary/50 border border-transparent text-muted-foreground hover:bg-secondary'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
        isActive ? 'bg-codex-sepia/20' : 'bg-muted'
      }`}>
        {count}
      </span>
    </button>
  );

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
            onClick={() => runPersonalityAnalysis(activeTab)}
            disabled={isAnalyzing || !hasEnoughPages}
            className="w-10 h-10"
          >
            <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Profile Type Tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <ProfileTab 
              type="voice" 
              icon={User} 
              label="Voice" 
              count={voicePages.length}
              isActive={activeTab === 'voice'}
            />
            <ProfileTab 
              type="influences" 
              icon={BookOpen} 
              label="Influences" 
              count={influencePages.length}
              isActive={activeTab === 'influences'}
            />
            <button
              onClick={() => setActiveTab('compare')}
              disabled={!canCompare}
              className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl transition-all ${
                activeTab === 'compare'
                  ? 'bg-gradient-to-r from-codex-sepia/20 to-blue-500/20 border border-codex-sepia/50 text-foreground' 
                  : canCompare
                    ? 'bg-secondary/50 border border-transparent text-muted-foreground hover:bg-secondary'
                    : 'bg-secondary/30 border border-transparent text-muted-foreground/50 cursor-not-allowed'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span className="text-xs font-medium">Compare</span>
            </button>
          </div>
        </div>
      </div>

      {/* Not enough pages */}
      {!hasEnoughPages && (
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-8">
              <Lock className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h2 className="font-serif text-2xl font-medium mb-4">
              Unlock Your Profile
            </h2>
            <p className="text-muted-foreground text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Capture at least {minPagesRequired} pages to reveal your unique personality profile.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex">
                {[...Array(minPagesRequired)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 -ml-1 first:ml-0 ${
                      i < currentPageCount 
                        ? 'bg-codex-sepia border-codex-sepia' 
                        : 'bg-transparent border-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-base text-muted-foreground">
                {currentPageCount} / {minPagesRequired} pages
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
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
              className="w-24 h-24 rounded-full bg-gradient-to-br from-codex-sepia/20 to-codex-cream flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles className="w-12 h-12 text-codex-sepia" />
            </motion.div>
            <h2 className="font-serif text-2xl font-medium mb-3">
              Discovering your essence...
            </h2>
            <p className="text-muted-foreground text-base">
              Analyzing {currentPageCount} pages
            </p>
          </motion.div>
        </div>
      )}

      {/* Error state */}
      {error && !isAnalyzing && hasEnoughPages && (
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-base font-medium text-destructive">Analysis unavailable</span>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </motion.div>
        </div>
      )}

      {/* Compare View */}
      {activeTab === 'compare' && canCompare && voiceProfile && influencesProfile && (
        <CompareProfilesView 
          voiceProfile={voiceProfile} 
          influencesProfile={influencesProfile} 
        />
      )}

      {/* Orbit Visualization */}
      {currentProfile && !isAnalyzing && activeTab !== 'compare' && (
        <div className="px-6 py-12">
          {/* Center - Core Identity */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-16"
          >
            {/* User Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-codex-sepia/20 border-2 border-codex-sepia/30 flex items-center justify-center mx-auto mb-6"
            >
              <User className="w-10 h-10 text-codex-sepia" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs uppercase tracking-[0.2em] text-codex-sepia/60 mb-4"
            >
              You are
            </motion.p>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-serif text-3xl font-bold text-foreground mb-6"
            >
              {currentProfile.tagline}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-base text-foreground/70 leading-relaxed max-w-md mx-auto"
            >
              {currentProfile.core_identity}
            </motion.p>
          </motion.div>

          {/* Orbit Circles */}
          <div className="relative w-full max-w-md mx-auto aspect-square">
            {/* Orbit ring */}
            <div className="absolute inset-8 rounded-full border border-dashed border-muted-foreground/20" />
            
            {/* Orbit items */}
            {orbitItems.map((item, index) => {
              const radius = 42; // percentage from center
              const angleRad = (item.angle - 90) * (Math.PI / 180);
              const x = 50 + radius * Math.cos(angleRad);
              const y = 50 + radius * Math.sin(angleRad);
              const Icon = item.icon;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                  onClick={() => setExpandedOrbit(expandedOrbit === item.id ? null : item.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    expandedOrbit === item.id 
                      ? 'z-20 scale-110' 
                      : 'z-10 hover:scale-110'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                      expandedOrbit === item.id
                        ? 'bg-codex-sepia text-white shadow-lg shadow-codex-sepia/30'
                        : 'bg-secondary/80 hover:bg-secondary border border-border hover:border-codex-sepia/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-0.5 ${expandedOrbit === item.id ? 'text-white' : item.color}`} />
                    <span className={`text-[9px] font-medium leading-tight text-center px-1 ${
                      expandedOrbit === item.id ? 'text-white' : 'text-foreground/70'
                    }`}>
                      {item.label}
                    </span>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {/* Expanded Content Panel */}
          <AnimatePresence>
            {expandedOrbit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-border relative"
              >
                <button
                  onClick={() => setExpandedOrbit(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                {renderOrbitContent(expandedOrbit)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-16"
          >
            <p className="text-sm text-muted-foreground/60">
              Based on {currentProfile.page_count} pages of your writing
            </p>
          </motion.div>
        </div>
      )}

      {/* Art Generation Modal */}
      {voiceProfile && (
        <PersonalityArtModal
          isOpen={showArtModal}
          onClose={() => setShowArtModal(false)}
          profile={voiceProfile}
        />
      )}
    </div>
  );
}
