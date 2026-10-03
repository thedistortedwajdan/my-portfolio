import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';

// jsdom lacks matchMedia and scrollIntoView.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}
Element.prototype.scrollIntoView = () => {};

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
});
