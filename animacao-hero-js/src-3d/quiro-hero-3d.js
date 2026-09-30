/*!
 * Quiro+ — animação 3D do logo (WebGL / three.js)
 *
 * Mesma sequência do vídeo do hero, mas renderizada em tempo real:
 *   0,0s  câmera fechada na coluna; vértebras de ouro/prata pousam na parede de gesso
 *   2,7s  câmera abre até o logo inteiro; "QUIRO" sobe letra a letra
 *   3,8s  o "+" entra com os diamantes e um brilho
 *   4,3s  a linha dourada se desenha e o slogan aparece
 *   5,9s  uma luz passa rente ao metal (reflexo)
 *   até 13s: drift lento da câmera
 *
 * Realismo: geometria extrudada com chanfro, materiais PBR metálicos refletindo
 * um estúdio (RoomEnvironment), sombras suaves (VSM) numa parede de gesso com relevo.
 */
import * as THREE from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import fontData from "./cinzel-600-subset.json";

const DURATION = 13;

// ------------------------------------------------------------------ utilidades
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

// ruído de valor 3D (para deixar as vértebras orgânicas)
function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const s = (t) => t * t * (3 - 2 * t);
  const u = s(xf), v = s(yf), w = s(zf);
  let acc = 0;
  for (let dx = 0; dx < 2; dx++)
    for (let dy = 0; dy < 2; dy++)
      for (let dz = 0; dz < 2; dz++)
        acc += hash3(xi + dx, yi + dy, zi + dz) * (dx ? u : 1 - u) * (dy ? v : 1 - v) * (dz ? w : 1 - w);
  return acc * 2 - 1;
}

