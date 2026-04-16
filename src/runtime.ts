import { resolveBorderBeamOptions, getSystemTheme } from './options';
import { generateBeamCSS, sizePresets, sizeThemePresets } from './styles';
import type {
  BorderBeamController,
  BorderBeamOptions,
  BorderBeamResolvedTheme,
  CreateBorderBeamResult,
  ResolvedBorderBeamOptions,
} from './types';

interface InstanceState {
  id: string;
  styleElement: HTMLStyleElement;
  bloomElement: HTMLDivElement;
  mediaQuery: MediaQueryList | null;
  mutationObserver: MutationObserver | null;
  active: boolean;
  fading: boolean;
  options: BorderBeamOptions;
  resolved: ResolvedBorderBeamOptions;
  originalInlinePosition: string;
  forcedRelativePosition: boolean;
  handleAnimationEnd: (event: AnimationEvent) => void;
  handleThemeChange: ((event: MediaQueryListEvent) => void) | null;
  handleMutation: (() => void) | null;
  destroyed: boolean;
}

const instances = new WeakMap<HTMLElement, BorderBeamController>();
let instanceCount = 0;

function createInstanceId(): string {
  instanceCount += 1;
  return `border-beam-${instanceCount}`;
}

function ensureRelativePosition(element: HTMLElement, state: InstanceState): void {
  const computed = getComputedStyle(element);
  if (computed.position !== 'static') {
    return;
  }

  state.originalInlinePosition = element.style.position;
  element.style.position = 'relative';
  state.forcedRelativePosition = true;
}

function restoreRelativePosition(element: HTMLElement, state: InstanceState): void {
  if (!state.forcedRelativePosition) {
    return;
  }

  if (state.originalInlinePosition) {
    element.style.position = state.originalInlinePosition;
  } else {
    element.style.removeProperty('position');
  }
}

function applyResolvedOptions(element: HTMLElement, state: InstanceState): void {
  const { resolved } = state;
  const sizeConfig = sizePresets[resolved.size];
  const themeConfig = sizeThemePresets[resolved.size][resolved.theme];

  state.styleElement.textContent = generateBeamCSS({
    id: state.id,
    borderRadius: resolved.borderRadius,
    borderWidth: sizeConfig.borderWidth,
    duration: resolved.duration,
    strokeOpacity: themeConfig.strokeOpacity,
    innerOpacity: themeConfig.innerOpacity,
    bloomOpacity: themeConfig.bloomOpacity,
    innerShadow: themeConfig.innerShadow,
    size: resolved.size,
    colorVariant: resolved.colorVariant,
    staticColors: resolved.staticColors,
    brightness: resolved.brightness,
    saturation: resolved.saturation,
    hueRange: resolved.hueRange,
    theme: resolved.theme,
  });

  element.style.setProperty('--beam-strength', String(resolved.strength));
}

function setDatasetState(element: HTMLElement, state: InstanceState): void {
  if (state.active && !state.fading) {
    element.setAttribute('data-active', '');
  } else {
    element.removeAttribute('data-active');
  }

  if (state.fading) {
    element.setAttribute('data-fading', '');
  } else {
    element.removeAttribute('data-fading');
  }
}

function render(element: HTMLElement, state: InstanceState, systemTheme = getSystemTheme()): void {
  state.resolved = resolveBorderBeamOptions(element, state.options, systemTheme);
  applyResolvedOptions(element, state);
  setDatasetState(element, state);
}

function syncActiveState(element: HTMLElement, state: InstanceState, active: boolean): void {
  state.options = { ...state.options, active };

  if (active) {
    state.active = true;
    state.fading = false;
    setDatasetState(element, state);
    return;
  }

  if (!state.active || state.fading) {
    return;
  }

  state.fading = true;
  setDatasetState(element, state);
}

