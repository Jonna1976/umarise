import { useState } from 'react';
import { Zap, Copy, Check, Terminal } from 'lucide-react';
import { HighlightedCode } from './SyntaxHighlight';

const BASE = 'https://core.umarise.com';



/** Copy button: copies single-line version of a command */
function CopyCmd({ singleLine }: { singleLine: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(singleLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-[hsl(var(--landing-cream)/0.12)] text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream)/0.8)] hover:border-[hsl(var(--landing-cream)/0.25)] transition-colors bg-[hsl(var(--landing-deep)/0.8)]"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

interface StepProps {
  number: string;
  title: string;
  /** Displayed in the code block (multi-line for readability) */
  display: string;
  /** What the copy button actually copies (single-line, no backslashes) */
  singleLine: string;
  expected: string;
  note?: string;
}

function Step({ number, title, display, singleLine, expected, note }: StepProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">
          {number}
        </span>
        <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">{title}</h4>
      </div>

      <div className="relative">
        <CopyCmd singleLine={singleLine} />
        <pre className="bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)] rounded p-4 pr-20 text-xs font-mono text-[hsl(var(--landing-cream)/0.7)] overflow-x-auto whitespace-pre">
<HighlightedCode code={display} />
        </pre>
      </div>

      <div className="bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--landing-cream)/0.35)] mb-1">Verwacht</p>
        <pre className="text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] whitespace-pre-wrap">{expected}</pre>
      </div>

      {note && (
        <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs leading-relaxed pl-9">{note}</p>
      )}
    </div>
  );
}

export default function QuickStartSection() {
  return (
    <section id="quick-start" className="space-y-8">
      <div className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Quick Start</h2>
          <span className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono ml-auto">60 seconden tot eerste attestatie</span>
        </div>

        <div className="flex items-start gap-3 p-3 rounded border border-[hsl(var(--landing-copper)/0.2)] bg-[hsl(var(--landing-copper)/0.05)] mb-8">
          <Zap className="w-4 h-4 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-[hsl(var(--landing-cream)/0.7)]">
              Vereisten: <code className="text-[hsl(var(--landing-copper))]">curl</code> + een <strong className="text-[hsl(var(--landing-cream))]">API key</strong>.
            </p>
            <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-1">
              Nog geen key? Mail <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:underline">partners@umarise.com</a> — response binnen 24 uur.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Step 1 */}
          <Step
            number="1"
            title="Check of de API draait"
            display={`curl ${BASE}/v1-core-health`}
            singleLine={`curl ${BASE}/v1-core-health`}
            expected={`{"status":"operational","version":"v1","timestamp":"..."}`}
          />

          {/* Divider */}
          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 2 */}
          <Step
            number="2"
            title="Maak je eerste attestatie aan"
            display={`curl -X POST ${BASE}/v1-core-origins \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Key: JOUW_KEY' \\
  -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
            singleLine={`curl -X POST ${BASE}/v1-core-origins -H 'Content-Type: application/json' -H 'X-API-Key: JOUW_KEY' -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
            expected={`{"origin_id":"...","hash":"sha256:e3b0c44...","hash_algo":"sha256","captured_at":"...","proof_status":"pending"}`}
            note='Test-hash: SHA-256 van een leeg bestand. Eigen bestand hashen: sha256sum bestand.pdf (Linux) of shasum -a 256 bestand.pdf (macOS). Pending = bewijs wordt verankerd (10–20 min). Herhaal stap 3 daarna — proof_status verandert van "pending" naar "anchored".'
          />

          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 3 */}
          <Step
            number="3"
            title="Bekijk je attestatie"
            display={`curl '${BASE}/v1-core-resolve?origin_id=PLAK_ORIGIN_ID'`}
            singleLine={`curl '${BASE}/v1-core-resolve?origin_id=PLAK_ORIGIN_ID'`}
            expected={`{"origin_id":"...","hash":"sha256:...","hash_algo":"sha256","captured_at":"...","proof_status":"pending|anchored"}`}
            note="Gebruik de origin_id uit de response van stap 2."
          />

          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 4 */}
          <Step
            number="4"
            title="Verifieer een hash"
            display={`curl -X POST ${BASE}/v1-core-verify \\
  -H 'Content-Type: application/json' \\
  -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
            singleLine={`curl -X POST ${BASE}/v1-core-verify -H 'Content-Type: application/json' -d '{"hash":"sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}'`}
            expected={`{"origin_id":"...","hash":"sha256:e3b0c44...","hash_algo":"sha256","captured_at":"...","proof_status":"anchored"}`}
            note='Verify retourneert de eerste attestatie voor deze hash (first-in-time resolutie). Bij de test-hash zie je mogelijk een eerdere captured_at met proof_status "anchored" — dat is correct: de hash bestond al. Met een eigen bestand zie je je eigen attestatie.'
          />
        </div>

        {/* Done */}
        <div className="mt-8 pt-6 border-t border-[hsl(var(--landing-cream)/0.08)]">
          <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm font-medium mb-3">
            ✓ Klaar. Je eerste attestatie is aangemaakt.
          </p>
          <div className="space-y-2 text-xs text-[hsl(var(--landing-cream)/0.4)]">
            <p className="font-mono">Volgende stappen:</p>
            <div className="flex flex-wrap gap-3">
              <a href="#templates" className="text-[hsl(var(--landing-copper))] hover:underline font-mono">→ SDK Node.js</a>
              <a href="#templates" className="text-[hsl(var(--landing-copper))] hover:underline font-mono">→ SDK Python</a>
              <a href="#health" className="text-[hsl(var(--landing-copper))] hover:underline font-mono">→ Volledige API Reference ↓</a>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary: link to templates */}
      <div className="flex items-center justify-between p-4 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.01)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[hsl(var(--landing-cream)/0.4)]" />
          <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs font-mono">
            Verder integreren? → Scroll naar Templates voor Python en Node.js SDK's met 15 automatische tests.
          </p>
        </div>
        <a
          href="#templates"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[hsl(var(--landing-cream)/0.5)] hover:text-[hsl(var(--landing-cream))] bg-[hsl(var(--landing-cream)/0.04)] hover:bg-[hsl(var(--landing-cream)/0.08)] transition-colors"
        >
          → Templates
        </a>
      </div>
    </section>
  );
}
