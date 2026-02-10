import { useState, useCallback, useRef } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CaptureScreen, type CapturedFile } from './screens/CaptureScreen';
// PauseScreen removed — merged into MarkScreen
import { MarkScreen } from './screens/MarkScreen';
// ReleaseScreen, ZipScreen, OwnedScreen removed — merged into SealedScreen
import { SealedScreen } from './screens/SealedScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WallOfExistence } from './screens/WallOfExistence';
import { OriginButton } from './components/OriginButton';
import { useMarks } from '@/hooks/useMarks';
import { toast } from 'sonner';

export type RitualScreen = 'welcome' | 'capture' | 'mark' | 'sealed' | 'home' | 'wall';

export interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
  /** MIME type of the captured file (e.g. image/jpeg, application/pdf, audio/mpeg) */
  mimeType: string;
  /** Original file name */
  fileName: string;
}

const FIRST_VISIT_KEY = 'umarise_first_visit_done';

export function RitualFlow() {
  const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
  const [screen, setScreen] = useState<RitualScreen>(isFirstVisit ? 'welcome' : 'capture');
  const [showOriginText, setShowOriginText] = useState(!isFirstVisit);
  const [previousScreen, setPreviousScreen] = useState<RitualScreen>('capture');
  const { createMark } = useMarks();

  // Current capture state
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const isCreatingMark = useRef(false);

  const goToScreen = useCallback((target: RitualScreen) => {
    if (target !== 'wall') {
      setPreviousScreen(screen);
    }
    setScreen(target);
  }, [screen]);

  // Welcome → Capture (no auth before mark!)
  const handleWelcomeComplete = useCallback(() => {
    localStorage.setItem(FIRST_VISIT_KEY, '1');
    setShowOriginText(true);
    goToScreen('capture');
  }, [goToScreen]);

  // Handle file capture - store file data and transition to mark (pause merged into mark)
  const handleCapture = useCallback((file: CapturedFile) => {
    setCapturedImageUrl(file.dataUrl);
    
    // Derive artifact type from MIME
    const artifactType = file.mimeType.startsWith('audio/') ? 'sound'
      : file.mimeType.startsWith('image/') ? 'warm'
      : 'text';
    
    // Create temporary artifact for pause/mark screens (before mark is created)
    const tempArtifact: Artifact = {
      id: 'pending-' + Date.now(),
      type: artifactType,
      origin: 'ORIGIN --------',
      date: new Date(),
      hash: '----------------',
      imageUrl: file.dataUrl,
      mimeType: file.mimeType,
      fileName: file.fileName,
    };
    setCurrentArtifact(tempArtifact);
    
    goToScreen('mark');
  }, [goToScreen]);

  // Handle mark completion - create the actual mark with dual-write
  const handleMarkComplete = useCallback(async () => {
    if (!capturedImageUrl || isCreatingMark.current) return;
    
    isCreatingMark.current = true;
    
    try {
      console.log('[RitualFlow] Creating mark...');
      const mark = await createMark(capturedImageUrl, 'warm');
      
      if (mark) {
        // Update artifact with real data
        const realArtifact: Artifact = {
          id: mark.id,
          type: mark.type,
          origin: mark.originId.toUpperCase().replace('UM-', 'ORIGIN '),
          date: mark.timestamp,
          hash: mark.hash,
          imageUrl: mark.thumbnailUrl || capturedImageUrl,
          mimeType: currentArtifact?.mimeType || 'image/jpeg',
          fileName: currentArtifact?.fileName || 'unknown',
        };
        setCurrentArtifact(realArtifact);
        console.log('[RitualFlow] Mark created:', mark.id);
        goToScreen('sealed');
      } else {
        console.error('[RitualFlow] Mark creation returned null');
        toast.error('Failed to seal mark');
        isCreatingMark.current = false;
      }
    } catch (error) {
      console.error('[RitualFlow] Mark creation failed:', error);
      toast.error('Failed to seal mark');
      isCreatingMark.current = false;
    }
  }, [capturedImageUrl, createMark, goToScreen]);

  // Sealed → Wall (after Save → ✓ Owned → 0.8s)
  const handleSealedComplete = useCallback(() => {
    setCapturedImageUrl(null);
    setCurrentArtifact(null);
    isCreatingMark.current = false;
    goToScreen('wall');
  }, [goToScreen]);

  const handleOpenWall = useCallback(() => {
    goToScreen('wall');
  }, [goToScreen]);

  const handleCloseWall = useCallback(() => {
    // Always return to capture (S1) — the ritual's home base.
    // previousScreen may point to transient screens (zip, owned) whose
    // state has been cleared, which would render a black screen.
    goToScreen('capture');
  }, [goToScreen]);

  const showOriginButton = screen === 'capture' || screen === 'mark';

  // Fallback artifact for screens that need one
  const displayArtifact = currentArtifact || {
    id: 'placeholder',
    type: 'warm' as const,
    origin: 'ORIGIN --------',
    date: new Date(),
    hash: '----------------',
    imageUrl: null,
    mimeType: 'image/jpeg',
    fileName: 'unknown',
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-garamond" style={{ background: 'hsl(var(--ritual-bg))' }}>
      {/* Origin Button (U) - visible on main screens */}
      {showOriginButton && (
        <OriginButton onClick={handleOpenWall} className="absolute top-[40px] left-[18px] z-50" />
      )}

      {/* Screens */}
      {screen === 'welcome' && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      
      {screen === 'capture' && (
        <CaptureScreen onCapture={handleCapture} showOriginText={showOriginText} />
      )}
      
      {/* PauseScreen removed — merged into MarkScreen */}
      
      {screen === 'mark' && (
        <MarkScreen artifact={displayArtifact} onComplete={handleMarkComplete} />
      )}
      
      {screen === 'sealed' && currentArtifact && (
        <SealedScreen
          originId={currentArtifact.origin}
          hash={currentArtifact.hash}
          timestamp={currentArtifact.date}
          imageUrl={capturedImageUrl}
          mimeType={currentArtifact.mimeType}
          fileName={currentArtifact.fileName}
          artifactType={currentArtifact.type}
          onComplete={handleSealedComplete}
        />
      )}
      
      {screen === 'home' && (
        <HomeScreen />
      )}
      
      {screen === 'wall' && (
        <WallOfExistence onClose={handleCloseWall} />
      )}
    </div>
  );
}
