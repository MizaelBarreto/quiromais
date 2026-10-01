"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StrokeText from "./StrokeText";
import GlareHover from "./reactbits/GlareHover";
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // gsap.context: no unmount reverte só as animações desta seção (não mata ScrollTriggers de outras)
    const ctx = gsap.context(() => {
      if (isDesktop) {
        // Pin the spine container starting right at the cards section (below the title header)
        ScrollTrigger.create({
          trigger: cardsContainer,
          start: "top top",
          end: "bottom bottom",
          pin: stickyContainer,
          pinSpacing: false,
        });

        if (reduceMotion) return;

        // Travel down the spine: move it UPWARDS as the user scrolls DOWN.
        // Values are derived from the viewport so the proportions hold on any screen height:
        // the cervical starts at ~16% of the viewport (aligned with Card 01) and the sacrum
        // settles at ~88% of the viewport as the last card arrives.
        const centeredTop = () => (window.innerHeight - spineImg.offsetHeight) / 2;
        gsap.fromTo(
          spineImg,
          { y: () => window.innerHeight * 0.16 - centeredTop() },
          {
            y: () => window.innerHeight * 0.88 - spineImg.offsetHeight - centeredTop(),
            ease: "none",
            scrollTrigger: {
              trigger: cardsContainer,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.5,
              invalidateOnRefresh: true,
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
      } else if (!reduceMotion) {
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="quem-sou"
      className="relative bg-[#F4EBDD] w-full pt-16 pb-8 overflow-hidden"
    >
      {/* Title Header (Positioned above spine and cards, never overlapped) */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-12 lg:mb-16">
        <span className="text-gold-deep text-xs tracking-[0.3em] uppercase font-semibold block mb-2">
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
            <div className="absolute w-[460px] h-[460px] bg-radial from-[#C9A15C]/20 via-[#D8B77E]/10 to-transparent blur-3xl rounded-full opacity-70" />

            {/* Spine Image Container — proporção real da imagem (249×1003; a coluna ocupa ~58% da largura e ~95% da altura) */}
            <div
              ref={spineImgRef}
              className="relative h-[1300px] xl:h-[1560px] aspect-[249/1003] flex items-center justify-center"
            >
              <Image
                src="/images/coluna-vertebral.webp"
                alt=""
                fill
                unoptimized
                className="object-contain filter contrast-105 drop-shadow-[0_18px_30px_rgba(43,35,24,0.12)]"
                sizes="240px"
              />
            </div>
          </div>
        </div>

        {/* Mobile Spine Background Overlay */}
        <div className="lg:hidden absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 z-0">
          <div className="relative h-[880px] aspect-[249/1003]">
            <Image
              src="/images/coluna-vertebral.webp"
              alt=""
              fill
              unoptimized
              sizes="130px"
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
                  <div className="relative w-full">
                    {/* Gold Vertebrae / Section Badge (fora do GlareHover, que corta o que passa da borda) */}
                    <div className="absolute -top-4 right-8 z-10 bg-[#C9A15C] text-[#2B2318] text-xs font-bold px-4 py-1 rounded-full shadow-md tracking-wider uppercase" aria-hidden="true">
                      0{index + 1}
                    </div>

                    <GlareHover
                      width="100%"
                      height="auto"
                      background="#EFE2CE"
                      borderRadius="24px"
                      borderColor="rgba(201,161,92,0.45)"
                      glareColor="#ffffff"
                      glareOpacity={0.55}
                      glareAngle={-40}
                      glareSize={280}
                      transitionDuration={1400}
                      className="shadow-[0_20px_50px_rgba(43,35,24,0.14)]"
                      style={{ borderWidth: 2 }}
                    >
                      <div className="relative w-full p-8 sm:p-10">

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
                    </GlareHover>
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
