/** Master color palette shared across collections that need a theme color (e.g. Programs).
 *  Keep in sync with /src/presentation/constants/colorPalette.ts in the frontend repo. */
export const COLOR_PALETTE: Record<string, string> = {
  primary: '#1a4314',
  cyan: '#06b6d4',
  navy: '#0B192C',
  amber: '#f59e0b',
  leaf: '#4ade80',
  emerald: '#10b981',
  merlot: '#831923',
  blue: '#22264b',
  yellow: '#E8CC12',
  orange: '#dc2626',
  pink: '#f94144',
  purple: '#a78bfa',
  teal: '#0d9488',
  gold: '#d4af37',
  bronze: '#a8641b',
  olive: '#847c20',
  slate: '#22264b',
  crimson: '#831923',
  indigo: '#22264b',
  lilac: '#6f53e0',
  rose: '#f472b6',
  sky: '#3b82f6',
  violet: '#8b5cf6',
  lime: '#84cc16',
  fuchsia: '#f43f5e',
  sunset: '#fb923c',
}

export const COLOR_OPTIONS = Object.keys(COLOR_PALETTE).map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}))
