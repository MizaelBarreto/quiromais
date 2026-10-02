"use client";

import { useCallback, useEffect, useRef } from "react";

interface Options {
  /** Tempo entre uma troca e outra (ms) */
  delay: number;
  /** Avança o carrossel um passo */
  onAdvance: () => void;
  /** Pausa vinda de fora (ex.: modal aberto) */
  paused?: boolean;
  pauseOnHover?: boolean;
  /** Fração do carrossel que precisa estar na tela para ele girar */
  threshold?: number;
}

// Depois de uma pausa (mouse saiu, foco saiu), a próxima troca vem antes do intervalo cheio,
// para ficar claro que o carrossel voltou a girar
const RESUME_DELAY = 1500;
// Enquanto está pausado por hover/foco, confere de tempos em tempos se a pausa ainda vale
const RECHECK = 300;

// Giro automático de carrossel com pausas que não "prendem":
// - hover só conta com mouse de verdade, e é conferido com :hover na hora da troca. No celular o toque
//   gerava um "mouseenter" sem "mouseleave", e o carrossel ficava parado para sempre;
// - foco só pausa quando veio do teclado (:focus-visible) e é conferido na hora. O foco devolvido a um
//   botão depois de fechar um modal, por exemplo, não segura mais a pausa;
// - fora da tela ou com a aba em segundo plano não gira, e nada se acumula para disparar depois;
// - com "reduzir movimento" não há giro automático (a navegação manual continua funcionando).
export default function useCarouselAutoplay<T extends HTMLElement>({
  delay,
  onAdvance,
  paused = false,
  pauseOnHover = true,
  threshold = 0.25,
}: Options) {
  const ref = useRef<T>(null);
  const onAdvanceRef = useRef(onAdvance);
  const restartRef = useRef<() => void>(() => {});

  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let inView = false;
    let mouseInside = false;
    let wasHeld = false;

    const held = () => {
      if (pauseOnHover && mouseInside && node.matches(":hover")) return true;
      const focused = document.activeElement;
      return !!focused && focused !== document.body && node.contains(focused) && focused.matches(":focus-visible");
    };

    const clear = () => {
      window.clearTimeout(timer);
      timer = 0;
    };

    const tick = () => {
      if (!inView || document.hidden) {
        timer = 0;
        return;
      }
      if (held()) {
        wasHeld = true;
        timer = window.setTimeout(tick, RECHECK);
        return;
      }
      if (wasHeld) {
        wasHeld = false;
        timer = window.setTimeout(tick, Math.min(delay, RESUME_DELAY));
        return;
      }
      onAdvanceRef.current();
      timer = window.setTimeout(tick, delay);
    };

    const start = (wait = delay) => {
      clear();
      wasHeld = false;
      if (inView && !document.hidden) timer = window.setTimeout(tick, wait);
    };
    restartRef.current = () => start();

    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mouseInside = true;
    };
    const onPointerLeave = () => {
      mouseInside = false;
    };
    const onVisibility = () => {
      if (document.hidden) clear();
      else start();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const nowInView = entry.isIntersecting;
        if (nowInView === inView) return;
        inView = nowInView;
        if (inView) start();
        else clear();
      },
      { threshold }
    );
    io.observe(node);
    node.addEventListener("pointerover", onPointerOver);
    node.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clear();
      restartRef.current = () => {};
      io.disconnect();
      node.removeEventListener("pointerover", onPointerOver);
      node.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [delay, paused, pauseOnHover, threshold]);

  // Depois de uma troca manual, o próximo giro automático espera o intervalo inteiro
  const restart = useCallback(() => restartRef.current(), []);

  return { ref, restart };
}
