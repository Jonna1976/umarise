import { useState } from 'react';
import { Download, Loader2, FileJson, FileArchive, ChevronDown, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportPagesAsJSON, exportPagesAsZIP, exportSelectedPagesAsJSON, exportSelectedPagesAsZIP, ExportProgress } from '@/lib/exportService';
import { toast } from 'sonner';

interface ExportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  selectedPageIds?: string[];
  onClearSelection?: () => void;
}

export function ExportButton({ 
  variant = 'outline', 
  size = 'sm', 
  showLabel = true,
  selectedPageIds = [],
  onClearSelection
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'json' | 'zip' | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const hasSelection = selectedPageIds.length > 0;

  const handleExportJSON = async () => {
    setIsExporting(true);
    setExportType('json');
    try {
      if (hasSelection) {
        await exportSelectedPagesAsJSON(selectedPageIds);
        toast.success(`Exported ${selectedPageIds.length} pages as JSON`);
        onClearSelection?.();
      } else {
        await exportPagesAsJSON();
        toast.success('Export complete', {
          description: 'Your pages have been downloaded as JSON',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Could not export pages',
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportZIP = async () => {
    setIsExporting(true);
    setExportType('zip');
    setProgress({ current: 0, total: 0, status: 'Preparing export...' });
    
    try {
      if (hasSelection) {
        await exportSelectedPagesAsZIP(selectedPageIds, (p) => setProgress(p));
        toast.success(`Exported ${selectedPageIds.length} pages as ZIP`);
        onClearSelection?.();
      } else {
        await exportPagesAsZIP((p) => setProgress(p));
        toast.success('ZIP export complete', {
          description: 'Your pages and images have been downloaded',
        });
      }
    } catch (error) {
      console.error('ZIP export failed:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Could not export pages',
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
      setProgress(null);
    }
  };

  const buttonLabel = hasSelection 
    ? `Export (${selectedPageIds.length})` 
    : 'Export';

  // Icon-only mode
  if (size === 'icon' && !showLabel) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            disabled={isExporting}
            className={`relative ${hasSelection ? 'ring-2 ring-codex-gold' : ''}`}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasSelection ? (
              <CheckSquare className="h-4 w-4 text-codex-gold" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {hasSelection && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-codex-gold text-codex-ink-deep text-[10px] font-bold rounded-full flex items-center justify-center">
                {selectedPageIds.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border-border">
          {hasSelection && (
            <>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {selectedPageIds.length} pages selected
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
            <FileJson className="h-4 w-4 mr-2" />
            {hasSelection ? 'Export selected as JSON' : 'Export as JSON'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportZIP} className="cursor-pointer">
            <FileArchive className="h-4 w-4 mr-2" />
            {hasSelection ? 'Export selected as ZIP' : 'Export as ZIP (with images)'}
          </DropdownMenuItem>
          {hasSelection && onClearSelection && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearSelection} className="cursor-pointer text-muted-foreground">
                Clear selection
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
          className={`gap-2 text-foreground ${hasSelection ? 'ring-2 ring-codex-gold' : ''}`}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {showLabel && (
                <span>
                  {exportType === 'zip' && progress 
                    ? `${progress.current}/${progress.total}` 
                    : 'Exporting...'}
                </span>
              )}
            </>
          ) : (
            <>
              {hasSelection ? (
                <CheckSquare className="h-4 w-4 text-codex-gold" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {showLabel && <span>{buttonLabel}</span>}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border">
        {hasSelection && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {selectedPageIds.length} pages selected
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer text-foreground">
          <FileJson className="h-4 w-4 mr-2" />
          {hasSelection ? 'Export selected as JSON' : 'Export as JSON (metadata only)'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportZIP} className="cursor-pointer text-foreground">
          <FileArchive className="h-4 w-4 mr-2" />
          {hasSelection ? 'Export selected as ZIP' : 'Export as ZIP (with images)'}
        </DropdownMenuItem>
        {hasSelection && onClearSelection && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearSelection} className="cursor-pointer text-muted-foreground">
              Clear selection
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
