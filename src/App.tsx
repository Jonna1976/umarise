import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { PinGate } from "@/components/PinGate";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
            <Route path="/cto-overview" element={<CTOOverview />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/origin" element={<Origin />} />
            <Route path="/proof" element={<ProofPage />} />
            <Route path="/pilot" element={<PilotDocs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            
            {/* PROTECTED ROUTES - Behind PinGate */}
            <Route path="/app" element={<PinGate><Index /></PinGate>} />
            <Route path="/pilot-tracker" element={<PinGate><PilotTracker /></PinGate>} />
            
            {/* DEV/PREVIEW ROUTES */}
            <Route path="/origin-flow" element={<B2BWalkthrough />} />
            <Route path="/landing-variants" element={<LandingVariants />} />
            <Route path="/widget-design" element={<WidgetMockup />} />
            <Route path="/origin-mark" element={<UMarkMockup />} />
            <Route path="/origin-mark" element={<UMarkMockup />} />
            
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
