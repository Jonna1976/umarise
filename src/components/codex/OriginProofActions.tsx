/**
 * Origin Proof Actions Component
 * 
 * Provides:
 * - Copy Origin Link button
 * - Download Proof Bundle button
 * - Revoke Association ("Laat dit begin los") - Herroepbaarheid
 * 
 * Used in SnapshotView for integration demo capabilities
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link2, FileJson, Check, Copy, Download, UserMinus } from 'lucide-react';
import { copyOriginLink, downloadProofBundle } from '@/lib/originLink';
import { toast } from 'sonner';
import type { Page } from '@/lib/abstractions/types';
import { RevokeAssociationDialog } from './RevokeAssociationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface OriginProofActionsProps {
  page: Page;
  variant?: 'default' | 'compact';
  onRevoked?: () => void;
}

export function OriginProofActions({ page, variant = 'default', onRevoked }: OriginProofActionsProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [bundleDownloaded, setBundleDownloaded] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyOriginLink(page);
    
    if (success) {
      setLinkCopied(true);
      toast.success('Origin Link copied', {
        description: 'Share this link to reference the origin',
      });
      
      // Reset after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadBundle = () => {
    try {
      downloadProofBundle(page);
      setBundleDownloaded(true);
      toast.success('Proof Bundle downloaded', {
        description: 'JSON file with verification data',
      });
      
      // Reset after 2 seconds
      setTimeout(() => setBundleDownloaded(false), 2000);
    } catch (error) {
      console.error('[OriginProofActions] Download failed:', error);
      toast.error('Failed to download proof bundle');
    }
  };

  // Compact variant: single dropdown with all actions
  if (variant === 'compact') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-codex-cream/60 hover:text-codex-gold hover:bg-codex-gold/10 h-8 px-2"
            >
              <Link2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-codex-ink-deep border-codex-cream/20 min-w-[200px]"
          >
            <DropdownMenuLabel className="text-codex-cream/50 text-xs font-normal">
              Origin Proof
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-codex-cream/10" />
            
            <DropdownMenuItem
              onClick={handleCopyLink}
              className="text-codex-cream hover:bg-codex-gold/10 hover:text-codex-gold cursor-pointer"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Origin Link
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={handleDownloadBundle}
              className="text-codex-cream hover:bg-codex-gold/10 hover:text-codex-gold cursor-pointer"
            >
              {bundleDownloaded ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Proof Bundle
                </>
              )}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-codex-cream/10" />
            
            <DropdownMenuItem
              onClick={() => setShowRevokeDialog(true)}
              className="text-codex-cream/60 hover:bg-codex-cream/5 hover:text-codex-cream cursor-pointer"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Laat dit begin los
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <RevokeAssociationDialog
          page={page}
          open={showRevokeDialog}
          onOpenChange={setShowRevokeDialog}
          onRevoked={onRevoked}
        />
      </>
    );
  }

  // Default variant: separate buttons
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopyLink}
          variant="ghost"
          size="sm"
          className="text-codex-cream/60 hover:text-codex-gold hover:bg-codex-gold/10 h-8"
        >
          {linkCopied ? (
            <>
              <Check className="w-4 h-4 mr-1 text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-1" />
              Origin Link
            </>
          )}
        </Button>
        
        <Button
          onClick={handleDownloadBundle}
          variant="ghost"
          size="sm"
          className="text-codex-cream/60 hover:text-codex-gold hover:bg-codex-gold/10 h-8"
        >
          {bundleDownloaded ? (
            <>
              <Check className="w-4 h-4 mr-1 text-green-400" />
              Downloaded
            </>
          ) : (
            <>
              <FileJson className="w-4 h-4 mr-1" />
              Proof
            </>
          )}
        </Button>
        
        <Button
          onClick={() => setShowRevokeDialog(true)}
          variant="ghost"
          size="sm"
          className="text-codex-cream/40 hover:text-codex-cream/70 hover:bg-codex-cream/5 h-8"
        >
          <UserMinus className="w-4 h-4 mr-1" />
          Laat los
        </Button>
      </div>
      
      <RevokeAssociationDialog
        page={page}
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        onRevoked={onRevoked}
      />
    </>
  );
}

