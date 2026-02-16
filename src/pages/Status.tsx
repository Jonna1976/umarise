import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, AlertTriangle, XCircle, Activity, Clock, TrendingUp } from "lucide-react";

interface HealthCheck {
  id: string;
  checked_at: string;
  status: string;
  response_time_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  consecutive_failures: number;
}

const statusConfig = {
  operational: { icon: CheckCircle, label: "Operational", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  degraded: { icon: AlertTriangle, label: "Degraded", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  down: { icon: XCircle, label: "Down", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function Status() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecks();
    const interval = setInterval(loadChecks, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadChecks() {
    const { data } = await supabase
      .from("health_checks")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(500);

    if (data) setChecks(data as HealthCheck[]);
    setLoading(false);
  }

  const currentStatus = checks[0]?.status ?? "operational";
  const config = statusConfig[currentStatus as keyof typeof statusConfig] ?? statusConfig.operational;
  const StatusIcon = config.icon;

  // Uptime (30 days)
  const totalChecks = checks.length;
  const operationalChecks = checks.filter((c) => c.status === "operational").length;
  const uptimePercent = totalChecks > 0 ? ((operationalChecks / totalChecks) * 100).toFixed(2) : "—";

  // Avg response time (24h)
  const now = Date.now();
  const last24h = checks.filter((c) => now - new Date(c.checked_at).getTime() < 86_400_000);
  const avgResponseTime = last24h.length > 0
    ? Math.round(last24h.reduce((sum, c) => sum + (c.response_time_ms ?? 0), 0) / last24h.length)
    : 0;

  // Last 10 incidents
  const incidents = checks.filter((c) => c.status !== "operational").slice(0, 10);

  return (
    <div className="min-h-screen" style={{ background: "hsl(220, 8%, 7%)" }}>
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-2">
          <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: "hsl(25, 35%, 42%)" }}>
            Umarise Core API
          </span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white/90 mb-8" style={{ fontFamily: "'EB Garamond', serif" }}>
          System Status
        </h1>

        {/* Current Status Banner */}
        {loading ? (
          <div className="rounded-lg border border-white/10 p-8 text-center">
            <Activity className="w-6 h-6 text-white/30 animate-pulse mx-auto mb-2" />
            <p className="text-white/40 text-sm font-mono">Loading status…</p>
          </div>
        ) : (
          <>
            <div className={`rounded-lg border ${config.border} ${config.bg} p-6 mb-12 flex items-center gap-4`}>
              <StatusIcon className={`w-8 h-8 ${config.color}`} />
              <div>
                <p className={`text-lg font-medium ${config.color}`}>{config.label}</p>
                <p className="text-white/40 text-xs font-mono mt-1">
                  Last checked: {checks[0] ? new Date(checks[0].checked_at).toLocaleString("nl-NL") : "—"}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              <MetricCard icon={TrendingUp} label="Uptime (30d)" value={`${uptimePercent}%`} />
              <MetricCard icon={Clock} label="Avg Response (24h)" value={`${avgResponseTime}ms`} />
              <MetricCard icon={Activity} label="Checks (30d)" value={`${totalChecks}`} />
            </div>

            {/* Response time sparkline (last 50 checks) */}
            <div className="mb-12">
              <h2 className="text-sm font-mono text-white/50 tracking-wider uppercase mb-4">Response Time (recent)</h2>
              <div className="flex items-end gap-[2px] h-16">
                {checks.slice(0, 50).reverse().map((c, i) => {
                  const ms = c.response_time_ms ?? 0;
                  const maxMs = 3000;
                  const height = Math.max(2, Math.min(64, (ms / maxMs) * 64));
                  const isError = c.status !== "operational";
                  return (
                    <div
                      key={c.id}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${height}px`,
                        backgroundColor: isError ? "hsl(0, 60%, 50%)" : "hsl(25, 35%, 42%)",
                        opacity: 0.7 + (i / 50) * 0.3,
                      }}
                      title={`${ms}ms — ${new Date(c.checked_at).toLocaleTimeString("nl-NL")}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-white/20 font-mono mt-1">
                <span>older</span>
                <span>now</span>
              </div>
            </div>

            {/* Incidents */}
            <div>
              <h2 className="text-sm font-mono text-white/50 tracking-wider uppercase mb-4">
                Recent Incidents {incidents.length === 0 && "— None"}
              </h2>
              {incidents.length > 0 && (
                <div className="space-y-2">
                  {incidents.map((inc) => {
                    const incConfig = statusConfig[inc.status as keyof typeof statusConfig] ?? statusConfig.degraded;
                    const IncIcon = incConfig.icon;
                    return (
                      <div key={inc.id} className="flex items-center gap-3 border border-white/5 rounded-md px-4 py-3">
                        <IncIcon className={`w-4 h-4 ${incConfig.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-white/60 text-sm">{inc.error_message || inc.status}</span>
                        </div>
                        <span className="text-white/25 text-xs font-mono shrink-0">
                          {new Date(inc.checked_at).toLocaleString("nl-NL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center">
              <p className="text-white/20 text-xs font-mono">
                Automated monitoring every 5 minutes · Data retained for 30 days
              </p>
              <p className="text-white/10 text-xs font-mono mt-1">
                © Umarise · <a href="/" className="underline hover:text-white/30">umarise.com</a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-white/30" />
        <span className="text-white/40 text-xs font-mono uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white/80 text-2xl font-light" style={{ fontFamily: "'EB Garamond', serif" }}>{value}</p>
    </div>
  );
}
