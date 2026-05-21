// upng-js's UMD wrapper reads `window.pako` at module-init time, which throws
// `ReferenceError: window is not defined` inside a Web Worker. Aliasing `window`
// to `globalThis` keeps the UMD branch happy without affecting the main thread.
const g = globalThis as { window?: unknown };
if (typeof g.window === 'undefined') {
  g.window = globalThis;
}
