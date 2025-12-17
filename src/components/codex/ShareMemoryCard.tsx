import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, Download, Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getActiveDeviceId } from '@/lib/deviceId';
import { toast } from 'sonner';
import { format, formatDistanceStrict } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ShareMemoryCardProps {
  onBack: () => void;
}

interface MemorySummary {
  summary: string;
  page_count: number;
  first_page_date: string;
  last_page_date: string;
  generated_at: string;
}

export function ShareMemoryCard({ onBack }: ShareMemoryCardProps) {
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deviceId = getActiveDeviceId();
      
      const { data, error: fnError } = await supabase.functions.invoke('generate-memory-summary', {
        body: { device_user_id: deviceId }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate summary');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSummary(data);
      toast.success('Summary generated');
    } catch (err) {
      console.error('Summary generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      toast.error('Could not generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!summary) return;

    const shareText = `${summary.summary}\n\n— ${summary.page_count} pages captured with Umarise`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Memory',
          text: shareText,
        });
        toast.success('Shared!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || !summary) return;

    try {
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `my-memory-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Image downloaded');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Could not download image');
    }
  };

  const getDateRange = () => {
    if (!summary) return '';
    const first = new Date(summary.first_page_date);
    const last = new Date(summary.last_page_date);
    const distance = formatDistanceStrict(first, last, { locale: nl });
    return `${format(first, 'd MMM yyyy')} — ${format(last, 'd MMM yyyy')} (${distance})`;
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
          <h1 className="font-serif text-xl font-semibold text-foreground">Share Memory</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Generate button */}
        {!summary && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-codex-gold/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-codex-gold" />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-3">Create your summary</h2>
            <p className="text-muted-foreground mb-8 px-4">
              Generate a beautiful summary of your memory to share with others
            </p>
            <Button 
              onClick={generateSummary} 
              variant="codex" 
              size="lg"
              disabled={isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Summary
            </Button>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-codex-gold/20 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-codex-gold animate-spin" />
            </div>
            <p className="text-muted-foreground">Reading your pages...</p>
          </motion.div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={generateSummary} variant="outline" className="text-foreground">
              Try again
            </Button>
          </motion.div>
        )}

        {/* Summary card */}
        <AnimatePresence>
          {summary && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* The shareable card */}
              <div
                ref={cardRef}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-codex-gold/10 border-2 border-codex-gold/30 p-6 shadow-xl"
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-codex-gold/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-codex-gold/5 rounded-full blur-2xl" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-codex-gold" />
                    <span className="text-sm font-medium text-codex-gold">My Memory</span>
                  </div>

                  {/* Summary text */}
                  <p className="font-serif text-lg text-foreground leading-relaxed mb-6">
                    "{summary.summary}"
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-4">
                    <span>{summary.page_count} pages</span>
                    <span className="text-xs">{getDateRange()}</span>
                  </div>

                  {/* Branding */}
                  <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground/60 font-medium tracking-wide">
                      UMARISE
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleShare}
                  variant="codex"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 text-foreground"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Regenerate */}
              <button
                onClick={generateSummary}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <RefreshCw className="w-3 h-3 inline mr-1" />
                Generate new summary
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
