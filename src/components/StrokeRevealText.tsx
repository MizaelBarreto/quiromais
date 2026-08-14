"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface StrokeRevealTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  className?: string;
}

export default function StrokeRevealText({
  text,
  strokeColor = "#C9A15C",
  fillColor = "#2B2318",
  fontSize = 96,
  fontWeight = 700,
  letterSpacing = -2,
  className = "",
}: StrokeRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const textElements = svg.querySelectorAll<SVGTextElement>(".stroke-letter");
    const fillElements = svg.querySelectorAll<SVGTextElement>(".fill-letter");

    // Measure for stroke-dasharray
    textElements.forEach((el) => {
      const length = el.getComputedTextLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
    });

    fillElements.forEach((el) => {
      el.style.opacity = "0";
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          // Animate stroke draw
          gsap.to(textElements, {
            strokeDashoffset: 0,
            duration: 1.6,
            stagger: 0.06,
            ease: "power2.out",
          });

          // Animate fill reveal after stroke
          gsap.to(fillElements, {
            opacity: 1,
            duration: 0.8,
            stagger: 0.04,
            delay: 0.8,
            ease: "power2.out",
          });
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  const letters = text.split("");

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${letters.length * fontSize * 0.65} ${fontSize * 1.3}`}
        className="w-full max-w-full h-auto"
        style={{ maxHeight: fontSize * 1.3 }}
        aria-label={text}
        role="heading"
      >
        {letters.map((letter, i) => (
          <g key={`${letter}-${i}`}>
            {/* Stroke layer */}
            <text
              className="stroke-letter"
              x={i * fontSize * 0.6 + fontSize * 0.1}
              y={fontSize}
              fontSize={fontSize}
              fontWeight={fontWeight}
              fontFamily="'Cormorant Garamond', serif"
              letterSpacing={letterSpacing}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.4}
            >
              {letter}
            </text>
            {/* Fill layer */}
            <text
              className="fill-letter"
              x={i * fontSize * 0.6 + fontSize * 0.1}
              y={fontSize}
              fontSize={fontSize}
              fontWeight={fontWeight}
              fontFamily="'Cormorant Garamond', serif"
              letterSpacing={letterSpacing}
              fill={fillColor}
              stroke="none"
            >
              {letter}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
