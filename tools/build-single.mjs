// Skleja grę w JEDEN plik HTML (JS, CSS, fonty, ikony i PDF-y wbudowane),
// który można otworzyć dwuklikiem – bez serwera.
// Uruchom: npm run single   →   ../Kremowka-Maturzysty.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const b64 = (p) => fs.readFileSync(path.join(root, p)).toString('base64');

// --- CSS z fontami jako data URI ---
const css = read('css/styles.css').replace(/url\(\.\.\/fonts\/([^)]+)\)/g, (_, f) => `url(data:font/ttf;base64,${b64('fonts/' + f)})`);

// --- JS: moduły ES → jeden zwykły skrypt (file:// nie pozwala ładować modułów) ---
const strip = (src) => src
  .replace(/^import[^;]+;\s*$/gm, '')
  .replace(/^export\s+(?=(const|let|function|class|async)\b)/gm, '');
const js = ['js/art.js', 'js/fx.js', 'js/voice.js', 'js/app.js'].map((f) => `// ---- ${f} ----\n${strip(read(f))}`).join('\n');
if (/^\s*(import|export)\b/m.test(js)) throw new Error('Zostały instrukcje import/export – popraw strip()');

const recipes = `window.__INLINE_RECIPES__ = ${JSON.stringify({
  classic: b64('recipes/kremowka-klasyczna.pdf'),
  maturzysta: b64('recipes/kremowka-maturzysty.pdf'),
})};`;

// --- HTML ---
let html = read('index.html')
  .replace(/^\s*<link rel="(manifest|preload)"[^>]*>\n/gm, '')
  .replace('href="icons/icon.svg"', `href="data:image/svg+xml;base64,${b64('icons/icon.svg')}"`)
  .replace('href="icons/apple-touch-icon.png"', `href="data:image/png;base64,${b64('icons/apple-touch-icon.png')}"`)
  .replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="js/app.js"></script>', '<!--APP-->');

// Kontrola: w samym HTML nie może zostać żadne odwołanie do pliku zewnętrznego.
const leftover = html.replace(/<style>[\s\S]*?<\/style>/, '').match(/(src|href)="(?!data:|#|https?:)[^"]+"|url\(\.\.\/[^)]+\)/);
if (leftover) throw new Error('Nie podmieniono odwołania: ' + leftover[0]);
if (/url\(\.\.\//.test(css)) throw new Error('Font nie został wbudowany');
html = html.replace('<!--APP-->', () => `<script>\n${recipes}\n(() => {\n'use strict';\n${js}\n})();\n</script>`);

const out = path.join(root, '../Kremowka-Maturzysty.html');
fs.writeFileSync(out, html);
console.log(`✔ Kremowka-Maturzysty.html (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
