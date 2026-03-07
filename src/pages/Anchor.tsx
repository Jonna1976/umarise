import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { ChevronDown } from 'lucide-react';

/**
 * /anchor — What anchoring is and why it matters.
 * Stripe 2014 style: narrative, concise, expandable details, sticky section nav.
 */

function Expandable({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-landing-muted/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-landing-cream/70 group-hover:text-landing-cream transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-landing-muted/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-6 text-sm text-landing-muted/70 leading-relaxed space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

const sections = [
  { id: 'definition', label: 'Definition' },
  { id: 'problem', label: 'The problem' },
  { id: 'record', label: 'The Anchor Record' },
  { id: 'boundaries', label: 'Boundaries' },
  { id: 'persistence', label: 'Persistence' },
  { id: 'reference', label: 'Reference' },
];

function useSectionObserver() {
  const [active, setActive] = useState('definition');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Anchor() {
  const active = useSectionObserver();

  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      <PageHeader />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex gap-16">
        {/* Sticky sidebar nav — desktop only */}
        <nav className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24">
            <ul className="space-y-1">
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`block text-[13px] py-1.5 transition-colors duration-150 ${
                      active === id
                        ? 'text-landing-cream font-medium'
                        : 'text-landing-muted/40 hover:text-landing-muted/70'
                    }`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-landing-muted/10 space-y-1.5">
              <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="block text-[12px] text-landing-muted/30 hover:text-landing-copper transition-colors">Specification ↗</a>
              <Link to="/technical" className="block text-[12px] text-landing-muted/30 hover:text-landing-copper transition-colors">Technical →</Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-2xl flex-1 min-w-0">
          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl mb-3">
            Anchor
          </h1>
          <p className="text-landing-muted/60 text-[15px] leading-relaxed mb-20">
            An independently verifiable record that specific digital bytes existed at a specific moment in time.
            Umarise implements the{' '}
            <a
              href="https://anchoring-spec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors"
            >
              Anchoring Specification (IEC v1.0)
            </a>.
          </p>

          {/* Section 1: Definition */}
          <section id="definition" className="mb-20 scroll-mt-24">
            <div className="border-l-2 border-landing-copper/30 pl-6 mb-6">
              <p className="text-landing-cream font-serif text-xl leading-relaxed">
                An Anchor is an independently verifiable external reference that specific digital bytes existed at a specific moment in time.
              </p>
            </div>
            <p className="text-[15px] text-landing-muted/70 leading-relaxed">
              Anchor attestation applies where internal records, timestamps, or signatures are insufficient as proof, and where a write-once, independently verifiable and externally anchored record is required.
            </p>
          </section>

          {/* Section 2: The problem */}
          <section id="problem" className="mb-20 scroll-mt-24">
            <h2 className="font-serif text-xl mb-6 text-landing-cream">
              The problem
            </h2>
            <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-4">
              Digital systems routinely compute cryptographic hashes for integrity verification, deduplication, content addressing, authentication, and version control. These practices are correct and sufficient within the originating system.
            </p>
            <p className="text-[15px] text-landing-cream/90 leading-relaxed mb-4">
              They do not, by themselves, establish independently verifiable existence at a point in time.
            </p>
            <p className="text-[15px] text-landing-muted/70 leading-relaxed">
              Internal records are self-attested. Self-attestation is insufficient under external scrutiny. In audits, disputes, or provenance challenges, the question is not whether a system recorded something, but whether that record can be independently verified without relying on the system that produced it.
            </p>

            <Expandable title="Internal vs external evidence">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-landing-muted/40 text-xs uppercase tracking-wide mb-2">Internal records</p>
                  <ul className="space-y-1">
                    <li>Self-attested</li>
                    <li>Context-bound</li>
                    <li>Operational</li>
                    <li>Trust-based</li>
                  </ul>
                </div>
                <div>
                  <p className="text-landing-muted/40 text-xs uppercase tracking-wide mb-2">Anchor records</p>
                  <ul className="space-y-1">
                    <li>Independently verifiable</li>
                    <li>Context-independent</li>
                    <li>Externally anchored</li>
                    <li>Publicly verifiable</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-landing-muted/50 text-xs">Anchor attestation does not replace internal mechanisms; it operates orthogonally to them.</p>
            </Expandable>
          </section>

          {/* Section 3: The Anchor Record */}
          <section id="record" className="mb-20 scroll-mt-24">
            <h2 className="font-serif text-xl mb-6 text-landing-cream">
              The Anchor Record
            </h2>
            <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-6">
              An Anchor Record is an externally anchored, independently verifiable attestation that specific bytes existed at a specific moment. It is derived from a cryptographic hash computed at the moment of creation and recorded immutably.
            </p>

            <div className="space-y-3 mb-6">
              {[
                ['hash', 'identifying what existed'],
                ['timestamp', 'identifying when it existed'],
                ['origin_id', 'a stable external reference'],
              ].map(([field, desc]) => (
                <div key={field} className="flex gap-3 text-[15px]">
                  <span className="text-landing-copper font-mono text-sm shrink-0">{field}</span>
                  <span className="text-landing-muted/60">{desc}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-landing-muted/40 mb-8">
              No additional fields are defined. No content is stored. Only cryptographic hashes.
            </p>

            <div className="border border-landing-muted/15 rounded-lg p-6 mb-6">
              <p className="text-landing-cream/90 text-[15px]">
                Anchor attestation asserts existence of specific bytes at a specific moment, not correctness.
              </p>
            </div>

            <div className="border-l-2 border-landing-copper/30 pl-6">
              <p className="text-landing-cream text-[15px]">
                If the bytes change, the Anchor Record no longer matches.
              </p>
              <p className="text-landing-muted/50 text-sm mt-1">No exceptions.</p>
            </div>

            <div className="mt-8">
              <Expandable title="Invariants">
                <ul className="space-y-1 pl-4">
                  <li>Anchor Records are write-once</li>
                  <li>Anchor Records are immutably recorded</li>
                  <li>Verification is binary (match / no match)</li>
                </ul>
              </Expandable>
            </div>
          </section>

          {/* Section 4: Boundaries */}
          <section id="boundaries" className="mb-20 scroll-mt-24">
            <h2 className="font-serif text-xl mb-6 text-landing-cream">
              Boundaries
            </h2>
            <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-6">
              The anchor mechanism does not store content, interpret meaning, apply policy, enforce governance, resolve disputes, or determine outcomes. No assumptions are made about the nature, meaning, lifecycle, or use of the bytes.
            </p>

            <p className="text-[15px] text-landing-cream/90 leading-relaxed mb-4">
              Anchor attestation is appropriate only where:
            </p>
            <ul className="space-y-2 text-[15px] text-landing-muted/70 pl-4 mb-6">
              <li>A specific moment must not be renegotiated later</li>
              <li>Internal logs, timestamps, or signatures are insufficient as proof</li>
              <li>External, independent verification outweighs flexibility</li>
            </ul>
            <p className="text-sm text-landing-muted/40 italic">
              Where revision, exception handling, discretionary override, or semantic interpretation is required, this mechanism is not appropriate.
            </p>
          </section>

          {/* Section 5: Persistence */}
          <section id="persistence" className="mb-20 scroll-mt-24">
            <h2 className="font-serif text-xl mb-6 text-landing-cream">
              Persistence
            </h2>
            <p className="text-[15px] text-landing-muted/70 leading-relaxed mb-4">
              Verification depends solely on the hash, the timestamp, and the externally anchored record. Anchor Records are enforced as immutable by database-level constraints and externally anchored via OpenTimestamps to the Bitcoin blockchain.
            </p>
            <p className="text-sm text-landing-muted/50">
              The architecture is ledger-agnostic. Bitcoin is used as a public, append-only timestamp ledger — not as a currency. No wallets, no coins, no financial transactions.
            </p>
          </section>

          {/* Section 6: Reference */}
          <section id="reference" className="mb-20 scroll-mt-24">
            <h2 className="font-serif text-xl mb-6 text-landing-cream">
              Reference
            </h2>
            <div className="space-y-4 text-[15px] text-landing-muted/70 leading-relaxed">
              <p>
                The normative definition of anchoring is maintained at{' '}
                <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper underline underline-offset-2 hover:text-landing-cream transition-colors">
                  anchoring-spec.org
                </a>.
              </p>
              <p className="text-sm text-landing-muted/40 italic">
                The specification is normative. This implementation is not.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/technical" className="text-landing-copper hover:text-landing-cream transition-colors">Technical Description →</Link>
              <Link to="/developers" className="text-landing-copper hover:text-landing-cream transition-colors">Get Started →</Link>
              <a href="https://verify-anchoring.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper hover:text-landing-cream transition-colors">Verify ↗</a>
            </div>

            <div className="mt-10 pt-6 border-t border-landing-muted/10">
              <p className="text-landing-muted/40 text-sm">
                Verification is public. Attestation is permissioned.
              </p>
              <a
                href="mailto:partners@umarise.com"
                className="text-sm text-landing-copper/70 hover:text-landing-copper transition-colors"
              >
                partners@umarise.com
              </a>
            </div>
          </section>

          {/* Mobile links */}
          <section className="border-t border-landing-muted/10 pt-10 mb-10 lg:hidden">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href="https://anchoring-spec.org" target="_blank" rel="noopener noreferrer" className="text-landing-copper hover:text-landing-cream transition-colors">Specification ↗</a>
              <Link to="/technical" className="text-landing-copper hover:text-landing-cream transition-colors">Technical →</Link>
              <Link to="/developers" className="text-landing-copper hover:text-landing-cream transition-colors">Get Started →</Link>
            </div>
          </section>
        </main>
      </div>

      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
