import { useEffect } from "react";

const SdkSpec = () => {
  useEffect(() => {
    document.title = "@umarise/anchor — SDK Specification";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16 font-sans">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4 font-mono">
            @umarise/anchor
          </h1>
          <p className="text-lg text-muted-foreground mb-6">SDK Specification</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Version: 1.0.0</span>
            <span>Status: Draft for partner onboarding</span>
            <span>Date: 2026-03-01</span>
          </div>
        </header>

        <hr className="border-border mb-10" />

        {/* Wat het is */}
        <Section title="Wat het is">
          <P>
            Een npm package die de Umarise Core v1 REST API wrapt in drie functies.
            <br />
            Geen magie. Geen abstractie. Alleen minder boilerplate.
          </P>
          <Code>npm install @umarise/anchor</Code>
        </Section>

        {/* API Surface */}
        <Section title="API Surface">
          {/* anchor() */}
          <H3>anchor(hash, options?) → Promise&lt;AnchorResult&gt;</H3>
          <P>Registreer een hash in het Umarise-register.</P>
          <Code lang="typescript">{`import { anchor } from '@umarise/anchor';

const result = await anchor('sha256:a7f3b2c1e4d5...', {
  apiKey: 'um_live_...',
});

// result:
// {
//   originId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
//   hash: "sha256:a7f3b2c1e4d5...",
//   capturedAt: "2026-03-01T14:30:00Z",
//   proofStatus: "pending"
// }`}</Code>

          <H4>Parameters</H4>
          <Table
            headers={["Parameter", "Type", "Required", "Description"]}
            rows={[
              ["hash", "string", "✅", "SHA-256 hash. Accepteert sha256:hex of raw 64-char hex."],
              ["options.apiKey", "string", "✅", "Partner API key (um_live_... of um_test_...)."],
              ["options.baseUrl", "string", "—", "Override API endpoint. Default: https://core.umarise.com"],
              ["options.timeout", "number", "—", "Timeout in ms. Default: 12000"],
            ]}
          />

          <H4>Returns: AnchorResult</H4>
          <Code lang="typescript">{`interface AnchorResult {
  originId: string;       // UUID — permanent identifier
  hash: string;           // Normalized sha256:hex
  capturedAt: string;     // ISO 8601 timestamp
  proofStatus: 'pending'; // Always 'pending' at creation
}`}</Code>

          <H4>Errors</H4>
          <Table
            headers={["Code", "HTTP", "Meaning"]}
            rows={[
              ["DUPLICATE_HASH", "409", "Hash already registered"],
              ["INVALID_HASH", "400", "Not a valid SHA-256 hash"],
              ["UNAUTHORIZED", "401", "Missing or invalid API key"],
              ["RATE_LIMITED", "429", "Too many requests. retryAfter field included."],
            ]}
          />

          <hr className="border-border my-8" />

          {/* verify() */}
          <H3>verify(hash, options?) → Promise&lt;VerifyResult | null&gt;</H3>
          <P>
            Controleer of een hash bestaat in het register. <strong>Geen API key nodig.</strong>
          </P>
          <Code lang="typescript">{`import { verify } from '@umarise/anchor';

const result = await verify('sha256:a7f3b2c1e4d5...');

if (result) {
  console.log(\`Existed since \${result.capturedAt}\`);
  console.log(\`Proof: \${result.proofStatus}\`); // 'pending' | 'anchored'
} else {
  console.log('Not found in registry');
}`}</Code>

          <H4>Returns: VerifyResult | null</H4>
          <Code lang="typescript">{`interface VerifyResult {
  originId: string;
  hash: string;
  capturedAt: string;
  proofStatus: 'pending' | 'anchored';
  proofUrl: string;       // URL to download .ots proof
}`}</Code>
          <P className="text-sm text-muted-foreground">null = hash niet gevonden in het register.</P>

          <hr className="border-border my-8" />

          {/* proof() */}
          <H3>proof(originId, options?) → Promise&lt;ProofResult&gt;</H3>
          <P>
            Download de OpenTimestamps proof voor een origin. <strong>Geen API key nodig.</strong>
          </P>
          <Code lang="typescript">{`import { proof } from '@umarise/anchor';

const result = await proof('f47ac10b-58cc-4372-a567-0e02b2c3d479');

switch (result.status) {
  case 'anchored':
    fs.writeFileSync('proof.ots', result.data);
    console.log(\`Bitcoin block: \${result.bitcoinBlockHeight}\`);
    break;
  case 'pending':
    console.log('Proof submitted, awaiting Bitcoin confirmation');
    break;
  case 'not_found':
    console.log('No proof exists for this origin');
    break;
}`}</Code>

          <H4>Returns: ProofResult</H4>
          <Code lang="typescript">{`interface ProofResult {
  originId: string;
  status: 'anchored' | 'pending' | 'not_found';
  data: Uint8Array | null;           // Binary .ots (only when anchored)
  bitcoinBlockHeight: number | null; // Block number (only when anchored)
  anchoredAt: string | null;         // ISO 8601 (only when anchored)
}`}</Code>
        </Section>

        {/* hashBuffer */}
        <Section title="Helper: hashBuffer(buffer) → Promise<string>">
          <P>Utility om een bestand te hashen. Geen Core API call. Altijd async (Web Crypto).</P>
          <Code lang="typescript">{`import { anchor, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

const hash = await hashBuffer(readFileSync('contract.pdf'));
const result = await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });
console.log(\`Origin: \${result.originId}\`);`}</Code>
        </Section>

        {/* Wat de SDK NIET doet */}
        <Section title="Wat de SDK NIET doet">
          <ul className="space-y-2 list-none">
            <Li><strong>Geen bestanden opslaan.</strong> Umarise ontvangt alleen hashes, nooit bestanden.</Li>
            <Li><strong>Geen identiteit.</strong> Geen user accounts, geen sessies.</Li>
            <Li><strong>Geen interpretatie.</strong> De SDK zegt niet wát iets is, alleen dát het bestond.</Li>
            <Li><strong>Geen retry logic.</strong> Bij een fout krijg je een error. Jij beslist wat je ermee doet.</Li>
            <Li><strong>Geen caching.</strong> Elke call gaat naar de Core API.</Li>
          </ul>
        </Section>

        {/* Technische details */}
        <Section title="Technische details">
          <Table
            headers={["Property", "Value"]}
            rows={[
              ["Runtime", "Node.js 18+, Bun, Deno, browsers (ESM)"],
              ["Dependencies", "0 (zero)"],
              ["Bundle size", "< 4 KB gzipped"],
              ["Protocol", "HTTPS → Umarise Core v1 REST API"],
              ["Auth", "X-API-Key header (alleen voor anchor())"],
              ["Format", "ESM + CJS dual export"],
            ]}
          />
        </Section>

        {/* Endpoint mapping */}
        <Section title="Endpoint mapping">
          <Table
            headers={["SDK functie", "HTTP method", "Core API endpoint"]}
            rows={[
              ["anchor()", "POST", "/v1-core-origins"],
              ["verify()", "POST", "/v1-core-verify"],
              ["proof()", "GET", "/v1-core-proof?origin_id="],
              ["hashBuffer()", "—", "Lokaal (Web Crypto / Node crypto)"],
            ]}
          />
        </Section>

        {/* Error handling */}
        <Section title="Error handling">
          <Code lang="typescript">{`import { AnchorError } from '@umarise/anchor';

try {
  await anchor(hash, { apiKey });
} catch (e) {
  if (e instanceof AnchorError) {
    console.log(e.code);        // 'DUPLICATE_HASH' | 'UNAUTHORIZED' | ...
    console.log(e.statusCode);  // 409 | 401 | ...
    console.log(e.retryAfter);  // seconds (only for RATE_LIMITED)
  }
}`}</Code>
        </Section>

        {/* Wat Oscar kan zeggen */}
        <Section title="Wat Oscar kan zeggen">
          <blockquote className="border-l-4 border-primary/40 pl-6 py-2 italic text-muted-foreground leading-relaxed">
            "Integratie kost één middag. Vier regels code.
            <br />
            Jullie bestanden blijven bij jullie. Wij ontvangen alleen de hash.
            <br />
            Na integratie kan iedereen — jullie klanten, een rechter, een auditor —
            <br />
            onafhankelijk verifiëren dat het bestand bestond op dat moment.
            <br />
            Zonder ons te vertrouwen. De Bitcoin-blockchain is het bewijs."
          </blockquote>
        </Section>

        {/* Prijsmodel */}
        <Section title="Prijsmodel">
          <P className="italic text-muted-foreground">Nog niet definitief. Beslissing volgt.</P>
          <P>
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">verify()</code> en{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">proof()</code> zijn altijd gratis en ongelimiteerd.
            <br />
            Verificatie is een publiek goed.
          </P>
          <P>
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">anchor()</code> vereist een API key. Volume en tarieven volgen.
          </P>
        </Section>

        {/* Tijdlijn */}
        <Section title="Tijdlijn">
          <Table
            headers={["Stap", "Status"]}
            rows={[
              ["Core API v1", "✅ Live, bevroren"],
              ["API Reference", "✅ Live — Quick Start, templates, troubleshooting, 15 tests"],
              ["Partner onboarding docs", "✅ Vervalt — API reference dekt dit volledig"],
              ["SDK spec (dit document)", "✅ Klaar"],
              ["npm package @umarise/anchor", "🔲 ~2 dagen werk"],
              ["PyPI package umarise", "🔲 ~1 dag werk"],
            ]}
          />
          <P className="text-sm text-muted-foreground mt-4">
            De API reference op umarise.com/api-reference is de partner onboarding. Compleet: curl voorbeelden, 
            Node.js en Python templates, AI-integratie prompt, Try it Live, 15 geautomatiseerde tests.
          </P>
        </Section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
          <a href="/" className="text-primary hover:underline">← Terug naar home</a>
        </footer>
      </div>
    </div>
  );
};

/* ── Reusable sub-components ── */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-xl font-semibold tracking-tight mb-4">{title}</h2>
    {children}
  </section>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-mono font-medium mt-6 mb-3 text-primary">{children}</h3>
);

const H4 = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-sm font-semibold mt-5 mb-2 uppercase tracking-wide text-muted-foreground">{children}</h4>
);

const P = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`leading-relaxed mb-3 ${className}`}>{children}</p>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2">
    <span className="text-primary mt-0.5">·</span>
    <span>{children}</span>
  </li>
);

const Code = ({ children, lang }: { children: React.ReactNode; lang?: string }) => (
  <pre className="bg-muted/60 border border-border rounded-lg px-5 py-4 mb-4 overflow-x-auto text-sm font-mono leading-relaxed">
    <code>{children}</code>
  </pre>
);

const Table = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto mb-4">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border">
          {headers.map((h, i) => (
            <th key={i} className="text-left py-2 pr-4 font-semibold text-muted-foreground">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border/50">
            {row.map((cell, j) => (
              <td key={j} className="py-2 pr-4 font-mono text-xs">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SdkSpec;
