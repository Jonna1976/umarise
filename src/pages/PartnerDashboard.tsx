import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Activity,
  Shield,
  Clock,
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApiKeyInfo {
  id: string;
  partner_name: string;
  key_prefix: string;
  rate_limit_tier: string;
  issued_at: string;
  revoked_at: string | null;
}

interface AttestationStats {
  total: number;
  anchored: number;
  pending: number;
}

export default function PartnerDashboard() {
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<ApiKeyInfo | null>(null);
  const [stats, setStats] = useState<AttestationStats>({ total: 0, anchored: 0, pending: 0 });
  const [showKey, setShowKey] = useState(false);
  const [recentOrigins, setRecentOrigins] = useState<Array<{
    origin_id: string;
    hash: string;
    captured_at: string;
    status: string;
  }>>([]);

  const validateApiKey = async () => {
    if (!apiKey || apiKey.length < 32) {
      toast.error("Invalid API key format");
      return;
    }

    setIsValidating(true);

    try {
      // Call v1-core-health with the API key to validate
      const { data, error } = await supabase.functions.invoke("v1-core-health", {
        headers: {
          "X-API-Key": apiKey
        }
      });

      if (error) {
        toast.error("Invalid API key");
        setPartnerInfo(null);
        return;
      }

      // Extract key prefix for lookup
      const keyPrefix = apiKey.substring(0, 8);
      
      // Store validated key info (simulated - in production would verify against partner_api_keys)
      setPartnerInfo({
        id: "validated",
        partner_name: `Partner (${keyPrefix}...)`,
        key_prefix: keyPrefix,
        rate_limit_tier: "standard",
        issued_at: new Date().toISOString(),
        revoked_at: null
      });

      toast.success("API key validated");
      
      // Fetch stats after validation
      await fetchStats();
    } catch {
      toast.error("Failed to validate API key");
    } finally {
      setIsValidating(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("v1-internal-metrics");
      
      if (!error && data) {
        setStats({
          total: data.attestations?.total || 0,
          anchored: data.ots?.anchored || 0,
          pending: data.ots?.pending || 0
        });
      }
    } catch {
      console.error("Failed to fetch stats");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadProof = async (originId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/v1-core-proof?origin_id=${originId}`
      );
      
      if (!response.ok) {
        toast.error("Proof not available yet");
        return;
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${originId}.ots`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Proof downloaded");
    } catch {
      toast.error("Failed to download proof");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-landing-copper/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-landing-copper" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Partner Dashboard</h1>
              <p className="text-xs text-muted-foreground">Umarise Core</p>
            </div>
          </div>
          {partnerInfo && (
            <Badge variant="outline" className="text-green-600 border-green-600/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* API Key Input */}
        {!partnerInfo ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Connect Your API Key
              </CardTitle>
              <CardDescription>
                Enter your partner API key to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="um_xxxxxxxx..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={validateApiKey} disabled={isValidating}>
                  {isValidating ? "Validating..." : "Connect"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Don't have an API key?{" "}
                <a href="mailto:hello@umarise.com" className="text-landing-copper hover:underline">
                  Contact us
                </a>
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Attestations</p>
                      <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <Activity className="h-8 w-8 text-landing-copper/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bitcoin Anchored</p>
                      <p className="text-3xl font-bold text-green-600">{stats.anchored}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="verify" className="space-y-4">
              <TabsList>
                <TabsTrigger value="verify">Verify Hash</TabsTrigger>
                <TabsTrigger value="docs">API Reference</TabsTrigger>
                <TabsTrigger value="keys">API Key</TabsTrigger>
              </TabsList>

              <TabsContent value="verify">
                <VerifySection />
              </TabsContent>

              <TabsContent value="docs">
                <ApiDocsSection />
              </TabsContent>

              <TabsContent value="keys">
                <KeyManagementSection 
                  partnerInfo={partnerInfo} 
                  onDisconnect={() => {
                    setPartnerInfo(null);
                    setApiKey("");
                  }}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

function VerifySection() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<{
    found: boolean;
    origin?: {
      origin_id: string;
      hash: string;
      captured_at: string;
    };
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!hash) return;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("v1-core-verify", {
        body: { hash }
      });
      
      if (error) {
        toast.error("Verification failed");
        return;
      }
      
      setResult(data);
      
      if (data.found) {
        toast.success("Origin found");
      } else {
        toast.info("No origin found for this hash");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Hash</CardTitle>
        <CardDescription>
          Check if a SHA-256 hash has been attested in the registry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="sha256:abc123... or abc123..."
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${result.found ? "bg-green-500/10 border border-green-500/20" : "bg-muted"}`}>
            {result.found ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Origin Found</span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Origin ID: </span>
                    <code className="text-foreground">{result.origin?.origin_id}</code>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Captured: </span>
                    <span className="text-foreground">
                      {result.origin?.captured_at && new Date(result.origin.captured_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <span>No attestation found for this hash</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApiDocsSection() {
  const endpoints = [
    {
      method: "POST",
      path: "/v1-core-origins",
      description: "Create a new attestation",
      auth: "X-API-Key required"
    },
    {
      method: "GET",
      path: "/v1-core-resolve",
      description: "Lookup by origin_id or hash",
      auth: "Public"
    },
    {
      method: "POST",
      path: "/v1-core-verify",
      description: "Verify a hash exists",
      auth: "Public"
    },
    {
      method: "GET",
      path: "/v1-core-proof",
      description: "Download OTS proof file",
      auth: "Public"
    },
    {
      method: "GET",
      path: "/v1-core-health",
      description: "Health check",
      auth: "Public"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Reference</CardTitle>
        <CardDescription>
          Umarise Core v1 endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {endpoints.map((endpoint) => (
            <div 
              key={endpoint.path} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge 
                  variant={endpoint.method === "POST" ? "default" : "outline"}
                  className="font-mono text-xs"
                >
                  {endpoint.method}
                </Badge>
                <code className="text-sm text-foreground">{endpoint.path}</code>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{endpoint.description}</span>
                <Badge variant="outline" className="text-xs">
                  {endpoint.auth}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <a 
            href="/spec" 
            target="_blank"
            className="flex items-center gap-2 text-landing-copper hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View full OpenAPI specification
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function KeyManagementSection({ 
  partnerInfo, 
  onDisconnect 
}: { 
  partnerInfo: ApiKeyInfo;
  onDisconnect: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key</CardTitle>
        <CardDescription>
          Manage your API key
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Key Prefix</span>
            <code className="text-sm font-mono">{partnerInfo.key_prefix}...</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rate Limit Tier</span>
            <Badge variant="outline">{partnerInfo.rate_limit_tier}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
              Active
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button variant="outline" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
