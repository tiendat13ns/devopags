export const ACCENT_STORAGE_KEY = 'devopags-accent';

export type Accent = { hex: string; hue: number; chroma: number };

// Chroma tối đa cho màu nhấn: cao hơn thì màu bị cắt gamut và chữ trắng trên nền primary khó đọc.
const MAX_CHROMA = 0.19;

function toLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

// sRGB hex → OKLCH (theo công thức OKLab của Björn Ottosson); chỉ cần hue và chroma để dựng cả bảng màu.
export function accentFromHex(hex: string): Accent {
  const [r, g, b] = [1, 3, 5].map((start) => toLinear(parseInt(hex.slice(start, start + 2), 16)));

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const hue = ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360;
  const chroma = Math.min(Math.hypot(a, bAxis), MAX_CHROMA);

  return { hex: hex.toLowerCase(), hue: Math.round(hue * 10) / 10, chroma: Math.round(chroma * 1000) / 1000 };
}

export function applyAccent(accent: Accent | null) {
  const root = document.documentElement;

  if (!accent) {
    delete root.dataset.accent;
    root.style.removeProperty('--user-hue');
    root.style.removeProperty('--user-chroma');
    return;
  }

  root.dataset.accent = accent.hex;
  root.style.setProperty('--user-hue', String(accent.hue));
  root.style.setProperty('--user-chroma', String(accent.chroma));
}

export function readStoredAccent(): Accent | null {
  try {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Accent) : null;
  } catch {
    return null;
  }
}

export function storeAccent(accent: Accent | null) {
  try {
    if (accent) localStorage.setItem(ACCENT_STORAGE_KEY, JSON.stringify(accent));
    else localStorage.removeItem(ACCENT_STORAGE_KEY);
  } catch {
    // Không lưu được thì màu chỉ giữ trong phiên hiện tại.
  }
}
