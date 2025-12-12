import { motion } from 'framer-motion';
import { 
  Mic, 
  BookOpen, 
  Flame, 
  Zap, 
  Waves, 
  Target,
  Check,
  X,
  ArrowRight
} from 'lucide-react';

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

interface CompareProfilesViewProps {
  voiceProfile: PersonalityProfile;
  influencesProfile: PersonalityProfile;
}

// Find overlapping driver names
function findDriverOverlaps(voice: PersonalityTrait[], influences: PersonalityTrait[]) {
  const voiceNames = new Set(voice.map(d => d.name.toLowerCase()));
  const influenceNames = new Set(influences.map(d => d.name.toLowerCase()));
  
  const shared: string[] = [];
  const voiceOnly: string[] = [];
  const influenceOnly: string[] = [];
  
  voice.forEach(d => {
    if (influenceNames.has(d.name.toLowerCase())) {
      shared.push(d.name);
    } else {
      voiceOnly.push(d.name);
    }
  });
  
  influences.forEach(d => {
    if (!voiceNames.has(d.name.toLowerCase())) {
      influenceOnly.push(d.name);
    }
  });
  
  return { shared, voiceOnly, influenceOnly };
}

// Calculate simple text similarity
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let overlap = 0;
  words1.forEach(w => {
    if (words2.has(w)) overlap++;
  });
  
  return overlap / Math.max(words1.size, words2.size);
}

export function CompareProfilesView({ voiceProfile, influencesProfile }: CompareProfilesViewProps) {
  const driverAnalysis = findDriverOverlaps(voiceProfile.drivers, influencesProfile.drivers);
  
  const identitySimilarity = calculateSimilarity(voiceProfile.core_identity, influencesProfile.core_identity);
  const superpowerSimilarity = calculateSimilarity(voiceProfile.superpower, influencesProfile.superpower);
  
  const alignmentScore = Math.round(
    (driverAnalysis.shared.length / Math.max(voiceProfile.drivers.length, influencesProfile.drivers.length)) * 50 +
    identitySimilarity * 25 +
    superpowerSimilarity * 25
  );

  return (
    <div className="p-4 space-y-6">
      {/* Alignment Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-2xl overflow-hidden p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--codex-sepia) / 0.1) 0%, hsl(220 50% 50% / 0.1) 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-codex-sepia/20 to-blue-500/20 border-4 border-codex-sepia/30 flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-3xl font-bold text-foreground">{alignmentScore}%</span>
        </motion.div>
        
        <h2 className="font-serif text-xl font-medium mb-2">Stem-Invloed Alignment</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {alignmentScore > 70 
            ? 'Je stem en invloeden zijn sterk op elkaar afgestemd'
            : alignmentScore > 40 
              ? 'Interessante spanning tussen je stem en invloeden'
              : 'Je stem is uniek en wijkt af van je invloeden'}
        </p>
      </motion.div>

      {/* Tagline Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="codex-card rounded-xl p-4"
      >
        <h3 className="font-medium text-sm mb-4 text-muted-foreground">Core Identity</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-codex-sepia/20 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 text-codex-sepia" />
            </div>
            <div>
              <p className="text-xs text-codex-sepia font-medium mb-1">Mijn Stem</p>
              <p className="text-sm font-serif italic">"{voiceProfile.tagline}"</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">Mijn Invloeden</p>
              <p className="text-sm font-serif italic">"{influencesProfile.tagline}"</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Drivers Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="codex-card rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-codex-sepia" />
          <h3 className="font-medium text-sm">Drivers Vergelijking</h3>
        </div>
        
        <div className="space-y-4">
          {/* Shared Drivers */}
          {driverAnalysis.shared.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-600">Gedeeld ({driverAnalysis.shared.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {driverAnalysis.shared.map(name => (
                  <span 
                    key={name} 
                    className="px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Voice Only */}
          {driverAnalysis.voiceOnly.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-3.5 h-3.5 text-codex-sepia" />
                <span className="text-xs font-medium text-codex-sepia">Alleen Stem ({driverAnalysis.voiceOnly.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {driverAnalysis.voiceOnly.map(name => (
                  <span 
                    key={name} 
                    className="px-2.5 py-1 rounded-full text-xs bg-codex-sepia/10 text-codex-sepia border border-codex-sepia/20"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Influences Only */}
          {driverAnalysis.influenceOnly.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">Alleen Invloeden ({driverAnalysis.influenceOnly.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {driverAnalysis.influenceOnly.map(name => (
                  <span 
                    key={name} 
                    className="px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Superpower Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="codex-card rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-600" />
          <h3 className="font-medium text-sm">Superkrachten</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-3.5 h-3.5 text-codex-sepia" />
              <span className="text-xs font-medium text-codex-sepia">Stem</span>
            </div>
            <p className="text-xs text-foreground/80 italic">"{voiceProfile.superpower}"</p>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </div>
          
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Invloeden</span>
            </div>
            <p className="text-xs text-foreground/80 italic">"{influencesProfile.superpower}"</p>
          </div>
        </div>
      </motion.div>

      {/* Tension Field Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="codex-card rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-4 h-4 text-codex-sepia" />
          <h3 className="font-medium text-sm">Spanningsvelden</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-3.5 h-3.5 text-codex-sepia" />
              <span className="text-xs font-medium text-codex-sepia">Stem</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-secondary">{voiceProfile.tension_field.side_a}</span>
              <span className="text-muted-foreground">↔</span>
              <span className="px-2 py-1 rounded bg-secondary">{voiceProfile.tension_field.side_b}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">Invloeden</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-secondary">{influencesProfile.tension_field.side_a}</span>
              <span className="text-muted-foreground">↔</span>
              <span className="px-2 py-1 rounded bg-secondary">{influencesProfile.tension_field.side_b}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Growth Edges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-xl bg-secondary/30 border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm text-muted-foreground">Groeigebieden</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mic className="w-3 h-3 text-codex-sepia" />
              <span className="text-[10px] font-medium text-codex-sepia uppercase">Stem</span>
            </div>
            <p className="text-xs text-muted-foreground italic">"{voiceProfile.growth_edge}"</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-medium text-blue-600 uppercase">Invloeden</span>
            </div>
            <p className="text-xs text-muted-foreground italic">"{influencesProfile.growth_edge}"</p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-4"
      >
        <p className="text-[10px] text-muted-foreground/60">
          Gebaseerd op {voiceProfile.page_count} stem-pages en {influencesProfile.page_count} invloed-pages
        </p>
      </motion.div>
    </div>
  );
}
