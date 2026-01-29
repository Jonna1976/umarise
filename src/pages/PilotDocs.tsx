import { ArrowLeft, Copy, Check, ExternalLink, Target, BarChart3, Plug, Radio, Code, CheckCircle2, Mic, Calendar, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SUPABASE_URL = "https://lppltmdtiypbfzlszhhb.supabase.co/functions/v1";

export default function PilotDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, id)}
      className="h-6 px-2"
    >
      {copiedEndpoint === id ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  const SectionIcon = ({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) => (
    <div className="h-5 w-5 rounded bg-codex-gold/20 flex items-center justify-center mr-2">
      <Icon className="h-3 w-3 text-codex-gold" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="text-xs text-muted-foreground font-mono tracking-wide">PILOT PARTNERS</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Phase 2 Pilot</h1>
          <p className="text-muted-foreground">
            Commercial validation — 3 SMB teams, 21 days
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Guide</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Target} />
                  Validation Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>First paying customer</span>
                    <span className="text-xs bg-codex-gold/20 text-codex-gold px-2 py-1 rounded font-mono">€1+ paid</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Partner API integration</span>
                    <span className="text-xs bg-codex-gold/20 text-codex-gold px-2 py-1 rounded font-mono">/resolve or /verify call</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span>Due diligence sign-off</span>
                    <span className="text-xs bg-codex-gold/20 text-codex-gold px-2 py-1 rounded font-mono">CTO confirmation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={BarChart3} />
                  Measurable Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">≥20</div>
                    <div className="text-xs text-muted-foreground">Origins per team</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">≥80%</div>
                    <div className="text-xs text-muted-foreground">Retrieval &lt;60s</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">≥1</div>
                    <div className="text-xs text-muted-foreground">API call per team</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">≥40</div>
                    <div className="text-xs text-muted-foreground">NPS score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Guide Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Plug} />
                  Quick Start (15 min)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resolve Origin */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Step 1: Resolve Origin</h3>
                    <CopyButton 
                      text={`curl "${SUPABASE_URL}/resolve-origin?origin_id=YOUR_ORIGIN_ID"`}
                      id="resolve"
                    />
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`curl "${SUPABASE_URL}/resolve-origin?origin_id=YOUR_ORIGIN_ID"`}
                  </pre>
                  <details className="mt-2">
                    <summary className="text-sm text-muted-foreground cursor-pointer">Response example</summary>
                    <pre className="bg-muted/50 p-3 rounded-lg mt-2 text-xs overflow-x-auto">
{`{
  "found": true,
  "origin_id": "fb025c0e-0dc8-4b4f-b795-43177ea2a045",
  "origin_hash_sha256": "1f205f1eb69abefd...",
  "hash_status": "verified",
  "origin_mark": "ᵁ",
  "captured_at": "2026-01-28T14:32:00Z",
  "origin_link_url": "https://umarise.lovable.app/origin/..."
}`}
                    </pre>
                  </details>
                </div>

                {/* Verify Origin */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Step 2: Verify Origin</h3>
                    <CopyButton 
                      text={`curl -X POST "${SUPABASE_URL}/verify" -H "Content-Type: application/json" -d '{"origin_id": "YOUR_ORIGIN_ID", "content": "BASE64_IMAGE"}'`}
                      id="verify"
                    />
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`curl -X POST "${SUPABASE_URL}/verify" \\
  -H "Content-Type: application/json" \\
  -d '{"origin_id": "...", "content": "BASE64..."}'`}
                  </pre>
                  <details className="mt-2">
                    <summary className="text-sm text-muted-foreground cursor-pointer">Response example</summary>
                    <pre className="bg-muted/50 p-3 rounded-lg mt-2 text-xs overflow-x-auto">
{`{
  "verified": true,
  "origin_id": "fb025c0e-...",
  "submitted_hash": "1f205f1eb69abefd...",
  "stored_hash": "1f205f1eb69abefd...",
  "match": true
}`}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Radio} />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono">/resolve-origin</code>
                      <span className="ml-2 text-xs text-muted-foreground">GET · Public</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Origin metadata</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono">/verify</code>
                      <span className="ml-2 text-xs text-muted-foreground">POST · Public</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Bit-identity check</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <code className="text-sm font-mono">/origins</code>
                      <span className="ml-2 text-xs text-muted-foreground">POST · API Key</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Create origin</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Code} />
                  TypeScript Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`async function verifyOrigin(originId: string, imageBlob: Blob) {
  const base64 = await blobToBase64(imageBlob);
  
  const response = await fetch(
    \`${SUPABASE_URL}/verify\`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_id: originId,
        content: base64
      })
    }
  );
  
  const result = await response.json();
  return result.verified && result.match;
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={CheckCircle2} />
                  Tech Lead Checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Week 1: Exploration</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Resolve 3 origins via API</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Review response structure</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Identify integration point in own stack</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Week 2: Prototype</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Build simple verify call</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Test with real origin from pilot</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Document use case</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Week 3: Evaluation</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Demo to team</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Feedback on API design</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>Discuss production requirements</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Mic} />
                  Exit Interview Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-sm">"Was the API documentation sufficient?"</li>
                  <li className="text-sm">"Which endpoints were missing?"</li>
                  <li className="text-sm">"How would you deploy this in production?"</li>
                  <li className="text-sm">"What SLA would you expect?"</li>
                  <li className="text-sm">"Any security concerns?"</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Calendar} />
                  21-Day Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 text-sm font-mono text-muted-foreground">Week 0</div>
                    <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Invitation</div>
                      <div className="text-sm text-muted-foreground">Reach out to 3 candidate teams</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 text-sm font-mono text-muted-foreground">Week 1</div>
                    <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Onboarding</div>
                      <div className="text-sm text-muted-foreground">Account setup + first captures</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 text-sm font-mono text-muted-foreground">Week 2</div>
                    <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Daily usage</div>
                      <div className="text-sm text-muted-foreground">Check-in: "What would you miss?"</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 text-sm font-mono text-muted-foreground">Week 3</div>
                    <div className="flex-1 p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium">Integration + Evaluation</div>
                      <div className="text-sm text-muted-foreground">API tests + exit interviews</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SectionIcon icon={Target} />
                  Success Definition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-codex-gold/10 rounded-lg">
                    <span className="text-codex-gold mt-0.5">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm">≥1 team says: "I would pay for this"</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-codex-gold/10 rounded-lg">
                    <span className="text-codex-gold mt-0.5">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm">≥1 team calls the API from their own system</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-codex-gold/10 rounded-lg">
                    <span className="text-codex-gold mt-0.5">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm">≥1 tech lead confirms: "This is solidly built"</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resources */}
        <div className="mt-8 pt-8 border-t border-border/40">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <SectionIcon icon={Paperclip} />
            Resources
          </h2>
          <div className="grid gap-3">
            <a 
              href="https://umarise.lovable.app/app" 
              target="_blank"
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span>Demo App</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a 
              href="https://umarise.lovable.app/origin/fb025c0e-0dc8-4b4f-b795-43177ea2a045" 
              target="_blank"
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <span>Example Origin View</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          Phase 2 Pilot — February 2026 — Pilot partners only
        </div>
      </footer>
    </div>
  );
}