// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

import { defineConfig } from 'vite';
import { rivals, renderBoard } from './src/compare.js';

// Writes the comparison into the page, so it reads the same without scripts; the page script takes over from there.
const comparison = {
  name: 'vauta-comparison',
  transformIndexHtml(html) {
    const picker = rivals
      .map((r, i) => `          <button role="tab" type="button" id="vs-${r.id}" aria-controls="vs-board" aria-selected="${i === 0}" data-rival="${r.id}">${r.short || r.name.en}</button>`)
      .join('\n');
    return html.replace('<!-- vs-picker -->', picker).replace('<!-- vs-board -->', renderBoard(rivals[0].id, 'en'));
  },
};

export default defineConfig({
  // Relative paths, so the site works from a project page (user.github.io/Vauta-landing/) or its own domain.
  base: './',
  plugins: [comparison],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
  preview: { host: '127.0.0.1', port: 5198, strictPort: true },
});
