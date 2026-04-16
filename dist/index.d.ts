export declare function attachBorderBeam(element: HTMLElement, options?: BorderBeamOptions): BorderBeamController;

/**
 * Color variant for the beam effect
 * - 'colorful': Full rainbow spectrum (default)
 * - 'mono': Monochromatic grayscale
 * - 'ocean': Blue and purple tones
 * - 'sunset': Warm orange, yellow, and red tones
 */
export declare type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset';

export declare interface BorderBeamController {
    element: HTMLElement;
    update(nextOptions?: Partial<BorderBeamOptions>): void;
    setActive(active: boolean): void;
    destroy(): void;
}

/**
 * Options for attaching the BorderBeam effect to an element.
 */
export declare interface BorderBeamOptions {
    /**
     * Size/type preset
     * - 'sm': Small button-sized with compact glow
     * - 'md': Medium card-sized with full border glow (default)
     * - 'line': Bottom-only traveling glow with breathe and spike animations
     * @default 'md'
     */
    size?: BorderBeamSize;
    /**
     * Color variant for the beam effect
     * - 'colorful': Full rainbow spectrum (default)
     * - 'mono': Monochromatic grayscale
     * - 'ocean': Blue and purple tones
     * - 'sunset': Warm orange, yellow, and red tones
     * @default 'colorful'
     */
    colorVariant?: BorderBeamColorVariant;
    /**
     * Theme mode - adapts beam/glow colors for dark or light backgrounds
     * 'auto' detects system preference via prefers-color-scheme
     * @default 'dark'
     */
    theme?: BorderBeamTheme;
    /**
     * Disable the hue-shift animation for static colors (e.g., monochrome)
     * @default false
     */
    staticColors?: boolean;
    /**
     * Rotation/travel duration in seconds
     * @default 1.96 for border, 2.4 for line
     */
    duration?: number;
    /**
     * Whether the animation is active
     * @default true
     */
    active?: boolean;
    /**
     * Custom border radius in pixels. When omitted, the component
     * auto-detects the border-radius of the first child element.
     * Falls back to the size preset default if detection fails.
     */
    borderRadius?: number;
    /**
     * Brightness multiplier for the glow effect
     * @default 1.3
     */
    brightness?: number;
    /**
     * Saturation multiplier for the glow effect
     * @default 1.2 for dark, varies for light
     */
    saturation?: number;
    /**
     * Hue rotation range in degrees for the hue-shift animation
     * @default 30
     */
    hueRange?: number;
    /**
     * Overall strength/opacity of the effect (0-1).
     * Only affects the beam, glow, and bloom layers.
     * @default 1
     */
    strength?: number;
    /**
     * Callback when fade-in animation completes
     */
    onActivate?: () => void;
    /**
     * Callback when fade-out animation completes
     */
    onDeactivate?: () => void;
}

export declare type BorderBeamResolvedTheme = 'dark' | 'light';

/**
 * Size/type preset for the border beam effect
 * - 'sm': Small button-sized with compact glow
 * - 'md': Medium card-sized with full border glow
 * - 'line': Bottom-only traveling glow with breathe and spike animations
 */
export declare type BorderBeamSize = 'sm' | 'md' | 'line';

/**
 * Theme mode for adapting beam colors to background
 */
export declare type BorderBeamTheme = 'dark' | 'light' | 'auto';

export declare function createBorderBeam(options?: BorderBeamOptions): CreateBorderBeamResult;

export declare interface CreateBorderBeamResult extends BorderBeamController {
    element: HTMLDivElement;
}

export declare function detectBorderRadius(element: HTMLElement): number | null;

export declare function resolveBorderBeamOptions(element: HTMLElement, options?: BorderBeamOptions, systemTheme?: BorderBeamResolvedTheme): ResolvedBorderBeamOptions;

export declare interface ResolvedBorderBeamOptions {
    size: BorderBeamSize;
    colorVariant: BorderBeamColorVariant;
    theme: BorderBeamResolvedTheme;
    staticColors: boolean;
    duration: number;
    active: boolean;
    borderRadius: number;
    brightness: number;
    saturation: number;
    hueRange: number;
    strength: number;
    onActivate?: () => void;
    onDeactivate?: () => void;
}

export declare function resolveSystemTheme(): BorderBeamResolvedTheme;

export declare function resolveTheme(theme: BorderBeamTheme | undefined, systemTheme: BorderBeamResolvedTheme): BorderBeamResolvedTheme;

/**
 * Configuration for a size preset
 */
export declare interface SizeConfig {
    borderRadius: number;
    borderWidth: number;
    width?: number;
    height?: number;
}

/**
 * Size presets for border radius and dimensions
 */
export declare const sizePresets: Record<'sm' | 'md' | 'line', SizeConfig>;

/**
 * Per-size theme presets matching the tuned v5 control panel defaults
 */
export declare const sizeThemePresets: Record<'sm' | 'md' | 'line', Record<'dark' | 'light', ThemeColors>>;

/**
 * Theme color configuration
 */
export declare interface ThemeColors {
    strokeOpacity: number;
    innerOpacity: number;
    bloomOpacity: number;
    innerShadow: string;
    saturation: number;
}

/**
 * @deprecated Use `sizeThemePresets` for per-size theme values.
 * Retained for backward compatibility — maps to `md` size presets.
 */
export declare const themeColors: Record<'dark' | 'light', ThemeColors>;

export { }
