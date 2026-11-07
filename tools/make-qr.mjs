// Generuje kod QR prowadzący do gry. Uruchom: npm run qr -- https://twoj-adres.pl
// Wynik: qr/kremowka-qr.svg (do druku, skaluje się bez utraty jakości) i qr/kremowka-qr.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const url = process.argv[2];
if (!url || !/^https:\/\//.test(url)) {
  console.error('Podaj adres HTTPS gry, np.: npm run qr -- https://kremowka.netlify.app');
  process.exit(1);
}
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../qr');
fs.mkdirSync(out, { recursive: true });
const opts = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#5e0d26', light: '#ffffff' } };
fs.writeFileSync(path.join(out, 'kremowka-qr.svg'), await QRCode.toString(url, { ...opts, type: 'svg' }));
await QRCode.toFile(path.join(out, 'kremowka-qr.png'), url, { ...opts, width: 1200 });
console.log('✔ qr/kremowka-qr.svg i qr/kremowka-qr.png →', url);
