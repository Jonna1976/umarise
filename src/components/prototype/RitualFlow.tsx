import { useState, useCallback, useEffect } from 'react';
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

export type RitualScreen = 'welcome' | 'auth' | 'capture' | 'pause' | 'mark' | 'release' | 'home' | 'wall';

// Mock artifact for demo
const MOCK_ARTIFACT = {
  id: '1916f13f-demo',
  type: 'warm' as const,
  origin: 'ORIGIN 1916F13F',
  date: new Date(),
  hash: '884d5f17553df0a3',
  imageUrl: null,
};

export function RitualFlow() {
  const [screen, setScreen] = useState<RitualScreen>('welcome');
  const [previousScreen, setPreviousScreen] = useState<RitualScreen>('capture');
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const handleCapture = useCallback(() => {
    // In real app, this would trigger camera/file picker
    goToScreen('pause');
  }, [goToScreen]);

  const handlePauseComplete = useCallback(() => {
    goToScreen('mark');
  }, [goToScreen]);

  const handleMarkComplete = useCallback(() => {
    goToScreen('release');
  }, [goToScreen]);

  const handleReleaseComplete = useCallback(() => {
    goToScreen('home');
  }, [goToScreen]);

  const handleOpenWall = useCallback(() => {
    goToScreen('wall');
  }, [goToScreen]);

  const handleCloseWall = useCallback(() => {
    goToScreen(previousScreen);
  }, [previousScreen, goToScreen]);

  const showOriginButton = screen === 'capture' || screen === 'pause' || screen === 'mark';

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
        <PauseScreen artifact={MOCK_ARTIFACT} onComplete={handlePauseComplete} />
      )}
      
      {screen === 'mark' && (
        <MarkScreen artifact={MOCK_ARTIFACT} onComplete={handleMarkComplete} />
      )}
      
      {screen === 'release' && (
        <ReleaseScreen artifact={MOCK_ARTIFACT} onComplete={handleReleaseComplete} />
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
