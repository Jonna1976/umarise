import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (value: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_MODE_KEY = 'umarise_demo_mode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  // Default to wedge mode (true) - dev features hidden by default
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const stored = localStorage.getItem(DEMO_MODE_KEY);
    // Default to true (wedge-only) unless explicitly set to false
    return stored !== 'false';
  });

  // Sync toggle that writes to localStorage BEFORE updating state
  // This ensures isDemoModeActive() reads the correct value immediately
  const toggleDemoMode = () => {
    const newValue = !isDemoMode;
    localStorage.setItem(DEMO_MODE_KEY, String(newValue));
    setIsDemoMode(newValue);
  };
  
  const setDemoMode = (value: boolean) => {
    localStorage.setItem(DEMO_MODE_KEY, String(value));
    setIsDemoMode(value);
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
