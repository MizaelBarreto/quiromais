-- Quiro+ — cadastros do formulário do site
-- Rode uma vez no Supabase: Dashboard → SQL Editor → New query → cole tudo → Run.
-- Pode rodar de novo sem problema (não apaga dados).

create table if not exists public.leads (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  nome               text not null check (char_length(nome) between 2 and 120),
  telefone           text not null check (telefone ~ '^[0-9]{10,11}$'),        -- só dígitos, com DDD
  email              text check (email is null or char_length(email) <= 254),
  origem             text not null default 'site' check (char_length(origem) <= 60),
  -- LGPD: prova do consentimento (quando e qual versão da política foi aceita)
  consentimento_lgpd boolean not null check (consentimento_lgpd),
  consentimento_em   timestamptz not null default now(),
  politica_versao    text not null check (char_length(politica_versao) <= 20),
  -- segurança contra spam: IP com hash (não dá pra recuperar o IP) e navegador
  ip_hash            text check (ip_hash is null or char_length(ip_hash) <= 64),
  user_agent         text check (user_agent is null or char_length(user_agent) <= 400),
  -- acompanhamento pela clínica (edite direto no Table Editor)
  status             text not null default 'novo'
                     check (status in ('novo', 'contatado', 'agendado', 'descartado')),
  observacoes        text check (observacoes is null or char_length(observacoes) <= 2000)
);

comment on table public.leads is 'Cadastros do formulário "Agende sua avaliação" do site (quiromaisoficial.com.br).';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_ip_hash_created_at_idx on public.leads (ip_hash, created_at desc);

-- Acesso: só o servidor do site (chave service_role) lê e grava.
-- RLS ligado e nenhuma policy = a chave pública (anon) não enxerga nem grava nada.
alter table public.leads enable row level security;
revoke all on table public.leads from anon, authenticated;
