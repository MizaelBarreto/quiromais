import Link from "next/link";

// Cabeçalho das páginas internas (política, 404): logo e volta para o site
export default function SimpleHeader() {
  return (
    <header className="border-b border-gold/20 bg-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-1">
          <span className="font-serif text-3xl font-bold tracking-tight text-dark transition-colors duration-300 group-hover:text-gold-deep">
            Quiro
          </span>
          <span className="font-serif text-3xl font-bold tracking-tight text-gold-deep">+</span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-dark/80 transition-colors duration-300 hover:text-gold-deep"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao site
        </Link>
      </div>
    </header>
  );
}
