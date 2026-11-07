# OPERACJA: KREMÓWKA MATURZYSTY

> „Matura to nie przelewki. Kremówka już trochę tak.”

Mobilna minigra webowa na stoisko **UPJPII** na targach edukacyjnych. Uczestnik skanuje kod QR, przechodzi misje (ołówek → kropka → awaria → figurka → kropka → śpiew) i pobiera prawdziwy przepis w PDF.

- Działa w przeglądarce (Safari na iOS, Chrome na Androidzie), bez instalacji, bez logowania, **bez zbierania danych**.
- Czysty HTML/CSS/JS (moduły ES) – **brak kroku budowania**. Folder `public/` to gotowa strona.
- Po pierwszym wczytaniu działa **offline** (service worker) – przydatne przy słabym Wi-Fi na targach.
- Można dodać do ekranu głównego (PWA).

## Struktura

```
public/                  ← TO wdrażasz na hosting
  index.html
  css/styles.css
  js/app.js              maszyna stanów + ekrany gry
  js/voice.js            detektor aktywności głosowej (Web Audio, nic nie nagrywa)
  js/fx.js               dźwięki (syntezowane), wibracje, konfetti
  js/art.js              autorskie ilustracje SVG (kremówka, ołówek, mikrofon…)
  recipes/*.pdf          gotowe przepisy (Klasyczna, Maturzysty)
  fonts/                 Fredoka + Nunito (licencja SIL OFL), lokalnie
  icons/                 ikony PWA
  sw.js, manifest.webmanifest, _headers
tools/                   generatory (potrzebne tylko przy zmianach)
  recipes-data.mjs       TREŚĆ przepisów – edytuj tutaj
  generate-pdfs.mjs      → public/recipes/*.pdf
  make-icons.mjs         → public/icons/*
  make-qr.mjs            → qr/kremowka-qr.svg + .png
```

## Wersja jednoplikowa (bez serwera)

**[Kremowka-Maturzysty.html](Kremowka-Maturzysty.html)** – cała gra w jednym pliku (JS, CSS, fonty, ikony i oba PDF-y wbudowane). Otwórz dwuklikiem w Chrome, Safari, Edge lub Firefoksie – nic nie trzeba instalować ani uruchamiać.

Po zmianach w `public/` przebuduj go: `cd tools && npm install && npm run single`.

Ograniczenia: plik otwarty z dysku nie instaluje się jako PWA (to i tak niepotrzebne – działa offline z definicji). Na telefony przez kod QR grę i tak trzeba wystawić pod adresem HTTPS – ale może to być ten jeden plik (np. przeciągnięty na Netlify Drop jako `index.html`).

## Uruchomienie lokalne (wersja z folderu public/)

```bash
cd public
python3 -m http.server 8080
# otwórz http://localhost:8080
```

Na komputerze (localhost) działa wszystko łącznie z mikrofonem. W Chrome DevTools włącz widok urządzenia mobilnego (Ctrl/Cmd+Shift+M).

## Testowanie na telefonie

Mikrofon w przeglądarce **wymaga HTTPS**. Zwykły adres `http://192.168.x.x:8080` otworzy grę, ale mikrofon nie zadziała (gra pokaże wtedy opcję „Zaśpiewałem przed obsługą stoiska”). Najprościej:

- **Tunel HTTPS** (bez konta): w drugim terminalu `npx cloudflared tunnel --url http://localhost:8080` – dostaniesz adres `https://….trycloudflare.com`, otwórz go na telefonie.
- albo od razu wdróż (poniżej) i testuj na docelowym adresie.

## Wdrożenie (hosting statyczny, HTTPS za darmo)

Wdrażasz **zawartość folderu `public/`**. Każda z opcji daje HTTPS automatycznie.

| Hosting | Jak |
|---|---|
| **Netlify Drop** (najszybciej) | Wejdź na app.netlify.com/drop i przeciągnij folder `public`. Gotowe w 30 s. |
| **Cloudflare Pages** | Pages → Upload assets → wskaż folder `public`. |
| **GitHub Pages** | Wrzuć zawartość `public/` do repozytorium, Settings → Pages → branch `main`, folder `/` (lub `/docs`, jeśli tam skopiujesz pliki). |
| Serwer uczelni | Skopiuj zawartość `public/` do katalogu WWW działającego pod HTTPS. Plik `_headers` jest dla Netlify/Cloudflare – na Apache/nginx ustaw analogiczne nagłówki (opcjonalne). |

Gra działa też w podkatalogu (np. `https://example.pl/kremowka/`) – wszystkie ścieżki są względne.

## Kod QR na stoisko

Po wdrożeniu:

