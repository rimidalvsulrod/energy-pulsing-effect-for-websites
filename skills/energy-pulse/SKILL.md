---
name: energy-pulse
description: Applies the "energy pulse" effect to any website or app. A WebGL light ribbon of hundreds of thin strands sweeps behind the hero/header, pinching into a white-hot core that breathes on a ~3s pulse while light pulses race along every strand, with glitter and dust. A soft, dim ambient light sits behind the rest of the page and reshapes as you scroll. Everything is tinted from one accent colour, with a dark theme (glowing light) and a light theme (the same ribbon drawn as ink). Ships a dependency-free engine, a preset module, CSS, and plain-HTML, React and Next.js wiring. Use it whenever the user asks for the energy pulse / pulsing / glowing light ribbon / flowing light streaks / energy background, points you at this repository, or says "add the pulse effect", "make it glow like that", or "apply this".
---

# Energy Pulse

A sharp light ribbon that breathes behind the hero with energy racing along every strand, plus soft ambient light
behind the rest of the page. One accent colour drives everything.

Files (all in `assets/`, copy them together into one folder, unmodified):
- `ribbon-engine.js` (+ `.d.ts`): the WebGL2 engine. No dependencies, SSR-safe (touches the DOM only when called).
- `energy-pulse.js` (+ `.d.ts`): the energy pulse preset (`GLOW` hero tuning, `AMB` ambient tuning, accent-matched
  secondary colours, light-theme ink) and the one-call mount `energyPulse()`.
- `energy-pulse.css`: hero band bleed, layering, glass cards, fallbacks.
- `EnergyPulse.tsx`: React / Next.js client component.
- `demo.html`: complete working page (serve the folder over http, ES modules don't load from `file://`;
  `?accent=a06bff` to recolour).

References: `references/engine.md` (engine API, every tuning knob, shapes), `references/performance.md` (read before
shipping, or when a page lags).

## Workflow

