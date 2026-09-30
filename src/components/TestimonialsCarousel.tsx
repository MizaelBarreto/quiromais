"use client";

import { REVIEWS_DATA, GOOGLE_REVIEWS } from "@/lib/constants";
import CardSwap, { Card } from "./reactbits/CardSwap";
import SplitText from "./reactbits/SplitText";
import GoldButton from "./GoldButton";

function StarRating({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${size} ${i < rating ? "text-gold" : "text-dark/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function TestimonialsCarousel() {
  return (
    <section id="avaliacoes" className="section-padding bg-cream overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-6 items-center">
        {/* Header */}
        <div className="text-center lg:text-left">
          <span className="text-gold-deep text-xs tracking-[0.3em] uppercase font-semibold">
            Avaliações
          </span>
          <SplitText
            tag="h2"
            text="O que dizem sobre a Quiro+"
            className="font-serif text-4xl md:text-5xl font-bold text-dark mt-3 mb-4 leading-[1.15] pb-1"
            splitType="words"
            delay={90}
            duration={1}
            from={{ opacity: 0, y: 36 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
            rootMargin="-40px"
            textAlign="inherit"
          />
          <div className="gold-divider mx-auto lg:mx-0" />
          <p className="text-dark/75 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            Relatos de pacientes que voltaram a se movimentar com mais liberdade e menos dor.
          </p>

          {/* Google rating badge */}
          <a
            href={GOOGLE_REVIEWS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8 bg-white rounded-full pl-5 pr-6 py-3 border border-gold/20 shadow-[0_4px_20px_rgba(43,35,24,0.06)] hover:shadow-[0_10px_30px_rgba(43,35,24,0.1)] hover:border-gold/50 transition-[box-shadow,border-color] duration-300"
            aria-label={`Nota ${GOOGLE_REVIEWS.rating} no Google — ${GOOGLE_REVIEWS.summary}. Ver no Google`}
          >
            <span className="flex items-center gap-2.5">
              <GoogleIcon />
              <span className="text-2xl font-bold text-dark leading-none">{GOOGLE_REVIEWS.rating}</span>
              <StarRating rating={5} size="w-[18px] h-[18px]" />
            </span>
            <span className="hidden sm:block w-px h-6 bg-dark/10" aria-hidden="true" />
            <span className="text-dark/75 text-sm font-medium">{GOOGLE_REVIEWS.summary}</span>
            <svg className="w-4 h-4 text-gold-deep transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <div className="mt-8">
            <GoldButton href="#contato" external={false}>
              Quero agendar minha avaliação
            </GoldButton>
          </div>
        </div>

        {/* React Bits — Card Swap: pilha de avaliações que se alterna sozinha (pausa no hover/foco) */}
        <div
          className="relative h-[430px] sm:h-[470px]"
          role="region"
          aria-roledescription="carrossel"
          aria-label="Avaliações de pacientes"
        >
          <CardSwap
            width="min(430px, 84vw)"
            height={300}
            cardDistance={34}
            verticalDistance={38}
            delay={5200}
            pauseOnHover
            easing="linear"
            skewAmount={3}
            maxVisible={3}
            containerClassName="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -ml-8 mt-10 perspective-[1000px] overflow-visible"
          >
            {REVIEWS_DATA.map((review, i) => (
              <Card
                key={i}
                customClass="rounded-2xl bg-white border border-gold/25 shadow-[0_18px_45px_rgba(43,35,24,0.12)]"
              >
                <figure className="flex h-full flex-col p-7">
                  <div className="flex items-center justify-between mb-4">
                    <StarRating rating={review.rating} />
                    <GoogleIcon />
                  </div>
                  <blockquote className="text-dark/80 text-[15px] leading-relaxed line-clamp-5 flex-1">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between border-t border-gold/15 pt-4">
                    <span>
                      <span className="block font-semibold text-dark text-sm">{review.name}</span>
                      <span className="block text-dark/60 text-xs">{review.date}</span>
                    </span>
                    <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold-deep font-bold text-sm" aria-hidden="true">
                      {review.name[0]}
                    </span>
                  </figcaption>
                </figure>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </section>
  );
}
