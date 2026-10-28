// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

// The comparison pages, vs/<rival>/ and es/vs/<rival>/: one per rival, written at build time from compare.js, so a
// search for an alternative to one of them finds a page about exactly that. They run no scripts; the board is the
// same one the home page shows. Every string here is written in this file or in compare.js, none comes from a visitor.
import { rivals, rows, vauta, renderBoard } from './compare.js';

const text = {
  en: {
    title: (n) => `Vauta vs ${n}: a free, private alternative for Mac`,
    description: (n, why) => `${n}: ${why} Vauta transcribes your calls and writes the minutes on your Mac instead: free, open source, no account.`,
    lede: (n) => `Looking for an alternative to ${n} that keeps your meetings on your Mac? Vauta captures any call, transcribes it on your Mac and writes the minutes: decisions, tasks and open questions. No bot, no cloud, no account, and it is free and open source.`,
    board: 'Side by side',
    better: (n) => `Where ${n} is better`,
    others: 'Other comparisons',
    get: 'Get Vauta for free',
    how: 'How Vauta works',
    language: 'Language',
    crumbs: 'Breadcrumb',
    fine: 'Vendors’ public docs on 27–28 October 2026, for the feature named and its default settings. Plans change — check their sites. Names are trademarks of their owners; Vauta is not affiliated.',
    error: 'Spotted an error?',
    legal: 'Created by Nicolás López de Lerma López · Apache License 2.0. This page sets no cookies, runs no analytics and loads nothing from anyone else.',
  },
  es: {
    title: (n) => `Vauta frente a ${n}: alternativa gratis y privada para Mac`,
    description: (n, why) => `${n}: ${why} Vauta transcribe tus llamadas y redacta el acta en tu Mac: gratis, de código abierto y sin cuenta.`,
    lede: (n) => `¿Buscas una alternativa a ${n} que no saque tus reuniones de tu Mac? Vauta capta cualquier llamada, la transcribe en tu Mac y redacta el acta: decisiones, tareas y preguntas abiertas. Sin bots, sin nube y sin cuenta, gratis y de código abierto.`,
    board: 'Cara a cara',
    better: (n) => `En qué gana ${n}`,
    others: 'Otras comparativas',
    get: 'Consigue Vauta gratis',
    how: 'Cómo funciona Vauta',
    language: 'Idioma',
    crumbs: 'Ruta',
    fine: 'Documentación pública de cada empresa a 27 y 28 de octubre de 2026, para la función indicada y su configuración por defecto. Los planes cambian: consulta sus webs. Los nombres son marcas de sus propietarios; Vauta no está afiliada.',
    error: '¿Ves un error?',
    legal: 'Creado por Nicolás López de Lerma López · Licencia Apache 2.0. Esta página no usa cookies, no tiene analítica y no carga nada de terceros.',
  },
};

// Shorter names for the title, which search results cut at about 60 characters.
const titleName = {
  gemini: { en: 'Gemini in Meet', es: 'Gemini en Meet' },
  teams: { en: 'Teams recap', es: 'Teams' },
  zoom: { en: 'Zoom AI', es: 'Zoom AI' },
};

const attr = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const csp = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'";

// Where each page lives, relative to the site root.
export const vsPath = (id, lang) => `${lang === 'es' ? 'es/' : ''}vs/${id}/`;
export const vsPages = rivals.flatMap((r) => ['en', 'es'].map((lang) => ({ id: r.id, lang, path: vsPath(r.id, lang) })));

