"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nome é obrigatório";
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) newErrors.phone = "Telefone inválido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "E-mail inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const message = `Olá! Gostaria de agendar minha avaliação.\n\nNome: ${form.name}\nTelefone: ${form.phone}${
      form.email ? `\nE-mail: ${form.email}` : ""
    }`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;

    setSubmitted(true);

    setTimeout(() => {
      window.open(url, "_blank");
    }, 800);
  };

  return (
    <section id="contato" className="section-padding bg-[#2B2318] text-[#F4EBDD] relative overflow-hidden py-24 sm:py-32">
      {/* Background Animated Glows (CTA-01 Style) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A15C]/15 rounded-full blur-3xl pointer-events-none animate-pulse-gold" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D8B77E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main CTA-01 Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-b from-[#2B2318] to-[#1E1810] border border-[#C9A15C]/35 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-[0_25px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl relative overflow-hidden"
        >
          {/* Top Gold Shimmer Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A15C] to-transparent" />

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#C9A15C]/15 border border-[#C9A15C]/30 text-[#C9A15C] text-xs font-semibold uppercase tracking-widest">
                Agendamento Rápido
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Pronto para viver <br className="hidden sm:inline" />
                <span className="text-[#C9A15C]">sem dores?</span>
              </h2>

              <p className="text-[#F4EBDD]/70 text-base sm:text-lg leading-relaxed font-normal">
                Preencha seus dados ao lado para agendarmos sua consulta
                personalizada com a Dra. Priscila Santos.
              </p>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-[#F4EBDD]/60 font-medium">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-[#C9A15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Atendimento Humanizado</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                  <svg className="w-4 h-4 text-[#C9A15C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Resposta pelo WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Right Form Column (CTA-01 Interactive Input Block) */}
            <div className="lg:col-span-6 w-full">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#EFE2CE] text-[#2B2318] rounded-2xl p-10 text-center shadow-2xl border border-[#C9A15C]"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#C9A15C] text-[#2B2318] flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-2xl font-bold mb-2">Solicitação Enviada!</h3>
                    <p className="text-[#2B2318]/70 text-sm">
                      Você está sendo redirecionado(a) ao WhatsApp para agendar sua consulta.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Name Input */}
                    <div className="relative">
                      <motion.div
                        animate={
                          activeInput === "name"
                            ? { scale: 1.01, borderColor: "#C9A15C" }
                            : { scale: 1, borderColor: "rgba(201, 161, 92, 0.25)" }
                        }
                        className="bg-white/5 backdrop-blur-md rounded-2xl border transition-all p-4"
                      >
                        <label htmlFor="cta-name" className="block text-xs uppercase tracking-wider font-semibold text-[#C9A15C] mb-1">
                          Nome Completo *
                        </label>
                        <input
                          id="cta-name"
                          type="text"
                          value={form.name}
                          onFocus={() => setActiveInput("name")}
                          onBlur={() => setActiveInput(null)}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Digite seu nome"
                          className="w-full bg-transparent text-white placeholder-white/30 text-base outline-none font-medium"
                        />
                      </motion.div>
                      {errors.name && (
                        <span className="text-red-400 text-xs mt-1 block px-2">
                          {errors.name}
                        </span>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div className="relative">
                      <motion.div
                        animate={
                          activeInput === "phone"
                            ? { scale: 1.01, borderColor: "#C9A15C" }
                            : { scale: 1, borderColor: "rgba(201, 161, 92, 0.25)" }
                        }
                        className="bg-white/5 backdrop-blur-md rounded-2xl border transition-all p-4"
                      >
                        <label htmlFor="cta-phone" className="block text-xs uppercase tracking-wider font-semibold text-[#C9A15C] mb-1">
                          Telefone / WhatsApp *
                        </label>
                        <input
                          id="cta-phone"
                          type="tel"
                          value={form.phone}
                          onFocus={() => setActiveInput("phone")}
                          onBlur={() => setActiveInput(null)}
                          onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                          placeholder="(XX) XXXXX-XXXX"
                          className="w-full bg-transparent text-white placeholder-white/30 text-base outline-none font-medium"
                        />
                      </motion.div>
                      {errors.phone && (
                        <span className="text-red-400 text-xs mt-1 block px-2">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <motion.div
                        animate={
                          activeInput === "email"
                            ? { scale: 1.01, borderColor: "#C9A15C" }
                            : { scale: 1, borderColor: "rgba(201, 161, 92, 0.25)" }
                        }
                        className="bg-white/5 backdrop-blur-md rounded-2xl border transition-all p-4"
                      >
                        <label htmlFor="cta-email" className="block text-xs uppercase tracking-wider font-semibold text-[#C9A15C] mb-1">
                          E-mail <span className="text-white/30 font-normal">(Opcional)</span>
                        </label>
                        <input
                          id="cta-email"
                          type="email"
                          value={form.email}
                          onFocus={() => setActiveInput("email")}
                          onBlur={() => setActiveInput(null)}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="w-full bg-transparent text-white placeholder-white/30 text-base outline-none font-medium"
                        />
                      </motion.div>
                      {errors.email && (
                        <span className="text-red-400 text-xs mt-1 block px-2">
                          {errors.email}
                        </span>
                      )}
                    </div>

                    {/* Submit Button (CTA-01 Shimmer Button) */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full mt-2 py-4 px-8 rounded-2xl bg-[#C9A15C] text-[#2B2318] font-bold text-base shadow-[0_10px_30px_rgba(201,161,92,0.35)] hover:bg-[#D8B77E] transition-all flex items-center justify-center gap-3 group"
                    >
                      <span>Quero Agendar Minha Avaliação</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7-7m7-7H3" />
                      </svg>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
