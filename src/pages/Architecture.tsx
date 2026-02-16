import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Smartphone, Shield, GitBranch, Globe, Lock, Key, Database, CheckCircle, Eye, FileArchive, Compass, ShieldCheck, Terminal } from 'lucide-react';
import { OriginMark } from '@/components/prototype/components/OriginMark';

/**
 * Architecture Overview — Internal Document
 * 
 * Complete architecture overview of Umarise as of 16 Feb 2026.
 * B2C App + B2B Core + Bridge + Verify + Discovery Path + Origin Mark — fully split.
 * Proof Model with Device Identity (v1.1). Verification Independence Tools.
 * 
 * Source: docs/architecture-week1-final.md
 * Access: PinGate protected
 */

const b2cItems = [
  { name: 'S1 Capture', status: '✅ File picker + auto-hash + passkey signing', where: 'Device → Web Crypto → WebAuthn → pages INSERT' },
  { name: 'S2 Sealed', status: '✅ Receipt + file list + ZIP download', where: 'Browser UI + Client-side JSZip' },
  { name: 'S3 Anchor Registry', status: '✅ Horizontal gallery + detail modal', where: 'Client + /v1-core-resolve' },
  { name: 'Passkey (v1.1)', status: '✅ Auto-register + best-effort signing', where: 'Client-side WebAuthn (never blocking)' },
  { name: 'IndexedDB thumbnails', status: '✅ Live + remote fallback', where: 'Lokaal op device + Supabase storage' },
  { name: 'OTS status polling', status: '✅ Live', where: '/v1-core-resolve + /v1-core-proof via useProofPolling' },
];

const publicEndpoints = [
  { num: 1, method: 'GET', endpoint: '/v1-core-resolve', desc: 'Origin opzoeken (by ID of hash)' },
  { num: 2, method: 'POST', endpoint: '/v1-core-verify', desc: 'Hash verificatie (match/no-match)' },
  { num: 3, method: 'GET', endpoint: '/v1-core-proof', desc: 'Raw .ots binary download' },
  { num: 4, method: 'GET', endpoint: '/v1-core-health', desc: '{"status":"operational","version":"v1"}' },
];

const partnerEndpoints = [
  { num: 5, method: 'POST', endpoint: '/v1-core-origins', desc: 'Origin attestatie aanmaken' },
  { num: 6, method: 'GET', endpoint: '/v1-core-origins-proof', desc: 'Proof data (JSON, base64)' },
  { num: 7, method: 'GET', endpoint: '/v1-core-proofs-export', desc: 'Bulk export (cursor-based)' },
];

const internalEndpoints = [
  { num: 8, method: 'POST', endpoint: '/v1-internal-partner-create', desc: 'API key generatie' },
  { num: 9, method: 'GET', endpoint: '/v1-internal-metrics', desc: '24h operationele metrics' },
];

const bridgePoints = [
  { dir: 'B2C → Core', mechanism: 'DB trigger bridge_page_to_core', what: 'Hash + timestamp propagatie naar origin_attestations' },
  { dir: 'Core → B2C', mechanism: 'Async notification notify-ots-complete', what: 'Best-effort, in try/catch (geen hard dependency)' },
  { dir: 'B2C leest Core', mechanism: 'GET /v1-core-resolve', what: 'Status ophalen (pending/anchored)' },
  { dir: 'B2C leest Core', mechanism: 'GET /v1-core-proof', what: 'Raw .ots binary voor ZIP' },
];

const neverCrosses = [
  'Foto bytes (nooit)',
  'Thumbnails (lokaal)',
  'Passkey credentials (niet in Core)',
  'UI labels, schermnamen (App-domein)',
  'device_user_id (Core is identity-agnostic)',
];

