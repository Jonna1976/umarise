import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Film, FileText, Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  type: 'book' | 'film' | 'article';
  title: string;
  creator: string;
  year?: string;
  why: string;
  connection: string;
}

interface PersonalityProfile {
  tagline: string;
  core_identity: string;
  drivers: Array<{ name: string; strength: number }>;
  superpower: string;
  tension_field: { pole_a: string; pole_b: string };
  growth_edge: string;
}

interface RecommendationsSectionProps {
  profile: PersonalityProfile;
}

const typeIcons = {
  book: Book,
  film: Film,
  article: FileText,
};

const typeLabels = {
  book: 'Boek',
  film: 'Film',
  article: 'Artikel',
};

const typeColors = {
  book: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  film: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  article: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
};

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ profile }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { profile }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        setHasGenerated(true);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      toast({
        title: "Kon aanbevelingen niet genereren",
        description: error instanceof Error ? error.message : "Probeer het later opnieuw",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchGoogle = (rec: Recommendation) => {
    const query = encodeURIComponent(`${rec.title} ${rec.creator} ${rec.type}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  if (!hasGenerated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Persoonlijke Aanbevelingen</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ontdek boeken, films en artikelen die bij jouw profiel passen
            </p>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Genereren...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genereer Aanbevelingen
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  }

  const groupedRecs = {
    book: recommendations.filter(r => r.type === 'book'),
    film: recommendations.filter(r => r.type === 'film'),
    article: recommendations.filter(r => r.type === 'article'),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Voor Jou Geselecteerd
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {(['book', 'film', 'article'] as const).map((type) => (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  {React.createElement(typeIcons[type], { className: 'w-4 h-4' })}
                  {typeLabels[type]}en
                </div>
                <div className="grid gap-3">
                  {groupedRecs[type].map((rec, index) => (
                    <motion.div
                      key={`${rec.title}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl bg-gradient-to-br ${typeColors[type]} border cursor-pointer hover:scale-[1.02] transition-transform`}
                      onClick={() => searchGoogle(rec)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {rec.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {rec.creator}{rec.year && ` (${rec.year})`}
                          </p>
                          <p className="text-sm text-foreground/80 mt-2">
                            {rec.why}
                          </p>
                          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground">
                            {rec.connection}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
