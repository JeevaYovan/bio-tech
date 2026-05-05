/**
 * Stagger delay for grid items, capped at 480ms total so even very long
 * lists finish their reveal cascade before feeling slow.
 */
export function revealDelayFor(index: number, step = 80, cap = 480): number {
  return Math.min(index * step, cap);
}
