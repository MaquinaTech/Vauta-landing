// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths, so the site works from a project page (user.github.io/Vauta-landing/) or its own domain.
  base: './',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
  preview: { host: '127.0.0.1', port: 5198, strictPort: true },
});
