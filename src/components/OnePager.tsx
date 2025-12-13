import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, Database, Brain, Layers, Users, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";

interface OnePagerProps {
  onClose: () => void;
}

interface Metrics {
  pageCount: number;
  snapshotCount: number;
  uniqueDays: number;
  oldestPage: string | null;
}

const OnePager = ({ onClose }: OnePagerProps) => {
  const [metrics, setMetrics] = useState<Metrics>({
    pageCount: 0,
    snapshotCount: 0,
    uniqueDays: 0,
    oldestPage: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const deviceUserId = getDeviceId();
      
      const [pagesRes, snapshotsRes] = await Promise.all([
        supabase
          .from("pages")
          .select("created_at")
          .eq("device_user_id", deviceUserId)
          .order("created_at", { ascending: true }),
        supabase
          .from("personality_snapshots")
          .select("id")
          .eq("device_user_id", deviceUserId),
      ]);

      const pages = pagesRes.data || [];
      const uniqueDays = new Set(
        pages.map((p) => new Date(p.created_at).toDateString())
      ).size;

      setMetrics({
        pageCount: pages.length,
        snapshotCount: snapshotsRes.data?.length || 0,
        uniqueDays,
        oldestPage: pages[0]?.created_at || null,
      });
    };

    fetchMetrics();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Umarise - Universal Memory Layer",
        text: "Transform handwritten knowledge into a searchable, longitudinal Codex.",
        url: window.location.origin,
      });
    }
  };

  const daysSinceStart = metrics.oldestPage
    ? Math.floor(
        (Date.now() - new Date(metrics.oldestPage).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto print:relative print:bg-white"
    >
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header with close button - hidden in print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* One-pager content */}
        <div className="space-y-8 print:space-y-6">
          {/* Hero */}
          <div className="text-center border-b border-border pb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 print:text-3xl">
              UMARISE
            </h1>
            <p className="text-xl text-amber-500 font-medium mb-4">
              Universal Memory Layer
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform handwritten knowledge into a searchable, longitudinal Codex.
              Your ideas compound. Your patterns emerge. Your direction becomes clear.
            </p>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-4 gap-4 print:gap-2">
            <MetricCard
              label="Pages Captured"
              value={metrics.pageCount}
              icon={<Database className="w-5 h-5" />}
            />
            <MetricCard
              label="Personality Snapshots"
              value={metrics.snapshotCount}
              icon={<Brain className="w-5 h-5" />}
            />
            <MetricCard
              label="Active Days"
              value={metrics.uniqueDays}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              label="Days Running"
              value={daysSinceStart}
              icon={<Layers className="w-5 h-5" />}
            />
          </div>

          {/* Core Value Proposition */}
          <div className="grid md:grid-cols-2 gap-8 print:gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 text-sm">1</span>
                </span>
                The Problem
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Handwritten knowledge is fragmented and non-discoverable</li>
                <li>• Notebooks pile up, ideas get lost, patterns stay invisible</li>
                <li>• Existing tools force migration away from paper</li>
                <li>• No longitudinal view of your thinking evolution</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 text-sm">2</span>
                </span>
                The Solution
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Photo your pages → AI reads, summarizes, connects</li>
                <li>• Patterns emerge across weeks and months</li>
                <li>• Personality profile reveals your core drivers</li>
                <li>• Threads show your long-term direction</li>
              </ul>
            </div>
          </div>

          {/* Technical Capabilities */}
          <div className="bg-muted/30 rounded-lg p-6 print:bg-gray-50">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Technical Capabilities (Built)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <CapabilityItem title="Capture Loop" desc="Camera → OCR → AI Summary" />
              <CapabilityItem title="Pattern Analysis" desc="Themes, tones, keywords" />
              <CapabilityItem title="Personality Engine" desc="Voice + Influences profiles" />
              <CapabilityItem title="Thread Detection" desc="Long-term recurring themes" />
              <CapabilityItem title="Kompas View" desc="Visual direction anchor" />
              <CapabilityItem title="Full-text Search" desc="Find any handwritten word" />
              <CapabilityItem title="Privacy-first" desc="No login, device-based ID" />
              <CapabilityItem title="Partner-ready API" desc="Abstraction layer built" />
            </div>
          </div>

          {/* Partner Model */}
          <div className="grid md:grid-cols-2 gap-8 print:gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Partner Model
              </h2>
              <p className="text-muted-foreground mb-4">
                Brands keep their format and ritual. Umarise provides the memory infrastructure.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Moleskine</strong> → Premium notebook + Codex</li>
                <li>• <strong>TFMJ</strong> → Journal ritual + Memory layer</li>
                <li>• <strong>Field Notes</strong> → Quick capture + Thread detection</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Defensible Moat
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Capture UX:</strong> Zero friction, camera-first</li>
                <li>• <strong>Codex Graph:</strong> Longitudinal semantic mapping</li>
                <li>• <strong>Mirror Philosophy:</strong> Reflects, never prescribes</li>
                <li>• <strong>Data Ownership:</strong> Export anytime, your data</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Target Users:</strong> Founders, writers, students, designers, researchers — people who think on paper
            </p>
            <p className="text-amber-500 font-medium">
              "Your inner world becomes a living universe"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MetricCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) => (
  <div className="bg-muted/30 rounded-lg p-4 text-center print:bg-gray-50 print:p-2">
    <div className="flex justify-center mb-2 text-amber-500">{icon}</div>
    <div className="text-2xl font-bold text-foreground print:text-xl">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const CapabilityItem = ({ title, desc }: { title: string; desc: string }) => (
  <div>
    <div className="font-medium text-foreground">{title}</div>
    <div className="text-muted-foreground text-xs">{desc}</div>
  </div>
);

export default OnePager;
