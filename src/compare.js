// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

// Vauta side by side with the best-known meeting notetakers. Every claim comes from the vendor's own public
// documentation, checked on 27 October 2026 and linked under each comparison; anything a vendor's pages left unclear is
// not claimed. A row is "ahead" when Vauta is better on it, "level" when both do the same and "behind" when the rival
// is better: Vauta runs only on a Mac, and the board says so. Each board lists the rows where Vauta is ahead first, then
// level, then behind; within each group, the rows where Vauta is ahead of the most rivals come first.
// Used by the page script, and by the build to write the default comparison into the HTML.

export const rows = [
  { id: 'where', en: 'Where your call is transcribed', es: 'Dónde se transcribe tu llamada' },
  { id: 'bot', en: 'A bot in your call', es: 'Un bot en tu llamada' },
  { id: 'apps', en: 'Works with', es: 'Funciona con' },
  { id: 'platform', en: 'Runs on', es: 'Se usa en' },
  { id: 'account', en: 'Account', es: 'Cuenta' },
  { id: 'cost', en: 'Meeting notes cost', es: 'Precio de las notas' },
  { id: 'model', en: 'Run the AI on your own hardware', es: 'La IA en tu propio equipo' },
  { id: 'open', en: 'Open source', es: 'Código abierto' },
  { id: 'train', en: 'Your meetings train their AI', es: 'Tus reuniones entrenan su IA' },
];

export const vauta = {
  where: { en: 'On your Mac', es: 'En tu Mac' },
  bot: { en: 'Never', es: 'Nunca' },
  apps: { en: 'Any call app on your Mac', es: 'Cualquier app de llamadas de tu Mac' },
  platform: { en: 'Mac with Apple silicon', es: 'Mac con Apple silicon' },
  account: { en: 'None', es: 'Ninguna' },
  cost: { en: 'Free', es: 'Gratis' },
  model: { en: 'Yes: your Mac or your own server', es: 'Sí: tu Mac o tu propio servidor' },
  open: { en: 'Yes, Apache-2.0', es: 'Sí, Apache-2.0' },
  train: { en: 'Never: nothing leaves your Mac or network', es: 'Nunca: nada sale de tu Mac ni de tu red' },
};

const no = { en: 'No', es: 'No' };

