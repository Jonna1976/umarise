import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * Infrastructure Doctrine — Internal reference document
 * "Infrastructure companies sell assurance and integration around a primitive, not workflow."
 */
export default function InfrastructureDoctrine() {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[hsl(220,10%,7%)] text-[hsl(40,15%,88%)] print:bg-white print:text-stone-800">
      <div className="fixed top-6 right-6 print:hidden z-50">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="bg-[hsl(220,10%,12%)] border-[hsl(40,15%,88%,0.15)] text-[hsl(40,15%,88%,0.7)] hover:bg-[hsl(220,10%,16%)]"
        >
          <Printer className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16 print:px-0 print:py-8">
        {/* Header */}
        <header className="mb-14 pb-8 border-b border-[hsl(40,15%,88%,0.1)] print:border-stone-300">
          <p className="font-mono text-[11px] uppercase tracking-[4px] text-[hsl(25,35%,42%,0.6)] mb-3">
            Internal Doctrine
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl font-light text-[hsl(40,15%,88%,0.95)] mb-2 print:text-stone-900">
            Infrastructure Without SaaS
          </h1>
          <p className="text-sm text-[hsl(40,15%,88%,0.45)]">
            Operational reference · March 2026
          </p>
        </header>

        <div className="space-y-12">

          {/* Core thesis */}
          <section>
            <HighlightBox>
              <p className="text-base text-[hsl(40,15%,88%,0.85)] leading-relaxed print:text-stone-800">
                Infrastructure companies sell assurance and integration around a primitive, not workflow.
              </p>
            </HighlightBox>
          </section>

          {/* Decision test */}
          <section>
            <SectionTitle>The decision test</SectionTitle>
            <HighlightBox accent>
              <p className="text-sm text-[hsl(40,15%,88%,0.9)] leading-relaxed print:text-stone-800">
                Does this make us someone's workflow, or just their plumbing?
                <br /><br />
                <strong>Always choose plumbing.</strong>
              </p>
            </HighlightBox>
          </section>

          {/* What we sell beyond the API call */}
          <section>
            <SectionTitle>What infrastructure companies sell beyond the API call</SectionTitle>
            <div className="space-y-3">
              <BorderItem title="Reliability and SLAs" desc="99.9-99.999% uptime, incident handling, automated monitoring" />
              <BorderItem title="Compliance cover" desc="SOC2, ISO 27001, PCI, DPA, DPIA readiness" />
              <BorderItem title="Enterprise support" desc="Dedicated TAM, 24/7 availability, onboarding engineers" />
              <BorderItem title="Operational tooling around the primitive" desc="Sandbox, request logs, spend alerts, credit headers" />
              <BorderItem title="Developer experience" desc="SDKs, docs, quickstarts, reference verifiers, live demos" />
              <BorderItem title="Integration expertise" desc="Architecture reviews, pattern guides, AI-assisted integration" />
            </div>
          </section>

          {/* What we already deliver */}
          <section>
            <SectionTitle>What Umarise already delivers</SectionTitle>
            <DataTable
              headers={['Capability', 'Implementation', 'Status']}
              rows={[
                ['Primitive (hash + anchor + proof)', 'Core API v1, contract frozen', '✅'],
                ['Sandbox / test keys', 'um_test_ prefix, auto-valid, unlimited', '✅'],
                ['SDKs', 'Python + Node.js, public domain', '✅'],
                ['Docs + quickstarts', '/api-reference, live demo, AI integration guide', '✅'],
                ['Reference verifier', 'verify-anchoring.org, zero-backend', '✅'],
                ['Per-key usage metrics', 'core_request_log + v1-internal-metrics', '✅'],
                ['Credit spend awareness', 'X-Credits-Remaining, X-Credits-Low headers', '✅'],
                ['Status page + monitoring', '/status, 5-min health checks, sparkline', '✅'],
                ['Rate limiting per tier', 'core_rate_limits, configurable per key', '✅'],
                ['Integration templates', 'Python + Node test suites', '✅'],
                ['Support chatbot', 'AI-powered, in api-reference', '✅'],
              ]}
            />
          </section>

          {/* Infrastructure vs SaaS boundary */}
          <section>
            <SectionTitle>Infrastructure services vs SaaS features</SectionTitle>
            <DataTable
              headers={['Infrastructure (stay here)', 'SaaS (avoid)']}
              rows={[
                ['Reliability, security, compliance of the primitive', 'Business workflows, approval chains'],
                ['SDKs, libraries, sandbox, sample code', 'Multi-tenant data stores with client artifacts'],
                ['Status pages, support, docs', 'Dashboards that become system of record'],
                ['Per-key usage metrics and request logs', 'Document viewers, case timelines, workspaces'],
                ['Credit balance headers', 'Portal with artifact lists and project views'],
                ['Architecture pattern guides', 'Domain-specific semantics and vertical features'],
              ]}
            />
          </section>

          {/* Never build list */}
          <section>
            <SectionTitle>What Umarise never builds</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.5)] mb-4 print:text-stone-500">
              Even if customers ask for it.
            </p>
            <div className="space-y-3">
              <NeverItem text="File storage, document viewer, or workspace with artifact lists" />
              <NeverItem text="Approval chains, legal work queues, or dispute workflow tools" />
              <NeverItem text="User accounts with roles and document lists" />
              <NeverItem text='Domain-specific semantics ("contracts," "HR decisions," "medical records")' />
              <NeverItem text="Dashboards that become system of record for work" />
              <NeverItem text="Monitoring dashboards for partners or CRM-like API usage tracking" />
              <NeverItem text="Automatic stalled keys detection or sales-oriented follow-up" />
            </div>
          </section>

          {/* Enterprise procurement */}
          <section>
            <SectionTitle>How enterprise procurement works without a portal</SectionTitle>
            <div className="space-y-3">
              <BorderItem title="Human-led" desc="Contracts, DPA, security questionnaires via PDF, email, calls" />
              <BorderItem title="Minimal control plane" desc="API keys, aggregate usage/billing, compliance docs download" />
              <BorderItem title="No artifact lists" desc="No document views, no projects, no partner-facing dashboards" />
              <BorderItem title="Channel through partners" desc="Large customers via partners. They do the portal work. Umarise stays a background dependency." />
            </div>
          </section>

          {/* Pricing justification */}
          <section>
            <SectionTitle>Pricing rationale: €0.10 per anchor</SectionTitle>
            <HighlightBox>
              <p className="text-sm text-[hsl(40,15%,88%,0.8)] leading-relaxed print:text-stone-700">
                The price covers more than an API call. It covers:
              </p>
              <ul className="text-sm text-[hsl(40,15%,88%,0.7)] mt-3 space-y-1 print:text-stone-600">
                <li>· Bitcoin anchoring via OpenTimestamps (Merkle batching, calendar management)</li>
                <li>· Permanent registry entry (immutable, no DELETE, no UPDATE)</li>
                <li>· Automated .ots proof upgrade and monitoring</li>
                <li>· Public verification endpoints (no key required)</li>
                <li>· Infrastructure uptime, monitoring, and incident handling</li>
                <li>· SDKs, documentation, sandbox, support</li>
                <li>· Proof that survives the issuer</li>
              </ul>
            </HighlightBox>
          </section>

          {/* Phase 2 items */}
          <section>
            <SectionTitle>Phase 2: when paying partners ask</SectionTitle>
            <p className="text-sm text-[hsl(40,15%,88%,0.5)] mb-4 print:text-stone-500">
              Not needed for adoption. Needed for procurement at scale.
            </p>
            <DataTable
              headers={['Capability', 'Trigger']}
              rows={[
                ['SOC2 / ISO 27001 certification', 'Enterprise security questionnaire requires it'],
                ['Spend alerts (webhook/email at credit threshold)', 'Partner requests automated budget monitoring'],
                ['Formal SLA document with response times', 'Partner procurement requires contractual uptime'],
                ['Enterprise support tiers', 'Multiple paying partners need differentiated support'],
                ['Incident runbook + communication protocol', 'First production incident requires formal process'],
              ]}
            />
          </section>

          {/* Footer */}
          <div className="border-t border-[hsl(40,15%,88%,0.1)] pt-6 text-center text-sm text-[hsl(40,15%,88%,0.3)] print:border-stone-300 print:text-stone-400">
            <p>Internal document · do not distribute</p>
            <p className="mt-1">Umarise · 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-['Playfair_Display'] text-xl font-light text-[hsl(40,15%,88%,0.9)] mb-4 print:text-stone-900">
      {children}
    </h2>
  );
}

