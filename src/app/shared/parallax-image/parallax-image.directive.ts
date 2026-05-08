import {
  AfterViewInit,
  Directive,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { observe } from '../observer-pool/observer-pool';

/**
 * Apply gentle vertical parallax to an element when it scrolls past the
 * viewport. The element translates up to ±speed pixels around its
 * natural position based on how centred it is in the viewport.
 *
 * Use as `<picture appParallax [parallaxSpeed]="60">…</picture>` or on
 * any wrapper with `overflow: hidden` so the offset doesn't cause
 * layout shift.
 *
 * SSR-safe; disabled under prefers-reduced-motion.
 */
@Directive({
  selector: '[appParallax]',
  standalone: true,
})
export class ParallaxImageDirective implements AfterViewInit {
  /** Maximum pixel translate (positive = element drifts up as page scrolls down). */
  @Input() parallaxSpeed = 40;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const host = this.el.nativeElement;
    let raf = 0;
    let pending = false;
    let inView = false;

    const update = () => {
      pending = false;
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight;
      /* Centre-of-viewport progress: -1 (above) → 0 (centered) → +1 (below). */
      const centreY = rect.top + rect.height / 2;
      const progress = (centreY - vh / 2) / (vh / 2 + rect.height / 2);
      const offset = -progress * this.parallaxSpeed;
      host.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (!inView || pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };

    /* Only listen to scroll while the element is in (or near) the
       viewport — avoids work when far offscreen. The IO is routed
       through the shared pool (observer-pool.ts) so multiple
       parallax elements collapse onto a single observer. */
    const unobserve = observe(host, 0, '20% 0px 20% 0px', (entry) => {
      inView = entry.isIntersecting;
      if (inView) update();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      unobserve();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    });
  }
}
