"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StrokeText from "./StrokeText";
import { BIO_BLOCKS } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SpineScrollSection() {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const spineStickyRef = useRef<HTMLDivElement>(null);
  const spineImgRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cardsContainer = cardsContainerRef.current;
    const stickyContainer = spineStickyRef.current;
    const spineImg = spineImgRef.current;
    if (!cardsContainer || !stickyContainer || !spineImg) return;

    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      // Pin the spine container starting right at the cards section (below the title header)
      const pinST = ScrollTrigger.create({
        trigger: cardsContainer,
        start: "top top",
        end: "bottom bottom",
        pin: stickyContainer,
        pinSpacing: false,
      });

      // Travel down the spine: Move spine image UPWARDS as user scrolls DOWN
      // Cervical (C1-C7) starts aligned with Card 01 without clipping, sacrum finishes with Card 05
      gsap.fromTo(
        spineImg,
        { y: "20%" },
        {
          y: "-26%",
          ease: "none",
          scrollTrigger: {
            trigger: cardsContainer,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        }
      );

      // Animate each text card as the spine reaches that vertebrae level
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const isEven = i % 2 === 0;

        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isEven ? -90 : 90,
            scale: 0.92,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              end: "top 35%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      return () => {
        pinST.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    } else {
      // Mobile reveal
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }
  }, []);

  return (
    <section
      id="quem-sou"
      className="relative bg-[#F4EBDD] w-full pt-16 pb-8 overflow-hidden"
    >
      {/* Title Header (Positioned above spine and cards, never overlapped) */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-12 lg:mb-16">
        <span className="text-[#C9A15C] text-xs tracking-[0.3em] uppercase font-semibold block mb-2">
          Especialista em Coluna & Terapias Manuais
        </span>
        
        {/* StrokeText Animation */}
        <div className="flex justify-center items-center my-4 overflow-visible">
          <StrokeText
            text="Quem sou"
            strokeColor="#C9A15C"
            fillColor="#2B2318"
            strokeWidth={1.4}
            drawDuration={1.6}
            fillDelay={0.2}
            stagger={0.05}
            ease="power2.out"
            trigger="scroll"
            fillMode="wipe"
            fontSize={96}
            fontWeight={800}
            letterSpacing={-4}
            reverse={false}
          />
        </div>

        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A15C] to-transparent mx-auto mt-4" />
      </div>

      {/* Main Spine & Cards Scroll Container with compact, gapless height */}
      <div
        ref={cardsContainerRef}
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[160vh] lg:min-h-[185vh]"
      >
        {/* Pinned Sticky Spine Frame (Starts BELOW title header, aligned with Card 01) */}
        <div
          ref={spineStickyRef}
          className="hidden lg:flex absolute inset-x-0 top-0 h-screen w-full pointer-events-none z-10 items-center justify-center overflow-hidden"
        >
          <div className="relative w-[340px] xl:w-[380px] h-screen flex items-center justify-center">
            {/* Soft ambient background glow */}
            <div className="absolute w-[380px] h-[380px] bg-radial from-[#C9A15C]/20 via-[#D8B77E]/10 to-transparent blur-3xl rounded-full opacity-70" />

            {/* Spine Image Container */}
            <div
              ref={spineImgRef}
              className="relative w-full h-[1100px] flex items-center justify-center"
            >
              <Image
                src="/images/colunacervicalsemfundo.png"
                alt="Coluna Vertebral Cervical - Quiro+"
                fill
                priority
                unoptimized
                className="object-contain filter contrast-105 opacity-100"
                sizes="380px"
              />
            </div>
          </div>
        </div>

        {/* Mobile Spine Background Overlay */}
        <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 z-0">
          <div className="relative w-80 h-[700px]">
            <Image
              src="/images/colunacervicalsemfundo.png"
              alt="Coluna Vertebral"
              fill
              unoptimized
              sizes="320px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Alternating Scroll Cards Stack */}
        <div className="relative z-20 space-y-24 lg:space-y-36 pt-4 pb-8">
          {BIO_BLOCKS.map((block, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-12 items-center w-full">
                <div
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={`col-span-1 ${
                    isEven ? "lg:col-span-5" : "lg:col-start-8 lg:col-span-5"
                  } w-full`}
                >
                  {/* Defined Luxury Card */}
                  <div className="w-full bg-[#EFE2CE] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(43,35,24,0.14)] border-2 border-[#C9A15C]/45 hover:border-[#C9A15C] transition-all duration-500 relative backdrop-blur-md">
                    {/* Gold Vertebrae / Section Badge */}
                    <div className="absolute -top-4 right-8 bg-[#C9A15C] text-[#2B2318] text-xs font-bold px-4 py-1 rounded-full shadow-md tracking-wider uppercase">
                      0{index + 1}
                    </div>

                    {block.showPhoto && (
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#C9A15C] shadow-lg flex-shrink-0">
                          <Image
                            src="/images/fotoPriscila.png"
                            alt="Priscila Santos"
                            fill
                            className="object-cover object-top"
                            sizes="144px"
                          />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2318] mb-2 leading-tight">
                            {block.title}
                          </h3>
                          <p className="text-[#2B2318]/80 text-base leading-relaxed font-medium">
                            {block.text}
                          </p>
                        </div>
                      </div>
                    )}

                    {!block.showPhoto && (
                      <div>
                        {block.title && (
                          <h3 className="font-serif text-2xl font-bold text-[#2B2318] mb-3">
                            {block.title}
                          </h3>
                        )}
                        <p className="text-[#2B2318]/85 text-base sm:text-lg leading-relaxed font-medium">
                          {block.text}
                        </p>
                      </div>
                    )}

                    {/* Bottom Line Decor */}
                    <div className="mt-6 flex items-center gap-2">
                      <span className="w-12 h-0.5 bg-[#C9A15C]" />
                      <span className="w-2 h-2 rounded-full bg-[#C9A15C]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
