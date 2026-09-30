"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
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
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  isPaused?: boolean;
  className?: string;
}

export default function CardSwap({
  children,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 3000,
  pauseOnHover = true,
  isPaused: externalPaused = false,
  className = "",
}: CardSwapProps) {
  const childArray = React.Children.toArray(children);
  const [order, setOrder] = useState<number[]>(() => childArray.map((_, i) => i));
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  // Sem rotação automática para quem pediu menos movimento no sistema
  const reduceMotion = useReducedMotion();

  const swap = useCallback(() => {
    setOrder((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, []);

  useEffect(() => {
    if (reduceMotion || externalPaused || focusPaused || (hoverPaused && pauseOnHover)) return;
    const interval = setInterval(swap, delay);
    return () => clearInterval(interval);
  }, [swap, delay, hoverPaused, focusPaused, pauseOnHover, externalPaused, reduceMotion]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      onMouseEnter={() => pauseOnHover && setHoverPaused(true)}
      onMouseLeave={() => pauseOnHover && setHoverPaused(false)}
      onFocus={() => setFocusPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false);
      }}
    >
      <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
        {order.map((childIdx, stackPosition) => {
          const total = order.length;

          // Offsets based on cardDistance and verticalDistance
          const offsetX = stackPosition * (cardDistance * 0.4);
          const offsetY = stackPosition * (verticalDistance * 0.4);
          const scale = 1 - stackPosition * 0.06;
          // z-index muda na hora (não é animado): o card que vai para o fundo passa por trás
          // do novo card da frente, sem sobrepor os textos durante a troca.
          const zIndex = total - stackPosition;
          const isFront = stackPosition === 0;

          return (
            <motion.div
              key={childIdx}
              initial={false}
              animate={{
                x: offsetX,
                y: offsetY,
                scale: scale,
                opacity: stackPosition > 3 ? 0 : stackPosition === 3 ? 0.6 : 1,
              }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{ zIndex }}
              inert={!isFront}
              aria-hidden={!isFront}
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
            >
              {childArray[childIdx]}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
