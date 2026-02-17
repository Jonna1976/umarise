/**
 * LiveDemoFlow — Interactive 3-step API demo for potential partners.
 * No API key required. Uses only public endpoints.
 * 
 * Steps:
 * 1. Health Check — prove the API is live
 * 2. Hash — client-side SHA-256 of user-provided text
 * 3. Verify — send hash to /v1-core-verify (expect 404 = proof it works)
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle2, XCircle, Loader2, ArrowRight, 
  Hash, ShieldCheck, HeartPulse, RotateCcw, Mail, Search, Copy, Check 
} from 'lucide-react';
import { Badge } from '@/components/api-reference/shared';

type StepStatus = 'idle' | 'running' | 'success' | 'error';

interface StepState {
  status: StepStatus;
  response?: unknown;
  duration?: number;
  error?: string;
}

const KNOWN_ORIGIN_ID = '1d004980-849c-4af4-b7f8-55fb2fb74307';

const INTERNAL_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function LiveDemoFlow() {
  const [step, setStep] = useState(0); // 0 = intro, 1-3 = steps
  const [steps, setSteps] = useState<[StepState, StepState, StepState, StepState]>([
    { status: 'idle' }, { status: 'idle' }, { status: 'idle' }, { status: 'idle' }
  ]);
  const [inputText, setInputText] = useState('');
  const [computedHash, setComputedHash] = useState('');

  const updateStep = useCallback((idx: number, patch: Partial<StepState>) => {
    setSteps(prev => {
      const next = [...prev] as [StepState, StepState, StepState, StepState];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setSteps([{ status: 'idle' }, { status: 'idle' }, { status: 'idle' }, { status: 'idle' }]);
    setInputText('');
    setComputedHash('');
  }, []);

  // Step 1: Health
  const runHealth = useCallback(async () => {
    setStep(1);
    updateStep(0, { status: 'running' });
    const start = Date.now();
    try {
      const res = await fetch(`${INTERNAL_BASE}/v1-core-health`);
      const data = await res.json();
      updateStep(0, { status: 'success', response: data, duration: Date.now() - start });
    } catch (e) {
      updateStep(0, { status: 'error', error: e instanceof Error ? e.message : 'Network error', duration: Date.now() - start });
    }
  }, [updateStep]);

  // Step 2: Hash client-side
  const runHash = useCallback(async () => {
    setStep(2);
    updateStep(1, { status: 'running' });
    const start = Date.now();
    try {
      const text = inputText.trim() || `Hello Umarise — ${new Date().toISOString()}`;
      if (!inputText.trim()) setInputText(text);
      const hex = await sha256Hex(text);
      setComputedHash(hex);
      updateStep(1, { 
        status: 'success', 
        response: { input: text, sha256: `sha256:${hex}` },
        duration: Date.now() - start 
      });
    } catch (e) {
      updateStep(1, { status: 'error', error: e instanceof Error ? e.message : 'Hash failed', duration: Date.now() - start });
    }
  }, [inputText, updateStep]);

  // Step 3: Verify (expect 404)
  const runVerify = useCallback(async () => {
    setStep(3);
    updateStep(2, { status: 'running' });
    const start = Date.now();
    try {
      const res = await fetch(`${INTERNAL_BASE}/v1-core-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: `sha256:${computedHash}` }),
      });
      const data = await res.json();
      // 404 is the expected result (hash not attested yet) — show as success with clear labeling
      const is404 = res.status === 404;
      updateStep(2, { 
        status: is404 || res.ok ? 'success' : 'error',
        response: is404 
          ? { status: 404, result: 'NOT_FOUND (expected)', message: 'This hash was never attested — the registry correctly confirms it does not exist.' }
          : { status: res.status, ...data },
        duration: Date.now() - start 
      });
    } catch (e) {
      updateStep(2, { status: 'error', error: e instanceof Error ? e.message : 'Network error', duration: Date.now() - start });
    }
  }, [computedHash, updateStep]);

  // Step 4: Resolve a known origin
  const runResolve = useCallback(async () => {
    setStep(4);
    updateStep(3, { status: 'running' });
    const start = Date.now();
    try {
      const res = await fetch(`${INTERNAL_BASE}/v1-core-resolve?origin_id=${KNOWN_ORIGIN_ID}`);
      const data = await res.json();
      updateStep(3, { 
        status: res.ok ? 'success' : 'error',
        response: data,
        duration: Date.now() - start 
      });
    } catch (e) {
      updateStep(3, { status: 'error', error: e instanceof Error ? e.message : 'Network error', duration: Date.now() - start });
    }
  }, [updateStep]);

  const stepConfig = [
     { icon: HeartPulse, title: 'Health Check', desc: 'Check if the API is running', action: runHealth },
     { icon: Hash, title: 'Hash your input', desc: 'SHA-256 in your browser (Web Crypto)', action: runHash },
     { icon: ShieldCheck, title: 'Verify against registry', desc: 'Check if this hash is attested', action: runVerify },
     { icon: Search, title: 'Resolve known origin', desc: 'Retrieve a real attestation record', action: runResolve },
  ];

  const allDone = steps.every(s => s.status === 'success');

  return (
    <section id="live-demo">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
         <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))]">Try it Live</h2>
         <Badge variant="public">No API Key required</Badge>
       </div>
       <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm">
         Experience the full verification flow in under 2 minutes. Four steps, no setup.
       </p>
      </div>

      <div className="rounded-lg border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-deep))] overflow-hidden">
        {/* Step indicators */}
        <div className="flex border-b border-[hsl(var(--landing-cream)/0.06)]">
          {stepConfig.map((sc, i) => {
            const s = steps[i];
            const isActive = step === i + 1;
            const isDone = s.status === 'success';
            const isNext = (i === 0 && step === 0) || (i > 0 && steps[i - 1].status === 'success' && s.status === 'idle');
            
            return (
              <div
                key={i}
                className={`flex-1 px-4 py-3 flex items-center gap-2 text-xs font-mono transition-colors border-r last:border-r-0 border-[hsl(var(--landing-cream)/0.06)] ${
                  isActive ? 'bg-[hsl(var(--landing-copper)/0.08)] text-[hsl(var(--landing-copper))]' :
                  isDone ? 'bg-[hsl(120,23%,45%,0.06)] text-[hsl(120,33%,65%)]' :
                  isNext ? 'text-[hsl(var(--landing-cream)/0.8)]' :
                  'text-[hsl(var(--landing-cream)/0.4)]'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> :
                 s.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> :
                 s.status === 'error' ? <XCircle className="w-3.5 h-3.5 shrink-0" /> :
                 <sc.icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="hidden sm:inline">{sc.title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Content area */}
        <div className="p-5 min-h-[200px]">
          <AnimatePresence mode="wait">
            {/* Intro */}
            {step === 0 && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center py-6 space-y-4">
                    <p className="text-[hsl(var(--landing-cream)/0.8)] text-sm max-w-md mx-auto">
                     This demo uses only <strong className="text-[hsl(var(--landing-cream)/0.95)]">public endpoints</strong> — no API key, no account, no setup.
                     You check health, hash text in your browser, and verify it against the live registry.
                  </p>
                  <button
                    onClick={runHealth}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[hsl(var(--landing-copper))] text-[hsl(var(--landing-deep))] font-medium text-sm hover:bg-[hsl(var(--landing-copper)/0.85)] transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Demo
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Health */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <StepHeader num={1} title="Health Check" desc="GET /v1-core-health" />
                <StepResult state={steps[0]} />
                {steps[0].status === 'success' && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--landing-copper))] hover:underline">
                      Next: Hash your input <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Hash */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <StepHeader num={2} title="Client-Side Hashing" desc="Web Crypto API (SHA-256)" />
                {steps[1].status === 'idle' && (
                  <div className="space-y-3 mt-4">
                    <label className="block text-xs text-[hsl(var(--landing-cream)/0.6)] font-mono uppercase tracking-wider">
                      Type something — a name, a sentence, a contract clause
                    </label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder="e.g. This document was signed on 2026-02-16"
                      className="w-full px-3 py-2 rounded border border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))] text-sm font-mono placeholder:text-[hsl(var(--landing-cream)/0.3)] focus:outline-none focus:border-[hsl(var(--landing-copper)/0.5)]"
                    />
                    <button
                      onClick={runHash}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[hsl(var(--landing-copper))] text-[hsl(var(--landing-deep))] text-sm font-medium hover:bg-[hsl(var(--landing-copper)/0.85)] transition-colors"
                    >
                      <Hash className="w-3.5 h-3.5" />
                      Calculate SHA-256
                    </button>
                  </div>
                )}
                <StepResult state={steps[1]} />
                {steps[1].status === 'success' && (
                  <div className="mt-3 space-y-3">
                     <p className="text-[hsl(var(--landing-cream)/0.6)] text-xs italic">
                      This hash was computed entirely in your browser. No data was sent to a server.
                    </p>
                    <div className="flex justify-end">
                      <button onClick={runVerify} className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--landing-copper))] hover:underline">
                        Next: Verify against registry <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Verify */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <StepHeader num={3} title="Verify against registry" desc="POST /v1-core-verify" />
                <StepResult state={steps[2]} />
                {steps[2].status === 'success' && (
                    <div className="mt-4 space-y-4">
                     <div className="p-3 rounded border border-[hsl(var(--landing-cream)/0.1)] bg-[hsl(var(--landing-cream)/0.03)]">
                       <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <strong className="text-[hsl(var(--landing-cream)/0.95)]">Result: Not Found (404)</strong> — exactly right. 
                          This hash was never attested, so the registry correctly confirms it does not exist.
                        </p>
                     </div>
                     <div className="flex justify-end">
                       <button onClick={runResolve} className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--landing-copper))] hover:underline">
                         Next: Resolve a real origin <ArrowRight className="w-3.5 h-3.5" />
                       </button>
                     </div>
                   </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Resolve */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <StepHeader num={4} title="Resolve known origin" desc={`GET /v1-core-resolve?origin_id=${KNOWN_ORIGIN_ID.slice(0, 8)}…`} />
                <StepResult state={steps[3]} />
                {steps[3].status === 'success' && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded border border-[hsl(120,23%,45%,0.2)] bg-[hsl(120,23%,45%,0.04)]">
                       <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
                          <strong className="text-[hsl(120,33%,65%)]">Found!</strong> — This is a real attestation from our registry. 
                          The origin record contains the SHA-256 hash, timestamp, and origin_id — the three facts that constitute proof of existence.
                       </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Completed CTA */}
          {allDone && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-5 border-t border-[hsl(var(--landing-cream)/0.08)] text-center space-y-4"
            >
              <div>
                 <p className="text-[hsl(var(--landing-cream)/0.9)] text-sm font-medium mb-1">
                   ✓ Demo complete — you've touched every public primitive
                 </p>
                 <p className="text-[hsl(var(--landing-cream)/0.6)] text-xs">
                    To create attestations and anchor them to Bitcoin you need a partner API key.
                 </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="mailto:partners@umarise.com?subject=API%20Key%20Request&body=Hi%20Umarise%2C%0A%0AI%20completed%20the%20live%20demo%20and%20would%20like%20to%20request%20an%20API%20key.%0A%0ACompany%3A%20%0AUse%20case%3A%20%0A"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[hsl(var(--landing-copper))] text-[hsl(var(--landing-deep))] font-medium text-sm hover:bg-[hsl(var(--landing-copper)/0.85)] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Request API Key
                </a>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-[hsl(var(--landing-cream)/0.15)] text-[hsl(var(--landing-cream)/0.8)] text-sm hover:text-[hsl(var(--landing-cream))] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Run again
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function StepHeader({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="text-[hsl(var(--landing-copper))] font-mono text-xs">Step {num}</span>
      <h3 className="text-[hsl(var(--landing-cream))] text-base font-medium">{title}</h3>
      <code className="text-[hsl(var(--landing-cream)/0.45)] text-xs">{desc}</code>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-[hsl(var(--landing-cream)/0.12)] text-[hsl(var(--landing-cream)/0.7)] hover:text-[hsl(var(--landing-cream)/0.95)] hover:border-[hsl(var(--landing-cream)/0.25)] transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function StepResult({ state }: { state: StepState }) {
  if (state.status === 'idle') return null;
  if (state.status === 'running') {
    return (
      <div className="flex items-center gap-2 text-[hsl(var(--landing-cream)/0.7)] text-sm mt-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Calling API...</span>
      </div>
    );
  }

  const isOk = state.status === 'success';
  const jsonText = JSON.stringify(state.response || { error: state.error }, null, 2);
  return (
    <div className={`mt-3 p-3 rounded border text-xs font-mono ${
      isOk 
        ? 'border-[hsl(120,23%,45%,0.3)] bg-[hsl(120,23%,45%,0.06)]'
        : 'border-[hsl(14,60%,56%,0.3)] bg-[hsl(14,60%,56%,0.06)]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={isOk ? 'text-[hsl(120,33%,65%)]' : 'text-[hsl(14,60%,56%)]'}>
          {isOk ? '✓ Success' : '✗ Error'}
        </span>
        <div className="flex items-center gap-2">
          <CopyButton text={jsonText} />
          {state.duration != null && (
            <span className="text-[hsl(var(--landing-cream)/0.45)]">{state.duration}ms</span>
          )}
        </div>
      </div>
      <pre className="text-[hsl(var(--landing-cream)/0.85)] overflow-x-auto whitespace-pre-wrap">
        {jsonText}
      </pre>
    </div>
  );
}
