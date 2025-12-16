import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Heart,
  BookOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getActiveDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';

interface MonthData {
  month: string;
  monthName: string;
  pageCount: number;
  dominantTone: string;
  topKeywords: string[];
  toneBreakdown: Record<string, number>;
}

interface EmotionalTimelinePoint {
  month: string;
  pageCount: number;
  dominantTone: string;
  intensity: number;
}

interface AIAnalysis {
  discoveredTheme: string;
  themeExplanation: string;
  coreInsight: string;
  highlights: string[];
  growthObservation: string;
  emotionalJourney: string;
}

interface YearReflectionData {
  year: number;
  pageCount: number;
  monthlyData: MonthData[];
  topKeywords: { keyword: string; count: number }[];
  toneDistribution: Record<string, number>;
  emotionalTimeline: EmotionalTimelinePoint[];
  aiAnalysis: AIAnalysis;
  generatedAt: string;
}

interface YearReflectionViewProps {
  onBack: () => void;
}

const toneColors: Record<string, string> = {
  'focused': 'bg-amber-400',
  'reflective': 'bg-blue-400',
  'hopeful': 'bg-emerald-400',
  'playful': 'bg-pink-400',
  'frustrated': 'bg-red-400',
  'calm': 'bg-teal-400',
  'overwhelmed': 'bg-purple-400',
  'curious': 'bg-orange-400',
  'grateful': 'bg-yellow-400',
  'determined': 'bg-indigo-400',
};

const getToneColor = (tone: string): string => {
  return toneColors[tone.toLowerCase()] || 'bg-gray-400';
};

export function YearReflectionView({ onBack }: YearReflectionViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<YearReflectionData | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateReflection = async () => {
    const deviceId = getActiveDeviceId();
    if (!deviceId) {
      toast.error('Device ID not found');
      return;
    }

    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-year-reflection', {
        body: { device_user_id: deviceId, year: selectedYear }
      });

      if (error) throw error;

      if (result.error) {
        if (result.pageCount === 0) {
          toast.error(`Geen notities gevonden voor ${selectedYear}`);
        } else {
          toast.error(result.error);
        }
        return;
      }

      setData(result);
      setHasGenerated(true);
      toast.success('Jaarreflectie gegenereerd');
    } catch (error) {
      console.error('Error generating reflection:', error);
      toast.error('Kon jaarreflectie niet genereren');
    } finally {
      setIsLoading(false);
    }
  };

  const changeYear = (delta: number) => {
    const newYear = selectedYear + delta;
    const currentYear = new Date().getFullYear();
    if (newYear <= currentYear && newYear >= 2020) {
      setSelectedYear(newYear);
      setData(null);
      setHasGenerated(false);
    }
  };

  // Initial state - show generate button
  if (!hasGenerated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-serif text-lg">Jaarreflectie</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            {/* Year selector */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => changeYear(-1)}
                disabled={selectedYear <= 2020}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-4xl font-serif text-primary">{selectedYear}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => changeYear(1)}
                disabled={selectedYear >= new Date().getFullYear()}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-amber-500" />
            </div>

            <h2 className="text-2xl font-serif mb-3">Ontdek je jaar</h2>
            <p className="text-muted-foreground mb-8">
              Genereer een persoonlijke reflectie op basis van alles wat je schreef in {selectedYear}. 
              Ontdek je jaarthema, emotionele reis, en belangrijkste inzichten.
            </p>

            <Button 
              onClick={generateReflection}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Analyseren...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Genereer Jaarreflectie
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-serif text-lg">Jaarreflectie {data.year}</h1>
          <Button variant="ghost" size="icon" onClick={generateReflection} disabled={isLoading}>
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-8 py-4"
        >
          <div className="text-center">
            <div className="text-3xl font-serif text-primary">{data.pageCount}</div>
            <div className="text-xs text-muted-foreground">notities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif text-primary">
              {data.monthlyData.filter(m => m.pageCount > 0).length}
            </div>
            <div className="text-xs text-muted-foreground">actieve maanden</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif text-primary">{data.topKeywords.length}</div>
            <div className="text-xs text-muted-foreground">thema's</div>
          </div>
        </motion.div>

        {/* 1. Discovered Year Theme */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl p-6 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="font-medium text-amber-700 dark:text-amber-400">Ontdekt Jaarthema</h2>
          </div>
          <div className="text-3xl font-serif text-foreground mb-3">
            {data.aiAnalysis.discoveredTheme}
          </div>
          <p className="text-muted-foreground">
            {data.aiAnalysis.themeExplanation}
          </p>
        </motion.section>

        {/* 2. Core Insight */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-medium">Kern-inzicht</h2>
          </div>
          <p className="text-lg text-foreground leading-relaxed">
            {data.aiAnalysis.coreInsight}
          </p>
        </motion.section>

        {/* 3. Emotional Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-medium">Emotionele Timeline</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {data.aiAnalysis.emotionalJourney}
          </p>
          
          {/* Timeline visualization */}
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end justify-between gap-1">
              {data.emotionalTimeline.map((point, index) => (
                <div key={point.month} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(point.intensity * 100, 10)}%` }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${point.dominantTone ? getToneColor(point.dominantTone) : 'bg-muted'} opacity-70`}
                    title={`${point.month}: ${point.pageCount} notities (${point.dominantTone || 'geen'})`}
                  />
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {point.month.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tone legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(data.toneDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([tone, count]) => (
                <div key={tone} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-3 h-3 rounded-full ${getToneColor(tone)}`} />
                  <span className="text-muted-foreground">{tone} ({count})</span>
                </div>
              ))
            }
          </div>
        </motion.section>

        {/* 4. Month by Month */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-medium">Maand in Beeld</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {data.monthlyData.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.03 }}
                className={`p-3 rounded-xl text-center ${
                  month.pageCount > 0 
                    ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20' 
                    : 'bg-muted/30 border border-transparent'
                }`}
              >
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  {month.monthName.slice(0, 3)}
                </div>
                <div className={`text-lg font-serif ${month.pageCount > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {month.pageCount}
                </div>
                {month.dominantTone && (
                  <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${getToneColor(month.dominantTone)}`} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 5. Highlights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="font-medium">Hoogtepunten</h2>
          </div>
          
          <div className="space-y-3">
            {data.aiAnalysis.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-amber-600">{index + 1}</span>
                </div>
                <p className="text-foreground">{highlight}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 6. Growth Observation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-2xl p-6 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h2 className="font-medium text-emerald-700 dark:text-emerald-400">Groei-observatie</h2>
          </div>
          <p className="text-foreground">
            {data.aiAnalysis.growthObservation}
          </p>
        </motion.section>

        {/* Top Keywords */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <h2 className="font-medium mb-4">Meest voorkomende thema's</h2>
          <div className="flex flex-wrap gap-2">
            {data.topKeywords.slice(0, 10).map((kw, index) => (
              <motion.span
                key={kw.keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.03 }}
                className="px-3 py-1.5 bg-muted rounded-full text-sm"
              >
                {kw.keyword}
                <span className="text-muted-foreground ml-1">({kw.count})</span>
              </motion.span>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
