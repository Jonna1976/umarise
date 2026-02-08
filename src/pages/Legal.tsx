import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise: Legal Context
 * 
 * Public page describing the legal context of origin attestation.
 * Not legal advice. A factual overview of case law, legislation,
 * and how origin records function as evidence.
 */

const caseLaw = [
  {
    name: 'AZ Factory v. Valeria Moda',
    court: 'Tribunal Judiciaire de Marseille',
    date: '20 March 2025',
    reference: 'RG 23/00046',
    summary:
      'First European ruling to accept blockchain timestamps as primary evidence of copyright anteriority. The court relied on the blockchain timestamps themselves, not the supplementary bailiff certification. Blockchain registration was deemed sufficiently reliable to demonstrate authorship and ownership.',
    relevance:
      'Validates the exact mechanism Umarise uses. Hash + timestamp + blockchain = admissible evidence of anteriority.',
  },
  {
    name: 'Huatai Yimei v. Daotong',
    court: 'Hangzhou Internet Court',
    date: 'June 2018',
    reference: 'Zhe 0192 Min Chu No. 81',
    summary:
      'First case worldwide to accept blockchain evidence. The plaintiff used a blockchain platform to hash and register evidence of copyright infringement. The court verified the hash match and accepted it as evidence.',
    relevance:
      'The pattern of hash, register, later verify was accepted as evidentiary method.',
  },
  {
    name: 'BearBox LLC v. Lancium LLC',
    court: 'US Court of Appeals, Federal Circuit',
    date: '13 January 2025',
    reference: 'No. 2023-1922',
    summary:
      'An inventor lost a joint inventorship claim because he lacked contemporaneous documents. The court held that testimony alone is insufficient; corroborating evidence such as contemporaneous documents is required.',
    relevance:
      'Illustrates the problem origin attestation solves. A timestamped hash of design documents before a meeting would have provided the contemporaneous evidence the court required.',
  },
];

const jurisdictions = [
  { jurisdiction: 'China', status: 'Accepted (2018)', source: 'Hangzhou Internet Court' },
  { jurisdiction: 'France', status: 'Accepted (2025)', source: 'Marseille + Art. 1358 Civil Code' },
  { jurisdiction: 'US: Vermont', status: 'Statutory', source: 'Act 157' },
  { jurisdiction: 'US: Arizona', status: 'Statutory', source: 'HB 2417' },
  { jurisdiction: 'US: Illinois', status: 'Statutory', source: 'HB 3575' },
  { jurisdiction: 'US: Ohio', status: 'Statutory', source: 'SB 220' },
  { jurisdiction: 'US: Washington', status: 'Statutory', source: 'SB 5638' },
  { jurisdiction: 'US: Federal', status: 'Evidentiary', source: 'FRE 902 (self-authenticating)' },
  { jurisdiction: 'Italy', status: 'Statutory', source: 'DL 135/2018' },
  { jurisdiction: 'Estonia', status: 'Operational', source: 'e-governance since 2012' },
  { jurisdiction: 'United Kingdom', status: 'Judicial precedent', source: "D'Aloia v. Persons Unknown (2022)" },
  { jurisdiction: 'Germany', status: 'Policy framework', source: 'Blockchain-Strategie (no specific ruling yet)' },
  { jurisdiction: 'Spain', status: 'Judicial precedent', source: 'STS 326/2019' },
  { jurisdiction: 'EU / eIDAS', status: 'Regulatory', source: 'Art. 41(1): non-qualified timestamps cannot be refused solely because they are not qualified' },
];

