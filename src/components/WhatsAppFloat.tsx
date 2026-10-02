"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHATSAPP_URL } from "@/lib/constants";

export default function WhatsAppFloat() {
  const [tooltip, setTooltip] = useState(false);
  // O anel pulsa em rajadas (3 pulsos a cada 12 s) em vez de sem parar: animação infinita num elemento
  // sempre visível obrigava o navegador a recalcular estilos a cada quadro, durante toda a visita
  const [pingKey, setPingKey] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setPingKey((k) => k + 1);
    }, 12000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3"
    >
      {/* Tooltip on the left of the button */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            aria-hidden="true"
            className="bg-[#2B2318] text-[#F4EBDD] border border-[#C9A15C]/40 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap"
          >
            Agende sua consulta
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onFocus={() => setTooltip(true)}
        onBlur={() => setTooltip(false)}
        className="group relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 bg-[#C9A15C] border-2 border-white/80 rounded-full shadow-[0_8px_30px_rgba(201,161,92,0.55)] hover:bg-[#D8B77E] hover:scale-110 transition-[background-color,transform] duration-300"
        aria-label="Agendar via WhatsApp"
        id="whatsapp-float-right"
      >
        {/* Pulse ring in gold */}
        <span
          key={pingKey}
          className="absolute inset-0 rounded-full bg-[#C9A15C] animate-ping [animation-iteration-count:3] opacity-35 pointer-events-none"
        />

        {/* White WhatsApp Icon (larger) */}
        <svg className="w-8 h-8 sm:w-9 sm:h-9 text-white relative z-10 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </motion.div>
  );
}
