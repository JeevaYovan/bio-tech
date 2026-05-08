/**
 * Shared IntersectionObserver pool — one observer per (threshold,
 * rootMargin) pair, callbacks routed to per-element handlers.
 *
 * Pre-consolidation, every scroll-reveal / parallax / etc. directive
 * created its own observer. Home alone had 40+ such instances. Each
 * observer carries its own callback overhead and its own
 * page-relayout budget on intersection-cross.
 *
 * Post-consolidation, all consumers with the same (threshold,
 * rootMargin) share a single observer, with callbacks dispatched via
 * a WeakMap keyed by the observed element. The thresholds we use in
 * the codebase only vary by ~0.05–0.4, so in practice this collapses
 * to 2-3 observers across the entire app.
 *
 * Browser-only — call sites must gate on isPlatformBrowser before
 * touching this module.
 */

type IOKey = string;
export type IOHandler = (entry: IntersectionObserverEntry) => void;

const observerPool = new Map<IOKey, IntersectionObserver>();
/* Multiple directives can share the same target element (e.g. about.html:143
 * has both `appParallax` and `revealOnScroll` on one <picture>). The handler
 * map is therefore element → set of handlers; each IntersectionObserver
 * callback fans out to every registered handler for that element. */
const handlerMap = new WeakMap<Element, Set<IOHandler>>();

function keyFor(threshold: number, rootMargin: string): IOKey {
  return `${threshold}|${rootMargin}`;
}

function getObserver(threshold: number, rootMargin: string): IntersectionObserver {
  const key = keyFor(threshold, rootMargin);
  let io = observerPool.get(key);
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const handlers = handlerMap.get(entry.target);
          if (!handlers) continue;
          handlers.forEach((h) => h(entry));
        }
      },
      { threshold, rootMargin },
    );
    observerPool.set(key, io);
  }
  return io;
}

/** Observe `target` with a callback. Returns an unobserve fn — call it
 *  on destroy to release the entry. Multiple `observe()` calls on the
 *  same target each receive their own callback; both fire on every
 *  intersection event. */
export function observe(
  target: Element,
  threshold: number,
  rootMargin: string,
  handler: IOHandler,
): () => void {
  const io = getObserver(threshold, rootMargin);
  let handlers = handlerMap.get(target);
  if (!handlers) {
    handlers = new Set<IOHandler>();
    handlerMap.set(target, handlers);
    /* First handler registered for this element — start observing. */
    io.observe(target);
  }
  handlers.add(handler);
  return () => {
    const set = handlerMap.get(target);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      handlerMap.delete(target);
      io.unobserve(target);
    }
  };
}