export function renderVsPage({ id, lang }, site, css) {
  const t = text[lang];
  const rival = rivals.find((r) => r.id === id);
  const name = rival.name[lang];
  const up = lang === 'es' ? '../../../' : '../../';
  const home = lang === 'es' ? `${up}es/` : up;
  const url = `${site}${vsPath(id, lang)}`;
  const title = t.title(titleName[id]?.[lang] ?? name);
  const description = t.description(name, rival.why[lang]);
  const better = rows.filter((row) => rival.cells[row.id][0] === 'behind');
  const others = rivals.filter((r) => r.id !== id);
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: lang,
        isPartOf: { '@id': `${site}#website` },
        about: { '@id': `${site}#app` },
        mentions: { '@type': 'SoftwareApplication', name: rival.name.en },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Vauta', item: lang === 'es' ? `${site}es/` : site },
          { '@type': 'ListItem', position: 2, name: `Vauta vs ${name}`, item: url },
        ],
      },
    ],
  };
  const json = JSON.stringify(data).replaceAll('<', '\\u003c');
  return `<!doctype html>
<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López -->
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${attr(description)}">
  <meta name="author" content="Nicolás López de Lerma López">
  <meta name="theme-color" content="#04050b">
  <meta name="color-scheme" content="dark">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Vauta">
  <meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}og.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${attr(title)}">
  <meta name="twitter:description" content="${attr(description)}">
  <meta name="twitter:image" content="${site}og.jpg">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="en" href="${site}${vsPath(id, 'en')}">
  <link rel="alternate" hreflang="es" href="${site}${vsPath(id, 'es')}">
  <link rel="alternate" hreflang="x-default" href="${site}${vsPath(id, 'en')}">
  <link rel="icon" type="image/png" sizes="32x32" href="${up}favicon-32.png">
  <link rel="icon" type="image/png" sizes="64x64" href="${up}favicon-64.png">
  <link rel="apple-touch-icon" href="${up}apple-touch-icon.png">
  <link rel="stylesheet" href="${up}${css}">
  <link rel="stylesheet" href="${up}page.css">
  <script type="application/ld+json">${json}</script>
</head>
<body class="page">
  <header class="nav">
    <a class="brand" href="${home}">
      <img src="${up}img/icon-64.webp" width="30" height="30" alt="">
      <span>Vauta</span>
    </a>
    <div class="nav-end">
      <nav class="lang" aria-label="${t.language}">
        <a href="${up}${vsPath(id, 'en')}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="page"' : ''}>EN</a>
        <a href="${up}${vsPath(id, 'es')}" hreflang="es" lang="es"${lang === 'es' ? ' aria-current="page"' : ''}>ES</a>
      </nav>
      <a class="btn btn-small" href="https://github.com/MaquinaTech/Vauta" aria-label="GitHub">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        <span>GitHub</span>
      </a>
    </div>
  </header>
  <main id="main" class="page-main">
    <nav class="crumbs" aria-label="${t.crumbs}"><a href="${home}">Vauta</a><span aria-hidden="true"> › </span><span aria-current="page">Vauta vs ${name}</span></nav>
    <h1 class="page-title">Vauta vs <span class="grad">${name}</span></h1>
    <p class="page-lede">${t.lede(name)}</p>
    <h2>${t.board}</h2>
    <div class="vs-board">${renderBoard(id, lang, `${up}img/`)}
    </div>
${better.length ? `    <h2>${t.better(name)}</h2>
    <ul class="page-list">
${better.map((row) => `      <li><b>${row[lang]}</b>: ${rival.cells[row.id][1][lang]} (Vauta: ${vauta[row.id][lang]})</li>`).join('\n')}
    </ul>
` : ''}    <div class="cta-row">
      <a class="btn btn-primary" href="${home}#install">${t.get}</a>
      <a class="btn btn-ghost" href="${home}#how">${t.how}</a>
    </div>
    <h2>${t.others}</h2>
    <ul class="page-links">
${others.map((r) => `      <li><a href="${up}${vsPath(r.id, lang)}">Vauta vs ${r.name[lang]}</a></li>`).join('\n')}
    </ul>
    <p class="fine">${t.fine} <a href="https://github.com/MaquinaTech/Vauta-landing/issues">${t.error}</a></p>
  </main>
  <footer class="page-foot">
    <p class="fine">${t.legal}</p>
  </footer>
</body>
</html>
`;
}
