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
import { Page, addPage, loadTestPages } from '@/lib/mockData';
import { TestPage } from '@/lib/testData';
import { FlaskConical } from 'lucide-react';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail' | 'patterns';

const Index = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isNewCapture, setIsNewCapture] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

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

  const handleCapture = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setView('processing');
    
    // Simulate AI processing (2-3 seconds)
    setTimeout(() => {
      // Create a new page with mock AI results
      const mockTones = ['focused', 'reflective', 'hopeful', 'playful', 'overwhelmed', 'frustrated'];
      const mockKeywords = ['ideas', 'clarity', 'patterns', 'growth', 'change', 'focus', 'vision', 'purpose'];
      
      const newPage = addPage({
        deviceUserId: deviceId || 'unknown',
        imageUrl: imageDataUrl,
        ocrText: 'This is a sample transcription of your handwritten text. In a real implementation, this would be the result of OCR processing on your captured image.',
        summary: 'A moment of reflection captured in your personal codex. Your thoughts are being woven into the larger tapestry of your ideas.',
        tone: [
          mockTones[Math.floor(Math.random() * mockTones.length)],
          mockTones[Math.floor(Math.random() * mockTones.length)],
        ].filter((v, i, a) => a.indexOf(v) === i),
        keywords: Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => 
          mockKeywords[Math.floor(Math.random() * mockKeywords.length)]
        ).filter((v, i, a) => a.indexOf(v) === i),
        createdAt: new Date(),
      });
      
      setCurrentPage(newPage);
      setIsNewCapture(true);
      setView('snapshot');
    }, 2500);
  }, [deviceId]);

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

  const handleLoadTestData = useCallback((testPages: TestPage[]) => {
    loadTestPages(testPages as Page[]);
    setShowTestPanel(false);
    setView('history');
  }, []);

  const handleViewTestPage = useCallback((testPage: TestPage) => {
    setCurrentPage(testPage as Page);
    setIsNewCapture(false);
    setShowTestPanel(false);
    setView('detail');
  }, []);

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
          />
        ) : null;
      
      case 'history':
        return (
          <HistoryView
            onBack={handleBackFromHistory}
            onSelectPage={handleSelectPage}
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
