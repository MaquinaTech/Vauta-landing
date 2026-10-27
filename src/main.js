// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Nicolás López de Lerma López

import { strings, meta, extra } from './i18n.js';
import { renderBoard } from './compare.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
// The images, from the English page or from the Spanish one (es/): both load this script from assets/.
const scriptUrl = import.meta.url;
const img = new URL('../img/', scriptUrl).href;

// ---------------------------------------------------------------------------------------------------------------
// Language
// The page in index.html is English and switches in place; es/ is the same page written in Spanish at build time,
// so search engines find it, and its English button goes back to the English page.

const builtIn = root.lang;
const english = new Map();
document.querySelectorAll('[data-i18n]').forEach((el) => english.set(el, el.innerHTML));
const englishAria = new Map();
document.querySelectorAll('[data-i18n-aria]').forEach((el) => englishAria.set(el, el.getAttribute('aria-label')));
const englishMeta = { title: document.title, description: document.querySelector('meta[name="description"]').content };

function storedLanguage() {
  try {
    return new URLSearchParams(location.search).get('lang') || localStorage.getItem('vauta-lang');
  } catch {
    return null;
  }
}

function preferredLanguage() {
  if (builtIn === 'es') return 'es';
  const stored = storedLanguage();
  if (stored === 'en' || stored === 'es') return stored;
  return (navigator.languages || [navigator.language || 'en']).some((l) => l.toLowerCase().startsWith('es')) ? 'es' : 'en';
}

let lang = 'en';

function t(key) {
  return extra[lang]?.[key] ?? strings[lang]?.[key] ?? extra.en[key] ?? key;
}

function setLanguage(next, remember = false) {
  lang = next;
  root.lang = next;
  const table = strings[next];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.innerHTML = next === 'en' || !table?.[key] ? english.get(el) : table[key];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria;
    el.setAttribute('aria-label', next === 'en' || !table?.[key] ? englishAria.get(el) : table[key]);
  });
  const m = next === 'en' ? englishMeta : meta[next];
  document.title = m.title;
  document.querySelector('meta[name="description"]').content = m.description;
  document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === next)));
  updateShots();
  formatCounts(true);
  resetCopy();
  board.style.minHeight = '';
  board.innerHTML = renderBoard(currentRival, next, img);
  // The other language wraps differently: everything the stage follows moves.
  if (stage) requestAnimationFrame(relayout);
  if (remember) {
    try { localStorage.setItem('vauta-lang', next); } catch { /* private mode */ }
  }
}

document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => {
  if (builtIn === 'es' && b.dataset.lang === 'en') {
    try { localStorage.setItem('vauta-lang', 'en'); } catch { /* private mode */ }
    location.href = `../${location.hash}`;
    return;
  }
  setLanguage(b.dataset.lang, true);
}));

// ---------------------------------------------------------------------------------------------------------------
// Screenshots

const shot = document.getElementById('shot');
const shotCrop = document.getElementById('shot-crop');
const panel = document.getElementById('panel');
let currentShot = 'meetings-minutes';

function updateShots() {
  const base = `${img}${currentShot}-${lang}`;
  shot.srcset = `${base}-880.webp 880w, ${base}-1600.webp 1600w`;
  shot.src = `${base}-1600.webp`;
  shotCrop.srcset = `${base}-crop-900.webp`;
  shot.alt = t(`alt.${currentShot}`);
  panel.srcset = `${img}panel-${lang}-400.webp 400w, ${img}panel-${lang}-720.webp 720w`;
  panel.src = `${img}panel-${lang}-720.webp`;
  panel.alt = t('alt.panel');
}

