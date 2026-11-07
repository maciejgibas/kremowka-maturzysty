// Treść obu przepisów. Edytuj tutaj, a potem uruchom: npm run pdf

export const classic = {
  file: 'kremowka-klasyczna.pdf',
  title: 'Kremówka Klasyczna',
  kicker: 'Przepis ze stoiska UPJPII',
  tagline:
    'Dwa chrupiące blaty, gruba warstwa waniliowego kremu i chmura cukru pudru. Bez fajerwerków, bez kombinowania – klasyka, która nie potrzebuje matury, żeby smakować jak dyplom z wyróżnieniem.',
  meta: [
    ['Porcje', '12 kawałków'],
    ['Przygotowanie', 'ok. 60 min'],
    ['Chłodzenie', 'min. 4 h'],
    ['Pieczenie', '200°C, 12–15 min'],
  ],
  form: 'Forma / blacha ok. 24 × 36 cm',
  ingredients: [
    {
      group: 'Ciasto',
      items: [
        ['2 opakowania (2 × 275 g)', 'ciasta francuskiego z lodówki (prostokąty)'],
        ['ok. 1 łyżka', 'mąki do podsypania'],
      ],
    },
    {
      group: 'Krem budyniowy',
      items: [
        ['1 l', 'mleka 3,2%'],
        ['6', 'żółtek (z jaj rozmiaru L)'],
        ['200 g', 'cukru'],
        ['1 laska lub 2 łyżeczki', 'wanilii / pasty waniliowej'],
        ['60 g', 'mąki pszennej (typ 450–500)'],
        ['60 g', 'skrobi ziemniaczanej'],
        ['200 g', 'masła 82%, miękkiego'],
        ['szczypta', 'soli'],
      ],
    },
    {
      group: 'Na wierzch',
      items: [['3–4 łyżki', 'cukru pudru']],
    },
  ],
  steps: [
    'Rozgrzej piekarnik do 200°C (góra–dół). Wyjmij ciasto francuskie z lodówki ok. 10 minut wcześniej.',
    'Każdy płat ciasta przełóż na osobną blachę wyłożoną papierem, przytnij do rozmiaru formy i gęsto ponakłuwaj widelcem.',
    'Piecz każdy blat 12–15 minut, aż będzie złocisty. Po ok. 6 minutach możesz przycisnąć ciasto drugą blachą – blat wyjdzie płaski i równy. Wystudź na kratce.',
    'Krem: 750 ml mleka zagotuj z cukrem, wanilią i solą.',
    'Pozostałe 250 ml zimnego mleka zmiksuj lub wymieszaj trzepaczką z żółtkami, mąką i skrobią – bez grudek.',
    'Wlej mieszankę do gotującego się mleka, cały czas energicznie mieszając. Gotuj na małym ogniu 2–3 minuty, aż krem mocno zgęstnieje i zacznie „pyrkać”.',
    'Przełóż krem do miski, przykryj folią przyłożoną bezpośrednio do powierzchni (nie zrobi się kożuch) i wystudź do temperatury pokojowej. Masło też musi mieć temperaturę pokojową – inaczej krem się zważy.',
    'Masło utrzyj mikserem na jasny puch (ok. 3 minuty). Dodawaj wystudzony krem po łyżce, cały czas miksując, aż masa będzie gładka i puszysta.',
    'Złóż ciasto: dolny blat włóż do formy wyłożonej papierem, wyłóż na niego cały krem i wyrównaj. Przykryj drugim, ładniejszym blatem i lekko dociśnij.',
    'Wstaw do lodówki na minimum 4 godziny, najlepiej na całą noc.',
    'Przed podaniem obficie oprósz cukrem pudrem. Kroić ostrym, ząbkowanym nożem maczanym w gorącej wodzie – najpierw sam górny blat, potem do dna.',
  ],
  storage: [
    'Przechowuj w lodówce, w zamkniętym pojemniku, do 2 dni.',
    'Krem zawiera żółtka i masło – nie zostawiaj kremówki dłużej niż 2 godziny w temperaturze pokojowej.',
    'Blaty upieczone dzień wcześniej trzymaj w suchym miejscu, w papierowej torbie – zostaną chrupiące.',
    'Nie zamrażaj – ciasto francuskie po rozmrożeniu traci chrupkość.',
  ],
  allergens:
    'Gluten (pszenica), mleko i produkty mleczne (laktoza), jaja. Gotowe ciasto francuskie może zawierać soję lub śladowe ilości innych alergenów – sprawdź etykietę producenta.',
  extra: null,
  footer: 'Uniwersytet Papieski Jana Pawła II w Krakowie · Operacja: Kremówka Maturzysty',
};

