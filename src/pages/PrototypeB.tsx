import { RitualFlow } from '@/components/prototype/RitualFlow';

/**
 * Version B — ivory theme, same structure as /prototype
 * Wrapped in .theme-ivory to override ritual CSS tokens
 */
export default function PrototypeB() {
  return (
    <div className="theme-ivory">
      <RitualFlow />
    </div>
  );
}
