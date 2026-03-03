import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * Consistent page header with "umarise.com" home link.
 * Used across all public subpages.
 */
export default function PageHeader({ maxWidth = 'max-w-3xl' }: { maxWidth?: string }) {
  return (
    <header className="border-b border-landing-muted/10">
      <div className={`${maxWidth} mx-auto px-6 py-4 flex items-center justify-between`}>
        <Link
          to="/"
          className="flex items-center gap-2 text-landing-muted/50 hover:text-landing-cream transition-colors text-sm"
        >
          <ArrowUp className="w-4 h-4" />
          umarise.com
        </Link>
        <span className="font-serif text-lg text-landing-cream/80">
          Umarise
        </span>
      </div>
    </header>
  );
}
