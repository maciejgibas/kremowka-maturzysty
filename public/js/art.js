// Autorskie ilustracje SVG. Moduł jest współdzielony przez aplikację (przeglądarka)
// oraz generator PDF (Node, tools/generate-pdfs.mjs), dlatego nie używa DOM.

const C = {
  pastryDark: '#d98f33',
  pastry: '#eaa94c',
  pastryLight: '#f6c977',
  flake: '#c27a26',
  cream: '#fff3c4',
  creamEdge: '#f0d886',
  creamLight: '#fffbe8',
  sugar: '#ffffff',
  ink: '#3a2416',
  blush: '#f4a6a0',
  gold: '#e8b931',
  cap: '#2b1d33',
  capTop: '#3d2b4c',
};

/**
 * Kremówka z buźką.
 * @param {{cap?: boolean, sparkles?: boolean, face?: 'happy'|'wow'|'none', id?: string}} opts
 */
export function kremowkaSVG({ cap = false, sparkles = false, face = 'happy', id = 'k' } = {}) {
  const sugarDots = [
    [60, 62, 2.4], [78, 56, 1.8], [96, 66, 2.8], [118, 58, 2], [140, 64, 2.6], [162, 56, 1.9],
    [180, 66, 2.3], [70, 74, 1.7], [110, 76, 2.1], [150, 75, 1.8], [190, 76, 2.2], [130, 70, 1.5],
    [52, 78, 1.6], [88, 80, 1.4], [170, 81, 1.5], [204, 82, 1.4],
  ]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.sugar}"/>`)
    .join('');

  const faces = {
    happy: `
      <ellipse cx="96" cy="121" rx="5.5" ry="7" fill="${C.ink}"/>
      <ellipse cx="144" cy="121" rx="5.5" ry="7" fill="${C.ink}"/>
      <circle cx="98" cy="118" r="1.8" fill="#fff"/>
      <circle cx="146" cy="118" r="1.8" fill="#fff"/>
      <ellipse cx="78" cy="133" rx="9" ry="4.5" fill="${C.blush}" opacity=".75"/>
      <ellipse cx="162" cy="133" rx="9" ry="4.5" fill="${C.blush}" opacity=".75"/>
      <path d="M106 131 Q120 143 134 131" stroke="${C.ink}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`,
    wow: `
      <ellipse cx="96" cy="119" rx="6" ry="8" fill="${C.ink}"/>
      <ellipse cx="144" cy="119" rx="6" ry="8" fill="${C.ink}"/>
      <circle cx="98" cy="116" r="2" fill="#fff"/>
      <circle cx="146" cy="116" r="2" fill="#fff"/>
      <ellipse cx="78" cy="133" rx="9" ry="4.5" fill="${C.blush}" opacity=".75"/>
      <ellipse cx="162" cy="133" rx="9" ry="4.5" fill="${C.blush}" opacity=".75"/>
      <ellipse cx="120" cy="136" rx="6" ry="7" fill="${C.ink}"/>`,
    none: '',
  };

  const capSVG = cap
    ? `<g transform="rotate(-9 120 36)">
        <path d="M90 46 L90 30 Q120 21 150 30 L150 46 Q120 55 90 46 Z" fill="${C.cap}"/>
        <polygon points="120,4 180,24 120,42 60,24" fill="${C.capTop}" stroke="${C.cap}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="120" cy="23" r="3.5" fill="${C.gold}"/>
        <path d="M120 23 L170 31 L171 54" stroke="${C.gold}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="165" y="52" width="12" height="16" rx="4" fill="${C.gold}"/>
      </g>`
    : '';

  const sparklesSVG = sparkles
    ? `<g fill="${C.gold}">
        <path d="M18 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"/>
        <path d="M216 22 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z"/>
        <path d="M226 118 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5 -6 l-6 -2.5 l6 -2.5 Z"/>
      </g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" role="img" aria-label="Kremówka" class="art art-kremowka">
  <ellipse cx="120" cy="188" rx="100" ry="9" fill="#000" opacity=".12"/>
  <rect x="22" y="146" width="196" height="36" rx="9" fill="${C.pastryDark}"/>
  <rect x="22" y="146" width="196" height="10" rx="5" fill="${C.pastry}"/>
  <path d="M34 164 q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="${C.flake}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M44 174 q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="${C.flake}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M25 100 Q19 124 26 150 L214 150 Q221 124 215 100 Z" fill="${C.cream}" stroke="${C.creamEdge}" stroke-width="2.5" stroke-linejoin="round"/>
  <ellipse cx="58" cy="112" rx="18" ry="4" fill="${C.creamLight}"/>
  <ellipse cx="188" cy="140" rx="14" ry="3.5" fill="${C.creamLight}"/>
  ${faces[face] || ''}
  <polygon points="22,84 46,52 194,52 218,84" fill="${C.pastryLight}" stroke="${C.pastryLight}" stroke-width="8" stroke-linejoin="round"/>
  <rect x="16" y="80" width="208" height="24" rx="9" fill="${C.pastry}"/>
  <path d="M28 93 q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="${C.flake}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>
  ${sugarDots}
  <circle cx="30" cy="84" r="2" fill="#fff"/><circle cx="64" cy="86" r="1.6" fill="#fff"/><circle cx="120" cy="85" r="2" fill="#fff"/><circle cx="176" cy="86" r="1.6" fill="#fff"/><circle cx="210" cy="84" r="2" fill="#fff"/>
  ${capSVG}
  ${sparklesSVG}
</svg>`;
}

