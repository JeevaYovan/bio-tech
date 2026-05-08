import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps the Lenis smooth-scroll library. Initialised once from the
 * App component's afterViewInit; destroyed if the app ever tears down.
 *
 * Exposes:
 *   - `velocity` — a signal updated on every Lenis scroll event;
 *      consumed by velocity-sensitive marquees and parallax effects
 *      (positive = scrolling down, negative = scrolling up).
 *   - `progress` — a signal of overall scroll progress 0..1.
 *
 * Honours `prefers-reduced-motion` and keeps native scroll on touch
 * (Lenis on iOS fights momentum scrolling).
 *
 * Coordinates with GSAP ScrollTrigger by piping Lenis scroll events
 * into `ScrollTrigger.update()` — without this, ScrollTrigger and
 * Lenis fight for scroll position and pinned sections jitter.
 */
@Injectable({ providedIn: 'root' })
export class LenisScrollService {
  private readonly platformId = inject(PLATFORM_ID);
  private lenis: Lenis | null = null;
  private rafId = 0;
  private active = false;
  /** Reference to the gsap.ticker callback we registered, kept so we
   *  can unregister it in destroy(). Without this, repeated init/destroy
   *  cycles (route changes during dev HMR) leave dangling ticker entries. */
  private tickerFn: ((time: number) => void) | null = null;

  /** Current scroll velocity in pixels/frame. Positive = scrolling
   *  down. Reset to 0 by Lenis when the scroll settles. */
  readonly velocity = signal(0);
  /** Overall scroll progress through the document, 0..1. */
  readonly progress = signal(0);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.active) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    this.lenis = new Lenis({
      /* Tighter scroll feel — 0.6s is short enough that a quick wheel
         flick lands in the new position without rubber-banding, but
         still smooths out single-line scrolls. Was 0.9s which felt
         laggy on lower-end devices. */
      duration: 0.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true,
    });

    /* ScrollTrigger config — ignore mobile resize (URL bar collapse
       was retriggering refresh) + drop the snap-stop on resize that
       can stutter pinned sections. */
    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
    });

    /* Update local signals on every Lenis scroll event. We do NOT
       call ScrollTrigger.update() here — the gsap.ticker.add() loop
       below already drives ScrollTrigger via GSAP's render cycle.
       Calling update() inside the Lenis scroll callback as well
       caused a double-update on every frame inside pinned sections
       (the perf agent flagged this as a hot path). */
    this.lenis.on('scroll', (e: { velocity: number; progress: number }) => {
      this.velocity.set(e.velocity);
      this.progress.set(e.progress);
    });

    /* GSAP's ticker drives Lenis's RAF instead of a separate loop —
       keeps the two animation systems on the same frame budget.
       Save the function reference so destroy() can remove it. */
    this.tickerFn = (time: number) => {
      this.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(this.tickerFn);
    /* Allow some lag smoothing — if the main thread blocks (e.g. a
       heavy scroll-driven canvas paint), this prevents GSAP from
       trying to "catch up" by jumping ahead, which causes visual
       stutter. 500ms threshold, 33ms target frame budget = 30fps
       graceful degradation. Better than the previous lagSmoothing(0)
       which was kicking jank for any frame > 16ms. */
    gsap.ticker.lagSmoothing(500, 33);

    this.active = true;
  }

  /** Scroll to top, used on NavigationEnd to coordinate with Angular Router. */
  scrollToTop(opts: { immediate?: boolean } = {}): void {
    if (!this.lenis) {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: opts.immediate ? 'auto' : 'smooth' });
      }
      return;
    }
    this.lenis.scrollTo(0, { immediate: opts.immediate ?? false });
  }

  destroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.tickerFn) {
      gsap.ticker.remove(this.tickerFn);
      this.tickerFn = null;
    }
    this.lenis?.destroy();
    this.lenis = null;
    this.active = false;
  }
}
