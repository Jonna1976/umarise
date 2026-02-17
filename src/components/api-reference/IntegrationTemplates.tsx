import { useState } from 'react';
import { Download, Copy, Check, Code2, AlertTriangle, Search, Clock, Hash, FileWarning } from 'lucide-react';

type Lang = 'python' | 'node';

function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function CopyCmd({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
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

function DownloadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-[hsl(var(--landing-cream)/0.15)] bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.8)] text-sm font-mono hover:bg-[hsl(var(--landing-cream)/0.08)] hover:border-[hsl(var(--landing-cream)/0.25)] transition-colors"
    >
      <Download className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
      {label}
    </button>
  );
}

const TEMPLATES = {
  python: {
    sdk: { url: '/templates/umarise_integration.py', name: 'umarise_integration.py' },
    test: { url: '/templates/test_integration.py', name: 'test_integration.py' },
    commands: `mkdir ~/umarise-test
cp ~/Downloads/umarise_integration.py ~/umarise-test/
cp ~/Downloads/test_integration.py ~/umarise-test/
cd ~/umarise-test
python3 test_integration.py um_JOUW_API_KEY`,
  },
  node: {
    sdk: { url: '/templates/umarise-integration.js', name: 'umarise-integration.js' },
    test: { url: '/templates/test_integration_node.js', name: 'test_integration_node.js' },
    commands: `mkdir ~/umarise-test-node
cp ~/Downloads/umarise-integration.js ~/umarise-test-node/
cp ~/Downloads/test_integration_node.js ~/umarise-test-node/
cd ~/umarise-test-node
node test_integration_node.js um_JOUW_API_KEY`,
  },
} as const;

