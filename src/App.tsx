import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { PinGate } from "@/components/PinGate";
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
import Origin from "./pages/Origin";
import CoreSpec from "./pages/CoreSpec";
import PartnerOnboardingExport from "./pages/PartnerOnboardingExport";
import Prototype from "./pages/Prototype";
import Why from "./pages/Why";
import Install from "./pages/Install";
import PartnerDashboard from "./pages/PartnerDashboard";
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
            <Route path="/" element={<Landing />} />
            <Route path="/origin/:originId" element={<OriginView />} />
            <Route path="/review" element={<ReviewKit />} />
            <Route path="/docs-export" element={<DocsExport />} />
            <Route path="/briefing-export" element={<BriefingExport />} />
            <Route path="/privacy-export" element={<PrivacyExport />} />
            <Route path="/iso-export" element={<IsoExport />} />
            <Route path="/partner-onboarding-export" element={<PartnerOnboardingExport />} />
            <Route path="/cto-overview" element={<CTOOverview />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/spec" element={<Intake />} />
            <Route path="/origin" element={<Origin />} />
            <Route path="/core" element={<CoreSpec />} />
            <Route path="/proof" element={<ProofPage />} />
            <Route path="/pilot" element={<PilotDocs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/why" element={<Why />} />
            <Route path="/install" element={<Install />} />
            <Route path="/dashboard" element={<PartnerDashboard />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/witness/:token" element={<WitnessConfirmation />} />
            
            {/* PROTECTED ROUTES - Behind PinGate */}
            <Route path="/app" element={<PinGate><Index /></PinGate>} />
            <Route path="/pilot-tracker" element={<PinGate><PilotTracker /></PinGate>} />
            <Route path="/prototype" element={<PinGate><Prototype /></PinGate>} />
            <Route path="/dashboard" element={<PinGate><PartnerDashboard /></PinGate>} />
            <Route path="/pilot" element={<PinGate><PilotDocs /></PinGate>} />
            <Route path="/intake" element={<PinGate><Intake /></PinGate>} />
            <Route path="/spec" element={<PinGate><Intake /></PinGate>} />
            <Route path="/cto-overview" element={<PinGate><CTOOverview /></PinGate>} />
            
            {/* DEV/PREVIEW ROUTES - Behind PinGate */}
            <Route path="/origin-flow" element={<PinGate><B2BWalkthrough /></PinGate>} />
            <Route path="/landing-variants" element={<PinGate><LandingVariants /></PinGate>} />
            <Route path="/widget-design" element={<PinGate><WidgetMockup /></PinGate>} />
            <Route path="/origin-mark" element={<PinGate><UMarkMockup /></PinGate>} />
            
            {/* INTERNAL EXPORT ROUTES - Behind PinGate */}
            <Route path="/review" element={<PinGate><ReviewKit /></PinGate>} />
            <Route path="/docs-export" element={<PinGate><DocsExport /></PinGate>} />
            <Route path="/briefing-export" element={<PinGate><BriefingExport /></PinGate>} />
            <Route path="/privacy-export" element={<PinGate><PrivacyExport /></PinGate>} />
            <Route path="/iso-export" element={<PinGate><IsoExport /></PinGate>} />
            <Route path="/partner-onboarding-export" element={<PinGate><PartnerOnboardingExport /></PinGate>} />
            
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