const dbIntegrity = [
  { table: 'origin_attestations', protection: 'prevent_update + prevent_delete', purpose: 'Write-once, append-only' },
  { table: 'core_ots_proofs', protection: 'prevent_anchored_proof_mutation + delete-trigger', purpose: 'Bewijs onwijzigbaar na anchoring' },
  { table: 'partner_api_keys', protection: 'prevent_api_key_delete', purpose: 'Keys niet verwijderbaar' },
  { table: 'core_ddl_audit', protection: 'DDL event trigger', purpose: 'Schema-wijzigingen gelogd' },
];

const securityHardening = {
  corsPolicy: [
    { layer: 'Core API (v1-core-*)', policy: 'Access-Control-Allow-Origin: *', reason: 'B2B partner compatibiliteit — curl, SDKs, integraties' },
    { layer: 'App Layer (companion-*)', policy: 'Dynamic origin reflection', reason: 'Locked naar anchoring.app, umarise.com, *.lovable.app' },
    { layer: 'Public Proxies', policy: 'Dynamic origin reflection', reason: 'companion-verify, companion-resolve, origin-image-proxy' },
    { layer: 'AI Functions', policy: 'Dynamic origin reflection', reason: 'Zelfde lock als App Layer' },
    { layer: 'Proxy Functions', policy: 'Dynamic origin reflection', reason: 'hetzner-storage-proxy, hetzner-ai-proxy' },
  ],
  legacyCleanup: [
    { item: 'core-origins (wrapper)', status: 'Verwijderd', detail: 'Vervangen door v1-core-origins' },
    { item: 'core-resolve (wrapper)', status: 'Verwijderd', detail: 'Vervangen door v1-core-resolve' },
    { item: 'core-verify (wrapper)', status: 'Verwijderd', detail: 'Vervangen door v1-core-verify' },
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
    { aspect: 'Request logging', detail: 'SHA-256 gehashte IPs — geen raw IP opslag' },
    { aspect: 'Identiteit', detail: 'device_user_id (lokaal gegenereerd) — geen accounts, geen PII' },
    { aspect: 'Content', detail: 'Core is content-agnostic — alleen hashes, nooit bytes' },
    { aspect: 'Cross-device', detail: 'Geen synchronisatie — device-isolated by design' },
    { aspect: 'Sensitive tables', detail: 'RLS USING(false) — toegang alleen via Edge Function proxy' },
  ],
};

const publicRoutes = [
  { route: '/', purpose: 'Landing / infrastructuur positionering', audience: 'Iedereen', mark: '16px header' },
  { route: '/anchor', purpose: 'Wat is een anchor?', audience: 'Prospects', mark: '16px header' },
  { route: '/why', purpose: 'Waarom anchors?', audience: 'Business', mark: '16px header' },
  { route: '/core', purpose: 'Core API spec', audience: 'Technisch', mark: '16px header + 12px inline' },
  { route: '/review', purpose: 'Technical Review Kit', audience: 'CTOs / integrators', mark: '16px header + 12px inline' },
  { route: '/reviewer', purpose: 'Reviewer Package (External Review)', audience: 'Reviewers', mark: '16px header' },
  { route: '/verify', purpose: 'Verificatie tool', audience: 'Iedereen', mark: '16px header + 48px/28px' },
  { route: '/legal', purpose: 'Technische Specificatie', audience: 'Juridisch / Technisch', mark: '16px header' },
  { route: '/privacy + /terms', purpose: 'Privacy en voorwaarden', audience: 'Compliance', mark: '16px header' },
  { route: '/install', purpose: 'PWA installatie', audience: 'Consumenten', mark: '16px header' },
];

const discoveryPath = [
  { num: 1, contact: 'VERIFY.txt', where: 'In elke ZIP', mechanism: 'Origin ID, timestamp, hash, directe verificatielink' },
  { num: 2, contact: 'verify_url', where: 'In certificate.json', mechanism: 'https://umarise.com/verify (canoniek)' },
  { num: 3, contact: 'Verifieer-link', where: 'Sealed screen (S4)', mechanism: 'Subtiele link onder save-button' },
  { num: 4, contact: 'Deel origin', where: 'Origin Registry detail modal (S3)', mechanism: 'Web Share API → ZIP / clipboard fallback' },
];

