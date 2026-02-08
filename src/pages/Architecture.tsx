import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Smartphone, Shield, GitBranch, Globe, Lock, Key, Database, CheckCircle } from 'lucide-react';

/**
 * Architecture Overview — Internal Document
 * 
 * Complete architecture overview of Umarise as of 8 Feb 2026.
 * B2C App + B2B Core + Bridge + Verify — fully split.
 * 
 * Source: docs/architecture-week1-final.md
 * Access: PinGate protected
 */

const b2cItems = [
  { name: 'S0 Welcome', status: '✅ Live', where: 'Browser UI' },
  { name: 'S1 Capture', status: '✅ Camera + Photo Library', where: 'Device → Web Crypto' },
  { name: 'S2 Pause', status: '✅ Visuele bevestiging', where: 'Browser UI' },
  { name: 'S3 Mark', status: '✅ SHA-256 hashing', where: 'Client-side → pages INSERT' },
  { name: 'S4 Release', status: '✅ Origin ID + status', where: 'Browser UI' },
  { name: 'S5 ZIP', status: '✅ Live', where: 'Client-side JSZip' },
  { name: 'S6 Owned', status: '✅ Live (Wall)', where: 'Browser UI' },
  { name: 'S7 Marked Origins', status: '✅ Live', where: 'Client + /v1-core-resolve' },
  { name: 'Passkey', status: '✅ Live', where: 'Client-side WebAuthn' },
  { name: 'IndexedDB thumbnails', status: '✅ Live', where: 'Lokaal op device' },
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

const publicRoutes = [
  { route: '/', purpose: 'Landing / infrastructuur positionering', audience: 'Iedereen' },
  { route: '/origin', purpose: 'Wat is een origin?', audience: 'Prospects' },
  { route: '/core', purpose: 'Core API spec', audience: 'Technisch' },
  { route: '/why', purpose: 'Waarom origins?', audience: 'Business' },
  { route: '/review', purpose: 'Technical Review Kit', audience: 'CTOs / integrators' },
  { route: '/proof', purpose: 'Proof uitleg', audience: 'Algemeen' },
  { route: '/verify', purpose: 'Verificatie tool', audience: 'Iedereen' },
  { route: '/legal', purpose: 'Juridisch kader', audience: 'Juridisch' },
  { route: '/privacy + /terms', purpose: 'Privacy en voorwaarden', audience: 'Compliance' },
  { route: '/install', purpose: 'PWA installatie', audience: 'Consumenten' },
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
          8 February 2026 — Week 1 Final
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-16">

        {/* ASCII Summary */}
        <div className="bg-landing-cream/[0.02] border border-landing-cream/10 rounded-lg p-6 font-mono text-sm text-landing-cream/60 whitespace-pre leading-relaxed">
{`┌─────────────────────────────────────────────────────┐
│                  umarise.com                         │
│                                                      │
│  Publiek:  / /origin /core /why /verify /review ...  │
│  PinGate:  /app /prototype /intake /pilot-tracker    │
│                                                      │
├─────────────────────────────────────────────────────┤
│               core.umarise.com                       │
│                                                      │
│  Publiek:    resolve, verify, proof, health           │
│  Partner:    origins, origins-proof, proofs-export    │
│  Intern:     partner-create, metrics                  │
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
              <li>• Passkey/WebAuthn → <code className="text-xs bg-landing-cream/5 px-1 rounded">claimed_by</code> + <code className="text-xs bg-landing-cream/5 px-1 rounded">signature</code> in certificate.json</li>
              <li>• Thumbnails in IndexedDB</li>
              <li>• ZIP generatie met photo + certificate</li>
              <li>• Alle UI/UX schermen</li>
            </ul>
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
          <div>
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

        {/* 4. /verify */}
        <section>
          <SectionHeader icon={CheckCircle} title="/verify — Onafhankelijk Verificatie-instrument" num={4} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Route', '/verify (publiek, geen PinGate)'],
              ['Architectuur', 'Geïsoleerd van App-laag'],
              ['Dependencies', 'Geen Auth, geen IndexedDB, geen pages tabel'],
              ['Hashing', 'Client-side Web Crypto API'],
              ['ZIP extractie', 'Client-side JSZip'],
              ['API calls', 'POST /v1-core-verify (publiek)'],
              ['Privacy', 'Bestanden verlaten device NIET'],
            ].map(([label, value]) => (
              <div key={label} className="p-3 bg-landing-cream/[0.02] border border-landing-cream/5 rounded-lg">
                <p className="text-xs text-landing-muted/40 mb-1">{label}</p>
                <p className="text-sm text-landing-cream/70">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Database Integrity */}
        <section>
          <SectionHeader icon={Database} title="Database Integriteit" num={5} />
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

        {/* 6. Public Routes */}
        <section>
          <SectionHeader icon={Globe} title="Publieke Documentatie-routes" num={6} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-landing-muted/40 text-xs uppercase tracking-wider border-b border-landing-cream/10">
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3 pr-4">Doel</th>
                  <th className="pb-3">Doelgroep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-landing-cream/5">
                {publicRoutes.map((r) => (
                  <tr key={r.route}>
                    <td className="py-2 pr-4 font-mono text-landing-cream/80">{r.route}</td>
                    <td className="py-2 pr-4 text-landing-cream/60">{r.purpose}</td>
                    <td className="py-2 text-landing-muted/40 text-xs">{r.audience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Partner Onboarding */}
        <section>
          <SectionHeader icon={Key} title="Partner Onboarding Flow" num={7} />
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

        {/* Footer */}
        <div className="border-t border-landing-cream/10 pt-8 pb-16">
          <p className="text-landing-cream/90 text-sm font-medium mb-2">
            Core weet niet dat de App bestaat. De App weet dat Core bestaat.
          </p>
          <p className="text-landing-muted/40 text-xs">
            De grens is schoon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
