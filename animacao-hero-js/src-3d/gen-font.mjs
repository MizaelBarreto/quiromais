// Gera um subset da Cinzel 600 no formato "typeface" do three.js (só os glifos usados)
import opentype from "opentype.js";
import fs from "node:fs";
const src = process.argv[2] || "node_modules/@fontsource/cinzel/files/cinzel-latin-600-normal.woff";
const buf = fs.readFileSync(src);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const text = 'QUIRO' + 'CUIDADO • PERFORMANCE • TRANSFORMAÇÃO';
const chars = [...new Set(text)];
const glyphs = {};
let bb = { xMin: Infinity, yMin: Infinity, xMax: -Infinity, yMax: -Infinity };
const r = (v) => Math.round(v * 10) / 10;
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  const o = [];
  for (const c of g.path.commands) {
    if (c.type === 'M') o.push('m', r(c.x), r(c.y));
    else if (c.type === 'L') o.push('l', r(c.x), r(c.y));
    else if (c.type === 'Q') o.push('q', r(c.x), r(c.y), r(c.x1), r(c.y1));
    else if (c.type === 'C') o.push('b', r(c.x), r(c.y), r(c.x1), r(c.y1), r(c.x2), r(c.y2));
  }
  const m = g.getMetrics();
  bb = { xMin: Math.min(bb.xMin, m.xMin), yMin: Math.min(bb.yMin, m.yMin), xMax: Math.max(bb.xMax, m.xMax), yMax: Math.max(bb.yMax, m.yMax) };
  glyphs[ch] = { ha: g.advanceWidth, x_min: m.xMin, x_max: m.xMax, y_min: m.yMin, y_max: m.yMax, o: o.join(' ') };
}
const out = {
  glyphs, familyName: 'Cinzel', ascender: font.ascender, descender: font.descender,
  underlinePosition: -100, underlineThickness: 50, boundingBox: bb, resolution: font.unitsPerEm,
  original_font_information: { license: 'SIL Open Font License 1.1 — Cinzel (Natanael Gama)' },
};
fs.writeFileSync((process.argv[3] || "cinzel-600-subset.json"), JSON.stringify(out));
console.log('glyphs', chars.length, 'upm', font.unitsPerEm, 'bytes', fs.statSync((process.argv[3] || "cinzel-600-subset.json")).size, 'I', JSON.stringify(glyphs['I'].y_max));
