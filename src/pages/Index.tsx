import { useState, useEffect, useCallback } from 'react';

import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { CameraView } from '@/components/capture/CameraView';
import { ProcessingView } from '@/components/capture/ProcessingView';
import { SnapshotView, SnapshotMatchInfo } from '@/components/codex/SnapshotView';
import { HistoryView } from '@/components/codex/HistoryView';
import { CapsuleCarouselView } from '@/components/codex/CapsuleCarouselView';
import { TestPanel } from '@/components/dev/TestPanel';
import { PatternsView } from '@/components/codex/PatternsView';
import { PersonalityView } from '@/components/codex/PersonalityView';
import { KompasView } from '@/components/codex/KompasView';
import { YearReflectionView } from '@/components/codex/YearReflectionView';
import { SearchView, SearchMatchInfo } from '@/components/codex/SearchView';
import { MemoryOrbitView } from '@/components/codex/MemoryOrbitView';
import { ShareMemoryCard } from '@/components/codex/ShareMemoryCard';
import { 
  initializeDeviceId, 
  hasCompletedOnboarding, 
  completeOnboarding 
} from '@/lib/deviceId';
import { usePages } from '@/hooks/usePages';
import { Page, CapsulePages, getCapsulePages, confirmFutureYouCues } from '@/lib/pageService';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoModeContext';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail' | 'patterns' | 'personality' | 'kompas' | 'year-reflection' | 'kompas-empty' | 'patterns-empty' | 'personality-empty' | 'add-to-capsule' | 'capsule-carousel' | 'search' | 'orbit' | 'share';

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
  
  // Post-capture state (we keep this for backward compatibility in SnapshotView)
  const [suggestedCues, setSuggestedCues] = useState<string[]>([]);
  
  // Processing gate: AI finishes first, then user must enter + confirm cues to proceed
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [pendingPagesToCue, setPendingPagesToCue] = useState<Page[] | null>(null);
  
  // Search match info (to show "why matched" in SnapshotView)
  const [searchMatchInfo, setSearchMatchInfo] = useState<SnapshotMatchInfo | null>(null);
  
  // Initial search query (when clicking a cue to search)
  const [initialSearchQuery, setInitialSearchQuery] = useState<string | null>(null);

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
    setIsProcessingComplete(false);
    setPendingPagesToCue(null);
    setView('processing');
    
    try {
      // Real AI processing via backend function
      const result = await createPage(imageDataUrl);
      
      if (result) {
        // Wait for user cues confirmation before going to snapshot
        setPendingPagesToCue([result.page]);
        setIsProcessingComplete(true);
      } else {
        toast.error('Failed to process page. Please try again.');
        setView('camera');
        setCapturedImage(null);
        setCapturedImages([]);
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('camera');
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [createPage]);

  // Handle user confirming cues in ProcessingView
  const handleProcessingContinue = useCallback(async (userCues: string[]) => {
    if (!pendingPagesToCue || pendingPagesToCue.length === 0) return;

    const normalized = userCues
      .map(c => c.trim())
      .filter(Boolean)
      .slice(0, 5);
    const uniqueCues = Array.from(new Set(normalized)).slice(0, 5);

    if (uniqueCues.length === 0) return;

    try {
      const saves = await Promise.all(
        pendingPagesToCue.map(p => confirmFutureYouCues(p.id, uniqueCues, true))
      );

      if (!saves.every(Boolean)) {
        toast.error('Failed to save your cues. Please try again.');
        return;
      }

      // Update local cache so the Memory book spines update immediately
      const updatedPages = pendingPagesToCue.map(p => ({ ...p, futureYouCues: uniqueCues }));
      updatedPages.forEach(p => updatePage(p));

      // Open snapshot for the first page in this processing batch
      setCurrentPage(updatedPages[0]);
      setSuggestedCues(uniqueCues);
      setIsNewCapture(true);
      setView('snapshot');

      // Clean up processing state
      setCapturedImage(null);
      setCapturedImages([]);
      setPendingPagesToCue(null);
      setIsProcessingComplete(false);
      setTargetCapsuleId(null);
    } catch (e) {
      console.error('[Index] Failed to confirm cues:', e);
      toast.error('Failed to save your cues. Please try again.');
    }
  }, [pendingPagesToCue, updatePage]);

  const handleCaptureMultiple = useCallback(async (imageDataUrls: string[]) => {
    if (imageDataUrls.length === 0) return;
    
    setCapturedImages(imageDataUrls);
    setCapturedImage(imageDataUrls[0]);
    setProcessingIndex(0);
    setIsProcessingComplete(false);
    setPendingPagesToCue(null);
    setView('processing');
    
    try {
      // Process all images as a capsule
      const result = await createCapsule(imageDataUrls);
      
      if (result && result.pages.length > 0) {
        // Require user confirmation before snapshot (applies cues to all pages in this batch)
        setPendingPagesToCue(result.pages);
        setIsProcessingComplete(true);
      } else {
        toast.error('Failed to process pages. Please try again.');
        setView('camera');
        setCapturedImage(null);
        setCapturedImages([]);
      }
    } catch (error) {
      console.error('Capsule capture error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('camera');
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [createCapsule]);

  // Handle adding to existing capsule
  const handleAddToCapsuleCapture = useCallback(async (imageDataUrl: string) => {
    if (!targetCapsuleId) {
      toast.error('No capsule selected');
      setView('history');
      return;
    }
    
    setCapturedImage(imageDataUrl);
    setCapturedImages([imageDataUrl]);
    setIsProcessingComplete(false);
    setPendingPagesToCue(null);
    setView('processing');
    
    try {
      const result = await addToCapsule(imageDataUrl, targetCapsuleId);
      
      if (result) {
        setPendingPagesToCue([result.page]);
        setIsProcessingComplete(true);
      } else {
        toast.error('Failed to add page. Please try again.');
        setView('history');
        setCapturedImage(null);
        setCapturedImages([]);
      }
    } catch (error) {
      console.error('Add to capsule error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('history');
      setCapturedImage(null);
      setCapturedImages([]);
    } finally {
      setTargetCapsuleId(null);
    }
  }, [addToCapsule, targetCapsuleId]);

  // Handle opening search
  const handleOpenSearch = useCallback(() => {
    setInitialSearchQuery(null); // Clear any previous query
    setView('search');
  }, []);

  // Handle search with a specific cue (clicking on a cue word)
  const handleSearchCue = useCallback((cue: string) => {
    setInitialSearchQuery(cue);
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
    setIsNewCapture(false);
    setView('history');
  }, []);

  // After snapshot, go directly to Memory to see new acquisition
  const handleViewMemory = useCallback(async () => {
    // Refresh pages to ensure new capture is included
    await refresh();
    
    // Highlight the new page for a few seconds
    if (isNewCapture && currentPage) {
      setHighlightPageId(currentPage.id);
      setTimeout(() => setHighlightPageId(null), 5000);
    }
    setIsNewCapture(false);
    setView('history');
  }, [isNewCapture, currentPage, refresh]);

  const handleSelectPage = useCallback((page: Page) => {
    setCurrentPage(page);
    setSearchMatchInfo(null); // Clear match info when not coming from search
    setIsNewCapture(false);
    setView('detail');
  }, []);

  const handleBackFromHistory = useCallback(() => {
    setView('search');  // Back from History goes to Search-first
  }, []);

  const handleBackFromDetail = useCallback(async () => {
    // Refresh pages to pick up any changes made in the detail view
    await refresh();

    // If we came from a capsule, also refresh the capsule payload itself.
    // Otherwise the carousel can hold on to a stale page object (e.g. missing highlights).
    if (currentCapsule) {
      try {
        const updatedCapsulePages = await getCapsulePages(currentCapsule.capsuleId);
        setCurrentCapsule({
          capsuleId: currentCapsule.capsuleId,
          pages: [...updatedCapsulePages].sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0)),
        });
      } catch (e) {
        console.warn('[Index] Failed to refresh capsule pages', e);
      }
      setView('history');
      return;
    }

    setView('history');
  }, [currentCapsule, refresh]);

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

  const handleViewOrbit = useCallback(() => {
    setView('orbit');
  }, []);

  const handleBackFromOrbit = useCallback(() => {
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

  // Dev button visibility logic:
  // - In Demo Mode: Only show on Memory views (history, patterns, personality, kompas, search)
  // - Not in Demo Mode: Show on all views except onboarding
  const isMemoryView = ['history', 'detail', 'patterns', 'personality', 'kompas', 'year-reflection', 'search', 'capsule-carousel', 'orbit'].includes(view);
  const showDevButton = view !== 'onboarding' && (!isDemoMode || isMemoryView);
  
  const DevButton = showDevButton && (
    <button
      onClick={() => setShowTestPanel(true)}
      className="fixed bottom-6 left-6 z-50 w-10 h-10 flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
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
            onOpenHistory={handleOpenSearch}  // Boekje gaat naar Search-first
          />
        );
      
      case 'processing':
        return capturedImage ? (
          <ProcessingView 
            imageUrl={capturedImage}
            totalImages={capturedImages.length}
            currentIndex={processingIndex}
            currentPageCount={pages.length}
            isProcessingComplete={isProcessingComplete}
            onContinue={handleProcessingContinue}
          />
        ) : null;
      
      case 'snapshot':
        return currentPage ? (
          <SnapshotView
            page={currentPage}
            onClose={handleCloseSnapshot}
            onViewHistory={handleViewMemory}  // Go directly to Memory to see new acquisition
            isNewCapture={isNewCapture}
            onPageUpdate={handlePageUpdate}
            isDemoMode={isDemoMode}
            suggestedCues={isNewCapture ? suggestedCues : undefined}
            allPages={pages}
            onNavigateToPage={(page, matchInfo) => {
              setCurrentPage(page);
              setSearchMatchInfo(matchInfo || null);
              setIsNewCapture(false);
            }}
            onSearchCue={handleSearchCue}
          />
        ) : null;
      
      case 'history':
        return (
          <HistoryView
            pages={pages}
            onBack={handleBackFromHistory}
            onCapture={() => setView('camera')}
            onSelectPage={handleSelectPage}
            onSelectCapsule={(capsule) => {
              // Open carousel view to browse/manage all pages in capsule
              if (capsule.pages.length > 0) {
                setCurrentCapsule(capsule);
                setView('capsule-carousel');
              }
            }}
            onDeletePage={handleDeletePage}
            onAddToCapsule={handleStartAddToCapsule}
            // In Demo Mode, hide all extended features
            onViewPatterns={isDemoMode ? undefined : handleViewPatterns}
            onViewPersonality={isDemoMode ? undefined : handleViewPersonality}
            onViewKompas={isDemoMode ? undefined : handleViewKompas}
            onViewYearReflection={isDemoMode ? undefined : handleViewYearReflection}
            onViewOrbit={handleViewOrbit}
            onOpenSearch={handleOpenSearch}
            onShareMemory={() => setView('share')}
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
              if (!currentCapsule) return;
              await refresh();
              try {
                const updatedCapsulePages = await getCapsulePages(currentCapsule.capsuleId);
                setCurrentCapsule({
                  capsuleId: currentCapsule.capsuleId,
                  pages: [...updatedCapsulePages].sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0)),
                });
              } catch (e) {
                console.warn('[Index] Failed to refresh capsule pages (onCapsuleUpdated)', e);
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
            matchInfo={searchMatchInfo || undefined}
            allPages={pages}
            onNavigateToPage={(page, matchInfo) => {
              setCurrentPage(page);
              setSearchMatchInfo(matchInfo || null);
            }}
            onSearchCue={handleSearchCue}
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
            onClose={() => setView('camera')}  // Back arrow goes to camera
            onSelectPage={(page, matchInfo) => {
              setCurrentPage(page);
              setSearchMatchInfo(matchInfo || null);
              setIsNewCapture(false);
              setView('detail');
            }}
            onBrowseAll={() => setView('history')}  // "Browse all" goes to Memory
            initialQuery={initialSearchQuery || undefined}
          />
        );
      
      case 'orbit':
        return (
          <MemoryOrbitView
            pages={pages}
            onBack={handleBackFromOrbit}
            onSelectPage={handleSelectPage}
            onOpenSearch={handleOpenSearch}
            highlightPageId={highlightPageId || undefined}
          />
        );
      
      case 'share':
        return (
          <ShareMemoryCard onBack={() => setView('history')} />
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
        />
      )}
    </>
  );
};

export default Index;
