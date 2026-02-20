import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Smartphone, Shield, GitBranch, Globe, Lock, Key, Database, CheckCircle, Eye, FileArchive, Compass, ShieldCheck, Terminal } from 'lucide-react';
import { OriginMark } from '@/components/prototype/components/OriginMark';

/**
 * Architecture Overview — Internal Document
 * 
 * Complete architecture overview of Umarise as of 16 Feb 2026.
 * B2C App + B2B Core + Bridge + Verify + Discovery Path + Origin Mark — fully split.
 * Proof Model with Device Identity (v1.1). Verification Independence Tools.
 * Developer Journey: Quick Start (zero-friction) + Integration Checklist v2 (24 steps) + SDKs + AI Support Bot.
 * 
 * Source: docs/architecture-week1-final.md
 * Access: PinGate protected
 */

const b2cItems = [
  { name: 'S1 Capture', status: '✅ File picker + auto-hash + passkey signing', where: 'Device → Web Crypto → WebAuthn → pages INSERT' },
  { name: 'S2 Sealed', status: '✅ Receipt + file list + ZIP download', where: 'Browser UI + Client-side JSZip' },
  { name: 'S3 Anchor Registry', status: '✅ Horizontal gallery + detail modal', where: 'Client + /v1-core-resolve' },
  { name: 'Passkey (v1.1)', status: '✅ Auto-register + best-effort signing', where: 'Client-side WebAuthn (never blocking)' },
  { name: 'IndexedDB thumbnails', status: '✅ Live + remote fallback', where: 'Local on device + Supabase storage' },
  { name: 'OTS status polling', status: '✅ Live', where: '/v1-core-resolve + /v1-core-proof via useProofPolling' },
];

const publicEndpoints = [
  { num: 1, method: 'GET', endpoint: '/v1-core-resolve', desc: 'Origin lookup (by ID or hash)' },
  { num: 2, method: 'POST', endpoint: '/v1-core-verify', desc: 'Hash verification (match/no-match)' },
  { num: 3, method: 'GET', endpoint: '/v1-core-proof', desc: 'Raw .ots binary download' },
  { num: 4, method: 'GET', endpoint: '/v1-core-health', desc: '{"status":"operational","version":"v1"}' },
];

const partnerEndpoints = [
  { num: 5, method: 'POST', endpoint: '/v1-core-origins', desc: 'Create origin attestation' },
  { num: 6, method: 'GET', endpoint: '/v1-core-origins-proof', desc: 'Proof data (JSON, base64)' },
  { num: 7, method: 'GET', endpoint: '/v1-core-proofs-export', desc: 'Bulk export (cursor-based)' },
];

const internalEndpoints = [
  { num: 8, method: 'POST', endpoint: '/v1-internal-partner-create', desc: 'API key generation' },
  { num: 9, method: 'GET', endpoint: '/v1-internal-metrics', desc: '24h operational metrics' },
];

const bridgePoints = [
  { dir: 'B2C → Core', mechanism: 'DB trigger bridge_page_to_core', what: 'Hash + timestamp propagation to origin_attestations' },
  { dir: 'Core → B2C', mechanism: 'Async notification notify-ots-complete', what: 'Best-effort, in try/catch (no hard dependency)' },
  { dir: 'B2C reads Core', mechanism: 'GET /v1-core-resolve', what: 'Status retrieval (pending/anchored)' },
  { dir: 'B2C reads Core', mechanism: 'GET /v1-core-proof', what: 'Raw .ots binary for ZIP' },
];

const neverCrosses = [
  'Photo bytes (never)',
  'Thumbnails (local only)',
  'Passkey credentials (not in Core)',
  'UI labels, screen names (App domain)',
  'device_user_id (Core is identity-agnostic)',
];

const dbIntegrity = [
  { table: 'origin_attestations', protection: 'prevent_update + prevent_delete', purpose: 'Write-once, append-only' },
  { table: 'core_ots_proofs', protection: 'prevent_anchored_proof_mutation + delete-trigger', purpose: 'Proof immutable after anchoring' },
  { table: 'partner_api_keys', protection: 'prevent_api_key_delete', purpose: 'Keys cannot be deleted' },
  { table: 'core_ddl_audit', protection: 'DDL event trigger', purpose: 'Schema changes logged' },
];

