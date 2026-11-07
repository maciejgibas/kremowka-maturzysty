// Service worker: zapisuje całą grę w pamięci telefonu, więc po pierwszym
// wczytaniu działa także bez internetu (przydatne przy słabym Wi-Fi na targach).
// Po każdej zmianie plików podbij VERSION, żeby telefony pobrały nową wersję.
const VERSION = 'kremowka-v1';
const ASSETS = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/art.js',
  'js/fx.js',
  'js/voice.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'fonts/Fredoka-SemiBold.ttf',
  'fonts/Fredoka-Bold.ttf',
  'fonts/Nunito-Regular.ttf',
  'fonts/Nunito-Bold.ttf',
  'fonts/Nunito-ExtraBold.ttf',
  'fonts/Nunito-Italic.ttf',
  'recipes/kremowka-klasyczna.pdf',
  'recipes/kremowka-maturzysty.pdf',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Strona główna: najpierw sieć (świeża wersja), w razie braku – kopia z pamięci.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html')),
    );
    return;
  }

  // Pozostałe zasoby: najpierw pamięć (szybko), potem sieć.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
