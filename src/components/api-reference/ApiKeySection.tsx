import { Key, Globe } from 'lucide-react';

export default function ApiKeySection() {
  return (
    <section id="api-key" className="space-y-4">
      <div className="border border-[hsl(var(--landing-cream)/0.1)] rounded-lg p-6 bg-[hsl(var(--landing-cream)/0.02)]">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-[hsl(var(--landing-copper))]" />
          <h2 className="text-xl font-serif text-[hsl(var(--landing-cream))]">API Key</h2>
        </div>

        <div className="space-y-4 text-sm text-[hsl(var(--landing-cream)/0.8)]">
          <p>
            One endpoint requires a partner key:{' '}
            <code className="text-[hsl(var(--landing-copper))]">POST /v1-core-origins</code>.
            You request it once, configure it once, and your system handles the rest.
          </p>

          <div className="flex items-start gap-2 p-3 rounded border border-emerald-500/15 bg-emerald-500/5">
            <Globe className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[hsl(var(--landing-cream)/0.85)]">
              All other endpoints are public. No key, no account, no setup.
            </p>
          </div>

          <p className="text-[hsl(var(--landing-cream)/0.6)]">
            Want a key? Email{' '}
            <a href="mailto:partners@umarise.com" className="text-[hsl(var(--landing-copper))] hover:underline">
              partners@umarise.com
            </a>
            , response within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
