/**
 * API Tester Component
 * 
 * Interactive component that lets technical reviewers test the /v1-core-resolve
 * endpoint live. Shows cURL command with core.umarise.com and displays real responses.
 */

import { useState } from 'react';
import { Play, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

const CORE_PUBLIC_URL = 'https://core.umarise.com';
const EXAMPLE_ORIGIN_ID = 'fb025c0e-0dc8-4b4f-b795-43177ea2a045';

export function ApiTester() {
  const [originId, setOriginId] = useState(EXAMPLE_ORIGIN_ID);
  const [hash, setHash] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'by-id' | 'by-hash'>('by-id');

  // Internal URL for actual requests (Supabase functions)
  const internalBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  const getQueryParams = () => {
    return activeTab === 'by-id'
      ? `origin_id=${originId}`
      : `hash=${hash}`;
  };

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      const fetchResponse = await fetch(
        `${internalBaseUrl}/v1-core-resolve?${getQueryParams()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      const responseData = await fetchResponse.json();
      const duration = Date.now() - startTime;

      setResponse({
        success: fetchResponse.ok,
        data: responseData,
        duration,
      });
    } catch (err) {
      const duration = Date.now() - startTime;
      setResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
        duration,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurlCommand = () => {
    return `curl "${CORE_PUBLIC_URL}/v1-core-resolve?${getQueryParams()}"`;
  };

  const handleCopyCurl = async () => {
    await navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'by-id' | 'by-hash')}>
        <TabsList className="bg-[hsl(var(--landing-deep))] border border-[hsl(var(--landing-cream)/0.1)]">
          <TabsTrigger
            value="by-id"
            className="data-[state=active]:bg-[hsl(var(--landing-copper)/0.15)] data-[state=active]:text-[hsl(var(--landing-copper))]"
          >
            By Origin ID
          </TabsTrigger>
          <TabsTrigger
            value="by-hash"
            className="data-[state=active]:bg-[hsl(var(--landing-copper)/0.15)] data-[state=active]:text-[hsl(var(--landing-copper))]"
          >
            By Hash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-id" className="mt-4">
          <div className="space-y-2">
            <Label className="text-[hsl(var(--landing-cream)/0.6)] text-xs">Origin ID (UUID)</Label>
            <Input
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              placeholder="fb025c0e-0dc8-4b4f-b795-43177ea2a045"
              className="bg-[hsl(var(--landing-deep))] border-[hsl(var(--landing-cream)/0.15)] text-[hsl(var(--landing-cream))] font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="by-hash" className="mt-4">
          <div className="space-y-2">
            <Label className="text-[hsl(var(--landing-cream)/0.6)] text-xs">SHA-256 Hash</Label>
            <Input
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="e3b0c44298fc1c149afbf4c8996fb924..."
              className="bg-[hsl(var(--landing-deep))] border-[hsl(var(--landing-cream)/0.15)] text-[hsl(var(--landing-cream))] font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* cURL Preview */}
      <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-deep))] font-mono text-xs">
        <div className="flex items-start gap-2">
          <code className="text-[hsl(var(--landing-cream)/0.7)] flex-1 break-all">
            {getCurlCommand()}
          </code>
          <Button
            onClick={handleCopyCurl}
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-copper))] shrink-0 h-6 w-6 p-0"
          >
            {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Test Button */}
      <Button
        onClick={handleTest}
        disabled={loading || (activeTab === 'by-id' ? !originId : !hash)}
        className="w-full bg-[hsl(var(--landing-copper))] text-[hsl(var(--landing-deep))] hover:bg-[hsl(var(--landing-copper)/0.85)]"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Resolving...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Test Resolve
          </>
        )}
      </Button>

      {/* Response */}
      {response && (
        <div className={`p-4 rounded border ${
          response.success
            ? 'border-[hsl(120,23%,45%,0.3)] bg-[hsl(120,23%,45%,0.06)]'
            : 'border-[hsl(14,60%,56%,0.3)] bg-[hsl(14,60%,56%,0.06)]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              response.success ? 'text-[hsl(120,33%,65%)]' : 'text-[hsl(14,60%,56%)]'
            }`}>
              {response.success ? '✓ Found' : '✗ Not found'}
            </span>
            {response.duration && (
              <span className="text-[hsl(var(--landing-muted))] text-xs font-mono">
                {response.duration}ms
              </span>
            )}
          </div>
          <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.7)] overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(response.data || { error: response.error }, null, 2)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div className="pt-3 border-t border-[hsl(var(--landing-cream)/0.08)]">
        <ol className="text-[hsl(var(--landing-muted))] text-xs space-y-1 list-decimal list-inside">
          <li>Enter an origin_id (UUID) or SHA-256 hash</li>
          <li>Click "Test Resolve" to query the live registry</li>
          <li>Copy the cURL command to test from your terminal</li>
        </ol>
      </div>
    </div>
  );
}