const originMarkUsage = [
  
  { context: 'S1 Capture', size: '48px', state: 'anchored', detail: 'Breathing animatie' },
  { context: 'Processing', size: '64px', state: 'anchored', detail: 'Breathing tijdens auto-hash' },
  { context: 'S2 Sealed', size: '48px', state: 'anchored', detail: 'Glow' },
  { context: 'Wall status', size: '20px', state: 'anchored/pending', detail: 'Per-origin status' },
  { context: 'Navigation', size: '28px', state: 'anchored', detail: 'OriginButton' },
  { context: 'Site header', size: '16px', state: 'anchored', detail: 'Alle pagina\'s' },
  { context: '/verify upload', size: '48px', state: 'ghost', detail: 'Lege ring' },
  { context: '/verify resultaat', size: '28px', state: 'anchored', detail: 'Glow' },
  { context: '/core partner', size: '12px', state: 'pending', detail: 'Gestreepeld' },
  { context: '/review properties', size: '12px', state: 'anchored', detail: 'Inline' },
];

const zipContents = [
  { file: 'artifact.{ext}', always: false, desc: 'Origineel artifact (jpg/png/mp4/pdf/...) — hash-verified' },
  { file: 'certificate.json', always: true, desc: 'v1.1: origin_id, hash, timestamp, device_signature, device_public_key, proof_status' },
  { file: 'VERIFY.txt', always: true, desc: 'Menselijk leesbare verificatie-instructies + link + device signed status' },
  { file: 'proof.ots', always: false, desc: 'OpenTimestamps binary bewijs (alleen bij anchored)' },
];

