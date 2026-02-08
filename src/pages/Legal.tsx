import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Umarise: Technical Description
 * 
 * Pure technical description of the Origin Record mechanism.
 * Seven sections, each describing a property. No argumentation, no interpretation.
 * 
 * Briefing: docs/lovable-briefing-legal-v3.md
 */

const dataModel = [
  { field: 'hash', type: 'text', description: 'SHA-256 hash of the original bytes' },
  { field: 'hash_algorithm', type: 'text', description: 'Always "sha256"' },
  { field: 'origin_id', type: 'text', description: '8-character hexadecimal identifier' },
  { field: 'created_at', type: 'timestamp', description: 'Server time when the hash was received' },
  { field: 'ots_proof', type: 'text', description: 'Base64-encoded .ots file (after Bitcoin confirmation)' },
  { field: 'ots_status', type: 'text', description: '"pending" or "verified"' },
  { field: 'bitcoin_block', type: 'integer', description: 'Block height (after confirmation)' },
  { field: 'user_id', type: 'uuid', description: 'Nullable. Present only if a passkey was used.' },
];

const chainSteps = [
  {
    label: 'Client',
    text: 'The submitting party computes the SHA-256 hash of the file locally. Only the hash is transmitted.',
  },
  {
    label: 'Server',
    text: 'The hash is recorded with a timestamp and assigned an origin_id. Status: "pending".',
  },
  {
    label: 'OpenTimestamps',
    text: 'The hash is submitted to OTS calendar servers. Calendar servers aggregate thousands of hashes into a Merkle tree.',
  },
  {
    label: 'Bitcoin',
    text: 'The Merkle root is written to a Bitcoin transaction. Confirmation takes 1 to 2 blocks (10 to 20 minutes).',
  },
  {
    label: 'Proof file',
    text: 'An .ots file is generated containing the complete cryptographic path from the original hash to the Bitcoin block. Status changes to "verified".',
  },
];

const scopeEstablished = [
  'These specific bytes existed at this specific time',
  'The hash is anchored in a Bitcoin block via OpenTimestamps',
  'The .ots proof file is independently verifiable',
  'The proof remains valid even if Umarise ceases to exist',
];

const scopeNotEstablished = [
  'Who created the file',
  'Whether this is the first or only attestation of these bytes',
  'Whether the content is original, unique, or novel',
  'Authorship, ownership, or legal status of the content',
];

