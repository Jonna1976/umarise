import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Page } from '@/lib/pageService';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

interface TrashViewProps {
  trashedPages: Page[];
  onRestore: (pageId: string) => void;
  onPermanentDelete: (pageId: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
  onClose: () => void;
}

export function TrashView({ 
  trashedPages, 
  onRestore, 
  onPermanentDelete, 
  onEmptyTrash, 
  onClose 
}: TrashViewProps) {
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmEmptyFinal, setConfirmEmptyFinal] = useState(false);
  const [emptyConfirmText, setEmptyConfirmText] = useState('');
  
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handlePermanentDelete = (page: Page) => {
    setPageToDelete(page);
  };

  const proceedToFinalConfirm = () => {
    setShowFinalConfirm(true);
    setDeleteConfirmText('');
  };

  const confirmPermanentDelete = async () => {
    if (pageToDelete && deleteConfirmText.toUpperCase() === 'DELETE') {
      console.log('[TrashView] Confirming permanent delete for:', pageToDelete.id);
      const pageIdToDelete = pageToDelete.id;
      setPageToDelete(null);
      setShowFinalConfirm(false);
      setDeleteConfirmText('');
      await onPermanentDelete(pageIdToDelete);
    }
  };

  const cancelDelete = () => {
    setPageToDelete(null);
    setShowFinalConfirm(false);
    setDeleteConfirmText('');
  };

  const proceedToFinalEmptyConfirm = () => {
    setConfirmEmpty(false);
    setConfirmEmptyFinal(true);
    setEmptyConfirmText('');
  };

  const confirmEmptyTrash = async () => {
    if (emptyConfirmText.toUpperCase() === 'DELETE') {
      setConfirmEmptyFinal(false);
      setEmptyConfirmText('');
      await onEmptyTrash();
    }
  };

  const cancelEmptyTrash = () => {
    setConfirmEmpty(false);
    setConfirmEmptyFinal(false);
    setEmptyConfirmText('');
  };

  return (
    <>
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
              <Trash2 className="w-5 h-5 text-muted-foreground" />
              <h1 className="font-serif text-xl font-semibold text-foreground">
                Prullenbak
              </h1>
            </div>
            
            {trashedPages.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmEmpty(true)}
                className="text-sm"
              >
                Leegmaken
              </Button>
            )}
            {trashedPages.length === 0 && <div className="w-24" />}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(100vh-80px)]">
          {trashedPages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Trash2 className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h2 className="font-serif text-lg text-muted-foreground mb-1">
                Prullenbak is leeg
              </h2>
              <p className="text-sm text-muted-foreground/70">
                Sleep pages hierheen om ze te verwijderen
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {trashedPages.length} {trashedPages.length === 1 ? 'item' : 'items'} in prullenbak
              </p>
              
              <AnimatePresence mode="popLayout">
                {trashedPages.map((page) => (
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
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={page.imageUrl}
                          alt="Page thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                          {page.futureYouCues?.[0] || page.summary?.slice(0, 50) || 'Untitled page'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(page.createdAt, 'd MMM yyyy', { locale: nl })}
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onRestore(page.id)}
                          className="w-9 h-9 rounded-lg bg-background hover:bg-secondary flex items-center justify-center transition-colors"
                          title="Terugzetten"
                        >
                          <RotateCcw className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(page)}
                          className="w-9 h-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                          title="Definitief verwijderen"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Empty trash - First confirmation */}
      <AlertDialog open={confirmEmpty} onOpenChange={setConfirmEmpty}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Prullenbak leegmaken?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Dit verwijdert {trashedPages.length} {trashedPages.length === 1 ? 'page' : 'pages'} definitief. 
              Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelEmptyTrash}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={proceedToFinalEmptyConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Doorgaan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty trash - Final confirmation with text input */}
      <AlertDialog open={confirmEmptyFinal} onOpenChange={(open) => !open && cancelEmptyTrash()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Laatste waarschuwing
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Je staat op het punt om <strong>{trashedPages.length} {trashedPages.length === 1 ? 'page' : 'pages'}</strong> permanent te verwijderen. 
                Deze actie kan <strong>NIET</strong> ongedaan worden gemaakt.
              </p>
              <p className="font-medium">
                Type <span className="font-mono bg-destructive/10 px-2 py-0.5 rounded text-destructive">DELETE</span> om te bevestigen:
              </p>
              <Input
                value={emptyConfirmText}
                onChange={(e) => setEmptyConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="font-mono"
                autoFocus
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelEmptyTrash}>Annuleren</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={confirmEmptyTrash}
              disabled={emptyConfirmText.toUpperCase() !== 'DELETE'}
            >
              Definitief verwijderen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single page delete - First confirmation */}
      <AlertDialog open={!!pageToDelete && !showFinalConfirm} onOpenChange={() => cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Page definitief verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze page wordt permanent verwijderd. Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={proceedToFinalConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Doorgaan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single page delete - Final confirmation with text input */}
      <AlertDialog open={showFinalConfirm} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Laatste waarschuwing
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Je staat op het punt om deze page <strong>permanent</strong> te verwijderen. 
                Deze actie kan <strong>NIET</strong> ongedaan worden gemaakt.
              </p>
              <p className="font-medium">
                Type <span className="font-mono bg-destructive/10 px-2 py-0.5 rounded text-destructive">DELETE</span> om te bevestigen:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="font-mono"
                autoFocus
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Annuleren</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={confirmPermanentDelete}
              disabled={deleteConfirmText.toUpperCase() !== 'DELETE'}
            >
              Definitief verwijderen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
