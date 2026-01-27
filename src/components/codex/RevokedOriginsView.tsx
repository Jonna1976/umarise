/**
 * Revoked Origins View
 * 
 * Shows origins the user has released their association with.
 * Users can view them read-only or restore their association.
 * 
 * Design principles (from Herroepbaarheid):
 * - Calm, neutral tone
 * - Origins are safely recorded, not deleted
 * - Users can reconnect anytime
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Unlink, Link, X } from 'lucide-react';
import { Page } from '@/lib/pageService';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { VaultImage } from '@/components/ui/VaultImage';
import { toast } from 'sonner';

interface RevokedOriginsViewProps {
  revokedPages: Page[];
  onRestore: (pageId: string) => Promise<boolean>;
  onClose: () => void;
}

export function RevokedOriginsView({ 
  revokedPages, 
  onRestore, 
  onClose 
}: RevokedOriginsViewProps) {
  
  const handleRestore = async (pageId: string) => {
    const success = await onRestore(pageId);
    if (success) {
      toast.success('Association restored', {
        description: 'The origin is back in your codex.',
      });
    } else {
      toast.error('Failed to restore association');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="flex items-center gap-2">
            <Unlink className="w-5 h-5 text-muted-foreground" />
            <h1 className="font-serif text-xl font-semibold text-foreground">
              Released Origins
            </h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto max-h-[calc(100vh-80px)]">
        {revokedPages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Unlink className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="font-serif text-lg text-muted-foreground mb-1">
              No released origins
            </h2>
            <p className="text-sm text-muted-foreground/70 max-w-xs">
              Origins you release will appear here. You can always restore your association with them.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {revokedPages.length} {revokedPages.length === 1 ? 'origin' : 'origins'} released
            </p>
            <p className="text-xs text-muted-foreground/60 mb-6 italic">
              These origins are safely recorded. You may restore your association at any time.
            </p>
            
            <AnimatePresence mode="popLayout">
              {revokedPages.map((page) => (
                <motion.div
                  key={page.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  className="bg-secondary/50 rounded-xl p-4 border border-border/50"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <VaultImage
                      src={page.imageUrl}
                      alt={`Origin: ${page.futureYouCues?.[0] || page.summary?.slice(0, 40) || 'page'}`}
                      className="w-16 h-20 rounded-lg bg-muted flex-shrink-0 opacity-70"
                      imgClassName="w-full h-full object-cover"
                      placeholderClassName="min-h-0 h-full"
                    />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/80 line-clamp-2 mb-1">
                        {page.futureYouCues?.[0] || page.summary?.slice(0, 50) || 'Untitled origin'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Captured {format(page.createdAt, 'MMM d, yyyy')}
                      </p>
                      {page.associationRevokedAt && (
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Released {format(page.associationRevokedAt, 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleRestore(page.id)}
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-codex-gold hover:text-codex-gold hover:bg-codex-gold/10"
                        title="Restore association"
                      >
                        <Link className="w-4 h-4" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
