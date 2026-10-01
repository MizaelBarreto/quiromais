# Quiro+ — site

Landing page da **Quiro+**, clínica de quiropraxia e fisioterapia da Dra. Priscila Santos (Bauru-SP).

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP, Framer Motion, componentes do
[React Bits](https://reactbits.dev) e uma animação 3D do logo em three.js.

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
npm run lint
```

Antes, copie `.env.example` para `.env.local` e preencha (veja **Configuração** abaixo). Sem as variáveis o
site funciona, mas o formulário não grava os cadastros.

## Configuração

Variáveis de ambiente (local: `.env.local`; produção: Vercel → Project → Settings → Environment Variables):

| Variável | Para quê |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | gravar os cadastros do formulário (só no servidor — nunca com `NEXT_PUBLIC_`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | enviar o e-mail de aviso de novo cadastro |
| `LEADS_NOTIFY_TO` | quem recebe o aviso (separados por vírgula) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (`G-XXXXXXXXXX`); vazio = sem Analytics e sem banner de cookies |

- **Banco:** rode `supabase/leads.sql` uma vez no SQL Editor do Supabase. Os cadastros ficam na tabela
  `leads` (Table Editor), com a coluna `status` para acompanhar o atendimento.
- **E-mail com Gmail:** na conta que vai enviar, ative a verificação em 2 etapas, crie uma senha de app em
  https://myaccount.google.com/apppasswords e use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`,
  `SMTP_USER` = o Gmail e `SMTP_PASS` = a senha de app.
- **LGPD:** o texto da política está em `src/app/politica-de-privacidade/page.tsx`. Ao mudá-lo, atualize a data
  na página e `PRIVACY_POLICY_VERSION` em `src/lib/constants.ts` (ela é gravada com cada consentimento e
  faz o banner de cookies aparecer de novo).

## Onde editar o conteúdo

Quase todo o texto do site fica em **`src/lib/constants.ts`**:

| O quê | Constante |
|---|---|
| Número do WhatsApp e mensagem padrão | `WHATSAPP_NUMBER`, `WHATSAPP_MESSAGE` |
| Endereço, telefone, horário | `CONTACT_INFO` |
| Instagram | `SOCIAL_LINKS` |
| Nota e link do perfil no Google | `GOOGLE_REVIEWS` |
| Avaliações exibidas | `REVIEWS_DATA` |
| Serviços (cards e modal) | `SERVICES_DATA` |
| Menu de serviços | `NAV_CATEGORIES` |
| Textos da seção "Quem sou" | `BIO_BLOCKS` |
| Fotos da galeria | `GALLERY_IMAGES` |
| Vídeos | `VIDEO_ITEMS` |
| Domínio do site (sitemap, canonical, compartilhamento) | `SITE_URL` |

## Estrutura

```
src/
  app/                  layout (metadados, fontes, dados estruturados), página e CSS global;
                        favicon.ico, icon.png e apple-icon.png são o "+" com diamantes do logo 3D;
                        opengraph-image.jpg é a imagem de compartilhamento
    api/leads/            recebe o formulário: grava no Supabase e manda o e-mail de aviso
    politica-de-privacidade/  política de privacidade (LGPD)
    not-found.tsx         página 404
    sitemap.ts, robots.ts sitemap.xml e robots.txt
  components/           seções da página, na ordem:
    HeroSection           animação 3D do logo (carrega /js/quiro-hero-3d.js)
    SpineScrollSection    "Quem sou" com a coluna fixa que desce com a rolagem
    ServicesSection       cards de serviços + modal de detalhes
    GallerySection        galeria de fotos dos atendimentos
    VideoSection          vídeos dos atendimentos
    TestimonialsCarousel  avaliações do Google
    ContactSection        formulário (consentimento LGPD) que grava o cadastro e abre o WhatsApp
    CookieConsent         banner de cookies + Google Analytics (só carrega depois do "Aceitar")
    reactbits/            componentes do React Bits (Depth Carousel, Card Swap, Accordion Gallery,
                          Split Text, Fold Text, Glare Hover, Star Border), com pequenas adaptações
                          comentadas no topo de cada arquivo
    GoldButton.tsx        botão dourado padrão (Star Border)
  hooks/                useMediaQuery
  lib/constants.ts      conteúdo do site
  lib/server/           código só do servidor: cadastros (Supabase) e e-mail
supabase/leads.sql      tabela dos cadastros (rodar no Supabase)
public/
  images/               foto da Dra., coluna, galeria e imagem estática do hero (WebP)
  videos/lv/            vídeos da seção de vídeos (MP4 otimizado + pôster)
  js/quiro-hero-3d.js   animação 3D compilada (gerada por animacao-hero-js)
animacao-hero-js/       código-fonte e demo da animação do hero — ver o README da pasta
```

## Adicionando fotos e vídeos

Guarde os arquivos originais em `midia-original/` (fica fora do git e do deploy) e coloque em `public/`
só as versões otimizadas:

- **Fotos da galeria:** WebP com no máximo 1080×1440, qualidade ~78 (ex.: com `sharp`), em
  `public/images/galeria/`; depois adicione em `GALLERY_IMAGES`.
- **Vídeos:** MP4 H.264 720×1280, CRF ~25, com `-movflags +faststart`, e um pôster JPG, em
  `public/videos/lv/`; depois adicione em `VIDEO_ITEMS`.

## Desempenho (PageSpeed)

- A animação 3D monta a geometria num Web Worker (a página não trava) e só roda com GPU de verdade. Sem
  aceleração (WebGL por software — máquinas virtuais, GPUs bloqueadas e o próprio teste do PageSpeed) o
  site nem baixa o script e mostra a imagem estática do logo. Por isso o PageSpeed mede essa versão.
- Vídeos e pôsteres só começam a baixar quando a seção de vídeos se aproxima da tela.
