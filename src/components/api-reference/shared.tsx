import { useState } from 'react';
import { Copy, Check, Shield, Globe, Key } from 'lucide-react';

export function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-[hsl(220,10%,10%)] border border-[hsl(var(--landing-cream)/0.06)] rounded-md p-4 text-sm font-mono text-[hsl(var(--landing-cream)/0.8)] overflow-x-auto whitespace-pre">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded bg-[hsl(var(--landing-cream)/0.05)] hover:bg-[hsl(var(--landing-cream)/0.1)] transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[hsl(var(--landing-cream)/0.4)]" />}
      </button>
    </div>
  );
}

const TAB_LABELS = ['curl', 'Node.js', 'Python'] as const;

export function CodeTabs({ examples }: { examples: { curl: string; node: string; python: string } }) {
  const [tab, setTab] = useState<number>(0);
  const code = [examples.curl, examples.node, examples.python][tab];
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              tab === i
                ? 'bg-[hsl(var(--landing-cream)/0.1)] text-[hsl(var(--landing-cream))]'
                : 'text-[hsl(var(--landing-cream)/0.35)] hover:text-[hsl(var(--landing-cream)/0.6)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <CopyBlock code={code} />
    </div>
  );
}

export function Param({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-[hsl(var(--landing-cream)/0.04)] last:border-0">
      <code className="text-[hsl(var(--landing-copper))] text-sm font-mono shrink-0">{name}</code>
      <span className="text-[hsl(var(--landing-cream)/0.3)] text-xs font-mono shrink-0">{type}</span>
      {required && <span className="text-amber-500/70 text-[10px] font-mono uppercase shrink-0">required</span>}
      <span className="text-[hsl(var(--landing-cream)/0.6)] text-sm">{desc}</span>
    </div>
  );
}

export function Badge({ children, variant = 'public' }: { children: React.ReactNode; variant?: 'public' | 'partner' }) {
  return variant === 'public' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <Globe className="w-3 h-3" />{children}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
      <Key className="w-3 h-3" />{children}
    </span>
  );
}

export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-400',
    POST: 'bg-blue-500/15 text-blue-400',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${colors[method] ?? 'bg-white/10 text-white/60'}`}>
      {method}
    </span>
  );
}

export function SectionHeader({ method, path, title, badge }: { method: string; path: string; title: string; badge: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4 border-b border-[hsl(var(--landing-cream)/0.08)]">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <MethodBadge method={method} />
        <code className="text-[hsl(var(--landing-cream)/0.9)] font-mono text-base">{path}</code>
        {badge}
      </div>
      <h2 className="text-2xl font-serif text-[hsl(var(--landing-cream))]">{title}</h2>
    </div>
  );
}

export function ErrorList({ errors }: { errors: Array<{ code: number; error: string; desc: string }> }) {
  return (
    <div className="space-y-1">
      {errors.map((e) => (
        <div key={e.error} className="flex gap-3 py-1.5 text-sm">
          <span className="text-[hsl(var(--landing-cream)/0.3)] font-mono shrink-0">{e.code}</span>
          <code className="text-red-400/80 font-mono shrink-0">{e.error}</code>
          <span className="text-[hsl(var(--landing-cream)/0.5)]">{e.desc}</span>
        </div>
      ))}
    </div>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex gap-3 items-start p-3 rounded border border-[hsl(var(--landing-cream)/0.06)] bg-[hsl(var(--landing-cream)/0.02)]">
      <Shield className="w-4 h-4 text-[hsl(var(--landing-copper))] shrink-0 mt-0.5" />
      <p className="text-[hsl(var(--landing-cream)/0.5)] text-sm">{children}</p>
    </div>
  );
}
