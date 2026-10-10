// energy-pulse.js | MIT | https://github.com/rimidalvsulrod/energy-pulsing-effect-for-websites
// The energy pulse look: a sharp light ribbon behind the hero (a white-hot core that breathes, light pulses racing
// along hundreds of strands, glitter) plus a soft, dim ambient light behind the rest of the page that reshapes as
// you scroll. Tinted from ONE accent colour. Dark theme = glowing light; light theme = the same ribbon as dark "ink".
// Built on ribbon-engine.js (keep both files in the same folder).
//
//   import { energyPulse } from './energy-pulse.js';
//   const ep = energyPulse({ accent: '#3fbf86', hero: '#hero-canvas' });
//   ep.set({ accent: '#ff5c8a' });   ep.refresh();   ep.destroy();
import { createRibbons, supported, paletteFromAccent, AMBIENT } from './ribbon-engine.js';

/** Hero ribbon tuning: brighter strands, bigger hot core and halo, faster light pulses, more glitter. */
export const GLOW = { la: 1.3, core: 1.7, haze: 1.2, hz: .8, ha: .28, haloFrac: .24, flow: 1.45, flowFrac: .8, spark: 480, bokeh: 22, dust: 100, wob: .07, blue: .22 };
/** Ambient tuning: the same thin sharp strands as the hero (not wide blurry halos), dim, reshaping as you scroll. */
export const AMB = { haloOnly: 0, n: 260, lw: 1.7, la: .6, wMin: 190, wMax: 560, haze: .35, uniform: 0, flow: 1.2, flowFrac: .6, spark: 140, bokeh: 6, dust: 40, ef: .12, haloFrac: .28, hw: 5, ha: .16 };

const hsl2hex = (h, s, l) => {
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
};
/** Secondary strand colours = neighbouring shades of the accent, so any accent (red, blue, gold...) stays on-brand. */
export function neighbours(hex) {
  const n = parseInt(hex.replace('#', ''), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  const sat = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  const h = !d ? 0 : mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  return [[22, .75, .5], [-22, .75, .45], [38, .6, .55], [-38, .6, .42]].map(([dh, sm, lv]) => hsl2hex((h + dh + 360) % 360, Math.min(1, sat * sm + .15), lv));
}
/** Light theme: the engine output is premultiplied, so dark colours darken a white page instead of vanishing. */
export function ink(accent, k = .32) {
  const p = paletteFromAccent(accent, { cool: neighbours(accent) }), d = c => c.map(v => v * k);
  return { ...p, main: p.main.map(d), cool: p.cool.map(d), haze: d(p.haze), coreHot: d(p.coreHot), core: d(p.core), glitter: d(p.glitter), bokeh: d(p.bokeh), dust: d(p.dust) };
}

// any CSS colour (hex, rgb(), hsl(), var(--x)) -> #rrggbb, which the engine needs
function toHex(c) {
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;
  if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).replace(/./g, '$&$&');
  const probe = document.createElement('i'); probe.style.color = c; probe.style.display = 'none'; document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [63, 191, 134]; probe.remove();
  return '#' + m.slice(0, 3).map(v => Math.round(+v).toString(16).padStart(2, '0')).join('');
}
const el = x => typeof x === 'string' ? document.querySelector(x) : x;

/**
 * Mount the effect. Options:
 *  accent    CSS colour (default: the page's --accent, else #3fbf86)
 *  theme     'dark' | 'light' (default: 'dark'; light draws the ribbon as ink)
 *  hero      canvas (or selector) for the sharp ribbon, inside a position:relative hero band. null = no hero ribbon
 *  ambient   true = soft fixed light behind the page (default true)
 *  sections  selector for the elements the ambient light reshapes at (default 'main section, [data-ribbon-shape]')
 *  heroAlpha / ambientOpacity   strength (defaults .85 / .7 dark, .55 / .55 light)
 *  glow / amb  extra engine params merged over GLOW / AMB
 *  dpr       render resolution cap (default min(devicePixelRatio, 2))
 */
export function energyPulse(opts = {}) {
  let o = { ambient: true, theme: 'dark', sections: 'main section, [data-ribbon-shape]', ...opts };
  let fx = null, hero = null, amb = null, ambCanvas = null;
  const root = document.documentElement;

  function teardown() {
    hero?.destroy(); amb?.destroy(); hero = amb = null;
    ambCanvas?.remove(); ambCanvas = null;
    fx?.destroy(); fx = null;
  }
  function mount() {
    teardown();
    if (!supported()) { root.classList.add('ribbon-nogl'); return; }
    const accent = toHex(o.accent || getComputedStyle(root).getPropertyValue('--accent').trim() || '#3fbf86');
    const dark = o.theme !== 'light', dpr = o.dpr || Math.min(window.devicePixelRatio || 1, 2);
    fx = dark ? createRibbons({ accent, cool: neighbours(accent), dpr }) : createRibbons({ palette: ink(accent), dpr });
    let hc = el(o.hero);
    if (hc && hero === null) {
      // a destroyed canvas keeps its lost GL context, so remounts get a fresh clone
      if (hc.dataset.epUsed) { const fresh = hc.cloneNode(); hc.replaceWith(fresh); hc = fresh; if (typeof o.hero !== 'string') o.hero = fresh; }
      hc.dataset.epUsed = '1';
      hero = fx.hero(hc, { alpha: o.heroAlpha ?? (dark ? .85 : .55), fade: [0, 120], heightFrom: hc.parentElement, params: { ...GLOW, ...(o.glow || {}) } });
    }
    if (o.ambient) {
      ambCanvas = document.createElement('canvas');
      ambCanvas.className = 'ep-ambient'; ambCanvas.setAttribute('aria-hidden', 'true');
      document.body.prepend(ambCanvas);
      amb = fx.ambient(ambCanvas, {
        selector: o.sections, opacity: o.ambientOpacity ?? (dark ? .7 : .55), params: { ...AMB, ...(o.amb || {}) },
        hideUntil: hc ? hc.parentElement : undefined,
        shapes: hc ? {} : { off: { p: AMBIENT.edgeRightFaint.p, o: .5 } } // no hero: a faint light from the start
      });
    }
  }
  mount();
  return {
    /** Change options (accent, theme, ...) and rebuild. */
    set(next) { o = { ...o, ...next }; mount(); },
    /** Call after the page's sections change (SPA route change, content loaded) so the ambient re-measures. */
    refresh() { fx?.refresh(); },
    destroy() { teardown(); },
    get supported() { return supported(); }
  };
}
