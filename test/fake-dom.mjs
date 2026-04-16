class FakeStyle {
  constructor() {
    this.position = '';
    this.props = new Map();
  }

  setProperty(name, value) {
    this.props.set(name, String(value));
  }

  removeProperty(name) {
    if (name === 'position') {
      this.position = '';
    }
    this.props.delete(name);
  }

  getPropertyValue(name) {
    if (name === 'position') {
      return this.position;
    }
    return this.props.get(name) ?? '';
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.style = new FakeStyle();
    this.listeners = new Map();
    this.computedStyle = {
      position: 'static',
      borderTopLeftRadius: '0px',
    };
    this.textContent = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parentNode) {
      return;
    }

    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) {
      this.parentNode.children.splice(index, 1);
    }
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    this.listeners.set(
      type,
      listeners.filter((entry) => entry !== listener)
    );
  }

  dispatchEvent(event) {
    event.target = event.target ?? this;
    const listeners = this.listeners.get(event.type) ?? [];
    listeners.forEach((listener) => listener.call(this, event));
    return true;
  }
}

class FakeDocument {
  constructor() {
    this.head = new FakeElement('head', this);
    this.body = new FakeElement('body', this);
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

class FakeMediaQueryList {
  constructor(matches = true) {
    this.matches = matches;
    this.listeners = new Set();
  }

  addEventListener(type, listener) {
    if (type === 'change') {
      this.listeners.add(listener);
    }
  }

  removeEventListener(type, listener) {
    if (type === 'change') {
      this.listeners.delete(listener);
    }
  }

  emit(matches) {
    this.matches = matches;
    const event = { matches };
    this.listeners.forEach((listener) => listener(event));
  }
}

class FakeMutationObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.observeCalls = [];
    this.disconnected = false;
    FakeMutationObserver.instances.push(this);
  }

  observe(target, options) {
    this.observeCalls.push({ target, options });
  }

  disconnect() {
    this.disconnected = true;
  }

  trigger() {
    this.callback();
  }
}

export function createTestEnvironment() {
  const document = new FakeDocument();
  const mediaQuery = new FakeMediaQueryList(true);
  const window = {
    matchMedia: () => mediaQuery,
  };

  globalThis.document = document;
  globalThis.window = window;
  globalThis.getComputedStyle = (element) => element.computedStyle;
  globalThis.MutationObserver = FakeMutationObserver;

  return {
    document,
    window,
    mediaQuery,
    FakeElement,
    FakeMutationObserver,
    createElement(tagName, computedStyle = {}) {
      const element = document.createElement(tagName);
      element.computedStyle = {
        ...element.computedStyle,
        ...computedStyle,
      };
      return element;
    },
  };
}