1. **Read the project.** Framework and version, styling system, brand accent, the hero/header component, root layout.
   Follow repo instructions (e.g. an AGENTS.md telling you to read the framework's own docs first). Keep their
   content and design. The effect is a background, not a rebrand.
2. **Pick the accent**: the project's brand/primary colour (`--accent`, `--primary`, Tailwind `primary`...). Saturated
   mid-tones glow best. Default `#3fbf86` (green). Any CSS colour works.
3. **Copy the assets** into one folder: `public/energy-pulse/` for plain sites or for loading via `<script type=module>`,
   or `src/components/energy-pulse/` for React/Next.js/Vite (bundled). Import `energy-pulse.css` once globally.
4. **Make a hero band**: wrap the page's header/hero (title, lead, maybe the first row of stat tiles or the CTA) in an
   element with class `ep-hero`, with a `<canvas>` as its first child. The CSS lets the ribbon bleed past the band's
   edges and fade out below it. Content inside stays on top.
5. **Mount once** (see Integration). The ambient light is added automatically and reshapes at each `main section`
   (or each element with `data-ribbon-shape="<shape>"`, shape names in `references/engine.md`).
6. **Let the light through.** Additive light needs a dark ground: put the dark colour on `body` only
   (`--ep-bg`, default `#040405`) and remove opaque backgrounds from `html`/`main`/sections/wrappers in between.
   Cards become translucent (`ep-glass`, or `rgba(8,9,9,.8)`), never solid. **No `backdrop-filter`** on cards or large
   areas over the light: it re-blurs every frame and makes scrolling stutter. Sticky headers get a near-opaque solid
   fill instead of blur. For light-themed sites, use `theme: 'light'` (the ribbon becomes ink) rather than forcing dark.
7. **Readability**: the headline gets a dark text-shadow from the CSS where the core passes behind it. If the core sits
   right behind important text, lower `heroAlpha` (.6) rather than moving content.
8. **Verify**: run the site, check no console errors, the ribbon is visible behind the hero on desktop and phone width,
   the ambient light appears after scrolling past the hero, no horizontal scrollbar, text readable. If you can take
   screenshots (Playwright etc.), headless Chromium needs `--use-angle=swiftshader --enable-unsafe-swiftshader` for
   WebGL and wait ~2s for the draw-in animation.
9. **Report** where the files went, which accent you used, and anything you couldn't apply.

## Integration

### Plain HTML / server-rendered sites
```html
<link rel="stylesheet" href="/energy-pulse/energy-pulse.css">

<header class="ep-hero">
  <canvas id="ep-ribbon" aria-hidden="true"></canvas>
  <h1>Your headline</h1>
  <p>Your lead.</p>
</header>
<main>
  <section>...</section>
</main>

<script type="module">
  import { energyPulse } from '/energy-pulse/energy-pulse.js';
  energyPulse({ accent: '#3fbf86', hero: '#ep-ribbon' });
</script>
```
No build step and no copying needed for a quick try. Import straight from the CDN, pinned to a commit or tag in production:
`https://cdn.jsdelivr.net/gh/rimidalvsulrod/energy-pulsing-effect-for-websites@main/skills/energy-pulse/assets/energy-pulse.js`
(it imports `ribbon-engine.js` next to it; the CSS is at the same path with `.css`).

### React / Vite / Next.js
```tsx
import EnergyPulse from '@/components/energy-pulse/EnergyPulse';
import '@/components/energy-pulse/energy-pulse.css'; // once, e.g. in app/layout.tsx

<EnergyPulse accent="#3fbf86">
  <h1>Your headline</h1>
  <p>Your lead.</p>
</EnergyPulse>
<main>...sections...</main>
```
It renders the `ep-hero` band with its canvas, loads the engine on the client only (safe in the Next.js App Router,
already `'use client'`), rebuilds when props change, and cleans up on unmount. Props are the `energyPulse()` options
except `hero`. Use it once per page. If the hero should span the header plus the stat tiles, put both inside it.

### Vue / Svelte / Astro / others
Render the `ep-hero` band with a canvas, then in the mount hook (`onMounted`, `onMount`, a client `<script>`):
`const ep = energyPulse({ accent, hero: canvasEl })` and `ep.destroy()` on unmount.

### Single-page apps
After a route change re-renders the page, call `ep.refresh()` so the ambient light re-measures the sections. If the
hero canvas itself was replaced, call `ep.set({ hero: newCanvas })`.

### No hero (dashboards, inner pages)
`energyPulse({ accent, hero: null })` gives only the ambient light, faintly visible from the top of the page.

## API
```js
const ep = energyPulse(options);
ep.set({ accent: '#ff5c8a' });   // or { theme: 'light' } ... rebuilds with the new options
ep.refresh();                    // re-measure sections after the DOM changed
ep.destroy();
```

| option | default | what it does |
|---|---|---|
| `accent` | page `--accent` or `#3fbf86` | The colour of the light. Secondary strands use neighbouring shades of it |
| `theme` | `'dark'` | `'light'` draws the ribbon as dark ink on a light page |
| `hero` | none | Canvas element or selector inside the `ep-hero` band. `null` = ambient only |
| `ambient` | `true` | Soft fixed light behind the page |
| `sections` | `'main section, [data-ribbon-shape]'` | Where the ambient light changes shape |
| `heroAlpha` | `.85` dark / `.55` light | Ribbon strength |
| `ambientOpacity` | `.7` dark / `.55` light | Ambient strength |
| `glow` / `amb` | none | Extra engine params over the presets, e.g. `{ flow: 1.8 }` faster pulses, `{ core: 2 }` hotter core, `{ n: 160 }` fewer strands |
| `dpr` | `min(devicePixelRatio, 2)` | Resolution cap. Use 1 on heavy pages |

Bleed and layering are CSS variables: `--ep-bleed-x` (120px), `--ep-bleed-top` (72px), `--ep-bleed-bottom` (60px), `--ep-bg`.

## Non-negotiables

- Keep the engine on WebGL. Don't rebuild it with Canvas 2D or SVG, and don't put CSS `filter`, `mix-blend-mode` or
  `mask-image` on the canvases.
- No `backdrop-filter` over the animated light, except at most one small element.
- Don't raise per-strand alpha in code. Additive blending blows out to white and loses the accent. Use `heroAlpha` or
  `glow.la` (1.1–1.5).
- One `energyPulse()` per page. All layers share one animation loop.
- `prefers-reduced-motion` gets a still frame and slow devices step down automatically (`html.ribbon-lite`). Don't
  override either.
- Without WebGL2 the page gets `html.ribbon-nogl` and a static glow from the CSS. The page must still look complete.
