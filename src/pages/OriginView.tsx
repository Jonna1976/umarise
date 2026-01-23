/**
 * Origin View Page
 * 
 * Public-facing page that displays origin metadata from an Origin Link.
 * Accessed via: /origin/:originId?verify={hash}
 * 
 * Features:
 * - Fetches origin metadata via resolve-origin API
 * - Shows verification status
 * - Provides proof bundle download
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, ShieldCheck, ShieldX, Download, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface OriginMetadata {
  found: boolean;
  origin_id: string | null;
  origin_hash_sha256: string | null;
  origin_hash_algo: 'sha256' | null;
  hash_status: 'verified' | 'legacy_no_hash' | 'not_found';
  captured_at: string | null;
  labels: {
    future_you_cues: string[];
    keywords: string[];
  } | null;
  origin_link_url: string | null;
}

export default function OriginView() {
  const { originId } = useParams<{ originId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const verifyHash = searchParams.get('verify');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<OriginMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchOrigin() {
      if (!originId) {
        setError('No origin ID provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('resolve-origin', {
          body: null,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // The edge function is GET-based, so we need to call it differently
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resolve-origin?origin_id=${originId}`,
          {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('Origin not found');
          } else {
            setError('Failed to fetch origin metadata');
          }
          setLoading(false);
          return;
        }

        const data2: OriginMetadata = await response.json();
        setMetadata(data2);
        setLoading(false);
      } catch (err) {
        console.error('[OriginView] Fetch error:', err);
        setError('Failed to connect to origin service');
        setLoading(false);
      }
    }

    fetchOrigin();
  }, [originId]);

  const handleCopyHash = async () => {
    if (metadata?.origin_hash_sha256) {
      await navigator.clipboard.writeText(metadata.origin_hash_sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verification status
  const getVerificationStatus = () => {
    if (!metadata) return null;
    
    if (metadata.hash_status === 'verified') {
      if (verifyHash && verifyHash === metadata.origin_hash_sha256) {
        return { status: 'match', icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500/10', message: 'Hash verified — origin authentic' };
      } else if (verifyHash && verifyHash !== metadata.origin_hash_sha256) {
        return { status: 'mismatch', icon: ShieldX, color: 'text-red-400', bg: 'bg-red-500/10', message: 'Hash mismatch — may be modified' };
      }
      return { status: 'verified', icon: ShieldCheck, color: 'text-codex-gold', bg: 'bg-codex-gold/10', message: 'Origin hash available' };
    }
    
    return { status: 'legacy', icon: Shield, color: 'text-codex-cream/50', bg: 'bg-codex-cream/5', message: 'Legacy capture — no hash' };
  };

  const verification = getVerificationStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-forest-deep to-codex-ink-deep flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-codex-cream/60"
        >
          Resolving origin...
        </motion.div>
      </div>
    );
  }

  if (error || !metadata?.found) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-forest-deep to-codex-ink-deep flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-codex-cream/30 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-codex-cream mb-2">Origin Not Found</h1>
          <p className="text-codex-cream/60 mb-6">
            {error || 'This origin could not be resolved. It may have been removed or the link is invalid.'}
          </p>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-codex-cream/20 text-codex-cream hover:bg-codex-cream/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Umarise
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-forest-deep to-codex-ink-deep">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-codex-ink-deep/80 backdrop-blur-md border-b border-codex-gold/20">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="text-codex-cream/60 hover:text-codex-cream"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Umarise
          </Button>
          <span className="text-codex-cream/40 text-sm font-mono">Origin Record</span>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        {/* Verification Status Banner */}
        {verification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${verification.bg} border border-current/20 rounded-lg p-4 mb-6`}
          >
            <div className="flex items-center gap-3">
              <verification.icon className={`w-6 h-6 ${verification.color}`} />
              <div>
                <p className={`font-medium ${verification.color}`}>{verification.message}</p>
                {verification.status === 'match' && (
                  <p className="text-sm text-codex-cream/50 mt-1">
                    The provided hash matches the stored origin hash.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Origin ID */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-codex-cream/50 text-sm uppercase tracking-wide mb-2">Origin ID</h2>
          <p className="font-mono text-codex-cream text-sm break-all bg-codex-ink/50 p-3 rounded-lg border border-codex-cream/10">
            {metadata.origin_id}
          </p>
        </motion.div>

        {/* Hash */}
        {metadata.origin_hash_sha256 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <h2 className="text-codex-cream/50 text-sm uppercase tracking-wide mb-2">SHA-256 Hash</h2>
            <div className="flex items-start gap-2">
              <p className="font-mono text-xs text-codex-gold break-all bg-codex-ink/50 p-3 rounded-lg border border-codex-gold/20 flex-1">
                {metadata.origin_hash_sha256}
              </p>
              <Button
                onClick={handleCopyHash}
                variant="ghost"
                size="sm"
                className="text-codex-cream/60 hover:text-codex-gold shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Captured At */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-codex-cream/50 text-sm uppercase tracking-wide mb-2">Captured</h2>
          <p className="text-codex-cream">
            {formatDate(metadata.captured_at)}
          </p>
        </motion.div>

        {/* Labels */}
        {metadata.labels && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-codex-cream/50 text-sm uppercase tracking-wide mb-2">Labels</h2>
            <div className="flex flex-wrap gap-2">
              {metadata.labels.future_you_cues.map((cue, i) => (
                <span key={`cue-${i}`} className="px-3 py-1 bg-codex-gold/20 text-codex-gold rounded-full text-sm">
                  {cue}
                </span>
              ))}
              {metadata.labels.keywords.map((keyword, i) => (
                <span key={`kw-${i}`} className="px-3 py-1 bg-codex-cream/10 text-codex-cream/70 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
              {metadata.labels.future_you_cues.length === 0 && metadata.labels.keywords.length === 0 && (
                <span className="text-codex-cream/40 text-sm">No labels assigned</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Verification Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-4 bg-codex-ink/30 rounded-lg border border-codex-cream/10"
        >
          <h3 className="text-codex-cream/70 text-sm font-medium mb-2">How to verify</h3>
          <p className="text-codex-cream/50 text-sm">
            Download the original image and calculate its SHA-256 hash. If it matches the hash above, the artifact is authentic and unmodified since capture.
          </p>
          <div className="mt-3 font-mono text-xs text-codex-cream/40 bg-codex-ink/50 p-2 rounded">
            shasum -a 256 &lt;image_file&gt;
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center text-codex-cream/30 text-xs"
        >
          <p>Umarise Origin Record Layer</p>
          <p className="mt-1">Evidence of origin, not interpretation</p>
        </motion.div>
      </div>
    </div>
  );
}
