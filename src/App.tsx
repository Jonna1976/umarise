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
import Landing from "./pages/Landing";
import { WarmPaletteMockup } from "./components/dev/WarmPaletteMockup";
import { CurrentPaletteMockup } from "./components/dev/CurrentPaletteMockup";
import { DemoWalkthrough } from "./components/dev/DemoWalkthrough";
import { DemoWalkthrough2 } from "./components/dev/DemoWalkthrough2";
import { B2BWalkthrough } from "./components/dev/B2BWalkthrough";
import { WidgetMockup } from "./components/dev/WidgetMockup";
import UMarkMockup from "./components/dev/UMarkMockup";
import PilotTracker from "./pages/PilotTracker";
import ProofPage from "./pages/ProofPage";
import PilotDocs from "./pages/PilotDocs";
import PrivacyExport from "./pages/PrivacyExport";
import IsoExport from "./pages/IsoExport";

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
            <Route path="/proof" element={<ProofPage />} />
            <Route path="/pilot" element={<PilotDocs />} />
            
            {/* PROTECTED ROUTES - Behind PinGate */}
            <Route path="/app" element={<PinGate><Index /></PinGate>} />
            <Route path="/pilot-tracker" element={<PinGate><PilotTracker /></PinGate>} />
            
            {/* DEV/PREVIEW ROUTES */}
            <Route path="/warm-preview" element={<WarmPaletteMockup />} />
            <Route path="/current-preview" element={<CurrentPaletteMockup />} />
            <Route path="/demo-walkthrough" element={<DemoWalkthrough />} />
            <Route path="/demo-walkthrough-2" element={<DemoWalkthrough2 />} />
            <Route path="/origin-flow" element={<B2BWalkthrough />} />
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
