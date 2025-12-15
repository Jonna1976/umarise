import { useState, useEffect, useCallback } from 'react';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { CameraView } from '@/components/capture/CameraView';
import { ProcessingView } from '@/components/capture/ProcessingView';
import { SnapshotView } from '@/components/codex/SnapshotView';
import { HistoryView } from '@/components/codex/HistoryView';
import { CapsuleCarouselView } from '@/components/codex/CapsuleCarouselView';
import { TestPanel } from '@/components/dev/TestPanel';
import { PatternsView } from '@/components/codex/PatternsView';
import { PersonalityView } from '@/components/codex/PersonalityView';
import { KompasView } from '@/components/codex/KompasView';
import { YearReflectionView } from '@/components/codex/YearReflectionView';
import { SearchView } from '@/components/codex/SearchView';
import { 
  initializeDeviceId, 
  hasCompletedOnboarding, 
  completeOnboarding 
} from '@/lib/deviceId';
import { usePages } from '@/hooks/usePages';
import { Page, CapsulePages } from '@/lib/pageService';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoModeContext';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail' | 'patterns' | 'personality' | 'kompas' | 'year-reflection' | 'kompas-empty' | 'patterns-empty' | 'personality-empty' | 'add-to-capsule' | 'capsule-carousel' | 'search';

