"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_CATEGORIES, WHATSAPP_URL } from "@/lib/constants";
import GoldButton from "./GoldButton";
import WhatsAppIcon from "./icons/WhatsAppIcon";

export default function NavMenu() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Esc fecha o menu mobile e o dropdown
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMobileOpen(false);
      setActiveCategory(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 200);
  };

  const handleServiceClick = (serviceName: string) => {
    setActiveCategory(null);
    setMobileOpen(false);

    // Dispatch custom event to open service pop-up modal directly
    window.dispatchEvent(
      new CustomEvent("open-service-modal", {
        detail: { serviceName },
      })
    );

    // Smooth scroll to services section
    const el = document.getElementById("servicos");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Início", href: "#hero" },
    { label: "Quem Sou", href: "#quem-sou" },
    { label: "Serviços", href: "#servicos", hasDropdown: true },
    { label: "Galeria", href: "#galeria" },
    { label: "Vídeos", href: "#videos" },
    { label: "Avaliações", href: "#avaliacoes" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow] duration-500 ${
          scrolled
            ? "glass shadow-[0_4px_30px_rgba(43,35,24,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a
              href="#hero"
              className="flex items-center gap-1 group"
              aria-label="Quiro+ - Voltar ao início"
            >
              <span className="font-serif text-3xl font-bold text-dark tracking-tight group-hover:text-gold transition-colors duration-300">
                Quiro
              </span>
              <span className="font-serif text-3xl font-bold text-gold tracking-tight">
                +
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasDropdown ? handleMouseEnter(0) : setActiveCategory(null)
                  }
                  onMouseLeave={link.hasDropdown ? handleMouseLeave : undefined}
                  onFocus={link.hasDropdown ? () => handleMouseEnter(0) : undefined}
                  onBlur={
                    link.hasDropdown
                      ? (e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveCategory(null);
                        }
                      : undefined
                  }
                >
                  <a
                    href={link.href}
                    className="px-2.5 xl:px-4 py-2 text-sm font-medium text-dark/80 hover:text-gold-deep transition-colors duration-300 rounded-lg hover:bg-dark/[0.03]"
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <svg
                        className="inline-block ml-1 w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </a>

                  {/* Dropdown */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {activeCategory !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.97 }}
                          transition={{
                            duration: 0.25,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-cream rounded-2xl shadow-[0_20px_60px_rgba(43,35,24,0.12)] border border-gold-light/20 p-6"
                          onMouseEnter={() => {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                          }}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="grid grid-cols-3 gap-6">
                            {NAV_CATEGORIES.map((cat) => (
                              <div key={cat.title}>
                                <h4 className="font-serif text-lg font-semibold text-dark mb-3 pb-2 border-b border-gold-light/30">
                                  {cat.title}
                                </h4>
                                <ul className="space-y-1.5">
                                  {cat.items.map((item) => (
                                    <li key={item.name}>
                                      <button
                                        type="button"
                                        onClick={() => handleServiceClick(item.name)}
                                        className="block text-left text-sm text-dark/70 hover:text-gold-deep hover:pl-1 transition-[color,padding] duration-200 w-full"
                                      >
                                        {item.name}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Desktop */}
            <div className="hidden lg:block">
              <GoldButton href={WHATSAPP_URL} size="sm" id="nav-cta-agendar">
                <WhatsAppIcon className="w-5 h-5" />
                Agendar
              </GoldButton>
            </div>

            {/* Hamburger mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative w-11 h-11 flex items-center justify-center"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              id="mobile-menu-toggle"
            >
              <div className="space-y-1.5">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-dark origin-center"
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  className="block w-6 h-0.5 bg-dark"
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-dark origin-center"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cream"
            id="mobile-menu"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="pt-24 px-6 pb-8 h-full overflow-y-auto"
            >
              {/* Nav Links */}
              <div className="space-y-2 mb-8">
                {navLinks
                  .filter((l) => !l.hasDropdown)
                  .map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="block font-serif text-3xl font-semibold text-dark py-2 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ))}
              </div>

              {/* Categories */}
              {NAV_CATEGORIES.map((cat, ci) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + ci * 0.1 }}
                  className="mb-6"
                >
                  <h4 className="font-serif text-xl font-semibold text-gold-deep mb-3">
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleServiceClick(item.name)}
                        className="text-left text-sm text-dark/75 py-2.5 hover:text-gold-deep transition-colors w-full"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* CTA mobile */}

              <motion.div

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.6 }}

                className="mt-8"

              >

                <GoldButton href={WHATSAPP_URL} size="lg" fullWidth id="mobile-cta-agendar">

                  <WhatsAppIcon className="w-5 h-5" />

                  Agendar Consulta

                </GoldButton>

              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
