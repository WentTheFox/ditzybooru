/**
 * Whether animations should run: the browser's `prefers-reduced-motion`, and
 * nothing the site stores on top of it.
 */
export function animationsEnabled(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
