import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, Database, Sparkles, Layers, Users, Shield, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { countPersonalitySnapshots } from "@/lib/companionProxy";
import { getActiveDeviceId } from "@/lib/deviceId";

interface OnePagerProps {
  onClose: () => void;
}

interface Metrics {
  pageCount: number;
  themeCount: number;
  uniqueDays: number;
  oldestPage: string | null;
}

const OnePager = ({ onClose }: OnePagerProps) => {
  const [metrics, setMetrics] = useState<Metrics>({
    pageCount: 0,
    themeCount: 0,
    uniqueDays: 0,
    oldestPage: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const deviceUserId = getActiveDeviceId();
      
      const [pagesRes, snapshotsRes] = await Promise.all([
        supabase
          .from("pages")
          .select("created_at")
          .eq("device_user_id", deviceUserId)
          .order("created_at", { ascending: true }),
        countPersonalitySnapshots(deviceUserId),
      ]);

      const pages = pagesRes.data || [];
      const uniqueDays = new Set(
        pages.map((p) => new Date(p.created_at).toDateString())
      ).size;

      setMetrics({
        pageCount: pages.length,
        themeCount: snapshotsRes.data?.count || 0,
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
        text: "Most tools help you do more. Umarise helps humanity remember.",
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
              Most tools help you do more. Umarise helps humanity remember.
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto">
              This is not a productivity company. This is memory infrastructure.
            </p>
            <p className="text-base text-foreground/90 max-w-2xl mx-auto mt-4">
              Transform handwriting into a searchable, longitudinal Codex.
              <br />
              <span className="text-amber-500">Every capture compounds the value of your memory.</span>
            </p>
          </div>

          {/* The Primitive */}
          <div className="bg-muted/30 border border-border rounded-lg p-6 print:bg-gray-50">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              The Missing Primitive
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The internet has primitives for identity, payments, and messaging, but it doesn't have a simple way to prove when something actually existed. Files can be copied, edited, or backdated, and metadata can't be trusted. Umarise introduces a primitive for verifiable history. A file is hashed, the hash is anchored to an immutable timestamp, and a portable proof travels with the artifact. Anyone can independently verify that these exact bytes existed at or before time <em>T</em>.
            </p>
            <p className="text-sm text-amber-500 font-medium mt-3">
              We're making "this existed at this moment" a first-class primitive of the internet.
            </p>
          </div>

          {/* Executive Summary — IP & Moat */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-6 print:bg-amber-50">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Executive Summary: Open-Source & IP
            </h2>
            <blockquote className="border-l-2 border-amber-500/40 pl-4 mb-4 text-sm text-muted-foreground italic leading-relaxed">
              "The specification is public domain. The SDK is open-source. Verification is independent.
              But the operational infrastructure, the batching engine, the key management, the immutability triggers,
              the rate limiting, that is our protected IP. Just like Let's Encrypt: the protocol is open,
              the client is open, but the Certificate Authority behind the scenes is not something you replicate over a weekend."
            </blockquote>
            <blockquote className="border-l-2 border-amber-500/40 pl-4 text-sm text-muted-foreground italic leading-relaxed">
              "Our real moat isn't the code. It's the combination of (1) a growing Bitcoin-anchored registry
              that cannot be reproduced, (2) an ecosystem of .proof files referencing our origin_id's,
              and (3) specification authority as the first formal standard for anchoring. You can copy code. You can't copy history."
            </blockquote>
          </div>

          {/* Historical mirror: DNS / Git / TLS */}
          <div className="bg-muted/30 border border-border rounded-lg p-6 print:bg-gray-50">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Historical mirror
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Three primitives became invisible infrastructure by being small, domainless, and composable:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
              <div>
                <div className="font-medium text-foreground">DNS</div>
                <div className="text-muted-foreground text-xs">name &rarr; address</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Git</div>
                <div className="text-muted-foreground text-xs">content &rarr; verifiable history</div>
              </div>
              <div>
                <div className="font-medium text-foreground">TLS</div>
                <div className="text-muted-foreground text-xs">connection &rarr; trust</div>
              </div>
              <div>
                <div className="font-medium text-amber-500">Umarise</div>
                <div className="text-muted-foreground text-xs">artifact &rarr; proof of existence</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/80 italic">
              If DNS resolves names and Git preserves history, <span className="text-amber-500 not-italic font-medium">Umarise anchors existence</span>.
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
              label="Active Days"
              value={metrics.uniqueDays}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              label="Theme Snapshots"
              value={metrics.themeCount}
              icon={<Sparkles className="w-5 h-5" />}
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
                <li>• Notebooks pile up; insights stay invisible</li>
                <li>• Existing tools force migration away from paper</li>
                <li>• No longitudinal view of your thinking over time</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 text-sm">2</span>
                </span>
                The Solution
              </h2>
              <p className="text-amber-500 font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                One action. Immediate value.
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Open Umarise → camera opens instantly</li>
                <li>• Capture a page → Codex updates immediately</li>
                <li>• <strong>Snapshot:</strong> editable summary of what this page is about</li>
                <li>• <strong>Thread signal:</strong> "you've returned to this theme for 11 months"</li>
                <li>• <strong>Source of truth:</strong> original page always preserved</li>
              </ul>
              <p className="text-xs text-muted-foreground/80 mt-3 italic">
                No organization work required. Value compounds every capture.
              </p>
            </div>
          </div>

          {/* Technical Capabilities */}
          <div className="bg-muted/30 rounded-lg p-6 print:bg-gray-50">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Technical Capabilities (Built)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <CapabilityItem title="Capture Loop" desc="Camera-first capture designed for messy handwriting" />
              <CapabilityItem title="Codex Timeline + Search" desc="Find anything later—across notebooks and years" />
              <CapabilityItem title="Threads & Patterns" desc="Recurring themes and long-term direction over time" />
              <CapabilityItem title="Trust Layer" desc="Original always visible + confidence + edit + audit trail" />
              <CapabilityItem title="Voice & Themes" desc="Your voice profile + what influences you" />
              <CapabilityItem title="Portability (Vault API)" desc="Backend swappable via abstraction layer" />
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
                Brands keep their format and ritual.
                <br />
                <span className="text-amber-500">Umarise provides the memory engine underneath.</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Moleskine</strong> → premium notebook + Codex memory layer</li>
                <li>• <strong>TFMJ</strong> → journaling ritual + memory layer</li>
                <li>• <strong>Field Notes</strong> → quick capture + thread detection</li>
                <li>• <strong>Research/Writers</strong> → notebooks → searchable longitudinal Codex</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Defensible Moat
              </h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• <strong>Capture UX:</strong> habit ownership, zero friction</li>
                <li>• <strong>Codex Graph:</strong> longitudinal semantic mapping</li>
                <li>• <strong>Standard:</strong> one memory layer under every paper format</li>
                <li>• <strong>Compounding:</strong> time makes the Codex irreplaceable</li>
                <li>• <strong>Partner Pull:</strong> brands adopt the engine instead of rebuilding</li>
                <li>• <strong>Data Ownership:</strong> export/delete anytime</li>
              </ul>
            </div>
          </div>

          {/* Takeaway */}
          <div className="text-center py-4 bg-amber-500/10 rounded-lg">
            <p className="text-foreground font-medium">
              Storage stores. Journaling guides. Notes organize. <span className="text-amber-500">Umarise remembers.</span>
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Target users:</strong> founders, writers, researchers, creators—people who think on paper.
            </p>
            <p className="text-amber-500 font-medium">
              Photos for handwriting.
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
