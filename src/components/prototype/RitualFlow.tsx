import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CaptureScreen, type CapturedFile } from './screens/CaptureScreen';
import { SealedScreen } from './screens/SealedScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WallOfExistence } from './screens/WallOfExistence';
import { OriginButton } from './components/OriginButton';
import { useMarks } from '@/hooks/useMarks';
import { toast } from 'sonner';

export type RitualScreen = 'capture' | 'processing' | 'sealed' | 'home' | 'wall';

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
  /** WebAuthn signature over the hash (v1.1, null if unavailable) */
  deviceSignature?: string | null;
  /** SPKI public key of signing device (v1.1, null if unavailable) */
  devicePublicKey?: string | null;
}

const FIRST_VISIT_KEY = 'umarise_first_visit_done';
const ANCHOR_COUNT_KEY = 'umarise-mark-count';

export function RitualFlow() {
  const [screen, setScreen] = useState<RitualScreen>('capture');
  const [previousScreen, setPreviousScreen] = useState<RitualScreen>('capture');
  const { createMark } = useMarks();

  // Determine first visit: 0 anchors in local storage
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const count = localStorage.getItem(ANCHOR_COUNT_KEY);
    return !count || parseInt(count, 10) === 0;
  });

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

  // Start capture directly — no welcome screen

  // Handle file capture - auto-hash + create mark, then go to sealed
  const handleCapture = useCallback(async (file: CapturedFile) => {
    if (isCreatingMark.current) return;
    
    setCapturedImageUrl(file.dataUrl);
    
    // Derive artifact type from MIME
    const artifactType = file.mimeType.startsWith('audio/') ? 'sound'
      : file.mimeType.startsWith('image/') ? 'warm'
      : 'text';
    
    // Create temporary artifact for display during processing
    const tempArtifact: Artifact = {
      id: 'pending-' + Date.now(),
      type: artifactType,
      origin: 'ANCHOR --------',
      date: new Date(),
      hash: '----------------',
      imageUrl: file.dataUrl,
      mimeType: file.mimeType,
      fileName: file.fileName,
    };
    setCurrentArtifact(tempArtifact);
    
    // Show processing state
    goToScreen('processing');
    
    // Auto-create mark (hash + DB insert)
    isCreatingMark.current = true;
    try {
      console.log('[RitualFlow] Auto-creating mark after capture...');
      const mark = await createMark(file.dataUrl, 'warm');
      
      if (mark) {
        const realArtifact: Artifact = {
          id: mark.id,
          type: mark.type,
          origin: mark.originId.toUpperCase().replace('UM-', 'ANCHOR '),
          date: mark.timestamp,
          hash: mark.hash,
          imageUrl: mark.thumbnailUrl || file.dataUrl,
          mimeType: file.mimeType,
          fileName: file.fileName,
          deviceSignature: mark.deviceSignature ?? null,
          devicePublicKey: mark.devicePublicKey ?? null,
        };
        setCurrentArtifact(realArtifact);
        console.log('[RitualFlow] Mark created:', mark.id);
        // After first successful anchor, no longer first visit
        setIsFirstVisit(false);
        goToScreen('sealed');
      } else {
        console.error('[RitualFlow] Mark creation returned null');
        toast.error('Failed to seal mark');
        goToScreen('capture');
        isCreatingMark.current = false;
      }
    } catch (error) {
      console.error('[RitualFlow] Mark creation failed:', error);
      toast.error('Failed to seal mark');
      goToScreen('capture');
      isCreatingMark.current = false;
    }
  }, [goToScreen, createMark]);

  // handleMarkComplete removed — mark creation now happens automatically in handleCapture

  // Sealed → Wall (after Save → ✓ Owned → 0.8s)
  const handleSealedComplete = useCallback(() => {
    setCapturedImageUrl(null);
    setCurrentArtifact(null);
    isCreatingMark.current = false;
    goToScreen('wall');
  }, [goToScreen]);

  const handleOpenRegistry = useCallback(() => {
    goToScreen('wall');
  }, [goToScreen]);

  const handleCloseRegistry = useCallback(() => {
    // Always return to capture (S1) — the ritual's home base.
    goToScreen('capture');
  }, [goToScreen]);

  // Only show V7 nav button when returning (not first visit)
  const showOriginButton = screen === 'capture' && !isFirstVisit;

  // Fallback artifact for screens that need one
  const displayArtifact = currentArtifact || {
    id: 'placeholder',
    type: 'warm' as const,
    origin: 'ANCHOR --------',
    date: new Date(),
    hash: '----------------',
    imageUrl: null,
    mimeType: 'image/jpeg',
    fileName: 'unknown',
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-garamond" style={{ background: 'hsl(var(--ritual-bg))' }}>
      {/* Origin Button — opens Origin Registry */}
      {showOriginButton && (
        <OriginButton onClick={handleOpenRegistry} className="absolute top-[40px] left-[18px] z-50" />
      )}

      {/* Screens */}
      
      {screen === 'capture' && (
        <CaptureScreen onCapture={handleCapture} isFirstVisit={isFirstVisit} />
      )}
      
      {/* Processing state - brief visual during auto-hash + mark creation */}
      {screen === 'processing' && (
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center"
          style={{ background: 'hsl(var(--ritual-surface))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Origin Mark breathing animation during processing */}
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 48 48" className="w-16 h-16">
              <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" fill="hsl(var(--ritual-gold))" opacity="0.7" />
              <rect x="17" y="17" width="14" height="14" rx="1.8" fill="hsl(var(--ritual-surface))" opacity="0.9" />
            </svg>
          </motion.div>
        </motion.div>
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
          deviceSignature={currentArtifact.deviceSignature ?? null}
          devicePublicKey={currentArtifact.devicePublicKey ?? null}
          onComplete={handleSealedComplete}
        />
      )}
      
      {screen === 'home' && (
        <HomeScreen />
      )}
      
      {screen === 'wall' && (
        <WallOfExistence onClose={handleCloseRegistry} />
      )}
    </div>
  );
}
