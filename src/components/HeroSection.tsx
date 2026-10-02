"use client";

import { useEffect, useRef, useState } from "react";

// Animação 3D do logo (WebGL), gerada a partir de animacao-hero-js/src-3d
const SCRIPT_SRC = "/js/quiro-hero-3d.js";

// pause() é opcional: uma versão antiga do script em cache não tem
type QuiroHero = { ready: Promise<void>; play(): void; pause?(): void; destroy(): void };

declare global {
  interface Window {
    createQuiroHero3D?: (canvas: HTMLCanvasElement, options?: Record<string, unknown>) => QuiroHero;
  }
}

function loadHeroScript(): Promise<void> {
  if (window.createQuiroHero3D) return Promise.resolve();
  let el = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (!el) {
    el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    document.head.appendChild(el);
  }
  const script = el;
  return new Promise((resolve, reject) => {
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Falha ao carregar a animação do hero")), { once: true });
  });
}

// Sem GPU de verdade (WebGL por software: máquinas virtuais, GPUs bloqueadas, robôs de teste
// como o PageSpeed) a cena 3D travaria a página: aí nem baixa o script e mostra a imagem estática.
function hasHardwareWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
  // A seta "role para baixo" só anima com o hero na tela
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // Com "reduzir movimento" ativo, a própria animação desenha só o quadro final.
    let hero: QuiroHero | null = null;
    let io: IntersectionObserver | null = null;
    let cancelled = false;
    (hasHardwareWebGL() ? loadHeroScript() : Promise.reject(new Error("Sem aceleração de vídeo")))
      .then(() => {
        if (cancelled || !canvasRef.current || !window.createQuiroHero3D) return;
        // Em telas de toque (celulares, tablets) desenha em resolução um pouco menor: a cena tem sombras
        // e reflexos, e em 2x/3x disputava a GPU com a rolagem da página
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const created = window.createQuiroHero3D(canvasRef.current, { maxDpr: coarse ? 1.5 : 2 }); // lança erro se não houver WebGL
        hero = created;
        // Fora da tela a cena para de desenhar (libera a GPU para a rolagem) e continua de onde parou ao voltar
        if (sectionRef.current) {
          io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) created.play();
            else created.pause?.();
          });
          io.observe(sectionRef.current);
        }
        return created.ready.then(() => {
          if (!cancelled) setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("fallback");
      });
    return () => {
      cancelled = true;
      io?.disconnect();
      hero?.destroy();
    };
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="relative h-screen min-h-[600px] w-full overflow-hidden bg-[#ebe7df]">
      <h1 className="sr-only">Quiro+ — Quiropraxia e Fisioterapia com Priscila Santos em Bauru-SP</h1>

      {/* Animação 3D do logo sobre a parede de gesso */}
      <div className="absolute inset-0 w-full h-full" aria-hidden="true">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
        />
        {/* Sem WebGL (ou só por software): imagem estática do logo */}
        {status === "fallback" && (
          <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/hero/quiro-hero-final-mobile.webp')] md:bg-[url('/images/hero/quiro-hero-final-desktop.webp')]" />
        )}

        {/* Subtle bottom gradient transition to section background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F4EBDD] to-transparent pointer-events-none" />
      </div>

      {/* Scroll indicator — também funciona como atalho para a próxima seção */}
      <a
        href="#quem-sou"
        aria-label="Rolar para a seção Quem sou"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white opacity-70 transition-opacity duration-300 hover:opacity-100"
      >
        <svg
          className={`w-6 h-6 ${onScreen ? "animate-bounce-slow" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </a>
    </section>
  );
}