function HighlightBox({ children, accent, className }: { children: React.ReactNode; accent?: boolean; className?: string }) {
  return (
    <div className={`rounded-lg border ${
      accent
        ? 'border-[hsl(25,35%,42%,0.3)] bg-[hsl(25,35%,42%,0.08)]'
        : 'border-[hsl(40,15%,88%,0.08)] bg-[hsl(220,10%,10%)]'
    } p-6 print:bg-stone-50 print:border-stone-200 ${className ?? ''}`}>
      {children}
    </div>
  );
}

function BorderItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-l-2 border-[hsl(25,35%,42%,0.4)] pl-4 print:border-stone-400">
      <p className="text-sm font-medium text-[hsl(40,15%,88%,0.85)] print:text-stone-800">{title}</p>
      <p className="text-xs text-[hsl(40,15%,88%,0.5)] mt-0.5 print:text-stone-500">{desc}</p>
    </div>
  );
}

function NeverItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 pl-1">
      <span className="text-red-400/60 text-sm mt-0.5 shrink-0">✕</span>
      <p className="text-sm text-[hsl(40,15%,88%,0.7)] print:text-stone-600">{text}</p>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[hsl(40,15%,88%,0.15)] print:border-stone-300">
            {headers.map((h) => (
              <th key={h} className="text-left py-2 pr-4 font-mono text-[10px] uppercase tracking-[2px] text-[hsl(40,15%,88%,0.4)] print:text-stone-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[hsl(40,15%,88%,0.06)] print:border-stone-200">
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-4 text-[hsl(40,15%,88%,0.7)] print:text-stone-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
