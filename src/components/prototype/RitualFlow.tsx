import { useState, useCallback } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { CaptureScreen } from './screens/CaptureScreen';
import { PauseScreen } from './screens/PauseScreen';
import { MarkScreen } from './screens/MarkScreen';
import { ReleaseScreen } from './screens/ReleaseScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WallOfExistence } from './screens/WallOfExistence';
import { OriginButton } from './components/OriginButton';

export type RitualScreen = 'welcome' | 'capture' | 'pause' | 'mark' | 'release' | 'home' | 'wall';

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
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  const goToScreen = useCallback((target: RitualScreen) => {
    if (target !== 'wall') {
      setPreviousScreen(screen);
    }
    setScreen(target);
  }, [screen]);

  const handleWelcomeComplete = useCallback(() => {
    setHasSeenWelcome(true);
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
