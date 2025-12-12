import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { CameraView } from '@/components/capture/CameraView';
import { ProcessingView } from '@/components/capture/ProcessingView';
import { SnapshotView } from '@/components/codex/SnapshotView';
import { HistoryView } from '@/components/codex/HistoryView';
import { TestPanel } from '@/components/dev/TestPanel';
import { PatternsView } from '@/components/dev/PatternsView';
import { 
  initializeDeviceId, 
  hasCompletedOnboarding, 
  completeOnboarding 
} from '@/lib/deviceId';
import { usePages } from '@/hooks/usePages';
import { Page } from '@/lib/pageService';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail' | 'patterns';

const Index = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isNewCapture, setIsNewCapture] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  // Use real pages from database
  const { pages, createPage, updatePage, deletePage, refresh } = usePages();

  // Handle page update from SnapshotView
  const handlePageUpdate = useCallback((updatedPage: Page) => {
    updatePage(updatedPage);
    setCurrentPage(updatedPage);
  }, [updatePage]);

  // Initialize on mount
  useEffect(() => {
    const id = initializeDeviceId();
    setDeviceId(id);
    
    if (hasCompletedOnboarding()) {
      setView('camera');
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
    setView('camera');
  }, []);

  const handleCapture = useCallback(async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setView('processing');
    
    try {
      // Real AI processing via edge function
      const newPage = await createPage(imageDataUrl);
      
      if (newPage) {
        setCurrentPage(newPage);
        setIsNewCapture(true);
        setView('snapshot');
      } else {
        // Failed - go back to camera
        toast.error('Failed to process page. Please try again.');
        setView('camera');
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('camera');
    } finally {
      setCapturedImage(null);
    }
  }, [createPage]);

  const handleCloseSnapshot = useCallback(() => {
    setCapturedImage(null);
    setCurrentPage(null);
    setIsNewCapture(false);
    setView('camera');
  }, []);

  const handleOpenHistory = useCallback(() => {
    setIsNewCapture(false);
    setView('history');
  }, []);

  const handleSelectPage = useCallback((page: Page) => {
    setCurrentPage(page);
    setIsNewCapture(false);
    setView('detail');
  }, []);

  const handleBackFromHistory = useCallback(() => {
    setView('camera');
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setView('history');
  }, []);

  const handleViewPatterns = useCallback(() => {
    setView('patterns');
  }, []);

  const handleBackFromPatterns = useCallback(() => {
    setView('history');
  }, []);

  const handleLoadTestData = useCallback(() => {
    // Test data loading is no longer supported with real database
    // Just close panel and refresh
    setShowTestPanel(false);
    refresh();
    setView('history');
  }, [refresh]);

  const handleViewTestPage = useCallback((page: Page) => {
    setCurrentPage(page);
    setIsNewCapture(false);
    setShowTestPanel(false);
    setView('detail');
  }, []);

  // Handle page deletion from history
  const handleDeletePage = useCallback(async (pageId: string) => {
    await deletePage(pageId);
  }, [deletePage]);

  // Dev button (only visible when not in onboarding)
  const DevButton = view !== 'onboarding' && (
    <button
      onClick={() => setShowTestPanel(true)}
      className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-codex-sepia/90 text-primary-foreground shadow-lg flex items-center justify-center hover:bg-codex-sepia transition-colors"
      title="Open Test Panel"
    >
      <FlaskConical className="w-5 h-5" />
    </button>
  );

  // Render based on current view
  const renderView = () => {
    switch (view) {
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      
      case 'camera':
        return (
          <CameraView 
            onCapture={handleCapture} 
            onOpenHistory={handleOpenHistory} 
          />
        );
      
      case 'processing':
        return capturedImage ? (
          <ProcessingView imageUrl={capturedImage} />
        ) : null;
      
      case 'snapshot':
        return currentPage ? (
          <SnapshotView
            page={currentPage}
            onClose={handleCloseSnapshot}
            onViewHistory={handleOpenHistory}
            isNewCapture={isNewCapture}
            onPageUpdate={handlePageUpdate}
          />
        ) : null;
      
      case 'history':
        return (
          <HistoryView
            pages={pages}
            onBack={handleBackFromHistory}
            onSelectPage={handleSelectPage}
            onDeletePage={handleDeletePage}
            onViewPatterns={handleViewPatterns}
          />
        );
      
      case 'patterns':
        return (
          <PatternsView onBack={handleBackFromPatterns} />
        );
      
      case 'detail':
        return currentPage ? (
          <SnapshotView
            page={currentPage}
            onClose={handleBackFromDetail}
            onViewHistory={handleOpenHistory}
            isNewCapture={false}
            onPageUpdate={handlePageUpdate}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}
      {DevButton}
      
      <AnimatePresence>
        {showTestPanel && (
          <TestPanel
            onClose={() => setShowTestPanel(false)}
            onLoadTestData={handleLoadTestData}
            onViewPage={handleViewTestPage}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
