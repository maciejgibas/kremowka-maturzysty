// Generuje public/recipes/*.pdf z danych w recipes-data.mjs.
// Uruchom: npm run pdf   (w katalogu tools/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { classic, maturzysta } from './recipes-data.mjs';
import { kremowkaSVG } from '../public/js/art.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(__dirname, '../public/fonts');
const OUT = path.join(__dirname, '../public/recipes');

const COL = {
  bg: '#fff8ec',
  burgundy: '#8a1538',
  burgundyDark: '#5e0d26',
  gold: '#d9a521',
  goldLight: '#f6d77a',
  ink: '#2b1a12',
  muted: '#6b5546',
  card: '#ffffff',
  line: '#efdcb8',
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 46; // margines
const CONTENT_W = PAGE_W - 2 * M;
const BOTTOM = PAGE_H - 60;

function build(recipe) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    autoFirstPage: false,
    info: {
      Title: recipe.title,
      Author: 'Uniwersytet Papieski Jana Pawła II w Krakowie',
      Subject: 'Operacja: Kremówka Maturzysty – przepis',
      Keywords: 'kremówka, przepis, UPJPII, matura',
    },
  });
  doc.registerFont('head', path.join(FONTS, 'Fredoka-Bold.ttf'));
  doc.registerFont('headSemi', path.join(FONTS, 'Fredoka-SemiBold.ttf'));
  doc.registerFont('body', path.join(FONTS, 'Nunito-Regular.ttf'));
  doc.registerFont('bold', path.join(FONTS, 'Nunito-Bold.ttf'));
  doc.registerFont('xbold', path.join(FONTS, 'Nunito-ExtraBold.ttf'));
  doc.registerFont('italic', path.join(FONTS, 'Nunito-Italic.ttf'));

  let pageNo = 0;
  let y = 0;

  const newPage = () => {
    doc.addPage();
    pageNo += 1;
    doc.rect(0, 0, PAGE_W, PAGE_H).fill(COL.bg);
    // stopka
    doc.rect(0, PAGE_H - 34, PAGE_W, 34).fill(COL.burgundyDark);
    doc.font('bold').fontSize(8.5).fillColor(COL.goldLight)
      .text(recipe.footer, M, PAGE_H - 22, { width: CONTENT_W - 40, lineBreak: false });
    doc.font('bold').fontSize(8.5).fillColor(COL.goldLight)
      .text(String(pageNo), PAGE_W - M - 40, PAGE_H - 22, { width: 40, align: 'right', lineBreak: false });
    if (pageNo > 1) {
      doc.rect(0, 0, PAGE_W, 8).fill(COL.burgundy);
      doc.font('headSemi').fontSize(11).fillColor(COL.burgundy)
        .text(recipe.title, M, 26, { width: CONTENT_W, lineBreak: false });
      y = 56;
    }
  };

  const ensure = (h) => {
    if (y + h > BOTTOM) newPage();
  };

  const sectionTitle = (label) => {
    ensure(60);
    doc.roundedRect(M, y + 3, 6, 20, 3).fill(COL.gold);
    doc.font('head').fontSize(17).fillColor(COL.burgundy).text(label, M + 16, y, { width: CONTENT_W - 16 });
    y = doc.y + 8;
  };

  // ---------- STRONA 1: nagłówek ----------
  newPage();
  const headerH = 210;
  const grad = doc.linearGradient(0, 0, 0, headerH);
  grad.stop(0, '#a51d45').stop(1, COL.burgundyDark);
  doc.rect(0, 0, PAGE_W, headerH).fill(grad);
  doc.circle(PAGE_W - 120, 110, 120).fillOpacity(0.12).fill(COL.goldLight).fillOpacity(1);

  SVGtoPDF(doc, kremowkaSVG({ cap: recipe === maturzysta, sparkles: recipe === maturzysta }), PAGE_W - 236, 34, {
    width: 200,
    height: 167,
    assumePt: true,
  });

  doc.font('xbold').fontSize(9.5).fillColor(COL.goldLight)
    .text(recipe.kicker.toUpperCase(), M, 46, { width: 330, characterSpacing: 1 });
  doc.font('head').fontSize(38).fillColor('#ffffff')
    .text(recipe.title, M, doc.y + 6, { width: 320, lineGap: -6 });
  doc.font('bold').fontSize(10.5).fillColor('#ffe9b0')
    .text(recipe.form, M, doc.y + 8, { width: 300 });

  y = headerH + 22;
  doc.font('italic').fontSize(11.5).fillColor(COL.ink)
    .text(recipe.tagline, M, y, { width: CONTENT_W, lineGap: 2 });
  y = doc.y + 16;

  // ---------- kafelki z danymi ----------
  const gap = 10;
  const tileW = (CONTENT_W - gap * (recipe.meta.length - 1)) / recipe.meta.length;
  recipe.meta.forEach(([label, value], i) => {
    const x = M + i * (tileW + gap);
    doc.roundedRect(x, y, tileW, 50, 10).fill(COL.card);
    doc.roundedRect(x, y, tileW, 50, 10).lineWidth(1).stroke(COL.line);
    doc.font('xbold').fontSize(7.5).fillColor(COL.muted)
      .text(label.toUpperCase(), x + 10, y + 10, { width: tileW - 20, characterSpacing: 0.8 });
    doc.font('headSemi').fontSize(12).fillColor(COL.burgundy)
      .text(value, x + 10, y + 24, { width: tileW - 20 });
  });
  y += 50 + 24;

  // ---------- składniki ----------
  sectionTitle('Składniki');
  const amtW = 150;
  for (const group of recipe.ingredients) {
    ensure(Math.min(26 + group.items.length * 24, 300)); // nie rozrywaj krótkich grup między stronami
    doc.font('xbold').fontSize(10).fillColor(COL.gold)
      .text(group.group.toUpperCase(), M, y, { width: CONTENT_W, characterSpacing: 0.8 });
    y = doc.y + 4;
    for (const [amount, name] of group.items) {
      doc.font('body').fontSize(10.5);
      const h = Math.max(
        doc.heightOfString(name, { width: CONTENT_W - amtW - 16 }),
        doc.font('bold').heightOfString(amount, { width: amtW - 10 }),
      );
      ensure(h + 8);
      doc.font('bold').fontSize(10.5).fillColor(COL.burgundy).text(amount, M + 4, y, { width: amtW - 10 });
      doc.font('body').fontSize(10.5).fillColor(COL.ink).text(name, M + amtW, y, { width: CONTENT_W - amtW - 4 });
      y += h + 4;
      doc.moveTo(M, y).lineTo(M + CONTENT_W, y).lineWidth(0.6).dash(2, { space: 3 }).stroke(COL.line).undash();
      y += 4;
    }
    y += 8;
  }
  y += 6;

  // ---------- przygotowanie ----------
  sectionTitle('Przygotowanie krok po kroku');
  recipe.steps.forEach((step, i) => {
    doc.font('body').fontSize(10.5);
    const h = doc.heightOfString(step, { width: CONTENT_W - 40, lineGap: 1.5 });
    ensure(h + 12);
    doc.circle(M + 12, y + 8, 11).fill(COL.gold);
    doc.font('head').fontSize(11).fillColor('#ffffff')
      .text(String(i + 1), M + 1, y + 1.5, { width: 22, align: 'center' });
    doc.font('body').fontSize(10.5).fillColor(COL.ink)
      .text(step, M + 36, y, { width: CONTENT_W - 40, lineGap: 1.5 });
    y = doc.y + 9;
  });
  y += 8;

  // ---------- przechowywanie ----------
  sectionTitle('Przechowywanie');
  for (const item of recipe.storage) {
    doc.font('body').fontSize(10.5);
    const h = doc.heightOfString(item, { width: CONTENT_W - 20 });
    ensure(h + 6);
    doc.circle(M + 5, y + 7, 2.6).fill(COL.burgundy);
    doc.fillColor(COL.ink).text(item, M + 16, y, { width: CONTENT_W - 20 });
    y = doc.y + 5;
  }
  y += 12;

  // ---------- alergeny ----------
  {
    doc.font('body').fontSize(10.5);
    const h = doc.heightOfString(recipe.allergens, { width: CONTENT_W - 32 }) + 44;
    ensure(h + 10);
    doc.roundedRect(M, y, CONTENT_W, h, 12).fill('#fdecc8');
    doc.font('head').fontSize(13).fillColor(COL.burgundy).text('Alergeny', M + 16, y + 12);
    doc.font('body').fontSize(10.5).fillColor(COL.ink)
      .text(recipe.allergens, M + 16, y + 32, { width: CONTENT_W - 32 });
    y += h + 20;
  }

  // ---------- instrukcja obsługi maturzysty ----------
  if (recipe.extra) {
    const ex = recipe.extra;
    doc.font('body').fontSize(10.5);
    let inner = 0;
    for (const it of ex.items) inner += doc.heightOfString(it, { width: CONTENT_W - 64 }) + 8;
    doc.font('italic').fontSize(10.5);
    inner += doc.heightOfString(ex.note, { width: CONTENT_W - 40 }) + 14;
    const h = inner + 60;
    ensure(h + 10);
    doc.roundedRect(M, y, CONTENT_W, h, 14).fill(COL.burgundy);
    doc.font('head').fontSize(17).fillColor('#ffffff').text(ex.title, M + 20, y + 16, { width: CONTENT_W - 40 });
    let iy = y + 48;
    ex.items.forEach((it, i) => {
      doc.circle(M + 30, iy + 7, 9).fill(COL.goldLight);
      doc.font('head').fontSize(10).fillColor(COL.burgundyDark).text(String(i + 1), M + 21, iy + 1, { width: 18, align: 'center' });
      doc.font('body').fontSize(10.5).fillColor('#ffffff').text(it, M + 48, iy, { width: CONTENT_W - 64 });
      iy = doc.y + 8;
    });
    doc.font('italic').fontSize(10.5).fillColor(COL.goldLight)
      .text(ex.note, M + 20, iy + 6, { width: CONTENT_W - 40 });
    y += h + 16;
  }

  // ---------- podpis ----------
  ensure(40);
  doc.font('bold').fontSize(9.5).fillColor(COL.muted)
    .text('Smacznego! Przepis przygotowany specjalnie na targi edukacyjne. Kremówkę najlepiej jeść w dobrym towarzystwie – na przykład przyszłych koleżanek i kolegów ze studiów.', M, y, { width: CONTENT_W });

  return doc;
}

fs.mkdirSync(OUT, { recursive: true });
for (const recipe of [classic, maturzysta]) {
  const doc = build(recipe);
  const target = path.join(OUT, recipe.file);
  const stream = fs.createWriteStream(target);
  doc.pipe(stream);
  doc.end();
  stream.on('finish', () => console.log('✔', path.relative(process.cwd(), target), `(${(fs.statSync(target).size / 1024).toFixed(0)} KB)`));
}
