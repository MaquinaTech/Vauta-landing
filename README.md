# Vauta website

The website of [Vauta](https://github.com/MaquinaTech/Vauta), the meeting memory for Mac that stays on your Mac.

One static page in English, at the root, and in Spanish, at `es/`, with a WebGL scene built on [three.js](https://threejs.org) and bundled
with [Vite](https://vite.dev). It sets no cookies, runs no analytics and loads nothing from other origins.

## Develop

Requires Node.js 24.

```sh
npm ci --ignore-scripts
npm run dev       # http://127.0.0.1:5199
npm run build     # writes dist/
npm run preview   # serves dist/ at http://127.0.0.1:5198
```

The English page switches to Spanish in place when the browser asks for Spanish; append `?lang=es` or `?lang=en` to
force a language. The build also writes `es/index.html`: the same page with the Spanish text written in, so search
engines can index it, and with the structured data (schema.org: the app, its source code and the FAQ) for each language.
It also writes one comparison page per rival in `src/compare.js`, at `vs/<rival>/` and `es/vs/<rival>/`, and the
`sitemap.xml`, `robots.txt` and `llms.txt` that list them.

The site's address is `https://maquinatech.github.io/Vauta-landing/`. To publish it somewhere else, such as its own
domain, build with `SITE_URL=https://example.org/ npm run build`: the canonical links, the sitemap, robots.txt, llms.txt and
the structured data all follow. The version shown comes from `src/version.js`.

## Layout

| Path | What it holds |
|---|---|
| `index.html` | The page, with its English text |
| `src/i18n.js` | The Spanish text, keyed by `data-i18n` |
| `src/version.js` | The latest release of Vauta, shown on the page and in the structured data |
| `src/compare.js` | The comparison with each rival, with its sources |
| `src/pages.js` | The comparison pages, `vs/<rival>/`, written at build time |
| `vite.config.js` | Writes the comparison, the structured data, the Spanish page, the comparison pages, the sitemap and robots.txt at build time |
| `src/llms.txt` | A plain summary of Vauta for AI assistants, written to `llms.txt`; keep it in step with the page |
| `public/page.css` | The layout of the comparison pages |
| `src/scene.js` | The 3D stage: the glass icon and the particles that morph with the scroll |
| `src/main.js` | Language, scroll, counters, tabs and the copy button |
| `src/style.css` | Styles |
| `public/img/` | App screenshots (invented sample meetings) and the icon, from the Vauta repository |

Figures on the page come from Vauta's [docs/BENCHMARKS.md](https://github.com/MaquinaTech/Vauta/blob/main/docs/BENCHMARKS.md).
When they change there, change them here too.

## Deploy

`.github/workflows/pages.yml` builds the site and publishes it to GitHub Pages on every push to `main`.

## License

[Apache License 2.0](LICENSE). Created by Nicolás López de Lerma López.