function teardown(element: HTMLElement, state: InstanceState): void {
  if (state.destroyed) {
    return;
  }

  state.destroyed = true;
  element.removeEventListener('animationend', state.handleAnimationEnd);

  if (state.handleThemeChange && state.mediaQuery) {
    state.mediaQuery.removeEventListener('change', state.handleThemeChange);
  }

  state.mutationObserver?.disconnect();
  state.styleElement.remove();
  state.bloomElement.remove();

  element.removeAttribute('data-beam');
  element.removeAttribute('data-active');
  element.removeAttribute('data-fading');
  element.style.removeProperty('--beam-strength');
  restoreRelativePosition(element, state);

  instances.delete(element);
}

export function attachBorderBeam(
  element: HTMLElement,
  options: BorderBeamOptions = {}
): BorderBeamController {
  const existing = instances.get(element);
  if (existing) {
    existing.destroy();
  }

  const id = createInstanceId();
  const styleElement = document.createElement('style');
  const bloomElement = document.createElement('div');

  styleElement.setAttribute('data-border-beam-style', id);
  bloomElement.setAttribute('data-beam-bloom', '');
  bloomElement.setAttribute('data-border-beam-owned-by', id);
  element.setAttribute('data-beam', id);
  element.appendChild(bloomElement);
  document.head.appendChild(styleElement);

  const state: InstanceState = {
    id,
    styleElement,
    bloomElement,
    mediaQuery: typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null,
    mutationObserver: null,
    active: options.active ?? true,
    fading: false,
    options: { ...options },
    resolved: resolveBorderBeamOptions(element, options),
    originalInlinePosition: '',
    forcedRelativePosition: false,
    handleAnimationEnd: () => undefined,
    handleThemeChange: null,
    handleMutation: null,
    destroyed: false,
  };

  ensureRelativePosition(element, state);

  state.handleAnimationEnd = (event: AnimationEvent) => {
    if (event.target !== element) {
      return;
    }

    const animationName = event.animationName;

    if (animationName.includes('fade-out')) {
      state.active = false;
      state.fading = false;
      setDatasetState(element, state);
      state.resolved.onDeactivate?.();
      return;
    }

    if (animationName.includes('fade-in')) {
      state.resolved.onActivate?.();
    }
  };

  element.addEventListener('animationend', state.handleAnimationEnd);

  if (state.mediaQuery && (options.theme ?? 'dark') === 'auto') {
    state.handleThemeChange = (event: MediaQueryListEvent) => {
      render(element, state, event.matches ? 'dark' : 'light');
    };
    state.mediaQuery.addEventListener('change', state.handleThemeChange);
  }

  if (options.borderRadius == null && typeof MutationObserver !== 'undefined') {
    state.handleMutation = () => render(element, state);
    state.mutationObserver = new MutationObserver(state.handleMutation);
    state.mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  render(element, state);
  setDatasetState(element, state);

  const controller: BorderBeamController = {
    element,
    update(nextOptions = {}) {
      const previousTheme = state.options.theme;
      state.options = { ...state.options, ...nextOptions };
      render(element, state);

      const nextTheme = state.options.theme;
      if (previousTheme !== 'auto' && nextTheme === 'auto' && state.mediaQuery && !state.handleThemeChange) {
        state.handleThemeChange = (event: MediaQueryListEvent) => {
          render(element, state, event.matches ? 'dark' : 'light');
        };
        state.mediaQuery.addEventListener('change', state.handleThemeChange);
      } else if (previousTheme === 'auto' && nextTheme !== 'auto' && state.mediaQuery && state.handleThemeChange) {
        state.mediaQuery.removeEventListener('change', state.handleThemeChange);
        state.handleThemeChange = null;
      }

      if (Object.prototype.hasOwnProperty.call(nextOptions, 'active')) {
        syncActiveState(element, state, Boolean(nextOptions.active));
      }
    },
    setActive(active: boolean) {
      syncActiveState(element, state, active);
    },
    destroy() {
      teardown(element, state);
    },
  };

  instances.set(element, controller);
  return controller;
}

export function createBorderBeam(options: BorderBeamOptions = {}): CreateBorderBeamResult {
  const element = document.createElement('div');
  const controller = attachBorderBeam(element, options);

  return {
    ...controller,
    element,
  };
}

export function resolveSystemTheme(): BorderBeamResolvedTheme {
  return getSystemTheme();
}
