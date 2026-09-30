"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import DepthCarousel from "./reactbits/DepthCarousel";
import SplitText from "./reactbits/SplitText";
import GoldButton from "./GoldButton";
import WhatsAppIcon from "./icons/WhatsAppIcon";
import { VIDEO_ITEMS, WHATSAPP_URL } from "@/lib/constants";
import useMediaQuery from "@/hooks/useMediaQuery";

const LABELS = {
  carousel: "Vídeos dos atendimentos",
  slide: (n: number, total: number) => `Vídeo ${n} de ${total}`,
  prev: "Vídeo anterior",
  next: "Próximo vídeo",
  goTo: (n: number) => `Ir para o vídeo ${n}`,
};

const iconBtn =
  "grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition-colors duration-200 hover:bg-black/65";

export default function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // No celular o card de trás fica mais próximo, para o vídeo da frente ocupar mais a tela
  const compact = useMediaQuery("(max-width: 639px)");
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  // Com "reduzir movimento" o vídeo começa pausado (a pessoa ainda pode dar play)
  const reduceMotion = useReducedMotion();
  const [userPaused, setPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? !!reduceMotion;

  // Só reproduz quando a seção está visível
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Apenas o vídeo da frente toca; os de trás ficam parados no pôster
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      const isFront = i === active;
      v.muted = muted || !isFront;
      if (isFront && inView && !paused) v.play().catch(() => {});
      else v.pause();
    });
  }, [active, inView, muted, paused]);

  return (
    <section
      id="videos"
      ref={sectionRef}
      className="section-padding bg-dark text-cream relative overflow-hidden"
    >
      {/* Ambient glows */}
      <div className="absolute -top-24 left-[10%] w-[28rem] h-[28rem] bg-gold/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-32 right-[5%] w-[30rem] h-[30rem] bg-gold-light/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-6 items-center">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <span className="text-gold text-xs tracking-[0.3em] uppercase font-semibold block mb-3">
            Vídeos
          </span>
          <SplitText
            tag="h2"
            text="A Quiro+ em movimento"
            className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4 leading-[1.15] pb-1"
            splitType="chars"
            delay={35}
            duration={0.9}
            from={{ opacity: 0, y: 44 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
            rootMargin="-40px"
            textAlign="inherit"
          />
          <div className="gold-divider mx-auto lg:mx-0" />
          <p className="text-cream/75 text-base sm:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            Veja de perto como são os ajustes da Dra. Priscila Santos: movimentos precisos, feitos com
            técnica e cuidado em cada etapa do atendimento.
          </p>

          <p className="mt-6 text-sm text-cream/70" aria-live="polite">
            <span className="text-gold font-semibold">
              {String(active + 1).padStart(2, "0")} / {String(VIDEO_ITEMS.length).padStart(2, "0")}
            </span>
            <span className="mx-2 text-cream/30" aria-hidden="true">—</span>
            {VIDEO_ITEMS[active].title}
          </p>

          <div className="mt-8">
            <GoldButton href={WHATSAPP_URL} tone="onDark">
              <WhatsAppIcon className="w-5 h-5" />
              Agendar minha avaliação
            </GoldButton>
          </div>
        </div>

        {/* React Bits — Depth Carousel */}
        <div className="relative h-[480px] sm:h-[640px]">
          <DepthCarousel
            items={VIDEO_ITEMS}
            cardWidth={300}
            cardHeight={533}
            radius={22}
            tint="#1a140d"
            depth={200}
            spread={compact ? 34 : 130}
            tilt={compact ? 10 : 16}
            perspective={1400}
            visibleCards={1}
            falloff={0.35}
            blur={3}
            duration={800}
            cardBackground="#1E1810"
            labels={LABELS}
            onChange={(i) => setActive(i)}
            renderItem={(item, i, isActive) => (
              <div className="relative h-full w-full">
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  className="block h-full w-full object-cover [pointer-events:none]"
                  src={item.video as string}
                  poster={item.image}
                  muted
                  loop
                  playsInline
                  preload={isActive ? "metadata" : "none"}
                  aria-label={item.alt}
                />
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-16">
                    <span className="text-sm font-semibold text-cream drop-shadow">{item.title as string}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={iconBtn}
                        aria-label={paused ? "Reproduzir vídeo" : "Pausar vídeo"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaused(!paused);
                        }}
                      >
                        {paused ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                            <path d="M8 5.5v13a1 1 0 001.5.87l11-6.5a1 1 0 000-1.74l-11-6.5A1 1 0 008 5.5z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        className={iconBtn}
                        aria-label={muted ? "Ativar som" : "Desativar som"}
                        aria-pressed={!muted}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMuted((m) => !m);
                        }}
                      >
                        {muted ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 5L6 9H3v6h3l5 4V5z" />
                            <path d="M22 9l-6 6M16 9l6 6" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 5L6 9H3v6h3l5 4V5z" />
                            <path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
