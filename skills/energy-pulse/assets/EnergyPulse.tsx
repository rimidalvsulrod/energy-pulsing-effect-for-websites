'use client';
// React / Next.js wrapper. Copy this file, energy-pulse.js (+ .d.ts) and ribbon-engine.js (+ .d.ts) into the same
// folder (e.g. src/components/energy-pulse/) and import energy-pulse.css once globally.
//
//   <EnergyPulse accent="#3fbf86">                 // the hero band: ribbon behind, your content on top
//     <h1>Market pulse</h1><p>...</p>
//   </EnergyPulse>
//   <main>...sections...</main>                     // the ambient light follows <main> <section>s
import { useEffect, useRef, type ReactNode } from 'react';
import type { EnergyPulseOptions } from './energy-pulse.js';

type Props = Omit<EnergyPulseOptions, 'hero'> & { className?: string; children?: ReactNode };

export default function EnergyPulse({ className, children, ...options }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify(options);
  useEffect(() => {
    let alive = true, ep: { destroy(): void } | null = null;
    import('./energy-pulse.js').then(m => { if (alive && ref.current) ep = m.energyPulse({ ...options, hero: ref.current }); });
    return () => { alive = false; ep?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // a WebGL canvas can't be reused after destroy, so new options get a new canvas (key)
  return (
    <div className={'ep-hero' + (className ? ' ' + className : '')}>
      <canvas key={key} ref={ref} aria-hidden="true" />
      {children}
    </div>
  );
}
