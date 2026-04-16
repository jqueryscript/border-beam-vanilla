import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestEnvironment } from './fake-dom.mjs';

const mod = await import('../dist/index.es.js');

test('resolveBorderBeamOptions applies defaults and clamps values', () => {
  const env = createTestEnvironment();
  const element = env.createElement('div', {
    borderTopLeftRadius: '24px',
  });

  const resolved = mod.resolveBorderBeamOptions(element, {
    colorVariant: 'mono',
    strength: 2,
    theme: 'auto',
  });

  assert.equal(resolved.borderRadius, 24);
  assert.equal(resolved.theme, 'dark');
  assert.equal(resolved.staticColors, true);
  assert.equal(resolved.strength, 1);
  assert.equal(resolved.duration, 1.96);
});

test('attachBorderBeam decorates element and update does not duplicate nodes', () => {
  const env = createTestEnvironment();
  const element = env.createElement('div', {
    borderTopLeftRadius: '18px',
  });

  const controller = mod.attachBorderBeam(element, {
    theme: 'dark',
    size: 'md',
  });

  assert.equal(element.getAttribute('data-beam')?.startsWith('border-beam-'), true);
  assert.equal(element.hasAttribute('data-active'), true);
  assert.equal(element.children.length, 1);
  assert.equal(env.document.head.children.length, 1);

  controller.update({ colorVariant: 'sunset', strength: 0.5 });

  assert.equal(element.children.length, 1);
  assert.equal(env.document.head.children.length, 1);
  assert.equal(element.style.getPropertyValue('--beam-strength'), '0.5');
});

test('setActive(false) enters fading state and destroy cleans up owned resources', () => {
  const env = createTestEnvironment();
  const element = env.createElement('div', {
    borderTopLeftRadius: '20px',
  });

  let deactivateCount = 0;
  const controller = mod.attachBorderBeam(element, {
    onDeactivate: () => {
      deactivateCount += 1;
    },
  });

  controller.setActive(false);

  assert.equal(element.hasAttribute('data-fading'), true);
  assert.equal(element.hasAttribute('data-active'), false);

  element.dispatchEvent({
    type: 'animationend',
    animationName: 'beam-fade-out-border-beam-1',
  });

  assert.equal(element.hasAttribute('data-fading'), false);
  assert.equal(deactivateCount, 1);

  controller.destroy();

  assert.equal(element.hasAttribute('data-beam'), false);
  assert.equal(element.children.length, 0);
  assert.equal(env.document.head.children.length, 0);
  assert.equal(env.FakeMutationObserver.instances.at(-1)?.disconnected ?? false, true);
});

test('theme auto reacts to matchMedia changes', () => {
  const env = createTestEnvironment();
  const element = env.createElement('div', {
    borderTopLeftRadius: '16px',
  });

  mod.attachBorderBeam(element, {
    theme: 'auto',
  });

  const initialCss = env.document.head.children[0].textContent;
  env.mediaQuery.emit(false);
  const updatedCss = env.document.head.children[0].textContent;

  assert.notEqual(initialCss, updatedCss);
});
