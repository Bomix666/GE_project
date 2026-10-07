/**
 * Motion system — the only place scroll is observed.
 *
 *  reveal()  : one IntersectionObserver for every [data-reveal] element.
 *  scene()   : scroll-progress for pinned/through sections. A single rAF loop
 *              writes `--p` (0..1) on the scene element; CSS turns it into
 *              transform/opacity. Offsets are cached, so a frame only reads
 *              scrollY — no layout thrash.
 */
import { env, onMotionPreferenceChange } from './env.js';
import { qsa, clamp } from './dom.js';

/* ------------------------------------------------------------------ reveal */
let revealIO;

export function reveal(root = document) {
  qsa('[data-reveal-group]', root).forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', group.dataset.revealGroup || '');
      child.style.setProperty('--i', i);
    });
  });
  qsa('[data-reveal="mask"]', root).forEach((el) => {
    qsa('.line', el).forEach((line, i) => line.style.setProperty('--l', i));
  });

  const targets = qsa('[data-reveal]:not(.is-in)', root);
  if (env.reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  revealIO ||= new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealIO.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
  );
  targets.forEach((el) => revealIO.observe(el));
}

/* ------------------------------------------------------------------ scenes */
const scenes = new Set();
let vh = window.innerHeight;
let queued = false;

/**
 * @param {HTMLElement} el
 * @param {{ mode?: 'pin'|'through', onProgress?: (p:number)=>void, prop?: string }} opts
 *   pin     : 0 when el top hits viewport top, 1 when el bottom hits viewport bottom
 *   through : 0 when el top enters from below, 1 when el bottom leaves at the top
 */
export function scene(el, { mode = 'pin', onProgress, prop = '--p' } = {}) {
  const s = { el, mode, onProgress, prop, top: 0, height: 0, last: -1, active: false };
  scenes.add(s);
  measureOne(s);
  sceneIO.observe(el);
  requestTick();
  return {
    get progress() {
      return Math.max(0, s.last);
    },
    refresh() {
      measureOne(s);
      s.last = -1;
      requestTick();
    },
    destroy() {
      sceneIO.unobserve(el);
      scenes.delete(s);
    },
  };
}

const sceneIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      scenes.forEach((s) => {
        if (s.el !== entry.target) return;
        s.active = entry.isIntersecting;
        if (!s.active) settle(s); // snap to 0 / 1 when leaving
      });
    });
    requestTick();
  },
  { rootMargin: '25% 0px 25% 0px' },
);

function measureOne(s) {
  const r = s.el.getBoundingClientRect();
  s.top = r.top + window.scrollY;
  s.height = s.el.offsetHeight;
}

function measureAll() {
  vh = window.innerHeight;
  scenes.forEach(measureOne);
  scenes.forEach((s) => (s.last = -1));
  requestTick();
}

function compute(s, y) {
  if (s.mode === 'through') return clamp((y + vh - s.top) / (s.height + vh));
  return clamp((y - s.top) / Math.max(1, s.height - vh));
}

function write(s, p) {
  if (Math.abs(p - s.last) < 0.0004) return;
  s.last = p;
  s.el.style.setProperty(s.prop, p.toFixed(4));
  if (s.onProgress) s.onProgress(p);
}

function settle(s) {
  write(s, compute(s, window.scrollY));
}

function tick() {
  queued = false;
  const y = window.scrollY;
  scenes.forEach((s) => {
    if (s.active) write(s, compute(s, y));
  });
}

function requestTick() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(tick);
}

window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', measureAll, { passive: true });
window.addEventListener('load', measureAll);
if (document.fonts) document.fonts.ready.then(measureAll);
if ('ResizeObserver' in window) {
  let last = 0;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (h !== last) {
      last = h;
      measureAll();
    }
  }).observe(document.documentElement);
}
onMotionPreferenceChange(measureAll);

export const refreshScenes = measureAll;
