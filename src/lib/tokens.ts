/**
 * Al-Maktabah Centralized Design System Tokens
 * Single source of truth for programmatic color, typography, and geometry constants.
 */

export const TOKENS = {
  colors: {
    // Sacred Emerald Brand Palette
    primary: '#002218',
    primaryContainer: '#0f382c',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#79a292',
    emeraldDeep: '#022c22',
    emeraldSurface: '#12241b',
    emeraldCard: '#13241d',
    emeraldBorder: '#21392e',
    emeraldHighlight: '#79a292',
    emeraldGlow: '#1f6547',

    // Gilded Amber / Classical Gold Palette
    goldAmber: '#cba72f',
    goldLight: '#ffe088',
    goldLeaf: '#d4af37',
    goldDark: '#967400',
    goldBright: '#f3cc51',
    goldBorder: 'rgba(203, 167, 47, 0.4)',
    goldGlow: 'rgba(203, 167, 47, 0.15)',

    // Surface Canvases & Theme Modes
    parchment: '#fbf9f5',
    sepiaCanvas: '#f5ede1',
    sepiaText: '#26211a',
    sepiaBorder: '#ded1c1',
    nightCanvas: '#0a1410',
    nightCard: '#141b17',
    nightSurface: '#0e1411',
    nightBorder: '#25332a',
    nightText: '#e8f0ec',

    // Typography
    onSurface: '#1b1c1a',
    onSurfaceVariant: '#414845',
  },
  typography: {
    fontArabic: '"Amiri", "Traditional Arabic", serif',
    fontDisplay: '"Playfair Display", Georgia, serif',
    fontSans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  geometry: {
    archiveXl: '1400px',
    archive2xl: '1600px',
    shelfCardWidth: '340px',
    filterPanelWidth: '280px',
    tocDrawerWidth: '320px',
    readerShelfHeight: '460px',
    readerTallHeight: '520px',
    readerMaxHeight: '640px',
  },
} as const;

export type DesignTokens = typeof TOKENS;