const onboardingSteps = [
  { num: 1, step: 'Eerste contact', who: 'Partner', what: 'Mailt partners@umarise.com met use case' },
  { num: 2, step: 'Suitability check', who: 'Umarise', what: 'Green flags: hoge frequentie data, regulatory druk, audit needs' },
  { num: 3, step: 'Kwalificatie', who: 'Umarise', what: '4x JA + 4x OK framework' },
  { num: 4, step: 'Intake', who: 'Partner', what: 'Vult systeemdetails in (intern /intake checklist)' },
  { num: 5, step: 'Due diligence', who: 'Umarise', what: 'Technische evaluatie: artifacts, hashing capability, volume' },
  { num: 6, step: 'Tier selectie', who: 'Samen', what: 'Op basis van volume en use case' },
  { num: 7, step: 'API key generatie', who: 'Umarise', what: 'Via v1-internal-partner-create, 64-char hex key' },
  { num: 8, step: 'Key overdracht', who: 'Umarise → Partner', what: 'Plaintext key eenmalig gedeeld, daarna nooit meer opvraagbaar' },
  { num: 9, step: 'Integratie', who: 'Partner', what: 'POST /v1-core-origins met X-API-Key header' },
  { num: 10, step: 'Verificatie', who: 'Samen', what: 'Eerste attestatie testen, resolve en proof checken' },
  { num: 11, step: 'Live', who: 'Partner', what: 'Productie-traffic start' },
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
          16 February 2026 — Verification Independence Tools + External Review Program
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-16">

        {/* ASCII Summary */}
        <div className="bg-landing-cream/[0.02] border border-landing-cream/10 rounded-lg p-6 font-mono text-sm text-landing-cream/60 whitespace-pre leading-relaxed">
{`┌─────────────────────────────────────────────────────┐
│                  umarise.com                         │
│                                                      │
│  Publiek:  / /anchor /why /core /verify /reviewer ... │
│  PinGate:  /app /prototype /intake /pilot-tracker    │
│            /architecture                              │
│                                                      │
│  Visueel:  Origin Mark (⊙) op alle headers (16px)   │
│            Ghost/pending/anchored states per context  │
│                                                      │
├─────────────────────────────────────────────────────┤
│               core.umarise.com                       │
│                                                      │
│  Publiek:    resolve, verify, proof, health           │
│  Partner:    origins, origins-proof, proofs-export    │
│  Intern:     partner-create, metrics                  │
│  Status:     v1 bevroren (6 feb 2026)                │
│                                                      │
├─────────────────────────────────────────────────────┤
│                  Hetzner                              │
│                                                      │
│  OTS Worker:  Merkle aggregation → Bitcoin            │
│  (Node.js, onafhankelijk van Supabase)               │
│                                                      │
├─────────────────────────────────────────────────────┤
│              Client Device                           │
│                                                      │
│  IndexedDB, Web Crypto, WebAuthn, JSZip              │
│  Geen data verlaat het device zonder expliciete actie │
│  ZIP = artifact + certificate.json + VERIFY.txt+.ots │
└─────────────────────────────────────────────────────┘`}
        </div>

        {/* 1. B2C App Layer */}
        <section>
          <SectionHeader icon={Smartphone} title="B2C App-laag (/prototype)" num={1} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Onderdeel</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Waar</th>
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
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Consumer-only (raakt Core NIET)</p>
            <ul className="space-y-1 text-sm text-landing-cream/60">
              <li>• Passkey/WebAuthn → auto-register bij eerste capture, best-effort signing (never blocking)</li>
              <li>• <code className="text-xs bg-landing-cream/5 px-1 rounded">device_signature</code> + <code className="text-xs bg-landing-cream/5 px-1 rounded">device_public_key</code> in certificate.json v1.1</li>
              <li>• Thumbnails in IndexedDB + remote fallback via Supabase storage</li>
              <li>• ZIP generatie met artifact + certificate.json + VERIFY.txt + proof.ots</li>
              <li>• Alle UI/UX schermen (Museum Aesthetic design system)</li>
            </ul>
          </div>

          {/* Proof Layers */}
          <div className="mt-6 p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Proof Layers (12 feb 2026)</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-emerald-400/80 font-mono text-xs w-16 shrink-0 pt-0.5">Layer 1</span>
                <div>
                  <p className="text-sm text-landing-cream/90 font-medium">WAT + WANNEER</p>
                  <p className="text-xs text-landing-cream/50">SHA-256 hash + timestamp + OTS Bitcoin anchor</p>
                  <p className="text-xs text-landing-muted/40 mt-1">Core primitive. Content-agnostic. Trustless.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-400/80 font-mono text-xs w-16 shrink-0 pt-0.5">Layer 2</span>
                <div>
                  <p className="text-sm text-landing-cream/90 font-medium">WELK APPARAAT</p>
                  <p className="text-xs text-landing-cream/50">WebAuthn passkey → device_signature + device_public_key</p>
                  <p className="text-xs text-landing-muted/40 mt-1">Best-effort. Auto-register. Never blocking. Companion-only.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. B2B Core Layer */}
        <section>
          <SectionHeader icon={Server} title="B2B Core-laag (core.umarise.com)" num={2} />
          
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
              <strong className="text-landing-cream/60">Core v1 status:</strong> Technisch bevroren (6 feb 2026). Geen nieuwe features. Alleen bugfixes en security hardening.
            </p>
          </div>
        </section>

        {/* 3. Bridge */}
        <section>
          <SectionHeader icon={GitBranch} title="Waar B2C en B2B elkaar raken" num={3} />
          
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
            <p className="text-xs text-red-400/50 uppercase tracking-wider mb-3">Gaat NIET over de grens</p>
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
            Vier technische contactpunten die verkeer naar <code className="text-xs bg-landing-cream/5 px-1 rounded">/verify</code> leiden:
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
          <SectionHeader icon={Eye} title="Origin Mark Visueel Systeem" num={5} />
          <p className="text-sm text-landing-cream/50 mb-6">
            De circumpunct (⊙) als universeel brand- en statussymbool:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Context</th>
                  <th className="pb-3 pr-4">Formaat</th>
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
          <SectionHeader icon={CheckCircle} title="/verify — Onafhankelijk Verificatie-instrument" num={6} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Route', '/verify (publiek, geen PinGate)'],
              ['Architectuur', 'Geïsoleerd van App-laag'],
              ['Dependencies', 'Geen Auth, geen IndexedDB, geen pages tabel'],
              ['Hashing', 'Client-side Web Crypto API'],
              ['ZIP extractie', 'Client-side JSZip'],
              ['API calls', 'POST /v1-core-verify (publiek)'],
              ['Privacy', 'Bestanden verlaten device NIET'],
              ['Origin Mark', 'Ghost (upload) → Anchored+glow (resultaat)'],
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
          <SectionHeader icon={Database} title="Database Integriteit" num={7} />
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
          <SectionHeader icon={Globe} title="Publieke Documentatie-routes" num={8} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3 pr-4">Doel</th>
                  <th className="pb-3 pr-4">Doelgroep</th>
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
          <SectionHeader icon={FileArchive} title="ZIP Artifact Compositie" num={9} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Elke origin produceert een zelfstandig bewijspakket:
          </p>
          <div className="space-y-2">
            {zipContents.map((z) => (
              <div key={z.file} className="flex items-center gap-3 p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <code className="text-sm text-landing-cream/80 w-40">{z.file}</code>
                <span className={`text-xs px-2 py-0.5 rounded font-mono ${z.always ? 'bg-emerald-500/10 text-emerald-400/70' : 'bg-landing-cream/5 text-landing-cream/40'}`}>
                  {z.always ? 'ALTIJD' : 'CONDITIONEEL'}
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
              <strong className="text-landing-cream/60">Kernprincipes:</strong> Geen self-service. Elke partner wordt handmatig gekwalificeerd. Key is eenmalig. Write-once en hash-only.
            </p>
          </div>
        </section>

        {/* 11. Security Hardening & Stress Test Readiness */}
        <section>
          <SectionHeader icon={ShieldCheck} title="Security Hardening & Stress Test Readiness" num={11} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Status per 15 februari 2026. Alle items afgerond voor External Review Program (milestone 1).
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
                ✅ Geen wildcard (*) meer op App Layer. Browsers blokkeren requests van onbekende domeinen. Gevalideerd met 5/5 CORS tests.
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
                ✅ Alle legacy wrappers verwijderd. Geen dubbele routes meer. Core API bereikbaar via v1-core-* endpoints.
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
                    <th className="pb-3 pr-4">Limiet</th>
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
                ✅ Alle rate limits DB-persistent (core_check_rate_limit RPC). Publieke endpoints (verify, resolve, image-proxy) gebruiken SHA-256 IP hashing. Authenticated endpoints gebruiken device_user_id. Overleeft cold starts.
              </p>
            </div>
          </div>

          {/* Privacy Architecture */}
          <div className="mb-6">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-landing-cream/30" />
              Privacy Architectuur
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
          <SectionHeader icon={Server} title="Stress Test Resultaten (k6)" num={12} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Empirische validatie van de Core API onder sustained load. Uitgevoerd op 15 februari 2026 vanaf een externe client (iMac, macOS). Alle thresholds gepasseerd.
          </p>

          {/* Public Endpoints Test */}
          <div className="mb-8">
            <h3 className="text-sm text-landing-cream/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-landing-cream/30" />
              Publieke Endpoints (load-test-core-api.js)
            </h3>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-3">
              <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Test Profiel</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  ['8 min', 'Duur'],
                  ['34', 'Max VUs'],
                  ['6.073', 'Iteraties'],
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
                ✅ Overall: 99.41% checks passed. P95 overall 546ms. 6.563 requests verwerkt in 8 minuten. Alle 6 custom thresholds gepasseerd.
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
              <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-3">Test Profiel — Create → Resolve → Verify</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  ['5.5 min', 'Duur'],
                  ['10', 'Max VUs'],
                  ['661', 'Iteraties'],
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
                      <th className="pb-3 pr-4">Stap</th>
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
                ✅ Overall: 99.73% checks passed. 652 attestaties aangemaakt, 646 volledige round-trips (Create → Resolve → Verify). 0% HTTP failures. Alle 6 custom thresholds gepasseerd.
              </p>
            </div>
          </div>

          {/* Scalability Note */}
          <div className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-lg">
            <p className="text-xs text-amber-400/60 uppercase tracking-wider mb-2">Schaalbaarheid notitie</p>
            <p className="text-xs text-landing-cream/50">
              De DB-persistent rate limiter (core_check_rate_limit UPSERT) functioneert correct onder deze load (~14 req/s, ~820 req/min). Bij extreme schaal (&gt;100K concurrent users) kan de write-druk van de UPSERT een bottleneck worden. Monitoring van database IOPS is dan geadviseerd, eventueel met migratie naar een gedistribueerd rate-limit mechanisme.
            </p>
          </div>
        </section>

        {/* 13. Verification Independence Tools */}
        <section>
          <SectionHeader icon={Terminal} title="Verification Independence Tools" num={13} />
          <p className="text-sm text-landing-cream/50 mb-6">
            Twee platform-onafhankelijke scripts waarmee reviewers Anchor ZIP-pakketten onafhankelijk van Umarise-infrastructuur kunnen valideren. Bewijst <strong className="text-landing-cream/70">Layer 5: Verification Independence</strong>.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <code className="text-sm text-landing-cream/90 font-mono">scripts/verify-anchor.sh</code>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 font-mono">Bash</span>
              </div>
              <ul className="space-y-1 text-xs text-landing-cream/50">
                <li>• Vereist alleen <code className="bg-landing-cream/5 px-1 rounded">shasum</code>, <code className="bg-landing-cream/5 px-1 rounded">unzip</code>, <code className="bg-landing-cream/5 px-1 rounded">python3</code> (standaard op macOS/Linux)</li>
                <li>• Extraheert artifact + certificate.json uit ZIP</li>
                <li>• Herberekent SHA-256 hash en vergelijkt met certificate</li>
                <li>• Detecteert aanwezigheid .ots proof voor Bitcoin-level integriteit</li>
              </ul>
            </div>

            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <code className="text-sm text-landing-cream/90 font-mono">scripts/verify-anchor.py</code>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/70 font-mono">Python</span>
              </div>
              <ul className="space-y-1 text-xs text-landing-cream/50">
                <li>• Zero dependencies — alleen Python stdlib (<code className="bg-landing-cream/5 px-1 rounded">hashlib</code>, <code className="bg-landing-cream/5 px-1 rounded">zipfile</code>, <code className="bg-landing-cream/5 px-1 rounded">json</code>)</li>
                <li>• Zelfde verificatielogica als Bash-variant</li>
                <li>• Cross-platform: Windows, macOS, Linux</li>
                <li>• Beide scripts ook beschikbaar op <code className="bg-landing-cream/5 px-1 rounded">/reviewer</code></li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
            <p className="text-xs text-emerald-400/60">
              ✅ Beide scripts gebruiken geen Umarise-infrastructuur. Bewijs dat verificatie werkt met alleen lokale tools + het publieke Bitcoin-netwerk.
            </p>
          </div>
        </section>

        {/* 14. Domain Architecture */}
        <section>
          <SectionHeader icon={Globe} title="Domeinarchitectuur" num={14} />
          <div className="space-y-3">
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm text-landing-cream/90 font-mono">anchoring.app</code>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400/70 font-mono">B2C PWA</span>
              </div>
              <p className="text-xs text-landing-cream/50">Primair domein voor de consumer-facing ritual experience (/prototype)</p>
            </div>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm text-landing-cream/90 font-mono">umarise.com</code>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400/70 font-mono">B2B Infra</span>
              </div>
              <p className="text-xs text-landing-cream/50">Autoritatief hub voor B2B infrastructuur documentatie en Infra Canon</p>
            </div>
            <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm text-landing-cream/90 font-mono">core.umarise.com</code>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400/70 font-mono">API</span>
              </div>
              <p className="text-xs text-landing-cream/50">Publieke Core API (v1 bevroren) — resolve, verify, proof, health</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-landing-cream/10 pt-8 pb-16">
          <p className="text-landing-cream/90 text-sm font-medium mb-2">
            Core weet niet dat de App bestaat. De App weet dat Core bestaat.
          </p>
          <p className="text-landing-muted/40 text-xs mb-4">
            De grens is schoon.
          </p>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-4">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Toegevoegd 16 feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• <strong className="text-landing-cream/70">Verification Independence Tools:</strong> Bash + Python scripts voor offline ZIP-validatie</li>
              <li>• <strong className="text-landing-cream/70">Domeinarchitectuur:</strong> anchoring.app (B2C) + umarise.com (B2B) + core.umarise.com (API)</li>
              <li>• <strong className="text-landing-cream/70">Routes bijgewerkt:</strong> /anchor (was /origin), /reviewer toegevoegd, /legal → Technische Specificatie</li>
              <li>• <strong className="text-landing-cream/70">ASCII diagram:</strong> Gesynchroniseerd met huidige Infra Canon navigatie</li>
            </ul>
          </div>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-4">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Toegevoegd 15 feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• <strong className="text-landing-cream/70">CORS lock:</strong> Alle 21 App Layer functies gelocked naar anchoring.app + umarise.com + *.lovable.app</li>
              <li>• <strong className="text-landing-cream/70">Rate limit migratie:</strong> Alle in-memory rate limits vervangen door DB-persistent (core_check_rate_limit)</li>
              <li>• <strong className="text-landing-cream/70">Privacy architectuur:</strong> SHA-256 gehashte IPs, geen PII, device-isolated auth</li>
              <li>• <strong className="text-landing-cream/70">Security matrix:</strong> Volledige edge function inventarisatie (35 functies, 14 rate limited)</li>
              <li>• <strong className="text-landing-cream/70">Stress tests:</strong> k6 load tests met empirische resultaten (P95 {'<'} 600ms)</li>
            </ul>
          </div>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg mb-4">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Toegevoegd 12 feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• <strong className="text-landing-cream/70">Layer 2 — Device Identity (v1.1):</strong> WebAuthn passkey auto-registratie bij eerste capture</li>
              <li>• certificate.json v1.1 met device_signature + device_public_key</li>
              <li>• Best-effort signing: annuleren van Face ID/biometrie blokkeert anchor NIET</li>
              <li>• ZIP artifact hernoemd naar artifact.&#123;ext&#125; (ondersteunt video, PDF, audio)</li>
              <li>• VERIFY.txt bevat device signed status</li>
            </ul>
          </div>
          <div className="p-4 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
            <p className="text-xs text-landing-muted/40 uppercase tracking-wider mb-2">Toegevoegd 9 feb</p>
            <ul className="space-y-1 text-xs text-landing-cream/50">
              <li>• Verify Discovery Path (4 contactpunten: VERIFY.txt, certificate verify_url, Sealed link, Origin Registry deel-knop)</li>
              <li>• Origin Mark visueel systeem op alle site-pagina's (16px header, ghost/pending/anchored states)</li>
              <li>• ZIP bevat nu VERIFY.txt met menselijk leesbare verificatie-instructies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
