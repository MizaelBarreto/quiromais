import { PRIVACY_POLICY_VERSION } from "./constants";

// Escolha de cookies (LGPD): fica no localStorage deste navegador. Se a política mudar de
// versão, o banner aparece de novo.

export type CookieChoice = "granted" | "denied";

const KEY = "quiro-cookies";
const CHANGE_EVENT = "quiro:cookie-choice";
export const OPEN_PREFERENCES_EVENT = "quiro:cookie-preferences";
// atributo no <html> com a escolha salva; o CSS esconde o banner quando ele existe
export const COOKIE_CHOICE_ATTR = "data-cookie-choice";

// Roda no <head>, antes da primeira pintura (mesma regra de readCookieChoice)
export const cookieChoiceScript = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(KEY)}));if(s&&s.version===${JSON.stringify(
  PRIVACY_POLICY_VERSION,
)}&&(s.choice==="granted"||s.choice==="denied"))document.documentElement.setAttribute(${JSON.stringify(
  COOKIE_CHOICE_ATTR,
)},s.choice)}catch(e){}`;

// vale só para esta visita quando o navegador bloqueia o localStorage
let memory: CookieChoice | null = null;

export function readCookieChoice(): CookieChoice | null {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as { choice?: string; version?: string } | null;
    if (saved?.version === PRIVACY_POLICY_VERSION && (saved.choice === "granted" || saved.choice === "denied")) {
      return saved.choice;
    }
  } catch {
    // armazenamento bloqueado ou valor corrompido
  }
  return memory;
}

export function saveCookieChoice(choice: CookieChoice) {
  memory = choice;
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, version: PRIVACY_POLICY_VERSION, at: new Date().toISOString() }));
  } catch {
    // ver `memory`
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeCookieChoice(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT));
}
