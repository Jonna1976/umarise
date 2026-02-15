import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { PinGate } from "@/components/PinGate";
import { InternalGate } from "@/components/InternalGate";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PWAUpdatePrompt } from "@/components/pwa/PWAUpdatePrompt";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import OriginView from "./pages/OriginView";
import ReviewKit from "./pages/ReviewKit";
import DocsExport from "./pages/DocsExport";
import BriefingExport from "./pages/BriefingExport";
import CTOOverview from "./pages/CTOOverview";
import Intake from "./pages/Intake";
import Landing from "./pages/Landing";
import { B2BWalkthrough } from "./components/dev/B2BWalkthrough";
import LandingVariants from "./pages/LandingVariants";
import { WidgetMockup } from "./components/dev/WidgetMockup";
import UMarkMockup from "./components/dev/UMarkMockup";
import PilotTracker from "./pages/PilotTracker";
import ProofPage from "./pages/ProofPage";
import PilotDocs from "./pages/PilotDocs";
import PrivacyExport from "./pages/PrivacyExport";
import IsoExport from "./pages/IsoExport";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Anchor from "./pages/Anchor";
import CoreSpec from "./pages/CoreSpec";
import PartnerOnboardingExport from "./pages/PartnerOnboardingExport";
import Prototype from "./pages/Prototype";
import Why from "./pages/Why";
import SealedPreviewPage from "./pages/SealedPreview";
import Install from "./pages/Install";
import Architecture from "./pages/Architecture";
import ReviewerPackage from "./pages/ReviewerPackage";

import WitnessConfirmation from "./pages/WitnessConfirmation";
import Verify from "./pages/Verify";
import Legal from "./pages/Legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <PWAUpdatePrompt />
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES - No PinGate */}
            {/* anchoring.app → ritual flow directly; other domains → landing */}
            <Route path="/" element={
              typeof window !== 'undefined' && window.location.hostname === 'anchoring.app'
                ? <Prototype />
                : <Landing />
            } />
            <Route path="/origin/:originId" element={<OriginView />} />
            <Route path="/review" element={<ReviewKit />} />
            <Route path="/docs-export" element={<DocsExport />} />
            <Route path="/briefing-export" element={<BriefingExport />} />
            <Route path="/privacy-export" element={<PrivacyExport />} />
            <Route path="/iso-export" element={<IsoExport />} />
            <Route path="/partner-onboarding-export" element={<PartnerOnboardingExport />} />
            <Route path="/cto-overview" element={<CTOOverview />} />
            <Route path="/anchor" element={<Anchor />} />
            <Route path="/origin" element={<Anchor />} />
            <Route path="/core" element={<CoreSpec />} />
            <Route path="/proof" element={<ProofPage />} />
            <Route path="/pilot" element={<PilotDocs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/why" element={<Why />} />
            <Route path="/install" element={<Install />} />
            
            <Route path="/verify" element={<Verify />} />
            <Route path="/reviewer" element={<ReviewerPackage />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/witness/:token" element={<WitnessConfirmation />} />
            
            {/* PROTECTED ROUTES - Behind PinGate */}
            <Route path="/app" element={<InternalGate><Index /></InternalGate>} />
            <Route path="/pilot-tracker" element={<InternalGate><PilotTracker /></InternalGate>} />
            <Route path="/prototype" element={<Prototype />} />
            <Route path="/intake" element={<InternalGate><Intake /></InternalGate>} />
            <Route path="/spec" element={<InternalGate><Intake /></InternalGate>} />
            
            {/* DEV/PREVIEW ROUTES - Behind InternalGate */}
            <Route path="/origin-flow" element={<InternalGate><B2BWalkthrough /></InternalGate>} />
            <Route path="/landing-variants" element={<InternalGate><LandingVariants /></InternalGate>} />
            <Route path="/widget-design" element={<InternalGate><WidgetMockup /></InternalGate>} />
            <Route path="/origin-mark" element={<InternalGate><UMarkMockup /></InternalGate>} />
            <Route path="/architecture" element={<InternalGate><Architecture /></InternalGate>} />
            <Route path="/sealed-preview" element={<InternalGate><SealedPreviewPage /></InternalGate>} />
            
            {/* Redirect old landing route */}
            <Route path="/landing" element={<Landing />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DemoModeProvider>
  </QueryClientProvider>
);

export default App;
