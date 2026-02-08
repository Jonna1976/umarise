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
  { field: 'ots_status', type: 'text', description: '"pending" or "anchored"' },
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
    label: 'Batch aggregation',
    text: 'A background worker collects pending hashes and aggregates them into a Merkle tree.',
  },
  {
    label: 'OpenTimestamps',
    text: 'The Merkle root of the batch is submitted to OTS calendar servers.',
  },
  {
    label: 'Bitcoin',
    text: 'The Merkle root is embedded in a Bitcoin transaction. Confirmation takes 1 to 2 blocks (10 to 20 minutes).',
  },
  {
    label: 'Proof file',
    text: 'An .ots file is generated containing the complete cryptographic path from the original hash to the Bitcoin block. Status changes to "anchored".',
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
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">
            Technical Description
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            What an Origin Record is, what it contains, and what it does not establish
          </p>
        </div>

        {/* Document content */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">

          {/* Section 1: What an Origin Record Is */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              What an Origin Record Is
            </h2>
            <p className="text-landing-cream/90 mb-4">
              An Origin Record is a database entry that links a SHA-256 hash to a point in time. The hash is anchored in the Bitcoin blockchain via the OpenTimestamps protocol. The result is a cryptographic proof that specific bytes existed at a specific moment.
            </p>
            <p>
              An Origin Record does not contain the original file. It contains only the hash.
            </p>
          </section>

          {/* Section 2: Data Model */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Data Model
            </h2>
            <p className="mb-4">
              Each Origin Record consists of the following fields. No other data is stored.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Field</th>
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Type</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  {dataModel.map((row) => (
                    <tr key={row.field} className="border-b border-landing-muted/10">
                      <td className="py-2 pr-4 text-landing-copper whitespace-nowrap">{row.field}</td>
                      <td className="py-2 pr-4 text-landing-muted/50">{row.type}</td>
                      <td className="py-2">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-landing-muted/50 text-sm">
              There is no column for the original file, filename, file type, file size, or any metadata about the content. This is architectural: the system cannot store what it does not receive.
            </p>
          </section>

          {/* Section 3: Cryptographic Chain */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Cryptographic Chain
            </h2>
            <p className="mb-4">
              The path from bytes to Bitcoin follows these steps.
            </p>

            <ul className="space-y-4 pl-4">
              {chainSteps.map((step) => (
                <li key={step.label}>
                  <span className="text-landing-copper">{step.label}</span>
                  <span className="text-landing-muted/50 ml-2">:</span>
                  <span className="ml-2">{step.text}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4">
              The .ots file is a standard OpenTimestamps format. It can be verified using{' '}
              <code className="font-mono text-sm text-landing-copper">opentimestamps.org</code>, the{' '}
              <code className="font-mono text-sm text-landing-copper">ots verify</code>{' '}
              command-line tool, or any Bitcoin full node.
            </p>
          </section>

          {/* Section 4: Scope */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Scope
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
              {/* Established */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <h3 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-3">
                  Established by the record
                </h3>
                <ul className="space-y-1 text-landing-muted/70">
                  {scopeEstablished.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Not established */}
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <h3 className="text-sm font-medium tracking-wide text-landing-muted/50 uppercase mb-3">
                  Not established by the record
                </h3>
                <ul className="space-y-1 text-landing-muted/60">
                  {scopeNotEstablished.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-landing-cream/70">
              An Origin Record provides building blocks. A court, arbitrator, or evaluating party draws conclusions from those building blocks in the context of a specific dispute.
            </p>
          </section>

          {/* Section 5: Device Binding */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Device Binding (Optional)
            </h2>
            <p className="mb-4">
              A passkey can optionally be associated with an Origin Record. The passkey uses the WebAuthn standard and is bound to the device's secure enclave (TPM, Secure Enclave, or equivalent). A biometric gate (fingerprint, face recognition) is required for signing.
            </p>
            <p className="mb-4">
              When present, a passkey establishes that someone with biometric access to a specific device claimed the record at the time of creation. It does not establish identity, name, or that a specific individual created the content. No username, email address, or sign-up is involved.
            </p>
            <p className="text-landing-muted/60">
              The passkey is optional. Origin Records can be created without any device binding.
            </p>
          </section>

          {/* Section 6: Trust Model */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Trust Model
            </h2>

            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4 mb-4">
              <h3 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-3">
                Verifiable without trusting Umarise
              </h3>
              <p className="text-landing-muted/70">
                The timestamp. The .ots proof file contains the complete cryptographic path from the submitted hash to a Bitcoin transaction. This can be verified independently using open-source tools. Umarise is not required for verification.
              </p>
            </div>

            <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
              <h3 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-3">
                Requires trusting Umarise
              </h3>
              <p className="text-landing-muted/70">
                Data intake: that the correct hash was recorded at the correct time. This trust requirement is reduced when the submitting party computes the SHA-256 hash on their own device before transmission, because in that configuration the submitting party controls the entire chain from bytes to Bitcoin.
              </p>
            </div>
          </section>

          {/* Section 7: Independent Verification */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Independent Verification
            </h2>
            <p className="mb-4">
              A third party who receives a file and its certificate can verify the origin independently. Two scenarios apply, depending on the anchoring status at the time the file was shared.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <h3 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-3">
                  Origin anchored at time of sharing
                </h3>
                <p className="text-landing-muted/70">
                  The .ots proof file is included in the ZIP. The third party has everything needed for independent verification: original file, certificate, and cryptographic proof.
                </p>
              </div>

              <div className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                <h3 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-3">
                  Origin pending at time of sharing
                </h3>
                <p className="text-landing-muted/70">
                  The .ots proof file is not yet available. The third party has the original file and certificate containing the origin_id. Once Bitcoin anchoring is complete, the third party retrieves the .ots file via{' '}
                  <code className="font-mono text-sm text-landing-copper">umarise.com/verify</code>{' '}
                  using the origin_id from the certificate, or directly via the{' '}
                  <code className="font-mono text-sm text-landing-copper">/v1-core-proof</code>{' '}
                  endpoint.
                </p>
              </div>
            </div>

            <p className="text-landing-cream/70">
              In both cases, final verification requires only the original file, the .ots proof, and a Bitcoin node or standard OTS tooling. No contact with Umarise is required.
            </p>
          </section>

          {/* Section 8: API Endpoints */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Verification Endpoints
            </h2>
            <p className="mb-4">
              Any Origin Record can be verified through the public API without authentication.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-landing-muted/20">
                    <th className="text-left py-2 pr-4 text-landing-muted/50 font-medium">Endpoint</th>
                    <th className="text-left py-2 text-landing-muted/50 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-landing-muted/70">
                  {verificationEndpoints.map((row) => (
                    <tr key={row.endpoint} className="border-b border-landing-muted/10">
                      <td className="py-2 pr-4 text-landing-copper whitespace-nowrap">{row.endpoint}</td>
                      <td className="py-2">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-landing-muted/50 text-sm">
              These endpoints are public. No authentication, no sign-up, and no personally identifiable information is required to verify a record.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="border-t border-landing-muted/10 pt-12">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Disclaimer
            </h2>
            <p className="text-landing-muted/60">
              This page describes the technical properties of the Origin Record mechanism. It does not constitute legal advice. The evidential value of an Origin Record depends on the jurisdiction, the nature of the dispute, and the evaluation of the adjudicating party.
            </p>
            <p className="text-landing-muted/50 text-sm mt-4">
              Document version 1.0, February 2026
            </p>
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
