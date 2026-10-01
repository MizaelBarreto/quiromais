import type { Metadata } from "next";
import Link from "next/link";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import GoldButton from "@/components/GoldButton";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Página não encontrada",
  description: "A página que você procurou não existe ou mudou de endereço.",
  robots: { index: false },
};

const shortcuts = [
  { label: "Serviços", href: "/#servicos" },
  { label: "Quem sou", href: "/#quem-sou" },
  { label: "Avaliações", href: "/#avaliacoes" },
  { label: "Agendar avaliação", href: "/#contato" },
];

export default function NotFound() {
  return (
    <>
      <SimpleHeader />
      <main className="relative overflow-hidden bg-cream">
        {/* brilho dourado de fundo */}
        <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
          <p className="font-serif text-8xl font-bold leading-none lining-nums text-gold-deep sm:text-9xl" aria-hidden="true">
            4<span className="text-gold">0</span>4
          </p>
          <h1 className="mt-6 font-serif text-3xl font-bold text-dark sm:text-4xl">
            Esta página saiu do alinhamento
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-dark/75">
            O endereço que você acessou não existe ou mudou de lugar. Mas a gente te ajuda a voltar para o caminho
            certo.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <GoldButton href="/" external={false} size="md">
              Voltar para o início
            </GoldButton>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-gold-deep transition-colors hover:text-dark"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>

          <nav aria-label="Atalhos" className="mt-12">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {shortcuts.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="inline-flex min-h-11 items-center text-dark/70 underline-offset-4 transition-colors hover:text-gold-deep hover:underline"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
