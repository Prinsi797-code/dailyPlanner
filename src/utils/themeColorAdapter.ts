// src/utils/themeColorAdapter.ts

// Hex -> HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else {
    return { h: 0, s: 0, l: 50 };
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// HSL -> Hex
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export type ColorKind = 'background' | 'sectionBg' | 'text' | 'accent' | 'border';

/**
 * Ek template color ko current theme (light/dark) ke hisaab se adapt karta hai.
 * Hue/family same rehta hai — sirf lightness/saturation change hoti hai.
 */
export function adaptColor(hex: string, isDark: boolean, kind: ColorKind): string {
  if (!isDark || !hex || hex === 'transparent') return hex;

  const { h, s } = hexToHsl(hex);

  switch (kind) {
    case 'background':
      // Pastel sheet bg -> deep dark shade of same hue
      return hslToHex(h, Math.min(s + 12, 45), 13);
    case 'sectionBg':
      // Card/section bg thoda upar (contrast ke liye)
      return hslToHex(h, Math.min(s + 10, 40), 19);
    case 'text':
      // Dark header text -> light tint of same hue (readable on dark bg)
      return hslToHex(h, Math.min(s + 8, 40), 88);
    case 'accent':
      // Accent thoda bright/vivid rakho taaki dark bg pe pop kare
      return hslToHex(h, Math.min(s + 5, 85), 62);
    case 'border':
      return hslToHex(h, Math.min(s, 35), 30);
    default:
      return hex;
  }
}

/**
 * Poore TemplateDesign object ke saare colors ko ek saath adapt karta hai.
 */
export function adaptDesignForTheme<T extends {
  headerColor: string;
  headerBg?: string;
  accentColor: string;
  sheetBg?: string;
  themeStyle?: {
    sectionBg?: string;
    sectionBorderColor?: string;
    inputUnderlineColor?: string;
    [key: string]: any;
  };
}>(design: T, isDark: boolean): T {
  if (!isDark) return design;

  return {
    ...design,
    headerColor: adaptColor(design.headerColor, isDark, 'text'),
    headerBg: design.headerBg ? adaptColor(design.headerBg, isDark, 'sectionBg') : design.headerBg,
    accentColor: adaptColor(design.accentColor, isDark, 'accent'),
    sheetBg: design.sheetBg ? adaptColor(design.sheetBg, isDark, 'background') : design.sheetBg,
    themeStyle: design.themeStyle
      ? {
          ...design.themeStyle,
          sectionBg: design.themeStyle.sectionBg
            ? adaptColor(design.themeStyle.sectionBg, isDark, 'sectionBg')
            : design.themeStyle.sectionBg,
          sectionBorderColor: design.themeStyle.sectionBorderColor
            ? adaptColor(design.themeStyle.sectionBorderColor, isDark, 'border')
            : design.themeStyle.sectionBorderColor,
          inputUnderlineColor: design.themeStyle.inputUnderlineColor
            ? adaptColor(design.themeStyle.inputUnderlineColor, isDark, 'border')
            : design.themeStyle.inputUnderlineColor,
        }
      : design.themeStyle,
  };
}