const verificationEndpoints = [
  { endpoint: '/v1-core-resolve', purpose: 'Look up an attestation by origin_id' },
  { endpoint: '/v1-core-verify', purpose: 'Check whether a hash exists in the registry' },
  { endpoint: '/v1-core-proof', purpose: 'Retrieve the .ots proof file for a hash' },
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
        <div className="mb-12 md:mb-16">
          <p className="font-mono text-[10px] font-normal tracking-[4px] uppercase text-landing-copper/70 mb-3">
            umarise.com/legal
          </p>
          <h1 className="font-playfair font-light text-[28px] md:text-[32px] text-landing-cream leading-tight mb-2">
            Technical Description
          </h1>
          <p className="font-garamond text-base text-landing-muted/50 italic">
            What an Origin Record is, what it contains, and what it does not establish.
          </p>
        </div>

        {/* Section 1: What an Origin Record Is */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            What an Origin Record Is
          </h2>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mb-4">
            An Origin Record is a database entry that links a SHA-256 hash to a point in time. The hash is anchored in the Bitcoin blockchain via the OpenTimestamps protocol. The result is a cryptographic proof that specific bytes existed at a specific moment.
          </p>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70">
            An Origin Record does not contain the original file. It contains only the hash.
          </p>
        </section>

        {/* Section 2: Data Model */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            Data Model
          </h2>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mb-5">
            Each Origin Record consists of the following fields. No other data is stored.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-landing-copper/12">
                  <th className="text-left py-2.5 px-3 text-landing-copper/60 font-normal tracking-[2px] uppercase text-[10px]">Field</th>
                  <th className="text-left py-2.5 px-3 text-landing-copper/60 font-normal tracking-[2px] uppercase text-[10px]">Type</th>
                  <th className="text-left py-2.5 px-3 text-landing-copper/60 font-normal tracking-[2px] uppercase text-[10px]">Description</th>
                </tr>
              </thead>
              <tbody>
                {dataModel.map((row) => (
                  <tr key={row.field} className="border-b border-landing-copper/5">
                    <td className="py-2 px-3 text-landing-cream/70 whitespace-nowrap">{row.field}</td>
                    <td className="py-2 px-3 text-landing-muted/50">{row.type}</td>
                    <td className="py-2 px-3 text-landing-muted/50">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mt-5">
            There is no column for the original file, filename, file type, file size, or any metadata about the content. This is architectural: the system cannot store what it does not receive.
          </p>
        </section>

        {/* Section 3: Cryptographic Chain */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            Cryptographic Chain
          </h2>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mb-5">
            The path from bytes to Bitcoin follows these steps.
          </p>

          <div className="ml-0 pl-6 border-l border-landing-copper/12">
            {chainSteps.map((step, i) => (
              <div key={step.label} className={`relative pl-5 ${i < chainSteps.length - 1 ? 'pb-5' : ''}`}>
                {/* Dot on the line */}
                <div className="absolute -left-[4px] top-1.5 w-[7px] h-[7px] rounded-full bg-landing-copper/60" />
                <div className="font-mono text-[11px] text-landing-copper/60 tracking-[1px] mb-1">
                  {step.label}
                </div>
                <div className="font-garamond text-[15px] text-landing-cream/70 leading-relaxed">
                  {step.text}
                </div>
              </div>
            ))}
          </div>

          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mt-5">
            The .ots file is a standard OpenTimestamps format. It can be verified using{' '}
            <code className="font-mono text-[13px] text-landing-copper bg-landing-copper/5 px-1.5 py-0.5 rounded">opentimestamps.org</code>, the{' '}
            <code className="font-mono text-[13px] text-landing-copper bg-landing-copper/5 px-1.5 py-0.5 rounded">ots verify</code>{' '}
            command-line tool, or any Bitcoin full node.
          </p>
        </section>

        {/* Separator */}
        <div className="w-10 h-px bg-landing-copper/25 my-12" />

        {/* Section 4: Scope */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            Scope
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            {/* Established */}
            <div className="bg-landing-muted/5 border border-landing-copper/12 rounded-lg p-5">
              <h3 className="font-mono text-[10px] font-normal tracking-[3px] uppercase text-landing-copper mb-3.5">
                Established by the record
              </h3>
              <ul className="space-y-1">
                {scopeEstablished.map((item) => (
                  <li key={item} className="relative pl-4 font-garamond text-sm text-landing-muted/50 leading-relaxed">
                    <span className="absolute left-0 top-[9px] w-1.5 h-1.5 rounded-full bg-landing-copper/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Not established */}
            <div className="bg-landing-muted/5 border border-landing-copper/12 rounded-lg p-5">
              <h3 className="font-mono text-[10px] font-normal tracking-[3px] uppercase text-landing-muted/50 mb-3.5">
                Not established by the record
              </h3>
              <ul className="space-y-1">
                {scopeNotEstablished.map((item) => (
                  <li key={item} className="relative pl-4 font-garamond text-sm text-landing-muted/50 leading-relaxed">
                    <span className="absolute left-0 top-[9px] w-1.5 h-px bg-landing-cream/15" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70">
            An Origin Record provides building blocks. A court, arbitrator, or evaluating party draws conclusions from those building blocks in the context of a specific dispute.
          </p>
        </section>

        {/* Separator */}
        <div className="w-10 h-px bg-landing-copper/25 my-12" />

        {/* Section 5: Device Binding */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            Device Binding (Optional)
          </h2>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mb-4">
            A passkey can optionally be associated with an Origin Record. The passkey uses the WebAuthn standard and is bound to the device's secure enclave (TPM, Secure Enclave, or equivalent). A biometric gate (fingerprint, face recognition) is required for signing.
          </p>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mb-4">
            When present, a passkey establishes that someone with biometric access to a specific device claimed the record at the time of creation. It does not establish identity, name, or that a specific individual created the content. No username, email address, or sign-up is involved.
          </p>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70">
            The passkey is optional. Origin Records can be created without any device binding.
          </p>
        </section>

        {/* Separator */}
        <div className="w-10 h-px bg-landing-copper/25 my-12" />

        {/* Section 6: Trust Model */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            Trust Model
          </h2>

          <div className="bg-landing-muted/5 border border-landing-copper/12 rounded-lg p-6 mb-4">
            <h3 className="font-mono text-[10px] font-normal tracking-[3px] uppercase text-landing-copper/60 mb-3">
              Verifiable without trusting Umarise
            </h3>
            <p className="font-garamond text-[15px] leading-relaxed text-landing-cream/70">
              The timestamp. The .ots proof file contains the complete cryptographic path from the submitted hash to a Bitcoin transaction. This can be verified independently using open-source tools. Umarise is not required for verification.
            </p>
          </div>

          <div className="bg-landing-muted/5 border border-landing-copper/12 rounded-lg p-6">
            <h3 className="font-mono text-[10px] font-normal tracking-[3px] uppercase text-landing-copper/60 mb-3">
              Requires trusting Umarise
            </h3>
            <p className="font-garamond text-[15px] leading-relaxed text-landing-cream/70">
              Data intake: that the correct hash was recorded at the correct time. This trust requirement is reduced when the submitting party computes the SHA-256 hash on their own device before transmission, because in that configuration the submitting party controls the entire chain from bytes to Bitcoin.
            </p>
          </div>
        </section>

        {/* Separator */}
        <div className="w-10 h-px bg-landing-copper/25 my-12" />

        {/* Section 7: Verification */}
        <section className="mb-12">
          <h2 className="font-playfair font-normal text-xl text-landing-copper tracking-wide mb-4">
            Verification
          </h2>
          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mb-5">
            Any Origin Record can be verified through the public API without authentication.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-landing-copper/12">
                  <th className="text-left py-2.5 px-3 text-landing-copper/60 font-normal tracking-[2px] uppercase text-[10px]">Endpoint</th>
                  <th className="text-left py-2.5 px-3 text-landing-copper/60 font-normal tracking-[2px] uppercase text-[10px]">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {verificationEndpoints.map((row) => (
                  <tr key={row.endpoint} className="border-b border-landing-copper/5">
                    <td className="py-2 px-3 text-landing-cream/70 whitespace-nowrap">{row.endpoint}</td>
                    <td className="py-2 px-3 text-landing-muted/50">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-garamond text-[17px] leading-relaxed text-landing-cream/70 mt-5">
            These endpoints are public. No authentication, no sign-up, and no personally identifiable information is required to verify a record.
          </p>
        </section>

        {/* Footer disclaimer */}
        <footer className="mt-16 pt-6 border-t border-landing-copper/12">
          <p className="font-garamond text-[13px] text-landing-muted/50 leading-relaxed">
            This page describes the technical properties of the Origin Record mechanism. It does not constitute legal advice. The evidential value of an Origin Record depends on the jurisdiction, the nature of the dispute, and the evaluation of the adjudicating party.
          </p>
          <p className="font-mono text-[10px] text-landing-copper/50 tracking-[2px] mt-3">
            Document version 1.0, February 2026
          </p>
        </footer>
      </main>

      {/* Page footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
