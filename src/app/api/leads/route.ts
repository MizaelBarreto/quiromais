import { after, NextResponse, type NextRequest } from "next/server";
import { countRecentLeads, hashIp, insertLead, isLeadStoreConfigured, parseLead } from "@/lib/server/leads";
import { sendLeadNotification } from "@/lib/server/mail";
import { PRIVACY_POLICY_VERSION } from "@/lib/constants";

// Recebe o formulário "Agende sua avaliação": grava no Supabase e avisa por e-mail.
// O formulário espera a resposta para mostrar sucesso ou erro; o e-mail sai logo depois.

const MAX_BODY_CHARS = 4_000;
const MAX_PER_IP_PER_HOUR = 5;

const json = (body: object, status: number) => NextResponse.json(body, { status });

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "Origem não permitida" }, 403);

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return json({ error: "Dados inválidos" }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Dados inválidos" }, 400);
  }

  const parsed = parseLead(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  if (parsed.isBot) return json({ ok: true }, 201); // finge que deu certo e descarta

  if (!isLeadStoreConfigured()) {
    console.error("[leads] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configurados");
    return json({ error: "Serviço indisponível" }, 503);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = ip ? hashIp(ip) : null;
  const receivedAt = new Date();

  try {
    if (ipHash && (await countRecentLeads(ipHash, 60, MAX_PER_IP_PER_HOUR)) >= MAX_PER_IP_PER_HOUR) {
      return json({ error: "Muitos envios seguidos. Tente de novo mais tarde." }, 429);
    }
    await insertLead({
      ...parsed.lead,
      origem: "site",
      consentimento_lgpd: true,
      politica_versao: PRIVACY_POLICY_VERSION,
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent")?.slice(0, 400) ?? null,
    });
  } catch (err) {
    console.error("[leads] falha ao salvar:", err instanceof Error ? err.message : err);
    return json({ error: "Não foi possível salvar" }, 500);
  }

  // O e-mail sai depois da resposta: quem preencheu não espera o SMTP
  after(async () => {
    try {
      if (await sendLeadNotification(parsed.lead, receivedAt)) console.info("[leads] e-mail de aviso enviado");
    } catch (err) {
      console.error("[leads] falha ao enviar e-mail:", err instanceof Error ? err.message : err);
    }
  });

  return json({ ok: true }, 201);
}
