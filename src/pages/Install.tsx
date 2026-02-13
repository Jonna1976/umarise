import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Smartphone, Apple, Chrome } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <span className="text-3xl font-bold text-foreground">Umarise</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Install Umarise</h1>
          <p className="text-muted-foreground">
            Add Umarise to your home screen for quick access and offline use.
          </p>
        </div>

        {isInstalled ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-600 font-medium">Already installed</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open Umarise from your home screen.
            </p>
          </div>
        ) : isIOS ? (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    At the bottom of Safari (square with arrow)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Scroll and tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    You may need to scroll down in the share menu
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">
                    Umarise will appear on your home screen
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Apple className="h-4 w-4" />
              <span>Safari required for iOS installation</span>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full">
            <Download className="h-5 w-5 mr-2" />
            Install App
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4">
              <div className="flex items-start gap-3">
                <Chrome className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Chrome / Edge</p>
                  <p className="text-sm text-muted-foreground">
                    Click the install icon in the address bar, or use Menu → Install app
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              If you don't see an install option, try refreshing the page.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="pt-6 border-t border-border">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">What you get</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Smartphone className="h-4 w-4 text-landing-copper" />
              <span>Home screen icon</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Download className="h-4 w-4 text-landing-copper" />
              <span>Offline access</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle className="h-4 w-4 text-landing-copper" />
              <span>Fast loading</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle className="h-4 w-4 text-landing-copper" />
              <span>Full screen mode</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