export const maturzysta = {
  file: 'kremowka-maturzysty.pdf',
  title: 'Kremówka Maturzysty',
  kicker: 'Tajny przepis · odblokowany na stoisku UPJPII',
  tagline:
    'Kremówka w wersji rozszerzonej: waniliowy krem z nutą cytryny „na jasność umysłu”, puszysta warstwa śmietankowa i prażone migdały, które chrupią głośniej niż stres przed pierwszym arkuszem. Poziom trudności: łatwiejszy niż matura z matematyki.',
  meta: [
    ['Porcje', '12 kawałków'],
    ['Przygotowanie', 'ok. 75 min'],
    ['Chłodzenie', 'min. 6 h'],
    ['Pieczenie', '200°C, 12–15 min'],
  ],
  form: 'Forma / blacha ok. 24 × 36 cm',
  ingredients: [
    {
      group: 'Ciasto',
      items: [
        ['2 opakowania (2 × 275 g)', 'ciasta francuskiego z lodówki (prostokąty)'],
        ['1 łyżka', 'cukru pudru do skarmelizowania wierzchu'],
      ],
    },
    {
      group: 'Krem „Świadectwo dojrzałości”',
      items: [
        ['1 l', 'mleka 3,2%'],
        ['6', 'żółtek (z jaj rozmiaru L)'],
        ['180 g', 'cukru'],
        ['2 łyżeczki', 'pasty waniliowej (lub 1 laska wanilii)'],
        ['50 g', 'mąki pszennej (typ 450–500)'],
        ['50 g', 'skrobi ziemniaczanej'],
        ['150 g', 'masła 82%, miękkiego'],
        ['1', 'cytryna (otarta skórka, sparzona i umyta)'],
        ['szczypta', 'soli'],
      ],
    },
    {
      group: 'Warstwa „Zdane na 100%”',
      items: [
        ['300 ml', 'śmietanki 30–36%, bardzo zimnej'],
        ['125 g', 'serka mascarpone, zimnego'],
        ['2 łyżki', 'cukru pudru'],
      ],
    },
    {
      group: 'Posypka „Breloczek szczęścia”',
      items: [
        ['40 g', 'płatków migdałowych'],
        ['3 łyżki', 'cukru pudru'],
      ],
    },
  ],
  steps: [
    'Rozgrzej piekarnik do 200°C (góra–dół). Płaty ciasta francuskiego ułóż na dwóch blachach wyłożonych papierem, przytnij do rozmiaru formy i gęsto ponakłuwaj widelcem.',
    'Piecz każdy blat 12–15 minut na złoty kolor. Górny blat na 2 minuty przed końcem oprósz przez sitko 1 łyżką cukru pudru – lekko się skarmelizuje i będzie błyszczał jak świadectwo z paskiem. Wystudź na kratce.',
    'Na suchej patelni upraż płatki migdałowe na złoto (ok. 3–4 minuty, mieszaj, bo przypalają się szybciej niż kończy się czas na egzaminie). Wystudź.',
    'Krem: 750 ml mleka zagotuj z cukrem, pastą waniliową, solą i otartą skórką z cytryny.',
    'Pozostałe 250 ml zimnego mleka wymieszaj trzepaczką z żółtkami, mąką i skrobią na gładko.',
    'Wlej mieszankę do gotującego się mleka, energicznie mieszając. Gotuj 2–3 minuty na małym ogniu, aż krem mocno zgęstnieje.',
    'Przełóż do miski, przykryj folią przyłożoną do powierzchni i wystudź do temperatury pokojowej.',
    'Miękkie masło utrzyj na jasny puch, a następnie dodawaj krem po łyżce, cały czas miksując, aż masa będzie gładka.',
    'Warstwa śmietankowa: zimną śmietankę ubij z mascarpone i cukrem pudrem na sztywno (1–2 minuty – nie przeubijaj, bo zrobi się masło).',
    'Złóż kremówkę: dolny blat włóż do formy wyłożonej papierem, wyłóż krem waniliowy, na nim warstwę śmietankową, przykryj skarmelizowanym blatem i delikatnie dociśnij.',
    'Schłodź minimum 6 godzin, najlepiej przez noc.',
    'Przed podaniem oprósz cukrem pudrem i posyp prażonymi migdałami. Kroić ostrym, ząbkowanym nożem maczanym w gorącej wodzie.',
  ],
  storage: [
    'Przechowuj w lodówce, w szczelnym pojemniku, do 2 dni.',
    'Migdały dodawaj tuż przed podaniem – dłużej zostaną chrupiące.',
    'Nie zostawiaj kremówki dłużej niż 2 godziny poza lodówką (krem z żółtkami i warstwa śmietankowa).',
    'Nie nadaje się do mrożenia.',
  ],
  allergens:
    'Gluten (pszenica), mleko i produkty mleczne (laktoza), jaja, orzechy (migdały). Gotowe ciasto francuskie może zawierać soję lub śladowe ilości innych alergenów – sprawdź etykietę. Wersja bez orzechów: pomiń migdały.',
  extra: {
    title: 'Instrukcja obsługi maturzysty',
    items: [
      'Przed maturą dobrze się wyśpij. Mózg po 8 godzinach snu działa lepiej niż po 8 energetykach.',
      'Przygotuj dwa długopisy. Jeden pisze, drugi jest ubezpieczeniem. Legendarny ołówek ze stoiska UPJPII – opcjonalnie.',
      'Nie próbuj uczyć się całej matematyki w pięć minut. To nie działa. Sprawdzaliśmy.',
      'Kremówkę jedz po egzaminie, żeby nie ubrudzić arkusza. Egzaminator nie doceni kremu na zadaniu 7.',
      'Weź dowód osobisty, wodę i spokój. Spokój jest najtrudniejszy do zapakowania.',
      'Po egzaminie zjedz kawałek kremówki i daj sobie chwilę. Zasłużyłeś. Zasłużyłaś. Zasłużyliście.',
    ],
    note: 'Nie gwarantujemy setki z matematyki. Ale dobry humor – zdecydowanie tak. Do zobaczenia na UPJPII!',
  },
  footer: 'Uniwersytet Papieski Jana Pawła II w Krakowie · Operacja: Kremówka Maturzysty',
};
