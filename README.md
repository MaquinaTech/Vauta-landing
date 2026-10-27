# Vauta website

The website of [Vauta](https://github.com/MaquinaTech/Vauta), the meeting memory for Mac that stays on your Mac.

A single static page in English and Spanish, with a WebGL scene built on [three.js](https://threejs.org) and bundled
with [Vite](https://vite.dev). It sets no cookies, runs no analytics and loads nothing from other origins.

## Develop

Requires Node.js 24.

```sh
npm ci --ignore-scripts
npm run dev       # http://127.0.0.1:5199
npm run build     # writes dist/
npm run preview   # serves dist/ at http://127.0.0.1:5198
```

Append `?lang=es` or `?lang=en` to the address to force a language; otherwise the page follows the browser.

## Layout

| Path | What it holds |
|---|---|
| `index.html` | The page, with its English text |
| `src/i18n.js` | The Spanish text, keyed by `data-i18n` |
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
