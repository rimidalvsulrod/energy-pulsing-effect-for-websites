export interface EnergyPulseOptions {
  /** CSS colour. Default: the page's --accent, else #3fbf86 */
  accent?: string;
  /** 'dark' = glowing light (default), 'light' = the ribbon drawn as ink */
  theme?: 'dark' | 'light';
  /** Canvas (or selector) for the sharp hero ribbon, inside a .ep-hero band. null = no hero ribbon */
  hero?: HTMLCanvasElement | string | null;
  /** Soft fixed light behind the page (default true) */
  ambient?: boolean;
  /** Elements the ambient light reshapes at (default 'main section, [data-ribbon-shape]') */
  sections?: string;
  heroAlpha?: number;
  ambientOpacity?: number;
  /** Extra engine params merged over GLOW (hero) / AMB (ambient). See references/engine.md */
  glow?: Record<string, number>;
  amb?: Record<string, number>;
  dpr?: number;
}
export interface EnergyPulse { set(o: EnergyPulseOptions): void; refresh(): void; destroy(): void; readonly supported: boolean }
export function energyPulse(o?: EnergyPulseOptions): EnergyPulse;
export const GLOW: Record<string, number>;
export const AMB: Record<string, number>;
export function neighbours(hex: string): string[];
export function ink(accent: string, k?: number): unknown;
