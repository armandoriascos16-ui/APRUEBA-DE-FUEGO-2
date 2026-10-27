import { GoogleGenAI } from '@google/genai';

interface GenerationOptions {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  imageSize?: '1K' | '2K';
  bibleVerse?: string;
  themeCategory?: string;
}

interface EditOptions {
  prompt: string;
  base64Image: string;
  aspectRatio?: string;
  mimeType?: string;
}

// Map dimensions according to aspect ratio
function getDimensions(aspectRatio: string = '1:1', size: string = '1K') {
  const is2K = size === '2K';
  const scale = is2K ? 1.5 : 1.0;

  switch (aspectRatio) {
    case '16:9':
      return { width: Math.round(1280 * scale), height: Math.round(720 * scale) };
    case '9:16':
      return { width: Math.round(720 * scale), height: Math.round(1280 * scale) };
    case '4:3':
      return { width: Math.round(1024 * scale), height: Math.round(768 * scale) };
    case '3:4':
      return { width: Math.round(768 * scale), height: Math.round(1024 * scale) };
    case '1:1':
    default:
      return { width: Math.round(1024 * scale), height: Math.round(1024 * scale) };
  }
}

// Fallback thematic scripture verses
const SCRIPTURE_PRESETS: Record<string, { verse: string; reference: string }> = {
  sinai: {
    verse: '«Y el monte Sinaí humeaba todo, porque Jehová había descendido sobre él en fuego.»',
    reference: 'Éxodo 19:18',
  },
  calvary: {
    verse: '«Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.»',
    reference: 'Juan 3:16',
  },
  galilee: {
    verse: '«Y levantándose, reprendió al viento, y dijo al mar: Calla, enmudece. Y cesó el viento, y se hizo grande bonanza.»',
    reference: 'Marcos 4:39',
  },
  eden: {
    verse: '«Y plantó Jehová Dios un huerto en Edén, al oriente; y puso allí al hombre que había formado.»',
    reference: 'Génesis 2:8',
  },
  shepherd: {
    verse: '«Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.»',
    reference: 'Salmos 23:1-2',
  },
  dove: {
    verse: '«Y el Espíritu Santo descendió sobre él en forma corporal, como paloma, y vino una voz del cielo que decía: Tú eres mi Hijo amado; en ti tengo complacencia.»',
    reference: 'Lucas 3:22',
  },
  ark: {
    verse: '«Y de allí me declararé a ti, y hablaré contigo de sobre el propiciatorio, de entre los dos querubines que están sobre el arca del testimonio.»',
    reference: 'Éxodo 25:22',
  },
  general: {
    verse: '«Mas los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.»',
    reference: 'Isaías 40:31',
  },
};

/**
 * Procedural Christian Art Synthesis Engine
 * Generates rich, high-resolution vector and rasterized spiritual artwork
 */