export const rivals = [
  {
    id: 'chatgpt',
    name: { en: 'ChatGPT', es: 'ChatGPT' },
    why: {
      en: 'Sends your call’s audio to OpenAI to transcribe it, and needs a paid plan.',
      es: 'Envía el audio de tu llamada a OpenAI para transcribirlo y necesita un plan de pago.',
    },
    cells: {
      where: ['ahead', { en: 'OpenAI’s cloud', es: 'La nube de OpenAI' }],
      bot: ['level', { en: 'No bot', es: 'Sin bot' }],
      apps: ['level', { en: 'Any app, from its Mac app', es: 'Cualquier app, desde su app de Mac' }],
      platform: ['level', { en: 'Mac app only', es: 'Solo su app de Mac' }],
      account: ['ahead', { en: 'OpenAI account', es: 'Cuenta de OpenAI' }],
      cost: ['ahead', { en: 'Paid plan (Meetings: Pro or Business)', es: 'Plan de pago (Meetings: Pro o Business)' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['ahead', { en: 'Depends on your plan and settings', es: 'Depende de tu plan y tus ajustes' }],
    },
    sources: [
      ['https://help.openai.com/en/articles/20001546-the-meetings-plugin-in-chatgpt', { en: 'Meetings plugin', es: 'Plugin Meetings' }],
      ['https://help.openai.com/en/articles/11487532-chatgpt-record', { en: 'Record', es: 'Record' }],
      ['https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt', { en: 'Data controls', es: 'Controles de datos' }],
    ],
  },
  {
    id: 'gemini',
    name: { en: 'Gemini in Google Meet', es: 'Gemini en Google Meet' },
    short: 'Gemini',
    why: {
      en: 'Takes notes in Google’s cloud, and only on eligible paid plans.',
      es: 'Toma notas en la nube de Google, y solo con planes de pago compatibles.',
    },
    cells: {
      where: ['ahead', { en: 'Google’s cloud', es: 'La nube de Google' }],
      bot: ['level', { en: 'No bot', es: 'Sin bot' }],
      apps: ['level', { en: 'Meet; Zoom, Teams and in person via the Meet app', es: 'Meet; Zoom, Teams y en persona desde la app de Meet' }],
      platform: ['behind', { en: 'Any computer with a browser', es: 'Cualquier ordenador con navegador' }],
      account: ['ahead', { en: 'Google account', es: 'Cuenta de Google' }],
      cost: ['ahead', { en: 'Eligible paid Workspace plan, or Google AI Pro/Ultra', es: 'Plan de pago de Workspace compatible, o Google AI Pro/Ultra' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['level', no],
    },
    sources: [
      ['https://support.google.com/meet/answer/14754931', { en: 'Take notes for me', es: 'Tomar notas por mí' }],
      ['https://workspace.google.com/blog/product-announcements/10-more-announcements-workspace-at-next-2026', { en: 'Zoom and Teams', es: 'Zoom y Teams' }],
      ['https://blog.google/products-and-platforms/products/workspace/take-notes-for-me/', { en: 'Plans', es: 'Planes' }],
      ['https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub', { en: 'Privacy', es: 'Privacidad' }],
    ],
  },
  {
    id: 'teams',
    name: { en: 'Microsoft Teams (intelligent recap)', es: 'Microsoft Teams (resumen inteligente)' },
    short: 'Teams',
    why: {
      en: 'Recap works only in Teams, in Microsoft’s cloud, with an extra license.',
      es: 'El resumen solo funciona en Teams, en la nube de Microsoft y con una licencia aparte.',
    },
    cells: {
      where: ['ahead', { en: 'Microsoft’s cloud', es: 'La nube de Microsoft' }],
      bot: ['level', { en: 'No bot', es: 'Sin bot' }],
      apps: ['ahead', { en: 'Teams only', es: 'Solo Teams' }],
      platform: ['behind', { en: 'Windows, Mac, web and mobile', es: 'Windows, Mac, web y móvil' }],
      account: ['ahead', { en: 'Microsoft 365 work or school account', es: 'Cuenta profesional o educativa de Microsoft 365' }],
      cost: ['ahead', { en: 'Teams Premium or Copilot license, extra', es: 'Licencia de Teams Premium o Copilot, aparte' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['level', no],
    },
    sources: [
      ['https://learn.microsoft.com/en-us/microsoftteams/intelligent-recap-calls-meetings', { en: 'Intelligent recap', es: 'Resumen inteligente' }],
      ['https://learn.microsoft.com/en-us/microsoftteams/privacy/intelligent-recap', { en: 'Privacy', es: 'Privacidad' }],
    ],
  },
  {
    id: 'zoom',
    name: { en: 'Zoom AI (formerly AI Companion)', es: 'Zoom AI (antes AI Companion)' },
    short: 'Zoom',
    why: {
      en: 'Streams your audio to Zoom’s cloud, and the free plan stops at 3 meetings a month.',
      es: 'Envía tu audio a la nube de Zoom, y el plan gratuito se queda en 3 reuniones al mes.',
    },
    cells: {
      where: ['ahead', { en: 'Zoom’s cloud', es: 'La nube de Zoom' }],
      bot: ['level', { en: 'No bot', es: 'Sin bot' }],
      apps: ['level', { en: 'Zoom, and others with My Notes', es: 'Zoom, y otras con My Notes' }],
      platform: ['behind', { en: 'Windows, Mac, web and mobile', es: 'Windows, Mac, web y móvil' }],
      account: ['ahead', { en: 'Zoom account', es: 'Cuenta de Zoom' }],
      cost: ['ahead', { en: 'Free for 3 meetings a month, then paid', es: 'Gratis 3 reuniones al mes, luego de pago' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['level', no],
    },
    sources: [
      ['https://library.zoom.com/ai-whitepaper/my-notes', { en: 'My Notes', es: 'My Notes' }],
      ['https://zoom.us/pricing/aic', { en: 'Pricing', es: 'Precios' }],
      ['https://www.zoom.com/en/trust/terms/', { en: 'Terms', es: 'Condiciones' }],
      ['https://www.zoom.com/en/blog/zoom-ai-companion-zoommate/', { en: 'New names', es: 'Nuevos nombres' }],
    ],
  },
  {
    id: 'otter',
    name: { en: 'Otter.ai', es: 'Otter.ai' },
    short: 'Otter',
    why: {
      en: 'Its bot joins once you connect a calendar, and it may train on de-identified recordings.',
      es: 'Su bot entra al conectar tu calendario, y puede entrenar con grabaciones desidentificadas.',
    },
    cells: {
      where: ['ahead', { en: 'Otter’s cloud', es: 'La nube de Otter' }],
      bot: ['ahead', { en: 'Joins automatically once you connect a calendar; desktop app optional', es: 'Se une automáticamente al conectar tu calendario; app de escritorio opcional' }],
      apps: ['level', { en: 'Zoom, Meet, Teams; desktop app for others', es: 'Zoom, Meet, Teams; app de escritorio para el resto' }],
      platform: ['behind', { en: 'Web, Mac, Windows and mobile', es: 'Web, Mac, Windows y móvil' }],
      account: ['ahead', { en: 'Otter account', es: 'Cuenta de Otter' }],
      cost: ['ahead', { en: 'Free: 300 min a month, 30 min per meeting; then paid', es: 'Gratis: 300 min al mes, 30 min por reunión; luego de pago' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['ahead', { en: 'Allowed on de-identified recordings and transcripts', es: 'Permitido con grabaciones y transcripciones desidentificadas' }],
    },
    sources: [
      ['https://otter.ai/pricing', { en: 'Pricing', es: 'Precios' }],
      ['https://otter.ai/privacy-policy', { en: 'Privacy policy', es: 'Política de privacidad' }],
    ],
  },
  {
    id: 'fireflies',
    name: { en: 'Fireflies.ai', es: 'Fireflies.ai' },
    short: 'Fireflies',
    why: {
      en: 'Its bot joins all your meetings by default, and they are processed in the cloud.',
      es: 'Su bot entra en todas tus reuniones por defecto, y se procesan en la nube.',
    },
    cells: {
      where: ['ahead', { en: 'Cloud services', es: 'Servicios en la nube' }],
      bot: ['ahead', { en: 'Joins all meetings by default; desktop app optional', es: 'Se une a todas por defecto; app de escritorio opcional' }],
      apps: ['level', { en: 'Major platforms; desktop app for others', es: 'Las principales; app de escritorio para el resto' }],
      platform: ['behind', { en: 'Web, Mac, Windows and mobile', es: 'Web, Mac, Windows y móvil' }],
      account: ['ahead', { en: 'Fireflies account', es: 'Cuenta de Fireflies' }],
      cost: ['ahead', { en: 'Free with limited summaries and 400 min of storage, then paid', es: 'Gratis con resúmenes limitados y 400 min de almacenamiento, luego de pago' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['level', no],
    },
    sources: [
      ['https://fireflies.ai/pricing', { en: 'Pricing', es: 'Precios' }],
      ['https://guide.fireflies.ai/articles/8587670572-how-to-disable-the-fireflies-auto-join-settings', { en: 'Auto-join', es: 'Unión automática' }],
      ['https://fireflies.ai/privacy-policy', { en: 'Privacy policy', es: 'Política de privacidad' }],
    ],
  },
  {
    id: 'granola',
    name: { en: 'Granola', es: 'Granola' },
    why: {
      en: 'No bot either, but your call is transcribed in the cloud and trains its AI unless you opt out.',
      es: 'Tampoco usa bot, pero tu llamada se transcribe en la nube y entrena su IA salvo que lo desactives.',
    },
    cells: {
      where: ['ahead', { en: 'Cloud transcription providers', es: 'Proveedores de transcripción en la nube' }],
      bot: ['level', { en: 'No bot', es: 'Sin bot' }],
      apps: ['level', { en: 'Any call app', es: 'Cualquier app de llamadas' }],
      platform: ['behind', { en: 'Mac, Windows and iPhone', es: 'Mac, Windows e iPhone' }],
      account: ['ahead', { en: 'Google or Microsoft sign-in', es: 'Inicio de sesión con Google o Microsoft' }],
      cost: ['ahead', { en: 'Free with 30 days of history, then paid', es: 'Gratis con 30 días de historial, luego de pago' }],
      model: ['ahead', no],
      open: ['ahead', no],
      train: ['ahead', { en: 'Yes, anonymized, unless you opt out (off by default on Enterprise)', es: 'Sí, anonimizado, salvo que lo desactives (desactivado por defecto en Enterprise)' }],
    },
    sources: [
      ['https://www.granola.ai/security', { en: 'Security', es: 'Seguridad' }],
      ['https://www.granola.ai/pricing', { en: 'Pricing', es: 'Precios' }],
    ],
  },
];

const words = {
  en: {
    ahead: (n, t) => `Vauta is ahead on ${n} of ${t}`, level: (n) => `level on ${n}`, behind: (n) => `behind on ${n}`,
    mark: { ahead: 'Vauta ahead', level: 'Level', behind: 'Rival ahead' }, sources: 'Sources',
  },
  es: {
    ahead: (n, t) => `Vauta gana en ${n} de ${t}`, level: (n) => `empate en ${n}`, behind: (n) => `pierde en ${n}`,
    mark: { ahead: 'gana Vauta', level: 'empate', behind: 'gana el rival' }, sources: 'Fuentes',
  },
};

// The comparison with one rival, as HTML. Every string here is written in this file, none comes from a visitor.
const rank = { ahead: 0, level: 1, behind: 2 };
const ahead = (r) => rivals.filter((v) => v.cells[r.id][0] === 'ahead').length;
const sorted = rows.slice().sort((a, b) => ahead(b) - ahead(a));

export function renderBoard(id, lang) {
  const rival = rivals.find((r) => r.id === id) || rivals[0];
  const w = words[lang] || words.en;
  const name = rival.name[lang];
  const order = sorted.slice().sort((a, b) => rank[rival.cells[a.id][0]] - rank[rival.cells[b.id][0]]);
  const marks = order.map((r) => rival.cells[r.id][0]);
  const count = (m) => marks.filter((x) => x === m).length;
  const score = [w.level(count('level')), count('behind') && w.behind(count('behind'))].filter(Boolean).join(' · ');
  const meter = ['ahead', 'level', 'behind'].flatMap((m) => Array(count(m)).fill(`<i class="${m}"></i>`)).join('');
  return `
    <p class="vs-why">${rival.why[lang]}</p>
    <div class="vs-score"><span class="vs-meter" aria-hidden="true">${meter}</span><p><b>${w.ahead(count('ahead'), rows.length)}</b> · ${score}</p></div>
    <div class="vs-grid">
      <div class="vs-head" aria-hidden="true"><span></span><span class="vs-col-vauta"><img src="img/icon-256.webp" width="22" height="22" alt="">Vauta</span><span class="vs-col-rival">${name}</span></div>
      ${order.map((r) => {
        const [mark, text] = rival.cells[r.id];
        return `<div class="vs-row ${mark}">
        <p class="vs-label">${r[lang]}<span class="sr"> (${w.mark[mark]})</span></p>
        <p class="vs-cell vs-vauta"><span class="sr">Vauta: </span>${vauta[r.id][lang]}</p>
        <p class="vs-cell vs-rival"><span class="sr">${name}: </span>${text[lang]}</p>
      </div>`;
      }).join('')}
    </div>
    <p class="vs-sources">${w.sources} · ${name}: ${rival.sources.map(([u, label]) => `<a href="${u}">${label[lang]}</a>`).join(' · ')}</p>`;
}
