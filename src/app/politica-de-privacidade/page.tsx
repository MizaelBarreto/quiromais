import type { Metadata } from "next";
import Link from "next/link";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import CookiePreferencesButton from "@/components/CookiePreferencesButton";
import { CONTACT_INFO, PRIVACY_POLICY_PATH, WHATSAPP_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Quiro+ trata os dados pessoais enviados pelo site: quais dados, para quê, por quanto tempo, cookies e como exercer seus direitos pela LGPD.",
  alternates: { canonical: PRIVACY_POLICY_PATH },
};

// Texto-base em linguagem simples, de acordo com a LGPD (Lei 13.709/2018).
// Revise com a clínica antes de publicar e, ao mudar o conteúdo, atualize PRIVACY_POLICY_VERSION
// em src/lib/constants.ts e a data abaixo.
const UPDATED_AT = "1º de outubro de 2026";

const h2 = "font-serif text-2xl sm:text-3xl font-semibold text-dark mt-12 mb-4";
const p = "text-dark/80 leading-relaxed mb-4";
const ul = "list-disc pl-6 space-y-2 text-dark/80 leading-relaxed mb-4 marker:text-gold-deep";
const a = "text-gold-deep underline underline-offset-4 decoration-gold-deep/40 hover:decoration-gold-deep";

