import PageHeader from '@/components/PageHeader';
import { Fingerprint, Shield, UserCheck, Database, EyeOff, Bot, CheckCircle2, XCircle } from 'lucide-react';

/**
 * /passkey — Explains the three-layer trust model and what is stored/verifiable per layer.
 * Audience: non-technical stakeholders who want to understand passkey signing.
 */

interface LayerCardProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  proves: string;
  stored: string[];
  notStored: string[];
  machineCanDo: boolean;
  machineExplain: string;
  verifiableWithoutUs: boolean;
  verifyExplain: string;
  flow: { label: string; arrow?: boolean }[];
  certificateFields?: string[];
}

function LayerCard({
  number, title, icon, proves, stored, notStored,
  machineCanDo, machineExplain, verifiableWithoutUs, verifyExplain,
  flow, certificateFields,
}: LayerCardProps) {
  return (
    <section className="border border-[hsl(var(--landing-cream)/0.08)] rounded-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] font-mono text-sm font-bold">
          {number}
        </span>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-serif text-xl text-[hsl(var(--landing-cream))]">{title}</h2>
        </div>
      </div>

      {/* Proves */}
      <p className="text-[hsl(var(--landing-cream))] text-sm mb-6">
        <span className="text-[hsl(var(--landing-copper))] font-mono text-xs uppercase tracking-wider">Bewijst: </span>
        {proves}
      </p>

      {/* Flow */}
      <div className="flex flex-wrap items-center gap-2 mb-6 font-mono text-xs">
        {flow.map((step, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.8)] border border-[hsl(var(--landing-cream)/0.06)]">
              {step.label}
            </span>
            {step.arrow && <span className="text-[hsl(var(--landing-copper))]">→</span>}
          </span>
        ))}
      </div>

      {/* Two columns: stored / not stored */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-3.5 h-3.5 text-[hsl(var(--landing-copper))]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.6)]">Opgeslagen</span>
          </div>
          <ul className="space-y-1">
            {stored.map((item) => (
              <li key={item} className="text-sm text-[hsl(var(--landing-cream)/0.85)] flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span className="font-mono text-xs">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.4)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.6)]">Niet opgeslagen</span>
          </div>
          <ul className="space-y-1">
            {notStored.map((item) => (
              <li key={item} className="text-sm text-[hsl(var(--landing-cream)/0.5)] flex items-start gap-2">
                <span className="text-red-400/60 mt-0.5">•</span>
                <span className="font-mono text-xs">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Certificate fields */}
      {certificateFields && certificateFields.length > 0 && (
        <div className="mb-6">
          <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.6)] block mb-2">
            In certificate.json (.proof bundle)
          </span>
          <div className="flex flex-wrap gap-2">
            {certificateFields.map((field) => (
              <code key={field} className="px-2 py-1 rounded bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-copper))] text-xs border border-[hsl(var(--landing-cream)/0.06)]">
                {field}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Machine + verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-2 px-3 py-2 rounded bg-[hsl(var(--landing-cream)/0.02)]">
          <Bot className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--landing-cream)/0.5)]" />
          <div>
            <div className="flex items-center gap-1.5">
              {machineCanDo
                ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                : <XCircle className="w-3.5 h-3.5 text-emerald-400" />
              }
              <span className="text-xs font-mono text-[hsl(var(--landing-cream)/0.8)]">
                Machine kan dit: {machineCanDo ? 'JA' : 'NEE'}
              </span>
            </div>
            <p className="text-[10px] text-[hsl(var(--landing-cream)/0.45)] mt-0.5">{machineExplain}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 px-3 py-2 rounded bg-[hsl(var(--landing-cream)/0.02)]">
          <Shield className="w-4 h-4 mt-0.5 shrink-0 text-[hsl(var(--landing-cream)/0.5)]" />
          <div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-[hsl(var(--landing-cream)/0.8)]">
                Verifieerbaar zonder Umarise: JA
              </span>
            </div>
            <p className="text-[10px] text-[hsl(var(--landing-cream)/0.45)] mt-0.5">{verifyExplain}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Passkey() {
  return (
    <div className="min-h-screen bg-[hsl(var(--landing-deep))] text-[hsl(var(--landing-cream))]">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl md:text-4xl mb-3 text-[hsl(var(--landing-cream))]">
          Three Layers of Trust
        </h1>
        <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-4 max-w-xl leading-relaxed">
          Anchoring bewijst bestaan. Device signing bewijst aanwezigheid op het apparaat. Attestatie bewijst identiteit.
          Elke laag is onafhankelijk verifieerbaar en geen enkele laag vereist dat Umarise blijft bestaan.
        </p>
        <p className="text-[hsl(var(--landing-cream)/0.45)] text-xs font-mono mb-12">
          Geen biometrie, geen private keys, geen bestanden, geen identiteitsdocumenten opgeslagen. Niet als beleid. Als architectuur.
        </p>

        <div className="space-y-6">
          {/* Layer 1 */}
          <LayerCard
            number={1}
            title="Anchoring"
            icon={<Shield className="w-5 h-5 text-[hsl(var(--landing-copper))]" />}
            proves="Deze bytes bestonden op dit moment."
            flow={[
              { label: 'Bestand (bytes)', arrow: true },
              { label: 'SHA-256 hash', arrow: true },
              { label: 'Bitcoin blockchain', arrow: true },
              { label: '.ots proof' },
            ]}
            stored={['hash (SHA-256)', 'origin_id (UUID)', 'captured_at (ISO 8601)', 'hash_algo ("SHA-256")']}
            notStored={['Bestand / bytes', 'Bestandsnaam', 'Inhoud', 'IP-adres']}
            machineCanDo={true}
            machineExplain="Elk script kan een hash berekenen en anchoren via de API."
            verifiableWithoutUs={true}
            verifyExplain="SHA-256 + Bitcoin blockchain + OpenTimestamps. Standaard tooling."
            certificateFields={['hash', 'hash_algo', 'origin_id', 'captured_at', 'proof_status']}
          />

          {/* Layer 2 */}
          <LayerCard
            number={2}
            title="Device Signing (Passkey)"
            icon={<Fingerprint className="w-5 h-5 text-[hsl(var(--landing-copper))]" />}
            proves="Een persoon met fysieke toegang tot dit apparaat heeft dit bevestigd via biometrische activatie op het apparaat zelf."
            flow={[
              { label: 'Biometrie (lokaal)', arrow: true },
              { label: 'Passkey ontgrendelt private key', arrow: true },
              { label: 'Ondertekent hash', arrow: true },
              { label: 'Signature + public key' },
            ]}
            stored={[
              'device_signed: true/false (boolean)',
              'device_public_key (SPKI, base64url)',
              'device_signature (base64url)',
              'sig_algorithm ("WebAuthn_ECDSA_P256_SHA256")',
            ]}
            notStored={[
              'Biometrie (vingerafdruk, gezicht)',
              'Private key (verlaat nooit het apparaat)',
              'Device ID / serienummer / IMEI',
              'Naam, email, IP',
            ]}
            machineCanDo={false}
            machineExplain="WebAuthn vereist biometrische verificatie (Face ID, vingerafdruk) of PIN op het fysieke apparaat."
            verifiableWithoutUs={true}
            verifyExplain="WebAuthn is een W3C standaard. Public key + signature zijn cryptografisch verifieerbaar met standaard libraries."
            certificateFields={['device_signature', 'device_public_key', 'sig_algorithm', 'identity_binding.level ("L1")']}
          />

          {/* Layer 3 */}
          <LayerCard
            number={3}
            title="Attestatie (Guardian Proof)"
            icon={<UserCheck className="w-5 h-5 text-[hsl(var(--landing-copper))]" />}
            proves="Deze specifieke persoon deed dit."
            flow={[
              { label: 'Externe attestant', arrow: true },
              { label: 'Verifieert identiteit', arrow: true },
              { label: 'Verklaart: public key = persoon' },
            ]}
            stored={[
              'attestant_name',
              'attestant_public_key',
              'attestant_certificate',
              'signature (attestant)',
            ]}
            notStored={[
              'Identiteitsdocumenten (paspoort, ID)',
              'Persoonlijke gegevens van de gebruiker',
              'KYC sessie-opnames',
            ]}
            machineCanDo={false}
            machineExplain="Vereist een menselijke, gecertificeerde attestant die de identiteit verifieert."
            verifiableWithoutUs={true}
            verifyExplain="Het attestatie-certificaat zit in de .proof bundle en is onafhankelijk verifieerbaar."
            certificateFields={['attestation_included', 'identity_binding.level ("L2" / "L3")', 'identity_binding.issuer_type']}
          />
        </div>

        {/* Summary table */}
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
                <th className="text-left py-3 pr-4 text-[hsl(var(--landing-cream)/0.5)] font-normal"></th>
                <th className="text-left py-3 px-3 text-[hsl(var(--landing-copper))] font-normal">L1 Anchoring</th>
                <th className="text-left py-3 px-3 text-[hsl(var(--landing-copper))] font-normal">L2 Device Signing</th>
                <th className="text-left py-3 px-3 text-[hsl(var(--landing-copper))] font-normal">L3 Attestatie</th>
              </tr>
            </thead>
            <tbody className="text-[hsl(var(--landing-cream)/0.8)]">
              <tr className="border-b border-[hsl(var(--landing-cream)/0.05)]">
                <td className="py-2.5 pr-4 text-[hsl(var(--landing-cream)/0.5)]">Bewijst</td>
                <td className="py-2.5 px-3">Bytes bestonden op moment X</td>
                <td className="py-2.5 px-3">Aanwezigheid op dit apparaat</td>
                <td className="py-2.5 px-3">Deze persoon deed dit</td>
              </tr>
              <tr className="border-b border-[hsl(var(--landing-cream)/0.05)]">
                <td className="py-2.5 pr-4 text-[hsl(var(--landing-cream)/0.5)]">Machine?</td>
                <td className="py-2.5 px-3 text-amber-400">Ja</td>
                <td className="py-2.5 px-3 text-emerald-400">Nee</td>
                <td className="py-2.5 px-3 text-emerald-400">Nee</td>
              </tr>
              <tr className="border-b border-[hsl(var(--landing-cream)/0.05)]">
                <td className="py-2.5 pr-4 text-[hsl(var(--landing-cream)/0.5)]">Zonder ons?</td>
                <td className="py-2.5 px-3 text-emerald-400">Bitcoin + SHA-256</td>
                <td className="py-2.5 px-3 text-emerald-400">WebAuthn standaard</td>
                <td className="py-2.5 px-3 text-emerald-400">Certificaat in .proof</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[hsl(var(--landing-cream)/0.5)]">Afhankelijk?</td>
                <td className="py-2.5 px-3 text-emerald-400">Nee</td>
                <td className="py-2.5 px-3 text-emerald-400">Nee</td>
                <td className="py-2.5 px-3 text-emerald-400">Nee</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key insight */}
        <div className="mt-10 p-5 rounded-lg border border-[hsl(var(--landing-copper)/0.2)] bg-[hsl(var(--landing-copper)/0.03)]">
          <p className="text-sm text-[hsl(var(--landing-cream))] leading-relaxed">
            <strong className="text-[hsl(var(--landing-copper))]">Kernprincipe:</strong>{' '}
            Layer 1 bewijst bestaan, niet wie. Layer 2 sluit machines uit maar identificeert niet.
            Layer 3 koppelt het aan een persoon. Elke laag voegt vertrouwen toe, maar geen enkele
            laag vereist dat Umarise blijft bestaan.
          </p>
        </div>

        {/* How it flows into the .proof bundle */}
        <div className="mt-10">
          <h2 className="font-serif text-xl mb-4 text-[hsl(var(--landing-cream))]">
            In de .proof bundle
          </h2>
          <div className="bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 font-mono text-xs text-[hsl(var(--landing-cream)/0.8)] leading-relaxed">
            <pre>{`document.pdf.proof (ZIP)
├── certificate.json      ← L1 + L2 + L3 metadata
│   ├── hash              ← L1: SHA-256 fingerprint
│   ├── origin_id         ← L1: unieke identifier
│   ├── captured_at       ← L1: tijdstempel
│   ├── device_signed     ← L2: boolean
│   ├── device_public_key ← L2: SPKI public key
│   ├── device_signature  ← L2: WebAuthn handtekening
│   ├── sig_algorithm     ← L2: "WebAuthn_ECDSA_P256_SHA256"
│   ├── identity_binding  ← L2/L3: assurance level
│   └── attestation_*     ← L3: attestant certificaat
├── proof.ots             ← L1: Bitcoin-verankering (binary)
└── VERIFY.txt            ← verificatie-instructies`}</pre>
          </div>
        </div>

        {/* Analogy */}
        <div className="mt-10 p-5 rounded-lg bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)]">
          <h3 className="font-serif text-lg mb-3 text-[hsl(var(--landing-cream))]">Vergelijking</h3>
          <p className="text-sm text-[hsl(var(--landing-cream)/0.7)] leading-relaxed">
            Vergelijk het met een notaris: de notaris bewijst niet dat wat je zegt <em>waar</em> is.
            De notaris bewijst dat <em>jij</em> het zei, <em>op dat moment</em>, en dat je het later
            niet kunt ontkennen. Anchoring is de tijdstempel. De passkey is de handtekening.
            De attestant is de notaris.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-[hsl(var(--landing-muted)/0.1)] text-[hsl(var(--landing-muted))] text-xs">
          Geen biometrie opgeslagen. Geen private keys opgeslagen. Geen bestanden opgeslagen.
        </footer>
      </main>
    </div>
  );
}