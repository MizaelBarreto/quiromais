"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_CATEGORIES, WHATSAPP_URL } from "@/lib/constants";

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
    { label: "Avaliações", href: "#avaliacoes" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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
                >
                  <a
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-dark/80 hover:text-gold transition-colors duration-300 rounded-lg hover:bg-dark/[0.03]"
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
                                        className="block text-left text-sm text-dark/70 hover:text-gold hover:pl-1 transition-all duration-200 w-full"
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
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex btn-gold text-sm"
              id="nav-cta-agendar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Agendar
            </a>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
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
                  <h4 className="font-serif text-xl font-semibold text-gold mb-3">
                    {cat.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleServiceClick(item.name)}
                        className="text-left text-sm text-dark/70 py-1.5 hover:text-gold transition-colors w-full"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* CTA mobile */}
              <motion.a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="btn-gold w-full justify-center text-base mt-8"
                id="mobile-cta-agendar"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Agendar Consulta
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
