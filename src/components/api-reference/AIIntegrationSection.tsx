import { useState } from 'react';
import { Bot, Copy, Check, Sparkles } from 'lucide-react';

const AI_PROMPT = `I want to integrate the Umarise Core API into my existing [Python / Node.js / PHP / other] application.

API details:
- Base URL: https://core.umarise.com
- Authentication: X-API-Key header (key starts with um_)
- Main endpoint: POST /v1-core-origins
- Request body: { "hash": "<sha256 hex, no prefix>" }
- Response: { "origin_id": "uuid", "proof_status": "pending", "captured_at": "..." }
- Proof anchors to Bitcoin in 10-20 minutes
- Poll GET /v1-core-resolve?origin_id=<uuid> to check status

What I want to do:
- Compute SHA-256 hash of [file / image URL / document]
- Send hash to Core API when [event: upload / save / submit]
- Store origin_id alongside my existing record
- Handle failures gracefully (non-blocking)

My existing code: [paste your relevant function or endpoint here]`;

export default function AIIntegrationSection() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(AI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="ai-integration" className="space-y-4">
      <div className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">Integrate with AI</h2>
          <span className="text-[hsl(var(--landing-cream)/0.45)] text-xs font-mono ml-auto">30 minutes to production</span>
        </div>

        <p className="text-[hsl(var(--landing-cream)/0.7)] text-sm mb-4">
          Most developers today use Claude, ChatGPT, or another AI assistant. This is the fastest path to integration.
        </p>

        <div className="flex items-start gap-3 p-3 rounded border border-[hsl(var(--landing-copper)/0.2)] bg-[hsl(var(--landing-copper)/0.05)] mb-6">
          <Sparkles className="w-4 h-4 text-[hsl(var(--landing-copper))] mt-0.5 shrink-0" />
          <p className="text-[hsl(var(--landing-cream)/0.85)] text-sm">
            <strong className="text-[hsl(var(--landing-cream))]">Proven:</strong> A non-technical founder integrated Vault, a 7-service self-hosted OCR and document capture stack, into Core in under 30 minutes using AI assistance. No SDK. No checklist. Production.
          </p>
        </div>

        <h4 className="text-[hsl(var(--landing-cream)/0.6)] text-xs font-mono uppercase tracking-wider mb-3">
          The prompt — copy and paste into your AI assistant
        </h4>

        <div className="relative group">
          <pre className="bg-[hsl(220,10%,10%)] border border-[hsl(var(--landing-cream)/0.06)] rounded-md p-4 pr-20 text-sm font-mono text-[hsl(var(--landing-cream)/0.85)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {AI_PROMPT}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[hsl(var(--landing-cream)/0.15)] text-[hsl(var(--landing-cream)/0.8)] hover:text-[hsl(var(--landing-cream))] hover:border-[hsl(var(--landing-cream)/0.3)] transition-colors bg-[hsl(var(--landing-deep)/0.9)]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy prompt'}
          </button>
        </div>

        <p className="text-[hsl(var(--landing-cream)/0.6)] text-sm mt-4">
          That's it. Your AI will write the integration. Paste your code, get working code back.
        </p>
      </div>
    </section>
  );
}
