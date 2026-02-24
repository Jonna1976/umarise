import { SealedScreen } from '@/components/prototype/screens/SealedScreen';

/**
 * Preview page for the redesigned Sealed screen ("The Nail").
 * PinGate-protected via App.tsx routing.
 */
export default function SealedPreviewPage() {
  return (
    <SealedScreen
      originId="UM-A7F3B2E1-9C4F-6A8B-3E7D-1C5F9A2B6E4D"
      hash="a7f3b2e1d9c4f6a8b3e7d1c5f9a2b6e4d8c3f7a1b5e9d2c6f0a4b8e3d7c1f5"
      timestamp={new Date('2026-02-09T09:41:00')}
      imageUrl={null}
      isAnchored={true}
      onComplete={() => {}}
    />
  );
}
