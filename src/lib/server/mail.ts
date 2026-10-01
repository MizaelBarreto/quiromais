import "server-only";
import nodemailer from "nodemailer";
import type { Lead } from "./leads";
import { supabaseDashboardUrl } from "./leads";

// Aviso por e-mail a cada novo cadastro, via SMTP (Gmail com senha de app, ou outro provedor).

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const formatPhone = (d: string) =>
  d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;

/** Envia o aviso. Retorna false (sem erro) se o SMTP ainda não foi configurado. */
export async function sendLeadNotification(lead: Lead, receivedAt: Date) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEADS_NOTIFY_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !LEADS_NOTIFY_TO) {
    console.warn("[leads] SMTP não configurado — e-mail de aviso não enviado");
    return false;
  }
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    // a senha de app do Google aparece em blocos ("abcd efgh ijkl mnop"); os espaços não fazem parte dela
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, "") },
  });

  const phone = formatPhone(lead.telefone);
  const whatsapp = `https://wa.me/55${lead.telefone}`;
  const when = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(receivedAt);
  const dashboard = supabaseDashboardUrl();

  const rows: [string, string][] = [
    ["Nome", escapeHtml(lead.nome)],
    ["Telefone", `<a href="${whatsapp}" style="color:#7E5F29">${phone}</a> (abrir no WhatsApp)`],
    ["E-mail", lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color:#7E5F29">${escapeHtml(lead.email)}</a>` : "—"],
    ["Recebido em", `${when} (horário de Brasília)`],
  ];

  const html = `<!doctype html><html><body style="margin:0;background:#F4EBDD;font-family:Arial,Helvetica,sans-serif;color:#2B2318">
<div style="max-width:520px;margin:0 auto;padding:24px">
  <div style="background:#2B2318;border-radius:12px 12px 0 0;padding:18px 24px;color:#F4EBDD;font-size:20px;font-family:Georgia,serif">
    Quiro<span style="color:#C9A15C">+</span> · Novo cadastro no site
  </div>
  <div style="background:#ffffff;border-radius:0 0 12px 12px;padding:20px 24px">
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:#7E5F29;width:110px;vertical-align:top">${k}</td><td style="padding:8px 0">${v}</td></tr>`).join("")}
    </table>
    <p style="margin:20px 0 0">
      <a href="${whatsapp}" style="display:inline-block;background:#C9A15C;color:#2B2318;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px">Responder no WhatsApp</a>
    </p>
    ${dashboard ? `<p style="margin:20px 0 0;font-size:12px;color:#807b74">Todos os cadastros: <a href="${dashboard}" style="color:#7E5F29">Supabase → Table Editor → leads</a></p>` : ""}
  </div>
</div></body></html>`;

  const text = [
    "Novo cadastro no site da Quiro+",
    "",
    `Nome: ${lead.nome}`,
    `Telefone: ${phone} — ${whatsapp}`,
    `E-mail: ${lead.email ?? "—"}`,
    `Recebido em: ${when} (horário de Brasília)`,
    ...(dashboard ? ["", `Todos os cadastros: ${dashboard}`] : []),
  ].join("\n");

  await transporter.sendMail({
    from: { name: "Site Quiro+", address: SMTP_USER },
    to: LEADS_NOTIFY_TO,
    replyTo: lead.email ?? undefined,
    subject: `Novo cadastro no site: ${lead.nome}`,
    text,
    html,
  });
  return true;
}