const securityHardening = {
  corsPolicy: [
    { layer: 'Core API (v1-core-*)', policy: 'Access-Control-Allow-Origin: *', reason: 'B2B partner compatibility — curl, SDKs, integrations' },
    { layer: 'App Layer (companion-*)', policy: 'Dynamic origin reflection', reason: 'Locked to anchoring.app, umarise.com, *.lovable.app' },
    { layer: 'Public Proxies', policy: 'Dynamic origin reflection', reason: 'companion-verify, companion-resolve, origin-image-proxy' },
    { layer: 'AI Functions', policy: 'Dynamic origin reflection', reason: 'Same lock as App Layer' },
    { layer: 'Proxy Functions', policy: 'Dynamic origin reflection', reason: 'hetzner-storage-proxy, hetzner-ai-proxy' },
  ],
  legacyCleanup: [
    { item: 'core-origins (wrapper)', status: 'Removed', detail: 'Replaced by v1-core-origins' },
    { item: 'core-resolve (wrapper)', status: 'Removed', detail: 'Replaced by v1-core-resolve' },
    { item: 'core-verify (wrapper)', status: 'Removed', detail: 'Replaced by v1-core-verify' },
  ],
  rateLimits: [
    { fn: 'companion-data', limit: '50/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'companion-verify', limit: '30/min', type: 'DB-persistent', key: 'IP hash (SHA-256)' },
    { fn: 'companion-resolve', limit: '60/min', type: 'DB-persistent', key: 'IP hash (SHA-256)' },
    { fn: 'origin-image-proxy', limit: '60/min', type: 'DB-persistent', key: 'IP hash (SHA-256)' },
    { fn: 'analyze-page', limit: '10/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'analyze-patterns', limit: '10/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'analyze-personality', limit: '10/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'generate-embeddings', limit: '20/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'generate-memory-summary', limit: '10/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'generate-personality-art', limit: '5/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'generate-recommendations', limit: '10/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'generate-share-content', limit: '10/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'generate-year-reflection', limit: '5/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'search-pages', limit: '30/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'hetzner-storage-proxy', limit: '30-50/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'hetzner-ai-proxy', limit: '10-30/min', type: 'DB-persistent', key: 'device_user_id' },
    { fn: 'Core API (alle endpoints)', limit: '1000/min', type: 'DB-persistent', key: 'IP hash (SHA-256)' },
  ],
  privacyArchitecture: [
    { aspect: 'Request logging', detail: 'SHA-256 hashed IPs — no raw IP storage' },
    { aspect: 'Identity', detail: 'device_user_id (locally generated) — no accounts, no PII' },
    { aspect: 'Content', detail: 'Core is content-agnostic — hashes only, never bytes' },
    { aspect: 'Cross-device', detail: 'No synchronization — device-isolated by design' },
    { aspect: 'Sensitive tables', detail: 'RLS USING(false) — access only via Edge Function proxy' },
  ],
};

const publicRoutes = [
  { route: '/', purpose: 'Landing / infrastructure positioning', audience: 'Everyone', mark: '16px header' },
  { route: '/anchor', purpose: 'What is an anchor?', audience: 'Prospects', mark: '16px header' },
  { route: '/why', purpose: 'Why anchors?', audience: 'Business', mark: '16px header' },
  { route: '/core', purpose: 'Core API spec', audience: 'Technical', mark: '16px header + 12px inline' },
  { route: '/api-reference', purpose: 'Developer docs: Quick Start + Checklist + Live Demo + AI Support', audience: 'Developers / Partners', mark: '16px header' },
  { route: '/review', purpose: 'Technical Review Kit', audience: 'CTOs / integrators', mark: '16px header + 12px inline' },
  { route: '/reviewer', purpose: 'Reviewer Package (External Review)', audience: 'Reviewers', mark: '16px header' },
  { route: '/verify', purpose: 'Verification tool', audience: 'Everyone', mark: '16px header + 48px/28px' },
  { route: '/legal', purpose: 'Technical Specification', audience: 'Legal / Technical', mark: '16px header' },
  { route: '/privacy + /terms', purpose: 'Privacy and terms', audience: 'Compliance', mark: '16px header' },
  { route: '/install', purpose: 'PWA installation', audience: 'Consumers', mark: '16px header' },
];

const discoveryPath = [
  { num: 1, contact: 'VERIFY.txt', where: 'In every ZIP', mechanism: 'Origin ID, timestamp, hash, direct verification link' },
  { num: 2, contact: 'verify_url', where: 'In certificate.json', mechanism: 'https://anchoring.app/verify (canonical)' },
  { num: 3, contact: 'Verify link', where: 'Sealed screen (S4)', mechanism: 'Subtle link below save button' },
  { num: 4, contact: 'Share origin', where: 'Origin Registry detail modal (S3)', mechanism: 'Web Share API → ZIP / clipboard fallback' },
];

const originMarkUsage = [
  { context: 'S1 Capture', size: '48px', state: 'anchored', detail: 'Breathing animation' },
  { context: 'Processing', size: '64px', state: 'anchored', detail: 'Breathing during auto-hash' },
  { context: 'S2 Sealed', size: '48px', state: 'anchored', detail: 'Glow' },
  { context: 'Wall status', size: '20px', state: 'anchored/pending', detail: 'Per-origin status' },
  { context: 'Navigation', size: '28px', state: 'anchored', detail: 'OriginButton' },
  { context: 'Site header', size: '16px', state: 'anchored', detail: 'All pages' },
  { context: '/verify upload', size: '48px', state: 'ghost', detail: 'Empty ring' },
  { context: '/verify result', size: '28px', state: 'anchored', detail: 'Glow' },
  { context: '/core partner', size: '12px', state: 'pending', detail: 'Dashed' },
  { context: '/review properties', size: '12px', state: 'anchored', detail: 'Inline' },
];

const zipContents = [
  { file: 'artifact.{ext}', always: false, desc: 'Original artifact (jpg/png/mp4/pdf/...) — hash-verified' },
  { file: 'certificate.json', always: true, desc: 'v1.1: origin_id, hash, timestamp, device_signature, device_public_key, proof_status' },
  { file: 'VERIFY.txt', always: true, desc: 'Human-readable verification instructions + link + device signed status' },
  { file: 'proof.ots', always: false, desc: 'OpenTimestamps binary proof (only when anchored)' },
];

const onboardingSteps = [
  { num: 1, step: 'First contact', who: 'Partner', what: 'Emails partners@umarise.com with use case' },
  { num: 2, step: 'Suitability check', who: 'Umarise', what: 'Green flags: high-frequency data, regulatory pressure, audit needs' },
  { num: 3, step: 'Qualification', who: 'Umarise', what: '4x YES + 4x OK framework' },
  { num: 4, step: 'Intake', who: 'Partner', what: 'Fills in system details (internal /intake checklist)' },
  { num: 5, step: 'Due diligence', who: 'Umarise', what: 'Technical evaluation: artifacts, hashing capability, volume' },
  { num: 6, step: 'Tier selection', who: 'Together', what: 'Based on volume and use case' },
  { num: 7, step: 'API key generation', who: 'Umarise', what: 'Via v1-internal-partner-create, 64-char hex key' },
  { num: 8, step: 'Key handoff', who: 'Umarise → Partner', what: 'Plaintext key shared once, never retrievable again' },
  { num: 9, step: 'Integration', who: 'Partner', what: 'Quick Start (60s) → Integration Checklist (24 steps) → Production' },
  { num: 10, step: 'Verification', who: 'Together', what: 'Test first attestation, resolve and proof check' },
  { num: 11, step: 'Live', who: 'Partner', what: 'Production traffic starts' },
];

const developerJourney = [
  { num: 1, component: 'Quick Start', location: '/api-reference (top)', detail: '4 curl commands. 60 seconds to first attestation. Copy-to-single-line logic prevents terminal errors.' },
  { num: 2, component: 'Integration Checklist v2', location: '/api-reference', detail: '24 self-contained steps (Setup → Verification → SDK → Production). Each step includes inline instructions, commands, and code examples. Zero friction.' },
  { num: 3, component: 'Try it Live Demo', location: '/api-reference', detail: '4-step interactive demo: client-side hashing → registry verification. Shows both "new hash" and "known match" scenarios.' },
  { num: 4, component: 'SDKs (Node + Python)', location: 'GitHub + /api-reference', detail: 'Zero-dependency (~250 lines each). Full lifecycle: attest, resolve, verify, proof, health.' },
  { num: 5, component: 'First-run scripts', location: '/api-reference download', detail: 'Bash script: automated 5-step validation (health → hash → attest → verify → resolve).' },
  { num: 6, component: 'AI Support Bot', location: '/api-reference', detail: 'Guardian v5.0 compliant. Automatic language matching. Terminology-controlled. Out-of-scope redirect to partners@umarise.com.' },
  { num: 7, component: 'Verification scripts', location: '/reviewer', detail: 'verify-anchor.sh + verify-anchor.py. Zero-dependency offline ZIP validation.' },
];

const SectionHeader = ({ icon: Icon, title, num }: { icon: React.ElementType; title: string; num: number }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-full bg-landing-cream/10 flex items-center justify-center text-landing-cream/40 text-sm font-mono">
      {num}
    </div>
    <Icon className="w-5 h-5 text-landing-cream/30" />
    <h2 className="text-xl font-light text-landing-cream tracking-wide">{title}</h2>
  </div>
);

const MethodBadge = ({ method }: { method: string }) => (
  <span className={`font-mono text-xs px-2 py-0.5 rounded ${
    method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
  }`}>
    {method}
  </span>
);

const AccessBadge = ({ type }: { type: 'public' | 'partner' | 'internal' }) => (
  <span className={`text-xs px-2 py-0.5 rounded font-mono ${
    type === 'public' ? 'bg-emerald-500/10 text-emerald-400/70' :
    type === 'partner' ? 'bg-amber-500/10 text-amber-400/70' :
    'bg-red-500/10 text-red-400/70'
  }`}>
    {type === 'public' ? 'PUBLIC' : type === 'partner' ? 'API KEY' : 'INTERNAL'}
  </span>
);

const StateBadge = ({ state }: { state: string }) => (
  <span className={`text-xs px-2 py-0.5 rounded font-mono ${
    state.includes('anchored') ? 'bg-emerald-500/10 text-emerald-400/70' :
    state === 'pending' ? 'bg-amber-500/10 text-amber-400/70' :
    'bg-landing-cream/5 text-landing-cream/40'
  }`}>
    {state}
  </span>
);

const Architecture = () => {
  return (
    <div className="min-h-screen bg-[#050A05] text-landing-cream/80">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <Link to="/" className="inline-flex items-center gap-2 text-landing-muted/50 hover:text-landing-cream/60 transition-colors text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          umarise.com
        </Link>
        
        <div className="mb-2">
          <span className="text-xs font-mono text-landing-muted/40 tracking-widest uppercase">Internal Document</span>
        </div>
        <h1 className="text-3xl font-light text-landing-cream tracking-wide mb-2">
          Architecture Overview
        </h1>
        <p className="text-landing-muted/50 text-sm">
          16 February 2026 — Developer Journey Complete + Integration Checklist v2
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-16">

        {/* ASCII Summary */}
        <div className="bg-landing-cream/[0.02] border border-landing-cream/10 rounded-lg p-6 font-mono text-sm text-landing-cream/60 whitespace-pre leading-relaxed">
{`┌─────────────────────────────────────────────────────┐
│                  umarise.com                         │
│                                                      │
│  Public:   / /anchor /why /core /verify /reviewer ... │
│  New:      /api-reference (Quick Start + Checklist    │
│            + Live Demo + AI Support Bot)              │
│  PinGate:  /app /prototype /intake /pilot-tracker    │
│            /architecture                              │
│                                                      │
│  Visual:   Origin Mark (⊙) on all headers (16px)    │
│            Ghost/pending/anchored states per context  │
│                                                      │
├─────────────────────────────────────────────────────┤
│               core.umarise.com                       │
│                                                      │
│  Public:     resolve, verify, proof, health           │
│  Partner:    origins, origins-proof, proofs-export    │
│  Internal:   partner-create, metrics                  │
│  Status:     v1 frozen (6 Feb 2026)                  │
│                                                      │
├─────────────────────────────────────────────────────┤
│                  Hetzner                              │
│                                                      │
│  OTS Worker:  Merkle aggregation → Bitcoin            │
│  (Node.js, independent of Supabase)                  │
│                                                      │
├─────────────────────────────────────────────────────┤
│              Client Device                           │
│                                                      │
│  IndexedDB, Web Crypto, WebAuthn, JSZip              │
│  No data leaves device without explicit action       │
│  ZIP = artifact + certificate.json + VERIFY.txt+.ots │
└─────────────────────────────────────────────────────┘`}
        </div>

        {/* 1. B2C App Layer */}
        <section>
          <SectionHeader icon={Smartphone} title="B2C App Layer (/prototype)" num={1} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Component</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Where</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-landing-cream/5">
                {b2cItems.map((item) => (
                  <tr key={item.name} className="text-landing-cream/70">
                    <td className="py-2.5 pr-4 font-medium text-landing-cream/90">{item.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-emerald-400/80">{item.status}</span>
                    </td>
                    <td className="py-2.5 font-mono text-xs text-landing-muted/50">{item.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Consumer-only (does NOT touch Core)</p>
            <ul className="space-y-1 text-sm text-landing-cream/60">
              <li>• Passkey/WebAuthn → auto-register on first capture, best-effort signing (never blocking)</li>
              <li>• <code className="text-xs bg-landing-cream/5 px-1 rounded">device_signature</code> + <code className="text-xs bg-landing-cream/5 px-1 rounded">device_public_key</code> in certificate.json v1.1</li>
              <li>• Thumbnails in IndexedDB + remote fallback via Supabase storage</li>
              <li>• ZIP generation with artifact + certificate.json + VERIFY.txt + proof.ots</li>
              <li>• All UI/UX screens (Museum Aesthetic design system)</li>
            </ul>
          </div>

          {/* Proof Layers */}
          <div className="mt-6 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Proof Layers (12 Feb 2026)</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-emerald-400/80 font-mono text-xs w-16 shrink-0 pt-0.5">Layer 1</span>
                <div>
                  <p className="text-sm text-landing-cream/90 font-medium">WHAT + WHEN</p>
                  <p className="text-xs text-landing-cream/50">SHA-256 hash + timestamp + OTS Bitcoin anchor</p>
                  <p className="text-xs text-landing-muted/40 mt-1">Core primitive. Content-agnostic. Trustless.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-400/80 font-mono text-xs w-16 shrink-0 pt-0.5">Layer 2</span>
                <div>
                  <p className="text-sm text-landing-cream/90 font-medium">WHICH DEVICE</p>
                  <p className="text-xs text-landing-cream/50">WebAuthn passkey → device_signature + device_public_key</p>
                  <p className="text-xs text-landing-muted/40 mt-1">Best-effort. Auto-register. Never blocking. Companion-only.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. B2B Core Layer */}
        <section>
          <SectionHeader icon={Server} title="B2B Core Layer (core.umarise.com)" num={2} />
          
          {/* Public */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-emerald-400/50" />
              <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider">Public Endpoints</h3>
              <AccessBadge type="public" />
            </div>
            <div className="space-y-2">
              {publicEndpoints.map((ep) => (
                <div key={ep.num} className="flex items-center gap-3 p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                  <span className="text-landing-muted/30 font-mono text-xs w-4">{ep.num}</span>
                  <MethodBadge method={ep.method} />
                  <code className="text-sm text-landing-cream/80 flex-1">{ep.endpoint}</code>
                  <span className="text-xs text-landing-muted/40 hidden sm:inline">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Partner */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-amber-400/50" />
              <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider">Partner Endpoints</h3>
              <AccessBadge type="partner" />
            </div>
            <div className="space-y-2">
              {partnerEndpoints.map((ep) => (
                <div key={ep.num} className="flex items-center gap-3 p-3 bg-amber-500/[0.02] border border-amber-500/10 rounded-lg">
                  <span className="text-landing-muted/30 font-mono text-xs w-4">{ep.num}</span>
                  <MethodBadge method={ep.method} />
                  <code className="text-sm text-landing-cream/80 flex-1">{ep.endpoint}</code>
                  <span className="text-xs text-landing-muted/40 hidden sm:inline">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Internal */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-red-400/50" />
              <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider">Internal Endpoints</h3>
              <AccessBadge type="internal" />
            </div>
            <div className="space-y-2">
              {internalEndpoints.map((ep) => (
                <div key={ep.num} className="flex items-center gap-3 p-3 bg-red-500/[0.02] border border-red-500/10 rounded-lg">
                  <span className="text-landing-muted/30 font-mono text-xs w-4">{ep.num}</span>
                  <MethodBadge method={ep.method} />
                  <code className="text-sm text-landing-cream/80 flex-1">{ep.endpoint}</code>
                  <span className="text-xs text-landing-muted/40 hidden sm:inline">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40">
              <strong className="text-landing-cream/60">Core v1 status:</strong> Technically frozen (6 Feb 2026). No new features. Only bugfixes and security hardening.
            </p>
          </div>
        </section>

        {/* 3. Bridge */}
        <section>
          <SectionHeader icon={GitBranch} title="Where B2C and B2B Meet" num={3} />
          
          <div className="space-y-3 mb-8">
            {bridgePoints.map((bp, i) => (
              <div key={i} className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-landing-cream/50 bg-landing-cream/5 px-2 py-0.5 rounded">{bp.dir}</span>
                </div>
                <p className="text-sm text-landing-cream/70 mb-1">{bp.mechanism}</p>
                <p className="text-xs text-landing-muted/40">{bp.what}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-red-500/[0.02] border border-red-500/10 rounded-lg">
            <p className="text-xs text-red-400/50 uppercase tracking-wider mb-3">Does NOT cross the boundary</p>
            <ul className="space-y-1">
              {neverCrosses.map((item, i) => (
                <li key={i} className="text-sm text-landing-cream/50">✗ {item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Verify Discovery Path (NEW) */}
        <section>
          <SectionHeader icon={Compass} title="Verify Discovery Path" num={4} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Four technical touchpoints that drive traffic to <code className="text-xs bg-landing-cream/5 px-1 rounded">/verify</code>:
          </p>
          <div className="space-y-2">
            {discoveryPath.map((dp) => (
              <div key={dp.num} className="flex gap-3 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <span className="font-mono text-landing-muted/30 text-xs w-4 pt-0.5">{dp.num}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-landing-cream/90 font-medium font-mono">{dp.contact}</span>
                    <span className="text-xs text-landing-muted/30">— {dp.where}</span>
                  </div>
                  <p className="text-xs text-landing-cream/50">{dp.mechanism}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Origin Mark Visual System (NEW) */}
        <section>
          <SectionHeader icon={Eye} title="Origin Mark Visual System" num={5} />
          <p className="text-sm text-landing-cream/50 mb-6">
            The circumpunct (⊙) as universal brand and status symbol:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Context</th>
                  <th className="pb-3 pr-4">Size</th>
                  <th className="pb-3 pr-4">State</th>
                  <th className="pb-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-landing-cream/5">
                {originMarkUsage.map((row) => (
                  <tr key={row.context} className="text-landing-cream/70">
                    <td className="py-2.5 pr-4 text-landing-cream/90">{row.context}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs">{row.size}</td>
                    <td className="py-2.5 pr-4"><StateBadge state={row.state} /></td>
                    <td className="py-2.5 text-xs text-landing-muted/50">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center gap-6 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <div className="flex items-center gap-2">
              <OriginMark size={16} state="anchored" variant="light" />
              <span className="text-xs text-landing-muted/40">anchored</span>
            </div>
            <div className="flex items-center gap-2">
              <OriginMark size={16} state="pending" variant="light" />
              <span className="text-xs text-landing-muted/40">pending</span>
            </div>
            <div className="flex items-center gap-2">
              <OriginMark size={16} state="ghost" variant="light" />
              <span className="text-xs text-landing-muted/40">ghost</span>
            </div>
          </div>
        </section>

        {/* 6. /verify */}
        <section>
          <SectionHeader icon={CheckCircle} title="/verify — Independent Verification Instrument" num={6} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Route', '/verify (public, no PinGate)'],
              ['Architecture', 'Isolated from App layer'],
              ['Dependencies', 'No Auth, no IndexedDB, no pages table'],
              ['Hashing', 'Client-side Web Crypto API'],
              ['ZIP extraction', 'Client-side JSZip'],
              ['API calls', 'POST /v1-core-verify (public)'],
              ['Privacy', 'Files never leave device'],
              ['Origin Mark', 'Ghost (upload) → Anchored+glow (result)'],
            ].map(([label, value]) => (
              <div key={label} className="p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <p className="text-xs text-landing-muted/40 mb-1">{label}</p>
                <p className="text-sm text-landing-cream/70">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Database Integrity */}
        <section>
          <SectionHeader icon={Database} title="Database Integrity" num={7} />
          <div className="space-y-2">
            {dbIntegrity.map((row) => (
              <div key={row.table} className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-sm text-landing-cream/90">{row.table}</code>
                  <span className="text-xs text-emerald-400/60">{row.purpose}</span>
                </div>
                <p className="text-xs font-mono text-landing-muted/40">{row.protection}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Public Routes */}
        <section>
          <SectionHeader icon={Globe} title="Public Documentation Routes" num={8} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3 pr-4">Purpose</th>
                  <th className="pb-3 pr-4">Audience</th>
                  <th className="pb-3">Origin Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-landing-cream/5">
                {publicRoutes.map((r) => (
                  <tr key={r.route}>
                    <td className="py-2 pr-4 font-mono text-landing-cream/80">{r.route}</td>
                    <td className="py-2 pr-4 text-landing-cream/60">{r.purpose}</td>
                    <td className="py-2 pr-4 text-landing-muted/40 text-xs">{r.audience}</td>
                    <td className="py-2 text-landing-muted/40 text-xs font-mono">{r.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 9. ZIP Artifact Composition (NEW) */}
        <section>
          <SectionHeader icon={FileArchive} title="ZIP Artifact Composition" num={9} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Each origin produces a self-contained proof bundle:
          </p>
          <div className="space-y-2">
            {zipContents.map((z) => (
              <div key={z.file} className="flex items-center gap-3 p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <code className="text-sm text-landing-cream/80 w-40">{z.file}</code>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${z.always ? 'bg-emerald-500/10 text-emerald-400/70' : 'bg-landing-cream/5 text-landing-cream/40'}`}>
                  {z.always ? 'ALWAYS' : 'CONDITIONAL'}
                </span>
                <span className="text-xs text-landing-muted/40 flex-1">{z.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Partner Onboarding */}
        <section>
          <SectionHeader icon={Key} title="Partner Onboarding Flow" num={10} />
          <div className="space-y-2">
            {onboardingSteps.map((s) => (
              <div key={s.num} className="flex gap-3 p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <span className="font-mono text-landing-muted/30 text-xs w-6 pt-0.5">{s.num}.</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm text-landing-cream/90 font-medium">{s.step}</span>
                    <span className="text-xs text-landing-muted/30">— {s.who}</span>
                  </div>
                  <p className="text-xs text-landing-cream/50">{s.what}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40">
              <strong className="text-landing-cream/60">Core principles:</strong> No self-service. Every partner is manually qualified. Key is one-time. Write-once and hash-only.
            </p>
          </div>
        </section>

        {/* 11. Developer Journey (NEW) */}
        <section>
          <SectionHeader icon={Compass} title="Developer Journey" num={11} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Seven components that together define the integration experience. Target: Quick Start in 60 seconds, full integration in {'<'}4 hours.
          </p>
          <div className="space-y-2">
            {developerJourney.map((item) => (
              <div key={item.num} className="flex gap-3 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <span className="font-mono text-landing-muted/30 text-xs w-4 pt-0.5">{item.num}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-landing-cream/90 font-medium">{item.component}</span>
                    <span className="text-xs text-landing-muted/30 font-mono">— {item.location}</span>
                  </div>
                  <p className="text-xs text-landing-cream/50">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
            <p className="text-xs text-emerald-400/60">
              ✅ Developer Journey complete. All 7 components live. Zero-friction mandate enforced: every step is self-contained with inline instructions.
            </p>
          </div>
        </section>

        {/* 11. Security Hardening & Stress Test Readiness */}
        <section>
          <SectionHeader icon={ShieldCheck} title="Security Hardening & Stress Test Readiness" num={12} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Status as of 15 February 2026. All items completed for External Review Program (milestone 1).
          </p>

          {/* CORS Policy */}
          <div className="mb-8">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-landing-cream/30" />
              CORS Policy
            </h3>
            <div className="space-y-2">
              {securityHardening.corsPolicy.map((row) => (
                <div key={row.layer} className="p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg flex items-start gap-3">
                  <span className="text-sm text-landing-cream/90 font-medium w-48 shrink-0">{row.layer}</span>
                  <code className="text-xs text-landing-cream/60 font-mono w-48 shrink-0">{row.policy}</code>
                  <span className="text-xs text-landing-muted/40">{row.reason}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
              <p className="text-xs text-emerald-400/60">
                ✅ No wildcard (*) on App Layer. Browsers block requests from unknown domains. Validated with 5/5 CORS tests.
              </p>
            </div>
          </div>

          {/* Legacy Wrapper Cleanup */}
          <div className="mb-8">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-landing-cream/30" />
              Legacy Wrapper Cleanup
            </h3>
            <div className="space-y-2">
              {securityHardening.legacyCleanup.map((row) => (
                <div key={row.item} className="p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg flex items-center gap-3">
                  <span className="text-sm text-landing-cream/90 font-medium w-48 shrink-0 font-mono">{row.item}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400/70 font-mono">{row.status}</span>
                  <span className="text-xs text-landing-muted/40">{row.detail}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
              <p className="text-xs text-emerald-400/60">
                ✅ All legacy wrappers removed. No duplicate routes. Core API accessible via v1-core-* endpoints only.
              </p>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="mb-8">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-landing-cream/30" />
              DB-Persistent Rate Limiting
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                     <th className="pb-3 pr-4">Function</th>
                     <th className="pb-3 pr-4">Limit</th>
                     <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3">Rate Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-landing-cream/5">
                  {securityHardening.rateLimits.map((row) => (
                    <tr key={row.fn} className="text-landing-cream/70">
                      <td className="py-2 pr-4 font-mono text-xs text-landing-cream/80">{row.fn}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{row.limit}</td>
                      <td className="py-2 pr-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 font-mono">{row.type}</span>
                      </td>
                      <td className="py-2 text-xs text-landing-muted/50">{row.key}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
              <p className="text-xs text-emerald-400/60">
                ✅ All rate limits DB-persistent (core_check_rate_limit RPC). Public endpoints (verify, resolve, image-proxy) use SHA-256 IP hashing. Authenticated endpoints use device_user_id. Survives cold starts.
              </p>
            </div>
          </div>

          {/* Privacy Architecture */}
          <div className="mb-6">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-landing-cream/30" />
              Privacy Architecture
            </h3>
            <div className="space-y-2">
              {securityHardening.privacyArchitecture.map((row) => (
                <div key={row.aspect} className="flex gap-3 p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                  <span className="text-sm text-landing-cream/90 font-medium w-36 shrink-0">{row.aspect}</span>
                  <span className="text-xs text-landing-cream/50">{row.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg space-y-2">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Review-ready status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['35', 'Edge functions'],
                ['21', 'CORS locked'],
                ['14', 'Rate limited (DB)'],
                ['0', 'In-memory limits'],
              ].map(([num, label]) => (
                <div key={label} className="text-center p-3 bg-landing-cream/[0.03] rounded-lg">
                  <p className="text-lg font-light text-landing-cream/90 font-mono">{num}</p>
                  <p className="text-xs text-landing-muted/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. Load Test Results */}
        <section>
          <SectionHeader icon={Server} title="Stress Test Results (k6)" num={13} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Empirical validation of the Core API under sustained load. Executed on 15 February 2026 from an external client (iMac, macOS). All thresholds passed.
          </p>

          {/* Public Endpoints Test */}
          <div className="mb-8">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-landing-cream/30" />
              Publc Endpoints (load-test-core-api.js)
            </h3>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-3">
              <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Test Profile</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  ['8 min', 'Duration'],
                  ['34', 'Max VUs'],
                  ['6.073', 'Iterations'],
                  ['~14 req/s', 'Throughput'],
                ].map(([num, label]) => (
                  <div key={label} className="text-center p-3 bg-landing-cream/[0.03] rounded-lg">
                    <p className="text-lg font-light text-landing-cream/90 font-mono">{num}</p>
                    <p className="text-xs text-landing-muted/40">{label}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                      <th className="pb-3 pr-4">Endpoint</th>
                      <th className="pb-3 pr-4">Checks</th>
                      <th className="pb-3 pr-4">P95</th>
                      <th className="pb-3 pr-4">Error Rate</th>
                      <th className="pb-3">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-landing-cream/5">
                    {[
                      { endpoint: 'GET /v1-core-health', checks: '93% < 500ms', p95: '—', error: '6.01%', threshold: '✅' },
                      { endpoint: 'GET /v1-core-resolve', checks: '99% < 2s', p95: '531ms', error: '0.94%', threshold: '✅' },
                      { endpoint: 'POST /v1-core-verify', checks: '98% < 2s', p95: '621ms', error: '1.73%', threshold: '✅' },
                      { endpoint: 'POST /v1-core-origins', checks: '99% rejects 401', p95: '362ms', error: '0.08%', threshold: '✅' },
                    ].map((row) => (
                      <tr key={row.endpoint} className="text-landing-cream/70">
                        <td className="py-2 pr-4 font-mono text-xs">{row.endpoint}</td>
                        <td className="py-2 pr-4 text-xs">{row.checks}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-landing-cream/90">{row.p95}</td>
                        <td className="py-2 pr-4 text-xs">{row.error}</td>
                        <td className="py-2 text-emerald-400/80 text-xs">{row.threshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
              <p className="text-xs text-emerald-400/60">
                ✅ Overall: 99.41% checks passed. P95 overall 546ms. 6,563 requests processed in 8 minutes. All 6 custom thresholds passed.
              </p>
            </div>
          </div>

          {/* Authenticated Round-Trip Test */}
          <div className="mb-8">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-landing-cream/30" />
              B2B Round-Trip (load-test-authenticated.js)
            </h3>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-3">
              <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Test Profile — Create → Resolve → Verify</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  ['5.5 min', 'Duration'],
                  ['10', 'Max VUs'],
                  ['661', 'Iterations'],
                  ['646', 'Round-trips ✓'],
                ].map(([num, label]) => (
                  <div key={label} className="text-center p-3 bg-landing-cream/[0.03] rounded-lg">
                    <p className="text-lg font-light text-landing-cream/90 font-mono">{num}</p>
                    <p className="text-xs text-landing-muted/40">{label}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                     <th className="pb-3 pr-4">Step</th>
                     <th className="pb-3 pr-4">Checks</th>
                      <th className="pb-3 pr-4">P95</th>
                      <th className="pb-3 pr-4">Error Rate</th>
                      <th className="pb-3">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-landing-cream/5">
                    {[
                      { step: 'POST /v1-core-origins', checks: '98% < 3s', p95: '788ms', error: '1.36%', threshold: '✅' },
                      { step: 'GET /v1-core-resolve', checks: '98% < 2s', p95: '577ms', error: '1.38%', threshold: '✅' },
                      { step: 'POST /v1-core-verify', checks: '99% < 2s', p95: '664ms', error: '0.92%', threshold: '✅' },
                    ].map((row) => (
                      <tr key={row.step} className="text-landing-cream/70">
                        <td className="py-2 pr-4 font-mono text-xs">{row.step}</td>
                        <td className="py-2 pr-4 text-xs">{row.checks}</td>
                        <td className="py-2 pr-4 font-mono text-xs text-landing-cream/90">{row.p95}</td>
                        <td className="py-2 pr-4 text-xs">{row.error}</td>
                        <td className="py-2 text-emerald-400/80 text-xs">{row.threshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
              <p className="text-xs text-emerald-400/60">
                ✅ Overall: 99.73% checks passed. 652 attestations created, 646 complete round-trips (Create → Resolve → Verify). 0% HTTP failures. All 6 custom thresholds passed.
              </p>
            </div>
          </div>

          {/* Scalability Note */}
          <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-lg">
            <p className="text-xs text-amber-400/60 uppercase tracking-wider mb-2">Scalability note</p>
            <p className="text-xs text-landing-cream/50">
              The DB-persistent rate limiter (core_check_rate_limit UPSERT) functions correctly under this load (~14 req/s, ~820 req/min). At extreme scale (&gt;100K concurrent users) the write pressure of the UPSERT may become a bottleneck. Database IOPS monitoring is advised, potentially with migration to a distributed rate-limit mechanism.
            </p>
          </div>
        </section>

        {/* 13. Verification Independence Tools */}
        <section>
          <SectionHeader icon={Terminal} title="Verification Independence Tools" num={14} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Two platform-independent scripts enabling reviewers to validate Anchor ZIP bundles independently of Umarise infrastructure. Proves <strong className="text-landing-cream/70">Layer 5: Verification Independence</strong>.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <code className="text-sm text-landing-cream/90 font-mono">scripts/verify-anchor.sh</code>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 font-mono">Bash</span>
              </div>
              <ul className="space-y-1 text-xs text-landing-cream/50">
                <li>• Requires only <code className="bg-landing-cream/5 px-1 rounded">shasum</code>, <code className="bg-landing-cream/5 px-1 rounded">unzip</code>, <code className="bg-landing-cream/5 px-1 rounded">python3</code> (standard on macOS/Linux)</li>
                <li>• Extracts artifact + certificate.json from ZIP</li>
                <li>• Recalculates SHA-256 hash and compares with certificate</li>
                <li>• Detects presence of .ots proof for Bitcoin-level integrity</li>
              </ul>
            </div>

            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <code className="text-sm text-landing-cream/90 font-mono">scripts/verify-anchor.py</code>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/70 font-mono">Python</span>
              </div>
              <ul className="space-y-1 text-xs text-landing-cream/50">
                <li>• Zero dependencies — Python stdlib only (<code className="bg-landing-cream/5 px-1 rounded">hashlib</code>, <code className="bg-landing-cream/5 px-1 rounded">zipfile</code>, <code className="bg-landing-cream/5 px-1 rounded">json</code>)</li>
                <li>• Same verification logic as Bash variant</li>
                <li>• Cross-platform: Windows, macOS, Linux</li>
                <li>• Both scripts also available on <code className="bg-landing-cream/5 px-1 rounded">/reviewer</code></li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
            <p className="text-xs text-emerald-400/60">
              ✅ Both scripts use no Umarise infrastructure. Proof that verification works with local tools + the public Bitcoin network only.
            </p>
          </div>
        </section>

        {/* 15. Domain Architecture */}
        <section>
          <SectionHeader icon={Globe} title="Domain Architecture" num={15} />
          <div className="space-y-3">
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm text-landing-cream/90 font-mono">anchoring.app</code>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 font-mono">B2C PWA</span>
              </div>
              <p className="text-xs text-landing-cream/50">Primary domain for the consumer-facing ritual experience (/prototype)</p>
            </div>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm text-landing-cream/90 font-mono">umarise.com</code>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/70 font-mono">B2B Infra</span>
              </div>
              <p className="text-xs text-landing-cream/50">Authoritative hub for B2B infrastructure documentation and Infra Canon</p>
            </div>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm text-landing-cream/90 font-mono">core.umarise.com</code>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400/70 font-mono">API</span>
              </div>
              <p className="text-xs text-landing-cream/50">Public Core API (v1 frozen) — resolve, verify, proof, health</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-landing-cream/10 pt-8 pb-16">
          <p className="text-landing-cream/90 text-sm font-medium mb-2">
            Core does not know the App exists. The App knows Core exists.
          </p>
          <p className="text-landing-muted/40 text-xs mb-4">
            The boundary is clean.
          </p>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-4">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Added 16 Feb (latest)</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• <strong className="text-landing-cream/70">Developer Journey:</strong> 7 components — Quick Start (zero-friction), Integration Checklist v2 (24 steps), Live Demo, SDKs, first-run scripts, AI Support Bot, verification scripts</li>
              <li>• <strong className="text-landing-cream/70">/api-reference:</strong> Consolidated developer docs location (replaces /docs)</li>
              <li>• <strong className="text-landing-cream/70">Integration Checklist v2:</strong> 24 self-contained steps with inline instructions, code examples, and curl commands</li>
              <li>• <strong className="text-landing-cream/70">Partner onboarding step 9:</strong> Updated to reflect Quick Start → Checklist → Production flow</li>
              <li>• <strong className="text-landing-cream/70">Verification Independence Tools:</strong> Bash + Python scripts for offline ZIP validation</li>
              <li>• <strong className="text-landing-cream/70">Domain Architecture:</strong> anchoring.app (B2C) + umarise.com (B2B) + core.umarise.com (API)</li>
              <li>• <strong className="text-landing-cream/70">Routes updated:</strong> /anchor (was /origin), /reviewer added, /legal → Technical Specification</li>
              <li>• <strong className="text-landing-cream/70">Full English translation</strong></li>
            </ul>
          </div>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-4">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Added 15 Feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• <strong className="text-landing-cream/70">CORS lock:</strong> All 21 App Layer functions locked to anchoring.app + umarise.com + *.lovable.app</li>
              <li>• <strong className="text-landing-cream/70">Rate limit migration:</strong> All in-memory rate limits replaced by DB-persistent (core_check_rate_limit)</li>
              <li>• <strong className="text-landing-cream/70">Privacy architecture:</strong> SHA-256 hashed IPs, no PII, device-isolated auth</li>
              <li>• <strong className="text-landing-cream/70">Security matrix:</strong> Full edge function inventory (35 functions, 14 rate limited)</li>
              <li>• <strong className="text-landing-cream/70">Stress tests:</strong> k6 load tests with empirical results (P95 {'<'} 600ms)</li>
            </ul>
          </div>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-4">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Added 12 Feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• <strong className="text-landing-cream/70">Layer 2 — Device Identity (v1.1):</strong> WebAuthn passkey auto-registration on first capture</li>
              <li>• certificate.json v1.1 with device_signature + device_public_key</li>
              <li>• Best-effort signing: canceling Face ID/biometrics does NOT block anchor</li>
              <li>• ZIP artifact renamed to artifact.&#123;ext&#125; (supports video, PDF, audio)</li>
              <li>• VERIFY.txt includes device signed status</li>
            </ul>
          </div>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Added 9 Feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• Verify Discovery Path (4 touchpoints: VERIFY.txt, certificate verify_url, Sealed link, Origin Registry share button)</li>
              <li>• Origin Mark visual system on all site pages (16px header, ghost/pending/anchored states)</li>
              <li>• ZIP now includes VERIFY.txt with human-readable verification instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
