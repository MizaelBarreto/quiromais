"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REVIEWS_DATA } from "@/lib/constants";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-500" : "text-dark/20"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const total = REVIEWS_DATA.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(next, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  const avgRating = (
    REVIEWS_DATA.reduce((acc, r) => acc + r.rating, 0) / REVIEWS_DATA.length
  ).toFixed(1);

  return (
    <section id="avaliacoes" className="section-padding bg-cream overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">
            Avaliações
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-dark mt-3 mb-4">
            O que dizem sobre a Quiro+
          </h2>
          <div className="gold-divider mx-auto" />

          {/* Google rating badge */}
          <div className="inline-flex items-center gap-3 mt-6 bg-white rounded-full px-6 py-3 shadow-[0_4px_20px_rgba(43,35,24,0.06)]">
            <GoogleIcon />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-dark">{avgRating}</span>
              <StarRating rating={5} />
            </div>
            <span className="text-dark/50 text-sm">
              {REVIEWS_DATA.length} avaliações
            </span>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards container */}
          <div className="relative h-[320px] sm:h-[280px] flex items-center justify-center perspective-[1400px]">
            {REVIEWS_DATA.map((review, i) => {
              const offset = i - current;
              const absOffset = Math.abs(offset);
              const isActive = i === current;
              const normalizedOffset = ((offset % total) + total) % total;
              const adjustedOffset = normalizedOffset > total / 2 ? normalizedOffset - total : normalizedOffset;
              const absAdjusted = Math.abs(adjustedOffset);

              if (absAdjusted > 2) return null;

              return (
                <motion.div
                  key={i}
                  className="absolute"
                  animate={{
                    x: adjustedOffset * 100,
                    z: -absAdjusted * 120,
                    rotateY: adjustedOffset * -8,
                    scale: 1 - absAdjusted * 0.12,
                    opacity: absAdjusted > 1 ? 0.3 : 1 - absAdjusted * 0.3,
                    filter: isActive ? "blur(0px)" : `blur(${absAdjusted * 2}px)`,
                  }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    zIndex: 10 - absAdjusted,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className={`w-[320px] sm:w-[380px] bg-white rounded-2xl p-8 shadow-[0_12px_40px_rgba(43,35,24,0.08)] border transition-all duration-500 ${
                      isActive ? "border-gold/30" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <StarRating rating={review.rating} />
                      <GoogleIcon />
                    </div>
                    <p className="text-dark/70 text-[15px] leading-relaxed mb-6 line-clamp-4">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-dark text-sm">{review.name}</p>
                        <p className="text-dark/40 text-xs">{review.date}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <span className="text-gold font-bold text-sm">{review.name[0]}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 text-gold"
              aria-label="Avaliação anterior"
              id="carousel-prev"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {REVIEWS_DATA.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? "w-8 h-2 bg-gold"
                      : "w-2 h-2 bg-dark/15 hover:bg-gold/40"
                  }`}
                  aria-label={`Ir para avaliação ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 text-gold"
              aria-label="Próxima avaliação"
              id="carousel-next"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
