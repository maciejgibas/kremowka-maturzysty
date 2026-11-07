// Generuje ikony PWA z autorskiej ilustracji. Uruchom: npm run icons
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { appIconSVG } from '../public/js/art.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/icons');
fs.mkdirSync(dir, { recursive: true });
const svg = appIconSVG();
fs.writeFileSync(path.join(dir, 'icon.svg'), svg);
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(dir, name), png);
  console.log('✔ icons/' + name);
}