function canvasEl(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

// ------------------------------------------------------------------ texturas
function makePlasterTextures(rand) {
  const S = 1024;
  // cor
  const col = canvasEl(S, S), g = col.getContext("2d", { willReadFrequently: true });
  g.fillStyle = "#e4e2dd";
  g.fillRect(0, 0, S, S);
  // desenha de novo do outro lado quando encosta na borda (textura sem emenda)
  const wrapDraw = (x, y, r, fn) => {
    for (const ox of [-S, 0, S])
      for (const oy of [-S, 0, S])
        if (x + ox + r > 0 && x + ox - r < S && y + oy + r > 0 && y + oy - r < S) fn(ox, oy);
  };
  for (let i = 0; i < 140; i++) {
    const x = rand() * S, y = rand() * S, r = 30 + rand() * 120, dark = rand() < 0.5;
    const a = 0.025 + rand() * 0.035;
    wrapDraw(x, y, r, (ox, oy) => {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, dark ? `rgba(150,138,118,${a * 0.5})` : `rgba(255,255,252,${a})`);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    });
  }
  const colors = ["rgba(86,72,54,0.7)", "rgba(112,96,74,0.45)", "rgba(150,136,112,0.3)"];
  for (let i = 0; i < 1100; i++) {
    const x = rand() * S, y = rand() * S, r = 0.45 + Math.pow(rand(), 4) * 2.4;
    g.fillStyle = colors[(rand() * 3) | 0];
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = "rgba(115,95,70,0.35)";
  g.lineWidth = 0.7;
  for (let i = 0; i < 160; i++) {
    const x = rand() * S, y = rand() * S, a = rand() * Math.PI, l = 3 + rand() * 9;
    g.beginPath();
    g.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l);
    g.quadraticCurveTo(x + (rand() - 0.5) * 4, y + (rand() - 0.5) * 4, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }

  // relevo (bump): ondulação suave + poros
  const bump = canvasEl(S, S), b = bump.getContext("2d", { willReadFrequently: true });
  b.fillStyle = "#808080";
  b.fillRect(0, 0, S, S);
  for (let i = 0; i < 220; i++) {
    const x = rand() * S, y = rand() * S, r = 20 + rand() * 90, up = rand() < 0.5;
    wrapDraw(x, y, r, (ox, oy) => {
      const gr = b.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, up ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)");
      gr.addColorStop(1, "rgba(128,128,128,0)");
      b.fillStyle = gr;
      b.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    });
  }
  for (let i = 0; i < 900; i++) {
    const x = rand() * S, y = rand() * S, r = 1 + Math.pow(rand(), 2) * 6;
    const gr = b.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(0,0,0,0.6)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    b.fillStyle = gr;
    b.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const img = b.getImageData(0, 0, S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 18;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  b.putImageData(img, 0, 0);
  return { col, bump };
}

// relevo irregular do metal (martelado / fundido)
function makeMetalBump(rand, dents) {
  const S = 512, c = canvasEl(S, S), g = c.getContext("2d", { willReadFrequently: true });
  g.fillStyle = "#808080";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < dents; i++) {
    const x = rand() * S, y = rand() * S, r = 10 + rand() * 34;
    for (const ox of [-S, 0, S])
      for (const oy of [-S, 0, S]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        const a = 0.18 + rand() * 0.2;
        gr.addColorStop(0, rand() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`);
        gr.addColorStop(1, "rgba(128,128,128,0)");
        g.fillStyle = gr;
        g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
  }
  return c;
}

function makeSparkleTexture() {
  const S = 256, c = canvasEl(S, S), g = c.getContext("2d", { willReadFrequently: true });
  g.translate(S / 2, S / 2);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, S * 0.14);
  glow.addColorStop(0, "rgba(255,248,225,0.85)");
  glow.addColorStop(1, "rgba(255,248,225,0)");
  g.fillStyle = glow;
  g.fillRect(-S / 2, -S / 2, S, S);
  const ray = (len, wid, ang) => {
    g.save();
    g.rotate(ang);
    const gr = g.createLinearGradient(0, -len, 0, len);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.5, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, -len);
    g.lineTo(wid, 0);
    g.lineTo(0, len);
    g.lineTo(-wid, 0);
    g.closePath();
    g.fill();
    g.restore();
  };
  ray(S * 0.48, S * 0.022, 0);
  ray(S * 0.48, S * 0.022, Math.PI / 2);
  ray(S * 0.22, S * 0.015, Math.PI / 4);
  ray(S * 0.22, S * 0.015, -Math.PI / 4);
  return c;
}

// ------------------------------------------------------------ estúdio (reflexos)
// Ambiente HDR simples feito de painéis de luz: é o que o metal "reflete".
// Céu claro, chão escuro (dá o contraste do metal polido), um softbox grande
// atrás da câmera (ilumina as faces frontais) e réguas de luz laterais.
function studioEnvironment() {
  const env = new THREE.Scene();
  const room = new THREE.SphereGeometry(50, 48, 24);
  const pos = room.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 50; // -1..1
    let v;
    if (y > 0.05) v = lerp(0.9, 1.5, clamp((y - 0.05) / 0.9));
    else if (y > -0.12) v = lerp(0.14, 0.9, (y + 0.12) / 0.17);
    else v = lerp(0.14, 0.05, clamp((-y - 0.12) / 0.6));
    colors[i * 3] = v * 1.0;
    colors[i * 3 + 1] = v * 0.97;
    colors[i * 3 + 2] = v * 0.92;
  }
  room.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(room, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const panel = (w, h, x, y, z, intensity) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    m.material.color.setRGB(intensity, intensity * 0.97, intensity * 0.9);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  // softbox atrás da câmera, com degradê vertical: é o que as faces frontais refletem
  {
    const c = canvasEl(8, 256), g = c.getContext("2d", { willReadFrequently: true });
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.35, "#c8c8c8");
    gr.addColorStop(0.62, "#6a6a6a");
    gr.addColorStop(1, "#1e1e1e");
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    m.material.color.setRGB(1.35, 1.3, 1.22);
    m.position.set(0, 2, 40);
    m.lookAt(0, 0, 0);
    env.add(m);
  }
  panel(8, 34, -32, 6, 14, 5.5);    // régua à esquerda
  panel(6, 30, 34, 2, 10, 2.6);     // régua à direita
  panel(40, 14, 0, 40, 0, 2.2);     // teto
  panel(16, 5, 10, -3, 36, 1.6);    // rebatedor baixo
  return env;
}

// ----------------------------------------------------------------- geometria
// Meia vértebra (lado esquerdo, ouro) — asa larga em cima e "gota" descendo junto ao centro.
// Coordenadas com y pra baixo (como SVG); convertidas pra y pra cima ao montar o Shape.
const VERT = [
  ["M", -1, -17],
  ["C", -7, -21, -16, -18, -24, -19],
  ["C", -32, -20, -41, -25, -47, -19],
  ["C", -53, -13, -49, -5, -42, -4],
  ["C", -35, -3, -29, 0, -25, 5],
  ["C", -22, 10, -21, 17, -16, 22],
  ["C", -12, 27, -4, 28, -2, 22],
  ["C", -1, 12, -1, 0, -1, -17],
];
const VERT_TOP = 24, VERT_BOTTOM = 28; // extensão vertical da forma

function vertebraShape() {
  const s = new THREE.Shape();
  for (const c of VERT) {
    if (c[0] === "M") s.moveTo(c[1], -c[2]);
    else s.bezierCurveTo(c[1], -c[2], c[3], -c[4], c[5], -c[6]);
  }
  return s;
}

// Extrusão arredondada + deformação orgânica; normais suaves.
function organicExtrude(shapes, opt) {
  let geo = new THREE.ExtrudeGeometry(shapes, {
    depth: opt.depth,
    bevelEnabled: true,
    bevelThickness: opt.bevelThickness,
    bevelSize: opt.bevelSize,
    bevelOffset: opt.bevelOffset != null ? opt.bevelOffset : 0,
    bevelSegments: opt.bevelSegments || 8,
    curveSegments: opt.curveSegments || 24,
  });
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  geo = mergeVertices(geo, 1e-3);
  geo.computeVertexNormals();
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  if (opt.noiseAmp) {
    const f = opt.noiseFreq || 0.1, seed = opt.seed || 0;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (z < -opt.bevelThickness + 0.5) continue; // não mexe na face colada na parede
      const n = noise3(x * f + seed, y * f, z * f) * 0.7 + noise3(x * f * 2.3, y * f * 2.3 + seed, z * f * 2.3) * 0.3;
      const d = n * opt.noiseAmp;
      pos.setXYZ(i, x + nor.getX(i) * d, y + nor.getY(i) * d, z + nor.getZ(i) * d);
    }
    geo.computeVertexNormals();
  }
  // face da frente plana de verdade (evita "estrias" na interpolação das normais)
  const zTop = opt.depth + opt.bevelThickness - 1e-3;
  if (!opt.noiseAmp) {
    for (let i = 0; i < pos.count; i++) if (pos.getZ(i) >= zTop) nor.setXYZ(i, 0, 0, 1);
  }
  // UV planar (para o relevo do metal)
  const uv = new Float32Array(pos.count * 2);
  const k = 1 / (opt.uvScale || 60);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) * k;
    uv[i * 2 + 1] = pos.getY(i) * k + pos.getZ(i) * k * 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  // assenta a face de trás na parede (z = 0)
  geo.translate(0, 0, opt.bevelThickness);
  return geo;
}

// Peça "fundida": superfície em domo sobre o contorno, com perfil arredondado
// na borda e ondulação orgânica. Malha em grade regular (normais suaves, sem
// estrias); os vértices logo fora do contorno são "grudados" nele.
function pillowGeometry(shape, o) {
  const outline = shape.getSpacedPoints(o.outlinePts || 260);
  if (outline[0].distanceTo(outline[outline.length - 1]) < 1e-6) outline.pop();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  outline.forEach((p) => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });
  const n = outline.length;
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const a = outline[i], b = outline[j];
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  };
  const nearest = (x, y) => {
    let m = Infinity, px = x, py = y;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const a = outline[j], b = outline[i];
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1));
      const qx = a.x + dx * t, qy = a.y + dy * t;
      const d = Math.hypot(x - qx, y - qy);
      if (d < m) { m = d; px = qx; py = qy; }
    }
    return [m, px, py];
  };
  const sp = o.spacing || 1;
  const x0 = minX - sp, y0 = minY - sp;
  const nx = Math.ceil((maxX - minX) / sp) + 3, ny = Math.ceil((maxY - minY) / sp) + 3;
  const R = o.radius, H = o.height, f = o.noiseFreq || 0.1, seed = o.seed || 0;
  const map = new Int32Array(nx * ny).fill(-1);
  const isIn = new Uint8Array(nx * ny);
  const P = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      let x = x0 + i * sp, y = y0 + j * sp;
      const k = j * nx + i;
      const [d, qx, qy] = nearest(x, y);
      const ins = inside(x, y);
      let dd = d;
      if (!ins) {
        if (d > sp * 1.5) continue;
        x = qx; y = qy; dd = 0;
      }
      isIn[k] = ins ? 1 : 0;
      const u = clamp(dd / R);
      let z = H * Math.sqrt(1 - (1 - u) * (1 - u));
      z += (o.dome || 0) * clamp(dd / (R * 3));
      if (o.noiseAmp) {
        const nz = noise3(x * f + seed, y * f, seed * 0.37) * 0.7 + noise3(x * f * 2.4, y * f * 2.4 + seed, 1.7) * 0.3;
        z += nz * o.noiseAmp * u;
      }
      map[k] = P.length / 3;
      P.push(x, y, z);
    }
  }
  const idx = [];
  const tri = (a, b, c) => {
    const ia = map[a], ib = map[b], ic = map[c];
    if (ia < 0 || ib < 0 || ic < 0) return;
    if (!isIn[a] && !isIn[b] && !isIn[c]) return;
    const ax = P[ia * 3], ay = P[ia * 3 + 1], bx = P[ib * 3], by = P[ib * 3 + 1], cx = P[ic * 3], cy = P[ic * 3 + 1];
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (area <= 1e-4) return; // degenerado ou virado
    idx.push(ia, ib, ic);
  };
  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const k = j * nx + i;
      tri(k, k + 1, k + nx + 1);
      tri(k, k + nx + 1, k + nx);
    }
  }
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(P);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const cnt = pos.length / 3, uv = new Float32Array(cnt * 2), k = 1 / (o.uvScale || 60);
  for (let i = 0; i < cnt; i++) {
    uv[i * 2] = pos[i * 3] * k;
    uv[i * 2 + 1] = pos[i * 3 + 1] * k;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

function crossShape(a, len) {
  const P = [[-a, -len], [a, -len], [a, -a], [len, -a], [len, a], [a, a], [a, len], [-a, len], [-a, a], [-len, a], [-len, -a], [-a, -a]];
  const s = new THREE.Shape();
  P.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}
function crossPath(a, len) {
  const P = [[-a, -len], [-a, -a], [-len, -a], [-len, a], [-a, a], [-a, len], [a, len], [a, a], [len, a], [len, -a], [a, -a], [a, -len]];
  const s = new THREE.Path();
  P.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

// Brilhante redondo (lapidação simplificada): mesa octogonal, facetas de
// estrela/coroa até o rondízio de 16 lados e pavilhão até a culaça.
// Faces planas: cada faceta reflete um pedaço diferente do estúdio → cintila.
function diamondGeometry(r) {
  const tableR = r * 0.55, tableH = r * 0.36, starR = r * 0.8, starH = r * 0.22, girdleH = 0.02 * r;
  const pavR = r * 0.5, pavH = -r * 0.42, culet = -r * 0.86;
  const ring = (n, rad, z, rot) => Array.from({ length: n }, (_, i) => {
    const a = rot + (i / n) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * rad, Math.sin(a) * rad, z);
  });
  const T = ring(8, tableR, tableH, 0);
  const S = ring(8, starR, starH, Math.PI / 8);
  const G = ring(16, r, girdleH, 0);
  const Pm = ring(8, pavR, pavH, Math.PI / 8);
  const tris = [];
  const f = (a, b, c) => tris.push(a, b, c);
  const top = new THREE.Vector3(0, 0, tableH);
  for (let i = 0; i < 8; i++) {
    const i1 = (i + 1) % 8;
    f(top, T[i], T[i1]); // mesa
    f(T[i], S[i], T[i1]); // estrela
    // coroa: kite entre mesa, estrela e rondízio
    f(T[i], G[2 * i], S[i]);
    f(S[i], G[2 * i], G[(2 * i + 1) % 16]);
    f(S[i], G[(2 * i + 1) % 16], G[(2 * i + 2) % 16]);
    f(S[i], G[(2 * i + 2) % 16], T[i1]);
    // pavilhão
    f(G[2 * i], Pm[i], G[(2 * i + 1) % 16]);
    f(G[(2 * i + 1) % 16], Pm[i], G[(2 * i + 2) % 16]);
    f(Pm[i], new THREE.Vector3(0, 0, culet), Pm[(i + 1) % 8]);
    f(G[(2 * i + 2) % 16], Pm[i], Pm[(i + 1) % 8]);
  }
  const pos = new Float32Array(tris.length * 3);
  tris.forEach((v, i) => pos.set([v.x, v.y, v.z], i * 3));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  // garante as faces viradas pra fora
  const nrm = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.length; i += 9) {
    const A = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);
    const B = new THREE.Vector3(pos[i + 3], pos[i + 4], pos[i + 5]);
    const C = new THREE.Vector3(pos[i + 6], pos[i + 7], pos[i + 8]);
    e1.subVectors(B, A); e2.subVectors(C, A); nrm.crossVectors(e1, e2);
    c.copy(A).add(B).add(C).divideScalar(3);
    c.z -= (tableH + culet) / 2 * 0.2;
    if (nrm.dot(c) < 0) {
      pos.set([C.x, C.y, C.z], i + 3);
      pos.set([B.x, B.y, B.z], i + 6);
    }
  }
  g.computeVertexNormals(); // não indexada → normais por faceta
  return g;
}
// --------------------------------------------------------------------- layout
// Unidades de mundo ≈ pixels do vídeo em 1920×1080; y pra cima; parede em z = 0.
function buildLayout(font) {
  const FS = 150;
  const sc = FS / fontData.resolution;
  const G = fontData.glyphs;
  const track = 5;
  const word = "QUIRO".split("");
  const wordW = word.reduce((s, ch) => s + G[ch].ha * sc, 0) + track * (word.length - 1);
  const cap = G.I.y_max * sc;
  const plusR = Math.round(cap * 0.62), gap = 16;
  const groupW = wordW + gap + plusR * 2;
  const x0 = -groupW / 2;
  let x = x0;
  const letters = word.map((ch) => {
    const L = { ch, x };
    x += G[ch].ha * sc + track;
    return L;
  });
  const plus = { x: x0 + wordW + gap + plusR, y: cap * 0.5, r: plusR };

  const spineX = x0 + wordW / 2;
  const spineBottom = cap + 22;
  const N = 6, verts = [];
  let y = 0;
  for (let i = 0; i < N; i++) {
    const s = lerp(1.12, 1, i / (N - 1));
    verts.push({ y, s });
    y -= 44 * s;
  }
  const last = verts[N - 1];
  const shift = spineBottom - (last.y - VERT_BOTTOM * last.s);
  verts.forEach((v) => (v.y += shift));

  const line = { x0: x0 - 12, x1: plus.x + plusR + 6, y: -30 };
  const tag = { y: -30 - 38, size: 24, text: "CUIDADO • PERFORMANCE • TRANSFORMAÇÃO" };
  const tsc = tag.size / fontData.resolution;
  const chars = tag.text.split("").map((ch) => ({ ch, w: G[ch] ? G[ch].ha * tsc : tag.size * 0.3 }));
  const sumW = chars.reduce((s, c) => s + c.w, 0);
  tag.chars = chars;
  tag.extra = ((line.x1 - line.x0) * 0.97 - sumW) / (chars.length - 1);
  tag.sumW = sumW;

  const top = verts[0].y + VERT_TOP * verts[0].s;
  const bottom = tag.y - 6;
  return {
    FS, letters, cap, plus, spineX, verts, line, tag,
    bounds: { left: line.x0, right: line.x1, top, bottom },
    center: { x: (line.x0 + line.x1) / 2, y: (top + bottom) / 2 },
    font,
  };
}

// ----------------------------------------------------------------- componente
export function createQuiroHero3D(canvas, options) {
  const opts = Object.assign({ autoplay: true, maxDpr: 2, reducedMotion: null, onComplete: null }, options || {});
  const reduce =
    opts.reducedMotion != null
      ? opts.reducedMotion
      : !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(studioEnvironment(), 0.02);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1;
  scene.background = new THREE.Color("#dedad3");

  const camera = new THREE.PerspectiveCamera(22, 1, 1, 100000);
  const rand = mulberry32(11);
  const font = new Font(fontData);
  const L = buildLayout(font);
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // --- parede de gesso
  const plaster = makePlasterTextures(rand);
  const wallMap = new THREE.CanvasTexture(plaster.col);
  wallMap.colorSpace = THREE.SRGBColorSpace;
  const wallBump = new THREE.CanvasTexture(plaster.bump);
  for (const t of [wallMap, wallBump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 8);
    t.anisotropy = maxAniso;
  }
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(7200, 7200),
    new THREE.MeshStandardMaterial({ map: wallMap, bumpMap: wallBump, bumpScale: 1.6, roughness: 0.96, metalness: 0, envMapIntensity: 0.3 })
  );
  wall.position.set(L.center.x, L.center.y, 0);
  wall.receiveShadow = true;
  scene.add(wall);

  // --- luzes
  const key = new THREE.DirectionalLight(0xfffaf4, 2.0);
  key.position.set(L.center.x - 420, L.center.y + 620, 760);
  key.target.position.set(L.center.x, L.center.y, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const sc = key.shadow.camera;
  sc.left = -520; sc.right = 520; sc.top = 520; sc.bottom = -520; sc.near = 100; sc.far = 2400;
  key.shadow.radius = 9;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6d6a66, 0.5));


  // --- materiais
  const metalBumpGold = new THREE.CanvasTexture(makeMetalBump(rand, 70));
  const metalBumpSilver = new THREE.CanvasTexture(makeMetalBump(rand, 160));
  for (const t of [metalBumpGold, metalBumpSilver]) t.wrapS = t.wrapT = THREE.RepeatWrapping;

  const GOLD = new THREE.MeshPhysicalMaterial({
    color: "#ffcc4d", metalness: 1, roughness: 0.16, envMapIntensity: 1,
    clearcoat: 0.35, clearcoatRoughness: 0.08, transparent: true,
  });
  const GOLD_ORGANIC = GOLD.clone();
  GOLD_ORGANIC.roughness = 0.24;
  GOLD_ORGANIC.bumpMap = metalBumpGold;
  GOLD_ORGANIC.bumpScale = 1.4;
  const SILVER = new THREE.MeshPhysicalMaterial({
    color: "#d8dce1", metalness: 1, roughness: 0.18, envMapIntensity: 1,
    bumpMap: metalBumpSilver, bumpScale: 2.2, clearcoat: 0.25, clearcoatRoughness: 0.12, transparent: true,
  });
  // ouro "de joia" das letras, linha e "+": mais amarelo e mais brilhante
  const GOLD_BRIGHT = new THREE.MeshPhysicalMaterial({
    color: "#ffd65c", metalness: 1, roughness: 0.13, envMapIntensity: 1.3,
    clearcoat: 0.5, clearcoatRoughness: 0.05, transparent: true,
  });
  const GOLD_MATTE = GOLD_BRIGHT.clone();
  GOLD_MATTE.color = new THREE.Color("#f7c24a");
  GOLD_MATTE.roughness = 0.24;
  GOLD_MATTE.clearcoat = 0;
  // diamante: facetas espelhadas levemente frias, refletindo o estúdio
  const DIAMOND = new THREE.MeshPhysicalMaterial({
    color: "#f3f7ff", metalness: 1, roughness: 0.02, envMapIntensity: 2.1,
    emissive: "#1d2433", flatShading: true, transparent: true,
  });
  const materials = [GOLD, GOLD_ORGANIC, SILVER, GOLD_BRIGHT, GOLD_MATTE, DIAMOND];

  const logo = new THREE.Group();
  scene.add(logo);
  const castAll = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });

  // --- vértebras
  const vShape = vertebraShape();
  const vOpt = { radius: 7, height: 8, dome: 3, spacing: 0.8, noiseAmp: 1.6, noiseFreq: 0.12, uvScale: 55 };
  const vGeoL = pillowGeometry(vShape, { ...vOpt, seed: 3 });
  const vGeoR = pillowGeometry(vShape, { ...vOpt, seed: 17 });
  const GAP = 1.4;
  const verts = L.verts.map((v, i) => {
    const gm = GOLD_ORGANIC.clone(), sm = SILVER.clone();
    materials.push(gm, sm);
    const left = new THREE.Mesh(vGeoL, gm);
    left.position.x = -GAP;
    const right = new THREE.Mesh(vGeoR, sm);
    right.scale.x = -1;
    right.position.x = GAP;
    const grp = new THREE.Group();
    grp.add(left, right);
    grp.rotation.z = (i % 2 ? 1 : -1) * 0.015; // leve irregularidade, como peça real
    castAll(grp);
    grp.userData = { base: v, mats: [gm, sm] };
    logo.add(grp);
    return grp;
  });

  // --- letras
  const letterOpts = {
    depth: 10, bevelThickness: 3.2, bevelSize: 2.4, bevelOffset: -0.6, bevelSegments: 6, curveSegments: 18,
  };
  const letters = L.letters.map((Lt) => {
    const geo = organicExtrude(font.generateShapes(Lt.ch, L.FS), { ...letterOpts, uvScale: 120 });
    const mat = GOLD_BRIGHT.clone();
    materials.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    castAll(mesh);
    mesh.userData = { x: Lt.x, mat };
    logo.add(mesh);
    return mesh;
  });

  // --- "+" com diamantes
  const P = L.plus;
  const plus = new THREE.Group();
  plus.position.set(P.x, P.y, 0);
  const frameShape = crossShape(P.r * 0.37, P.r);
  frameShape.holes.push(crossPath(P.r * 0.3, P.r * 0.92));
  const frameMat = GOLD_BRIGHT.clone(), bedMat = GOLD_MATTE.clone(), diaMat = DIAMOND.clone(), bezelMat = GOLD_BRIGHT.clone();
  bedMat.color = new THREE.Color("#e0a93c");
  bedMat.roughness = 0.32;
  materials.push(frameMat, bedMat, diaMat, bezelMat);
  const frame = new THREE.Mesh(
    organicExtrude(frameShape, { depth: 10, bevelThickness: 2.4, bevelSize: 1.4, bevelOffset: -0.3, bevelSegments: 6, curveSegments: 4 }),
    frameMat
  );
  const bed = new THREE.Mesh(
    organicExtrude(crossShape(P.r * 0.31, P.r * 0.93), { depth: 4, bevelThickness: 1, bevelSize: 0.8, bevelSegments: 2, curveSegments: 4 }),
    bedMat
  );
  plus.add(frame, bed);
  castAll(plus);
  const dr = P.r * 0.25;
  const dGeo = diamondGeometry(dr);
  const bezelGeo = new THREE.TorusGeometry(dr * 1.04, dr * 0.13, 10, 40);
  const off = P.r * 0.6;
  const diamonds = [[0, 0], [-off, 0], [off, 0], [0, off], [0, -off]].map(([dx, dy], k) => {
    const g = new THREE.Group();
    g.position.set(dx, dy, 8.5);
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.z = -0.6;
    const d = new THREE.Mesh(dGeo, diaMat);
    d.rotation.z = k * 0.37;
    d.rotation.x = -0.12; // inclina de leve pra luz de cima: mais facetas acesas
    g.add(bezel, d);
    castAll(g);
    plus.add(g);
    return g;
  });
  logo.add(plus);

  // --- linha
  const lineLen = L.line.x1 - L.line.x0;
  const lineGeo = organicExtrude(
    (() => {
      const s = new THREE.Shape();
      s.moveTo(0, -1.8);
      s.lineTo(lineLen, -1.8);
      s.lineTo(lineLen, 1.8);
      s.lineTo(0, 1.8);
      s.closePath();
      return s;
    })(),
    { depth: 1.2, bevelThickness: 1, bevelSize: 0.8, bevelOffset: -0.6, bevelSegments: 3, curveSegments: 1 }
  );
  const lineMat = GOLD_BRIGHT.clone();
  materials.push(lineMat);
  const line = new THREE.Mesh(lineGeo, lineMat);
  line.position.set(L.line.x0, L.line.y, 0);
  castAll(line);
  logo.add(line);

  // --- slogan (3D raso)
  const tagMat = GOLD_MATTE.clone();
  materials.push(tagMat);
  const tag = new THREE.Group();
  {
    const T = L.tag;
    let x = L.line.x0 + ((L.line.x1 - L.line.x0) - (T.sumW + T.extra * (T.chars.length - 1))) / 2;
    const cache = {};
    for (const c of T.chars) {
      if (c.ch !== " ") {
        if (!cache[c.ch]) {
          cache[c.ch] = organicExtrude(font.generateShapes(c.ch, T.size), {
            depth: 1.2, bevelThickness: 0.7, bevelSize: 0.45, bevelSegments: 2, curveSegments: 6,
          });
        }
        const m = new THREE.Mesh(cache[c.ch], tagMat);
        m.position.set(x, T.y, 0);
        m.castShadow = true;
        tag.add(m);
      }
      x += c.w + T.extra;
    }
  }
  logo.add(tag);

  // --- brilho do "+"
  const sparkleMat = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(makeSparkleTexture()), blending: THREE.AdditiveBlending,
    depthWrite: false, depthTest: false, transparent: true, opacity: 0,
  });
  const sparkle = new THREE.Sprite(sparkleMat);
  sparkle.position.set(P.x + P.r * 0.62, P.y + P.r * 0.72, 30);
  scene.add(sparkle);
  const lineSpark = new THREE.Sprite(sparkleMat.clone());
  scene.add(lineSpark);
  // cintilação dos diamantes (pequenos brilhos que acendem e apagam)
  const twinkles = diamonds.map((d, k) => {
    const sp = new THREE.Sprite(sparkleMat.clone());
    sp.userData = {
      dx: d.position.x + (k % 2 ? 0.35 : -0.3) * dr,
      dy: d.position.y + (k % 3 ? 0.3 : -0.25) * dr,
      phase: k * 1.37, speed: 1.6 + (k % 3) * 0.45,
    };
    scene.add(sp);
    return sp;
  });

  // ------------------------------------------------------------ câmera
  let cw = 1, ch = 1, base = 1;
  function cameraAt(t) {
    const v0 = L.verts[0], vl = L.verts[L.verts.length - 1];
    const A = { x: L.spineX + 12, y: v0.y - 30, z: 4.2 };
    const B = { x: L.spineX, y: vl.y + 30, z: 3.1 };
    const C = { x: L.center.x, y: L.center.y, z: 1 };
    const D = { x: L.center.x, y: L.center.y, z: 0.95 };
    const mix = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) });
    if (t < 2.7) return mix(A, B, E.inOutSine(clamp(t / 2.7)));
    if (t < 4.6) return mix(B, C, E.inOutCubic((t - 2.7) / 1.9));
    return mix(C, D, E.outSine(clamp((t - 4.6) / (DURATION - 4.6))));
  }

  function placeCamera(t) {
    const c = cameraAt(t);
    const visH = ch / (base * c.z);
    const dist = visH / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    // leve ângulo de cima/esquerda que gira devagar — dá paralaxe real
    const orbit = lerp(-0.05, 0.035, E.inOutSine(clamp(t / DURATION)));
    camera.position.set(c.x + dist * orbit, c.y + dist * 0.06, dist);
    camera.near = dist * 0.2;
    camera.far = dist * 4;
    camera.lookAt(c.x, c.y, 0);
    camera.updateProjectionMatrix();
  }

  // ------------------------------------------------------------ timeline
  function setOpacity(mats, a) {
    mats.forEach((m) => (m.opacity = a));
  }

  function update(t) {
    verts.forEach((g, i) => {
      const v = g.userData.base;
      const p = prog(t, 0.1 + i * 0.34, 0.7);
      g.visible = p > 0;
      const a = clamp(p * 2.2);
      setOpacity(g.userData.mats, a);
      const s = v.s * lerp(1.12, 1, p);
      g.scale.set(s, s, s);
      g.position.set(L.spineX, v.y + lerp(10, 0, p), lerp(70, 0, p));
      g.rotation.x = lerp(-0.35, 0, p);
      g.children.forEach((m) => (m.castShadow = a > 0.35));
    });

    letters.forEach((m, j) => {
      const p = prog(t, 3.0 + j * 0.1, 0.85);
      m.visible = p > 0;
      m.userData.mat.opacity = clamp(p * 2);
      m.position.set(m.userData.x, lerp(-24, 0, p), lerp(40, 0, p));
      m.rotation.x = lerp(0.5, 0, p);
      m.castShadow = p > 0.3;
    });

    const pp = prog(t, 3.75, 0.75, E.outBack);
    plus.visible = pp > 0;
    const pa = prog(t, 3.75, 0.3);
    setOpacity([frameMat, bedMat], pa);
    const ps = Math.max(0.001, lerp(0.35, 1, pp));
    plus.scale.set(ps, ps, ps);
    plus.position.z = lerp(30, 0, clamp(pp));
    diamonds.forEach((d, k) => {
      const q = prog(t, 4.05 + k * 0.07, 0.4, E.outBack);
      d.visible = q > 0;
      const s = Math.max(0.001, q);
      d.scale.set(s, s, s);
    });
    diaMat.opacity = 1;
    twinkles.forEach((sp, k) => {
      const q = prog(t, 4.3 + k * 0.07, 0.4);
      const wave = Math.pow(Math.max(0, Math.sin(t * sp.userData.speed * Math.PI + sp.userData.phase)), 12);
      sp.material.opacity = q * wave * 0.9;
      sp.material.rotation = t * 0.3 + k;
      sp.scale.setScalar(8 + 16 * wave);
      sp.position.set(P.x + sp.userData.dx * ps, P.y + sp.userData.dy * ps, 26);
    });

    const lp = prog(t, 4.3, 0.95, E.inOutCubic);
    line.visible = lp > 0;
    line.scale.x = Math.max(0.001, lp);
    lineMat.opacity = clamp(lp * 4);
    const lsI = lp > 0 && lp < 1 ? Math.sin(lp * Math.PI) : 0;
    lineSpark.material.opacity = lsI * 0.8;
    lineSpark.position.set(L.line.x0 + lineLen * lp, L.line.y, 12);
    lineSpark.scale.setScalar(26);

    const tp = prog(t, 4.95, 1.1);
    tag.visible = tp > 0;
    tagMat.opacity = tp;
    tag.position.y = lerp(-6, 0, tp);

    const sp = clamp((t - 4.4) / 0.9);
    const I = sp > 0 && sp < 1 ? Math.sin(sp * Math.PI) : 0;
    sparkleMat.opacity = I;
    sparkleMat.rotation = sp * 0.8;
    sparkle.scale.setScalar(14 + 46 * I);

    // reflexo passando pelo metal: o "estúdio" gira um pouco e volta
    const u = prog(t, 5.9, 1.8, E.inOutSine);
    scene.environmentRotation.set(0, Math.sin(u * Math.PI) * 0.45, 0);

    placeCamera(t);
  }

  // ------------------------------------------------------------ ciclo
  let t = 0, raf = 0, startAt = 0, destroyed = false;
  function render(tt) {
    update(tt);
    renderer.render(scene, camera);
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    cw = Math.max(1, r.width);
    ch = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(opts.maxDpr, window.devicePixelRatio || 1));
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    base = Math.min(Math.max(cw / 1920, ch / 1080), cw / 860);
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

  resize();
  // compila os shaders antes do primeiro quadro (evita engasgo no início)
  const ready = (renderer.compileAsync ? renderer.compileAsync(scene, camera) : Promise.resolve()).then(() => {
    if (!destroyed) render(t);
  });

  let ro = null;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(() => {
      resize();
      if (!raf) render(t);
    });
    ro.observe(canvas);
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
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
      materials.forEach((m) => m.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };

  if (opts.autoplay) api.play();
  return api;
}

window.createQuiroHero3D = createQuiroHero3D;
