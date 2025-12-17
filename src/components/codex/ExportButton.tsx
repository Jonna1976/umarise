import { useState } from 'react';
import { Download, Loader2, FileJson, FileArchive, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportPagesAsJSON, exportPagesAsZIP, ExportProgress } from '@/lib/exportService';
import { toast } from 'sonner';

interface ExportButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function ExportButton({ variant = 'outline', size = 'sm', showLabel = true }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'json' | 'zip' | null>(null);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const handleExportJSON = async () => {
    setIsExporting(true);
    setExportType('json');
    try {
      await exportPagesAsJSON();
      toast.success('Export complete', {
        description: 'Your pages have been downloaded as JSON',
      });
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
      await exportPagesAsZIP((p) => setProgress(p));
      toast.success('ZIP export complete', {
        description: 'Your pages and images have been downloaded',
      });
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

  // Icon-only mode
  if (size === 'icon' && !showLabel) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            disabled={isExporting}
            className="relative"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background border-border">
          <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportZIP} className="cursor-pointer">
            <FileArchive className="h-4 w-4 mr-2" />
            Export as ZIP (with images)
          </DropdownMenuItem>
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
          className="gap-2 text-foreground"
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
              <Download className="h-4 w-4" />
              {showLabel && <span>Export</span>}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border">
        <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer text-foreground">
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON (metadata only)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportZIP} className="cursor-pointer text-foreground">
          <FileArchive className="h-4 w-4 mr-2" />
          Export as ZIP (with images)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
