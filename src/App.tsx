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
import { WarmPaletteMockup } from "./components/dev/WarmPaletteMockup";
import { CurrentPaletteMockup } from "./components/dev/CurrentPaletteMockup";
import { DemoWalkthrough } from "./components/dev/DemoWalkthrough";
import { DemoWalkthrough2 } from "./components/dev/DemoWalkthrough2";
import { WidgetMockup } from "./components/dev/WidgetMockup";
import PilotTracker from "./pages/PilotTracker";
import ProofPage from "./pages/ProofPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DemoModeProvider>
      <TooltipProvider>
        <PinGate>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/origin/:originId" element={<OriginView />} />
              <Route path="/proof" element={<ProofPage />} />
              <Route path="/pilot-tracker" element={<PilotTracker />} />
              <Route path="/warm-preview" element={<WarmPaletteMockup />} />
              <Route path="/current-preview" element={<CurrentPaletteMockup />} />
              <Route path="/demo-walkthrough" element={<DemoWalkthrough />} />
              <Route path="/demo-walkthrough-2" element={<DemoWalkthrough2 />} />
              <Route path="/widget-design" element={<WidgetMockup />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PinGate>
      </TooltipProvider>
    </DemoModeProvider>
  </QueryClientProvider>
);

export default App;
