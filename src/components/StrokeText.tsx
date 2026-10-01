"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: "mount" | "scroll" | "hover";
  fillMode?: "wipe" | "fade" | "none";
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  reverse?: boolean;
  className?: string;
  /** Nível do título para leitores de tela (o SVG faz o papel de um <h2>, <h3>…) */
  headingLevel?: number;
}

function getCharWidthRatio(char: string): number {
  if (char === " ") return 0.35;
  if (char === "Q" || char === "W" || char === "M") return 0.85;
  if (char === "m" || char === "w") return 0.72;
  if (/[A-Z]/.test(char)) return 0.70;
  if (/[i|l|f|j|t]/.test(char)) return 0.35;
  return 0.55; // default lowercase
}

export default function StrokeText({
  text,
  strokeColor = "#C9A15C",
  fillColor = "#2B2318",
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = "power2.out",
  trigger = "scroll",
  fillMode = "wipe",
  fontSize = 96,
  fontWeight = 800,
  letterSpacing = -4,
  reverse = false,
  className = "",
  headingLevel = 2,
}: StrokeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [measuredOffsets, setMeasuredOffsets] = useState<number[] | null>(null);

  const letters = useMemo(() => text.split(""), [text]);

  // Initial estimate of X offsets
  const estimatedLayout = useMemo(() => {
    const offsets: number[] = [];
    let currentX = fontSize * 0.15;
    letters.forEach((char) => {
      offsets.push(currentX);
      const w = fontSize * getCharWidthRatio(char) + letterSpacing;
      currentX += Math.max(w, 10);
    });
    return { offsets, totalWidth: currentX + fontSize * 0.2 };
  }, [letters, fontSize, letterSpacing]);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    // Accurately measure SVG text element lengths after the web font has loaded
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const strokeLetters = svg.querySelectorAll<SVGTextElement>(".st-letter-stroke");
      if (strokeLetters.length !== letters.length) return;
      const realOffsets: number[] = [];
      let currentX = fontSize * 0.15;
      strokeLetters.forEach((el, idx) => {
        realOffsets.push(currentX);
        try {
          const len = el.getComputedTextLength();
          currentX += (len > 0 ? len : fontSize * getCharWidthRatio(letters[idx])) + letterSpacing;
        } catch {
          currentX += fontSize * getCharWidthRatio(letters[idx]) + letterSpacing;
        }
      });
      setMeasuredOffsets(realOffsets);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [text, fontSize, letterSpacing, letters]);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const strokeLetters = svg.querySelectorAll<SVGTextElement>(".st-letter-stroke");
    const fillLetters = svg.querySelectorAll<SVGTextElement>(".st-letter-fill");

    // Initialize stroke dasharray/offset
    strokeLetters.forEach((el) => {
      try {
        const len = el.getComputedTextLength() * 3;
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = `${reverse ? -len : len}`;
      } catch {
        el.style.strokeDasharray = "500";
        el.style.strokeDashoffset = reverse ? "-500" : "500";
      }
    });

    if (fillMode === "wipe") {
      fillLetters.forEach((el) => {
        el.style.clipPath = "inset(0 100% 0 0)";
        el.style.opacity = "1";
      });
    } else if (fillMode === "fade") {
      fillLetters.forEach((el) => {
        el.style.opacity = "0";
      });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      strokeLetters.forEach((el) => (el.style.strokeDashoffset = "0"));
      fillLetters.forEach((el) => {
        el.style.clipPath = "none";
        el.style.opacity = "1";
      });
      return;
    }

    const runAnimation = () => {
      const tl = gsap.timeline();

      // Animate stroke draw
      tl.to(strokeLetters, {
        strokeDashoffset: 0,
        duration: drawDuration,
        stagger: reverse ? -stagger : stagger,
        ease: ease,
      });

      // Animate fill
      if (fillMode === "wipe") {
        tl.to(
          fillLetters,
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.8,
            stagger: stagger * 0.8,
            ease: "power2.inOut",
          },
          `+=${fillDelay}`
        );
      } else if (fillMode === "fade") {
        tl.to(
          fillLetters,
          {
            opacity: 1,
            duration: 0.6,
            stagger: stagger * 0.8,
            ease: "power2.out",
          },
          `+=${fillDelay}`
        );
      }
    };

    if (trigger === "mount") {
      runAnimation();
    } else if (trigger === "scroll") {
      const st = ScrollTrigger.create({
        trigger: container,
        start: "top 85%",
        onEnter: () => runAnimation(),
        once: true,
      });
      return () => st.kill();
    }
  }, [text, drawDuration, fillDelay, stagger, ease, trigger, fillMode, reverse, measuredOffsets]);

  const xOffsets = measuredOffsets || estimatedLayout.offsets;
  const totalWidth = estimatedLayout.totalWidth;
  const height = fontSize * 1.3;

  return (
    <div ref={containerRef} className={`inline-block max-w-full ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
        role="heading"
        aria-level={headingLevel}
        aria-label={text}
      >
        <g>
          {/* Stroke Layer */}
          {letters.map((char, i) => (
            <text
              key={`stroke-${i}`}
              className="st-letter-stroke"
              x={xOffsets[i] ?? i * (fontSize * 0.6)}
              y={fontSize * 0.9}
              fontSize={fontSize}
              fontWeight={fontWeight}
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {char === " " ? "\u00A0" : char}
            </text>
          ))}

          {/* Fill Layer */}
          {fillMode !== "none" &&
            letters.map((char, i) => (
              <text
                key={`fill-${i}`}
                className="st-letter-fill"
                x={xOffsets[i] ?? i * (fontSize * 0.6)}
                y={fontSize * 0.9}
                fontSize={fontSize}
                fontWeight={fontWeight}
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                fill={fillColor}
                stroke="none"
              >
                {char === " " ? "\u00A0" : char}
              </text>
            ))}
        </g>
      </svg>
    </div>
  );
}
