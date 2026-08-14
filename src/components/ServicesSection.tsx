"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CardSwap, { Card } from "./CardSwap";
import { SERVICES_DATA, WHATSAPP_NUMBER, type ServiceDetail } from "@/lib/constants";

function ServiceIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    neck: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 6a6 6 0 100 12 6 6 0 000-12z"/><path d="M18 18v6c0 3 2 5 6 5s6-2 6-5v-6"/><path d="M16 28c-2 2-4 6-4 12h24c0-6-2-10-4-12"/></svg>
    ),
    spine: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="20" y="4" width="8" height="5" rx="2"/><rect x="19" y="11" width="10" height="5" rx="2"/><rect x="18" y="18" width="12" height="5" rx="2"/><rect x="19" y="25" width="10" height="5" rx="2"/><rect x="18" y="32" width="12" height="6" rx="2"/><path d="M20 40h8l2 4H18l2-4z"/></svg>
    ),
    leg: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 6c0 0-4 10-4 18s2 18 2 18"/><path d="M26 6c0 0 4 10 4 18s-2 18-2 18"/><circle cx="24" cy="24" r="3"/></svg>
    ),
    twist: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="10" r="6"/><path d="M18 20c0 0 2 4 6 4s6-4 6-4"/><path d="M20 28l-4 14"/><path d="M28 28l4 14"/><path d="M14 24c2-2 6 0 10 0s8-2 10 0"/></svg>
    ),
    knee: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4v14"/><circle cx="24" cy="22" r="5"/><path d="M22 27l-2 17"/><path d="M26 27l2 17"/><path d="M19 22a5 5 0 010 0"/></svg>
    ),
    shield: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4L8 12v10c0 11 7 18 16 22 9-4 16-11 16-22V12L24 4z"/><path d="M16 22l6 6 10-12"/></svg>
    ),
    sport: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="8" r="4"/><path d="M20 16l-6 8 4 2 2 16h8l2-16 4-2-6-8"/></svg>
    ),
    pregnant: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="8" r="4"/><path d="M20 16v6c0 0 0 6 4 10 0 0 0 2 0 10"/><path d="M28 16v4c2 2 4 6 4 10s-4 8-8 8"/></svg>
    ),
    child: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="10" r="6"/><path d="M20 20v10l-4 12"/><path d="M28 20v10l4 12"/><path d="M20 26h8"/></svg>
    ),
    "spine-full": (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="24" cy="6" rx="4" ry="2"/><ellipse cx="24" cy="12" rx="5" ry="2"/><ellipse cx="24" cy="18" rx="6" ry="2"/><ellipse cx="24" cy="24" rx="6" ry="2"/><ellipse cx="24" cy="30" rx="5" ry="2"/><ellipse cx="24" cy="36" rx="5" ry="2"/><path d="M18 40l6 4 6-4"/></svg>
    ),
    head: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="16" r="12"/><path d="M16 26v10a4 4 0 004 4h8a4 4 0 004-4V26"/><path d="M18 12c2-4 8-4 12 0"/><path d="M10 16h4M34 16h4"/></svg>
    ),
    jaw: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="24" cy="14" r="10"/><path d="M14 20c0 8 4 16 10 18 6-2 10-10 10-18"/><path d="M20 24h8"/><circle cx="20" cy="14" r="1.5" fill="currentColor"/><circle cx="28" cy="14" r="1.5" fill="currentColor"/></svg>
    ),
    foot: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 8c0 0 2 20 2 26s6 8 10 8 8-2 8-6-2-8-6-10l-4-2c0 0 0-12-2-16"/><circle cx="30" cy="34" r="1"/><circle cx="34" cy="30" r="1"/><circle cx="26" cy="36" r="1"/></svg>
    ),
    ear: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M28 6c6 0 10 6 10 14s-4 12-6 16c-1 2 0 6-4 6s-4-4-2-8c2-3 4-6 4-10 0-6-4-8-6-8"/><path d="M22 14c-2 0-4 4-4 10s4 12 4 18"/></svg>
    ),
    needle: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M24 4v36"/><path d="M24 40l-2 4h4l-2-4z" fill="currentColor"/><path d="M20 12h8"/><path d="M20 18h8"/><path d="M20 24h8"/><circle cx="24" cy="6" r="2"/></svg>
    ),
    recovery: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 24c0-6.6 5.4-12 12-12s12 5.4 12 12-5.4 12-12 12"/><path d="M12 24l-4 4 4 4"/><path d="M24 16v8l6 4"/></svg>
    ),
  };

  return <div className="w-12 h-12 text-[#C9A15C] mb-3">{icons[icon] || icons.shield}</div>;
}

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  const currentCategory = SERVICES_DATA[activeTab];

  // Listen for open-service-modal event from NavMenu or links
  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEv = e as CustomEvent<{ serviceName: string }>;
      const targetName = customEv.detail?.serviceName;
      if (!targetName) return;

      // Find matching service & category
      SERVICES_DATA.forEach((cat, catIdx) => {
        const found = cat.services.find(
          (s) => s.name.toLowerCase().trim() === targetName.toLowerCase().trim()
        );
        if (found) {
          setActiveTab(catIdx);
          setSelectedService(found);
        }
      });
    };

    window.addEventListener("open-service-modal", handleOpenModal);
    return () => window.removeEventListener("open-service-modal", handleOpenModal);
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedService(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getServiceWhatsAppUrl = (serviceName: string) => {
    const msg = `Olá! Gostaria de agendar o serviço de ${serviceName} com a Dra. Priscila.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section id="servicos" className="section-padding bg-[#F4EBDD]/60 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[#C9A15C] text-xs tracking-[0.3em] uppercase font-semibold block mb-2">
            Nossos Serviços
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2B2318] mb-4">
            Cuidado completo para o seu corpo
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#C9A15C] to-transparent mx-auto mb-6" />
          <p className="text-[#2B2318]/70 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Clique em qualquer card para pausar e ver detalhes completos do tratamento.
          </p>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {SERVICES_DATA.map((cat, idx) => (
            <button
              key={cat.category}
              onClick={() => {
                setActiveTab(idx);
                setSelectedService(null);
              }}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeTab === idx
                  ? "bg-[#C9A15C] text-[#2B2318] shadow-lg scale-105"
                  : "bg-[#EFE2CE] text-[#2B2318]/70 hover:bg-[#C9A15C]/20 hover:text-[#2B2318]"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* CardSwap Container (Height: 600px) */}
        <div style={{ height: "600px", position: "relative" }} className="w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full"
            >
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={3000}
                pauseOnHover={true}
                isPaused={!!selectedService}
              >
                {currentCategory.services.map((service, sIdx) => (
                  <Card key={service.name} onClick={() => setSelectedService(service)}>
                    <div className="w-full h-[480px] bg-[#EFE2CE] rounded-3xl p-8 sm:p-10 border-2 border-[#C9A15C]/50 shadow-[0_20px_60px_rgba(43,35,24,0.15)] flex flex-col justify-between relative overflow-hidden backdrop-blur-md group hover:border-[#C9A15C] transition-all duration-300">
                      
                      {/* Top Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C9A15C] uppercase tracking-wider bg-[#2B2318] px-3.5 py-1 rounded-full">
                          {currentCategory.category}
                        </span>
                        <span className="text-xs font-semibold text-[#2B2318]/40">
                          0{sIdx + 1} / 0{currentCategory.services.length}
                        </span>
                      </div>

                      {/* Main Content */}
                      <div className="my-auto">
                        <ServiceIcon icon={service.icon} />
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2318] mb-3 leading-tight group-hover:text-[#C9A15C] transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-[#2B2318]/80 text-base sm:text-lg leading-relaxed font-medium mb-4 line-clamp-3">
                          {service.description}
                        </p>
                        <span className="text-xs font-bold text-[#C9A15C] uppercase tracking-wider underline underline-offset-4 flex items-center gap-1">
                          Ver detalhes do tratamento
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-4 border-t border-[#C9A15C]/20 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service);
                          }}
                          className="btn-gold text-xs py-2 px-4 flex items-center gap-2"
                        >
                          <span>Saber mais</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                        <span className="text-xs text-[#2B2318]/40 font-semibold">Quiro+</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Interactive Service Details Pop-up Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#EFE2CE] text-[#2B2318] border-2 border-[#C9A15C] rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.4)] relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#2B2318] text-white flex items-center justify-center hover:bg-[#C9A15C] hover:text-[#2B2318] transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-[#C9A15C] uppercase tracking-wider bg-[#2B2318] px-3.5 py-1 rounded-full">
                  {currentCategory.category}
                </span>
              </div>

              <ServiceIcon icon={selectedService.icon} />

              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B2318] mb-3 leading-tight">
                {selectedService.name}
              </h3>

              <p className="text-[#2B2318]/85 text-base sm:text-lg leading-relaxed mb-6 font-medium">
                {selectedService.details || selectedService.description}
              </p>

              {/* Benefits */}
              {selectedService.benefits && selectedService.benefits.length > 0 && (
                <div className="mb-6 bg-white/40 rounded-2xl p-5 border border-[#C9A15C]/20">
                  <h4 className="font-serif text-lg font-bold text-[#2B2318] mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9A15C]" />
                    Principais Benefícios
                  </h4>
                  <ul className="space-y-2">
                    {selectedService.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-sm text-[#2B2318]/80 font-medium">
                        <svg className="w-4 h-4 text-[#C9A15C] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Indications */}
              {selectedService.indications && (
                <div className="mb-8">
                  <h4 className="font-serif text-base font-bold text-[#2B2318] mb-1">
                    Indicado para:
                  </h4>
                  <p className="text-sm text-[#2B2318]/75 font-normal">
                    {selectedService.indications}
                  </p>
                </div>
              )}

              {/* Modal CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#C9A15C]/30">
                <a
                  href={getServiceWhatsAppUrl(selectedService.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full sm:w-auto justify-center text-sm py-3.5 px-8 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Agendar {selectedService.name} via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#2B2318]/20 text-[#2B2318] text-sm font-semibold hover:bg-black/5 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