export function pencilSVG({ broken = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64" role="img" aria-label="Legendarny ołówek" class="art art-pencil">
  <polygon points="44,16 44,48 8,32" fill="#f1d3a3"/>
  <polygon points="18,27 18,37 8,32" fill="#3b3b3b"/>
  <rect x="44" y="16" width="148" height="32" fill="#f5c330"/>
  <rect x="44" y="16" width="148" height="10" fill="#fbd95e"/>
  <rect x="44" y="38" width="148" height="10" fill="#e2a91f"/>
  <rect x="192" y="14" width="18" height="36" rx="2" fill="#c8c8cf"/>
  <rect x="196" y="14" width="3" height="36" fill="#a7a7b0"/>
  <rect x="203" y="14" width="3" height="36" fill="#a7a7b0"/>
  <rect x="210" y="14" width="24" height="36" rx="8" fill="#f08aa0"/>
  ${broken ? '<path d="M110 14 L118 26 L108 34 L120 50" stroke="#5a2a10" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>' : ''}
</svg>`;
}

export function micSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" role="img" aria-label="Mikrofon" class="art art-mic">
  <rect x="34" y="6" width="52" height="90" rx="26" fill="#8a1538"/>
  <rect x="34" y="6" width="52" height="90" rx="26" fill="url(#micShine)"/>
  <g stroke="#f6d77a" stroke-width="3" stroke-linecap="round" opacity=".85">
    <line x1="46" y1="28" x2="74" y2="28"/><line x1="44" y1="40" x2="76" y2="40"/>
    <line x1="44" y1="52" x2="76" y2="52"/><line x1="46" y1="64" x2="74" y2="64"/>
  </g>
  <path d="M20 70 Q20 118 60 118 Q100 118 100 70" stroke="#d9a521" stroke-width="8" fill="none" stroke-linecap="round"/>
  <rect x="55" y="118" width="10" height="22" fill="#d9a521"/>
  <rect x="30" y="138" width="60" height="12" rx="6" fill="#d9a521"/>
  <defs><linearGradient id="micShine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
</svg>`;
}

export function haloSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Kremówkowa energia" class="art art-halo">
  <defs><radialGradient id="glow"><stop offset="0" stop-color="#fff6c9"/><stop offset=".6" stop-color="#f6d77a" stop-opacity=".55"/><stop offset="1" stop-color="#f6d77a" stop-opacity="0"/></radialGradient></defs>
  <circle cx="100" cy="100" r="96" fill="url(#glow)"/>
  <ellipse cx="100" cy="100" rx="58" ry="58" fill="none" stroke="#e8b931" stroke-width="10"/>
  <g fill="#e8b931">
    <path d="M100 10 l6 16 l16 6 l-16 6 l-6 16 l-6 -16 l-16 -6 l16 -6 Z"/>
    <path d="M168 120 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"/>
    <path d="M30 128 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"/>
  </g>
</svg>`;
}

/** Ikona aplikacji (PWA) – bez tekstu, żeby renderowała się identycznie wszędzie. */
export function appIconSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a51d45"/><stop offset="1" stop-color="#5e0d26"/></linearGradient></defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="270" r="190" fill="#f6d77a" opacity=".18"/>
  <g transform="translate(94 110) scale(1.35)">${kremowkaSVG({ cap: true, face: 'happy' }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
</svg>`;
}
