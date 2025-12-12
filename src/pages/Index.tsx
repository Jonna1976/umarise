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
import { 
  initializeDeviceId, 
  hasCompletedOnboarding, 
  completeOnboarding 
} from '@/lib/deviceId';
import { usePages } from '@/hooks/usePages';
import { Page, CapsulePages } from '@/lib/pageService';
import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail' | 'patterns' | 'personality' | 'add-to-capsule' | 'capsule-carousel';

const Index = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isNewCapture, setIsNewCapture] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  // Use real pages from database
  const { pages, createPage, createCapsule, addToCapsule, updatePage, deletePage, refresh } = usePages();
  
  // Multi-image processing state
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [targetCapsuleId, setTargetCapsuleId] = useState<string | null>(null);
  const [currentCapsule, setCurrentCapsule] = useState<CapsulePages | null>(null);

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
    setCapturedImages([imageDataUrl]);
    setProcessingIndex(0);
    setView('processing');
    
    try {
      // Real AI processing via edge function
      const newPage = await createPage(imageDataUrl);
      
      if (newPage) {
        setCurrentPage(newPage);
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
  }, [createPage]);

  const handleCaptureMultiple = useCallback(async (imageDataUrls: string[]) => {
    if (imageDataUrls.length === 0) return;
    
    setCapturedImages(imageDataUrls);
    setCapturedImage(imageDataUrls[0]);
    setProcessingIndex(0);
    setView('processing');
    
    try {
      // Process all images as a capsule
      const newPages = await createCapsule(imageDataUrls);
      
      if (newPages && newPages.length > 0) {
        // Show the first page of the capsule
        setCurrentPage(newPages[0]);
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
  }, [createCapsule]);

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
      const newPage = await addToCapsule(imageDataUrl, targetCapsuleId);
      
      if (newPage) {
        setCurrentPage(newPage);
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
  }, [addToCapsule, targetCapsuleId]);

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
            onViewPatterns={handleViewPatterns}
            onViewPersonality={handleViewPersonality}
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
