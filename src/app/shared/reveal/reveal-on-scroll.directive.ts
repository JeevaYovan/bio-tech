import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { observe } from '../observer-pool/observer-pool';

export type RevealKeyframe = 'fadeInUp' | 'fadeInLeft' | 'fadeInRight';

/**
 * Staggered scroll-reveal directive — applies an entry animation when
 * the host element scrolls into view, with optional per-element delay.
 *
 * Used to orchestrate the "Sellsmart-style" cascade: heading first, then
 * sub-heading, then siblings with short delays. Backed by a shared
 * IntersectionObserver pool (see top of file) so a page with N reveals
 * uses 2-3 observers total instead of N.
 *
 * Defaults are tuned for premium editorial feel: 500ms duration, 15%
 * threshold, 10% bottom rootMargin (trigger slightly before fully visible).
 *
 * Honours `prefers-reduced-motion: reduce` at two layers — TS skips the
 * observer entirely, and the SCSS includes an `!important` override.
 *
 * SSR-safe (gates on isPlatformBrowser).
 */
@Directive({
  selector: '[revealOnScroll]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  /** Empty string is allowed so `revealOnScroll` can be used as a bare
      attribute (defaults to fadeInUp). */
  @Input() revealOnScroll: RevealKeyframe | '' = 'fadeInUp';
  @Input() revealDelay = 0;
  /** 500ms is a smooth, premium-feel reveal — not snappy enough to
   *  feel "popped in", not slow enough to feel like the page is
   *  loading. Combined with stagger delays capped under 1000ms in
   *  templates, total cascade per section stays within ~1.5s. */
  @Input() revealDuration = 500;
  @Input() revealThreshold = 0.15;
  @Input() revealOnce = true;

  private unobserve?: () => void;
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = this.el.nativeElement;
    const duration = Math.min(this.revealDuration, 800);
    const keyframe: RevealKeyframe = this.revealOnScroll || 'fadeInUp';

    this.renderer.addClass(host, 'reveal-init');
    this.renderer.addClass(host, `reveal-${keyframe}`);
    this.renderer.setStyle(host, '--reveal-duration', `${duration}ms`);
    this.renderer.setStyle(host, '--reveal-delay', `${this.revealDelay}ms`);

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.renderer.setStyle(host, 'transition', 'none');
      this.renderer.addClass(host, 'reveal-visible');
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.renderer.addClass(host, 'reveal-visible');
      return;
    }

    this.unobserve = observe(host, this.revealThreshold, '0px 0px -10% 0px', (entry) => {
      if (entry.isIntersecting) {
        this.renderer.addClass(host, 'reveal-visible');
        if (this.revealOnce) {
          this.unobserve?.();
          this.unobserve = undefined;
        }
      } else if (!this.revealOnce) {
        this.renderer.removeClass(host, 'reveal-visible');
      }
    });
  }

  ngOnDestroy(): void {
    this.unobserve?.();
    this.unobserve = undefined;
  }
}