export default function IntegrationTemplates() {
  const [lang, setLang] = useState<Lang>('python');

  const t = TEMPLATES[lang];
  const singleLineCommands = t.commands.split('\n').join(' && ');

  return (
    <section id="templates" className="space-y-6">
      <div className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Integration Templates</h2>
        </div>

        {/* Language tabs */}
        <div className="flex gap-2 mb-8">
          {(['python', 'node'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
                lang === l
                  ? 'bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] border border-[hsl(var(--landing-copper)/0.3)]'
                  : 'bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.5)] border border-[hsl(var(--landing-cream)/0.08)] hover:text-[hsl(var(--landing-cream)/0.8)]'
              }`}
            >
              {l === 'python' ? 'Python' : 'Node.js'}
            </button>
          ))}
        </div>

        {/* Step 1: Download */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">1</span>
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">Download beide bestanden</h4>
            </div>

            <div className="flex flex-wrap gap-3 ml-9">
              <DownloadButton label={t.sdk.name} onClick={() => downloadFile(t.sdk.url, t.sdk.name)} />
              <DownloadButton label={t.test.name} onClick={() => downloadFile(t.test.url, t.test.name)} />
            </div>

            <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs ml-9">
              Dit zijn twee bestanden. Download ze allebei voordat je verdergaat.
            </p>
          </div>

          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 2: Copy & run */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">2</span>
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">Kopieer naar een werkmap en draai de test</h4>
            </div>

            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs ml-9 mb-2">
              Kopieer dit blok en plak het in je Terminal. Vervang <code className="text-[hsl(var(--landing-copper))]">um_JOUW_API_KEY</code> door je echte key.
            </p>

            <div className="relative ml-9">
              <CopyCmd text={singleLineCommands} />
              <pre className="bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)] rounded p-4 pr-20 text-xs font-mono text-[hsl(var(--landing-cream)/0.7)] overflow-x-auto whitespace-pre">
{t.commands}
              </pre>
            </div>

            <div className="ml-9 space-y-2">
              <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs">
                Je key begint met <code className="text-[hsl(var(--landing-copper))]">um_</code> — dezelfde key als bij de Quick Start curls.
              </p>

              {lang === 'python' && (
                <div className="flex items-start gap-2 p-3 rounded border border-[hsl(var(--landing-copper)/0.15)] bg-[hsl(var(--landing-copper)/0.04)]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
                  <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs">
                    <strong className="text-[hsl(var(--landing-cream)/0.7)]">macOS SSL-fout?</strong> Draai eenmalig:{' '}
                    <code className="text-[hsl(var(--landing-copper))]">/Applications/Python\ 3.xx/Install\ Certificates.command</code>{' '}
                    (check je versie met <code className="text-[hsl(var(--landing-copper))]">python3 --version</code>)
                  </p>
                </div>
              )}

              {lang === 'node' && (
                <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs">
                  Vereist Node 18+. Check met: <code className="text-[hsl(var(--landing-copper))]">node --version</code>
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-[hsl(var(--landing-cream)/0.06)]" />

          {/* Step 3: Expected result */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] flex items-center justify-center text-xs font-mono font-bold shrink-0">3</span>
              <h4 className="text-[hsl(var(--landing-cream)/0.9)] font-medium text-sm">Verwacht resultaat</h4>
            </div>

            <div className="ml-9 bg-[hsl(var(--landing-cream)/0.02)] border border-[hsl(var(--landing-cream)/0.06)] rounded p-4 space-y-2">
              <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm">
                Je ziet 15 tests draaien (~30 seconden).
              </p>
              <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm">
                Elke test toont <code className="text-[hsl(120,33%,65%)]">OK</code> of <code className="text-red-400">FAIL</code>.
              </p>
              <pre className="text-xs font-mono text-[hsl(120,33%,65%)] mt-2">
{`═══════════════════════════════════════════
  ✓ Alle 15 tests geslaagd. Template werkt.
═══════════════════════════════════════════`}
              </pre>
              <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-2">
                Als een test faalt: de foutmelding zegt precies wat er mis is.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FRAMEWORK EXAMPLES ─── */}
      <FrameworkExamples />

      {/* ─── TROUBLESHOOTING ─── */}
      <TroubleshootingSection />
    </section>
  );
}

/* ── Framework tabs ── */
type Framework = 'django' | 'flask' | 'express';

const FRAMEWORK_CODE: Record<Framework, { label: string; lang: string; code: string }> = {
  django: {
    label: 'Django',
    lang: 'python',
    code: `# views.py
import umarise_integration as umarise

umarise.API_KEY = "um_jouw_key"

def upload_thesis(request):
    file = request.FILES["thesis"]
    submission = Submission.objects.create(student=request.user, file=file)

    # Attesteer — 1 regel
    result = umarise.safe_attest(submission.file.path, str(submission.id))

    if result:
        umarise.track_anchor(result["origin_id"], str(submission.id))

    return JsonResponse({"id": submission.id})`,
  },
  flask: {
    label: 'Flask',
    lang: 'python',
    code: `# app.py
from flask import Flask, request, jsonify
import umarise_integration as umarise

app = Flask(__name__)
umarise.API_KEY = "um_jouw_key"

@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["document"]
    data = file.read()
    record_id = save_to_database(file.filename, data)

    # Attesteer — 1 regel
    result = umarise.attest_bytes(data, record_id)

    return jsonify({"record_id": record_id, "origin_id": result["origin_id"]})`,
  },
  express: {
    label: 'Express',
    lang: 'javascript',
    code: `// routes/upload.js
const um = require("./umarise-integration.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

um.API_KEY = "um_jouw_key";

app.post("/upload", upload.single("document"), async (req, res) => {
    const recordId = await db.documents.create({ file: req.file.path });

    // Attesteer — 1 regel
    const result = await um.safeAttest(req.file.path, String(recordId));

    if (result) um.trackAnchor(result.origin_id, String(recordId));

    res.json({ recordId, originId: result?.origin_id });
});`,
  },
};

function FrameworkExamples() {
  const [fw, setFw] = useState<Framework>('django');
  const current = FRAMEWORK_CODE[fw];

  return (
    <div id="frameworks" className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
      <div className="flex items-center gap-2 mb-2">
        <Code2 className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
        <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Zo gebruik je dit in je app</h2>
      </div>
      <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm mb-6">
        Elk voorbeeld toont hetzelfde patroon in ~10 regels: ontvang bestand → sla op → <code className="text-[hsl(var(--landing-copper))]">safe_attest()</code> → klaar.
      </p>

      {/* Framework tabs */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(FRAMEWORK_CODE) as Framework[]).map((key) => (
          <button
            key={key}
            onClick={() => setFw(key)}
            className={`px-4 py-2 rounded text-sm font-mono transition-colors ${
              fw === key
                ? 'bg-[hsl(var(--landing-copper)/0.15)] text-[hsl(var(--landing-copper))] border border-[hsl(var(--landing-copper)/0.3)]'
                : 'bg-[hsl(var(--landing-cream)/0.04)] text-[hsl(var(--landing-cream)/0.5)] border border-[hsl(var(--landing-cream)/0.08)] hover:text-[hsl(var(--landing-cream)/0.8)]'
            }`}
          >
            {FRAMEWORK_CODE[key].label}
          </button>
        ))}
      </div>

      <div className="relative">
        <CopyCmd text={current.code} />
        <pre className="bg-[hsl(var(--landing-cream)/0.03)] border border-[hsl(var(--landing-cream)/0.08)] rounded p-4 pr-20 text-xs font-mono text-[hsl(var(--landing-cream)/0.7)] overflow-x-auto whitespace-pre">
{current.code}
        </pre>
      </div>

      <p className="text-[hsl(var(--landing-cream)/0.4)] text-xs mt-4 italic">
        safe_attest() blokkeert je workflow nooit — als Umarise tijdelijk onbereikbaar is, logt het de fout en gaat je app gewoon door.
      </p>
    </div>
  );
}

/* ── Troubleshooting ── */
const FAILURE_MODES = [
  {
    icon: Search,
    title: 'Hash niet gevonden',
    code: 'NOT_FOUND',
    description: 'Dit exacte bestand is niet geattesteerd. Veelvoorkomende oorzaken:',
    bullets: [
      'Bestand opnieuw opgeslagen (Word/PDF editor voegt metadata toe)',
      'Bestand geconverteerd (.docx → .pdf)',
      'Alleen inhoud gehasht i.p.v. het volledige bestand',
    ],
    fix: 'Hash het originele, ongewijzigde bestand. Check: sha256sum bestand.pdf moet exact dezelfde hash geven als bij attestatie.',
  },
  {
    icon: Clock,
    title: 'Proof is pending',
    code: 'pending',
    description: 'Attestatie is geregistreerd. Bitcoin-verankering loopt (10-20 minuten).',
    bullets: [
      'Poll via GET /v1-core-resolve?origin_id=... elke 60 seconden',
      'Of gebruik track_anchor() uit de template',
      'proof_status gaat van "pending" → "anchored"',
    ],
    fix: 'Wacht 10-20 minuten. Na "anchored" is het bewijs definitief en onafhankelijk verifieerbaar.',
  },
  {
    icon: Hash,
    title: 'Verkeerd hash-formaat',
    code: 'INVALID_HASH_FORMAT',
    description: 'Hash moet SHA-256 zijn: 64 hexadecimale karakters, optioneel met sha256: prefix.',
    bullets: [
      'Geen MD5 (32 chars), geen SHA-1 (40 chars), geen base64',
    ],
    fix: 'Gebruik hash_file() / hashFile() uit de template — die retourneert altijd het juiste formaat.',
  },
  {
    icon: FileWarning,
    title: 'Verify toont een oudere attestatie',
    code: 'first-in-time',
    description: 'Verify retourneert de eerste attestatie voor een hash (first-in-time).',
    bullets: [
      'Bij een veelgebruikte test-hash zie je mogelijk een eerdere captured_at',
      'Dat is correct — het bewijst dat die hash al eerder bestond',
      'Met een eigen, uniek bestand zie je altijd je eigen attestatie',
    ],
    fix: null,
  },
];

function TroubleshootingSection() {
  return (
    <div id="troubleshooting" className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
        <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Veelvoorkomende situaties</h2>
      </div>

      <div className="space-y-4">
        {FAILURE_MODES.map((mode) => (
          <div key={mode.code} className="border border-[hsl(var(--landing-cream)/0.06)] rounded-lg p-4 bg-[hsl(var(--landing-cream)/0.02)]">
            <div className="flex items-center gap-2 mb-2">
              <mode.icon className="w-4 h-4 text-[hsl(var(--landing-copper))] shrink-0" />
              <h3 className="text-sm font-medium text-[hsl(var(--landing-cream)/0.9)]">{mode.title}</h3>
              <code className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-[hsl(var(--landing-cream)/0.05)] text-[hsl(var(--landing-cream)/0.4)]">
                {mode.code}
              </code>
            </div>
            <p className="text-[hsl(var(--landing-cream)/0.5)] text-xs mb-2">{mode.description}</p>
            <ul className="space-y-1 ml-4 mb-2">
              {mode.bullets.map((b, i) => (
                <li key={i} className="text-[hsl(var(--landing-cream)/0.4)] text-xs list-disc">{b}</li>
              ))}
            </ul>
            {mode.fix && (
              <p className="text-xs text-[hsl(var(--landing-copper)/0.8)] mt-2">
                → {mode.fix}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-[hsl(var(--landing-cream)/0.1)]">
              <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-medium">Situatie</th>
              <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-medium">Error</th>
              <th className="text-left py-2 text-[hsl(var(--landing-cream)/0.5)] font-medium">Actie</th>
            </tr>
          </thead>
          <tbody className="text-[hsl(var(--landing-cream)/0.6)]">
            <tr className="border-b border-[hsl(var(--landing-cream)/0.04)]">
              <td className="py-2">Hash niet gevonden</td>
              <td className="py-2 text-[hsl(var(--landing-copper))]">NOT_FOUND</td>
              <td className="py-2">Hash het originele bestand</td>
            </tr>
            <tr className="border-b border-[hsl(var(--landing-cream)/0.04)]">
              <td className="py-2">Proof nog niet klaar</td>
              <td className="py-2 text-[hsl(var(--landing-copper))]">pending</td>
              <td className="py-2">Wacht 10-20 min, poll resolve</td>
            </tr>
            <tr>
              <td className="py-2">Verkeerd formaat</td>
              <td className="py-2 text-[hsl(var(--landing-copper))]">INVALID_HASH_FORMAT</td>
              <td className="py-2">Gebruik hash_file()/hashFile()</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