const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
function selectTab(tab) {
  if (tab.dataset.shot === currentShot) return;
  tabs.forEach((x) => {
    x.setAttribute('aria-selected', String(x === tab));
    x.tabIndex = x === tab ? 0 : -1;
  });
  document.getElementById('device').setAttribute('aria-labelledby', tab.id);
  currentShot = tab.dataset.shot;
  const swap = () => {
    updateShots();
    shot.decode?.().catch(() => {}).finally(() => shot.classList.remove('swapping'));
  };
  if (reducedMotion) { updateShots(); return; }
  shot.classList.add('swapping');
  setTimeout(swap, 220);
}
tabs.forEach((tab, i) => {
  tab.tabIndex = i === 0 ? 0 : -1;
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = tabs[(moves[e.key] + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});

// ---------------------------------------------------------------------------------------------------------------
// Comparison

const board = document.getElementById('vs-board');
const rivalTabs = [...document.querySelectorAll('.vs-picker [role="tab"]')];
let currentRival = rivalTabs[0].dataset.rival;

function selectRival(tab) {
  if (tab.dataset.rival === currentRival) return;
  rivalTabs.forEach((x) => {
    x.setAttribute('aria-selected', String(x === tab));
    x.tabIndex = x === tab ? 0 : -1;
  });
  board.setAttribute('aria-labelledby', tab.id);
  currentRival = tab.dataset.rival;
  // Never shorter than the tallest board seen at this width, so the page below does not jump between rivals.
  board.style.minHeight = `${board.offsetHeight}px`;
  board.innerHTML = renderBoard(currentRival, lang, img);
  if (reducedMotion) return;
  board.classList.remove('swap');
  void board.offsetWidth;
  board.classList.add('swap');
}
rivalTabs.forEach((tab, i) => {
  tab.tabIndex = i === 0 ? 0 : -1;
  tab.addEventListener('click', () => selectRival(tab));
  tab.addEventListener('keydown', (e) => {
    const moves = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: rivalTabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = rivalTabs[(moves[e.key] + rivalTabs.length) % rivalTabs.length];
    next.focus();
    selectRival(next);
  });
});
board.setAttribute('aria-labelledby', rivalTabs[0].id);
let boardWidth = board.offsetWidth;
new ResizeObserver(() => {
  if (board.offsetWidth === boardWidth) return;
  boardWidth = board.offsetWidth;
  board.style.minHeight = '';
}).observe(board);

// ---------------------------------------------------------------------------------------------------------------
// Counters

const counts = [...document.querySelectorAll('.count')];
const formats = new Map();
function format(v, decimals) {
  const key = `${lang}/${decimals}`;
  if (!formats.has(key)) formats.set(key, new Intl.NumberFormat(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  return formats.get(key).format(v);
}
function formatCount(el, v) {
  el.textContent = format(v, Number(el.dataset.decimals || 0));
}

// Screen readers get the final figure; the counting copy is only for the eyes.
const spoken = counts.map((el) => {
  const value = el.closest('.stat-value');
  const sr = document.createElement('span');
  sr.className = 'sr';
  value.prepend(sr);
  value.querySelectorAll('.count, .unit').forEach((x) => x.setAttribute('aria-hidden', 'true'));
  return { el, sr, unit: value.querySelector('.unit') };
});

function formatCounts(onlyDone) {
  counts.forEach((el) => {
    if (!onlyDone || el.dataset.done) formatCount(el, Number(el.dataset.value));
  });
  spoken.forEach(({ el, sr, unit }) => {
    const pct = unit?.classList.contains('pct') && lang === 'es' ? '\u202f' : '';
    sr.textContent = format(Number(el.dataset.value), Number(el.dataset.decimals || 0)) + pct + (unit?.textContent ?? '');
  });
}
function runCount(el) {
  const to = Number(el.dataset.value);
  if (reducedMotion || to === 0) { el.dataset.done = '1'; formatCount(el, to); return; }
  const start = performance.now();
  const dur = 1600;
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - p, 4);
    formatCount(el, to * e);
    if (p < 1) requestAnimationFrame(step);
    else el.dataset.done = '1';
  };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------------------------------------------------------
// Reveal on scroll

const revealer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    entry.target.querySelectorAll?.('.count').forEach(runCount);
    revealer.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

// The small illustrations in the cards only move while they are on screen.
if (!reducedMotion) {
  const player = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('live', entry.isIntersecting));
  }, { rootMargin: '-10% 0px' });
  document.querySelectorAll('.live-viz').forEach((el) => player.observe(el));
}

if (reducedMotion) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  counts.forEach((el) => { el.dataset.done = '1'; });
} else {
  document.querySelectorAll('.reveal, .step-card').forEach((el) => {
    // The hero is on screen from the start: reveal it as the page opens instead of waiting for a scroll.
    if (el.closest('.hero')) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
    else revealer.observe(el);
  });
  counts.forEach((el) => formatCount(el, 0));
}

// ---------------------------------------------------------------------------------------------------------------
// Copy the install commands

