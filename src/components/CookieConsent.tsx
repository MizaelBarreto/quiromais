"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GA_ID } from "@/lib/analytics";
import { PRIVACY_POLICY_PATH } from "@/lib/constants";
import {
  COOKIE_CHOICE_ATTR,
  OPEN_PREFERENCES_EVENT,
  readCookieChoice,
  saveCookieChoice,
  subscribeCookieChoice,
  type CookieChoice,
} from "@/lib/consent";

// Banner de cookies (LGPD) + Google Analytics. O GA só é carregado depois do "Aceitar";
// "Recusar" depois de aceitar desliga o GA e apaga os cookies dele. Sem NEXT_PUBLIC_GA_ID
// o site não usa cookies de análise, então nada é exibido.
//
// O banner vem pronto no HTML e o script `cookieChoiceScript` (no <head>) marca o <html> com a
// escolha salva antes da primeira pintura: quem já escolheu não vê o banner piscar, e quem não
// escolheu o vê imediatamente, sem esperar o JavaScript.

function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_") || n === "_gid" || n === "_gat");
  const parts = location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join(".")}`);
  for (const n of names) for (const d of domains) document.cookie = `${n}=; Max-Age=0; path=/${d}`;
}

export default function CookieConsent() {
  // undefined = ainda no servidor / hidratando (não sabemos a escolha)
  const choice = useSyncExternalStore<CookieChoice | null | undefined>(
    subscribeCookieChoice,
    readCookieChoice,
    () => undefined,
  );
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const onOpen = () => setReopened(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!GA_ID || choice === undefined) return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = choice !== "granted";
    if (choice === "denied") clearAnalyticsCookies();
  }, [choice]);

  if (!GA_ID) return null;

  const decide = (c: CookieChoice) => {
    saveCookieChoice(c);
    document.documentElement.setAttribute(COOKIE_CHOICE_ATTR, c);
    setReopened(false);
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      <div
        data-cookie-banner=""
        data-open={reopened ? "" : undefined}
        role="dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-desc"
        className="animate-slide-up-in fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
      >
        <div className="rounded-2xl border border-gold/35 bg-dark p-5 text-cream shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
          <p id="cookie-title" className="font-serif text-xl font-semibold text-white">
            Cookies e privacidade
          </p>
          <p id="cookie-desc" className="mt-2 text-sm leading-relaxed text-cream/80">
            Usamos cookies de análise (Google Analytics) para entender como o site é usado e melhorá-lo. Eles só são
            ativados se você aceitar. Saiba mais na{" "}
            <Link
              href={PRIVACY_POLICY_PATH}
              className="text-gold-light underline underline-offset-4 decoration-gold-light/50 hover:decoration-gold-light"
            >
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => decide("denied")}
              className="h-11 rounded-full border border-cream/30 text-sm font-semibold text-cream transition-colors hover:border-gold-light hover:text-gold-light"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => decide("granted")}
              className="h-11 rounded-full bg-gold text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
