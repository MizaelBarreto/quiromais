# Animação do hero em JS (Quiro+)

Recriação em tempo real da animação do vídeo `quiro-hero-*.webm`, em duas versões:

- **3D (principal)** — `quiro-hero-3d.js`, WebGL com three.js. Geometria de verdade (vértebras "fundidas",
  letras extrudadas com chanfro, "+" com diamantes lapidados), metal PBR refletindo um estúdio de luz,
  sombras suaves na parede de gesso com relevo.
- **2D (reserva)** — `quiro-hero.js`, canvas 2D leve. Entra sozinha se o navegador não tiver WebGL.

| Tempo | O que acontece |
|---|---|
| 0 – 2,7 s | câmera fechada na coluna; as vértebras ouro/prata pousam na parede |
| 2,7 – 4,6 s | câmera abre até o logo inteiro; "QUIRO" sobe letra a letra |
| 3,8 – 4,6 s | o "+" entra com os diamantes e um brilho |
| 4,3 – 6 s | a linha dourada se desenha e o slogan aparece |
| 5,9 – 7,7 s | o reflexo do estúdio passa pelo metal |
| até 13 s | drift lento da câmera e fica parado no logo |

## Arquivos

- `index.html` — demonstração (abre com duplo clique, sem servidor)
- `quiro-hero-3d.js` — versão 3D já compilada (~600 KB, ~160 KB com gzip; inclui three.js e os glifos da Cinzel)
- `quiro-hero.js` — versão 2D (~32 KB)
- `src-3d/` — código-fonte da versão 3D e script de build

## Testar

Abra o `index.html`. **↻ Repetir** reinicia.
- `index.html?t=4.5` congela nesse segundo
- `index.html?modo=2d` força a versão 2D

## API (igual nas duas)

```js
const hero = createQuiroHero3D(canvas, {   // ou createQuiroHero(canvas, …) na 2D
  autoplay: true,          // começa sozinha
  reducedMotion: null,     // null = respeita "reduzir movimento" do sistema (mostra o quadro final)
  maxDpr: 2,               // limite de resolução em telas retina
  onComplete() {},         // chamado ao fim dos 13 s
});
await hero.ready;          // cena montada e shaders compilados
hero.replay();
hero.seek(4.2);            // pausa e desenha esse instante
hero.destroy();            // para e libera a GPU
```

`createQuiroHero3D` lança erro se não houver WebGL — é aí que o `index.html` cai para a 2D.

## Usar no site (Next.js)

1. Copie `quiro-hero-3d.js` para `public/js/`.
2. Componente:

```tsx
"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loaded || !ref.current) return;
    // @ts-expect-error — definido pelo script
    const hero = window.createQuiroHero3D(ref.current);
    hero.ready.then(() => setReady(true));
    return () => hero.destroy();
  }, [loaded]);

  return (
    <div className="absolute inset-0">
      {/* poster enquanto a cena monta */}
      <img src="/images/hero/quiro-hero-final-desktop.jpg" alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? "opacity-0" : ""}`} />
      <Script src="/js/quiro-hero-3d.js" strategy="afterInteractive" onLoad={() => setLoaded(true)} />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" role="img"
        aria-label="Quiro+ — Cuidado, Performance, Transformação" />
    </div>
  );
}
```

## Editar a versão 3D

```bash
cd src-3d
npm install
npm run build      # gera ../quiro-hero-3d.js
npm run font       # (só se mudar os textos) regenera cinzel-600-subset.json
```

Onde mexer em `src-3d/quiro-hero-3d.js`:

- **Tempo das etapas:** `update(t)` (os `prog(t, início, duração)`) e `cameraAt`.
- **Metal:** materiais `GOLD`, `SILVER`, `GOLD_MATTE` (cor, `roughness`, `bumpScale`).
- **Reflexos / luz:** `studioEnvironment()` (painéis de luz que o metal reflete) e a `DirectionalLight` (sombras).
- **Formato e relevo das vértebras:** `VERT` (meia vértebra em ouro; a prata é o espelho) e `vOpt`
  (`radius` = arredondado da borda, `height`, `noiseAmp` = irregularidade "fundida").
- **Letras:** `letterOpts` (profundidade e chanfro).
- **Parede:** `makePlasterTextures`.
