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
import { useMarks } from '@/hooks/useMarks';
import { Page, CapsulePages, getCapsulePages } from '@/lib/pageService';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { useDemoMode } from '@/contexts/DemoModeContext';

import { CueIndex } from '@/components/codex/CueIndex';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail' | 'patterns' | 'personality' | 'kompas' | 'year-reflection' | 'kompas-empty' | 'patterns-empty' | 'personality-empty' | 'add-to-capsule' | 'capsule-carousel' | 'search' | 'orbit' | 'share' | 'cue-index';

const Index = () => {
  const { isDemoMode } = useDemoMode();
  const [view, setView] = useState<AppView>('onboarding');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isNewCapture, setIsNewCapture] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [highlightPageId, setHighlightPageId] = useState<string | null>(null);
  
  // Read pages from database (for history/search views)
  const { pages, isLoading, updatePage, deletePage, refresh } = usePages();
  // Local-first mark creation (no server image upload)
  const { createMark } = useMarks();
  
  // Multi-image processing state
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [targetCapsuleId, setTargetCapsuleId] = useState<string | null>(null);
  const [currentCapsule, setCurrentCapsule] = useState<CapsulePages | null>(null);
  
  // Post-capture state (we keep this for backward compatibility in SnapshotView)
  const [suggestedCues, setSuggestedCues] = useState<string[]>([]);
  
  // AI-suggested cues from processing (to prefill in ProcessingView)
  const [aiSuggestedCues, setAiSuggestedCues] = useState<string[]>([]);
  
  // Processing gate: mark creation finishes, then user proceeds
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);
  const [capturedMarkInfo, setCapturedMarkInfo] = useState<{
    id: string;
    originId: string;
    hash: string;
    timestamp: Date;
  } | null>(null);
  
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

  // Safety net: never allow a blank render where a view requires state that is missing.
  // This prevents the "only the test panel icon" symptom.
  useEffect(() => {
    if (view === 'processing' && !capturedImage) {
      setView('camera');
    }
  }, [view, capturedImage]);

  const handleOnboardingComplete = useCallback(() => {
    completeOnboarding();
    setView('camera');
  }, []);

  const handleCapture = useCallback(async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setCapturedImages([imageDataUrl]);
    setProcessingIndex(0);
    setIsProcessingComplete(false);
    setCapturedMarkInfo(null);
    setView('processing');
    
    try {
      // Local-first: hash + thumbnail to IndexedDB, hash to Supabase (no image upload)
      const mark = await createMark(imageDataUrl, 'warm');
      
      if (mark) {
        setCapturedMarkInfo({
          id: mark.id,
          originId: mark.originId,
          hash: mark.hash,
          timestamp: mark.timestamp,
        });
        setAiSuggestedCues([]); // No AI analysis in local-first flow
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
  }, [createMark]);

  // Handle ritual completion — the beginning is marked, return to readiness
  // Per doctrine: "The app should disappear the moment it succeeds."
  // No snapshot review, no history navigation — just silent return to capture state
  const handleProcessingContinue = useCallback(async (userCues: string[]) => {
    // Clean up processing state and return to camera
    // The ritual is complete — the beginning is marked
    setCapturedImage(null);
    setCapturedImages([]);
    setCapturedMarkInfo(null);
    setIsProcessingComplete(false);
    setTargetCapsuleId(null);
    setCurrentPage(null);
    setIsNewCapture(false);
    
    // Silent return to capture readiness
    setView('camera');
    
    // Refresh pages in background (latent optionality — data persists, but user doesn't see it)
    refresh();
  }, [refresh]);

  // handleSkipToCodex removed — no longer applicable per doctrine
  // The ritual completes silently, no "skip to codex" option exists

  const handleCaptureMultiple = useCallback(async (imageDataUrls: string[]) => {
    if (imageDataUrls.length === 0) return;
    
    setCapturedImages(imageDataUrls);
    setCapturedImage(imageDataUrls[0]);
    setProcessingIndex(0);
    setIsProcessingComplete(false);
    setCapturedMarkInfo(null);
    setView('processing');
    
    try {
      // Create marks individually (local-first, no server capsule grouping)
      let firstMarkInfo: typeof capturedMarkInfo = null;
      for (let i = 0; i < imageDataUrls.length; i++) {
        const mark = await createMark(imageDataUrls[i], 'warm');
        if (mark && i === 0) {
          firstMarkInfo = {
            id: mark.id,
            originId: mark.originId,
            hash: mark.hash,
            timestamp: mark.timestamp,
          };
        }
        setProcessingIndex(i);
      }
      
      if (firstMarkInfo) {
        setCapturedMarkInfo(firstMarkInfo);
        setIsProcessingComplete(true);
      } else {
        toast.error('Failed to process pages. Please try again.');
        setView('camera');
        setCapturedImage(null);
        setCapturedImages([]);
      }
    } catch (error) {
      console.error('Multi-capture error:', error);
      toast.error('Something went wrong. Please try again.');
      setView('camera');
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [createMark]);

  // Handle adding to existing capsule (local-first, no server capsule association)
  const handleAddToCapsuleCapture = useCallback(async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setCapturedImages([imageDataUrl]);
    setIsProcessingComplete(false);
    setCapturedMarkInfo(null);
    setView('processing');
    
    try {
      const mark = await createMark(imageDataUrl, 'warm');
      
      if (mark) {
        setCapturedMarkInfo({
          id: mark.id,
          originId: mark.originId,
          hash: mark.hash,
          timestamp: mark.timestamp,
        });
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
  }, [createMark]);

  // Handle opening search - skip search and go directly to history (search UI hidden per strategy)
  const handleOpenSearch = useCallback(() => {
    setView('history');
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
    setView('camera');  // Back from History goes directly to camera
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
    return await deletePage(pageId);
  }, [deletePage]);

  // Dev button visibility logic:
  // - Hidden in production builds (cleaner pilot interface)
  // - In Demo Mode: Only show on Memory views (not on camera to prevent accidental resets)
  // - Not in Demo Mode: Show on all views except onboarding
  const isMemoryView = ['history', 'detail', 'patterns', 'personality', 'kompas', 'year-reflection', 'search', 'capsule-carousel', 'orbit', 'snapshot', 'processing', 'add-to-capsule', 'kompas-empty', 'patterns-empty', 'personality-empty', 'share'].includes(view);
  const showDevButton = !import.meta.env.PROD && view !== 'onboarding' && (!isDemoMode || isMemoryView);
  
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
            onBrowseAll={handleOpenHistory}   // Library icon → History (browse)
            onOpenSearch={handleOpenSearch}   // Search icon → Search
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
            onViewBeginnings={handleOpenHistory}
            suggestedCues={aiSuggestedCues}
            originId={capturedMarkInfo?.originId || undefined}
            originHash={capturedMarkInfo?.hash || undefined}
            capturedAt={capturedMarkInfo?.timestamp || new Date()}
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
            isLoading={isLoading}
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
            // ShareMemoryCard hidden for current phase - see memory: features/share-memory-card-visibility
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
            onCapsuleUpdated={async () => {
              if (!currentCapsule) return;
              await refresh();
              try {
                const updatedCapsulePages = await getCapsulePages(currentCapsule.capsuleId);
                if (updatedCapsulePages.length === 0) {
                  // All pages deleted, close carousel
                  setCurrentCapsule(null);
                  setView('history');
                  return;
                }
                setCurrentCapsule({
                  capsuleId: currentCapsule.capsuleId,
                  pages: [...updatedCapsulePages].sort((a, b) => (a.pageOrder ?? 0) - (b.pageOrder ?? 0)),
                });
              } catch (e) {
                console.warn('[Index] Failed to refresh capsule pages (onCapsuleUpdated)', e);
              }
            }}
            allPages={pages}
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
            onBrowseAll={() => {
              setTargetCapsuleId(null);
              setView('history');
            }}
            onOpenSearch={() => {
              setTargetCapsuleId(null);
              setView('search');
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
            onBrowseAll={() => setView('cue-index')}  // "Browse all" goes to Cue Index
            initialQuery={initialSearchQuery || undefined}
          />
        );
      
      case 'cue-index':
        return (
          <CueIndex
            pages={pages}
            onClose={() => setView('search')}
            onSelectPage={(page) => {
              setCurrentPage(page);
              setSearchMatchInfo(null);
              setIsNewCapture(false);
              setView('detail');
            }}
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
      
      // ShareMemoryCard hidden for current phase - see memory: features/share-memory-card-visibility
      // case 'share':
      //   return (
      //     <ShareMemoryCard onBack={() => setView('history')} />
      //   );
      
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
