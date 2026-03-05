import { Link } from 'react-router-dom';

/**
 * Consistent page header with "Umarise" home link.
 * Used across all public subpages.
 */
export default function PageHeader({ maxWidth = 'max-w-3xl' }: { maxWidth?: string }) {
  return (
    <header className="border-b border-landing-muted/10">
      <div className={`${maxWidth} mx-auto px-6 py-4`}>
        <Link
          to="/"
          className="font-serif text-lg text-landing-cream hover:text-landing-cream/80 transition-colors"
        >
          Umarise
        </Link>
      </div>
    </header>
  );
}
