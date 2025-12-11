import { useState, useEffect, useCallback } from 'react';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { CameraView } from '@/components/capture/CameraView';
import { ProcessingView } from '@/components/capture/ProcessingView';
import { SnapshotView } from '@/components/codex/SnapshotView';
import { HistoryView } from '@/components/codex/HistoryView';
import { 
  initializeDeviceId, 
  hasCompletedOnboarding, 
  completeOnboarding 
} from '@/lib/deviceId';
import { Page, addPage, mockPages } from '@/lib/mockData';

type AppView = 'onboarding' | 'camera' | 'processing' | 'snapshot' | 'history' | 'detail';

const Index = () => {
  const [view, setView] = useState<AppView>('onboarding');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isNewCapture, setIsNewCapture] = useState(false);

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

  // Render based on current view
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
        />
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

export default Index;
