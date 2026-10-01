// Google Analytics 4. O script só é carregado depois que a pessoa aceita os cookies
// (ver CookieConsent); antes disso, trackEvent não faz nada.

const id = process.env.NEXT_PUBLIC_GA_ID ?? "";
export const GA_ID = /^G-[A-Z0-9]+$/.test(id) ? id : "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.("event", name, params);
}
