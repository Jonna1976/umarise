/**
 * Revoke Association Dialog
 * 
 * Implements the "Herroepbaarheid" principle:
 * "An origin cannot be deleted. Association with an origin can be revoked."
 * 
 * Design constraints (from design brief):
 * - Calm, neutral tone without drama
 * - No "delete", "undo", "erase" language
 * - User experiences "The beginning is safely recorded. I may move on."
 * - No guilt, no warnings, no punishment feeling
 */

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { revokeAssociation } from '@/lib/pageService';
import { toast } from 'sonner';
import type { Page } from '@/lib/abstractions/types';

interface RevokeAssociationDialogProps {
  page: Page;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevoked?: () => void;
}

export function RevokeAssociationDialog({ 
  page, 
  open, 
  onOpenChange, 
  onRevoked 
}: RevokeAssociationDialogProps) {
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    
    try {
      const success = await revokeAssociation(page.id);
      
      if (success) {
        toast.success('Je bent losgekoppeld van dit begin', {
          description: 'Het begin blijft veilig vastgelegd.',
        });
        onRevoked?.();
        onOpenChange(false);
      } else {
        toast.error('Er ging iets mis');
      }
    } catch (error) {
      console.error('[Herroepbaarheid] Revoke failed:', error);
      toast.error('Er ging iets mis');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-codex-ink-deep border-codex-cream/20 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-codex-cream text-lg font-medium">
            Laat dit begin los
          </AlertDialogTitle>
          <AlertDialogDescription className="text-codex-cream/70 space-y-3">
            <p>
              Je koppelt jezelf los van dit begin. Het begin blijft veilig vastgelegd 
              en verifieerbaar—alleen jouw betrokkenheid wordt teruggetrokken.
            </p>
            <p className="text-codex-cream/50 text-sm italic">
              "Het begin is veilig vastgelegd. Je mag verder."
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            className="bg-transparent border-codex-cream/20 text-codex-cream hover:bg-codex-cream/10 hover:text-codex-cream"
            disabled={isRevoking}
          >
            Blijf gekoppeld
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isRevoking}
            className="bg-codex-cream/10 text-codex-cream hover:bg-codex-cream/20 border border-codex-cream/20"
          >
            {isRevoking ? 'Bezig...' : 'Laat los'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
