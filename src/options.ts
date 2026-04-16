import type {
  BorderBeamOptions,
  BorderBeamResolvedTheme,
  BorderBeamTheme,
  ResolvedBorderBeamOptions,
} from './types';
import { sizePresets, sizeThemePresets } from './styles';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function detectBorderRadius(element: HTMLElement): number | null {
  const computed = getComputedStyle(element);
  const raw = Number.parseFloat(computed.borderTopLeftRadius);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

export function getSystemTheme(): BorderBeamResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(
  theme: BorderBeamTheme | undefined,
  systemTheme: BorderBeamResolvedTheme
): BorderBeamResolvedTheme {
  if (!theme || theme === 'auto') {
    return systemTheme;
  }

  return theme;
}

export function resolveBorderBeamOptions(
  element: HTMLElement,
  options: BorderBeamOptions = {},
  systemTheme = getSystemTheme()
): ResolvedBorderBeamOptions {
  const size = options.size ?? 'md';
  const colorVariant = options.colorVariant ?? 'colorful';
  const theme = resolveTheme(options.theme, systemTheme);
  const sizeConfig = sizePresets[size];
  const themeConfig = sizeThemePresets[size][theme];

  const borderRadius = options.borderRadius ?? detectBorderRadius(element) ?? sizeConfig.borderRadius;
  const duration = options.duration ?? (size === 'line' ? 2.4 : 1.96);
  const hueRange = size === 'line' ? Math.min(options.hueRange ?? 30, 13) : (options.hueRange ?? 30);
  const staticColors = colorVariant === 'mono' ? true : (options.staticColors ?? false);

  return {
    size,
    colorVariant,
    theme,
    staticColors,
    duration,
    active: options.active ?? true,
    borderRadius,
    brightness: options.brightness ?? 1.3,
    saturation: options.saturation ?? themeConfig.saturation,
    hueRange,
    strength: clamp(options.strength ?? 1, 0, 1),
    onActivate: options.onActivate,
    onDeactivate: options.onDeactivate,
  };
}
