/**
 * CTO Review Kit — Technical Review Kit for Umarise Origin Record Layer
 * 
 * Route: /review (public, shareable with CTO's and technical evaluators)
 * 
 * Aligned with Infra Canon design language:
 * - bg-landing-deep background
 * - Playfair Display serif headings
 * - Objective, constaterend tone
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';
import { ApiTester } from '@/components/codex/ApiTester';
import { Button } from '@/components/ui/button';

const CORE_BASE_URL = 'https://core.umarise.com';

const sectionDelay = (i: number) => ({ delay: 0.05 + i * 0.05 });

export default function ReviewKit() {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText('https://umarise.com/review');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--landing-cream)/0.08)]">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[hsl(var(--landing-muted))] text-sm uppercase tracking-[0.2em] mb-3">
              Technical Review Kit
            </p>
            <h1 className="text-4xl font-serif text-[hsl(var(--landing-cream))] mb-3">
              Umarise Origin Record Layer
            </h1>
            <p className="text-[hsl(var(--landing-cream)/0.6)]">
              Stack-level documentation for technical evaluation.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        {/* Share URL */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(0)}
          className="flex items-center gap-3 px-4 py-3 rounded border border-[hsl(var(--landing-cream)/0.08)] bg-[hsl(var(--landing-deep))]"
        >
          <span className="text-[hsl(var(--landing-muted))] text-sm">Share this kit:</span>
          <code className="text-[hsl(var(--landing-copper))] text-sm flex-1 truncate font-mono">
            https://umarise.com/review
          </code>
          <Button
            onClick={handleCopyUrl}
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--landing-muted))] hover:text-[hsl(var(--landing-copper))] shrink-0"
          >
            {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </motion.div>

        {/* Section 1: What You're Reviewing */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(1)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">
            What You're Reviewing
          </h2>
          <div className="space-y-4 text-[hsl(var(--landing-cream)/0.75)] leading-relaxed">
            <p>
              An origin record layer that captures a SHA-256 hash of an artifact
              at the moment of intake, and anchors it in the Bitcoin blockchain
              via OpenTimestamps.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.5)]">
              No content is stored. No content is transmitted.
              Only the hash crosses the boundary.
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-[hsl(var(--landing-cream)/0.08)]">
            <p className="text-[hsl(var(--landing-copper))] text-sm italic font-serif">
              "We provide the evidence layer. You provide the rules."
            </p>
          </div>
        </motion.section>

        {/* Section 2: Three Questions */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(2)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">
            Three Questions
          </h2>
          <div className="space-y-3">
            <div className="flex gap-4 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <span className="text-[hsl(var(--landing-copper))] font-mono text-sm shrink-0">1.</span>
              <p className="text-[hsl(var(--landing-cream)/0.8)]">
                Where would this sit in your stack?
              </p>
            </div>
            <div className="flex gap-4 p-4 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <span className="text-[hsl(var(--landing-copper))] font-mono text-sm shrink-0">2.</span>
              <p className="text-[hsl(var(--landing-cream)/0.8)]">
                What happens in your systems when this layer doesn't exist, but AI and workflows do?
              </p>
            </div>
            <div className="flex gap-4 p-4 rounded border border-[hsl(var(--landing-copper)/0.3)]">
              <span className="text-[hsl(var(--landing-copper))] font-mono text-sm shrink-0">3.</span>
              <p className="text-[hsl(var(--landing-cream))]">
                Is this for you: <strong className="text-[hsl(var(--landing-copper))]">irrelevant</strong>, <strong className="text-[hsl(var(--landing-copper))]">obvious</strong>, or <strong className="text-[hsl(var(--landing-copper))]">fundamental</strong>?
              </p>
            </div>
          </div>
        </motion.section>

        {/* Section 3: API Primitives */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(3)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-2">
            API Primitives
          </h2>
          <p className="text-[hsl(var(--landing-muted))] text-sm mb-6 font-mono">
            Base URL: {CORE_BASE_URL}
          </p>

          <div className="space-y-4">
            {/* 1. Create Origin */}
            <ApiBlock
              number={1}
              title="Create Origin"
              subtitle="write-once, permissioned"
              method="POST"
              endpoint="/v1-core-origins"
              auth="X-API-Key: {api_key}"
              request={`{
  "hash": "a1b2c3d4e5f6..."
}`}
              response={`{
  "origin_id": "fb025c0e-0dc8-4b4f-b795-43177ea2a045",
  "hash": "a1b2c3d4e5f6...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-08T14:22:00Z",
  "proof_status": "pending",
  "proof_url": "/v1-core-origins-proof?origin_id=fb025c0e-..."
}`}
              note="No UPDATE endpoint exists. Write-once."
            />

            {/* 2. Resolve Origin */}
            <ApiBlock
              number={2}
              title="Resolve Origin"
              subtitle="public, no auth"
              method="GET"
              endpoint={`/v1-core-resolve?origin_id={uuid}\n/v1-core-resolve?hash={sha256}`}
              response={`{
  "origin_id": "fb025c0e-...",
  "hash": "a1b2c3d4e5f6...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-08T14:22:00Z"
}`}
              note="Or 404 if not found."
            />

            {/* 3. Verify Hash */}
            <ApiBlock
              number={3}
              title="Verify Hash"
              subtitle="public, no auth"
              method="POST"
              endpoint="/v1-core-verify"
              request={`{
  "hash": "a1b2c3d4e5f6..."
}`}
              response={`{
  "origin_id": "fb025c0e-...",
  "hash": "a1b2c3d4e5f6...",
  "hash_algo": "sha256",
  "captured_at": "2026-02-08T14:22:00Z",
  "proof_status": "anchored",
  "proof_url": "/v1-core-origins-proof?origin_id=fb025c0e-..."
}`}
              note="Or 404 if not found. Binary: match or no match."
            />

            {/* 4. Download Proof */}
            <ApiBlock
              number={4}
              title="Download Proof"
              subtitle="public, no auth"
              method="GET"
              endpoint="/v1-core-proof?origin_id={uuid}"
              response={`200 + binary .ots file (OpenTimestamps proof)
202 if proof is pending (Bitcoin anchor not yet confirmed)
404 if not found`}
              note={`The .ots file contains the cryptographic path from the hash
to a Bitcoin transaction. Verifiable with:
  ots verify proof.ots
No Umarise software required.`}
            />

            {/* 5. Health */}
            <ApiBlock
              number={5}
              title="Health"
              method="GET"
              endpoint="/v1-core-health"
              response={`{
  "status": "ok",
  "version": "1.0",
  "timestamp": "2026-02-08T14:22:00Z"
}`}
            />
          </div>
        </motion.section>

        {/* Section 4: Live API Tester */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(4)}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded bg-[hsl(var(--landing-copper)/0.12)] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
            </div>
            <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif">
              Live API Tester
            </h2>
          </div>
          <div className="p-5 rounded border border-[hsl(var(--landing-copper)/0.2)] bg-[hsl(var(--landing-deep))]">
            <ApiTester />
          </div>
        </motion.section>

        {/* Section 5: Access Model */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(5)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">
            Access Model
          </h2>
          <div className="rounded border border-[hsl(var(--landing-cream)/0.08)] overflow-hidden">
            <div className="p-5">
              <p className="text-[hsl(var(--landing-cream)/0.7)] mb-5">
                Write access is permissioned. Read access is public.
              </p>
              <div className="font-mono text-sm space-y-2">
                <AccessRow method="POST" endpoint="/v1-core-origins" access="API key required" permissioned />
                <AccessRow method="GET" endpoint="/v1-core-resolve" access="Public" />
                <AccessRow method="POST" endpoint="/v1-core-verify" access="Public" />
                <AccessRow method="GET" endpoint="/v1-core-proof" access="Public" />
                <AccessRow method="GET" endpoint="/v1-core-health" access="Public" />
              </div>
            </div>
            <div className="border-t border-[hsl(var(--landing-cream)/0.08)] px-5 py-3">
              <p className="text-[hsl(var(--landing-muted))] text-sm">
                API key issuance: <span className="text-[hsl(var(--landing-copper))]">partners@umarise.com</span>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Section 6: Trust Model */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(6)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">
            Trust Model
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <h3 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-3">
                What is verifiable without trusting Umarise
              </h3>
              <p className="text-[hsl(var(--landing-cream)/0.65)] leading-relaxed">
                The timestamp. The .ots proof provides a cryptographic path
                to a Bitcoin transaction. Anyone can verify this independently.
              </p>
            </div>
            <div className="p-5 rounded border border-[hsl(var(--landing-cream)/0.08)]">
              <h3 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm uppercase tracking-wider mb-3">
                What requires trusting Umarise
              </h3>
              <p className="text-[hsl(var(--landing-cream)/0.65)] leading-relaxed">
                The data intake. Umarise receives a hash and records it.
                The partner trusts that the hash was recorded accurately.
              </p>
            </div>
            <div className="p-4 rounded border border-[hsl(var(--landing-copper)/0.2)] bg-[hsl(var(--landing-copper)/0.04)]">
              <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm leading-relaxed">
                <strong className="text-[hsl(var(--landing-copper))]">Mitigation:</strong> partners can compute the hash client-side and submit
                only the hash. In that case, the entire chain is verifiable
                without trusting Umarise.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Section 7: Documentation Links */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={sectionDelay(7)}
        >
          <h2 className="text-[hsl(var(--landing-cream))] text-2xl font-serif mb-5">
            Documentation
          </h2>
          <div className="space-y-0 rounded border border-[hsl(var(--landing-cream)/0.08)] divide-y divide-[hsl(var(--landing-cream)/0.08)]">
            <DocLink title="API Reference" url="umarise.com/core" />
            <DocLink title="Verify Tool" url="umarise.com/verify" />
            <DocLink title="Technical Specification" url="umarise.com/legal" />
            <DocLink title="Origin Registry" url="umarise.com/origin" />
            <DocLink title="Why This Exists" url="umarise.com/why" />
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={sectionDelay(8)}
          className="pt-10 border-t border-[hsl(var(--landing-cream)/0.08)] text-center space-y-2"
        >
          <p className="text-[hsl(var(--landing-muted))] text-sm">
            Umarise Origin Record Layer, v1 Stable
          </p>
          <p className="text-[hsl(var(--landing-cream)/0.3)] text-xs">
            Evidence of origin, not interpretation.
          </p>
          <p className="text-[hsl(var(--landing-cream)/0.25)] text-xs pt-2">
            Contact: partners@umarise.com
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ApiBlock({
  number,
  title,
  subtitle,
  method,
  endpoint,
  auth,
  request,
  response,
  note,
}: {
  number: number;
  title: string;
  subtitle?: string;
  method: string;
  endpoint: string;
  auth?: string;
  request?: string;
  response?: string;
  note?: string;
}) {
  return (
    <div className="rounded border border-[hsl(var(--landing-cream)/0.08)] overflow-hidden">
      <div className="p-4 font-mono text-sm">
        <div className="text-[hsl(var(--landing-muted))] text-xs mb-2">
          # {number}. {title}{subtitle ? ` (${subtitle})` : ''}
        </div>
        <div className="text-[hsl(var(--landing-cream)/0.9)] whitespace-pre-line">
          {endpoint.split('\n').map((line, i) => (
            <div key={i}>
              <span className="text-[hsl(var(--landing-copper))]">{method}</span> {line}
            </div>
          ))}
        </div>
        {auth && (
          <div className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-1">{auth}</div>
        )}
        {request && (
          <>
            <div className="text-[hsl(var(--landing-muted))] text-xs mt-3 mb-1">Request:</div>
            <pre className="text-[hsl(var(--landing-cream)/0.6)] text-xs whitespace-pre">{request}</pre>
          </>
        )}
        {response && (
          <>
            <div className="text-[hsl(var(--landing-muted))] text-xs mt-3 mb-1">Response:</div>
            <pre className="text-[hsl(var(--landing-cream)/0.6)] text-xs whitespace-pre">{response}</pre>
          </>
        )}
        {note && (
          <div className="text-[hsl(var(--landing-cream)/0.35)] text-xs mt-3 italic whitespace-pre-line">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

function AccessRow({
  method,
  endpoint,
  access,
  permissioned,
}: {
  method: string;
  endpoint: string;
  access: string;
  permissioned?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className={`w-12 text-xs ${permissioned ? 'text-[hsl(var(--landing-copper))]' : 'text-[hsl(var(--landing-cream)/0.5)]'}`}>
        {method}
      </span>
      <span className="text-[hsl(var(--landing-cream)/0.7)] flex-1 text-xs">{endpoint}</span>
      <span className={`text-xs ${permissioned ? 'text-[hsl(var(--landing-copper))]' : 'text-[hsl(var(--landing-cream)/0.4)]'}`}>
        {access}
      </span>
    </div>
  );
}

function DocLink({ title, url }: { title: string; url: string }) {
  return (
    <a
      href={`https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between px-5 py-3 hover:bg-[hsl(var(--landing-cream)/0.03)] transition-colors group"
    >
      <span className="text-[hsl(var(--landing-cream)/0.8)] text-sm group-hover:text-[hsl(var(--landing-copper))] transition-colors">
        {title}
      </span>
      <span className="text-[hsl(var(--landing-muted))] text-xs font-mono">
        {url}
      </span>
    </a>
  );
}
