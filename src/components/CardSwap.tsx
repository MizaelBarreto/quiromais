"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

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

  const swap = useCallback(() => {
    setOrder((prev) => {
      if (prev.length <= 1) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, []);

  useEffect(() => {
    if (externalPaused || (hoverPaused && pauseOnHover)) return;
    const interval = setInterval(swap, delay);
    return () => clearInterval(interval);
  }, [swap, delay, hoverPaused, pauseOnHover, externalPaused]);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      onMouseEnter={() => pauseOnHover && setHoverPaused(true)}
      onMouseLeave={() => pauseOnHover && setHoverPaused(false)}
    >
      <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
        {order.map((childIdx, stackPosition) => {
          const total = order.length;

          // Offsets based on cardDistance and verticalDistance
          const offsetX = stackPosition * (cardDistance * 0.4);
          const offsetY = stackPosition * (verticalDistance * 0.4);
          const scale = 1 - stackPosition * 0.06;
          const zIndex = total - stackPosition;

          return (
            <motion.div
              key={childIdx}
              layout
              initial={false}
              animate={{
                x: offsetX,
                y: offsetY,
                scale: scale,
                zIndex: zIndex,
                opacity: stackPosition > 3 ? 0 : 1 - stackPosition * 0.15,
              }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
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
