"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WHATSAPP_NUMBER, CONTACT_INFO } from "@/lib/constants";
import SplitText from "./reactbits/SplitText";
import FoldText from "./reactbits/FoldText";
import GoldButton from "./GoldButton";

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

  const fieldError = (field: "name" | "phone" | "email", value: string) => {
    if (field === "name" && !value.trim()) return "Nome é obrigatório";
    if (field === "phone" && value.replace(/\D/g, "").length < 10) return "Telefone inválido";
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido";
    return "";
  };

  // Validação ao sair do campo (só depois que a pessoa digitou algo)
  const validateOnBlur = (field: "name" | "phone" | "email") => {
    setActiveInput(null);
    if (!form[field]) return;
    const msg = fieldError(field, form[field]);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    (["name", "phone", "email"] as const).forEach((f) => {
      const msg = fieldError(f, form[f]);
      if (msg) newErrors[f] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const whatsappUrl = () => {
    const message = `Olá! Gostaria de agendar minha avaliação.\n\nNome: ${form.name}\nTelefone: ${form.phone}${
      form.email ? `\nE-mail: ${form.email}` : ""
    }`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Abre no mesmo clique: dentro de setTimeout o Safari/iOS bloqueia como pop-up
    const url = whatsappUrl();
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    setSubmitted(true);
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

              <h2
                className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
                aria-label="Pronto para viver sem dores?"
              >
                {/* React Bits — Split Text + Fold Text */}
                <SplitText
                  tag="span"
                  text="Pronto para viver"
                  className="leading-[1.15] pb-1"
                  splitType="words"
                  delay={110}
                  duration={1}
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.2}
                  rootMargin="-40px"
                  textAlign="inherit"
                />
                <br />
                <span className="text-[#C9A15C]">
                  <FoldText
                    text="sem dores?"
                    splitBy="char"
                    hinge="bottom"
                    trigger="scroll"
                    duration={0.7}
                    stagger={0.05}
                    creaseShading={0.45}
                    fontSize="inherit"
                    fontWeight="inherit"
                    color="currentColor"
                    style={{ letterSpacing: "normal", lineHeight: 1.15 }}
                  />
                </span>
              </h2>

              <p className="text-[#F4EBDD]/70 text-base sm:text-lg leading-relaxed font-normal">
                Preencha seus dados ao lado para agendarmos sua consulta
                personalizada com a Dra. Priscila Santos.
              </p>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-[#F4EBDD]/75 font-medium">
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

              {/* Onde estamos */}
              <address className="not-italic pt-2 flex flex-col items-center lg:items-start gap-3 text-sm text-[#F4EBDD]/75">
                <a
                  href={CONTACT_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2.5 text-left hover:text-[#D8B77E] transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mt-0.5 text-[#C9A15C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    {CONTACT_INFO.addressLines[0]}
                    <br />
                    {CONTACT_INFO.addressLines[1]}
                    <span className="block text-xs text-[#C9A15C] mt-1 underline underline-offset-4 decoration-[#C9A15C]/40 group-hover:decoration-[#C9A15C]">
                      Como chegar
                    </span>
                  </span>
                </a>
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="inline-flex items-center gap-2.5 hover:text-[#D8B77E] transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-[#C9A15C] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {CONTACT_INFO.phone}
                </a>
              </address>
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
                    <p className="text-[#2B2318]/75 text-sm" role="status">
                      Você está sendo redirecionado(a) ao WhatsApp para agendar sua consulta.
                    </p>
                    <a
                      href={whatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-sm font-semibold text-gold-deep underline underline-offset-4"
                    >
                      O WhatsApp não abriu? Toque aqui
                    </a>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    noValidate
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
                          onBlur={() => validateOnBlur("name")}
                          name="name"
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "cta-name-error" : undefined}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Digite seu nome"
                          className="w-full bg-transparent text-white placeholder-white/40 text-base outline-none font-medium"
                        />
                      </motion.div>
                      {errors.name && (
                        <span id="cta-name-error" role="alert" className="text-red-300 text-xs mt-1 block px-2">
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
                          onBlur={() => validateOnBlur("phone")}
                          name="phone"
                          autoComplete="tel"
                          inputMode="tel"
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "cta-phone-error" : undefined}
                          onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                          placeholder="(XX) XXXXX-XXXX"
                          className="w-full bg-transparent text-white placeholder-white/40 text-base outline-none font-medium"
                        />
                      </motion.div>
                      {errors.phone && (
                        <span id="cta-phone-error" role="alert" className="text-red-300 text-xs mt-1 block px-2">
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
                          onBlur={() => validateOnBlur("email")}
                          name="email"
                          autoComplete="email"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "cta-email-error" : undefined}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="w-full bg-transparent text-white placeholder-white/40 text-base outline-none font-medium"
                        />
                      </motion.div>
                      {errors.email && (
                        <span id="cta-email-error" role="alert" className="text-red-300 text-xs mt-1 block px-2">
                          {errors.email}
                        </span>
                      )}
                    </div>

                    {/* Submit — React Bits Star Border */}
                    <GoldButton type="submit" size="lg" tone="onDark" fullWidth wrap className="mt-2">
                      <span>Quero Agendar Minha Avaliação</span>
                      <svg className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover/gold:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </GoldButton>
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