const Index = () => {
  const { isDemoMode } = useDemoMode();
  const [view, setView] = useState<AppView>('onboarding');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isNewCapture, setIsNewCapture] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [highlightPageId, setHighlightPageId] = useState<string | null>(null);
  
  // Use real pages from database
  const { pages, createPage, createCapsule, addToCapsule, updatePage, deletePage, refresh } = usePages();
  
  // Multi-image processing state
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [targetCapsuleId, setTargetCapsuleId] = useState<string | null>(null);
  const [currentCapsule, setCurrentCapsule] = useState<CapsulePages | null>(null);
  
  // Post-capture state (now inline in SnapshotView, but we still track suggested cues)
  const [suggestedCues, setSuggestedCues] = useState<string[]>([]);

  // Handle page update from SnapshotView
  // Note: The actual database save already happens in SnapshotView
  // Here we just update the local state to keep UI in sync
  const handlePageUpdate = useCallback((updatedPage: Page) => {
    // Update the pages array directly without re-saving
    updatePage(updatedPage);
    // Also update currentPage to ensure immediate UI feedback
    setCurrentPage(updatedPage);
  }, [updatePage]);

  // Initialize on mount
  useEffect(() => {
    const id = initializeDeviceId();
    setDeviceId(id);
    
    // In Demo Mode, skip onboarding entirely
    if (isDemoMode || hasCompletedOnboarding()) {
      setView('camera');
    }
  }, [isDemoMode]);

  // When demo mode changes, adjust view accordingly
  useEffect(() => {
    if (isDemoMode && view === 'onboarding') {
      setView('camera');
    }
  }, [isDemoMode, view]);

  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
    setView('camera');
  }, []);

  const handleCapture = useCallback(async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setCapturedImages([imageDataUrl]);
    setProcessingIndex(0);
    setView('processing');
    
    try {
      // Real AI processing via edge function
      const result = await createPage(imageDataUrl);
      
      if (result) {
        // Go directly to SnapshotView with suggested cues (no separate post-capture step)
        setCurrentPage(result.page);
        setSuggestedCues(isDemoMode ? [] : result.suggestedCues);
        setIsNewCapture(true);
        setView('snapshot');
      } else {
        toast.error('Failed to process page. Please try again.');
        setView('camera');
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('camera');
    } finally {
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [createPage, isDemoMode]);

  const handleCaptureMultiple = useCallback(async (imageDataUrls: string[]) => {
    if (imageDataUrls.length === 0) return;
    
    setCapturedImages(imageDataUrls);
    setCapturedImage(imageDataUrls[0]);
    setProcessingIndex(0);
    setView('processing');
    
    try {
      // Process all images as a capsule
      const result = await createCapsule(imageDataUrls);
      
      if (result && result.pages.length > 0) {
        // Go directly to SnapshotView with first page and its cues
        setCurrentPage(result.pages[0]);
        setSuggestedCues(isDemoMode ? [] : (result.suggestedCuesPerPage[0] || []));
        setIsNewCapture(true);
        setView('snapshot');
      } else {
        toast.error('Failed to process pages. Please try again.');
        setView('camera');
      }
    } catch (error) {
      console.error('Capsule capture error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('camera');
    } finally {
      setCapturedImage(null);
      setCapturedImages([]);
      setProcessingIndex(0);
    }
  }, [createCapsule, isDemoMode]);

  // Handle adding to existing capsule
  const handleAddToCapsuleCapture = useCallback(async (imageDataUrl: string) => {
    if (!targetCapsuleId) {
      toast.error('No capsule selected');
      setView('history');
      return;
    }
    
    setCapturedImage(imageDataUrl);
    setView('processing');
    
    try {
      const result = await addToCapsule(imageDataUrl, targetCapsuleId);
      
      if (result) {
        // Go directly to SnapshotView
        setCurrentPage(result.page);
        setSuggestedCues(isDemoMode ? [] : result.suggestedCues);
        setIsNewCapture(true);
        setView('snapshot');
      } else {
        toast.error('Failed to add page. Please try again.');
        setView('history');
      }
    } catch (error) {
      console.error('Add to capsule error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('history');
    } finally {
      setCapturedImage(null);
      setTargetCapsuleId(null);
    }
  }, [addToCapsule, targetCapsuleId, isDemoMode]);

  // Handle opening search
  const handleOpenSearch = useCallback(() => {
    setView('search');
  }, []);

  // Handle request to add to a specific capsule
  const handleStartAddToCapsule = useCallback((capsuleId: string) => {
    setTargetCapsuleId(capsuleId);
    setView('add-to-capsule');
  }, []);

  const handleCloseSnapshot = useCallback(() => {
    setCapturedImage(null);
    setCurrentPage(null);
    setIsNewCapture(false);
    setView('camera');
  }, []);

  const handleOpenHistory = useCallback(() => {
    // If coming from a new capture, highlight that page in the timeline
    if (isNewCapture && currentPage) {
      setHighlightPageId(currentPage.id);
      // Clear highlight after animation completes
      setTimeout(() => setHighlightPageId(null), 5000);
    }
    setIsNewCapture(false);
    setView('history');
  }, [isNewCapture, currentPage]);

  const handleSelectPage = useCallback((page: Page) => {
    setCurrentPage(page);
    setIsNewCapture(false);
    setView('detail');
  }, []);

  const handleBackFromHistory = useCallback(() => {
    setView('camera');
  }, []);

  const handleBackFromDetail = useCallback(() => {
    // Return to capsule carousel if we came from there
    if (currentCapsule) {
      setView('capsule-carousel');
    } else {
      setView('history');
    }
  }, [currentCapsule]);

  const handleViewPatterns = useCallback(() => {
    setView('patterns');
  }, []);

  const handleBackFromPatterns = useCallback(() => {
    setView('history');
  }, []);

  const handleViewPersonality = useCallback(() => {
    setView('personality');
  }, []);

  const handleBackFromPersonality = useCallback(() => {
    setView('history');
  }, []);

  const handleViewKompas = useCallback(() => {
    setView('kompas');
  }, []);

  const handleBackFromKompas = useCallback(() => {
    setView('history');
  }, []);

  const handleViewYearReflection = useCallback(() => {
    setView('year-reflection');
  }, []);

  const handleBackFromYearReflection = useCallback(() => {
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
            onCaptureMultiple={handleCaptureMultiple}
            onOpenHistory={handleOpenHistory} 
          />
        );
      
      case 'processing':
        return capturedImage ? (
          <ProcessingView 
            imageUrl={capturedImage}
            totalImages={capturedImages.length}
            currentIndex={processingIndex}
            currentPageCount={pages.length}
          />
        ) : null;
      
      case 'snapshot':
        return currentPage ? (
          <SnapshotView
            page={currentPage}
            onClose={handleCloseSnapshot}
            onViewHistory={handleOpenHistory}
            isNewCapture={isNewCapture}
            onPageUpdate={handlePageUpdate}
            isDemoMode={isDemoMode}
            suggestedCues={isNewCapture ? suggestedCues : undefined}
          />
        ) : null;
      
      case 'history':
        return (
          <HistoryView
            pages={pages}
            onBack={handleBackFromHistory}
            onSelectPage={handleSelectPage}
            onSelectCapsule={(capsule) => {
              setCurrentCapsule(capsule);
              setView('capsule-carousel');
            }}
            onDeletePage={handleDeletePage}
            onAddToCapsule={handleStartAddToCapsule}
            // In Demo Mode, hide all extended features
            onViewPatterns={isDemoMode ? undefined : handleViewPatterns}
            onViewPersonality={isDemoMode ? undefined : handleViewPersonality}
            onViewKompas={isDemoMode ? undefined : handleViewKompas}
            onViewYearReflection={isDemoMode ? undefined : handleViewYearReflection}
            onOpenSearch={isDemoMode ? undefined : handleOpenSearch}
            highlightPageId={highlightPageId || undefined}
          />
        );
      
      case 'capsule-carousel':
        return currentCapsule ? (
          <CapsuleCarouselView
            capsule={currentCapsule}
            onClose={() => {
              setCurrentCapsule(null);
              setView('history');
            }}
            onSelectPage={(page) => {
              setCurrentPage(page);
              setIsNewCapture(false);
              setView('detail');
            }}
            onCapsuleUpdated={async () => {
              await refresh();
              // Re-fetch capsule with updated data
              const updatedPages = pages.filter(p => p.capsuleId === currentCapsule.capsuleId);
              if (updatedPages.length > 0) {
                setCurrentCapsule({
                  capsuleId: currentCapsule.capsuleId,
                  pages: updatedPages.sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0))
                });
              }
            }}
            onPageDeleted={async (pageId) => {
              await refresh();
              // Re-fetch capsule with remaining pages
              const remainingPages = pages.filter(p => p.capsuleId === currentCapsule.capsuleId && p.id !== pageId);
              if (remainingPages.length > 0) {
                setCurrentCapsule({
                  capsuleId: currentCapsule.capsuleId,
                  pages: remainingPages.sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0))
                });
              } else {
                // No pages left, close carousel
                setCurrentCapsule(null);
                setView('history');
              }
            }}
          />
        ) : null;
      
      case 'add-to-capsule':
        return (
          <CameraView 
            onCapture={handleAddToCapsuleCapture}
            onCaptureMultiple={(images) => {
              // For adding to capsule, just use first image
              if (images.length > 0) {
                handleAddToCapsuleCapture(images[0]);
              }
            }}
            onOpenHistory={() => {
              setTargetCapsuleId(null);
              setView('history');
            }}
          />
        );
      
      case 'patterns':
        return (
          <PatternsView onBack={handleBackFromPatterns} />
        );
      
      case 'personality':
        return (
          <PersonalityView onBack={handleBackFromPersonality} />
        );
      
      case 'kompas':
        return (
          <KompasView pages={pages} onBack={handleBackFromKompas} />
        );
      
      case 'year-reflection':
        return (
          <YearReflectionView onBack={handleBackFromYearReflection} />
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
      
      // Empty state previews for testing
      case 'kompas-empty':
        return (
          <KompasView pages={[]} onBack={handleBackFromKompas} />
        );
      
      case 'patterns-empty':
        return (
          <PatternsView onBack={handleBackFromPatterns} forceEmpty />
        );
      
      case 'personality-empty':
        return (
          <PersonalityView onBack={handleBackFromPersonality} forceEmpty />
        );
      
      // post-capture view removed - cues now inline in SnapshotView
      
      case 'search':
        return (
          <SearchView
            onClose={() => setView('history')}
            onSelectPage={(page) => {
              setCurrentPage(page);
              setIsNewCapture(false);
              setView('detail');
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {renderView()}
      {DevButton}
      
      {showTestPanel && (
        <TestPanel
          onClose={() => setShowTestPanel(false)}
          onLoadTestData={handleLoadTestData}
          onViewPage={handleViewTestPage}
          onPreviewEmptyKompas={() => {
            setShowTestPanel(false);
            setView('kompas-empty');
          }}
          onPreviewEmptyPatterns={() => {
            setShowTestPanel(false);
            setView('patterns-empty');
          }}
          onPreviewEmptyPersonality={() => {
            setShowTestPanel(false);
            setView('personality-empty');
          }}
        />
      )}
    </>
  );
};

export default Index;
