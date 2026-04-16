# border-beam-vanilla

`border-beam-vanilla` adds a traveling glow to any existing DOM element. The package targets plain JavaScript projects, decorates elements in place, and exposes a small controller API for updates and cleanup.

## Install

```bash
npm install border-beam-vanilla
```

## Quick Start

```js
import { attachBorderBeam } from 'border-beam-vanilla';

const card = document.querySelector('.card');

attachBorderBeam(card, {
  size: 'md',
  colorVariant: 'colorful',
});
```

## API

### `attachBorderBeam(element, options?)`

Attaches the effect to an existing `HTMLElement` and returns a controller.

```js
const controller = attachBorderBeam(button, {
  size: 'sm',
  theme: 'dark',
  strength: 0.8,
});
```

Controller methods:

- `controller.update(nextOptions)` updates the active instance without recreating the element.
- `controller.setActive(active)` starts or fades out the animation.
- `controller.destroy()` removes injected styles, observers, and bloom nodes.

### `createBorderBeam(options?)`

Creates a new `<div>`, attaches the effect, and returns the same controller shape with the created element.

```js
import { createBorderBeam } from 'border-beam-vanilla';

const beam = createBorderBeam({ size: 'md' });
beam.element.className = 'card';
beam.element.textContent = 'Hello';
document.body.appendChild(beam.element);
```

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'line'` | `'md'` | Chooses the preset geometry and animation style. |
| `colorVariant` | `'colorful' \| 'mono' \| 'ocean' \| 'sunset'` | `'colorful'` | Selects the tuned color palette. |
| `theme` | `'dark' \| 'light' \| 'auto'` | `'dark'` | `auto` follows `prefers-color-scheme`. |
| `staticColors` | `boolean` | `false` | Disables hue shifting. Mono always stays static. |
| `duration` | `number` | `1.96` or `2.4` | Duration is in seconds. |
| `active` | `boolean` | `true` | Controls fade-in and fade-out state. |
| `borderRadius` | `number` | auto-detected | Falls back to the element border radius, then the preset default. |
| `brightness` | `number` | `1.3` | Adjusts glow intensity. |
| `saturation` | `number` | preset-based | Uses per-theme tuning unless you override it. |
| `hueRange` | `number` | `30` | The `line` preset caps the range to keep the effect controlled. |
| `strength` | `number` | `1` | Clamped between `0` and `1`. |
| `onActivate` | `() => void` | `undefined` | Fires after the fade-in animation completes. |
| `onDeactivate` | `() => void` | `undefined` | Fires after the fade-out animation completes. |

## Presets

- `sm` uses a compact border glow for icon buttons and pills.
- `md` uses the full border travel effect for cards, panels, and larger controls.
- `line` concentrates the effect along the bottom edge for inputs and search bars.

## Behavior Notes

- The library decorates the target element directly. It does not wrap or replace your DOM node.
- If the target element uses `position: static`, the runtime temporarily sets it to `relative` so the effect layers can anchor correctly.
- The injected effect layers use `pointer-events: none`, so they do not block clicks or focus.
- The package targets modern browsers that support the CSS features used by the effect.

## Local Demo

Open [demo.html](/E:/Works/border-beam-main/demo.html) after building the library once. The file imports `./dist/index.es.js` directly, so it does not require a separate demo build step.

## Development

```bash
npm run build
npm run test
```

## Repository

https://github.com/jqueryscript/border-beam-vanilla