export default function PrivacyPolicyPage() {
  return (
    <>
      <SimpleHeader />
      <main className="bg-cream">
        <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-deep">LGPD</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-dark sm:text-5xl">Política de Privacidade</h1>
          <p className="mt-4 text-sm text-dark/65">Última atualização: {UPDATED_AT}</p>

          <p className={`${p} mt-8`}>
            Esta política explica, de forma simples, como a <strong>Quiro+</strong> trata os dados pessoais de quem
            visita este site ou preenche o formulário de agendamento, de acordo com a Lei Geral de Proteção de Dados
            (LGPD — Lei nº 13.709/2018).
          </p>

          <h2 className={h2}>1. Quem é responsável pelos seus dados</h2>
          <p className={p}>
            A controladora dos dados é a Quiro+ — Priscila Santos, Quiropraxia e Fisioterapia, com endereço em{" "}
            {CONTACT_INFO.address}. Para qualquer assunto sobre privacidade, fale com a gente pelo e-mail{" "}
            <a className={a} href={`mailto:${CONTACT_INFO.email}`}>
              {CONTACT_INFO.email}
            </a>{" "}
            ou pelo telefone/WhatsApp{" "}
            <a className={a} href={CONTACT_INFO.phoneHref}>
              {CONTACT_INFO.phone}
            </a>
            .
          </p>

          <h2 className={h2}>2. Quais dados coletamos</h2>
          <ul className={ul}>
            <li>
              <strong>Formulário de agendamento:</strong> nome, telefone/WhatsApp e, se você quiser informar, e-mail.
            </li>
            <li>
              <strong>Registro do consentimento:</strong> data e hora em que você aceitou esta política e qual versão
              dela estava em vigor.
            </li>
            <li>
              <strong>Dados técnicos de segurança:</strong> o tipo de navegador e um código gerado a partir do seu
              endereço IP (o IP em si não é guardado), usados apenas para bloquear envios automáticos e abusivos.
            </li>
            <li>
              <strong>Estatísticas de navegação</strong>, somente se você aceitar os cookies de análise (veja o item
              6).
            </li>
          </ul>
          <p className={p}>
            O site <strong>não pede informações de saúde</strong>. Elas são tratadas apenas durante o atendimento, sob
            sigilo profissional.
          </p>

          <h2 className={h2}>3. Para que usamos e com qual base legal</h2>
          <ul className={ul}>
            <li>
              Entrar em contato com você para agendar e organizar sua avaliação — com base no seu{" "}
              <strong>consentimento</strong> (art. 7º, I) e nos procedimentos preliminares ao atendimento que você
              solicitou (art. 7º, V).
            </li>
            <li>
              Proteger o site contra spam e uso abusivo — com base no <strong>legítimo interesse</strong> (art. 7º,
              IX).
            </li>
            <li>
              Entender como o site é usado para melhorá-lo — somente com o seu <strong>consentimento</strong> para os
              cookies de análise.
            </li>
          </ul>
          <p className={p}>Não vendemos seus dados e não os usamos para publicidade.</p>

          <h2 className={h2}>4. Com quem compartilhamos</h2>
          <p className={p}>
            Seus dados são acessados apenas pela equipe da Quiro+ e pelos serviços que mantêm o site funcionando, que
            atuam como operadores e seguem nossas instruções:
          </p>
          <ul className={ul}>
            <li>
              <strong>Supabase</strong> — banco de dados onde os cadastros ficam guardados;
            </li>
            <li>
              <strong>Vercel</strong> — hospedagem do site;
            </li>
            <li>
              <strong>Google</strong> — envio do e-mail interno que avisa a clínica sobre um novo cadastro (Gmail) e,
              se você aceitar, estatísticas de visita (Google Analytics).
            </li>
          </ul>
          <p className={p}>
            Alguns desses serviços guardam dados em servidores fora do Brasil, com garantias de segurança e proteção
            compatíveis com a LGPD (art. 33). Ao continuar a conversa pelo WhatsApp, as mensagens também seguem a
            política de privacidade do próprio WhatsApp.
          </p>

          <h2 className={h2}>5. Por quanto tempo guardamos</h2>
          <p className={p}>
            Os dados do formulário ficam guardados enquanto forem necessários para o seu atendimento e, no máximo, por
            2 anos após o último contato — ou até você pedir a exclusão, o que vier primeiro. Depois disso são
            apagados.
          </p>

          <h2 className={h2}>6. Cookies</h2>
          <p className={p}>
            Este site só usa cookies de análise (Google Analytics: <code>_ga</code> e <code>_ga_*</code>, que duram até
            2 anos) se você clicar em <strong>Aceitar</strong> no aviso de cookies. Eles nos mostram, de forma
            estatística, quantas pessoas visitam o site e quais seções são mais vistas. Se você recusar, nada disso é
            carregado. Sua escolha fica salva só no seu navegador e você pode mudá-la a qualquer momento:
          </p>
          <CookiePreferencesButton className="mb-4 inline-flex min-h-11 items-center rounded-full border border-gold-deep/40 px-5 text-sm font-semibold text-gold-deep transition-colors hover:border-gold-deep hover:bg-gold/10" />

          <h2 className={h2}>7. Como protegemos seus dados</h2>
          <p className={p}>
            O site usa conexão criptografada (HTTPS); o banco de dados só pode ser acessado pelo servidor do site e pela
            equipe autorizada, com senha; e coletamos apenas o mínimo necessário para falar com você.
          </p>

          <h2 className={h2}>8. Seus direitos</h2>
          <p className={p}>Pela LGPD (art. 18), você pode, a qualquer momento e sem custo:</p>
          <ul className={ul}>
            <li>confirmar se tratamos seus dados e ter acesso a eles;</li>
            <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
            <li>pedir a anonimização, o bloqueio ou a exclusão de dados desnecessários ou tratados em desacordo com a lei;</li>
            <li>pedir a portabilidade dos dados;</li>
            <li>saber com quem compartilhamos seus dados;</li>
            <li>revogar o consentimento e pedir a exclusão dos dados tratados com base nele.</li>
          </ul>
          <p className={p}>
            Para exercer qualquer um desses direitos, escreva para{" "}
            <a className={a} href={`mailto:${CONTACT_INFO.email}`}>
              {CONTACT_INFO.email}
            </a>{" "}
            ou{" "}
            <a className={a} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              fale pelo WhatsApp
            </a>
            . Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (
            <a className={a} href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
              ANPD
            </a>
            ).
          </p>

          <h2 className={h2}>9. Alterações nesta política</h2>
          <p className={p}>
            Podemos atualizar esta política para refletir mudanças no site ou na lei. A data da última atualização fica
            sempre no topo desta página e, se a mudança afetar os cookies, o aviso de cookies aparece de novo para você
            escolher.
          </p>

          <p className="mt-12">
            <Link href="/" className={a}>
              ← Voltar para o site
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
