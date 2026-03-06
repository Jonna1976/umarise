import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  // Temporarily disabled — re-enable by removing this early return
  return null;
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Don't show on developer/API pages
    const path = window.location.pathname;
    if (path === '/developers' || path === '/api-reference') {
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">
            Install Umarise
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Anchor what matters. Add to your home screen.
          </p>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button onClick={handleInstall} size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Install
        </Button>
        <Button onClick={handleDismiss} variant="outline" size="sm">
          Not now
        </Button>
      </div>
    </div>
  );
}
