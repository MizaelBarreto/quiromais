/*!
 * Quiro+ — animação do logo em canvas 2D (sem dependências)
 *
 * Recria a animação do vídeo do hero:
 *   0,0s  câmera fechada na coluna; vértebras ouro/prata "pousam" na parede de gesso
 *   2,7s  câmera abre até o logo inteiro
 *   3,0s  "QUIRO" sobe letra a letra
 *   3,8s  o "+" entra com os diamantes e um brilho
 *   4,3s  a linha dourada se desenha e o slogan aparece
 *   5,9s  um reflexo de luz passa pelo metal
 *   até 13s: drift lento da câmera (mesma duração do vídeo)
 *
 * Uso:
 *   const hero = createQuiroHero(canvas, { autoplay: true, onComplete() {} });
 *   hero.replay();   hero.seek(4.2);   hero.destroy();
 *
 * Com "reduzir movimento" ativo no sistema, desenha direto o quadro final.
 */
(function (global) {
  "use strict";

  const DURATION = 13;
  const TAU = Math.PI * 2;

  // ---------------------------------------------------------------- utilidades
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const E = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outSine: (t) => Math.sin((t * Math.PI) / 2),
    outBack: (t) => {
      const c1 = 1.4, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
  };
  const prog = (t, t0, dur, fn) => (fn || E.outCubic)(clamp((t - t0) / dur));

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  }

  // ------------------------------------------------------------------ paletas
  // ramp: cor do metal em função da luz refletida (0 = sombra, 1 = reflexo estourado)
  const GOLD = {
    ramp: [[0, "#2a1502"], [0.16, "#6a3f06"], [0.34, "#b0700d"], [0.52, "#e3a81c"], [0.68, "#ffd23f"], [0.82, "#ffe98a"], [0.93, "#fff7d6"], [1, "#ffffff"]],
    side: "#5a3606",
    shadow: "rgb(60,40,14)",
  };
  const SILVER = {
    ramp: [[0, "#15181c"], [0.18, "#474e57"], [0.38, "#8c959f"], [0.56, "#c6cdd4"], [0.72, "#e9eef2"], [0.86, "#fbfcfd"], [1, "#ffffff"]],
    side: "#3a4048",
    shadow: "rgb(52,48,42)",
  };

  // Meia vértebra (lado esquerdo, em ouro); o lado direito é o espelho em prata.
  // Como na referência: asa larga em cima indo pra fora e uma "gota" descendo junto ao centro.
  const VERT_PATH =
    "M -1 -17 C -7 -21 -16 -18 -24 -19 C -32 -20 -41 -25 -47 -19 " +
    "C -53 -13 -49 -5 -42 -4 C -35 -3 -29 0 -25 5 " +
    "C -22 10 -21 17 -16 22 C -12 27 -4 28 -2 22 " +
    "C -1 12 -1 0 -1 -17 Z";
  const VERT_BBOX = [-52, -24, 0, 28];
  const VERT_GAP = 1.2; // fresta entre ouro e prata

  // ----------------------------------------------------- texturas (uma vez só)
  function makeHammerTexture(rand) {
    const s = 256, c = makeCanvas(s, s), g = c.getContext("2d");
    g.fillStyle = "#808080";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 240; i++) {
      const x = rand() * s, y = rand() * s, r = 6 + rand() * 14;
      for (let ox = -s; ox <= s; ox += s) {
        for (let oy = -s; oy <= s; oy += s) {
          const cx = x + ox, cy = y + oy;
          if (cx < -r || cy < -r || cx > s + r || cy > s + r) continue;
          let gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
          gr.addColorStop(0, "rgba(0,0,0,0.38)");
          gr.addColorStop(1, "rgba(0,0,0,0)");
          g.fillStyle = gr;
          g.fillRect(cx - r, cy - r, r * 2, r * 2);
          gr = g.createRadialGradient(cx + r * 0.35, cy + r * 0.35, 0, cx + r * 0.2, cy + r * 0.2, r * 0.8);
          gr.addColorStop(0, "rgba(255,255,255,0.45)");
          gr.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = gr;
          g.fillRect(cx - r, cy - r, r * 2, r * 2);
        }
      }
    }
    return c;
  }

  function makeGrain(rand) {
    const s = 180, c = makeCanvas(s, s), g = c.getContext("2d");
    const img = g.createImageData(s, s);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rand() < 0.5 ? 40 : 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = rand() * 16;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // Poro do gesso: côncavo, luz vindo de cima/esquerda
  function makePit() {
    const s = 64, c = makeCanvas(s, s), g = c.getContext("2d");
    let gr = g.createRadialGradient(28, 28, 1, 30, 30, 22);
    gr.addColorStop(0, "rgba(90,76,58,0.5)");
    gr.addColorStop(0.6, "rgba(90,76,58,0.16)");
    gr.addColorStop(1, "rgba(90,76,58,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    gr = g.createRadialGradient(38, 38, 0, 36, 36, 14);
    gr.addColorStop(0, "rgba(255,255,250,0.55)");
    gr.addColorStop(1, "rgba(255,255,250,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    return c;
  }

  // ------------------------------------------------------- sprites metálicos
  // Metal "3D" calculado pixel a pixel, uma vez por sprite:
  //   máscara → mapa de altura (desfoque + perfil de chanfro + martelado)
  //   → normais → reflexo de um estúdio sintético (softbox, céu/chão, faixa escura)
  //   → rampa de cor do metal. Mais a espessura (lateral) e a sombra projetada.
  const K_LIGHT = norm3(-0.45, -0.6, 0.66); // softbox principal: cima/esquerda
  const F_LIGHT = norm3(0.7, -0.15, 0.7);   // luz de preenchimento à direita

  function norm3(x, y, z) {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  }

  function boxBlur(src, w, h, r, passes) {
    r = Math.max(1, Math.round(r));
    const inv = 1 / (2 * r + 1);
    const a = Float32Array.from(src);
    const t = new Float32Array(w * h);
    for (let p = 0; p < passes; p++) {
      for (let y = 0; y < h; y++) {
        const row = y * w;
        let acc = 0;
        for (let x = -r; x <= r; x++) acc += a[row + clamp(x, 0, w - 1)];
        for (let x = 0; x < w; x++) {
          t[row + x] = acc * inv;
          acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
        }
      }
      for (let x = 0; x < w; x++) {
        let acc = 0;
        for (let y = -r; y <= r; y++) acc += t[clamp(y, 0, h - 1) * w + x];
        for (let y = 0; y < h; y++) {
          a[y * w + x] = acc * inv;
          acc += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x];
        }
      }
    }
    return a;
  }

  const rampCache = new Map();
  function rampLUT(ramp) {
    if (rampCache.has(ramp)) return rampCache.get(ramp);
    const c = makeCanvas(256, 1), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 256, 0);
    ramp.forEach(([s, col]) => gr.addColorStop(s, col));
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 1);
    const lut = g.getImageData(0, 0, 256, 1).data;
    rampCache.set(ramp, lut);
    return lut;
  }

  // amostra bilinear com repetição (evita o serrilhado do martelado)
  function sampleWrap(T, x, y) {
    const n = T.s, d = T.d;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const xa = ((x0 % n) + n) % n, ya = ((y0 % n) + n) % n;
    const xb = (xa + 1) % n, yb = (ya + 1) % n;
    const top = d[ya * n + xa] * (1 - fx) + d[ya * n + xb] * fx;
    const bot = d[yb * n + xa] * (1 - fx) + d[yb * n + xb] * fx;
    return top * (1 - fy) + bot * fy;
  }

  function makeMetal(spec, S, hammer) {
    const [bx0, by0, bx1, by1] = spec.bbox;
    const depth = spec.depth != null ? spec.depth : 3;
    const pad = (spec.pad != null ? spec.pad : 14) + depth;
    const ox = bx0 - pad, oy = by0 - pad;
    const w = Math.ceil((bx1 - bx0 + pad * 2) * S);
    const h = Math.ceil((by1 - by0 + pad * 2) * S);
    const pal = spec.palette;

    const mask = makeCanvas(w, h);
    const m = mask.getContext("2d");
    m.setTransform(S, 0, 0, S, -ox * S, -oy * S);
    m.fillStyle = "#fff";
    spec.shape(m);

    // alfa da máscara
    const md = m.getImageData(0, 0, w, h).data;
    const A = new Float32Array(w * h);
    for (let i = 0; i < A.length; i++) A[i] = md[i * 4 + 3] / 255;

    // mapa de altura
    const bevelPx = (spec.bevel || 3) * S;
    const B = boxBlur(A, w, h, bevelPx / 1.7, 3);
    const Hpx = (spec.height || spec.bevel || 3) * S;
    const H = new Float32Array(w * h);
    const pillow = spec.profile === "pillow";
    const hk = hammer && spec.hammer ? 1 / (S * spec.hammer) : 0;
    const ha = hammer && spec.hammer ? (spec.hammerAmp || 1) * S : 0;
    for (let y = 0, i = 0; y < h; y++) {
      for (let x = 0; x < w; x++, i++) {
        if (A[i] <= 0 && B[i] <= 0) continue;
        // altura 0 na borda (B≈0.5) subindo pra dentro
        const b = pillow ? clamp((B[i] - 0.38) / 0.62) : clamp((B[i] - 0.45) / 0.5);
        let v = pillow ? Math.sqrt(b) * (1.5 - 0.5 * b) : b * b * (3 - 2 * b);
        v *= Hpx;
        if (ha) v += sampleWrap(hammer, x * hk, y * hk) * ha * Math.min(1, b * 2);
        H[i] = v;
      }
    }

    // iluminação
    const lut = rampLUT(pal.ramp);
    const out = makeCanvas(w, h);
    const o = out.getContext("2d");
    const img = o.createImageData(w, h);
    const d = img.data;
    const y0s = (by0 - oy) * S, ys = (by1 - by0) * S;
    const tone = spec.tone || 1;
    for (let y = 1; y < h - 1; y++) {
      const yn = clamp((y - y0s) / ys);
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const a = A[i];
        if (a <= 0) continue;
        const nx0 = -(H[i + 1] - H[i - 1]) * 0.5;
        const ny0 = -(H[i + w] - H[i - w]) * 0.5;
        const nl = Math.hypot(nx0, ny0, 1);
        const nx = nx0 / nl, ny = ny0 / nl, nz = 1 / nl;
        // reflexo do olhar (0,0,1)
        const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
        const up = -ry;
        let L = 0.4 + 0.42 * clamp((up + 0.35) / 1.0);            // céu claro / chão escuro
        L -= 0.34 * Math.exp(-Math.pow((up + 0.3) / 0.17, 2));     // faixa escura abaixo do horizonte
        L += 0.2 * (0.5 - yn);                                      // gradiente de estúdio
        const k = Math.max(0, rx * K_LIGHT[0] + ry * K_LIGHT[1] + rz * K_LIGHT[2]);
        const f = Math.max(0, rx * F_LIGHT[0] + ry * F_LIGHT[1] + rz * F_LIGHT[2]);
        L += 0.75 * Math.pow(k, 10) + 0.35 * Math.pow(f, 8);
        L = L * tone;
        const spec2 = Math.pow(k, 90) * 0.9;
        const li = Math.round(clamp(L, 0, 1) * 255) * 4;
        const p = i * 4;
        d[p] = Math.min(255, lut[li] + spec2 * 255);
        d[p + 1] = Math.min(255, lut[li + 1] + spec2 * 255);
        d[p + 2] = Math.min(255, lut[li + 2] + spec2 * 255);
        d[p + 3] = a * 255;
      }
    }
    const face = makeCanvas(w, h);
    face.getContext("2d").putImageData(img, 0, 0);

    // espessura: a lateral aparece embaixo/direita (câmera levemente acima)
    if (depth > 0) {
      const side = makeCanvas(w, h), sg = side.getContext("2d");
      sg.drawImage(mask, 0, 0);
      sg.globalCompositeOperation = "source-in";
      const gr = sg.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, pal.side);
      gr.addColorStop(1, "#000");
      sg.fillStyle = gr;
      sg.globalAlpha = 1;
      sg.fillRect(0, 0, w, h);
      const steps = Math.max(1, Math.round(depth * S));
      for (let k = steps; k >= 1; k--) o.drawImage(side, k * 0.35, k);
    }
    o.drawImage(face, 0, 0);

    // sombra projetada (meia resolução — é desfocada mesmo)
    const ss = 0.5;
    const shadow = makeCanvas(w * ss, h * ss);
    const sh = shadow.getContext("2d");
    const sw = shadow.width;
    sh.shadowColor = pal.shadow;
    sh.shadowBlur = (spec.shadowBlur || 5) * S * ss;
    sh.shadowOffsetX = sw * 2;
    sh.drawImage(mask, -sw * 2, 0, sw, shadow.height);

    return { img: out, shadow, ox, oy, S, w, h };
  }

  function makeDiamond(S, r) {
    const pad = 3, half = (r + pad) * S, size = Math.ceil(half * 2);
    const c = makeCanvas(size, size), g = c.getContext("2d");
    g.setTransform(S, 0, 0, S, size / 2, size / 2);
    // engaste dourado
    g.fillStyle = "#9a6d20";
    g.beginPath();
    g.arc(0, 0, r * 1.12, 0, TAU);
    g.fill();
    // pedra
    const gr = g.createRadialGradient(-r * 0.32, -r * 0.37, r * 0.05, 0, 0, r);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.35, "#eef4fa");
    gr.addColorStop(0.72, "#aab9c8");
    gr.addColorStop(1, "#66778a");
    g.fillStyle = gr;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.fill();
    // lapidação
    const n = 8, tr = r * 0.46;
    const pt = (rad, a) => [Math.cos(a) * rad, Math.sin(a) * rad];
    g.lineWidth = 0.45;
    g.strokeStyle = "rgba(255,255,255,0.8)";
    g.beginPath();
    for (let i = 0; i <= n; i++) {
      const [x, y] = pt(tr, (i / n) * TAU);
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    }
    g.stroke();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const [x0, y0] = pt(tr, a);
      const [x1, y1] = pt(r, a + Math.PI / n);
      const [x2, y2] = pt(tr, a + (2 * Math.PI) / n);
      g.strokeStyle = i % 2 ? "rgba(255,255,255,0.7)" : "rgba(70,86,108,0.45)";
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,0.95)";
    g.beginPath();
    g.arc(-r * 0.34, -r * 0.36, r * 0.14, 0, TAU);
    g.fill();
    return { img: c, S, half: half / S };
  }

  // -------------------------------------------------------------- layout
  // Mundo de 1920x1080 (mesmo enquadramento final do vídeo)
  function buildLayout(font) {
    const m = makeCanvas(4, 4).getContext("2d");
    const FS = 150;
    m.font = `600 ${FS}px ${font}`;
    const letters = "QUIRO".split("").map((ch) => {
      const mt = m.measureText(ch);
      return {
        ch,
        adv: mt.width,
        bbox: [-mt.actualBoundingBoxLeft, -mt.actualBoundingBoxAscent, mt.actualBoundingBoxRight, mt.actualBoundingBoxDescent],
      };
    });
    const track = 5;
    const wordW = letters.reduce((s, L) => s + L.adv, 0) + track * (letters.length - 1);
    const cap = m.measureText("I").actualBoundingBoxAscent;
    const plusR = Math.round(cap * 0.62), gap = 14;
    const groupW = wordW + gap + plusR * 2;
    const x0 = 960 - groupW / 2;
    const baseline = 690;
    let x = x0;
    letters.forEach((L) => {
      L.x = x;
      x += L.adv + track;
    });
    const plus = { x: x0 + wordW + gap + plusR, y: baseline - cap * 0.5, r: plusR };

    // coluna centralizada sobre a palavra, afinando pra baixo
    const spineX = x0 + wordW / 2;
    const spineBottom = baseline - cap - 20;
    const N = 6, verts = [];
    let y = 0;
    for (let i = 0; i < N; i++) {
      const sc = lerp(1.12, 1, i / (N - 1));
      verts.push({ y, s: sc });
      y += 44 * sc;
    }
    const shift = spineBottom - (verts[N - 1].y + VERT_BBOX[3] * verts[N - 1].s);
    verts.forEach((v) => (v.y += shift));

    const line = { x0: x0 - 12, x1: plus.x + plusR + 6, y: baseline + 30 };
    line.cx = (line.x0 + line.x1) / 2;

    // slogan esticado pra ocupar a largura da linha
    const tagSize = 24;
    m.font = `600 ${tagSize}px ${font}`;
    const chars = "CUIDADO • PERFORMANCE • TRANSFORMAÇÃO".split("").map((ch) => ({ ch, w: m.measureText(ch).width }));
    const sumW = chars.reduce((s, c) => s + c.w, 0);
    const tag = { y: line.y + 36, size: tagSize, chars, sumW, extra: ((line.x1 - line.x0) * 0.97 - sumW) / (chars.length - 1) };

    const top = verts[0].y + VERT_BBOX[1];
    const bottom = tag.y + 6;
    return {
      FS, letters, cap, baseline, plus, spineX, verts, line, tag,
      bounds: { left: line.x0, right: line.x1, top, bottom },
      center: { x: line.cx, y: (top + bottom) / 2 },
    };
  }

  function buildWall(L, rand) {
    const RX = 1500, RY = 1300;
    const R = () => ({ x: L.center.x + (rand() * 2 - 1) * RX, y: L.center.y + (rand() * 2 - 1) * RY });
    const buckets = [
      ["rgba(88,72,52,0.8)", 420, 0.45, 1.2],
      ["rgba(116,96,70,0.55)", 800, 0.5, 1.6],
      ["rgba(150,132,104,0.35)", 800, 0.8, 2.3],
    ].map(([color, n, r0, r1]) => ({
      color,
      dots: Array.from({ length: n }, () => {
        const p = R();
        p.r = r0 + Math.pow(rand(), 2) * (r1 - r0);
        return p;
      }),
    }));
    const fibers = Array.from({ length: 300 }, () => {
      const p = R();
      p.a = rand() * Math.PI;
      p.l = 1.5 + rand() * 5;
      p.c = (rand() - 0.5) * 2;
      return p;
    });
    const pits = Array.from({ length: 150 }, () => {
      const p = R();
      p.r = 2 + rand() * 6;
      p.al = 0.35 + rand() * 0.5;
      return p;
    });
    return { buckets, fibers, pits };
  }

  // -------------------------------------------------------------- câmera
  function cameraAt(L, t) {
    const v0 = L.verts[0], vl = L.verts[L.verts.length - 1];
    const A = { x: L.spineX + 14, y: v0.y + 34, z: 4.2 };
    const B = { x: L.spineX, y: vl.y - 30, z: 3.1 };
    const C = { x: L.center.x, y: L.center.y, z: 1 };
    const D = { x: L.center.x, y: L.center.y, z: 0.95 };
    const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) });
    if (t < 2.7) return mix(A, B, E.inOutSine(clamp(t / 2.7)));
    if (t < 4.6) return mix(B, C, E.inOutCubic((t - 2.7) / 1.9));
    return mix(C, D, E.outSine(clamp((t - 4.6) / (DURATION - 4.6))));
  }

  // -------------------------------------------------------------- desenho
  function drawWall(g, cw, ch) {
    g.fillStyle = "#e7e2d8";
    g.fillRect(0, 0, cw, ch);
    let gr = g.createRadialGradient(cw * 0.28, ch * 0.1, 0, cw * 0.28, ch * 0.1, Math.max(cw, ch) * 0.95);
    gr.addColorStop(0, "rgba(255,254,250,0.7)");
    gr.addColorStop(1, "rgba(255,254,250,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, cw, ch);
    gr = g.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.35, cw / 2, ch / 2, Math.hypot(cw, ch) * 0.62);
    gr.addColorStop(0, "rgba(110,95,75,0)");
    gr.addColorStop(1, "rgba(110,95,75,0.2)");
    g.fillStyle = gr;
    g.fillRect(0, 0, cw, ch);
  }

  function drawSpeckles(g, wall, pitImg, v) {
    const inV = (p, m) => p.x > v.x0 - m && p.x < v.x1 + m && p.y > v.y0 - m && p.y < v.y1 + m;
    for (const p of wall.pits) {
      if (!inV(p, p.r)) continue;
      g.globalAlpha = p.al;
      g.drawImage(pitImg, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    g.globalAlpha = 1;
    for (const b of wall.buckets) {
      g.fillStyle = b.color;
      g.beginPath();
      for (const d of b.dots) {
        if (!inV(d, d.r)) continue;
        g.moveTo(d.x + d.r, d.y);
        g.arc(d.x, d.y, d.r, 0, TAU);
      }
      g.fill();
    }
    g.strokeStyle = "rgba(110,90,62,0.4)";
    g.lineWidth = 0.4;
    g.beginPath();
    for (const f of wall.fibers) {
      if (!inV(f, f.l)) continue;
      const dx = Math.cos(f.a) * f.l, dy = Math.sin(f.a) * f.l;
      g.moveTo(f.x - dx, f.y - dy);
      g.quadraticCurveTo(f.x + dy * 0.3 * f.c, f.y - dx * 0.3 * f.c, f.x + dx, f.y + dy);
    }
    g.stroke();
  }

  function drawSprite(g, sp, x, y, s, alpha) {
    const k = s / sp.S;
    g.globalAlpha = alpha;
    g.drawImage(sp.img, x + sp.ox * s, y + sp.oy * s, sp.w * k, sp.h * k);
  }

  function drawShadow(g, sp, x, y, s, alpha, lift) {
    const k = s / sp.S;
    const grow = 1 + lift * 0.01;
    const w = sp.w * k * grow, h = sp.h * k * grow;
    const cx = x + (sp.ox * s + (sp.w * k) / 2), cy = y + (sp.oy * s + (sp.h * k) / 2);
    g.globalAlpha = alpha * lerp(0.55, 0.2, clamp(lift / 30));
    g.drawImage(sp.shadow, cx - w / 2 + 2.5 + lift * 0.5, cy - h / 2 + 4 + lift, w, h);
  }

  function drawStar(g, x, y, size, a, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = a;
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
    glow.addColorStop(0, "rgba(255,244,210,0.9)");
    glow.addColorStop(1, "rgba(255,244,210,0)");
    g.fillStyle = glow;
    g.beginPath();
    g.arc(0, 0, size * 0.6, 0, TAU);
    g.fill();
    g.fillStyle = "rgba(255,255,245,0.95)";
    const ray = (len, wid, ang) => {
      g.save();
      g.rotate(ang);
      g.beginPath();
      g.moveTo(0, -len);
      g.lineTo(wid, 0);
      g.lineTo(0, len);
      g.lineTo(-wid, 0);
      g.closePath();
      g.fill();
      g.restore();
    };
    ray(size, size * 0.06, 0);
    ray(size, size * 0.06, Math.PI / 2);
    ray(size * 0.45, size * 0.04, Math.PI / 4);
    ray(size * 0.45, size * 0.04, -Math.PI / 4);
    g.restore();
  }

  // ------------------------------------------------------------- componente
  function createQuiroHero(cv, options) {
    const opts = Object.assign(
      {
        autoplay: true,
        font: '"Cinzel", "Trajan Pro", Georgia, serif',
        fontCheck: '600 150px "Cinzel"',
        maxDpr: 2,
        reducedMotion: null,
        onComplete: null,
      },
      options || {}
    );
    const reduce =
      opts.reducedMotion != null
        ? opts.reducedMotion
        : !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const ctx = cv.getContext("2d");
    const layer = makeCanvas(1, 1);
    const lctx = layer.getContext("2d");
    const rand = mulberry32(7);
    const tex = { hammer: makeHammerTexture(rand), grain: makeGrain(rand), pit: makePit() };
    const hd = tex.hammer.getContext("2d").getImageData(0, 0, tex.hammer.width, tex.hammer.height).data;
    const hammer = { s: tex.hammer.width, d: new Float32Array(hd.length / 4) };
    for (let i = 0; i < hammer.d.length; i++) hammer.d[i] = (hd[i * 4] - 128) / 128;

    let L = null, wall = null, spr = null, sprKey = "", grainPat = null;
    let cw = 1, ch = 1, dpr = 1, base = 1;
    let t = 0, raf = 0, startAt = 0, destroyed = false;

    function buildSprites() {
      const q = (x) => Math.round(clamp(x, 1, 6) * 4) / 4;
      const Sv = q(base * 4.4 * dpr); // vértebras: vistas bem de perto
      const St = q(Math.min(4.5, base * 3.4 * dpr)); // letras e "+": aparecem ainda com zoom ~3x
      const key = Sv + "|" + St;
      if (key === sprKey) return;
      sprKey = key;
      const vpath = new Path2D(VERT_PATH);
      const cross = (g, a, len) => {
        g.beginPath();
        const P = [[-a, -len], [a, -len], [a, -a], [len, -a], [len, a], [a, a], [a, len], [-a, len], [-a, a], [-len, a], [-len, -a], [-a, -a]];
        P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        g.fill();
      };
      const r = L.plus.r;
      const frame = (g) => {
        const out = new Path2D(), inn = new Path2D();
        const poly = (P, a, len) => {
          [[-a, -len], [a, -len], [a, -a], [len, -a], [len, a], [a, a], [a, len], [-a, len], [-a, a], [-len, a], [-len, -a], [-a, -a]]
            .forEach(([x, y], i) => (i ? P.lineTo(x, y) : P.moveTo(x, y)));
          P.closePath();
        };
        poly(out, r * 0.37, r);
        poly(inn, r * 0.25, r * 0.88);
        out.addPath(inn);
        g.fill(out, "evenodd");
      };
      spr = {
        vl: makeMetal({
          bbox: [VERT_BBOX[0] - VERT_GAP, VERT_BBOX[1], -VERT_GAP, VERT_BBOX[3]],
          shape: (g) => { g.translate(-VERT_GAP, 0); g.fill(vpath); },
          palette: GOLD, profile: "pillow", bevel: 12, height: 9, depth: 2.5, hammer: 0.7, hammerAmp: 0.5,
        }, Sv, hammer),
        vr: makeMetal({
          bbox: [VERT_GAP, VERT_BBOX[1], -VERT_BBOX[0] + VERT_GAP, VERT_BBOX[3]],
          shape: (g) => { g.translate(VERT_GAP, 0); g.scale(-1, 1); g.fill(vpath); },
          palette: SILVER, profile: "pillow", bevel: 12, height: 9, depth: 2.5, hammer: 0.45, hammerAmp: 0.65,
        }, Sv, hammer),
        letters: L.letters.map((Lt) =>
          makeMetal({
            bbox: Lt.bbox,
            shape: (g) => { g.font = `600 ${L.FS}px ${opts.font}`; g.fillText(Lt.ch, 0, 0); },
            palette: GOLD, bevel: 4.2, height: 4.5, depth: 4, shadowBlur: 6,
          }, St, hammer)
        ),
        plusBase: makeMetal({
          bbox: [-r, -r, r, r],
          shape: (g) => cross(g, r * 0.26, r * 0.89),
          palette: GOLD, bevel: 1.5, height: 1, depth: 0, tone: 0.75,
        }, St, hammer),
        plus: makeMetal({
          bbox: [-r, -r, r, r],
          shape: frame,
          palette: GOLD, bevel: 2.4, height: 3.2, depth: 4,
        }, St, hammer),
        diamond: makeDiamond(St, r * 0.2),
      };
    }

    function resize() {
      const rect = cv.getBoundingClientRect();
      cw = Math.max(1, rect.width);
      ch = Math.max(1, rect.height);
      dpr = Math.min(opts.maxDpr, global.devicePixelRatio || 1);
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      layer.width = cv.width;
      layer.height = cv.height;
      // enquadra como "cover" no desktop, mas garante o logo inteiro no celular
      base = Math.min(Math.max(cw / 1920, ch / 1080), cw / 860);
      grainPat = ctx.createPattern(tex.grain, "repeat");
      if (L) buildSprites();
    }

    // pass 0 = sombras na parede, pass 1 = metal
    function drawLogo(g, t, pass) {
      const P = L.plus;

      L.verts.forEach((v, i) => {
        const p = prog(t, 0.1 + i * 0.34, 0.62);
        if (p <= 0) return;
        const a = clamp(p * 2.4);
        const s = v.s * lerp(1.22, 1, p);
        const lift = lerp(34, 0, p);
        const y = v.y - lerp(14, 0, p);
        if (pass === 0) {
          drawShadow(g, spr.vl, L.spineX, y, s, a, lift);
          drawShadow(g, spr.vr, L.spineX, y, s, a, lift);
        } else {
          drawSprite(g, spr.vl, L.spineX, y, s, a);
          drawSprite(g, spr.vr, L.spineX, y, s, a);
        }
      });

      L.letters.forEach((Lt, j) => {
        const p = prog(t, 3.0 + j * 0.1, 0.85);
        if (p <= 0) return;
        const a = clamp(p * 2);
        const s = lerp(1.08, 1, p);
        const y = L.baseline + lerp(26, 0, p);
        if (pass === 0) drawShadow(g, spr.letters[j], Lt.x, y, s, a, lerp(24, 0, p));
        else drawSprite(g, spr.letters[j], Lt.x, y, s, a);
      });

      const pp = prog(t, 3.75, 0.75, E.outBack);
      if (pp > 0) {
        const a = prog(t, 3.75, 0.3);
        const s = lerp(0.35, 1, pp);
        if (pass === 0) drawShadow(g, spr.plus, P.x, P.y, s, a, lerp(20, 0, clamp(pp)));
        else {
          drawSprite(g, spr.plusBase, P.x, P.y, s, a);
          drawSprite(g, spr.plus, P.x, P.y, s, a);
          const d = spr.diamond, off = P.r * 0.56;
          [[0, 0], [-off, 0], [off, 0], [0, -off], [0, off]].forEach(([dx, dy], k) => {
            const q = prog(t, 4.05 + k * 0.07, 0.4, E.outBack);
            if (q <= 0) return;
            const ds = q * s;
            g.globalAlpha = clamp(q * 2);
            g.drawImage(d.img, P.x + dx * s - d.half * ds, P.y + dy * s - d.half * ds, d.half * 2 * ds, d.half * 2 * ds);
          });
        }
      }

      const lp = prog(t, 4.3, 0.95, E.inOutCubic);
      if (lp > 0) {
        const x0 = L.line.x0, len = (L.line.x1 - x0) * lp, y = L.line.y;
        if (pass === 0) {
          g.globalAlpha = 0.25;
          g.fillStyle = "rgb(70,50,22)";
          g.fillRect(x0 + 1.5, y + 2.2, len, 3.4);
        } else {
          g.globalAlpha = 1;
          const lg = g.createLinearGradient(0, y - 1.7, 0, y + 1.7);
          lg.addColorStop(0, "#f8e3a0");
          lg.addColorStop(0.5, "#c69533");
          lg.addColorStop(1, "#8d6019");
          g.fillStyle = lg;
          g.fillRect(x0, y - 1.7, len, 3.4);
          if (lp < 1) drawStar(g, x0 + len, y, 16, 0.8 * Math.sin(lp * Math.PI), 0);
        }
      }

      const tp = prog(t, 4.95, 1.1);
      if (tp > 0 && pass === 1) {
        const T = L.tag;
        g.font = `600 ${T.size}px ${opts.font}`;
        g.textBaseline = "alphabetic";
        const extra = T.extra + lerp(5, 0, tp);
        let x = L.line.cx - (T.sumW + extra * (T.chars.length - 1)) / 2;
        g.globalAlpha = tp;
        for (const c of T.chars) {
          g.fillStyle = "rgba(255,252,240,0.7)";
          g.fillText(c.ch, x + 0.7, T.y + 0.9);
          g.fillStyle = "#86622a";
          g.fillText(c.ch, x, T.y);
          x += c.w + extra;
        }
      }
      g.globalAlpha = 1;
    }

    function render(t) {
      if (!L || !spr) return;
      const cam = cameraAt(L, t);
      const k = base * cam.z;
      const view = {
        x0: cam.x - cw / 2 / k, x1: cam.x + cw / 2 / k,
        y0: cam.y - ch / 2 / k, y1: cam.y + ch / 2 / k,
      };
      const world = [dpr * k, 0, 0, dpr * k, dpr * (cw / 2 - cam.x * k), dpr * (ch / 2 - cam.y * k)];

      // parede
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      drawWall(ctx, cw, ch);
      ctx.setTransform(...world);
      drawSpeckles(ctx, wall, tex.pit, view);

      // sombras direto na parede
      drawLogo(ctx, t, 0);

      // metal numa camada à parte (pra o reflexo só pegar no metal)
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalCompositeOperation = "source-over";
      lctx.globalAlpha = 1;
      lctx.clearRect(0, 0, layer.width, layer.height);
      lctx.setTransform(...world);
      drawLogo(lctx, t, 1);

      const u = prog(t, 5.9, 1.5, E.inOutSine);
      if (u > 0 && u < 1) {
        const b = L.bounds, span = b.right - b.left + 600;
        const cx = b.left - 300 + span * u;
        lctx.globalCompositeOperation = "source-atop";
        lctx.globalAlpha = 1;
        const sw = lctx.createLinearGradient(cx - 80, b.top, cx + 80, b.top + 70);
        sw.addColorStop(0, "rgba(255,255,240,0)");
        sw.addColorStop(0.5, "rgba(255,255,240,0.6)");
        sw.addColorStop(1, "rgba(255,255,240,0)");
        lctx.fillStyle = sw;
        lctx.fillRect(b.left - 400, b.top - 400, span + 800, b.bottom - b.top + 800);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(layer, 0, 0);

      // brilho do "+"
      const sp = clamp((t - 4.4) / 0.9);
      if (sp > 0 && sp < 1) {
        ctx.setTransform(...world);
        const I = Math.sin(sp * Math.PI);
        drawStar(ctx, L.plus.x + L.plus.r * 0.62, L.plus.y - L.plus.r * 0.72, 34 * I + 4, I, sp * 0.8);
      }

      // grão do gesso (espaço de tela)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = grainPat;
      ctx.fillRect(0, 0, cv.width, cv.height);
    }

    function loop(now) {
      if (destroyed) return;
      if (!startAt) startAt = now - t * 1000;
      t = Math.min(DURATION, (now - startAt) / 1000);
      render(t);
      if (t < DURATION) raf = requestAnimationFrame(loop);
      else {
        raf = 0;
        if (opts.onComplete) opts.onComplete();
      }
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      startAt = 0;
    }

    const ready = (async () => {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.race([document.fonts.load(opts.fontCheck), new Promise((r) => setTimeout(r, 2500))]);
        }
      } catch {
        /* segue com a fonte de fallback */
      }
      L = buildLayout(opts.font);
      wall = buildWall(L, rand);
      resize();
      render(t);
    })();

    let ro = null;
    if (global.ResizeObserver) {
      ro = new ResizeObserver(() => {
        if (!L) return;
        resize();
        render(t);
      });
      ro.observe(cv);
    }

    const api = {
      ready,
      duration: DURATION,
      play() {
        return ready.then(() => {
          if (destroyed) return;
          if (reduce) {
            t = DURATION;
            render(t);
            return;
          }
          if (!raf) {
            startAt = 0;
            raf = requestAnimationFrame(loop);
          }
        });
      },
      replay() {
        stop();
        t = 0;
        return api.play();
      },
      seek(s) {
        return ready.then(() => {
          stop();
          t = clamp(s, 0, DURATION);
          render(t);
        });
      },
      destroy() {
        destroyed = true;
        stop();
        if (ro) ro.disconnect();
      },
    };

    if (opts.autoplay) api.play();
    return api;
  }

  global.createQuiroHero = createQuiroHero;
})(typeof window !== "undefined" ? window : globalThis);