const copyButton = document.getElementById('copy');
const copyStatus = document.getElementById('copy-status');
let copyTimer = 0;
function resetCopy() {
  clearTimeout(copyTimer);
  copyButton.classList.remove('done');
  copyStatus.textContent = '';
}
copyButton.addEventListener('click', async () => {
  const text = document.getElementById('install-cmd').innerText
    .split('\n')
    .map((l) => l.replace(/^\$\s*/, '').trim())
    .filter((l) => l && !l.startsWith('#'))
    .join('\n');
  try {
    await navigator.clipboard.writeText(text);
    resetCopy();
    copyButton.textContent = t('i.copied');
    copyButton.classList.add('done');
    copyStatus.textContent = t('i.copied');
    copyTimer = setTimeout(() => {
      copyButton.textContent = lang === 'en' ? english.get(copyButton) : strings[lang]['i.copy'];
      resetCopy();
    }, 1800);
  } catch {
    // No clipboard access: select the commands so they can be copied by hand.
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('install-cmd'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    copyStatus.textContent = t('i.selected');
  }
});

// On a phone, nothing here can be installed: offer to send the page to the Mac instead.

const share = document.getElementById('share');
if (window.matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0) {
  share.hidden = false;
  share.addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      share.textContent = t('i.linkCopied');
      setTimeout(() => {
        share.textContent = lang === 'en' ? english.get(share) : strings[lang]['i.share'];
      }, 2400);
    } catch {
      /* the person closed the share sheet */
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Scroll: the navigation bar, the device tilt and the 3D stage

const nav = document.getElementById('nav');
const finaleOrb = document.querySelector('.finale-orb');
const device = document.getElementById('device');
const anchors = [...document.querySelectorAll('[data-scene]')];
const tallScreen = () => window.innerWidth < window.innerHeight;
let marks = [];

// Layout position, ignoring the transforms of the reveal animations.
function docTop(el) {
  let top = 0;
  for (let e = el; e; e = e.offsetParent) top += e.offsetTop;
  return top;
}

// Each section sets the stage's shape (state), brightness (dim) and position (pose) at its mark, the scroll
// position (measured at the middle of the screen) where it is read. A step is read when its card is in view: in the
// middle of the screen on wide screens, resting at the bottom on tall ones, where the stage fills the space above it.
function measure() {
  const tall = tallScreen();
  const vh = window.innerHeight;
  marks = anchors.map((el) => {
    const ref = (el.dataset.anchor && el.querySelector(el.dataset.anchor)) || el;
    const top = docTop(ref);
    const height = ref.offsetHeight;
    const y = tall && el.classList.contains('step') ? top + height - vh / 2 + 16 : top + height / 2;
    const dim = Number(tall && el.dataset.dimTall ? el.dataset.dimTall : el.dataset.dim);
    return { y, state: Number(el.dataset.scene), dim, pose: Number(el.dataset.pose) };
  });
  // A section can hold marks of its own parts (its headline, its list), so put them in reading order.
  marks.sort((a, b) => a.y - b.y);
}

// On tall screens, fit the stage into the free space above the hero copy and above each step card.
function fitStage() {
  if (!stage || !tallScreen()) return;
  const vh = window.innerHeight;
  const top = nav.getBoundingClientRect().height + 10;
  stage.fit(0, { top, bottom: docTop(document.querySelector('.hero-copy')) - 12 });
  document.querySelectorAll('.step').forEach((step) => {
    const card = step.querySelector('.step-card');
    stage.fit(Number(step.dataset.pose), { top, bottom: vh - 16 - card.offsetHeight - 10 });
  });
}

function relayout() {
  measure();
  fitStage();
  onScroll();
}

const ease = (f) => {
  // Hold each section's look while it is being read, and move between them in the gaps.
  const t = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
  return t * t * (3 - 2 * t);
};

function sceneAt(y) {
  if (y <= marks[0].y) return marks[0];
  for (let i = 1; i < marks.length; i++) {
    const a = marks[i - 1];
    const b = marks[i];
    if (y <= b.y) {
      const f = ease((y - a.y) / (b.y - a.y));
      return { state: a.state + (b.state - a.state) * f, dim: a.dim + (b.dim - a.dim) * f, pose: a.pose + (b.pose - a.pose) * f };
    }
  }
  return marks[marks.length - 1];
}

let stage = null;
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 12);
    if (stage && marks.length) {
      stage.finale(finaleOrb.getBoundingClientRect());
      const s = sceneAt(y + window.innerHeight / 2);
      stage.set(s.state, s.dim, s.pose);
    }
    if (device && !reducedMotion) {
      const r = device.getBoundingClientRect();
      // Flat once the top of the device reaches about a third of the screen; always flat on phones.
      const p = window.innerWidth <= 700 ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.95 - r.top) / (window.innerHeight * 0.65)));
      device.style.setProperty('--p', p.toFixed(3));
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
window.addEventListener('resize', () => {
  // Phones resize the viewport as their toolbars show and hide; only re-measure for real changes.
  if (window.innerWidth === lastWidth && tallScreen() && Math.abs(window.innerHeight - lastHeight) < 140) return;
  lastWidth = window.innerWidth;
  lastHeight = window.innerHeight;
  relayout();
});
window.addEventListener('load', relayout);
document.fonts?.ready.then(relayout);

function webgl2() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

async function bootStage() {
  const canvas = document.getElementById('stage');
  if (!webgl2()) {
    root.classList.add('no-webgl');
    return;
  }
  try {
    const { createStage } = await import('./scene.js');
    stage = await createStage(canvas, { reducedMotion });
    measure();
    fitStage();
    const s = sceneAt(window.scrollY + window.innerHeight / 2);
    stage.finale(finaleOrb.getBoundingClientRect());
    stage.jump(s.state, s.dim, s.pose);
    // Fade the stage in, then let it follow the page frame by frame.
    setTimeout(() => root.classList.add('stage-ready'), 1300);
    canvas.addEventListener('webglcontextlost', () => {
      stage.stop();
      stage = null;
      root.classList.add('no-webgl');
    });
    document.addEventListener('visibilitychange', () => {
      if (!stage) return;
      if (document.hidden) stage.stop();
      else stage.start();
    });
  } catch (error) {
    root.classList.add('no-webgl');
    console.error(error);
  }
}

// ---------------------------------------------------------------------------------------------------------------

setLanguage(preferredLanguage());
measure();
onScroll();
bootStage();

// A soft light that follows the pointer across the feature cards.
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});
