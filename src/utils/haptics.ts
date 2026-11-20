// Short taps that make a web action feel like a native one. Android fires the
// motor; iOS Safari ignores vibrate entirely, so this is a progressive extra.

type Pattern = number | number[];

const TAP: Pattern = 10;

const buzz = (pattern: Pattern) => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  // Someone who turned motion down did not ask for a buzzing phone either.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Blocked by the page's permission state — nothing to recover from.
  }
};

/** Light tap: add to cart, stepper, toggle. */
export const haptic = () => buzz(TAP);
