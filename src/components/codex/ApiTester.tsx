/**
 * API Tester Component
 * 
 * Interactive component that lets partners test the /resolve endpoint live.
 * Shows how to make API calls and displays real responses.
 */

import { useState } from 'react';
import { Play, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
}

// Example origin IDs that are known to exist
const EXAMPLE_ORIGINS = [
  { id: 'fb025c0e-0dc8-4b4f-b795-43177ea2a045', label: 'Validation Stack (demo)' },
];

export function ApiTester() {
  const [originId, setOriginId] = useState(EXAMPLE_ORIGINS[0].id);
  const [hash, setHash] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'by-id' | 'by-hash'>('by-id');

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      const params = activeTab === 'by-id' 
        ? `origin_id=${originId}` 
        : `hash=${hash}`;
      
      const { data, error } = await supabase.functions.invoke('resolve', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: null,
      });

      // Since invoke doesn't support GET params directly, use fetch
      const fetchResponse = await fetch(`${baseUrl}/resolve?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
        error: err instanceof Error ? err.message : 'Unknown error',
        duration,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurlCommand = () => {
    const params = activeTab === 'by-id' 
      ? `origin_id=${originId}` 
      : `hash=${hash}`;
    return `curl "${baseUrl}/resolve?${params}"`;
  };

  const handleCopyCurl = async () => {
    await navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleUseExample = (id: string) => {
    setOriginId(id);
    setActiveTab('by-id');
  };

  return (
    <div className="space-y-4">
      {/* Example Origins */}
      <div className="flex flex-wrap gap-2">
        <span className="text-codex-cream/50 text-sm">Voorbeelden:</span>
        {EXAMPLE_ORIGINS.map((example) => (
          <button
            key={example.id}
            onClick={() => handleUseExample(example.id)}
            className="text-xs px-2 py-1 rounded bg-codex-gold/10 text-codex-gold hover:bg-codex-gold/20 transition-colors"
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Tabs for different query types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'by-id' | 'by-hash')}>
        <TabsList className="bg-codex-ink/50 border border-codex-cream/10">
          <TabsTrigger 
            value="by-id" 
            className="data-[state=active]:bg-codex-gold/20 data-[state=active]:text-codex-gold"
          >
            By Origin ID
          </TabsTrigger>
          <TabsTrigger 
            value="by-hash"
            className="data-[state=active]:bg-codex-gold/20 data-[state=active]:text-codex-gold"
          >
            By Hash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-id" className="mt-4">
          <div className="space-y-2">
            <Label className="text-codex-cream/70">Origin ID (UUID)</Label>
            <Input
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              placeholder="fb025c0e-0dc8-4b4f-b795-43177ea2a045"
              className="bg-codex-ink/50 border-codex-cream/20 text-codex-cream font-mono text-sm"
            />
          </div>
        </TabsContent>

        <TabsContent value="by-hash" className="mt-4">
          <div className="space-y-2">
            <Label className="text-codex-cream/70">SHA-256 Hash</Label>
            <Input
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="e3b0c44298fc1c149afbf4c8996fb924..."
              className="bg-codex-ink/50 border-codex-cream/20 text-codex-cream font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* cURL Preview */}
      <div className="p-3 bg-codex-ink/70 rounded-lg border border-codex-cream/10 font-mono text-xs">
        <div className="flex items-start gap-2">
          <code className="text-codex-cream/80 flex-1 break-all">{getCurlCommand()}</code>
          <Button
            onClick={handleCopyCurl}
            variant="ghost"
            size="sm"
            className="text-codex-cream/50 hover:text-codex-gold shrink-0 h-6 w-6 p-0"
          >
            {copiedCurl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Test Button */}
      <Button
        onClick={handleTest}
        disabled={loading || (activeTab === 'by-id' ? !originId : !hash)}
        className="w-full bg-codex-gold text-codex-ink hover:bg-codex-gold/90"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Testing...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Test API
          </>
        )}
      </Button>

      {/* Response */}
      {response && (
        <div className={`p-4 rounded-lg border ${
          response.success 
            ? 'bg-green-900/20 border-green-500/30' 
            : 'bg-red-900/20 border-red-500/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              response.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {response.success ? '✓ Success' : '✗ Error'}
            </span>
            {response.duration && (
              <span className="text-codex-cream/50 text-xs">
                {response.duration}ms
              </span>
            )}
          </div>
          <pre className="text-xs font-mono text-codex-cream/80 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(response.data || { error: response.error }, null, 2)}
          </pre>
        </div>
      )}

      {/* How it works */}
      <div className="pt-4 border-t border-codex-cream/10">
        <h4 className="text-codex-cream/70 text-sm font-medium mb-2">Hoe werkt dit?</h4>
        <ol className="text-codex-cream/50 text-xs space-y-1 list-decimal list-inside">
          <li>Voer een origin_id (UUID) of SHA-256 hash in</li>
          <li>Klik "Test API" om een echte request te sturen naar <code className="text-codex-gold">/resolve</code></li>
          <li>Bekijk de JSON response met origin metadata</li>
          <li>Kopieer het cURL commando om zelf te testen in je terminal</li>
        </ol>
      </div>
    </div>
  );
}
