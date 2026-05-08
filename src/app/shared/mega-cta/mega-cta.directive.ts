import {
  AfterViewInit,
  Directive,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Subtle scroll-driven scale on the host element. As the host scrolls
 * through its viewport range, scale moves from 0.95 → 1.0 (linearly).
 *
 * Used on the closing CTA bands on Home and Why Rathika so the mega
 * heading "settles" into place as the user reaches the bottom of the
 * page rather than slamming in. SSR-safe; reduced-motion bypass.
 */
@Directive({
  selector: '[appMegaCta]',
  standalone: true,
})
export class MegaCtaDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const host = this.el.nativeElement;
    const tween = gsap.fromTo(
      host,
      { scale: 0.95 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: host,
          start: 'top 90%',
          end: 'bottom 60%',
          scrub: 0.6,
        },
      },
    );

    this.destroyRef.onDestroy(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }
}
