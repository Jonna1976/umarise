import { Camera, BookOpen, Sparkles, Search } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Widget Design Mockup for iOS/Android Homescreen
 * 
 * Philosophy: 
 * - "Never lose anything. 2 words. Always find back."
 * - One tap to capture, 2 cues to retrieve
 * - Focus on retrieval, not journaling
 */

// Small Widget (2x2) - One tap capture
const SmallWidget = () => (
  <div className="w-[170px] h-[170px] rounded-[24px] bg-gradient-to-br from-background via-background to-primary/5 border border-border/30 p-4 flex flex-col justify-between shadow-lg backdrop-blur-sm">
    {/* Logo/Brand */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <BookOpen className="w-4 h-4 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground/70">Umarise</span>
    </div>
    
    {/* Main Action */}
    <div className="flex-1 flex items-center justify-center">
      <motion.div 
        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Camera className="w-7 h-7 text-primary-foreground" />
      </motion.div>
    </div>
    
    {/* Tagline */}
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground">Snap it. Find it. Always.</p>
    </div>
  </div>
);

// Medium Widget (4x2) - Capture + 2-word cue preview
const MediumWidget = () => (
  <div className="w-[364px] h-[170px] rounded-[24px] bg-gradient-to-br from-background via-background to-primary/5 border border-border/30 p-4 flex gap-4 shadow-lg backdrop-blur-sm">
    {/* Left: Capture Action */}
    <div className="flex flex-col justify-between w-1/3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-xs font-medium text-foreground/70">Umarise</span>
      </div>
      
      <motion.div 
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Camera className="w-6 h-6 text-primary-foreground" />
      </motion.div>
      
      <p className="text-[10px] text-muted-foreground text-center">Snap now</p>
    </div>
    
    {/* Right: Recent Cues - Find Back */}
    <div className="flex-1 bg-muted/30 rounded-xl p-3 flex flex-col justify-between">
      <div className="flex items-center gap-1.5">
        <Search className="w-3 h-3 text-primary/60" />
        <span className="text-[10px] text-muted-foreground">Recent captures</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-primary/10 rounded-full text-xs text-primary">morning</span>
          <span className="px-2 py-1 bg-primary/10 rounded-full text-xs text-primary">clarity</span>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">meeting</span>
          <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">ideas</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">12 captures</span>
        <span className="text-[10px] text-primary/60">Find anything →</span>
      </div>
    </div>
  </div>
);

// Large Widget (4x4) - Full experience
const LargeWidget = () => (
  <div className="w-[364px] h-[364px] rounded-[24px] bg-gradient-to-br from-background via-background to-primary/5 border border-border/30 p-5 flex flex-col shadow-lg backdrop-blur-sm">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">Umarise</span>
      </div>
      <span className="text-xs text-muted-foreground">12 pages saved</span>
    </div>
    
    {/* Main Capture Button */}
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <motion.div 
        className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Camera className="w-9 h-9 text-primary-foreground" />
      </motion.div>
      <p className="text-sm text-foreground/70">Snap anything. Find it with 2 words.</p>
    </div>
    
    {/* 2-Word Cueing Preview */}
    <div className="bg-muted/30 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Search className="w-3 h-3 text-primary/60" />
          <span className="text-xs text-muted-foreground">Your cues — tap to find</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-primary/10 rounded-full text-[11px] text-primary">morning</span>
            <span className="px-2 py-0.5 bg-primary/10 rounded-full text-[11px] text-primary">clarity</span>
          </div>
          <span className="text-[10px] text-muted-foreground">2h ago</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">project</span>
            <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">goals</span>
          </div>
          <span className="text-[10px] text-muted-foreground">yesterday</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">book</span>
            <span className="px-2 py-0.5 bg-muted rounded-full text-[11px] text-muted-foreground">quote</span>
          </div>
          <span className="text-[10px] text-muted-foreground">3 days ago</span>
        </div>
      </div>
    </div>
  </div>
);

// Phone mockup showing widget on homescreen
const PhoneMockup = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="relative">
      {/* Phone frame */}
      <div className="w-[280px] h-[560px] bg-black rounded-[40px] p-2 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-[32px] overflow-hidden relative">
          {/* Status bar */}
          <div className="h-12 flex items-center justify-between px-6 pt-2">
            <span className="text-white text-xs font-medium">9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2 bg-white/60 rounded-sm" />
              <div className="w-4 h-2 bg-white/60 rounded-sm" />
              <div className="w-6 h-3 bg-white rounded-sm" />
            </div>
          </div>
          
          {/* Widget area */}
          <div className="p-4 flex justify-center">
            <div className="scale-[0.65] origin-top">
              {children}
            </div>
          </div>
          
          {/* Other app icons (placeholder) */}
          <div className="absolute bottom-20 left-0 right-0 px-6">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
          
          {/* Dock */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-16 bg-white/10 rounded-2xl backdrop-blur-xl flex items-center justify-around px-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/20" />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full" />
    </div>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

export const WidgetMockup = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Umarise Widget</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Snap anything. 2 words. Find it forever.
          </p>
          <p className="text-sm text-primary/70">
            Your second brain, one tap away
          </p>
        </div>
        
        {/* Widget Sizes - Standalone */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground">Widget Sizes</h2>
          
          <div className="flex flex-wrap gap-8 justify-center items-start">
            <div className="flex flex-col items-center gap-3">
              <SmallWidget />
              <span className="text-sm text-muted-foreground">Small (2×2)</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <MediumWidget />
              <span className="text-sm text-muted-foreground">Medium (4×2)</span>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <LargeWidget />
              <span className="text-sm text-muted-foreground">Large (4×4)</span>
            </div>
          </div>
        </div>
        
        {/* On Phone Mockups */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground text-center">On Your Homescreen</h2>
          
          <div className="flex flex-wrap gap-8 justify-center">
            <PhoneMockup label="Small widget">
              <SmallWidget />
            </PhoneMockup>
            
            <PhoneMockup label="Medium widget">
              <MediumWidget />
            </PhoneMockup>
          </div>
        </div>
        
        {/* Philosophy */}
        <div className="bg-muted/30 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">Design Philosophy</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary">→</span>
              <span><strong>2-Word Cueing:</strong> AI suggests 2 memorable words for each capture. Your brain knows the rest.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">→</span>
              <span><strong>Never Lose Anything:</strong> That recipe, quote, receipt, whiteboard — snap it, find it anytime.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">→</span>
              <span><strong>Instant Retrieval:</strong> Type 2 words you remember. Instantly find what you're looking for.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">→</span>
              <span><strong>One Tap Away:</strong> Widget on your homescreen. No app opening, no friction.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
