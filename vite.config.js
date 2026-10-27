// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import { rivals, renderBoard } from './src/compare.js';
import { strings, meta, extra } from './src/i18n.js';

const site = 'https://maquinatech.github.io/Vauta-landing/';

// Writes the comparison into the page, so it reads the same without scripts; the page script takes over from there.
const comparison = {
  name: 'vauta-comparison',
  transformIndexHtml(html) {
    const picker = rivals
      .map((r, i) => `          <button role="tab" type="button" id="vs-${r.id}" aria-controls="vs-board" aria-selected="${i === 0}" data-rival="${r.id}">${r.short || r.name.en}</button>`)
      .join('\n');
    return html
      .replace('<!-- vs-picker -->', picker)
      .replace('<!-- vs-board -->', renderBoard(rivals[0].id, 'en'))
      .replace('<!-- structured-data -->', structuredData(html, 'en'));
  },
};

// What the page is about, for search engines and AI assistants: the app, from the same words the page uses.
const featureKeys = ['s1.title', 's2.title', 's3.title', 'f.translate.t', 'f.speakers.t', 'f.notepad.t', 'f.lang.t', 'f.export.t', 'f.models.t', 'm.p1.t', 'm.p2.t'];

function english(html, key) {
  return html.match(new RegExp(`data-i18n="${key.replaceAll('.', '\\.')}"[^>]*>([^]*?)</`))[1];
}

function structuredData(html, lang) {
  const text = (key) => (lang === 'en' ? english(html, key) : strings[lang][key]).replace(/<br>/g, ' ').replace(/<[^>]+>/g, '');
  const description = lang === 'en' ? html.match(/<meta name="description" content="([^"]+)"/)[1] : meta[lang].description;
  const url = lang === 'en' ? site : `${site}${lang}/`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${site}#website`, name: 'Vauta', url: site, inLanguage: ['en', 'es'] },
      {
        '@type': 'SoftwareApplication',
        '@id': `${site}#app`,
        name: 'Vauta',
        url,
        description,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: lang === 'en' ? 'Meeting transcription and minutes' : 'Transcripción de reuniones y actas',
        operatingSystem: 'macOS 26 or later, Apple silicon',
        softwareVersion: '0.9.0',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        license: 'https://www.apache.org/licenses/LICENSE-2.0',
        installUrl: 'https://github.com/MaquinaTech/Vauta#install-from-source',
        sameAs: ['https://github.com/MaquinaTech/Vauta'],
        image: `${site}og.png`,
        screenshot: `${site}img/meetings-minutes-${lang}-1600.webp`,
        featureList: featureKeys.map(text),
        author: { '@type': 'Person', name: 'Nicolás López de Lerma López', url: 'https://github.com/MaquinaTech' },
      },
    ],
  };
  return `  <script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

// The Spanish page, es/: the built English page with the Spanish words written in, so it can be found and read
// without scripts. Its links to images and scripts go one folder up.
function replaceInner(html, at, inner) {
  const start = html.lastIndexOf('<', at);
  const tag = html.slice(start + 1).match(/^[a-z0-9]+/)[0];
  const open = html.indexOf('>', at) + 1;
  const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  tags.lastIndex = open;
  for (let depth = 1, m; (m = tags.exec(html));) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(0, open) + inner + html.slice(m.index);
  }
  throw new Error(`No closing </${tag}> for the element at ${at}`);
}

function toSpanish(html) {
  const es = strings.es;
  const keys = [...html.matchAll(/ data-i18n="([^"]+)"/g)].reverse();
  for (const m of keys) {
    if (es[m[1]] !== undefined) html = replaceInner(html, m.index, es[m[1]]);
  }
  html = html.replace(/(data-i18n-aria="([^"]+)" aria-label=")[^"]*"/g, (all, head, key) => (es[key] ? `${head}${es[key].replaceAll('"', '&quot;')}"` : all));
  const board = html.indexOf('id="vs-board"');
  html = replaceInner(html, board, renderBoard(rivals[0].id, 'es', '../img/'));
  const attr = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return html
    .replace('<html lang="en">', '<html lang="es">')
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.es.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${attr(meta.es.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${attr(meta.es.title)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${attr(meta.es.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${attr(meta.es.share)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${attr(meta.es.share)}`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*/, '$1Vauta: actas de reuniones redactadas en tu Mac')
    .replace('<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="es_ES">')
    .replace('<meta property="og:locale:alternate" content="es_ES">', '<meta property="og:locale:alternate" content="en_US">')
    .replace(`<meta property="og:url" content="${site}">`, `<meta property="og:url" content="${site}es/">`)
    .replace(`<link rel="canonical" href="${site}">`, `<link rel="canonical" href="${site}es/">`)
    .replace(/<script type="application\/ld\+json">.*<\/script>/, structuredData(html, 'es').trim())
    .replace(/(<button type="button" data-lang="en" aria-pressed=")true/, '$1false')
    .replace(/(<button type="button" data-lang="es" aria-pressed=")false/, '$1true')
    .replace(/(src|href)="(\.\/)?(assets\/|img\/|favicon|apple-touch-icon)/g, '$1="../$3')
    .replace(/(srcset="|, )img\//g, '$1../img/')
    .replace(/img\/(meetings-minutes|panel)-en-/g, 'img/$1-es-')
    .replace(/(id="shot"[^>]*alt=")[^"]*/, `$1${attr(extra.es['alt.meetings-minutes'])}`)
    .replace(/(id="panel"[^>]*alt=")[^"]*/, `$1${attr(extra.es['alt.panel'])}`);
}

let spanish = '';
const spanishPage = {
  name: 'vauta-spanish',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      spanish = toSpanish(html);
      return html;
    },
  },
  writeBundle(options) {
    mkdirSync(join(options.dir, 'es'), { recursive: true });
    writeFileSync(join(options.dir, 'es', 'index.html'), spanish);
  },
};

export default defineConfig({
  // Relative paths, so the site works from a project page (user.github.io/Vauta-landing/) or its own domain.
  base: './',
  plugins: [comparison, spanishPage],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
  preview: { host: '127.0.0.1', port: 5198, strictPort: true },
});
