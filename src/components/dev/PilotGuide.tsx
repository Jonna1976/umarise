import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Camera, 
  Search, 
  Check, 
  Clock, 
  Users,
  ChevronRight,
  Smartphone,
  Target,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PilotGuideProps {
  onClose: () => void;
}

export function PilotGuide({ onClose }: PilotGuideProps) {
  const [activeTab, setActiveTab] = useState<"capture" | "search" | "test">("capture");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-codex-ink/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-background shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-medium text-foreground">MKB Pilot Handleiding</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            21 dagen • 3 teams • 60 seconden retrieval test
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-background shrink-0">
          <button
            onClick={() => setActiveTab("capture")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "capture" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Capture
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "search" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "test" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            60s Test
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === "capture" && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Hoe werkt Capture?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Maak een foto van je whiteboard of papieren notitie. De app herkent automatisch de tekst en maakt het doorzoekbaar.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Stappen:</h4>
                  
                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Open de app</p>
                      <p className="text-sm text-muted-foreground">Camera opent direct</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Maak foto</p>
                      <p className="text-sm text-muted-foreground">Richt camera op whiteboard/papier, druk op capture</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Wacht op verwerking</p>
                      <p className="text-sm text-muted-foreground">~15 sec voor OCR tekstherkenning</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Bevestig snapshot</p>
                      <p className="text-sm text-muted-foreground">Check of tekst correct is herkend, druk op ✓</p>
                    </div>
                  </div>
                </div>

                <div className="bg-codex-teal/10 border border-codex-teal/30 rounded-lg p-3">
                  <p className="text-sm text-foreground">
                    <strong>💡 Tip:</strong> Goed licht en scherpe focus = betere OCR resultaten
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Hoe werkt Search?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Zoek door alle gecaptureerde pagina's op basis van de herkende tekst, keywords, of samenvatting.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Zoeken:</h4>
                  
                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Ga naar Memory</p>
                      <p className="text-sm text-muted-foreground">Tik op het Memory icoon onderaan</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Typ zoekterm</p>
                      <p className="text-sm text-muted-foreground">Gebruik woorden die op het origineel staan</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Bekijk resultaten</p>
                      <p className="text-sm text-muted-foreground">Swipe door carousel, originele scan is zichtbaar</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Zoektips:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <Badge variant="outline" className="mb-1">naam</Badge>
                      <p className="text-xs text-muted-foreground">Persoon op whiteboard</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <Badge variant="outline" className="mb-1">datum</Badge>
                      <p className="text-xs text-muted-foreground">"15 jan" of "Q1"</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <Badge variant="outline" className="mb-1">actie</Badge>
                      <p className="text-xs text-muted-foreground">"bellen" "checken"</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2 text-center">
                      <Badge variant="outline" className="mb-1">project</Badge>
                      <p className="text-xs text-muted-foreground">Projectnaam of klant</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "test" && (
              <motion.div
                key="test"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    60 Seconden Retrieval Test
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Bewijs dat het werkt: vind een eerder gecaptured origineel binnen 60 seconden.
                  </p>
                </div>

                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground">
                    🎯 <strong>Doel:</strong> 80% van de tests binnen 60 sec succesvol
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    30 tests totaal • 10 per team • 21 dagen
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Test Protocol:</h4>
                  
                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Kies een origineel</p>
                      <p className="text-sm text-muted-foreground">Selecteer een eerder gecaptured whiteboard/notitie</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Start timer</p>
                      <p className="text-sm text-muted-foreground">Open Pilot Tracker, klik Start</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Zoek het origineel</p>
                      <p className="text-sm text-muted-foreground">Gebruik search om de juiste pagina te vinden</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Log resultaat</p>
                      <p className="text-sm text-muted-foreground">PASS (≤60s) of FAIL (&gt;60s of niet gevonden)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-codex-teal/10 border border-codex-teal/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-codex-teal" />
                    <span className="text-sm font-medium text-foreground">Team Setup</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Join je team via TestPanel → MKB Pilot Tools om dezelfde data te delen
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background shrink-0">
          <Button onClick={onClose} className="w-full">
            Begrepen, laten we starten!
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
