"use client";

import { GA_ID } from "@/lib/analytics";
import { openCookiePreferences } from "@/lib/consent";

// Reabre o banner de cookies (para a pessoa mudar ou revogar a escolha a qualquer momento)
export default function CookiePreferencesButton({ className }: { className?: string }) {
  if (!GA_ID) return null;
  return (
    <button type="button" onClick={openCookiePreferences} className={className}>
      Preferências de cookies
    </button>
  );
}
