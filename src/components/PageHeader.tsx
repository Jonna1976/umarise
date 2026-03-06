import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * Consistent page header with "↑ Umarise" home link.
 * Used across all public subpages.
 */
export default function PageHeader({ maxWidth = 'max-w-3xl' }: { maxWidth?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-landing-deep/95 backdrop-blur-md border-b border-landing-muted/10">
      <div className={`${maxWidth} mx-auto px-6 h-14 flex items-center`}>
        <Link
          to="/"
          className="flex items-center gap-2 text-landing-muted/75 hover:text-landing-cream transition-colors text-sm"
        >
          <ArrowUp className="w-4 h-4" />
          Umarise
        </Link>
      </div>
    </header>
  );
}
