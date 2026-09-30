# Quiro+ — site

Landing page da **Quiro+**, clínica de quiropraxia e fisioterapia da Dra. Priscila Santos (Bauru-SP).

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP, Framer Motion, componentes do
[React Bits](https://reactbits.dev) e uma animação 3D do logo em three.js.

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção (página estática)
npm run lint
```

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

## Estrutura

```
src/
  app/                  layout (metadados, fontes, dados estruturados), página e CSS global
  components/           seções da página, na ordem:
    HeroSection           animação 3D do logo (carrega /js/quiro-hero-3d.js)
    SpineScrollSection    "Quem sou" com a coluna fixa que desce com a rolagem
    ServicesSection       cards de serviços + modal de detalhes
    GallerySection        galeria de fotos dos atendimentos
    VideoSection          vídeos dos atendimentos
    TestimonialsCarousel  avaliações do Google
    ContactSection        formulário que abre o WhatsApp
    reactbits/            componentes do React Bits (Depth Carousel, Card Swap, Accordion Gallery,
                          Split Text, Fold Text, Glare Hover, Star Border), com pequenas adaptações
                          comentadas no topo de cada arquivo
    GoldButton.tsx        botão dourado padrão (Star Border)
  hooks/                useMediaQuery
  lib/constants.ts      conteúdo do site
public/
  images/               foto da Dra., coluna, galeria (WebP) e imagem estática do hero
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
