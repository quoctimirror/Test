// Utils index - Simple exports to avoid conflicts
export { default as debug } from './debug.js';

// Common utility functions
export function extend(dest, src) {
  for (const key in src) {
    if (src.hasOwnProperty(key)) {
      dest[key] = src[key];
    }
  }
  return dest;
}

export function isIframed() {
  return window.self !== window.top;
}

// Object pool utility for components
export const objectPool = {
  createPool() {
    const pool = [];
    return {
      get() {
        return pool.pop() || {};
      },
      put(obj) {
        // Reset object properties
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            delete obj[key];
          }
        }
        pool.push(obj);
      }
    };
  }
};