export default function Legal() {
  return (
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      {/* Header */}
      <header className="border-b border-landing-muted/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-landing-muted/50 hover:text-landing-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg text-landing-cream/80">Umarise</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">
            Legal Context
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            Origin Attestation as Evidence
          </p>
        </div>

        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Disclaimer */}
          <section className="p-5 border border-landing-muted/15 bg-landing-muted/5">
            <p className="text-landing-muted/60 text-sm leading-relaxed">
              Umarise is not a law firm and does not provide legal advice. This page presents publicly available case law and legislation for informational purposes. Consult a qualified attorney for legal guidance.
            </p>
          </section>

          {/* What an Origin Record proves */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-6">
              What an Origin Record proves
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-landing-muted/15">
                    <th className="text-left py-3 pr-6 text-landing-cream/80 font-medium">An origin proves</th>
                    <th className="text-left py-3 text-landing-cream/80 font-medium">An origin does NOT prove</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  <tr className="border-b border-landing-muted/8">
                    <td className="py-3 pr-6">These exact bytes existed at this specific time</td>
                    <td className="py-3">Who created the file</td>
                  </tr>
                  <tr className="border-b border-landing-muted/8">
                    <td className="py-3 pr-6">The hash is anchored in the Bitcoin blockchain</td>
                    <td className="py-3">That this is the first or only registration</td>
                  </tr>
                  <tr className="border-b border-landing-muted/8">
                    <td className="py-3 pr-6">The proof is independently verifiable without Umarise</td>
                    <td className="py-3">That the file is original or unique</td>
                  </tr>
                  <tr className="border-b border-landing-muted/8">
                    <td className="py-3 pr-6">Optional: someone with biometric access to a specific device claimed this</td>
                    <td className="py-3">The identity of that person</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-landing-muted/50 text-sm italic">
              An origin provides building blocks. A court builds the verdict.
            </p>
          </section>

          {/* Case Law */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-6">
              Case Law
            </h2>
            <div className="space-y-8">
              {caseLaw.map((c) => (
                <div key={c.reference} className="border-l-2 border-landing-copper/30 pl-5">
                  <h3 className="font-serif text-lg text-landing-cream/90 mb-1">{c.name}</h3>
                  <p className="text-xs text-landing-muted/50 mb-3">
                    {c.court}, {c.date}, {c.reference}
                  </p>
                  <p className="text-sm text-landing-muted/70 mb-3 leading-relaxed">{c.summary}</p>
                  <p className="text-sm text-landing-copper/70 leading-relaxed">
                    <span className="text-landing-muted/50 text-xs uppercase tracking-wider mr-2">Relevance:</span>
                    {c.relevance}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Jurisdictions */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-6">
              Jurisdictions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-landing-muted/15">
                    <th className="text-left py-3 pr-4 text-landing-cream/80 font-medium">Jurisdiction</th>
                    <th className="text-left py-3 pr-4 text-landing-cream/80 font-medium">Status</th>
                    <th className="text-left py-3 text-landing-cream/80 font-medium">Source</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  {jurisdictions.map((j) => (
                    <tr key={j.jurisdiction} className="border-b border-landing-muted/8">
                      <td className="py-2.5 pr-4 text-landing-cream/70">{j.jurisdiction}</td>
                      <td className="py-2.5 pr-4">{j.status}</td>
                      <td className="py-2.5 text-landing-muted/50 text-xs">{j.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-landing-muted/50 text-sm italic">
              No known court ruling has explicitly rejected blockchain evidence. The trend is unidirectional: increasing acceptance across jurisdictions.
            </p>
          </section>

          {/* Independent Verification */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-6">
              Independent Verification
            </h2>
            <p className="mb-4">
              Anyone can verify an origin independently, without Umarise software, account, or API key:
            </p>
            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4 font-mono text-xs text-landing-cream/70 leading-relaxed">
              <div>curl https://core.umarise.com/v1-core-proof/&#123;origin_id&#125; -o proof.ots</div>
              <div className="mt-1">ots verify proof.ots</div>
            </div>
            <p className="mt-4 text-landing-muted/60 text-sm">
              The <code className="text-landing-cream/60 bg-landing-muted/10 px-1.5 py-0.5 rounded text-xs">ots verify</code> command checks the cryptographic path from the hash to the Bitcoin blockchain. It requires no Umarise software, account, or API key.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">Contact</h2>
            <a
              href="mailto:partners@umarise.com"
              className="text-landing-copper/70 hover:text-landing-copper transition-colors"
            >
              partners@umarise.com
            </a>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