```bash
cd tools
npm install
npm run qr -- https://twoj-adres-gry.pl
```

Pliki pojawią się w `qr/`. Do druku użyj **SVG** (dowolny rozmiar bez utraty jakości). Zalecany rozmiar wydruku: min. 4 × 4 cm, a na plakacie z dystansu 1–2 m: 12 × 12 cm lub więcej. Przetestuj skan kilkoma telefonami przed targami.

## Przed targami – lista kontrolna

1. Otwórz grę na telefonach ekipy raz **z internetem** – zapisze się offline.
2. Przejdź całą grę na iPhonie (Safari) i Androidzie (Chrome), w tym próbę mikrofonu.
3. Pobierz oba PDF-y i sprawdź, czy się otwierają.
4. Na stoisku przygotuj: ołówki/długopisy, figurkę 3D, breloczki (jeśli są).
5. Wydrukuj kod QR (i najlepiej krótki adres tekstowy pod nim).

## Jak działa gra (maszyna stanów)

```
WELCOME → MATURZYSTA_CHECK ─ NIE → NORMAL_RECIPE (PDF: Kremówka Klasyczna)
                           └ TAK → GET_PENCIL → DOT_CHALLENGE_FIRST → DOT_CONFIRM_FIRST
   (NIE → wraca do kropki; TAK → zawsze awaria) → PENCIL_ERROR → FIGURINE_CHALLENGE
   → PENCIL_RECALIBRATION → PENCIL_RESTORED → DOT_CHALLENGE_SECOND → DOT_CONFIRM_SECOND
   → DOT_SUCCESS → VOICE_CHALLENGE → VOICE_SUCCESS → FINAL_REWARD (PDF: Kremówka Maturzysty)
```

- Każdy stan przyjmuje tylko swoje zdarzenia; po każdym przejściu jest krótka blokada, żeby podwójne tapnięcie nie przeskoczyło etapu.
- Stan zapisuje się w `sessionStorage` – przeładowanie strony nie kasuje postępu. Przy próbie zamknięcia/przeładowania w trakcie gry przeglądarka pyta o potwierdzenie (tam, gdzie to obsługuje; iOS tego nie robi, ale stan i tak się odtworzy).
- **Kropka:** reaguje na każde dotknięcie ekranu – telefon nie odróżni ołówka od palca i gra tego nie udaje. Część przedmiotów nie wywołuje dotyku, dlatego po 3 s pojawia się „Nie działa? Potwierdź próbę”.
- **Figurka:** potwierdzana przyciskiem (słowo honoru) – telefon jej nie wykrywa i gra mówi to wprost.
- **Mikrofon:** przez ~0,7 s mierzy hałas tła, potem liczy łącznie 4 s dźwięku głośniejszego od tła. Mierzy tylko głośność – nie rozpoznaje melodii ani słów i nic nie nagrywa/wysyła. Przy odmowie dostępu, braku mikrofonu, braku HTTPS albo gdy po 20 s nie ma wyniku, pojawia się „ZAŚPIEWAŁEM PRZED OBSŁUGĄ STOISKA”. Ten przycisk jest też dostępny od razu pod linkiem „Nie mogę użyć mikrofonu”.
- Dźwięki można wyciszyć (ikona głośnika); wibracje działają na Androidzie (iOS nie udostępnia ich stronom).

## Zmiany treści

- **Teksty w grze:** `public/js/app.js` (obiekt `VIEWS`).
- **Przepisy:** `tools/recipes-data.mjs`, potem `cd tools && npm install && npm run pdf`.
- **Kolory:** zmienne na górze `public/css/styles.css` (`--burgundy`, `--gold`…). Paleta (bordo + złoto) jest dobrana „w duchu” uczelni – jeśli macie oficjalny brandbook, podmieńcie wartości.
- **Logo uczelni:** gra celowo nie zawiera oficjalnego logo. Jeśli chcecie je dodać, wstaw plik do `public/icons/` i umieść `<img>` w ekranie `WELCOME` w `app.js` (dopisz plik do listy w `sw.js`).
- **Po każdej zmianie plików** podbij `VERSION` w `public/sw.js` (np. `kremowka-v2`), żeby telefony z wersją offline pobrały nowe pliki.

## Prywatność

Gra nie używa ciasteczek, analityki ani zewnętrznych serwerów. Wszystkie zasoby (fonty, grafiki, PDF-y) są lokalne. Dźwięk z mikrofonu jest analizowany wyłącznie chwilowo, w pamięci telefonu. W `localStorage` zapisuje się tylko ustawienie wyciszenia, w `sessionStorage` – bieżący etap gry.
