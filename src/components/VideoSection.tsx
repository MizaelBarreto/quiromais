"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Sem backdrop-blur: em cima de um vídeo tocando, o desfoque seria refeito a cada quadro
const iconBtn =
  "grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/55 text-white transition-colors duration-200 hover:bg-black/75";

export default function VideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  // No celular o card de trás fica mais próximo, para o vídeo da frente ocupar mais a tela
  const compact = useMediaQuery("(max-width: 639px)");
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [muted, setMuted] = useState(true);
  // Com "reduzir movimento" o vídeo começa pausado (a pessoa ainda pode dar play)
  const reduceMotion = useReducedMotion();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? !!reduceMotion;
  // Estado real do vídeo da frente (e não o pedido): o botão mostra o que está acontecendo de fato
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);

  // Vídeos e pôsteres só começam a baixar quando a seção se aproxima (não pesam na abertura da página)
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Só reproduz quando o carrossel está na tela. Observa o carrossel (e não a seção inteira): no celular
  // a seção é mais alta que a tela e a fração visível dela nem sempre chegava ao limite — o vídeo ficava parado.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const shouldPlay = near && inView && pageVisible && !paused;
  const shouldPlayRef = useRef(shouldPlay);
  useEffect(() => {
    shouldPlayRef.current = shouldPlay;
    activeRef.current = active;
  });

  // play() com plano B: se o navegador barrar o som, segue sem som; se barrar a reprodução automática
  // (ex.: modo economia de energia no iPhone), mostra o botão de play em vez de fingir que está tocando
  const startVideo = useCallback((v: HTMLVideoElement) => {
    v.play().catch((err: unknown) => {
      if ((err as DOMException)?.name !== "NotAllowedError") return; // AbortError: pausado/trocado no meio; os eventos tentam de novo
      if (!v.muted) {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => setUserPaused(true));
      } else {
        setUserPaused(true);
      }
    });
  }, []);

  // Apenas o vídeo da frente toca; os de trás ficam parados no pôster
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i !== active) {
        v.muted = true;
        if (!v.paused) v.pause();
        return;
      }
      v.muted = muted;
      if (shouldPlay) {
        if (v.paused) startVideo(v);
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, [active, muted, shouldPlay, startVideo]);

  useEffect(() => {
    const v = videoRefs.current[active];
    setPlaying(!!v && !v.paused);
    setBuffering(false);
  }, [active]);

  // Play/pause e som são aplicados direto no toque: alguns navegadores (Safari/iOS) só liberam
  // play() e som dentro do próprio gesto da pessoa, não depois de uma nova renderização
  const togglePlay = () => {
    const v = videoRefs.current[active];
    if (playing) {
      setUserPaused(true);
      v?.pause();
    } else {
      setUserPaused(false);
      if (v) startVideo(v);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    const v = videoRefs.current[active];
    if (!v) return;
    v.muted = next;
    if (!next && v.paused && shouldPlayRef.current) startVideo(v);
  };

  return (
    <section
      id="videos"
      ref={sectionRef}
      className="section-padding bg-dark text-cream relative overflow-hidden"
    >
      {/* Ambient glows (gradiente radial no lugar de blur: mesmo efeito, sem custo na rolagem) */}
      <div className="absolute -top-24 left-[10%] w-[28rem] h-[28rem] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(201,161,92,0.15)_0%,rgba(201,161,92,0.15)_30%,transparent_70%)]" aria-hidden="true" />
      <div className="absolute -bottom-32 right-[5%] w-[30rem] h-[30rem] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(216,183,126,0.1)_0%,rgba(216,183,126,0.1)_30%,transparent_70%)]" aria-hidden="true" />

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
        {/* max-h: em telas baixas (celular deitado) o palco encolhe e o card escala junto, com os botões à vista */}
        <div ref={stageRef} className="relative h-[480px] sm:h-[640px] max-h-[max(320px,calc(100svh-5rem))]">
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
                    // atributo "muted" de verdade no HTML (o React só define a propriedade): o iOS exige
                    // o vídeo mudo para liberar a reprodução sem toque
                    if (el) el.defaultMuted = true;
                  }}
                  className="block h-full w-full object-cover [pointer-events:none]"
                  src={near ? (item.video as string) : undefined}
                  poster={near ? (item.image as string) : undefined}
                  muted
                  loop
                  playsInline
                  // o vídeo da frente já vai carregando antes de a seção chegar; os de trás só ao virem para a frente
                  preload={isActive ? "auto" : "none"}
                  aria-label={item.alt}
                  onPlay={() => i === activeRef.current && setPlaying(true)}
                  onPause={() => i === activeRef.current && setPlaying(false)}
                  onWaiting={() => i === activeRef.current && setBuffering(true)}
                  onPlaying={() => i === activeRef.current && setBuffering(false)}
                  onCanPlay={(e) => {
                    if (i !== activeRef.current) return;
                    setBuffering(false);
                    // play() pedido antes de haver dados (ou interrompido no meio): tenta de novo agora
                    if (shouldPlayRef.current && e.currentTarget.paused) startVideo(e.currentTarget);
                  }}
                  onError={(e) => {
                    // falha de rede no meio do vídeo: recarrega uma vez e retoma
                    const v = e.currentTarget;
                    if (!v.currentSrc || v.dataset.retried) return;
                    v.dataset.retried = "1";
                    v.load();
                    if (shouldPlayRef.current && i === activeRef.current) startVideo(v);
                  }}
                />
                {isActive && buffering && playing && (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
                    <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-16">
                    <span className="text-sm font-semibold text-cream drop-shadow">{item.title as string}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={iconBtn}
                        aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                      >
                        {!playing ? (
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
                          toggleMute();
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
