"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import useCarouselAutoplay from "@/hooks/useCarouselAutoplay";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Nome do card: aparece na beirada dele enquanto está atrás da pilha */
  label?: string;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`w-full h-full cursor-pointer ${className}`}
    >
      {children}
    </div>
  );
}

export interface CardSwapProps {
  children: React.ReactNode;
  /** Quanto cada card de trás aparece à direita do da frente (px) */
  cardDistance?: number;
  /** Quanto cada card de trás aparece abaixo do da frente (px): é a faixa clicável dele */
  verticalDistance?: number;
  cardHeight?: number;
  /** Cards à mostra na pilha (o da frente + os de trás); os demais esperam escondidos no fundo */
  maxVisible?: number;
  delay?: number;
  pauseOnHover?: boolean;
  isPaused?: boolean;
  className?: string;
}

export default function CardSwap({
  children,
  cardDistance = 22,
  verticalDistance = 26,
  cardHeight = 480,
  maxVisible = 4,
  delay = 3000,
  pauseOnHover = true,
  isPaused = false,
  className = "",
}: CardSwapProps) {
  const childArray = React.Children.toArray(children) as React.ReactElement<CardProps>[];
  const total = childArray.length;
  const [order, setOrder] = useState<number[]>(() => childArray.map((_, i) => i));
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Card trazido para a frente pelo teclado: recebe o foco quando chegar lá
  const focusOnFront = useRef<number | null>(null);

  const visible = Math.max(1, Math.min(maxVisible, total));
  const spreadX = (visible - 1) * cardDistance;
  const spreadY = (visible - 1) * verticalDistance;

  const { ref, restart } = useCarouselAutoplay<HTMLDivElement>({
    delay,
    pauseOnHover,
    paused: isPaused,
    onAdvance: () => setOrder((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev)),
  });

  // Traz o card clicado para a frente; os que estavam na frente dele vão para o fundo, na mesma ordem
  const bringToFront = (childIdx: number, fromKeyboard: boolean) => {
    if (fromKeyboard) focusOnFront.current = childIdx;
    setOrder((prev) => {
      const pos = prev.indexOf(childIdx);
      return pos > 0 ? [...prev.slice(pos), ...prev.slice(0, pos)] : prev;
    });
    restart();
  };

  useEffect(() => {
    const idx = focusOnFront.current;
    if (idx === null || order[0] !== idx) return;
    focusOnFront.current = null;
    contentRefs.current[idx]
      ?.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
      ?.focus();
  }, [order]);

  return (
    <div ref={ref} className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* A pilha ocupa o card da frente + a faixa dos de trás, centralizada no espaço disponível */}
      <div
        className="w-full"
        style={{ maxWidth: `calc(28rem + ${spreadX}px)`, paddingRight: spreadX, paddingBottom: spreadY }}
      >
        <div className="relative w-full" style={{ height: cardHeight }}>
          {childArray.map((child, childIdx) => {
            const pos = order.indexOf(childIdx);
            const slot = Math.min(pos, visible - 1);
            const isFront = pos === 0;
            const shown = pos < visible;
            const label = child.props.label;

            return (
              <motion.div
                key={child.key ?? childIdx}
                initial={false}
                animate={{
                  x: slot * cardDistance,
                  y: slot * verticalDistance,
                  scale: 1 - slot * 0.05,
                  opacity: shown ? 1 : 0,
                }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                // z-index muda na hora (não é animado): o card que vai para o fundo passa por trás
                // do novo card da frente, sem sobrepor os textos durante a troca.
                // Escala a partir do canto inferior direito: cada card de trás mostra só a faixa de baixo/direita.
                style={{ zIndex: total - pos, transformOrigin: "100% 100%" }}
                className={`absolute inset-0 ${shown ? "" : "pointer-events-none"}`}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-300 ease-out ${
                    isFront ? "" : "hover:translate-x-1 hover:translate-y-1.5"
                  }`}
                >
                  <div
                    ref={(el) => {
                      contentRefs.current[childIdx] = el;
                    }}
                    className="w-full h-full"
                    inert={!isFront}
                  >
                    {child}
                  </div>

                  {/* Cards de trás: clicar (ou Enter no teclado) traz para a frente */}
                  {!isFront && shown && (
                    <button
                      type="button"
                      className="group/back absolute inset-0 z-10 rounded-3xl"
                      aria-label={label ? `Trazer para a frente: ${label}` : "Trazer este card para a frente"}
                      onClick={(e) => bringToFront(childIdx, e.detail === 0)}
                    >
                      {label && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-7 bottom-0 flex items-center justify-between gap-3 text-[12px] font-semibold uppercase tracking-wider text-[#2B2318]/65 transition-colors duration-300 group-hover/back:text-gold-deep"
                          style={{ height: verticalDistance }}
                        >
                          <span className="truncate">{label}</span>
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