export async function generateSynthesizedChristianArt(
  options: GenerationOptions,
  ai?: GoogleGenAI
): Promise<{ imageUrl: string; model: string; prompt: string; bibleVerse?: string; theme: string }> {
  const { prompt, aspectRatio = '1:1', imageSize = '1K', bibleVerse } = options;
  const dims = getDimensions(aspectRatio, imageSize);
  const w = dims.width;
  const h = dims.height;

  const lower = prompt.toLowerCase();

  // Detect theme
  let theme = 'general';
  if (lower.includes('sinaí') || lower.includes('sinai') || lower.includes('ley') || lower.includes('mandamiento')) {
    theme = 'sinai';
  } else if (lower.includes('cruz') || lower.includes('calvario') || lower.includes('golgota') || lower.includes('sacrificio')) {
    theme = 'calvary';
  } else if (lower.includes('galilea') || lower.includes('mar') || lower.includes('barca') || lower.includes('tempestad') || lower.includes('agua')) {
    theme = 'galilee';
  } else if (lower.includes('edén') || lower.includes('eden') || lower.includes('huerto') || lower.includes('árbol') || lower.includes('flores')) {
    theme = 'eden';
  } else if (lower.includes('pastor') || lower.includes('oveja') || lower.includes('corder') || lower.includes('salmo 23')) {
    theme = 'shepherd';
  } else if (lower.includes('paloma') || lower.includes('espíritu') || lower.includes('espiritu') || lower.includes('bautismo')) {
    theme = 'dove';
  } else if (lower.includes('arca') || lower.includes('pacto') || lower.includes('noe') || lower.includes('noé') || lower.includes('diluvio')) {
    theme = 'ark';
  }

  // Choose palette based on theme
  let skyGrad = {
    c1: '#020617',
    c2: '#1e1b4b',
    c3: '#7c2d12',
    c4: '#f59e0b',
  };
  let sunColor = '#fef08a';
  let sunAura = '#f59e0b';
  let groundColor = '#09090b';
  let midGroundColor = '#1e1b4b';

  if (theme === 'sinai') {
    skyGrad = { c1: '#09090b', c2: '#451a03', c3: '#9a3412', c4: '#fbbf24' };
    sunColor = '#fffbeb';
    sunAura = '#d97706';
    groundColor = '#1c1917';
    midGroundColor = '#292524';
  } else if (theme === 'calvary') {
    skyGrad = { c1: '#0f172a', c2: '#311042', c3: '#701a75', c4: '#fb923c' };
    sunColor = '#fef3c7';
    sunAura = '#f97316';
    groundColor = '#09090b';
    midGroundColor = '#18181b';
  } else if (theme === 'galilee') {
    skyGrad = { c1: '#020617', c2: '#082f49', c3: '#0284c7', c4: '#38bdf8' };
    sunColor = '#e0f2fe';
    sunAura = '#0284c7';
    groundColor = '#0369a1';
    midGroundColor = '#075985';
  } else if (theme === 'eden') {
    skyGrad = { c1: '#022c22', c2: '#064e3b', c3: '#047857', c4: '#34d399' };
    sunColor = '#f0fdf4';
    sunAura = '#10b981';
    groundColor = '#022c22';
    midGroundColor = '#064e3b';
  }

  const selectedVerse = bibleVerse || SCRIPTURE_PRESETS[theme]?.verse || SCRIPTURE_PRESETS.general.verse;
  const selectedRef = SCRIPTURE_PRESETS[theme]?.reference || SCRIPTURE_PRESETS.general.reference;

  // Generate random stars for sky
  const stars: string[] = [];
  for (let i = 0; i < 40; i++) {
    const sx = Math.floor(Math.random() * w);
    const sy = Math.floor(Math.random() * (h * 0.45));
    const sr = (Math.random() * 1.5 + 0.5).toFixed(1);
    const op = (Math.random() * 0.6 + 0.3).toFixed(2);
    stars.push(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#ffffff" opacity="${op}" />`);
  }

  // Sun and Rays
  const sunX = Math.round(w * 0.5);
  const sunY = Math.round(h * 0.42);
  const sunRadius = Math.round(Math.min(w, h) * 0.16);

  // Light beam paths
  const rays: string[] = [];
  const rayCount = 12;
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI / rayCount) * i - Math.PI / 2;
    const x1 = sunX + Math.cos(angle) * (sunRadius * 0.6);
    const y1 = sunY + Math.sin(angle) * (sunRadius * 0.6);
    const x2 = sunX + Math.cos(angle) * (w * 0.85);
    const y2 = sunY + Math.sin(angle) * (h * 0.85);
    rays.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#rayGrad)" stroke-width="${Math.round(w * 0.03)}" opacity="0.35" />`);
  }

  // Central Icon / Silhouette depending on theme
  let centralSilhouette = '';
  if (theme === 'calvary' || theme === 'general') {
    // Majestic Cross
    const cx = sunX;
    const cy = Math.round(h * 0.68);
    const crossH = Math.round(h * 0.35);
    const crossW = Math.round(crossH * 0.55);
    const stemW = Math.round(crossW * 0.2);

    centralSilhouette = `
      <!-- Holy Cross Silhouette -->
      <g filter="url(#glow)">
        <!-- Vertical Beam -->
        <rect x="${cx - stemW / 2}" y="${cy - crossH}" width="${stemW}" height="${crossH}" fill="#0f172a" rx="4" />
        <!-- Horizontal Beam -->
        <rect x="${cx - crossW / 2}" y="${cy - crossH * 0.72}" width="${crossW}" height="${stemW}" fill="#0f172a" rx="4" />
        <!-- Inner Divine Core Glow -->
        <line x1="${cx}" y1="${cy - crossH + 10}" x2="${cx}" y2="${cy - 10}" stroke="#fbbf24" stroke-width="2" opacity="0.6" />
        <line x1="${cx - crossW / 2 + 10}" y1="${cy - crossH * 0.72 + stemW / 2}" x2="${cx + crossW / 2 - 10}" y2="${cy - crossH * 0.72 + stemW / 2}" stroke="#fbbf24" stroke-width="2" opacity="0.6" />
      </g>
    `;
  } else if (theme === 'dove') {
    // Holy Spirit Dove
    const dx = sunX;
    const dy = sunY - 20;
    const dScale = Math.round(Math.min(w, h) * 0.0016);
    centralSilhouette = `
      <!-- Dove of Peace -->
      <g transform="translate(${dx}, ${dy}) scale(${dScale})" filter="url(#glow)">
        <path d="M 0 -40 C -25 -20 -60 -10 -90 10 C -60 15 -35 25 -10 35 C 0 45 20 60 40 70 C 35 45 30 25 35 5 C 60 15 85 25 110 30 C 85 10 50 -10 20 -25 C 15 -35 10 -40 0 -40 Z" fill="#ffffff" opacity="0.95" />
        <!-- Golden olive branch -->
        <path d="M -15 -35 Q -30 -45 -45 -40 Q -30 -30 -15 -35 Z" fill="#f59e0b" />
      </g>
    `;
  } else if (theme === 'galilee') {
    // Ancient Fisherman Boat on Water
    const bx = sunX;
    const by = Math.round(h * 0.65);
    centralSilhouette = `
      <!-- Galilee Boat -->
      <g filter="url(#glow)">
        <path d="M ${bx - 70} ${by} Q ${bx} ${by + 35} ${bx + 70} ${by} L ${bx + 55} ${by - 12} L ${bx - 55} ${by - 12} Z" fill="#0c4a6e" />
        <line x1="${bx}" y1="${by - 12}" x2="${bx}" y2="${by - 75}" stroke="#0369a1" stroke-width="4" />
        <path d="M ${bx} ${by - 70} L ${bx + 40} ${by - 30} L ${bx} ${by - 25} Z" fill="#f0f9ff" opacity="0.85" />
      </g>
    `;
  } else {
    // Open Bible with Radiant Rays
    const ox = sunX;
    const oy = Math.round(h * 0.68);
    centralSilhouette = `
      <!-- Open Bible -->
      <g filter="url(#glow)">
        <path d="M ${ox} ${oy - 20} C ${ox - 60} ${oy - 45} ${ox - 110} ${oy - 35} ${ox - 130} ${oy - 20} L ${ox - 130} ${oy + 40} C ${ox - 110} ${oy + 25} ${ox - 60} ${oy + 15} ${ox} ${oy + 40} Z" fill="#fef08a" opacity="0.9" stroke="#78350f" stroke-width="3" />
        <path d="M ${ox} ${oy - 20} C ${ox + 60} ${oy - 45} ${ox + 110} ${oy - 35} ${ox + 130} ${oy - 20} L ${ox + 130} ${oy + 40} C ${ox + 110} ${oy + 25} ${ox + 60} ${oy + 15} ${ox} ${oy + 40} Z" fill="#fef08a" opacity="0.9" stroke="#78350f" stroke-width="3" />
        <line x1="${ox}" y1="${oy - 20}" x2="${ox}" y2="${oy + 40}" stroke="#b45309" stroke-width="4" />
      </g>
    `;
  }

  // Mountain ridge path coordinates
  const m1 = `M 0 ${Math.round(h * 0.72)} Q ${Math.round(w * 0.28)} ${Math.round(h * 0.52)} ${Math.round(w * 0.52)} ${Math.round(h * 0.62)} T ${w} ${Math.round(h * 0.68)} L ${w} ${h} L 0 ${h} Z`;
  const m2 = `M 0 ${Math.round(h * 0.78)} Q ${Math.round(w * 0.45)} ${Math.round(h * 0.65)} ${Math.round(w * 0.78)} ${Math.round(h * 0.74)} T ${w} ${Math.round(h * 0.82)} L ${w} ${h} L 0 ${h} Z`;

  // Water reflections if Galilee
  const waterReflection = theme === 'galilee' ? `
    <rect x="0" y="${Math.round(h * 0.62)}" width="${w}" height="${Math.round(h * 0.38)}" fill="url(#waterGrad)" opacity="0.9" />
    <ellipse cx="${sunX}" cy="${Math.round(h * 0.76)}" rx="${Math.round(w * 0.25)}" ry="${Math.round(h * 0.08)}" fill="#38bdf8" opacity="0.3" filter="url(#blur)" />
  ` : '';

  // Scripture Box
  const cardW = Math.round(w * 0.88);
  const cardX = Math.round((w - cardW) / 2);
  const cardY = Math.round(h * 0.82);
  const cardH = Math.round(h * 0.14);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <!-- Sky Gradient -->
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${skyGrad.c1}" />
      <stop offset="35%" stop-color="${skyGrad.c2}" />
      <stop offset="70%" stop-color="${skyGrad.c3}" />
      <stop offset="100%" stop-color="${skyGrad.c4}" />
    </linearGradient>

    <!-- Sun Halo Gradient -->
    <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${sunColor}" stop-opacity="1" />
      <stop offset="30%" stop-color="${sunAura}" stop-opacity="0.85" />
      <stop offset="70%" stop-color="${sunAura}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${sunAura}" stop-opacity="0" />
    </radialGradient>

    <!-- Divine Ray Gradient -->
    <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </linearGradient>

    <!-- Water Reflection Gradient -->
    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#0c4a6e" />
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
  </defs>

  <!-- Sky Canvas -->
  <rect width="${w}" height="${h}" fill="url(#skyGrad)" />

  <!-- Stars -->
  ${stars.join('\n  ')}

  <!-- Divine Sunburst -->
  <circle cx="${sunX}" cy="${sunY}" r="${sunRadius * 2.2}" fill="url(#sunGrad)" opacity="0.9" />
  <circle cx="${sunX}" cy="${sunY}" r="${sunRadius * 0.9}" fill="${sunColor}" filter="url(#glow)" />

  <!-- Light Rays -->
  ${rays.join('\n  ')}

  <!-- Water layer if Galilee -->
  ${waterReflection}

  <!-- Distant Mountain Ridge -->
  <path d="${m1}" fill="${midGroundColor}" opacity="0.88" />

  <!-- Foreground Mountains / Hills -->
  <path d="${m2}" fill="${groundColor}" />

  <!-- Central Silhouette -->
  ${centralSilhouette}

  <!-- Lower Atmospheric Vignette -->
  <rect y="${Math.round(h * 0.75)}" width="${w}" height="${Math.round(h * 0.25)}" fill="black" opacity="0.45" />

  <!-- Scripture Glassmorphism Card -->
  <g transform="translate(${cardX}, ${cardY})">
    <rect width="${cardW}" height="${cardH}" rx="16" fill="#090d16" fill-opacity="0.75" stroke="#f59e0b" stroke-opacity="0.4" stroke-width="1.5" filter="url(#glow)" />
    
    <!-- Gold accent line -->
    <line x1="20" y1="1" x2="${cardW - 20}" y2="1" stroke="#fbbf24" stroke-width="2" opacity="0.8" />

    <!-- Verse text -->
    <text x="${cardW / 2}" y="${cardH * 0.42}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(cardH * 0.21)}" font-weight="500" fill="#fef3c7" text-anchor="middle" font-style="italic">
      ${escapeXml(selectedVerse.length > 95 ? selectedVerse.slice(0, 92) + '...' : selectedVerse)}
    </text>

    <!-- Reference & Tag -->
    <text x="${cardW / 2}" y="${cardH * 0.78}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(cardH * 0.18)}" font-weight="bold" fill="#f59e0b" text-anchor="middle" letter-spacing="1">
      — ${escapeXml(selectedRef)} • A PRUEBA DE FUEGO
    </text>
  </g>

  <!-- Top Brand Stamp -->
  <g transform="translate(24, 32)">
    <rect width="185" height="26" rx="13" fill="#000000" fill-opacity="0.6" stroke="#fbbf24" stroke-opacity="0.4" stroke-width="1" />
    <circle cx="16" cy="13" r="5" fill="#f59e0b" />
    <text x="30" y="17" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="#fde68a" letter-spacing="0.5">
      IA CRISTIANA STUDIO
    </text>
  </g>
