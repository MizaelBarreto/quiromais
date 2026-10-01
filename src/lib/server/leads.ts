import "server-only";
import { createHmac } from "node:crypto";

// Cadastros do formulário de contato, gravados na tabela public.leads do Supabase
// (ver supabase/leads.sql). Usa a API REST com a chave service_role — só no servidor.

export type Lead = {
  nome: string;
  telefone: string; // só dígitos, com DDD
  email: string | null;
};

export type LeadRow = Lead & {
  origem: string;
  consentimento_lgpd: true;
  politica_versao: string;
  ip_hash: string | null;
  user_agent: string | null;
};

type ParseResult = { ok: true; lead: Lead; isBot: boolean } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida e normaliza o que o formulário enviou (mesmas regras do formulário e do banco). */
export function parseLead(body: unknown): ParseResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Dados inválidos" };
  const b = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  const nome = str(b.nome).replace(/\s+/g, " ").trim();
  const telefone = str(b.telefone).replace(/\D/g, "");
  const email = str(b.email).trim().toLowerCase();

  if (nome.length < 2 || nome.length > 120) return { ok: false, error: "Nome inválido" };
  if (telefone.length < 10 || telefone.length > 11) return { ok: false, error: "Telefone inválido" };
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) return { ok: false, error: "E-mail inválido" };
  if (b.consentimento !== true) return { ok: false, error: "É preciso aceitar a Política de Privacidade" };

  // "website" é um campo invisível: gente não preenche, robô preenche
  return { ok: true, lead: { nome, telefone, email: email || null }, isBot: str(b.website) !== "" };
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export const isLeadStoreConfigured = () => config() !== null;

function headers(key: string): Record<string, string> {
  return {
    apikey: key,
    // chave antiga (JWT) também vai no Authorization; as novas (sb_secret_…) só no apikey
    ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
    "Content-Type": "application/json",
  };
}

async function supabaseError(res: Response) {
  // Só código e mensagem: o campo "details" do PostgREST pode trazer a linha com dados pessoais
  const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
  return new Error(`Supabase ${res.status} ${body.code ?? ""} ${body.message ?? ""}`.trim());
}

/** Hash do IP (HMAC): permite limitar envios repetidos sem guardar o IP. */
export function hashIp(ip: string) {
  const c = config();
  return createHmac("sha256", c?.key ?? "quiro").update(ip).digest("hex").slice(0, 32);
}

/** Quantos cadastros esse IP fez nos últimos `minutes` minutos (até `limit`). */
export async function countRecentLeads(ipHash: string, minutes: number, limit: number) {
  const c = config();
  if (!c) throw new Error("Supabase não configurado");
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const qs = new URLSearchParams({
    select: "id",
    ip_hash: `eq.${ipHash}`,
    created_at: `gte.${since}`,
    limit: String(limit),
  });
  const res = await fetch(`${c.url}/rest/v1/leads?${qs}`, { headers: headers(c.key), cache: "no-store" });
  if (!res.ok) throw await supabaseError(res);
  return ((await res.json()) as unknown[]).length;
}

export async function insertLead(row: LeadRow) {
  const c = config();
  if (!c) throw new Error("Supabase não configurado");
  const res = await fetch(`${c.url}/rest/v1/leads`, {
    method: "POST",
    headers: { ...headers(c.key), Prefer: "return=minimal" },
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (!res.ok) throw await supabaseError(res);
}

/** Link do Table Editor do projeto, para o e-mail de aviso. */
export function supabaseDashboardUrl() {
  const ref = config()?.url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  return ref ? `https://supabase.com/dashboard/project/${ref}/editor` : null;
}
