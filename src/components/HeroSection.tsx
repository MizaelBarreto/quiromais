"use client";

import { useRef, useEffect } from "react";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {});
    }
  }, []);

  return (
    <section id="hero" className="relative h-screen min-h-[600px] w-full overflow-hidden bg-[#2B2318]">
      {/* Clean Video background without overlaying text clutter */}
      <div className="absolute inset-0 w-full h-full">
        {/* Desktop video */}
        <video
          ref={videoRef}
          className="hidden md:block w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/quiro-hero-poster-desktop.jpg"
        >
          <source src="/videos/quiro-hero-desktop.webm" type="video/webm" />
        </video>
        {/* Mobile video */}
        <video
          className="md:hidden w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/quiro-hero-poster-mobile.jpg"
        >
          <source src="/videos/quiro-hero-mobile.webm" type="video/webm" />
        </video>

        {/* Subtle bottom gradient transition to section background */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F4EBDD] to-transparent pointer-events-none" />
      </div>

      {/* Subtle Scroll Indicator at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-70">
        <svg
          className="w-6 h-6 text-white animate-bounce-slow"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
