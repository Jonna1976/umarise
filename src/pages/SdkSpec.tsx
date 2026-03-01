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

        {/* What it is */}
        <Section title="What it is">
          <P>
            An npm package that wraps the Umarise Core v1 REST API into four functions.
            <br />
            No magic. No abstraction. Just less boilerplate.
          </P>
          <Code>npm install @umarise/anchor</Code>
        </Section>

        {/* API Surface */}
        <Section title="API Surface">
          {/* anchor() */}
          <H3>anchor(hash, options?) → Promise&lt;AnchorResult&gt;</H3>
          <P>Register a hash in the Umarise registry.</P>
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
              ["hash", "string", "Yes", "SHA-256 hash. Accepts sha256:hex or raw 64-char hex."],
              ["options.apiKey", "string", "Yes", "Partner API key (um_live_... or um_test_...)."],
              ["options.baseUrl", "string", "No", "Override API endpoint. Default: https://core.umarise.com"],
              ["options.timeout", "number", "No", "Timeout in ms. Default: 12000"],
            ]}
          />

          <H4>Returns: AnchorResult</H4>
          <Code lang="typescript">{`interface AnchorResult {
  originId: string;       // UUID - permanent identifier
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
            Check whether a hash exists in the registry. <strong>No API key needed.</strong>
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
          <P className="text-sm text-muted-foreground">null = hash not found in registry.</P>

          <hr className="border-border my-8" />

          {/* proof() */}
          <H3>proof(originId, options?) → Promise&lt;ProofResult&gt;</H3>
          <P>
            Download the OpenTimestamps proof for an origin. <strong>No API key needed.</strong>
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
          <P>Utility to hash a file. No Core API call. Always async (Web Crypto).</P>
          <Code lang="typescript">{`import { anchor, hashBuffer } from '@umarise/anchor';
import { readFileSync } from 'fs';

const hash = await hashBuffer(readFileSync('contract.pdf'));
const result = await anchor(hash, { apiKey: process.env.UMARISE_API_KEY });
console.log(\`Origin: \${result.originId}\`);`}</Code>
        </Section>

        {/* What the SDK does NOT do */}
        <Section title="What the SDK does NOT do">
          <ul className="space-y-2 list-none">
            <Li><strong>No file storage.</strong> Umarise receives only hashes, never files.</Li>
            <Li><strong>No identity.</strong> No user accounts, no sessions.</Li>
            <Li><strong>No interpretation.</strong> The SDK does not say what something is, only that it existed.</Li>
            <Li><strong>No retry logic.</strong> On failure you get an error. You decide what to do with it.</Li>
            <Li><strong>No caching.</strong> Every call goes directly to the Core API.</Li>
          </ul>
        </Section>

        {/* Technical details */}
        <Section title="Technical details">
          <Table
            headers={["Property", "Value"]}
            rows={[
              ["Runtime", "Node.js 18+, Bun, Deno, browsers (ESM)"],
              ["Dependencies", "0 (zero)"],
              ["Bundle size", "< 4 KB gzipped"],
              ["Protocol", "HTTPS to Umarise Core v1 REST API"],
              ["Auth", "X-API-Key header (anchor() only)"],
              ["Format", "ESM + CJS dual export"],
            ]}
          />
        </Section>

        {/* Endpoint mapping */}
        <Section title="Endpoint mapping">
          <Table
            headers={["SDK function", "HTTP method", "Core API endpoint"]}
            rows={[
              ["anchor()", "POST", "/v1-core-origins"],
              ["verify()", "POST", "/v1-core-verify"],
              ["proof()", "GET", "/v1-core-proof?origin_id="],
              ["hashBuffer()", "-", "Local (Web Crypto / Node crypto)"],
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

        {/* What Oscar can say */}
        <Section title="Partner pitch">
          <blockquote className="border-l-4 border-primary/40 pl-6 py-2 italic text-muted-foreground leading-relaxed">
            "Integration takes one afternoon. Four lines of code.
            <br />
            Your files stay with you. We only receive the hash.
            <br />
            After integration, anyone - your clients, a judge, an auditor -
            <br />
            can independently verify that the file existed at that moment.
            <br />
            Without trusting us. The Bitcoin blockchain is the proof."
          </blockquote>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <P className="italic text-muted-foreground">Not finalized. Decision pending.</P>
          <P>
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">verify()</code> and{" "}
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">proof()</code> are always free and unlimited.
            <br />
            Verification is a public good.
          </P>
          <P>
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">anchor()</code> requires an API key. Volume and pricing to follow.
          </P>
        </Section>

        {/* Timeline */}
        <Section title="Timeline">
          <Table
            headers={["Step", "Status"]}
            rows={[
              ["Core API v1", "Live, frozen"],
              ["API Reference", "Live - Quick Start, templates, troubleshooting, 15 tests"],
              ["Partner onboarding docs", "Superseded - API reference covers this fully"],
              ["SDK spec (this document)", "Complete"],
              ["npm package @umarise/anchor", "Complete - GitHub repo live"],
              ["PyPI package umarise", "GitHub repo live, not yet published on PyPI"],
            ]}
          />
          <P className="text-sm text-muted-foreground mt-4">
            The API reference at umarise.com/api-reference is the partner onboarding. Complete: curl examples, 
            Node.js and Python templates, AI integration prompt, Try it Live, 15 automated tests.
          </P>
        </Section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground flex flex-col gap-2">
          <a href="/sdk-source" className="text-primary hover:underline">View SDK source code</a>
          <a href="https://github.com/Jonna1976/umarise-anchor" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Repository</a>
          <a href="/api-reference" className="text-primary hover:underline">API Reference</a>
          <a href="/" className="text-primary hover:underline">Back to home</a>
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
