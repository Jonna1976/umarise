import { useState, useCallback, useEffect, useRef } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CaptureScreen } from './screens/CaptureScreen';
import { PauseScreen } from './screens/PauseScreen';
import { MarkScreen } from './screens/MarkScreen';
import { ReleaseScreen } from './screens/ReleaseScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WallOfExistence } from './screens/WallOfExistence';
import { OriginButton } from './components/OriginButton';
import { MagicLinkAuth } from '@/components/auth/MagicLinkAuth';
import { useAuth } from '@/hooks/useAuth';
import { useMarks, DisplayMark } from '@/hooks/useMarks';
import { toast } from 'sonner';

export type RitualScreen = 'welcome' | 'auth' | 'capture' | 'pause' | 'mark' | 'release' | 'home' | 'wall';

interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
}

export function RitualFlow() {
  const [screen, setScreen] = useState<RitualScreen>('welcome');
  const [previousScreen, setPreviousScreen] = useState<RitualScreen>('capture');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { createMark } = useMarks();

  // Current capture state
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const isCreatingMark = useRef(false);

  // Check if user has seen welcome/auth before
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('umarise_seen_onboarding') === 'true';
  });

  // Redirect authenticated users who've seen onboarding directly to capture
  useEffect(() => {
    if (!authLoading && hasSeenOnboarding) {
      if (isAuthenticated) {
        setScreen('capture');
      } else if (screen === 'welcome') {
        // User has seen welcome but not authenticated - show auth
        setScreen('auth');
      }
    }
  }, [authLoading, isAuthenticated, hasSeenOnboarding, screen]);

  const goToScreen = useCallback((target: RitualScreen) => {
    if (target !== 'wall') {
      setPreviousScreen(screen);
    }
    setScreen(target);
  }, [screen]);

  const handleWelcomeComplete = useCallback(() => {
    // After welcome, check if user is authenticated
    if (isAuthenticated) {
      setHasSeenOnboarding(true);
      localStorage.setItem('umarise_seen_onboarding', 'true');
      goToScreen('capture');
    } else {
      // Show auth screen
      goToScreen('auth');
    }
  }, [goToScreen, isAuthenticated]);

  const handleAuthSuccess = useCallback(() => {
    setHasSeenOnboarding(true);
    localStorage.setItem('umarise_seen_onboarding', 'true');
    goToScreen('capture');
  }, [goToScreen]);

  const handleAuthSkip = useCallback(() => {
    // Allow skipping auth for now (anonymous device ID as fallback)
    setHasSeenOnboarding(true);
    localStorage.setItem('umarise_seen_onboarding', 'true');
    goToScreen('capture');
  }, [goToScreen]);

  // Handle file capture - store image and transition to pause
  const handleCapture = useCallback((imageDataUrl: string) => {
    setCapturedImageUrl(imageDataUrl);
    
    // Create temporary artifact for pause/mark screens (before mark is created)
    const tempArtifact: Artifact = {
      id: 'pending-' + Date.now(),
      type: 'warm',
      origin: 'ORIGIN --------',
      date: new Date(),
      hash: '----------------',
      imageUrl: imageDataUrl,
    };
    setCurrentArtifact(tempArtifact);
    
    goToScreen('pause');
  }, [goToScreen]);

  const handlePauseComplete = useCallback(() => {
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
        };
        setCurrentArtifact(realArtifact);
        console.log('[RitualFlow] Mark created:', mark.id);
      } else {
        toast.error('Failed to seal mark');
      }
    } catch (error) {
      console.error('[RitualFlow] Mark creation failed:', error);
      toast.error('Failed to seal mark');
    } finally {
      isCreatingMark.current = false;
    }
    
    goToScreen('release');
  }, [capturedImageUrl, createMark, goToScreen]);

  const handleReleaseComplete = useCallback(() => {
    // Clear capture state for next mark
    setCapturedImageUrl(null);
    setCurrentArtifact(null);
    goToScreen('capture'); // Return to capture for next mark
  }, [goToScreen]);

  const handleOpenWall = useCallback(() => {
    goToScreen('wall');
  }, [goToScreen]);

  const handleCloseWall = useCallback(() => {
    goToScreen(previousScreen);
  }, [previousScreen, goToScreen]);

  const showOriginButton = screen === 'capture' || screen === 'pause' || screen === 'mark';

  // Fallback artifact for screens that need one
  const displayArtifact = currentArtifact || {
    id: 'placeholder',
    type: 'warm' as const,
    origin: 'ORIGIN --------',
    date: new Date(),
    hash: '----------------',
    imageUrl: null,
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-ritual-surface flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-ritual-gold animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ritual-surface relative overflow-hidden font-garamond">
      {/* Origin Button (U) - visible on main screens: top: 40px, left: 18px per walkthrough spec */}
      {showOriginButton && (
        <OriginButton onClick={handleOpenWall} className="absolute top-[40px] left-[18px] z-50" />
      )}

      {/* Screens */}
      {screen === 'welcome' && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}

      {screen === 'auth' && (
        <MagicLinkAuth onSuccess={handleAuthSuccess} onSkip={handleAuthSkip} />
      )}
      
      {screen === 'capture' && (
        <CaptureScreen onCapture={handleCapture} />
      )}
      
      {screen === 'pause' && (
        <PauseScreen artifact={displayArtifact} onComplete={handlePauseComplete} />
      )}
      
      {screen === 'mark' && (
        <MarkScreen artifact={displayArtifact} onComplete={handleMarkComplete} />
      )}
      
      {screen === 'release' && (
        <ReleaseScreen artifact={displayArtifact} onComplete={handleReleaseComplete} />
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
