/**
 * Private Vault Settings
 * 
 * Allows users to opt-in to client-side encryption.
 * Includes clear warnings about key loss risk.
 */

import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  isPrivateVaultEnabled, 
  enablePrivateVault, 
  disablePrivateVault,
  exportVaultKeyForBackup,
  importVaultKeyFromBackup,
  hasVaultKey
} from '@/lib/crypto';
import { toast } from 'sonner';

interface PrivateVaultSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivateVaultSettings({ open, onOpenChange }: PrivateVaultSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showEnableWarning, setShowEnableWarning] = useState(false);
  const [backupKey, setBackupKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRestoreInput, setShowRestoreInput] = useState(false);
  const [restoreKeyInput, setRestoreKeyInput] = useState('');

  useEffect(() => {
    if (open) {
      setIsEnabled(isPrivateVaultEnabled());
      setBackupKey(null);
      setCopied(false);
    }
  }, [open]);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Show warning before enabling
      setShowEnableWarning(true);
    } else {
      // Disable immediately
      disablePrivateVault();
      setIsEnabled(false);
      toast.success('Private Vault disabled. New images will not be encrypted.');
    }
  };

  const handleConfirmEnable = async () => {
    try {
      const key = await enablePrivateVault();
      setBackupKey(key);
      setIsEnabled(true);
      setShowEnableWarning(false);
      toast.success('Private Vault enabled! Save your backup key now.');
    } catch (error) {
      console.error('Failed to enable Private Vault:', error);
      toast.error('Failed to enable Private Vault');
    }
  };

  const handleCopyKey = async () => {
    if (backupKey) {
      await navigator.clipboard.writeText(backupKey);
      setCopied(true);
      toast.success('Backup key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShowExistingKey = () => {
    const key = exportVaultKeyForBackup();
    if (key) {
      setBackupKey(key);
    } else {
      toast.error('No encryption key found');
    }
  };

  const handleRestoreKey = async () => {
    if (!restoreKeyInput.trim()) {
      toast.error('Please enter a backup key');
      return;
    }
    
    const success = await importVaultKeyFromBackup(restoreKeyInput.trim());
    if (success) {
      toast.success('Encryption key restored successfully');
      setShowRestoreInput(false);
      setRestoreKeyInput('');
    } else {
      toast.error('Invalid backup key');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Private Vault
            </DialogTitle>
            <DialogDescription>
              Encrypt your images before upload. Only you can read them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <div className="font-medium">Enable Private Vault</div>
                <div className="text-sm text-muted-foreground">
                  AES-256 encryption for all new images
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
              />
            </div>

            {/* Status Info */}
            {isEnabled ? (
              <Alert className="border-primary/50 bg-primary/5">
                <Shield className="h-4 w-4 text-primary" />
                <AlertTitle>Private Vault Active</AlertTitle>
                <AlertDescription>
                  New images are encrypted before upload. Existing unencrypted images remain accessible.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Standard Mode</AlertTitle>
                <AlertDescription>
                  Images are stored securely on our servers but are not end-to-end encrypted.
                </AlertDescription>
              </Alert>
            )}

            {/* Backup Key Section */}
            {backupKey && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  <Key className="h-4 w-4" />
                  Your Backup Key (save this!)
                </div>
                <div className="relative">
                  <code className="block p-3 pr-12 rounded-lg bg-muted text-xs font-mono break-all">
                    {backupKey}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1.5 right-1.5 h-7 w-7"
                    onClick={handleCopyKey}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store this key safely. Without it, you cannot decrypt your images on a new device.
                </p>
              </div>
            )}

            {/* Key Management */}
            {isEnabled && !backupKey && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowExistingKey}
                  className="flex-1"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Show Backup Key
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRestoreInput(true)}
                  className="flex-1"
                >
                  Restore Key
                </Button>
              </div>
            )}

            {/* Restore Key Input */}
            {showRestoreInput && (
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 rounded-lg border bg-background text-xs font-mono resize-none"
                  rows={3}
                  placeholder="Paste your backup key here..."
                  value={restoreKeyInput}
                  onChange={(e) => setRestoreKeyInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleRestoreKey}>
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowRestoreInput(false);
                      setRestoreKeyInput('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enable Warning Dialog */}
      <Dialog open={showEnableWarning} onOpenChange={setShowEnableWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Important Warning
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Key Loss = Data Loss</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>
                  If you enable Private Vault and lose your encryption key:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your encrypted images become <strong>permanently unreadable</strong></li>
                  <li>We cannot recover your data — this is by design</li>
                  <li>Switching devices without your key = lost access</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground">
              Only enable this if you:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Need maximum privacy (zero-knowledge)</li>
                <li>Will securely store your backup key</li>
                <li>Accept the risk of permanent data loss</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEnableWarning(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmEnable}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              I Understand, Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