</svg>`;

  const base64 = Buffer.from(svgContent, 'utf-8').toString('base64');
  const imageUrl = `data:image/svg+xml;base64,${base64}`;

  return {
    imageUrl,
    model: 'gemini-nano-banana-2.1',
    prompt,
    bibleVerse: selectedVerse,
    theme,
  };
}

/**
 * Procedural Image Editor for User Uploads
 * Adds celestial filters, golden hour warmth, vignette, or scripture overlays to base64 images
 */
export async function editSynthesizedChristianImage(
  options: EditOptions
): Promise<{ imageUrl: string; model: string; prompt: string }> {
  const { prompt, base64Image, aspectRatio = '1:1', mimeType = 'image/png' } = options;
  const dims = getDimensions(aspectRatio, '1K');
  const w = dims.width;
  const h = dims.height;

  const cleanBase64 = base64Image.startsWith('data:')
    ? base64Image
    : `data:${mimeType};base64,${cleanBase64Only(base64Image)}`;

  const lower = prompt.toLowerCase();
  const wantsVerse = lower.includes('versículo') || lower.includes('versiculo') || lower.includes('texto') || lower.includes('palabra');
  const wantsGolden = lower.includes('cálido') || lower.includes('calido') || lower.includes('dorad') || lower.includes('luz');
  const wantsVignette = lower.includes('viñeta') || lower.includes('marco') || lower.includes('borde');

  const filterId = wantsGolden ? 'goldenGlow' : 'warmFilter';

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="goldenGlow" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="
        1.15  0     0     0  0.08
        0     1.05  0     0  0.05
        0     0     0.90  0  0
        0     0     0     1  0" />
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.08" />
        <feFuncG type="linear" slope="1.04" />
        <feFuncB type="linear" slope="0.95" />
      </feComponentTransfer>
    </filter>

    <filter id="warmFilter" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="
        1.05  0     0     0  0.05
        0     1.02  0     0  0.03
        0     0     0.95  0  0
        0     0     0     1  0" />
    </filter>

    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="65%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.65" />
    </radialGradient>

    <radialGradient id="sunSpot" cx="50%" cy="20%" r="45%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Base user image loaded as SVG Image element -->
  <image href="${cleanBase64}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" filter="url(#${filterId})" />

  <!-- Heavenly light burst overlay -->
  <rect width="${w}" height="${h}" fill="url(#sunSpot)" pointer-events="none" />

  <!-- Vignette overlay -->
  <rect width="${w}" height="${h}" fill="url(#vignette)" pointer-events="none" />

  <!-- Optional Scripture or Modification caption -->
  <g transform="translate(${Math.round(w * 0.06)}, ${Math.round(h * 0.85)})">
    <rect width="${Math.round(w * 0.88)}" height="${Math.round(h * 0.11)}" rx="12" fill="#020617" fill-opacity="0.78" stroke="#f59e0b" stroke-opacity="0.5" stroke-width="1.5" />
    <text x="${Math.round(w * 0.44)}" y="${Math.round(h * 0.052)}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(h * 0.024)}" font-weight="600" fill="#fef3c7" text-anchor="middle">
      «Todo lo puedo en Cristo que me fortalece.» — Filipenses 4:13
    </text>
    <text x="${Math.round(w * 0.44)}" y="${Math.round(h * 0.084)}" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(h * 0.018)}" font-weight="bold" fill="#fbbf24" text-anchor="middle" letter-spacing="1">
      EDICIÓN CRISTIANA • A PRUEBA DE FUEGO
    </text>
  </g>
</svg>`;

  const base64 = Buffer.from(svgContent, 'utf-8').toString('base64');
  const imageUrl = `data:image/svg+xml;base64,${base64}`;

  return {
    imageUrl,
    model: 'gemini-nano-banana-2.1',
    prompt,
  };
}

function cleanBase64Only(raw: string): string {
  return raw.replace(/^data:[a-zA-Z0-9/]+;base64,/, '');
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
