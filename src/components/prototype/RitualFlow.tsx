import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CaptureScreen, type CapturedFile, type CapturedRawFile } from './screens/CaptureScreen';
import { SealedScreen } from './screens/SealedScreen';
import { HomeScreen } from './screens/HomeScreen';
import { WallOfExistence } from './screens/WallOfExistence';
import { OriginButton } from './components/OriginButton';
import { HashingProgress, fileTypeLabel } from './components/UniversalDropZone';
import { useMarks } from '@/hooks/useMarks';
import { toast } from 'sonner';
import { runPreflightCheck } from '@/lib/preflightCheck';

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
const UNSAVED_ARTIFACT_KEY = 'umarise_unsaved_artifact';

export function RitualFlow() {
  const [screen, setScreen] = useState<RitualScreen>('capture');
  const [previousScreen, setPreviousScreen] = useState<RitualScreen>('capture');
  const [showFirstAnchorReveal, setShowFirstAnchorReveal] = useState(false);
  const { createMark, createMarkFromFile } = useMarks();

  // Pre-flight: check browser capabilities once on mount
  useEffect(() => {
    runPreflightCheck().then(result => {
      if (!result.ok) {
        console.error('[RitualFlow] Pre-flight failed:', result.failures);
        toast.error(result.failures[0], { duration: 10000 });
      }
    });
  }, []);

  // Determine first visit: 0 anchors in local storage
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const count = localStorage.getItem(ANCHOR_COUNT_KEY);
    return !count || parseInt(count, 10) === 0;
  });

  // Current capture state
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [currentArtifact, setCurrentArtifact] = useState<Artifact | null>(null);
  const isCreatingMark = useRef(false);

  // Resume unsaved artifact on mount (e.g. user returns next day)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UNSAVED_ARTIFACT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      // Reconstruct artifact with Date object
      const artifact: Artifact = {
        ...saved,
        date: new Date(saved.date),
      };
      setCurrentArtifact(artifact);
      setCapturedImageUrl(saved.imageUrl ?? null);
      setScreen('sealed');
      console.log('[RitualFlow] Resumed unsaved artifact:', artifact.origin);
    } catch {
      localStorage.removeItem(UNSAVED_ARTIFACT_KEY);
    }
  }, []);
  const markCreationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safety: auto-reset isCreatingMark after 45s to prevent permanent lock
  const setCreatingMark = useCallback((value: boolean) => {
    isCreatingMark.current = value;
    if (markCreationTimer.current) {
      clearTimeout(markCreationTimer.current);
      markCreationTimer.current = null;
    }
    if (value) {
      markCreationTimer.current = setTimeout(() => {
        if (isCreatingMark.current) {
          console.warn('[RitualFlow] isCreatingMark safety timeout — resetting');
          isCreatingMark.current = false;
          markCreationTimer.current = null;
        }
      }, 45_000);
    }
  }, []);

  // File hashing progress state (for large files in universal drop zone)
  const [hashingFile, setHashingFile] = useState<{ fileName: string; fileSize: number; progress: number } | null>(null);

  const goToScreen = useCallback((target: RitualScreen) => {
    if (target !== 'wall') {
      setPreviousScreen(screen);
    }
    setScreen(target);
  }, [screen]);

  // Start capture directly — no welcome screen

  // Handle file capture - auto-hash + create mark, then go to sealed
  const handleCapture = useCallback(async (file: CapturedFile) => {
    if (isCreatingMark.current) {
      console.warn('[RitualFlow] handleCapture blocked — already creating mark');
      return;
    }
    
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
    setCreatingMark(true);
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
        setIsFirstVisit(false);
        try { localStorage.setItem(UNSAVED_ARTIFACT_KEY, JSON.stringify(realArtifact)); } catch {}
        goToScreen('sealed');
      } else {
        console.error('[RitualFlow] Mark creation returned null');
        toast.error('Failed to seal mark');
        goToScreen('capture');
        setCreatingMark(false);
      }
    } catch (error) {
      console.error('[RitualFlow] Mark creation failed:', error);
      toast.error('Failed to seal mark');
      goToScreen('capture');
      setCreatingMark(false);
    }
  }, [goToScreen, createMark, setCreatingMark]);

  // Handle raw File from UniversalDropZone — directe File-hashing, geen base64
  const handleCaptureFile = useCallback(async (rf: CapturedRawFile) => {
    if (isCreatingMark.current) {
      console.warn('[RitualFlow] handleCaptureFile blocked — already creating mark');
      return;
    }
    setCreatingMark(true);

    // Determine artifact type from MIME
    const artifactType = rf.mimeType.startsWith('audio/') ? 'sound'
      : rf.mimeType.startsWith('image/') ? 'warm'
      : rf.mimeType.startsWith('video/') ? 'digital'
      : 'text';

    // Set preview image for sealed screen (only for images)
    setCapturedImageUrl(rf.previewDataUrl);

    // Show processing with hashing progress for large files
    setHashingFile({ fileName: rf.fileName, fileSize: rf.fileSize, progress: 0 });
    goToScreen('processing');

    try {
      console.log('[RitualFlow] createMarkFromFile:', rf.fileName, rf.mimeType);
      const mark = await createMarkFromFile(
        rf.file,
        artifactType,
        (fraction) => setHashingFile(prev => prev ? { ...prev, progress: fraction } : null),
      );

      setHashingFile(null);

      if (mark) {
        const realArtifact: Artifact = {
          id: mark.id,
          type: mark.type,
          origin: mark.originId.toUpperCase().replace('UM-', 'ANCHOR '),
          date: mark.timestamp,
          hash: mark.hash,
          imageUrl: rf.previewDataUrl || mark.thumbnailUrl || null,
          mimeType: rf.mimeType,
          fileName: rf.fileName,
          deviceSignature: mark.deviceSignature ?? null,
          devicePublicKey: mark.devicePublicKey ?? null,
        };
        setCurrentArtifact(realArtifact);
        setIsFirstVisit(false);
        try { localStorage.setItem(UNSAVED_ARTIFACT_KEY, JSON.stringify(realArtifact)); } catch {}
        goToScreen('sealed');
        console.log('[RitualFlow] File mark created:', mark.id, 'hash:', mark.hash);
        console.log('[RitualFlow] VERIFY: sha256sum of', rf.fileName, 'should equal:', mark.hash);
      } else {
        toast.error('Failed to anchor file');
        goToScreen('capture');
        setCreatingMark(false);
      }
    } catch (error) {
      console.error('[RitualFlow] File mark creation failed:', error);
      toast.error('Failed to anchor file');
      setHashingFile(null);
      goToScreen('capture');
      setCreatingMark(false);
    }
  }, [goToScreen, createMarkFromFile, setCreatingMark]);

  // handleMarkComplete removed — mark creation now happens automatically in handleCapture

  // Sealed → Wall (after Save → ✓ Owned → 0.8s)
  const handleSealedComplete = useCallback(() => {
    const wasFirstVisit = isFirstVisit;
    setCapturedImageUrl(null);
    setCurrentArtifact(null);
    setCreatingMark(false);
    localStorage.removeItem(UNSAVED_ARTIFACT_KEY);
    
    if (wasFirstVisit) {
      // First anchor special: show V7 nav reveal, then auto-advance
      setShowFirstAnchorReveal(true);
      setTimeout(() => {
        setShowFirstAnchorReveal(false);
        goToScreen('wall');
      }, 1400); // 0.6s fade-in + 0.8s hold
    } else {
      goToScreen('wall');
    }
  }, [goToScreen, isFirstVisit]);

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

      {/* First anchor reveal — V7 appears after first save */}
      {showFirstAnchorReveal && (
        <motion.div
          className="absolute top-[40px] left-[18px] z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <OriginButton onClick={() => {}} className="" />
        </motion.div>
      )}

      {/* Screens */}
      
      {screen === 'capture' && (
        <CaptureScreen
          onCapture={handleCapture}
          onCaptureFile={handleCaptureFile}
          isFirstVisit={isFirstVisit}
        />
      )}
      
      {/* Processing state - hashing + mark creation */}
      {screen === 'processing' && (
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center gap-8"
          style={{ background: 'hsl(var(--ritual-surface))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {hashingFile ? (
            // Universal file: show progress indicator
            <HashingProgress
              fileName={hashingFile.fileName}
              fileSize={hashingFile.fileSize}
              progress={hashingFile.progress}
            />
          ) : (
            // Camera flow: breathing ring (no hex)
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg viewBox="0 0 48 48" className="w-14 h-14">
                <circle
                  cx="24" cy="24" r="18"
                  fill="none"
                  stroke="hsl(var(--ritual-gold))"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
            </motion.div>
          )}
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

