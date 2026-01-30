import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Terms of Service for Umarise
 * B2B infrastructure terms - clear, minimal, technically honest
 */
export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg">Umarise</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-12">Last updated: January 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          
          {/* What Umarise is */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What Umarise Is</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umarise is origin-recording infrastructure. It creates immutable cryptographic records 
              of when digital content existed. It does not store, process, or interpret your content 
              beyond computing a SHA-256 hash at the moment of capture.
            </p>
          </section>

          {/* What Umarise is not */}
          <section>
            <h2 className="text-xl font-semibold mb-4">What Umarise Is Not</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Not a backup service — we record existence, not content</li>
              <li>Not legal advice — cryptographic proof is technical, not legal</li>
              <li>Not a notary replacement — we provide bit-identity, not legal certification</li>
              <li>Not a content platform — we don't host, search, or display your content</li>
            </ul>
          </section>

          {/* Immutability */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Immutability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Origin records are immutable by design. Once created, they cannot be modified or deleted. 
              This is the fundamental property that makes origin proof valuable.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You can revoke the <em>association</em> between your device and an origin, but the 
              cryptographic record itself persists. This is intentional — proof of existence 
              must survive the wish to deny it.
            </p>
          </section>

          {/* No accounts */}
          <section>
            <h2 className="text-xl font-semibold mb-4">No User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umarise operates without user accounts. Your device ID (stored in your browser) 
              is the only link to your origins. If you lose access to your device or clear 
              browser data, we cannot restore access because we have no way to verify your identity.
            </p>
          </section>

          {/* Service availability */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim for high availability but provide no uptime guarantees. Origin records 
              are stored on infrastructure designed for durability (Hetzner Germany), but 
              we disclaim liability for temporary unavailability or data loss.
            </p>
          </section>

          {/* API usage */}
          <section>
            <h2 className="text-xl font-semibold mb-4">API Usage</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Partners accessing Umarise via API agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the service for legitimate origin-recording purposes</li>
              <li>Not attempt to circumvent rate limits or security measures</li>
              <li>Not use the service for illegal content or activities</li>
              <li>Accept that API responses are technical data, not legal opinions</li>
            </ul>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Umarise provides technical infrastructure on an "as is" basis. We disclaim 
              all warranties, express or implied. Our liability is limited to the fees 
              paid (if any) in the twelve months preceding any claim. We are not liable 
              for indirect, incidental, or consequential damages.
            </p>
          </section>

          {/* Governing law */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the Netherlands. Any disputes shall 
              be resolved in the courts of Amsterdam.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms. Changes take effect upon posting. Continued use 
              of the service constitutes acceptance of updated terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these terms:{' '}
              <a 
                href="mailto:partners@umarise.com?subject=Terms%20Inquiry" 
                className="text-foreground underline hover:no-underline"
              >
                partners@umarise.com
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
